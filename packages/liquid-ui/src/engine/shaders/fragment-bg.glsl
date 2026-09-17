#version 300 es

precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform int u_bgType;
uniform sampler2D u_bgTexture;
uniform float u_bgTextureRatio;
uniform int u_bgTextureReady;
uniform int u_transparentBg;

#include './lib/sdf.glsl'

float chessboard(vec2 uv, float size, int mode) {
  float yBars = step(size * 2.0, mod(uv.y * 2.0, size * 4.0));
  float xBars = step(size * 2.0, mod(uv.x * 2.0, size * 4.0));

  if (mode == 0) {
    return yBars;
  } else if (mode == 1) {
    return xBars;
  } else {
    return abs(yBars - xBars);
  }
}

// 输入：原始 uv、canvas 宽高比、纹理宽高比
// 输出：变换后的 uv，可直接用于 texture 采样
vec2 getCoverUV(vec2 uv, float canvasAspect, float textureAspect) {
  if (canvasAspect > textureAspect) {
    float scale = textureAspect / canvasAspect;
    uv.y = uv.y * scale + 0.5 - 0.5 * scale;
  } else {
    float scale = canvasAspect / textureAspect;
    uv.x = uv.x * scale + 0.5 - 0.5 * scale;
  }
  return uv;
}

void main() {
  vec2 u_resolution1x = u_resolution.xy / u_dpr;
  vec3 bgColor = vec3(1.0);

  if (u_transparentBg == 1) {
    // DOM mode: neutral luminous gradient for clean refraction edges
    bgColor = mix(vec3(0.92, 0.94, 0.98), vec3(0.85, 0.88, 0.94), v_uv.y);
  } else if (u_bgType <= 0) {
    // chessboard (debug)
    bgColor = vec3(1.0 - chessboard(gl_FragCoord.xy / u_dpr, 20.0, 2) / 4.0);
  } else if (u_bgType <= 1) {
    // solid tint (procedural placeholder in the engine; textured mode uses u_bgTexture)
    bgColor = vec3(0.55, 0.7, 0.95);
  } else if (u_bgType <= 2) {
    // subtle vertical gradient
    bgColor = mix(vec3(0.82, 0.88, 0.96), vec3(0.98, 0.97, 0.95), v_uv.y);
  } else if (u_bgType <= 11) {
    if (u_bgTextureReady != 1) {
      // Image still loading: calm neutral gradient instead of the Studio's
      // debug chessboard — a hard reload must not flash a checkerboard
      // while the backdrop streams in (bgType 0 keeps the chessboard for
      // explicit debug use).
      bgColor = mix(vec3(0.85, 0.90, 0.96), vec3(0.62, 0.72, 0.86), v_uv.y);
    } else {
      vec2 uv = getCoverUV(v_uv, u_resolution.x / u_resolution.y, u_bgTextureRatio);
      bgColor = texture(u_bgTexture, uv).rgb;
    }
  }

  // Per-shape shadows: original exp falloff, accumulated across shapes.
  float shadow = 0.0;
  for (int i = 0; i < MAX_SHAPES; i++) {
    if (i >= u_shapeCount) break;
    float merged = shapeSDFAt(gl_FragCoord.xy, i);
    float expand = max(u_shapesC[i].z, 2.0);
    float factor = u_shapesC[i].w;
    shadow += exp(-1.0 / expand * abs(merged) * u_resolution1x.y) * 0.6 * factor;
  }
  shadow = min(shadow, 0.6);

  fragColor = vec4(bgColor - vec3(shadow), 1.0);
}
