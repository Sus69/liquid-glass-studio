---
title: LiquidButton
description: Real accessible button with spring press compression, pointer glare, variants, and sizes.
page_type: component
status: published
---

# LiquidButton

`<LiquidButton>` renders an accessible native `<button>` with real-time liquid glass optical effects. Hovering drives pointer-following glare and subtle displacement, while clicking activates damped spring compression directly on the GPU SDF shape.

```tsx
import { LiquidButton } from 'liquid-ui';

export function ActionGroup() {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <LiquidButton variant="primary" size="md" onClick={() => alert('Confirmed')}>
        Save Changes
      </LiquidButton>
      <LiquidButton variant="secondary" size="md">
        Cancel
      </LiquidButton>
    </div>
  );
}
```

---

## Props Reference

`LiquidButtonProps` extends `Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'>`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style preset mapping (`primary`:'strong', `secondary`:'soft', `ghost`:'clear'). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button dimensions and font sizing. |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | By variant | Manual override for the underlying material preset. |
| `radius` | `number` | `14` | Corner radius in CSS pixels. |
| `loading` | `boolean` | `false` | Displays an inline loading spinner and disables user interaction. |
| `disabled` | `boolean` | `false` | Disables button events, dims opacity, and suppresses spring physics. |
| `interaction` | `LiquidInteraction` | `{ hover: true, press: true, strength: 0.16 }` | Custom physics tuning. |
| `className` | `string` | `undefined` | Extra class names merged with `.liquid-ui-button`. |
| `style` | `React.CSSProperties` | `undefined` | Custom inline styles. |

---

## Visual Variants & Sizes

### Variants
- **`primary`** (Default): Uses the `strong` optical preset. Bold refractive edge bevels and prominent specular glare highlight for primary call-to-actions.
- **`secondary`**: Uses the `soft` optical preset. Subtler thickness and gentle reflections for secondary actions.
- **`ghost`**: Uses the `clear` optical preset with transparent DOM background for clean cancel/dismiss actions.

```tsx
<LiquidButton variant="primary">Primary</LiquidButton>
<LiquidButton variant="secondary">Secondary</LiquidButton>
<LiquidButton variant="ghost">Ghost</LiquidButton>
```

### Sizes
| Size | Padding | Font Size | Recommended Usage |
|---|---|---|---|
| `'sm'` | `6px 14px` | `13px` | Compact toolbars, table action buttons, badge actions |
| `'md'` | `10px 20px` | `15px` | Standard forms, dialog footers, cards |
| `'lg'` | `14px 28px` | `17px` | Hero call-to-action buttons |

```tsx
<LiquidButton size="sm">Small</LiquidButton>
<LiquidButton size="md">Medium</LiquidButton>
<LiquidButton size="lg">Large</LiquidButton>
```

---

## Loading State

When `loading={true}` is set:
- A spinner with `@keyframes liquid-ui-spin` appears before the button children.
- The button is automatically disabled (`disabled || loading`).
- The spinner element is marked `aria-hidden="true"` so screen readers are not disrupted.

```tsx
<LiquidButton loading={isLoading} variant="primary">
  {isLoading ? 'Processing…' : 'Submit Order'}
</LiquidButton>
```

---

## Accessibility & Keyboard Interaction

- **Native `<button>` element**: Receives browser focus, can be activated using `Enter` or `Space` keys, and supports standard `type="submit"` in forms.
- **Visible Focus Ring**: When navigated via keyboard (`:focus-visible`), a high-contrast focus outline (`outline: 2px solid rgba(90, 150, 255, 0.85)`) appears with `3px` offset.
- **Reduced Motion**: Under `prefers-reduced-motion: reduce`, pointer-following displacement is disabled and press compression settles instantaneously without oscillation.

---

## Next Steps

- For icon-only actions with strict accessibility labels, use **[LiquidIconButton](components/liquid-icon-button.md)**.
- For toggleable on/off controls, use **[LiquidToggle](components/liquid-toggle.md)**.
