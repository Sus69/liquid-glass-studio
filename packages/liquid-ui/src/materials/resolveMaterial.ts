import type { LiquidGlassInput, LiquidMaterial, LiquidPresetName } from '../types';
import { cloneMaterial, LIQUID_PRESETS, resolvePreset } from './presets';

/** Blur radii that share one blur pass in the batched pipeline. */
export function blurGroupKey(blur: number): number {
  if (blur <= 1) return 1;
  if (blur <= 2) return 2;
  if (blur <= 4) return 4;
  if (blur <= 8) return 8;
  if (blur <= 16) return 16;
  if (blur <= 32) return 32;
  return 64;
}

/**
 * Resolve a component's `glass` input to a full material.
 *
 * - a preset name → a copy of that preset
 * - a partial override → the `strong` preset with fields replaced
 * - undefined → the `strong` preset (Studio defaults)
 */
export function resolveMaterial(glass: LiquidGlassInput): LiquidMaterial {
  if (glass == null) {
    return resolvePreset('strong');
  }
  if (typeof glass === 'string') {
    return resolvePreset(glass as LiquidPresetName);
  }
  const base = cloneMaterial(LIQUID_PRESETS.strong);
  return { ...base, ...glass, tint: { ...base.tint, ...(glass.tint ?? {}) }, shadowOffset: { ...base.shadowOffset, ...(glass.shadowOffset ?? {}) } };
}

/**
 * Is this input a full `LiquidMaterial` (as opposed to an override or name)?
 * Used by the studio migration path which passes complete materials.
 */
export function isFullMaterial(input: LiquidGlassInput): input is LiquidMaterial {
  return input != null && typeof input !== 'string' && 'thickness' in input && 'refraction' in input;
}
