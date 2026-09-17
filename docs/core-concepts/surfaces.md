---
title: Liquid Surfaces
description: Understanding how React elements map to the underlying GPU shape registry.
page_type: concept
status: published
---

# Liquid Surfaces

The foundational building block of Liquid UI is the **Liquid Surface**. Unlike traditional canvas libraries that force you to recreate text, buttons, and layout inside a canvas, Liquid UI adopts a **hybrid decoupled architecture**.

```
┌─────────────────────────────────────────────────────────────┐
│ React Virtual DOM & Native HTML Layout (DOM Tree)           │
│ - Text, Typography, Children, Icons                        │
│ - Native DOM Events (onClick, onFocus, onKeyDown)          │
│ - Full CSS Flexbox & CSS Grid Flow                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
               Synchronized via ResizeObserver
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Shared GPU Backing Canvas (WebGL2 / WebGPU)                 │
│ - Mathematical Signed Distance Fields (SDF)                 │
│ - Dynamic Optical Refraction & Dispersion                   │
│ - Multi-Pass Dual-Kawase Backdrop Blur                     │
│ - Specular Glare, Highlights, and Shadows                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. DOM Content vs. GPU Backing Layer

When you render a liquid component (such as `<LiquidCard>` or `<LiquidButton>`):
1. **DOM Layer**: A real HTML element (`<div>`, `<button>`, etc.) is mounted in the document tree. It contains your children, responds to native focus, supports screen readers, and respects standard CSS layout.
2. **GPU Surface Layer**: The component registers a shape descriptor with the centralized `ShapeRegistry`. On every animation frame, the GPU canvas renders the optical glass material precisely underneath the DOM element's bounding rect.

This separation means:
- Text is never blurry or pixelated—it is rendered by the browser's native text rasterizer.
- Input fields retain native copy/paste, text selection, and auto-fill.
- Keyboard accessibility and screen readers function without special emulation layers.

---

## 2. The Surface Measurement Lifecycle

To keep the GPU rendering in lockstep with fluid CSS layouts:
1. **`useElementBounds`**: A `ResizeObserver` monitors changes to the DOM element's dimensions (`contentRect`).
2. **Coordinate Normalization**: The element's position is computed relative to the `<LiquidProvider>` root container:
   $$x = \text{elem.left} - \text{root.left} + \frac{\text{width}}{2}$$
   $$y = \text{elem.top} - \text{root.top} + \frac{\text{height}}{2}$$
3. **Registry Update**: The computed center coordinates and half-extents are stored in the `ShapeRegistry`.
4. **Uniform Packing**: When drawing, coordinates are multiplied by the device pixel ratio (`dpr`) and packed into uniform vector `u_shapes_A`.

---

## 3. Viewport Culling with IntersectionObserver

To guarantee scalability on long, scrollable web pages:
- Each surface is monitored by an `IntersectionObserver` configured with a `120px` root margin.
- When an element scrolls out of view:
  ```ts
  registry.setVisible(id, false);
  ```
- Hidden surfaces are omitted during shader uniform packing, consuming **0 fragment shader evaluations**.
- As the user scrolls back within 120 pixels of the element, the surface is automatically reinstated before it crosses the visible screen threshold.

---

## 4. Forwarding Refs & Polymorphic Elements

`<LiquidSurface>` accepts an `as` prop (`as="div"`, `as="button"`, `as="nav"`) and forwards its DOM ref directly to the rendered node:

```tsx
import React, { useRef } from 'react';
import { LiquidSurface } from 'liquid-ui';

export function CustomHeader() {
  const headerRef = useRef<HTMLElement>(null);

  return (
    <LiquidSurface as="header" ref={headerRef} glass="frosted" radius={16}>
      <h1>Dashboard Header</h1>
    </LiquidSurface>
  );
}
```

---

## Next Steps

- Explore how shapes are mathematically defined in **[SDF Shapes](core-concepts/shapes.md)**.
- Learn about optical materials in **[Material Architecture](core-concepts/materials.md)**.
