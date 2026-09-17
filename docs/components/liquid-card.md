---
title: LiquidCard
description: Elevated glass container with optional magnetic pointer response and squircle bevels.
page_type: component
status: published
---

# LiquidCard

`<LiquidCard>` is an elevated surface designed for grouping related content, project items, media widgets, and settings panels. It defaults to the gentle `'soft'` preset with deep $20\text{px}$ squircle corners, and supports optional magnetic pointer tracking via `interactive={true}`.

```tsx
import { LiquidCard, LiquidButton } from 'liquid-ui';

export function ProjectCard() {
  return (
    <LiquidCard
      glass="frosted"
      radius={24}
      interactive
      style={{ maxWidth: 320 }}
    >
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Design System</h3>
      <p style={{ margin: '0 0 16px', fontSize: 14, opacity: 0.75, lineHeight: 1.5 }}>
        A cohesive component library engineered with real-time WebGL2 and WebGPU materials.
      </p>
      <LiquidButton size="sm" variant="primary">View Docs</LiquidButton>
    </LiquidCard>
  );
}
```

---

## Props Reference

`LiquidCardProps` extends `Omit<HTMLAttributes<HTMLDivElement>, 'style'>`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `interactive` | `boolean` | `false` | When true, enables magnetic pointer tracking where glare and position follow the pointer. |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'soft'` | Preset name (`'soft'`, `'clear'`, `'frosted'`, `'dark'`, `'strong'`) or material override. |
| `radius` | `number` | `20` | Corner radius in CSS pixels. |
| `interaction` | `LiquidInteraction` | By `interactive` | Custom physics override (`interactive ? { hover: true, strength: 0.1 } : { hover: false }`). |
| `className` | `string` | `undefined` | Additional class names merged with `.liquid-ui-card`. |
| `style` | `React.CSSProperties` | `undefined` | Additional inline styles. |

---

## Interactive Magnetic Mode

Setting `interactive={true}` turns the card into a tactile, responsive element:
- As the user's pointer moves across the card, the specular glare highlight sweeps dynamically across the glass face.
- Damped spring physics produce a subtle floating tilt/displacement (`strength: 0.1`), giving the surface physical presence.
- Moving the pointer away smoothly eases the glare highlight back to its rest angle ($-45^\circ$).

```tsx
<LiquidCard interactive glass="strong">
  <h4>Hover over me</h4>
  <p>The glare and lighting dynamically follow your cursor.</p>
</LiquidCard>
```

---

## Styling & Contrast Best Practices

- **Card Padding**: Defaults to `20px` from `.liquid-ui-card`. You can override padding through `style={{ padding: 28 }}`.
- **Dark Presets**: For high-contrast interfaces, use `glass="dark"`. Ensure internal text is styled white (`color: #ffffff`) or light gray (`color: #94a3b8`) for optimal readability.

```tsx
<LiquidCard glass="dark" style={{ width: 300, color: '#ffffff' }}>
  <h4 style={{ margin: '0 0 6px', color: '#ffffff' }}>Obsidian Card</h4>
  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
    High-contrast smoked glass over rich backgrounds.
  </p>
</LiquidCard>
```

---

## Next Steps

- Add a status badge using **[LiquidPill](components/liquid-pill.md)**.
- Put action triggers inside the card with **[LiquidButton](components/liquid-button.md)**.
