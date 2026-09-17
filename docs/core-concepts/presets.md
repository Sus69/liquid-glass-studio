---
title: Material Presets
description: The five canonical material presets in Liquid UI and when to choose each style.
page_type: concept
status: published
---

# Material Presets

To ensure design consistency without forcing developers to hand-tune 22 mathematical parameters for every component, Liquid UI provides five carefully curated **Material Presets**.

Each preset balances light refraction, diffusion blur, chromatic dispersion, and edge highlights to achieve a distinct physical personality.

```tsx
<LiquidCard glass="frosted">Frosted Card</LiquidCard>
<LiquidCard glass="clear">Clear Card</LiquidCard>
```

---

## 1. The Five Canonical Presets

| Preset Name | Optical Theme | Blur | Refraction | Dispersion | Primary Use Case |
|---|---|---|---|---|---|
| **`soft`** (Default) | Ambient, velvety glass | $16\text{px}$ | $1.20$ | $0.8$ | General UI cards, navigation bars, dropdowns |
| **`clear`** | Transparent crystal | $0\text{px}$ | $1.45$ | $1.5$ | Floating badges, HUD overlays, high-detail backdrops |
| **`frosted`** | Dense diffusion acrylic | $32\text{px}$ | $1.15$ | $0.4$ | Modals, dialogs, sidebars, text-heavy panels |
| **`dark`** | Smoked obsidian | $20\text{px}$ | $1.35$ | $1.0$ | Dark mode applications, media players, code editors |
| **`strong`** | Heavy optical prism | $8\text{px}$ | $1.60$ | $2.5$ | Hero action buttons, interactive toggles, decorative gems |

---

## 2. Choosing the Right Preset

### `soft` (The All-Rounder)
- **Visual Feel**: Balanced diffusion with gentle edge refraction and a subtle ambient drop shadow.
- **When to Use**: Whenever you need a clean, modern glass container that does not distract from surrounding page content.

### `clear` (Minimal Distortion, Maximum Prism)
- **Visual Feel**: Razor-sharp clarity. Zero backdrop blur means underlying text, wallpapers, or video remain 100% sharp, while the edges exhibit prismatic chromatic fringing.
- **When to Use**: Floating over rich photographs or video backdrops where blur would obscure visual detail.

### `frosted` (Legibility First)
- **Visual Feel**: High-diffusion milky veil ($32\text{px}$ blur radius) with softened specular highlights.
- **When to Use**: Modals, complex forms, and any context where high text legibility is non-negotiable.

### `dark` (Sleek Stealth UI)
- **Visual Feel**: Smoked tint (`rgba(10, 12, 16, 0.6)`) with deep shadows and razor-sharp specular rim lights.
- **When to Use**: Dark-themed interfaces, cyberpunk aesthetics, audio/video workstation UIs.

### `strong` (High-Impact Hero)
- **Visual Feel**: Dramatic light bending ($1.60$ refractive index) and intense rainbow chromatic dispersion ($2.5$).
- **When to Use**: Primary call-to-action buttons, key status indicators, and interactive highlights.

---

## 3. Overriding Presets

Every component's `glass` prop accepts partial overrides on top of a preset:

```tsx
<LiquidButton
  glass={{
    ...resolveMaterial('strong'),
    refraction: 1.8,
    dispersion: 3.5,
  }}
>
  Hyper-Prismatic CTA
</LiquidButton>
```

---

## Next Steps

- Review all 22 material parameters in **[Material Architecture](core-concepts/materials.md)**.
- Learn how spring interactions work in **[Interaction Physics](core-concepts/interaction.md)**.
