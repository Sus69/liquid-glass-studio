---
title: LiquidInput
description: Accessible DOM text input wrapped in a frosted liquid glass container with accessory slots.
page_type: component
status: published
---

# LiquidInput

`<LiquidInput>` renders a native HTML `<input>` wrapped in a liquid glass container. 

Text is **never rendered through WebGL or GPU shaders**. The text cursor, input selection, IME composition, and font anti-aliasing remain 100% native browser DOM features, while the shared GPU engine provides the frosted glass material, edge bevels, and subtle depth underneath.

```tsx
import { useState } from 'react';
import { LiquidInput } from 'liquid-ui';

export function SearchField() {
  const [query, setQuery] = useState('');

  return (
    <LiquidInput
      placeholder="Search documentation…"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      leading={<span>🔍</span>}
      trailing={query ? <button onClick={() => setQuery('')}>✕</button> : null}
      style={{ maxWidth: 360 }}
    />
  );
}
```

---

## Props Reference

`LiquidInputProps` extends `Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'children' | 'size'>`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `leading` | `React.ReactNode` | `undefined` | Element or icon rendered before the text input. |
| `trailing` | `React.ReactNode` | `undefined` | Element or icon rendered after the text input. |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'frosted'` | Material preset or override for the wrapper. Defaults to diffusion-heavy `'frosted'`. |
| `radius` | `number` | `14` | Corner radius in CSS pixels. |
| `padding` | `number \| string` | `'10px 14px'` | Outer padding for the glass input wrapper. |
| `className` | `string` | `undefined` | Class name applied to the outer wrapper (`.liquid-ui-input-wrap`). |
| `style` | `React.CSSProperties` | `undefined` | Inline styles applied to the outer wrapper. |
| `ref` | `React.ForwardedRef<HTMLInputElement>` | `undefined` | **Attaches directly to the inner `<input>` element**. |

---

## Key Behaviors

### 1. Direct Ref Forwarding
When you pass a `ref` to `<LiquidInput>`, it attaches directly to the underlying `HTMLInputElement` (not the wrapper `<div>`). This allows you to call native input methods without extra wrappers:

```tsx
const inputRef = useRef<HTMLInputElement>(null);

function handleFocus() {
  inputRef.current?.focus();
}

<LiquidInput ref={inputRef} placeholder="Autofocus target" />
```

### 2. Inner Input Styling
The inner input receives class `.liquid-ui-input` with `background: transparent`, `border: none`, and `outline: none`, ensuring that typed text blends cleanly with the glass material.

---

## Next Steps

- Pair your input with a button from **[LiquidButton](components/liquid-button.md)** or **[LiquidIconButton](components/liquid-icon-button.md)**.
- See how tooltips anchor to inputs with **[LiquidTooltip](components/liquid-tooltip.md)**.
