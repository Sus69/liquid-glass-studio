---
title: LiquidTooltip
description: Floating accessible liquid glass tooltip portal anchored to trigger elements.
page_type: component
status: published
---

# LiquidTooltip

`<LiquidTooltip>` displays contextual information when hovering or focusing a trigger element. The tooltip escapes parent overflow clipping by rendering into `document.body` while maintaining a liquid glass surface.

```tsx
import { LiquidTooltip, LiquidIconButton } from 'liquid-ui';

export function ActionWithTooltip() {
  return (
    <LiquidTooltip content="Copy to Clipboard" side="top" delayMs={150}>
      <LiquidIconButton aria-label="Copy to Clipboard">
        📋
      </LiquidIconButton>
    </LiquidTooltip>
  );
}
```

---

## Props Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `React.ReactNode` | **Required** | The content rendered inside the glass tooltip (text or nodes). |
| `children` | `React.ReactElement` | **Required** | Single interactive trigger element (e.g. `<LiquidIconButton>` or `<LiquidButton>`). |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'dark'` | Material preset for the tooltip bubble. Defaults to smoked `'dark'`. |
| `side` | `'top' \| 'bottom'` | `'top'` | Placement relative to the trigger element. |
| `delayMs` | `number` | `150` | Delay in milliseconds before the tooltip appears on hover or focus. |

---

## Behavior & Architecture

### 1. Trigger Cloning
`<LiquidTooltip>` clones its single child element to automatically attach `onPointerEnter`, `onPointerLeave`, `onFocus`, and `onBlur` event listeners. You do not need to manage open/close state manually.

### 2. Viewport Positioning
- When opened, the tooltip measures the trigger element's bounding rect and positions itself centered horizontally above (`side="top"`) or below (`side="bottom"`) the trigger.
- Repositions dynamically on window scroll and resize events.

### 3. Escape Parent Overflow
Because tooltips are rendered into `document.body` via a portal, they will never be clipped by parent containers that have `overflow: hidden` or `overflow: auto`.

---

## Accessibility

- Automatically assigns `role="tooltip"` to the floating container.
- Appears on both **pointer hover** and **keyboard focus**, ensuring that keyboard-only and screen reader users can access the tooltip text.

---

## Next Steps

- Explore full-screen dialog overlays in **[LiquidModal](components/liquid-modal.md)**.
- See navigation docks in **[LiquidDock](components/liquid-dock.md)**.
