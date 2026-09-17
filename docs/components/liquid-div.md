---
title: LiquidDiv
description: General-purpose glass container for arbitrary layout and DOM elements.
page_type: component
status: published
---

# LiquidDiv

`<LiquidDiv>` is the standard glass container primitive. It behaves like a native HTML `<div>`, rendering accessible DOM children while the shared GPU canvas draws physical liquid glass directly behind them.

```tsx
import { LiquidDiv, LiquidButton } from 'liquid-ui';

export function ProfilePanel() {
  return (
    <LiquidDiv
      glass="frosted"
      radius={24}
      padding="24px 32px"
      width={360}
    >
      <h3 style={{ margin: '0 0 8px' }}>User Profile</h3>
      <p style={{ margin: '0 0 16px', opacity: 0.7 }}>
        Manage your workspace preferences and account security.
      </p>
      <LiquidButton variant="primary" size="sm">Edit Account</LiquidButton>
    </LiquidDiv>
  );
}
```

---

## Props Reference

`LiquidDivProps` extends `React.HTMLAttributes<HTMLDivElement>`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'strong'` | Preset name (`'soft'`, `'clear'`, `'frosted'`, `'dark'`, `'strong'`) or material override. |
| `radius` | `number` | From material (`16`) | Corner radius in CSS pixels. |
| `padding` | `number \| string` | `undefined` | Shorthand padding (`24` or `'16px 24px'`). |
| `width` | `number \| string` | `undefined` | Explicit element width (`320` or `'100%'`). |
| `height` | `number \| string` | `undefined` | Explicit element height (`200` or `'auto'`). |
| `tint` | `string` | `undefined` | Extra CSS background tint applied to the DOM layer. |
| `interaction` | `LiquidInteraction` | `{ hover: false }` | Interaction tuning for hover displacement and spring physics. |
| `className` | `string` | `undefined` | Additional CSS class names. |
| `style` | `React.CSSProperties` | `undefined` | Additional inline styles. |

---

## Usage Examples

### 1. Header Banner
```tsx
<LiquidDiv
  glass="soft"
  radius={16}
  padding="16px 28px"
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  }}
>
  <span style={{ fontWeight: 700 }}>Workspace Title</span>
  <span>Online</span>
</LiquidDiv>
```

### 2. Smoked Dark Panel
```tsx
<LiquidDiv
  glass="dark"
  radius={20}
  padding={20}
  width={280}
>
  <h4 style={{ color: '#fff', margin: '0 0 4px' }}>Analytics</h4>
  <p style={{ color: '#94a3b8', margin: 0, fontSize: 13 }}>
    System throughput: 99.98%
  </p>
</LiquidDiv>
```

---

## Common Mistakes

> [!TIP]
> **Use CSS Grid or Flexbox directly**: `<LiquidDiv>` behaves just like a standard `<div>`. You can apply `display: flex`, `display: grid`, `gap`, `justifyContent`, and `alignItems` through `style` or `className` without breaking GPU shape synchronization.

---

## Next Steps

- For clickable or hover-reactive cards, explore **[LiquidCard](components/liquid-card.md)**.
- For interactive buttons with press deformation, explore **[LiquidButton](components/liquid-button.md)**.
