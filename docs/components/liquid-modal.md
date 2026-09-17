---
title: LiquidModal
description: Accessible modal dialog with focus trap, Escape key dismissal, and backdrop overlay.
page_type: component
status: published
---

# LiquidModal

`<LiquidModal>` renders an accessible dialog window over a dimmed backdrop. The dialog panel is a `<LiquidSurface>`, rendering rich liquid glass material behind accessible DOM forms, buttons, and content.

```tsx
import { useState } from 'react';
import { LiquidModal, LiquidButton } from 'liquid-ui';

export function SettingsDialogDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <LiquidButton variant="primary" onClick={() => setIsOpen(true)}>
        Open Settings
      </LiquidButton>

      <LiquidModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        ariaLabel="Settings Dialog"
        glass="frosted"
        radius={24}
      >
        <div style={{ padding: 28, maxWidth: 440 }}>
          <h2 style={{ margin: '0 0 12px' }}>System Preferences</h2>
          <p style={{ margin: '0 0 24px', opacity: 0.8 }}>
            Adjust your GPU backend and display parameters.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <LiquidButton variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </LiquidButton>
            <LiquidButton variant="primary" onClick={() => setIsOpen(false)}>
              Save
            </LiquidButton>
          </div>
        </div>
      </LiquidModal>
    </>
  );
}
```

---

## Props Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | **Required** | Whether the modal is currently open and mounted. |
| `onClose` | `() => void` | **Required** | Callback invoked when the user requests closing (Esc key, backdrop click). |
| `children` | `React.ReactNode` | **Required** | Content rendered inside the modal panel. |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'frosted'` | Material preset or override for the panel. |
| `radius` | `number` | `24` | Corner radius in CSS pixels. |
| `ariaLabel` | `string` | `undefined` | Accessible label for the dialog (use either this or `ariaLabelledBy`). |
| `ariaLabelledBy` | `string` | `undefined` | ID of the heading element that labels this dialog. |

---

## Built-in Accessibility Features

1. **`role="dialog"` & `aria-modal="true"`**: Informs assistive technologies that the underlying page is inactive.
2. **Focus Trap**: Pressing `Tab` or `Shift+Tab` cycles focus strictly between the focusable elements inside the modal, preventing focus from escaping to hidden background elements.
3. **Focus Restoration**: When the modal closes, focus automatically returns to the element that triggered it.
4. **Escape Key Listener**: Pressing the `Escape` key immediately triggers `onClose()`.
5. **Backdrop Click**: Clicking the darkened overlay outside the panel automatically invokes `onClose()`.

---

## Next Steps

- See how interactive docks work in **[LiquidDock](components/liquid-dock.md)**.
- Explore organic liquid shapes in **[LiquidBlob](components/liquid-blob.md)**.
