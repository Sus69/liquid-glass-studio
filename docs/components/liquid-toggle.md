---
title: LiquidToggle
description: Accessible toggle switch (role="switch") with a liquid glass track and spring-driven thumb.
page_type: component
status: published
---

# LiquidToggle

`<LiquidToggle>` renders an accessible toggle switch (`role="switch"`, `aria-checked`) featuring a liquid glass track and an animated thumb.

```tsx
import { useState } from 'react';
import { LiquidToggle } from 'liquid-ui';

export function SettingsToggle() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <LiquidToggle
        checked={darkMode}
        onCheckedChange={setDarkMode}
        aria-label="Toggle dark mode"
      />
      <span>Dark Mode</span>
    </div>
  );
}
```

---

## Props Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | **Required** | Controlled boolean state of the switch. |
| `onCheckedChange` | `(checked: boolean) => void` | **Required** | Callback invoked when the switch is toggled. |
| `disabled` | `boolean` | `false` | When true, prevents interaction and dims opacity. |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'soft'` | Material preset for the glass track. |
| `width` | `number` | `52` | Track width in CSS pixels. Height is calculated as `Math.round(width * 0.55)`. |
| `aria-label` | `string` | `undefined` | Accessible description when no visible text label is adjacent. |
| `className` | `string` | `undefined` | Additional class names merged with `.liquid-ui-toggle`. |
| `style` | `React.CSSProperties` | `undefined` | Custom inline styles. |

---

## Proportional Dimensions

`<LiquidToggle>` maintains strict optical proportions based on the `width` prop:
- **Track Height**: `Math.round(width * 0.55)` (for `width: 52`, height is $29\text{px}$).
- **Track Radius**: `height / 2` (perfect pill curvature).
- **Thumb Size**: `height - 6` (for `width: 52`, thumb is $23\text{px}$).

---

## Accessibility & Keyboard Interaction

- **Role**: Dispatched as `role="switch"` with `aria-checked={checked}`.
- **Keyboard Activation**: Being a native `<button>` element under the hood, users can focus the toggle via `Tab` and activate it using `Space` or `Enter`.

---

## Next Steps

- Pair toggles with tooltips using **[LiquidTooltip](components/liquid-tooltip.md)**.
- Put toggles inside modal dialogs using **[LiquidModal](components/liquid-modal.md)**.
