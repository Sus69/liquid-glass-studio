import type { LiquidMaterial } from '../types';

/**
 * The uniform payload for one shape, as consumed by the engine's shaders.
 *
 * Field names deliberately mirror the original Liquid Glass Studio uniforms
 * (`u_refThickness` → `u_refThickness`, etc.) so the generalized shaders stay
 * a direct evolution of the originals rather than a rewrite.
 */
export interface ShapeUniforms {
  /** vec2 center in CSS px, relative to root origin. */
  u_shapeCenter: [number, number];
  /** vec2 half-size in CSS px. */
  u_shapeHalfSize: [number, number];
  /** Corner radius px. */
  u_shapeRadius: number;
  /** Superellipse exponent. */
  u_shapeRoundness: number;
  /** Deformation scale from press/hover springs (1 = rest). */
  u_shapeScale: number;
  /** vec2 pointer-follow offset px. */
  u_shapeOffset: [number, number];

  u_refThickness: number;
  u_refFactor: number;
  u_refDistance: number;
  u_refDispersion: number;
  u_refFresnelRange: number;
  u_refFresnelHardness: number;
  u_refFresnelFactor: number;
  u_glareRange: number;
  u_glareHardness: number;
  u_glareConvergence: number;
  u_glareOppositeFactor: number;
  u_glareFactor: number;
  u_glareAngle: number;
  u_blurRadius: number;
  u_blurEdge: number;
  u_tint: [number, number, number, number];
  u_shadowExpand: number;
  u_shadowFactor: number;
  u_shadowPosition: [number, number];
  u_mergeRate: number;
}

/**
 * Map a public `LiquidMaterial` onto the shader uniform payload.
 * This is the single translation point between the public API and the GLSL.
 */
export function materialToShapeUniforms(
  m: LiquidMaterial,
  geometry: {
    x: number;
    y: number;
    halfWidth: number;
    halfHeight: number;
    scale: number;
    offsetX: number;
    offsetY: number;
  },
): ShapeUniforms {
  return {
    u_shapeCenter: [geometry.x, geometry.y],
    u_shapeHalfSize: [geometry.halfWidth, geometry.halfHeight],
    u_shapeRadius: m.radius,
    u_shapeRoundness: m.roundness,
    u_shapeScale: geometry.scale,
    u_shapeOffset: [geometry.offsetX, geometry.offsetY],

    u_refThickness: m.thickness,
    u_refFactor: m.refraction,
    u_refDistance: m.refractionDistance,
    u_refDispersion: m.dispersion,
    u_refFresnelRange: m.fresnelRange,
    u_refFresnelHardness: m.fresnelHardness,
    u_refFresnelFactor: m.fresnel,
    u_glareRange: m.glareRange,
    u_glareHardness: m.glareHardness,
    u_glareConvergence: m.glareConvergence,
    u_glareOppositeFactor: m.glareOppositeFactor,
    u_glareFactor: m.glare,
    u_glareAngle: (m.glareAngle * Math.PI) / 180,
    u_blurRadius: m.blur,
    u_blurEdge: m.borderBlend ? 1 : 0,
    u_tint: [m.tint.r / 255, m.tint.g / 255, m.tint.b / 255, m.tint.a],
    u_shadowExpand: m.shadowExpand,
    u_shadowFactor: m.shadow,
    u_shadowPosition: [-m.shadowOffset.x, -m.shadowOffset.y],
    u_mergeRate: m.merge,
  };
}

/**
 * Global (per-root) uniforms shared by all shapes.
 */
export interface GlobalUniforms {
  u_resolution: [number, number];
  u_dpr: number;
  u_mouse: [number, number];
  u_mouseSpring: [number, number];
  u_showShape1: number;
  u_blurWeights: number[];
}

/** The original Studio's per-pass uniform grouping, preserved for parity. */
export interface PassUniforms {
  bgPass: {
    u_bgType: number;
    u_bgTexture?: unknown;
    u_bgTextureRatio: number;
    u_bgTextureReady: number;
    u_shadowExpand: number;
    u_shadowFactor: number;
    u_shadowPosition: [number, number];
  };
  mainPass: {
    [k: string]: unknown;
  };
}
