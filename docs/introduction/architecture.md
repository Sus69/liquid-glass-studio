---
title: Architecture Overview
description: How Liquid UI synchronizes the React component tree with a shared GPU rendering engine.
page_type: concept
status: published
---

# Architecture Overview

Liquid UI uses a **hybrid architecture** that completely separates visual material rendering from DOM layout and content. 

This architectural division ensures that while your application enjoys hardware-accelerated GPU optics, your text remains crisp, selectable, and accessible, and your standard React state updates, accessibility tools, and CSS layouts continue to function normally.

```
React Application Tree
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                   <LiquidProvider>                       │
│  - Mounts single background canvas (pointer-events: none)│
│  - Initializes LiquidEngine                              │
│  - Selects Backend (WebGPU → WebGL2 → CSS Fallback)      │
└──────────────────────────────────────────────────────────┘
       │                                     ▲
       │ provides context                    │ registers geometry
       ▼                                     │
┌───────────────────────┐            ┌─────────────────────┐
│    <LiquidSurface>    │───────────►│    ShapeRegistry    │
│  - Native DOM Tag     │            │  - Array of shapes  │
│  - ResizeObserver     │            │  - Material uniforms│
│  - Springs (press/pos)│            │  - Visibility state │
└───────────────────────┘            └─────────────────────┘
       │                                     │
       ▼ renders                             ▼ packs per frame
┌───────────────────────┐            ┌─────────────────────┐
│  Browser DOM Elements │            │  4-Pass GPU Pipeline│
│  (Text, Buttons, SVG) │            │  (Shaders on Canvas)│
└───────────────────────┘            └─────────────────────┘
```

---

## The Core Building Blocks

### 1. LiquidProvider
`<LiquidProvider>` sits near the root of your React component hierarchy. It is responsible for:
- Creating and hosting the single `<canvas className="liquid-ui-engine-canvas">`.
- Instantiating and managing the lifecycle of the `LiquidEngine`.
- Probing hardware capabilities and selecting the active backend.
- Exposing `{ engine, ready }` through React context (`LiquidContext`).

### 2. LiquidSurface & ShapeRegistry
Every liquid component (`LiquidButton`, `LiquidCard`, `LiquidInput`, etc.) composes `<LiquidSurface>`.
- When mounted, the surface registers with the engine's `ShapeRegistry` and receives a unique integer ID.
- An internal `ResizeObserver` measures the element's client bounding box relative to the provider container.
- An `IntersectionObserver` with a `120px` root margin detects when the surface scrolls out of the viewport, marking it invisible to bypass GPU rendering.
- When unmounted, the surface automatically unregisters from the registry, freeing up memory and GPU uniform slots.

### 3. The Render-on-Demand Scheduler
To avoid wasting battery and GPU cycles, the engine's `Scheduler` does not continuously redraw 60 frames per second if nothing is changing.
- **Static State**: If shapes have settled, no pointers are interacting, and no video background is playing, the render loop sleeps.
- **Dynamic State**: Hovering, clicking, scrolling, resizing, or updating a material property immediately wakes the scheduler to render the necessary frames.

### 4. Uniform Array Packing (std140 Layout)
Liquid UI packs up to **48 simultaneous surfaces** (`MAX_SHAPES = 48`) into eight `vec4` uniform arrays:
- `shapesA`: Center coordinates and half-sizes (`x, y, halfWidth, halfHeight`).
- `shapesB`: Radius, roundness exponent, spring scale, and hover X offset.
- `shapesC`: Hover Y offset, border blend flag, shadow expand, and shadow opacity.
- `shapeM0` – `shapeM3`: Thickness, refraction, dispersion, Fresnel, glare, and shadow offsets.
- `shapeTint`: Color filter RGBA values.

This structure allows the engine to render all surfaces across your entire page in a **single draw call** without expensive CPU-to-GPU state switching.

---

## Multi-Backend Strategy

```
1. WebGPU
   ├── Modern compute & render pipelines
   ├── Direct WGSL shader execution
   └── Sized uniform buffers with 16-byte alignment
   
2. WebGL2
   ├── Universal compatibility across evergreen desktop/mobile browsers
   ├── RGBA16F floating-point framebuffers for HDR glare
   └── Validated uniform vector budget
   
3. CSS Fallback
   ├── Zero GPU canvas rendering
   ├── Applied when context is lost or hardware unsupported
   └── Multi-layered backdrop-filter and layered box-shadows
```

---

## Next Steps

- Proceed to **[Installation](getting-started/installation.md)** to add Liquid UI to your project.
- Read **[Your First Glass Surface](getting-started/first-surface.md)** to learn how to customize primitives.
