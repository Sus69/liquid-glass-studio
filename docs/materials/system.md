---
title: The Material System
description: Understanding the optical architecture, physical parameter mappings, and uniform generation in Liquid UI.
page_type: concept
status: published
---

# The Material System

In Liquid UI, visual appearance is defined through physical optical properties rather than traditional CSS styling rules. Instead of configuring borders and background colors, you configure **thickness**, **refraction**, **chromatic dispersion**, **Fresnel rim reflection**, and **specular glare**.

---

## The Material Flow

The transformation from React props to final GPU pixels follows a clean, deterministic pipeline:

```
Component: <LiquidCard glass={{ refraction: 1.5, blur: 4 }} />
  │
  ▼
resolveMaterial(glass)
  ├── Deep-clones base preset (default: 'strong')
  ├── Merges top-level overrides
  └── Deep-merges nested `tint` and `shadowOffset`
  │
  ▼
Resolved LiquidMaterial
  ├── 22 strictly-typed optical fields
  │
  ▼
materialToShapeUniforms(material, geometry)
  ├── Translates angles from degrees to radians
  ├── Normalizes color channels (0-255 → 0.0-1.0)
  └── Negates shadow offsets for GPU coordinate space
  │
  ▼
ShapeRegistry (std140 Packed vec4 Arrays)
  │
  ▼
GPU Fragment Shader (WebGL2 / WebGPU)
  └── Evaluates ray-marched refraction, glare, and shadows
```

---

## Conceptual Categories

A complete `LiquidMaterial` comprises 22 properties organized into seven distinct physical groups:

1. **Optical & Refraction**: `thickness`, `refraction`, `refractionDistance`, `dispersion`
   - Controls physical edge volume, ray deviation, and rainbow chromatic aberration.
2. **Edge & Fresnel**: `fresnel`, `fresnelRange`, `fresnelHardness`
   - Controls grazing-angle rim lighting that illuminates the outer perimeter of the glass.
3. **Specular Glare**: `glare`, `glareRange`, `glareHardness`, `glareConvergence`, `glareOppositeFactor`, `glareAngle`
   - Simulates directional overhead light sources sweeping across the curved squircle bevels.
4. **Diffusion & Blur**: `blur`, `borderBlend`
   - Controls the Gaussian diffusion radius of the background and edge bevel transparency.
5. **Color & Tint**: `tint`
   - Applies an optical absorption filter (`LiquidRGBA`) to simulate smoked, colored, or tinted glass.
6. **Depth & Ambient Shadow**: `shadowExpand`, `shadow`, `shadowOffset`
   - Ambient drop shadows positioned beneath the glass surface.
7. **Shape & Composition**: `merge`, `radius`, `roundness`
   - Squircles, corner fillets, and smooth-minimum metaball blending.

---

## Immutability & Cloning Guarantee

Every preset resolved via `resolvePreset()` or `resolveMaterial()` is **deeply cloned**. Mutating properties on a resolved material will never leak into the global `LIQUID_PRESETS` registry or affect other components.

```typescript
// Safe: Mutating m does not mutate LIQUID_PRESETS.clear
const m = resolvePreset('clear');
m.thickness = 40;
```

---

## Next Steps

- Consult the exhaustive **[Material Properties Reference](materials/properties.md)**.
- Review built-in presets in **[Built-in Presets Deep Dive](materials/presets.md)**.
- Learn how to construct custom styles in **[Creating Custom Materials](materials/custom-materials.md)**.
