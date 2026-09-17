---
title: LiquidPill
description: Compact stadium pill badge for status indicators, metadata tags, and filter chips.
page_type: component
status: published
---

# LiquidPill

`<LiquidPill>` is a compact, fully rounded stadium badge (`radius={999}`). It is designed for status badges, tags, version indicators, and filter chips.

```tsx
import { LiquidPill } from 'liquid-ui';

export function StatusIndicators() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <LiquidPill statusColor="#10b981" glass="soft">
        System Operational
      </LiquidPill>
      <LiquidPill statusColor="#f59e0b" glass="soft">
        Maintenance
      </LiquidPill>
      <LiquidPill statusColor="#ef4444" glass="soft">
        Degraded
      </LiquidPill>
    </div>
  );
}
```

---

## Props Reference

`LiquidPillProps` extends `Omit<HTMLAttributes<HTMLDivElement>, 'style'>`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `statusColor` | `string` | `undefined` | Optional CSS color for the leading circular indicator dot (`'#10b981'`, `'#3b82f6'`, etc.). |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'soft'` | Preset name or custom material override. Defaults to light, unobtrusive `'soft'`. |
| `className` | `string` | `undefined` | Additional class names merged with `.liquid-ui-pill`. |
| `style` | `React.CSSProperties` | `undefined` | Custom inline styles. |

---

## Features & Styling

### 1. Leading Status Indicator
When `statusColor` is provided, `<LiquidPill>` automatically renders a $6\text{px}\times 6\text{px}$ circular colored dot with appropriate spacing. The indicator is marked `aria-hidden="true"` so screen readers are not disrupted by decorative elements.

### 2. Sizing & Typography
By default, `.liquid-ui-pill` applies:
- Padding: `4px 12px`
- Font size: `12px`
- Font weight: `600`
- Radius: `999px` (perfect stadium geometry across any element width)

```tsx
<LiquidPill glass="soft">v0.1.0-alpha</LiquidPill>
<LiquidPill glass="dark" style={{ color: '#fff' }}>Tag: WebGL2</LiquidPill>
```

---

## Next Steps

- Explore text inputs on glass in **[LiquidInput](components/liquid-input.md)**.
- See interactive switches in **[LiquidToggle](components/liquid-toggle.md)**.
