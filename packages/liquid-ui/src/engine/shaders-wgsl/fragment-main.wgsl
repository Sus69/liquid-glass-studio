// Main glass effect composition shader for WebGPU.
// Generalized port of Liquid Glass Studio's fragment-main.wgsl (STEP==9
// branch): N shapes with per-shape materials via the packed uniform struct.

const PI: f32 = 3.14159265359;
const N_R: f32 = 0.98; // 1.0 - 0.02
const N_G: f32 = 1.0;
const N_B: f32 = 1.02; // 1.0 + 0.02

const MAX_SHAPES: i32 = 48;

struct Uniforms {
  u_resolution: vec2f,
  u_dpr: f32,
  u_shapeCount: i32,
  u_mergeRate: f32,
  u_bgType: i32,
  u_bgTextureRatio: f32,
  u_bgTextureReady: i32,
  u_transparentBg: i32,
  // Explicit padding so the shape arrays start at byte 64 (16-byte aligned
  // AFTER the 9 header scalars land at byte 36). Must match the JS packer in
  // GPUMultiPassRenderer.writeMainUniformData (startRow = 4).
  _headerPad: vec4f,
  u_shapesA: array<vec4f, 48>,
  u_shapesB: array<vec4f, 48>,
  u_shapesC: array<vec4f, 48>,
  u_shapeM0: array<vec4f, 48>,
  u_shapeM1: array<vec4f, 48>,
  u_shapeM2: array<vec4f, 48>,
  u_shapeM3: array<vec4f, 48>,
  u_shapeTint: array<vec4f, 48>,
};

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var u_blurredBg: texture_2d<f32>;
@group(0) @binding(2) var u_bg: texture_2d<f32>;
@group(0) @binding(3) var u_sampler: sampler;

#include './lib/sdf.wgsl'
#include './lib/math.wgsl'
#include './lib/color.wgsl'

fn vec2ToAngle(v: vec2f) -> f32 {
  var angle = atan2(v.y, v.x);
  if (angle < 0.0) { angle += 2.0 * PI; }
  return angle;
}

// SDF gradient (original getNormal over the N-shape scene).
fn getNormal(p: vec2f) -> vec2f {
  let h = vec2f(1.0, 1.0);
  let grad = vec2f(
    mainSDF(p + vec2f(h.x, 0.0)) - mainSDF(p - vec2f(h.x, 0.0)),
    mainSDF(p + vec2f(0.0, h.y)) - mainSDF(p - vec2f(0.0, h.y))
  ) / (2.0 * h);
  return grad * 1.414213562 * 1000.0;
}

// SDF gradient via central differences over the active shape's boundary.
fn getShapeNormal(pixel: vec2f, i: i32) -> vec2f {
  let h = vec2f(1.0, 1.0);
  let grad = vec2f(
    shapeSDFAt(pixel + vec2f(h.x, 0.0), i) - shapeSDFAt(pixel - vec2f(h.x, 0.0), i),
    shapeSDFAt(pixel + vec2f(0.0, h.y), i) - shapeSDFAt(pixel - vec2f(0.0, h.y), i)
  ) / (2.0 * h);
  return grad * 1.414213562 * 1000.0;
}

// Safe normalize: returns zero vector instead of NaN when length is near zero
fn safeNormalize(v: vec2f) -> vec2f {
  let len = length(v);
  if (len < 1e-8) {
    return vec2f(0.0);
  }
  return v / len;
}

// Chromatic dispersion sampling (original, parameterized per shape).
fn getTextureDispersion(v_uv: vec2f, mixRate: f32, offset: vec2f, factor: f32) -> vec4f {
  var pixel = vec4f(1.0);

  let bgR = textureSampleLevel(u_bg, u_sampler, v_uv + offset * (1.0 - (N_R - 1.0) * factor), 0.0).r;
  let bgG = textureSampleLevel(u_bg, u_sampler, v_uv + offset * (1.0 - (N_G - 1.0) * factor), 0.0).g;
  let bgB = textureSampleLevel(u_bg, u_sampler, v_uv + offset * (1.0 - (N_B - 1.0) * factor), 0.0).b;

  let blurR = textureSampleLevel(u_blurredBg, u_sampler, v_uv + offset * (1.0 - (N_R - 1.0) * factor), 0.0).r;
  let blurG = textureSampleLevel(u_blurredBg, u_sampler, v_uv + offset * (1.0 - (N_G - 1.0) * factor), 0.0).g;
  let blurB = textureSampleLevel(u_blurredBg, u_sampler, v_uv + offset * (1.0 - (N_B - 1.0) * factor), 0.0).b;

  pixel.r = mix(bgR, blurR, mixRate);
  pixel.g = mix(bgG, blurG, mixRate);
  pixel.b = mix(bgB, blurB, mixRate);

  return pixel;
}

