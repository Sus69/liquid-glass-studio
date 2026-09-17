---
title: Using LiquidProvider
description: Configure the root LiquidProvider to manage GPU canvas lifecycle, backdrops, and display scaling.
page_type: guide
status: published
---

# Using LiquidProvider

`<LiquidProvider>` is the root component of the Liquid UI architecture. It initializes the shared GPU rendering engine and mounts a single, transparent background canvas that services every liquid glass component rendered beneath it.

---

## Placement in Component Hierarchy

Place `<LiquidProvider>` once near the top of your React tree (or around the specific viewport section containing glass elements):

```tsx
import { LiquidProvider } from 'liquid-ui';

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <LiquidProvider
      backdropMode="dom"
      maxDpr={2}
      className="my-app-root"
    >
      {children}
    </LiquidProvider>
  );
}
```

---

## Provider Props Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `backdropMode` | `'dom' \| 'textured' \| 'css'` | `'dom'` | How pixels behind glass are obtained and rendered. |
| `background` | `EngineBgType` | `undefined` | Background texture source for `textured` mode. |
| `maxDpr` | `number` | `2` | Maximum device pixel ratio cap to prevent GPU overheating on ultra-high-DPI screens. |
| `backend` | `'auto' \| 'webgl' \| 'webgpu'`| `'auto'` | Force a specific GPU backend for development or automated testing. |
| `debugPreserveDrawingBuffer`| `boolean` | `false` | Retains GPU framebuffer content for automated pixel readbacks (`gl.readPixels`). |
| `className` | `string` | `undefined` | Extra class name applied to the `.liquid-ui-root` wrapper. |
| `style` | `React.CSSProperties` | `undefined` | Inline styles applied to the provider root element. |

---

## Configuring Backdrop Modes

### 1. DOM Mode (`backdropMode="dom"`) — Default
In DOM mode, the GPU canvas renders transparently with premultiplied alpha. The GPU draws the 3D edge bevels, specular glare, Fresnel rims, and ambient drop shadows, while native CSS `backdrop-filter: blur(...)` diffuses the live HTML elements underneath.

This mode is ideal for dynamic web applications, forms, and pages with changing text and complex DOM layouts.

### 2. Textured Mode (`backdropMode="textured"`)
In textured mode, the background image or video is uploaded directly into GPU memory as a texture. The full 4-pass pipeline runs against this texture, producing **true optical light refraction and chromatic dispersion** that visibly curve and separate background pixels through the glass bevels:

```tsx
<LiquidProvider
  backdropMode="textured"
  background={{
    kind: 'image',
    url: '/assets/wallpaper.webp',
  }}
>
  {/* Glass elements display genuine optical refraction over wallpaper.webp */}
</LiquidProvider>
```

#### Supported Background Types:
- **Image**: `{ kind: 'image', url: 'https://...' }`
- **Video**: `{ kind: 'video', url: '/video.mp4' }` (automatically synchronizes video frames each render pass)
- **Procedural**: `{ kind: 'procedural', index: 0 | 1 | 2 }` (built-in test grid / chessboard)

### 3. CSS Mode (`backdropMode="css"`)
Forces the CSS fallback path. No WebGL or WebGPU canvas is created; components use CSS borders and box-shadows.

---

## Inspecting Engine Status with useLiquidContext

Child components can read the live engine status using the `useLiquidContext()` hook:

```tsx
import { useLiquidContext } from 'liquid-ui';

export function EngineStatusBadge() {
  const { engine, ready } = useLiquidContext();

  if (!ready || !engine) {
    return <span>Initializing GPU…</span>;
  }

  return (
    <span>
      Active Backend: {engine.backend.kind.toUpperCase()} ({engine.backend.gpu ? 'GPU' : 'CSS'})
    </span>
  );
}
```

---

## Next Steps

- Explore backend details and detection heuristics in **[Choosing a Backend](getting-started/backend-selection.md)**.
- Master the full optical parameter matrix in the **[Material System](materials/system.md)**.
