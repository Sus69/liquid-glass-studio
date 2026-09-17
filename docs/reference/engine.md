---
title: Engine & Subsystem Reference
description: Authoritative technical reference for LiquidEngine, ShapeRegistry, Scheduler, and physics springs.
page_type: reference
status: published
---

# Engine & Subsystem Reference

This document provides a low-level architectural reference for the core TypeScript engine classes powering Liquid UI. These classes are utilized internally by `<LiquidProvider>` and `<LiquidSurface>`.

```ts
import {
  LiquidEngine,
  Scheduler,
  PointerSpring,
  ScalarSpring,
} from 'liquid-ui';
```

---

## 1. `LiquidEngine`

The central coordinator owning the HTML `<canvas>` element, hardware backend lifecycle, viewport synchronization, and texture streaming.

```ts
export class LiquidEngine {
  readonly canvas: HTMLCanvasElement;
  readonly registry: ShapeRegistry;
  readonly backendType: 'webgl' | 'webgpu' | 'css';
  readonly ready: boolean;

  constructor(options?: LiquidEngineOptions);
  async attach(container: HTMLElement): Promise<void>;
  dispose(): void;
  measure(): void;
  setBackground(bg?: EngineBgType): void;
  render(time: number): void;
}
```

### Constructor Options (`LiquidEngineOptions`)
- `backdropMode?: 'textured' | 'dom' | 'css'`: Chooses rendering strategy (default `'dom'`).
- `background?: EngineBgType`: Source texture URL (`{ kind: 'image' | 'video', url }`).
- `maxDpr?: number`: Maximum devicePixelRatio cap (default `2`).
- `backend?: 'auto' | 'webgl' | 'webgpu'`: Forces a specific backend.
- `debugPreserveDrawingBuffer?: boolean`: Keeps buffer valid for canvas readbacks.

### Key Lifecycle Methods
- **`attach(container)`**: Creates the full-size `<canvas class="liquid-ui-canvas">`, initializes WebGPU/WebGL2 shaders, mounts resize listeners, and starts the render scheduler.
- **`measure()`**: Synchronizes canvas backing-buffer resolution with container dimensions:
  $$\text{width} = \text{cssWidth} \times \text{dpr}, \quad \text{height} = \text{cssHeight} \times \text{dpr}$$
  Forces `lastPackedCount = -1` to trigger an immediate redraw.
- **`dispose()`**: Cancels scheduler animation frames, detaches observers, destroys GPU textures, and removes the canvas.

---

## 2. `ShapeRegistry`

Manages registration, spatial caching, and uniform array packing for up to 48 active liquid surfaces.

```ts
export class ShapeRegistry {
  readonly count: number;
  readonly droppedInLastPack: number;
  readonly packed: PackedUniforms;

  register(id: string, initial: LiquidShapeState): void;
  update(id: string, patch: Partial<LiquidShapeState>): void;
  unregister(id: string): void;
  setVisible(id: string, visible: boolean): void;
  pack(dpr: number): PackedUniforms;
}
```

### The 8-Vec4 Uniform Memory Layout
During `pack(dpr)`, the registry extracts 32 floating-point values per active shape, transposing them into 8 parallel `vec4[48]` arrays:

| Array | Channels | Data Packed |
|---|---|---|
| `u_shapes_A` | `(x, y, hw, hh)` | Position and dimensions in physical backing pixels |
| `u_shapes_B` | `(radius, roundness, thickness, refFactor)` | Corner radius, squircle exponent, bevel depth |
| `u_shapes_C` | `(refDist, dispersion, fresnel, fresnelRange)` | Refraction offset and chromatic dispersion |
| `u_shapes_D` | `(fresnelHard, glare, glareRange, glareHard)` | Specular glare and edge lighting |
| `u_shapes_E` | `(glareConv, glareOpp, glareAngle, blurRadius)` | Glare orientation and blur radius |
| `u_shapes_F` | `(borderBlend, tintR, tintG, tintB)` | Tint RGB channels (normalized 0-1) |
| `u_shapes_G` | `(tintA, shadowExpand, shadowFactor, shadowX)` | Tint alpha and shadow parameters |
| `u_shapes_H` | `(shadowY, mergeRate, scale, blurGroup)` | Shadow offset, blob merge, and blur bucket |

---

## 3. `Scheduler`

Controls the requestAnimationFrame loop and enforces render-on-demand power management.

```ts
export class Scheduler {
  constructor(onStep: (dt: number, time: number) => void);
  start(): void;
  stop(): void;
  markDirty(): void;
}
```

### Sleep vs. Wake Heuristics
On every monitor refresh, `Scheduler.step()` evaluates:
```ts
if (!dirty && !hasVideoData && this.lastPackedCount === this.registry.packed.count) {
  // All springs settled, no pointer input, no video tick: SLEEP
  return;
}
```
If an element moves, a button is pressed, or a video frame arrives, `markDirty()` wakes the scheduler instantly.

---

## 4. `PointerSpring` & `ScalarSpring`

Headless physics classes responsible for smooth tactile feedback without React state overhead.

### `PointerSpring` (2D Parallax)
- Built on `@react-spring/web`'s headless `Controller`.
- Exposes `speed: SpringVec2` in physical pixels per millisecond.
- Default tension: 170, friction: 26.

### `ScalarSpring` (1D Press Compression)
- Semi-implicit Euler integration:
  $$\Delta = \text{target} - \text{value}$$
  $$a = (\text{stiffness} \times \Delta) - (\text{damping} \times v)$$
  $$v \mathrel{+}= a \times dt, \quad \text{value} \mathrel{+}= v \times dt$$
- Default stiffness: 300, damping: 22.
- Used to scale components down on press and spring back elastically on release.

---

## Next Steps

- Explore utility helpers in **[Utilities Reference](reference/utilities.md)**.
- Review shader pipelines in **[Rendering Pipeline](advanced/pipeline.md)**.