@fragment
fn fs_main(@builtin(position) frag_coord: vec4f, @location(0) v_uv: vec2f) -> @location(0) vec4f {
  let u_resolution1x = u.u_resolution / u.u_dpr;

  // WebGPU frag_coord.y is top-down, flip to match GLSL bottom-up convention
  let pixel = vec2f(frag_coord.x, u.u_resolution.y - frag_coord.y);

  let merged = mainSDF(pixel);
  let si = nearestShapeIndex(pixel);
  let d_shape = shapeSDFAt(pixel, si);
  let d_cov = min(merged, d_shape);

  let thickness   = u.u_shapeM0[si].x;
  let refFactor   = u.u_shapeM0[si].y;
  let refDistance = u.u_shapeM0[si].z;
  let dispersion  = u.u_shapeM0[si].w;
  let fresnelF    = u.u_shapeM1[si].x;
  let fresnelR    = u.u_shapeM1[si].y;
  let fresnelH    = u.u_shapeM1[si].z;
  let glareF      = u.u_shapeM1[si].w;
  let glareR      = u.u_shapeM2[si].x;
  let glareH      = u.u_shapeM2[si].y;
  let glareConv   = u.u_shapeM2[si].z;
  let glareOpp    = u.u_shapeM2[si].w;
  let glareAngleU = u.u_shapeM3[si].x;
  let blurEdge    = u.u_shapesC[si].y;
  let tint        = u.u_shapeTint[si];

  var outColor: vec4f;

  if (d_cov < 0.005) {
    let nmerged = -1.0 * (d_shape * u_resolution1x.y);

    // refraction edge factor (original physics)
    let x_R_ratio = 1.0 - nmerged / thickness;
    let thetaI = safeAsin(pow(x_R_ratio, 2.0));
    let thetaT = safeAsin(1.0 / refFactor * sin(thetaI));
    var edgeFactor = -1.0 * tan(thetaT - thetaI);
    if (nmerged >= thickness) {
      edgeFactor = 0.0;
    }

    if (edgeFactor <= 0.0) {
      outColor = textureSampleLevel(u_blurredBg, u_sampler, v_uv, 0.0);
      outColor = mix(outColor, vec4f(tint.r, tint.g, tint.b, 1.0), tint.a * 0.8);
    } else {
      let edgeH = nmerged / thickness;
      let normal = getShapeNormal(pixel, si);

      var blurMixRate: f32;
      if (blurEdge > 0.5) {
        blurMixRate = 1.0;
      } else {
        blurMixRate = edgeH;
      }

      // Normal is in GLSL bottom-up coords (Y up), but v_uv.y is top-down.
      let refOffset = -normal * edgeFactor * refDistance * u.u_dpr * vec2f(
        u.u_resolution.y / (u_resolution1x.x * u.u_dpr),
        1.0
      );
      let blurredPixel = getTextureDispersion(
        v_uv,
        blurMixRate,
        vec2f(refOffset.x, -refOffset.y),
        dispersion
      );

      // basic tint
      outColor = mix(blurredPixel, vec4f(tint.r, tint.g, tint.b, 1.0), tint.a * 0.8);

      // add fresnel
      let fresnelFactor = clamp(
        pow(
          1.0 + d_shape * u_resolution1x.y / 1500.0 * pow(500.0 / fresnelR, 2.0) + fresnelH,
          5.0
        ),
        0.0, 1.0
      );

      var fresnelTintLCH = SRGB_TO_LCH(
        mix(vec3f(1.0), vec3f(tint.r, tint.g, tint.b), tint.a * 0.5)
      );
      fresnelTintLCH.x += 20.0 * fresnelFactor * fresnelF;
      fresnelTintLCH.x = clamp(fresnelTintLCH.x, 0.0, 100.0);

      outColor = mix(
        outColor,
        vec4f(LCH_TO_SRGB(fresnelTintLCH), 1.0),
        fresnelFactor * fresnelF * 0.7 * length(normal)
      );

      // add glare
      let glareGeoFactor = clamp(
        pow(
          1.0 + d_shape * u_resolution1x.y / 1500.0 * pow(500.0 / glareR, 2.0) + glareH,
          5.0
        ),
        0.0, 1.0
      );

      let glareAngle = (vec2ToAngle(safeNormalize(normal)) - PI / 4.0 + glareAngleU) * 2.0;
      var glareFarside: i32 = 0;
      if ((glareAngle > PI * (2.0 - 0.5) && glareAngle < PI * (4.0 - 0.5)) || glareAngle < PI * (0.0 - 0.5)) {
        glareFarside = 1;
      }

      var glareSideFactor: f32;
      if (glareFarside == 1) {
        glareSideFactor = 1.2 * glareOpp;
      } else {
        glareSideFactor = 1.2;
      }

      var glareAngleFactor = (0.5 + sin(glareAngle) * 0.5) * glareSideFactor * glareF;
      glareAngleFactor = clamp(pow(glareAngleFactor, 0.1 + glareConv * 2.0), 0.0, 1.0);

      var glareTintLCH = SRGB_TO_LCH(
        mix(blurredPixel.rgb, vec3f(tint.r, tint.g, tint.b), tint.a * 0.5)
      );
      glareTintLCH.x += 150.0 * glareAngleFactor * glareGeoFactor;
      glareTintLCH.y += 30.0 * glareAngleFactor * glareGeoFactor;
      glareTintLCH.x = clamp(glareTintLCH.x, 0.0, 120.0);

      outColor = mix(
        outColor,
        vec4f(LCH_TO_SRGB(glareTintLCH), 1.0),
        glareAngleFactor * glareGeoFactor * length(normal)
      );
    }
  } else {
    outColor = textureSampleLevel(u_bg, u_sampler, v_uv, 0.0);
  }

  // smooth edge transition
  outColor = mix(outColor, textureSampleLevel(u_bg, u_sampler, v_uv, 0.0), smoothstep(-0.001, 0.001, d_cov));

  // DOM compositing mode: alpha follows the glass coverage so the page
  // shows through outside shapes; the rim band stays strong, the interior is
  // a light tint veil (real content blur comes from the surface's
  // backdrop-filter). Output is premultiplied (premultipliedAlpha canvas).
  if (u.u_transparentBg == 1) {
    let coverage = 1.0 - smoothstep(-0.001, 0.001, d_cov);
    let nmerged = -1.0 * (d_shape * u_resolution1x.y);
    let thickness = u.u_shapeM0[si].x;
    let refFactor = u.u_shapeM0[si].y;
    let x_R_ratio = 1.0 - nmerged / thickness;
    let thetaI = safeAsin(pow(x_R_ratio, 2.0));
    let thetaT = safeAsin(1.0 / refFactor * sin(thetaI));
    var rimEdge = -1.0 * tan(thetaT - thetaI);
    if (nmerged >= thickness) {
      rimEdge = 0.0;
    }

    let interiorAlpha = max(0.12, tint.a * 0.8);
    var alpha: f32;
    if (rimEdge > 0.0 && d_shape < 0.001) {
      alpha = max(interiorAlpha, 0.85);
    } else {
      alpha = interiorAlpha;
    }
    alpha = alpha * coverage;

    if (rimEdge <= 0.0) {
      var tintBase = vec3f(1.0);
      if (tint.a > 0.0) {
        tintBase = vec3f(tint.r, tint.g, tint.b);
      }
      outColor = vec4f(tintBase, outColor.a);
    }

    outColor = vec4f(outColor.rgb * alpha, alpha);
  }

  return outColor;
}
