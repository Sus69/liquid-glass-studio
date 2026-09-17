---
title: Built-in Presets Deep Dive
description: Comprehensive analysis and numerical comparison of the five built-in optical presets.
page_type: reference
status: published
---

# Built-in Presets Deep Dive

Liquid UI includes five carefully calibrated material presets designed for distinct UI roles. Every preset is accessible via the `glass` prop on all components.

```tsx
<LiquidCard glass="soft">Soft Glass</LiquidCard>
<LiquidCard glass="clear">Clear Crystal Glass</LiquidCard>
<LiquidCard glass="frosted">Milky Frosted Glass</LiquidCard>
<LiquidCard glass="dark">Smoked Obsidian Glass</LiquidCard>
<LiquidCard glass="strong">Studio Strong Reference Glass</LiquidCard>
```

---

## Complete Preset Comparison Matrix

| Property | `soft` | `clear` | `frosted` | `dark` | `strong` (Studio Parity) |
|---|---|---|---|---|---|
| `thickness` | `12` | `24` | `16` | `22` | `20` |
| `refraction` | `1.2` | `1.5` | `1.25` | `1.45` | `1.4` |
| `refractionDistance` | `0.035` | `0.06` | `0.04` | `0.055` | `0.05` |
| `dispersion` | `2` | `10` | `1` | `6` | `7` |
| `fresnel` | `0.12` | `0.25` | `0.15` | `0.2` | `0.2` |
| `fresnelRange` | `40` | `25` | `35` | `28` | `36` |
| `fresnelHardness` | `0.25` | `0.15` | `0.3` | `0.2` | `0.2` |
| `glare` | `0.5` | `0.9` | `0.55` | `0.8` | `0.9` |
| `glareRange` | `40` | `25` | `35` | `28` | `30` |
| `glareHardness` | `0.3` | `0.2` | `0.35` | `0.22` | `0.2` |
| `glareConvergence` | `0.4` | `0.5` | `0.4` | `0.5` | `0.5` |
| `glareOppositeFactor`| `0.6` | `0.8` | `0.6` | `0.75` | `0.8` |
| `glareAngle` | `-45` | `-45` | `-45` | `-45` | `-45` |
| `blur` | `2` | `1` | `12` | `4` | `1` |
| `borderBlend` | `true` | `false` | `true` | `true` | `true` |
| `tint` (RGBA) | `{255,255,255, 0.08}` | `{255,255,255, 0}` | `{255,255,255, 0.28}` | `{12,14,20, 0.55}` | `{255,255,255, 0}` |
| `shadowExpand` | `30` | `25` | `28` | `25` | `25` |
| `shadow` | `0.08` | `0.15` | `0.1` | `0.2` | `0.15` |
| `shadowOffset` | `{x:0, y:-8}` | `{x:0, y:-10}` | `{x:0, y:-8}` | `{x:0, y:-10}` | `{x:0, y:-10}` |
| `merge` | `0.06` | `0.05` | `0.06` | `0.05` | `0.05` |
| `radius` | `16` | `16` | `16` | `16` | `16` |
| `roundness` | `5` | `5` | `5` | `5` | `5` |

---

## Optical Profile Deep-Dives

### 1. `soft` — Delicate & Unobtrusive
- **Optical Profile**: Modest thickness ($12\text{px}$), subtle refraction ($1.2$), gentle dispersion ($2$), and light tint veil ($8\%$).
- **Design Role**: Default preset for secondary UI elements (`LiquidPill`, `LiquidCard`, inactive dock items) that must exist gracefully over busy backgrounds without drawing excessive attention.

### 2. `clear` — Pure Prismatic Crystal
- **Optical Profile**: Substantial thickness ($24\text{px}$), strong refractive index ($1.5$), maximum chromatic dispersion ($10$), zero tint, and zero edge blur blending (`borderBlend: false`).
- **Design Role**: Designed for tactile navigation (`LiquidDock`) and interactive elements where authentic glass lens distortion and rainbow chromatic aberration are desired.

### 3. `frosted` — Heavy Milky Diffusion
- **Optical Profile**: High Gaussian blur ($12\text{px}$), soft specular hardness ($0.35$), and a milky white tint veil ($a: 0.28$).
- **Design Role**: Default preset for readable inputs (`LiquidInput`) and dialog panels (`LiquidModal`) where text legibility is the highest priority.

### 4. `dark` — Smoked Obsidian
- **Optical Profile**: High-contrast dark charcoal tint (`rgba(12, 14, 20, 0.55)`), strong refraction ($1.45$), and deep shadows ($0.2$).
- **Design Role**: Default for floating tooltips (`LiquidTooltip`) and dark-themed cards over colorful photo backgrounds.

### 5. `strong` — The Studio Reference
- **Optical Profile**: Exact 1:1 parity with the Liquid Glass Studio reference defaults: thickness $20\text{px}$, refraction $1.4$, dispersion $7$, glare $0.9$, and fresnel range $36$.
- **Design Role**: The benchmark material for primary buttons (`LiquidButton variant="primary"`) and hero surfaces.

---

## Next Steps

- Create bespoke materials from scratch in **[Creating Custom Materials](materials/custom-materials.md)**.
- Learn how to layer overrides on top of presets in **[Composition & Overrides](materials/composition.md)**.
