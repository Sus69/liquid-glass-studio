import { describe, it, expect } from 'vitest';
import { LIQUID_PRESETS, resolvePreset, cloneMaterial } from './presets';
import { resolveMaterial, blurGroupKey } from './resolveMaterial';
import type { LiquidMaterial } from '../types';

describe('material presets', () => {
  it('defines all five named presets', () => {
    expect(Object.keys(LIQUID_PRESETS).sort()).toEqual(
      ['clear', 'dark', 'frosted', 'soft', 'strong'],
    );
  });

  it('strong preset reproduces the Studio defaults', () => {
    const s = LIQUID_PRESETS.strong;
    // Values from the original Studio Controls.tsx defaults.
    expect(s.thickness).toBe(20);
    expect(s.refraction).toBe(1.4);
    expect(s.refractionDistance).toBe(0.05);
    expect(s.dispersion).toBe(7);
    expect(s.fresnelRange).toBe(36);
    expect(s.glare).toBeCloseTo(0.9, 5);
    expect(s.glareAngle).toBe(-45);
    expect(s.blur).toBe(1);
    expect(s.tint.a).toBe(0);
    expect(s.roundness).toBe(5);
  });

  it('resolvePreset returns an independent copy', () => {
    const a = resolvePreset('soft');
    a.tint.a = 0.9;
    expect(LIQUID_PRESETS.soft.tint.a).not.toBe(0.9);
  });

  it('cloneMaterial deep-copies nested color/offset', () => {
    const base = LIQUID_PRESETS.dark;
    const copy = cloneMaterial(base);
    copy.tint.r = 1;
    copy.shadowOffset.x = 99;
    expect(base.tint.r).not.toBe(1);
    expect(base.shadowOffset.x).not.toBe(99);
  });
});

describe('resolveMaterial', () => {
  it('returns strong defaults for undefined', () => {
    const m = resolveMaterial(undefined);
    expect(m.thickness).toBe(LIQUID_PRESETS.strong.thickness);
  });

  it('resolves preset names', () => {
    expect(resolveMaterial('frosted').blur).toBe(LIQUID_PRESETS.frosted.blur);
  });

  it('applies overrides over the strong base', () => {
    const m = resolveMaterial({ thickness: 44, tint: { r: 10, g: 20, b: 30, a: 0.5 } });
    expect(m.thickness).toBe(44);
    expect(m.tint.r).toBe(10);
    expect(m.tint.g).toBe(20);
    // Untouched fields keep base values:
    expect(m.refraction).toBe(LIQUID_PRESETS.strong.refraction);
  });
});

describe('blurGroupKey batching', () => {
  it('collapses nearby blur values into shared groups', () => {
    // Groups round UP so a shape never receives less blur than requested.
    expect(blurGroupKey(1)).toBe(1);
    expect(blurGroupKey(1.5)).toBe(2);
    expect(blurGroupKey(2)).toBe(2);
    expect(blurGroupKey(3)).toBe(4);
    expect(blurGroupKey(5)).toBe(8);
    expect(blurGroupKey(10)).toBe(16);
    expect(blurGroupKey(20)).toBe(32);
    expect(blurGroupKey(100)).toBe(64);
  });
});

describe('material integrity across presets', () => {
  const requiredKeys: (keyof LiquidMaterial)[] = [
    'thickness', 'refraction', 'refractionDistance', 'dispersion',
    'fresnel', 'fresnelRange', 'fresnelHardness',
    'glare', 'glareRange', 'glareHardness', 'glareConvergence', 'glareOppositeFactor', 'glareAngle',
    'blur', 'borderBlend', 'tint', 'shadowExpand', 'shadow', 'shadowOffset',
    'merge', 'radius', 'roundness',
  ];

  it('every preset has the complete material surface', () => {
    for (const [name, preset] of Object.entries(LIQUID_PRESETS)) {
      for (const key of requiredKeys) {
        expect(preset[key], `${name}.${key}`).toBeDefined();
      }
    }
  });
});
