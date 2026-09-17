---
title: LiquidIconButton
description: Circular icon button with enforced accessibility labeling, pointer glare, and tactile press compression.
page_type: component
status: published
---

# LiquidIconButton

`<LiquidIconButton>` renders a circular liquid glass button optimized for SVG icons and graphic glyphs. Because icon-only buttons lack text content, TypeScript strictly enforces a mandatory `'aria-label'` prop to guarantee accessibility.

```tsx
import { LiquidIconButton } from 'liquid-ui';

export function MediaControls() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <LiquidIconButton aria-label="Previous Track" size={40}>
        ⏮
      </LiquidIconButton>
      <LiquidIconButton aria-label="Play" size={48} glass="strong">
        ▶
      </LiquidIconButton>
      <LiquidIconButton aria-label="Next Track" size={40}>
        ⏭
      </LiquidIconButton>
    </div>
  );
}
```

---

## Props Reference

`LiquidIconButtonProps` extends `Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'children'>`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `'aria-label'` | `string` | **Required** | Accessible description of the button action for screen readers. |
| `size` | `number` | `40` | Outer diameter (width and height) in CSS pixels. |
| `radius` | `number` | `Math.round(size / 2)` | Corner radius in CSS pixels. Defaults to perfect circular geometry. |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'soft'` | Material preset or override. |
| `interaction` | `LiquidInteraction` | `{ hover: true, press: true, strength: 0.2 }` | Enhanced pointer glare sensitivity. |
| `disabled` | `boolean` | `false` | Disables clicks and suppresses spring animations. |
| `className` | `string` | `undefined` | Additional class names merged with `.liquid-ui-icon-button`. |
| `style` | `React.CSSProperties` | `undefined` | Custom inline styles. |

---

## Enforced Accessibility

Because icon-only buttons do not contain textual children, failing to provide an accessible name is a critical accessibility failure:

```tsx
// ❌ TypeScript compilation error:
// Property 'aria-label' is missing in type '{ children: Element; }'
<LiquidIconButton>
  <SettingsIcon />
</LiquidIconButton>

// ✅ Fully accessible:
<LiquidIconButton aria-label="Open Settings">
  <SettingsIcon />
</LiquidIconButton>
```

---

## Enhanced Interaction Physics

Because circular lenses naturally concentrate optical light, `<LiquidIconButton>` configures an elevated pointer-glare strength (`strength: 0.2`) and tactile press depth (`pressDepth: 0.1`). Moving your pointer around the circular rim steers the specular glare angle smoothly, producing a lifelike optical response.

---

## Next Steps

- Wrap icon buttons in tooltips using **[LiquidTooltip](components/liquid-tooltip.md)**.
- Group icon buttons in a dock with **[LiquidDock](components/liquid-dock.md)**.
