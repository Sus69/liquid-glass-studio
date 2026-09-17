---
title: Creating Custom Glass Effects
description: Step-by-step recipes and design formulas for creating smoked, frosted, iridescent, and crystal glass styles.
page_type: guide
status: published
---

# Creating Custom Glass Effects

While Liquid UI provides 5 built-in presets (`soft`, `clear`, `frosted`, `dark`, `strong`), production applications often require bespoke materials tailored to a specific brand identity or lighting mood.

Because every glass parameter is exposed through the `glass` prop on any component, you can compose custom recipes with full type-safety.

```tsx
<LiquidCard
  glass={{
    refractiveIndex: 1.45,
    blur: 24,
    tint: [1, 1, 1],
    tintOpacity: 0.15,
  }}
>
  {/* Content */}
</LiquidCard>
```

---

## 1. Curated Material Recipes

### Recipe A: Frosted Acrylic (Apple macOS / VisionOS Style)
*Heavy blur, milky white diffusion veil, and subtle ambient glare. Excellent for dialogs, sidebars, and reading surfaces.*

```tsx
export const frostedAcrylic = {
  refractiveIndex: 1.25,
  thickness: 24,
  blur: 32,                 // Power-of-two blur group
  chromaticAberration: 0.8, // Minimal dispersion to avoid color fringing
  tint: [1, 1, 1] as [number, number, number],
  tintOpacity: 0.18,        // Soft milky white layer
  specular: 0.35,
  roughness: 0.45,
  fresnel: 0.5,
  glare: 0.25,
  shadow: 0.15,
  shadowExpand: 30,
};
```

### Recipe B: Smoked Obsidian (Sleek Dark Mode / Stealth UI)
*Deep black tinting, high refractive bending, crisp specular highlights, and deep shadows. Perfect for media players, HUD overlays, and developer tools.*

```tsx
export const smokedObsidian = {
  refractiveIndex: 1.55,    // Heavy refraction
  thickness: 20,
  blur: 16,
  chromaticAberration: 1.2,
  tint: [0.03, 0.03, 0.05] as [number, number, number],
  tintOpacity: 0.65,        // Strong dark filter
  specular: 0.8,            // Crisp highlight
  roughness: 0.15,          // Glossy finish
  fresnel: 0.85,            // Intense edge luminance
  glare: 0.4,
  shadow: 0.4,
  shadowColor: [0, 0, 0] as [number, number, number],
  shadowExpand: 25,
};
```

### Recipe C: Prismatic Crystal (Vibrant Geometric Gem)
*Zero blur, intense chromatic dispersion, sharp bevels, and hyper-reflective surface. Ideal for floating badges, hero cards, and 3D decorative pills.*

```tsx
export const prismaticCrystal = {
  refractiveIndex: 1.62,    // High bending (like diamond or flint glass)
  thickness: 16,
  blur: 0,                  // No diffusion — razor-sharp backdrop optics
  chromaticAberration: 4.5, // Extreme spectral rainbow fringing
  tint: [0.95, 0.98, 1.0] as [number, number, number],
  tintOpacity: 0.05,
  specular: 1.2,
  roughness: 0.05,          // Mirror polish
  fresnel: 0.95,
  glare: 0.8,
  glareAngle: -Math.PI / 4,
};
```

### Recipe D: Barely-There Film (Delicate Ultra-Light Water)
*Subtle optical distortion without darkening or obscuring backdrop content. Ideal for floating tooltips and unobtrusive notification chips.*

```tsx
export const barelyThereFilm = {
  refractiveIndex: 1.1,     // Subtle light refraction
  thickness: 8,             // Thin edge bevel
  blur: 4,                  // Low-cost micro blur
  chromaticAberration: 0.4,
  tint: [1, 1, 1] as [number, number, number],
  tintOpacity: 0.05,
  specular: 0.2,
  roughness: 0.2,
  fresnel: 0.3,
  glare: 0.15,
  shadow: 0.05,
  shadowExpand: 10,
};
```

---

## 2. Parameter Tuning Matrix

When engineering your own recipes, observe how optical parameters influence perceptual qualities:

| Visual Goal | Primary Parameter | Secondary Parameter | Recommended Tuning |
|---|---|---|---|
| **Heavier Blur** | `blur` | `roughness` | Keep `blur` at $8, 16, 24, 32$ to align with GPU blur passes. |
| **Edge Highlights** | `fresnel` | `specular` | Raise `fresnel` to $0.7 - 0.9$ for glowing glass borders. |
| **Glass Thickness** | `thickness` | `radius` | Keep `thickness` below half the smallest component dimension. |
| **Rainbow Dispersion** | `chromaticAberration` | `refractiveIndex` | Values $>2.5$ create strong prism effects at curved edges. |
| **Dark Theme Tinting** | `tint` + `tintOpacity` | `shadowColor` | Use dark blue/gray tints `[0.05, 0.06, 0.08]` with opacity $0.4 - 0.7$. |

---

## 3. Extending Presets

You do not need to specify all 22 properties from scratch. Use `resolveMaterial` or object spreading to extend an existing preset:

```tsx
import { resolveMaterial, LiquidCard } from 'liquid-ui';

// Extend the 'frosted' preset with an electric cyan tint
const cyberFrosted = {
  ...resolveMaterial('frosted'),
  tint: [0.0, 0.85, 1.0] as [number, number, number],
  tintOpacity: 0.25,
  specular: 0.7,
};

export function CyberCard({ children }: { children: React.ReactNode }) {
  return (
    <LiquidCard glass={cyberFrosted} radius={18}>
      {children}
    </LiquidCard>
  );
}
```

---

## Next Steps

- Learn how backdrops interact with refraction in **[Working with Backgrounds](guides/backgrounds.md)**.
- Explore hardware acceleration in **[Rendering Pipeline](advanced/pipeline.md)**.
