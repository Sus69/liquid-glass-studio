---
title: Your First Glass Surface
description: Build custom glass components using the LiquidSurface primitive and LiquidDiv layout container.
page_type: guide
status: published
---

# Your First Glass Surface

While Liquid UI provides pre-styled components like `<LiquidButton>` and `<LiquidCard>`, you can turn **any semantic HTML element** into a liquid glass surface using `<LiquidSurface>` or `<LiquidDiv>`.

---

## Using LiquidDiv for Layout

`<LiquidDiv>` is the most direct way to create glass containers. It behaves like a standard `<div>`, but accepts glass styling and layout props:

```tsx
import { LiquidDiv } from 'liquid-ui';

export function GlassContainer() {
  return (
    <LiquidDiv
      glass="frosted"
      radius={20}
      padding={24}
      style={{ maxWidth: 400 }}
    >
      <h4 style={{ margin: '0 0 8px' }}>Glass Container</h4>
      <p style={{ margin: 0, opacity: 0.8 }}>
        Real DOM content layered directly over GPU-rendered frosted glass.
      </p>
    </LiquidDiv>
  );
}
```

### Layout Convenience Props
`<LiquidDiv>` provides direct shorthand props for common dimensions:
- `padding`: Number in pixels (`padding={20}`) or CSS string (`padding="16px 24px"`).
- `width` / `height`: Number in pixels or CSS string (`width={320}`, `height="auto"`).
- `radius`: Corner radius in CSS pixels.
- `tint`: Optional CSS background color layered onto the DOM element for extra tinting.

---

## Using LiquidSurface for Semantic Elements

If you need semantic HTML tags (such as `<header>`, `<nav>`, `<aside>`, or `<section>`), use the foundational `<LiquidSurface>` primitive with the `as` prop:

```tsx
import { LiquidSurface } from 'liquid-ui';

export function NavigationBar() {
  return (
    <LiquidSurface
      as="nav"
      glass="soft"
      radius={16}
      aria-label="Main Navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
      }}
    >
      <div style={{ fontWeight: 700 }}>MyApp</div>
      <div style={{ display: 'flex', gap: 16 }}>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
      </div>
    </LiquidSurface>
  );
}
```

---

## Applying Presets & Basic Overrides

The `glass` prop accepts either a **preset name** or a **partial material override**:

### 1. Using a Preset Name
```tsx
<LiquidSurface glass="clear">Crystal Clear Glass</LiquidSurface>
<LiquidSurface glass="frosted">Milky Frosted Glass</LiquidSurface>
<LiquidSurface glass="dark">Smoked Obsidian Glass</LiquidSurface>
```

### 2. Overriding Specific Properties
You can override individual optical parameters while preserving all other defaults:

```tsx
<LiquidSurface
  glass={{
    thickness: 35,      // Thicker 3D edge bevels
    refraction: 1.6,    // Stronger optical light bending
    dispersion: 12,     // Vibrant chromatic rainbow edges
    blur: 0,            // Crisp, razor-sharp background
  }}
  radius={28}
>
  Heavy Prismatic Lens
</LiquidSurface>
```

---

## Adding Interaction

Enable tactile spring responses by configuring the `interaction` prop:

```tsx
<LiquidSurface
  glass="soft"
  interaction={{
    hover: true,       // Pointer-following glare and displacement
    press: true,       // Spring compression on pointer down
    strength: 0.18,    // Movement multiplier (0-1)
  }}
  pressDepth={0.1}     // 10% compression on click
>
  Interactive Surface
</LiquidSurface>
```

---

## Next Steps

- Learn about all provider settings in **[Using LiquidProvider](getting-started/provider.md)**.
- Choose between WebGL2, WebGPU, and CSS in **[Choosing a Backend](getting-started/backend-selection.md)**.
