---
title: Creating Custom Materials
description: Design, calibrate, and implement custom liquid glass materials for your application.
page_type: guide
status: published
---

# Creating Custom Materials

While built-in presets provide excellent baselines, you can construct custom `LiquidMaterial` objects to match your application's unique branding and art direction.

---

## Defining a Custom Material

A custom material is a plain TypeScript object matching the `LiquidMaterial` interface:

```typescript
import type { LiquidMaterial } from 'liquid-ui';

export const CYBERPUNK_NEON_GLASS: LiquidMaterial = {
  // Bevel & Refraction
  thickness: 28,
  refraction: 1.6,
  refractionDistance: 0.07,
  dispersion: 18, // Intense chromatic rainbow split

  // Edge & Fresnel
  fresnel: 0.4,
  fresnelRange: 20,
  fresnelHardness: 0.3,

  // Specular Glare
  glare: 1.0,
  glareRange: 22,
  glareHardness: 0.15,
  glareConvergence: 0.6,
  glareOppositeFactor: 0.9,
  glareAngle: -30,

  // Blur & Diffusion
  blur: 2,
  borderBlend: false,

  // Vibrant Electric Cyan Tint
  tint: { r: 0, g: 220, b: 255, a: 0.15 },

  // Shadows
  shadowExpand: 30,
  shadow: 0.25,
  shadowOffset: { x: 0, y: -12 },

  // Geometry
  merge: 0.05,
  radius: 20,
  roundness: 5,
};
```

Apply your custom material to any component using the `glass` prop:

```tsx
<LiquidCard glass={CYBERPUNK_NEON_GLASS}>
  <h3>Cyberpunk Interface</h3>
</LiquidCard>
```

---

## Design Recipes

### Recipe 1: Warm Amber Glass
Simulates warm, vintage amber resin with a honey-toned tint and soft specular highlights:

```typescript
export const WARM_AMBER_GLASS: LiquidMaterial = {
  thickness: 22,
  refraction: 1.35,
  refractionDistance: 0.045,
  dispersion: 4,
  fresnel: 0.25,
  fresnelRange: 32,
  fresnelHardness: 0.2,
  glare: 0.75,
  glareRange: 35,
  glareHardness: 0.25,
  glareConvergence: 0.5,
  glareOppositeFactor: 0.7,
  glareAngle: -45,
  blur: 6,
  borderBlend: true,
  tint: { r: 245, g: 158, b: 11, a: 0.35 }, // Rich amber tint
  shadowExpand: 24,
  shadow: 0.18,
  shadowOffset: { x: 0, y: -8 },
  merge: 0.05,
  radius: 18,
  roundness: 5,
};
```

### Recipe 2: Arctic Frosted Ice
Simulates cold, semi-opaque glacial ice with high diffusion and a crisp cyan-white rim:

```typescript
export const ARCTIC_ICE_GLASS: LiquidMaterial = {
  thickness: 18,
  refraction: 1.25,
  refractionDistance: 0.04,
  dispersion: 2,
  fresnel: 0.35,
  fresnelRange: 28,
  fresnelHardness: 0.15,
  glare: 0.85,
  glareRange: 25,
  glareHardness: 0.2,
  glareConvergence: 0.5,
  glareOppositeFactor: 0.8,
  glareAngle: -45,
  blur: 16, // Heavy diffusion
  borderBlend: true,
  tint: { r: 210, g: 240, b: 255, a: 0.4 }, // Soft ice-blue veil
  shadowExpand: 26,
  shadow: 0.12,
  shadowOffset: { x: 0, y: -8 },
  merge: 0.06,
  radius: 22,
  roundness: 5,
};
```

---

## The Studio-to-Code Workflow

1. Open **Liquid Glass Studio** in your local browser (`/`).
2. Use the Leva GUI controls to visually tweak parameters (thickness, refraction, glare angle, tint, etc.) in real-time over various backgrounds.
3. Once satisfied with the visual result, transcribe the numerical values directly into your TypeScript application code.
4. All parameter names and units in the Studio correspond 1:1 with `LiquidMaterial`.

---

## Next Steps

- Learn how to compose partial overrides onto existing presets in **[Composition & Overrides](materials/composition.md)**.
- See how materials are applied across real UI layouts in **[Building Real Interfaces](guides/building-interfaces.md)**.
