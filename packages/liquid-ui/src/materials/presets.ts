import type { LiquidMaterial, LiquidPresetName } from '../types';

/**
 * Named material presets.
 *
 * Values are expressed in the same units as the original Studio controls and
 * map 1:1 onto shader uniforms (see toUniforms.ts). `strong` reproduces the
 * Studio defaults exactly.
 */
export const LIQUID_PRESETS: Record<LiquidPresetName, LiquidMaterial> = {
  /** Barely-there glass: light blur, gentle edges. */
  soft: {
    thickness: 12,
    refraction: 1.2,
    refractionDistance: 0.035,
    dispersion: 2,
    fresnel: 0.12,
    fresnelRange: 40,
    fresnelHardness: 0.25,
    glare: 0.5,
    glareRange: 40,
    glareHardness: 0.3,
    glareConvergence: 0.4,
    glareOppositeFactor: 0.6,
    glareAngle: -45,
    blur: 2,
    borderBlend: true,
    tint: { r: 255, g: 255, b: 255, a: 0.08 },
    shadowExpand: 30,
    shadow: 0.08,
    shadowOffset: { x: 0, y: -8 },
    merge: 0.06,
    radius: 16,
    roundness: 5,
  },
  /** Clear glass: strong refraction, almost no blur. */
  clear: {
    thickness: 24,
    refraction: 1.5,
    refractionDistance: 0.06,
    dispersion: 10,
    fresnel: 0.25,
    fresnelRange: 25,
    fresnelHardness: 0.15,
    glare: 0.9,
    glareRange: 25,
    glareHardness: 0.2,
    glareConvergence: 0.5,
    glareOppositeFactor: 0.8,
    glareAngle: -45,
    blur: 1,
    borderBlend: false,
    tint: { r: 255, g: 255, b: 255, a: 0 },
    shadowExpand: 25,
    shadow: 0.15,
    shadowOffset: { x: 0, y: -10 },
    merge: 0.05,
    radius: 16,
    roundness: 5,
  },
  /** Frosted glass: heavy blur, soft edges, milky tint. */
  frosted: {
    thickness: 16,
    refraction: 1.25,
    refractionDistance: 0.04,
    dispersion: 1,
    fresnel: 0.15,
    fresnelRange: 35,
    fresnelHardness: 0.3,
    glare: 0.55,
    glareRange: 35,
    glareHardness: 0.35,
    glareConvergence: 0.4,
    glareOppositeFactor: 0.6,
    glareAngle: -45,
    blur: 12,
    borderBlend: true,
    tint: { r: 255, g: 255, b: 255, a: 0.28 },
    shadowExpand: 28,
    shadow: 0.1,
    shadowOffset: { x: 0, y: -8 },
    merge: 0.06,
    radius: 16,
    roundness: 5,
  },
  /** Dark glass: smoked tint over strong refraction. */
  dark: {
    thickness: 22,
    refraction: 1.45,
    refractionDistance: 0.055,
    dispersion: 6,
    fresnel: 0.2,
    fresnelRange: 28,
    fresnelHardness: 0.2,
    glare: 0.8,
    glareRange: 28,
    glareHardness: 0.22,
    glareConvergence: 0.5,
    glareOppositeFactor: 0.75,
    glareAngle: -45,
    blur: 4,
    borderBlend: true,
    tint: { r: 12, g: 14, b: 20, a: 0.55 },
    shadowExpand: 25,
    shadow: 0.2,
    shadowOffset: { x: 0, y: -10 },
    merge: 0.05,
    radius: 16,
    roundness: 5,
  },
  /** Strong glass: the original Liquid Glass Studio defaults. */
  strong: {
    thickness: 20,
    refraction: 1.4,
    refractionDistance: 0.05,
    dispersion: 7,
    fresnel: 0.2,
    fresnelRange: 30,
    fresnelHardness: 0.2,
    glare: 0.9,
    glareRange: 30,
    glareHardness: 0.2,
    glareConvergence: 0.5,
    glareOppositeFactor: 0.8,
    glareAngle: -45,
    blur: 1,
    borderBlend: true,
    tint: { r: 255, g: 255, b: 255, a: 0 },
    shadowExpand: 25,
    shadow: 0.15,
    shadowOffset: { x: 0, y: -10 },
    merge: 0.05,
    radius: 16,
    roundness: 5,
  },
};

/** Resolve a preset name to its full material (deep-copied, safe to mutate). */
export function resolvePreset(name: LiquidPresetName): LiquidMaterial {
  return cloneMaterial(LIQUID_PRESETS[name]);
}

/** Deep-ish clone of a material (all fields are flat except tint/offset). */
export function cloneMaterial(m: LiquidMaterial): LiquidMaterial {
  return {
    ...m,
    tint: { ...m.tint },
    shadowOffset: { ...m.shadowOffset },
  };
}
