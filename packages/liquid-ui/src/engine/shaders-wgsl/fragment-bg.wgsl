// Background pass fragment shader for WebGPU.
// Generalized port of Liquid Glass Studio's fragment-bg.wgsl with per-shape
// shadows. Shares the common Uniforms struct layout with fragment-main.wgsl
// (one shared uniform buffer per frame).

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
@group(0) @binding(1) var u_bgTexture: texture_2d<f32>;
@group(0) @binding(2) var u_sampler: sampler;

fn chessboard(uv: vec2f, size: f32, mode: i32) -> f32 {
  let yBars = step(size * 2.0, (uv.y * 2.0) % (size * 4.0));
  let xBars = step(size * 2.0, (uv.x * 2.0) % (size * 4.0));
  if (mode == 0) {
    return yBars;
  } else if (mode == 1) {
    return xBars;
  } else {
    return abs(yBars - xBars);
  }
}

#include './lib/sdf.wgsl'

fn getCoverUV(uv_in: vec2f, canvasAspect: f32, textureAspect: f32) -> vec2f {
  var uv = uv_in;
  if (canvasAspect > textureAspect) {
    let scale = textureAspect / canvasAspect;
    uv.y = uv.y * scale + 0.5 - 0.5 * scale;
  } else {
    let scale = canvasAspect / textureAspect;
    uv.x = uv.x * scale + 0.5 - 0.5 * scale;
  }
  return uv;
}

@fragment
fn fs_main(@builtin(position) frag_coord: vec4f, @location(0) v_uv: vec2f) -> @location(0) vec4f {
  let u_resolution1x = u.u_resolution / u.u_dpr;
  var bgColor = vec3f(1.0);

  // frag_coord.y is top-down in WebGPU; flip for GLSL-style pixel coords
  let pixel = vec2f(frag_coord.x, u.u_resolution.y - frag_coord.y);
  // v_uv has y=0 at top (WebGPU convention); GLSL-style uv for gradient logic
  let gl_uv = vec2f(v_uv.x, 1.0 - v_uv.y);

  if (u.u_transparentBg == 1) {
    bgColor = mix(vec3f(0.92, 0.94, 0.98), vec3f(0.85, 0.88, 0.94), gl_uv.y);
  } else if (u.u_bgType <= 0) {
    bgColor = vec3f(1.0 - chessboard(pixel / u.u_dpr, 20.0, 2) / 4.0);
  } else if (u.u_bgType <= 1) {
    bgColor = vec3f(0.55, 0.7, 0.95);
  } else if (u.u_bgType <= 2) {
    bgColor = mix(vec3f(0.82, 0.88, 0.96), vec3f(0.98, 0.97, 0.95), gl_uv.y);
  } else if (u.u_bgType <= 11) {
    if (u.u_bgTextureReady != 1) {
      // Image still loading: calm neutral gradient instead of the Studio's
      // debug chessboard — a hard reload must not flash a checkerboard
      // while the backdrop streams in (bgType 0 keeps the chessboard for
      // explicit debug use).
      bgColor = mix(vec3f(0.85, 0.90, 0.96), vec3f(0.62, 0.72, 0.86), gl_uv.y);
    } else {
      let uv = getCoverUV(v_uv, u.u_resolution.x / u.u_resolution.y, u.u_bgTextureRatio);
      bgColor = textureSampleLevel(u_bgTexture, u_sampler, uv, 0.0).rgb;
    }
  }

  // Per-shape shadows (original exp falloff, accumulated).
  var shadow: f32 = 0.0;
  for (var i: i32 = 0; i < u.u_shapeCount; i = i + 1) {
    let merged = shapeSDFAt(pixel, i);
    let expand = max(u.u_shapesC[i].z, 2.0);
    let factor = u.u_shapesC[i].w;
    shadow += exp(-1.0 / expand * abs(merged) * u_resolution1x.y) * 0.6 * factor;
  }
  shadow = min(shadow, 0.6);

  return vec4f(bgColor - vec3f(shadow), 1.0);
}
