#version 300 es

precision highp float;

#define PI (3.14159265359)

const float N_R = 1.0 - 0.02;
const float N_G = 1.0;
const float N_B = 1.0 + 0.02;

in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_blurredBg;
uniform sampler2D u_bg;
uniform int u_transparentBg;
uniform int u_premultiply;

#include './lib/sdf.glsl'
#include './lib/math.glsl'
#include './lib/color.glsl'

// SDF gradient via central differences (original getNormal, now over the
// N-shape scene SDF).
vec2 getNormal(vec2 p) {
  vec2 h = vec2(max(abs(dFdx(p.x)), 0.0001), max(abs(dFdy(p.y)), 0.0001));

  vec2 grad =
    vec2(
      sceneSDF(p + vec2(h.x, 0.0)) - sceneSDF(p - vec2(h.x, 0.0)),
      sceneSDF(p + vec2(0.0, h.y)) - sceneSDF(p - vec2(0.0, h.y))
    ) /
    (2.0 * h);

  return grad * 1.414213562 * 1000.0;
}

// SDF gradient via central differences over the active shape's boundary.
vec2 getShapeNormal(vec2 p, int i) {
  vec2 h = vec2(max(abs(dFdx(p.x)), 0.0001), max(abs(dFdy(p.y)), 0.0001));

  vec2 grad =
    vec2(
      shapeSDFAt(p + vec2(h.x, 0.0), i) - shapeSDFAt(p - vec2(h.x, 0.0), i),
      shapeSDFAt(p + vec2(0.0, h.y), i) - shapeSDFAt(p - vec2(0.0, h.y), i)
    ) /
    (2.0 * h);

  return grad * 1.414213562 * 1000.0;
}

float vec2ToAngle(vec2 v) {
  float angle = atan(v.y, v.x);
  if (angle < 0.0) angle += 2.0 * PI;
  return angle;
}

// Chromatic dispersion sampling: R/G/B sampled at per-channel refracted
// offsets, mixed between sharp and blurred backdrop by mixRate.
// (Original getTextureDispersion, parameterized per shape.)
vec4 getTextureDispersion(
  int si,
  float mixRate,
  vec2 offset,
  float factor
) {
  vec4 pixel = vec4(1.0);

  float bgR = texture(u_bg, v_uv + offset * (1.0 - (N_R - 1.0) * factor)).r;
  float bgG = texture(u_bg, v_uv + offset * (1.0 - (N_G - 1.0) * factor)).g;
  float bgB = texture(u_bg, v_uv + offset * (1.0 - (N_B - 1.0) * factor)).b;

  float blurR = texture(u_blurredBg, v_uv + offset * (1.0 - (N_R - 1.0) * factor)).r;
  float blurG = texture(u_blurredBg, v_uv + offset * (1.0 - (N_G - 1.0) * factor)).g;
  float blurB = texture(u_blurredBg, v_uv + offset * (1.0 - (N_B - 1.0) * factor)).b;

  pixel.r = mix(bgR, blurR, mixRate);
  pixel.g = mix(bgG, blurG, mixRate);
  pixel.b = mix(bgB, blurB, mixRate);

  return pixel;
}

