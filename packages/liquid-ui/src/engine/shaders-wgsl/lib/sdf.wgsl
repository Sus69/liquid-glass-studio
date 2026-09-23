// Generalized signed distance functions for N registered shapes (WebGPU).
// Mirrors shaders/lib/sdf.glsl; the shape math is the original Studio's.
//
// `#include`d into a WGSL module that declares the `Uniforms` struct with the
// shape instance arrays and `@group(0) @binding(0)` uniform binding.

fn sdCircle(p: vec2f, r: f32) -> f32 {
  return length(p) - r;
}

fn superellipseCornerSDF(p_in: vec2f, r: f32, n: f32) -> f32 {
  let p = abs(p_in);
  let v = pow(pow(p.x, n) + pow(p.y, n), 1.0 / n);
  return v - r;
}

// Rounded-rect SDF with superellipse corners; same math as the original.
// p is device px; center/halfSize CSS px are scaled by u.u_dpr here.
// u_shapesA.zw stores HALF extents, so `hs` is already the half-extent —
// no extra 0.5 (the original shader received FULL width/height and halved).
// Returns the distance in units NORMALIZED BY DEVICE HEIGHT (device px /
// u_resolution.y) — the unit system the original Studio's effect math
// expects: fs_main converts back to CSS px with nmerged = -merged ×
// u_resolution1x.y, and fragment-bg's shadow exp does the same. Returning
// raw device px here inflated every distance ×~1200, killing the rim /
// refraction / fresnel / glare bands and zeroing the DOM-mode alpha.
fn shapeSDFAt(p: vec2f, i: i32) -> f32 {
  let A = u.u_shapesA[i];
  let B = u.u_shapesB[i];
  let C = u.u_shapesC[i];
  let center = vec2f(A.x * u.u_dpr, u.u_resolution.y - A.y * u.u_dpr);
  let off = vec2f(B.w, -C.x) * u.u_dpr;
  let cr = B.x * u.u_dpr * B.z;
  let hs = A.zw * u.u_dpr * B.z;
  let q = p - center - off;

  let d = abs(q) - hs;

  var dist: f32;
  if (d.x > -cr && d.y > -cr) {
    let cornerCenter = sign(q) * (hs - vec2f(cr));
    let cornerP = q - cornerCenter;
    dist = superellipseCornerSDF(cornerP, cr, B.y);
  } else {
    dist = min(max(d.x, d.y), 0.0) + length(max(d, vec2f(0.0)));
  }
  return dist / u.u_resolution.y;
}

fn smin(a: f32, b: f32, k: f32) -> f32 {
  let h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Scene SDF at device-px p: shapes merged with smin when merge > 0, otherwise crisp min.
fn mainSDF(p: vec2f) -> f32 {
  var d = shapeSDFAt(p, 0);
  for (var i: i32 = 1; i < u.u_shapeCount; i = i + 1) {
    let m0 = select(0.0, u.u_shapeM3[0].w, u.u_shapeM3[0].w > 0.001);
    let m = max(u.u_shapeM3[i].w, m0);
    if (m > 0.001) {
      d = smin(d, shapeSDFAt(p, i), m);
    } else {
      d = min(d, shapeSDFAt(p, i));
    }
  }
  return d;
}

// Nearest shape index at device-px p (per-shape materials).
// For nested shapes, the innermost shape containing p (di <= 0.001 with largest di) wins.
// If outside all shapes, the closest shape (smallest positive di) wins.
fn nearestShapeIndex(p: vec2f) -> i32 {
  var bestInside: i32 = -1;
  var bestInsideD: f32 = -1e6;
  var bestOutside: i32 = 0;
  var bestOutsideD: f32 = 1e6;

  for (var i: i32 = 0; i < u.u_shapeCount; i = i + 1) {
    let di = shapeSDFAt(p, i);
    if (di <= 0.001) {
      if (di >= bestInsideD) {
        bestInsideD = di;
        bestInside = i;
      }
    } else {
      if (di < bestOutsideD) {
        bestOutsideD = di;
        bestOutside = i;
      }
    }
  }

  if (bestInside >= 0) {
    return bestInside;
  }
  return bestOutside;
}
