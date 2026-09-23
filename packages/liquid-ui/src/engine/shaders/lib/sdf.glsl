// Generalized signed distance functions for N registered shapes.
// Evolved from Liquid Glass Studio's sdf.glsl: the two hardcoded shapes
// (fixed circle + mouse-following rounded rect) are replaced by packed
// instance arrays, but the shape math (superellipse rounded rect + smin
// merge) is unchanged.
//
// Per-shape data is packed into vec4 arrays so the layout is unambiguous
// under std140 and trivially mirrored in the WGSL uniform struct:
//
//   u_shapesA[i] = (center.x, center.y, halfWidth, halfHeight)   CSS px
//   u_shapesB[i] = (radius, roundness, scale, offsetX)           px/px/1/px
//   u_shapesC[i] = (offsetY, blurMix, shadowExpand, shadowFactor)
//   u_shapeM0[i] = (thickness, refFactor, refDistance, dispersion)
//   u_shapeM1[i] = (fresnel, fresnelRange, fresnelHardness, glare)
//   u_shapeM2[i] = (glareRange, glareHardness, glareConvergence, glareOpposite)
//   u_shapeM3[i] = (glareAngle rad, shadowPosX, shadowPosY, mergeRate)
//   u_shapeTint[i] = (r, g, b, a)                                0-1
//
// `#include`d into a shader that already declares `#version` / `precision`.
// MAX_SHAPES must be #defined by the includer.

#define MAX_SHAPES 48

uniform float u_dpr;
uniform vec2 u_resolution;
uniform int u_shapeCount;
uniform float u_mergeRate;
uniform vec4 u_shapesA[MAX_SHAPES];
uniform vec4 u_shapesB[MAX_SHAPES];
uniform vec4 u_shapesC[MAX_SHAPES];
uniform vec4 u_shapeM0[MAX_SHAPES];
uniform vec4 u_shapeM1[MAX_SHAPES];
uniform vec4 u_shapeM2[MAX_SHAPES];
uniform vec4 u_shapeM3[MAX_SHAPES];
uniform vec4 u_shapeTint[MAX_SHAPES];

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float superellipseCornerSDF(vec2 p, float r, float n) {
  p = abs(p);
  float v = pow(pow(p.x, n) + pow(p.y, n), 1.0 / n);
  return v - r;
}

// Rounded-rect SDF with superellipse corners. Same math as the original
// roundedRectSDF (which received FULL width/height and halved internally).
// The registry stores HALF extents (u_shapesA.zw = halfWidth/halfHeight), so
// no extra 0.5 is applied here — `hs` is already the half-extent in device px.
// `p`, `center` and `offsetPx` are device px; `halfSize` and `cornerRadius`
// are CSS px (scaled by u_dpr * scale here, as before).
float shapeSDF(vec2 p, vec2 center, vec2 halfSize, float cornerRadius, float n, float scale, vec2 offsetPx) {
  p -= center + offsetPx;

  float cr = cornerRadius * u_dpr * scale;
  vec2 hs = halfSize * u_dpr * scale;

  vec2 d = abs(p) - hs;

  float dist;
  if (d.x > -cr && d.y > -cr) {
    vec2 cornerCenter = sign(p) * (hs - vec2(cr));
    vec2 cornerP = p - cornerCenter;
    dist = superellipseCornerSDF(cornerP, cr, n);
  } else {
    dist = min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
  }

  return dist;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// SDF of shape i at device-px point p (includes its pointer-follow offset).
// Returns the distance in units NORMALIZED BY DEVICE HEIGHT (device px /
// u_resolution.y) — the unit system the original Studio's effect math
// expects: fragment-main converts back to CSS px with nmerged = -merged ×
// u_resolution1x.y, and fragment-bg's shadow exp does the same. Returning
// raw device px here inflated every distance ×~1200, killing the rim /
// refraction / fresnel / glare bands and zeroing the DOM-mode alpha.
float shapeSDFAt(vec2 p, int i) {
  vec4 A = u_shapesA[i];
  vec4 B = u_shapesB[i];
  // Registry centers are CSS px from the ROOT's TOP-LEFT; gl_FragCoord is
  // device px from the BOTTOM-LEFT. Flip Y once, centrally, here (the WGSL
  // port instead flips frag_coord in fs_main — both must describe the same
  // convention or the WebGL path renders every shape vertically mirrored,
  // which looked like "GPU glass at the wrong DOM position").
  vec2 center = vec2(A.x * u_dpr, u_resolution.y - A.y * u_dpr);
  // offsetY follows pointer-normalized Y (down-positive, DOM convention), so
  // it negates in the bottom-up device space.
  vec2 off = vec2(B.w, -u_shapesC[i].x) * u_dpr;
  return shapeSDF(p, center, A.zw, B.x, B.y, B.z, off) / u_resolution.y;
}

// Scene SDF at device-px p: all registered shapes merged with the original
// smin. This is the N-shape generalization of the original mainSDF(p1, p2, p).
float sceneSDF(vec2 p) {
  if (u_shapeCount <= 0) {
    return 1e6;
  }
  float d = shapeSDFAt(p, 0);
  for (int i = 1; i < MAX_SHAPES; i++) {
    if (i >= u_shapeCount) break;
    float m = max(u_shapeM3[i].w, u_shapeM3[0].w > 0.001 ? u_shapeM3[0].w : 0.0);
    if (m > 0.001) {
      d = smin(d, shapeSDFAt(p, i), m);
    } else {
      d = min(d, shapeSDFAt(p, i));
    }
  }
  return d;
}

// Nearest shape index at device-px p.
// For nested shapes (e.g. controls inside cards), the innermost shape containing p
// (di <= 0.001 with largest di / closest boundary) wins.
// If outside all shapes, the closest shape (smallest positive di) wins.
int nearestShapeIndex(vec2 p) {
  int bestInside = -1;
  float bestInsideD = -1e6;
  int bestOutside = 0;
  float bestOutsideD = 1e6;

  for (int i = 0; i < MAX_SHAPES; i++) {
    if (i >= u_shapeCount) break;
    float di = shapeSDFAt(p, i);
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