void main() {
  vec2 u_resolution1x = u_resolution.xy / u_dpr;
  // merged scene SDF — shapeSDFAt returns device-px distances NORMALIZED by
  // u_resolution.y (the original Studio's unit system), so the ×
  // u_resolution1x.y conversions below recover CSS px exactly as before.
  float merged = sceneSDF(gl_FragCoord.xy);
  int si = nearestShapeIndex(gl_FragCoord.xy);
  float d_shape = shapeSDFAt(gl_FragCoord.xy, si);
  float d_cov = min(merged, d_shape);

  // Per-shape material (nearest shape wins).
  float thickness   = u_shapeM0[si].x;
  float refFactor   = u_shapeM0[si].y;
  float refDistance = u_shapeM0[si].z;
  float dispersion  = u_shapeM0[si].w;
  float fresnelF    = u_shapeM1[si].x;
  float fresnelR    = u_shapeM1[si].y;
  float fresnelH    = u_shapeM1[si].z;
  float glareF      = u_shapeM1[si].w;
  float glareR      = u_shapeM2[si].x;
  float glareH      = u_shapeM2[si].y;
  float glareConv   = u_shapeM2[si].z;
  float glareOpp    = u_shapeM2[si].w;
  float glareAngleU = u_shapeM3[si].x;
  float blurEdge    = u_shapesC[si].y;
  vec4 tint         = u_shapeTint[si];

  vec4 outColor;

  if (d_cov < 0.005) {
    float nmerged = -1.0 * (d_shape * u_resolution1x.y);

    // calculate refraction edge factor (original physics, unchanged)
    float x_R_ratio = 1.0 - nmerged / thickness;
    float thetaI = safeAsin(pow(x_R_ratio, 2.0));
    float thetaT = safeAsin(1.0 / refFactor * sin(thetaI));
    float edgeFactor = -1.0 * tan(thetaT - thetaI);
    if (nmerged >= thickness) {
      edgeFactor = 0.0;
    }

    if (edgeFactor <= 0.0) {
      outColor = texture(u_blurredBg, v_uv);
      outColor = mix(outColor, vec4(tint.r, tint.g, tint.b, 1.0), tint.a * 0.8);
    } else {
      // height of glass edge
      float edgeH = nmerged / thickness;
      vec2 normal = getShapeNormal(gl_FragCoord.xy, si);

      vec4 blurredPixel = getTextureDispersion(
        si,
        blurEdge > 0.5 ? 1.0 : edgeH,
        -normal *
          edgeFactor *
          refDistance *
          u_dpr *
          vec2(
            u_resolution.y / (u_resolution1x.x * u_dpr), /* resolution independent */
            1.0
          ),
        dispersion
      );

      // basic tint
      outColor = mix(blurredPixel, vec4(tint.r, tint.g, tint.b, 1.0), tint.a * 0.8);

      // add fresnel (original power-curve)
      float fresnelFactor = clamp(
        pow(
          1.0 +
            d_shape * u_resolution1x.y / 1500.0 * pow(500.0 / fresnelR, 2.0) +
            fresnelH,
          5.0
        ),
        0.0,
        1.0
      );

      vec3 fresnelTintLCH = SRGB_TO_LCH(
        mix(vec3(1.0), vec3(tint.r, tint.g, tint.b), tint.a * 0.5)
      );
      fresnelTintLCH.x += 20.0 * fresnelFactor * fresnelF;
      fresnelTintLCH.x = clamp(fresnelTintLCH.x, 0.0, 100.0);

      outColor = mix(
        outColor,
        vec4(LCH_TO_SRGB(fresnelTintLCH), 1.0),
        fresnelFactor * fresnelF * 0.7 * length(normal)
      );

      // add glare (original LCH glare band)
      float glareGeoFactor = clamp(
        pow(
          1.0 +
            d_shape * u_resolution1x.y / 1500.0 * pow(500.0 / glareR, 2.0) +
            glareH,
          5.0
        ),
        0.0,
        1.0
      );

      float glareAngle = (vec2ToAngle(normalize(normal)) - PI / 4.0 + glareAngleU) * 2.0;
      int glareFarside = 0;
      if (
        glareAngle > PI * (2.0 - 0.5) && glareAngle < PI * (4.0 - 0.5) ||
        glareAngle < PI * (0.0 - 0.5)
      ) {
        glareFarside = 1;
      }
      float glareAngleFactor =
        (0.5 + sin(glareAngle) * 0.5) *
        (glareFarside == 1
          ? 1.2 * glareOpp
          : 1.2) *
        glareF;
      glareAngleFactor = clamp(pow(glareAngleFactor, 0.1 + glareConv * 2.0), 0.0, 1.0);

      vec3 glareTintLCH = SRGB_TO_LCH(
        mix(blurredPixel.rgb, vec3(tint.r, tint.g, tint.b), tint.a * 0.5)
      );
      glareTintLCH.x += 150.0 * glareAngleFactor * glareGeoFactor;
      glareTintLCH.y += 30.0 * glareAngleFactor * glareGeoFactor;
      glareTintLCH.x = clamp(glareTintLCH.x, 0.0, 120.0);

      outColor = mix(
        outColor,
        vec4(LCH_TO_SRGB(glareTintLCH), 1.0),
        glareAngleFactor * glareGeoFactor * length(normal)
      );
    }
  } else {
    outColor = texture(u_bg, v_uv);
  }

  // smooth edge transition (original)
  outColor = mix(outColor, texture(u_bg, v_uv), smoothstep(-0.001, 0.001, d_cov));

  // DOM compositing mode: alpha follows the glass coverage so the page
  // shows through outside shapes; the rim band stays strong, the interior is
  // a light tint veil (real content blur comes from the surface's
  // backdrop-filter, composited beneath this canvas). Output is
  // premultiplied to match premultipliedAlpha canvas contexts.
  if (u_transparentBg == 1) {
    float coverage = 1.0 - smoothstep(-0.001, 0.001, d_cov);
    // Rim test recomputed locally for shape si
    float nmerged = -1.0 * (d_shape * u_resolution1x.y);
    float thickness = u_shapeM0[si].x;
    float refFactor = u_shapeM0[si].y;
    float x_R_ratio = 1.0 - nmerged / thickness;
    float thetaI = safeAsin(pow(x_R_ratio, 2.0));
    float thetaT = safeAsin(1.0 / refFactor * sin(thetaI));
    float rimEdge = -1.0 * tan(thetaT - thetaI);
    if (nmerged >= thickness) {
      rimEdge = 0.0;
    }

    // In DOM mode, the interior glass body has a baseline translucent veil
    // so untinted glass (tint.a == 0) remains a visible refractive surface
    // without requiring an opaque fill.
    float interiorAlpha = max(0.12, tint.a * 0.8);
    float a = rimEdge > 0.0 && d_shape < 0.001
      ? max(interiorAlpha, 0.85)
      : interiorAlpha;
    a *= coverage;

    if (rimEdge <= 0.0) {
      vec3 tintBase = tint.a > 0.0 ? vec3(tint.r, tint.g, tint.b) : vec3(1.0);
      outColor.rgb = tintBase;
    }

    if (u_premultiply == 1) {
      outColor = vec4(outColor.rgb * a, a);
    } else {
      outColor = vec4(outColor.rgb, a);
    }
  }

  fragColor = outColor;
}
