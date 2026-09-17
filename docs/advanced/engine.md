---
title: LiquidEngine Internals
description: Deep dive into the LiquidEngine coordinator, ShapeRegistry packing, and scheduler lifecycle.
page_type: advanced
status: published
---

# LiquidEngine Internals

`LiquidEngine` is the central TypeScript class that coordinates the shared canvas, backend renderers, shape registries, and animation loop. Exactly one `LiquidEngine` instance is created per `<LiquidProvider>`.

```
LiquidEngine
├── canvas: HTMLCanvasElement (z-index: 0, pointer-events: none)
├── registry: ShapeRegistry (manages shape IDs and std140 uniform arrays)
├── scheduler: Scheduler (dirty-tracking render-on-demand rAF loop)
├── backend: LiquidBackendInfo ({ kind: 'webgl' | 'webgpu' | 'css', gpu: boolean })
└── renderer: MultiPassRenderer | GPUMultiPassRenderer | null
```

---

## The ShapeRegistry & Float32Array Packing

`ShapeRegistry` manages active surfaces and translates their React state into flat typed arrays:

```typescript
export class ShapeRegistry {
  readonly packed = {
    shapesA: new Float32Array(MAX_SHAPES * 4), // center.xy, halfSize.xy
    shapesB: new Float32Array(MAX_SHAPES * 4), // radius, roundness, scale, offsetX
    shapesC: new Float32Array(MAX_SHAPES * 4), // offsetY, blurEdge, shadowExpand, shadowFactor
    shapeM0: new Float32Array(MAX_SHAPES * 4), // thickness, refraction, refractionDistance, dispersion
    shapeM1: new Float32Array(MAX_SHAPES * 4), // fresnel, fresnelRange, fresnelHardness, glare
    shapeM2: new Float32Array(MAX_SHAPES * 4), // glareRange, glareHardness, glareConv, glareOpp
    shapeM3: new Float32Array(MAX_SHAPES * 4), // glareAngle, shadowPosX, shadowPosY, mergeRate
    shapeTint: new Float32Array(MAX_SHAPES * 4), // tint RGBA
    count: 0,
  };
}
```

### Shape Capacity: MAX_SHAPES = 48
If an application renders more than 48 simultaneous surfaces:
- `ShapeRegistry.pack()` sets `droppedInLastPack = totalShapes - 48`.
- The engine emits a console warning informing developers of dropped shapes.
- No memory buffer overflow or WebGPU validation error occurs.

---

## The Scheduler: Render-on-Demand Loop

Liquid UI does not waste CPU or GPU power by rendering when nothing is moving:

```typescript
// Inside Scheduler.step():
if (!hasDirtyShapes && !isAnySpringMoving && !isVideoPlaying) {
  // Sleep: Skip GPU submission
  return;
}
// Awake: Pack uniforms and execute 4-pass pipeline
renderer.render(packedData);
```

### Frame Wake-up Triggers
The scheduler immediately wakes up when:
1. A pointer enters or moves across a surface.
2. An interaction spring is actively oscillating (`pressSpring` or `hoverSpring`).
3. A component mounts, unmounts, or changes its material.
4. The window or parent container resizes.
5. A video background is actively streaming new frames.

---

## Resize Lifecycle & Repaint Guarantee

When the viewport or container resizes:
1. `measure()` updates the canvas `width` and `height` based on client dimensions and DPR.
2. Resizing a canvas destroys the underlying WebGL backing store or invalidates the WebGPU swapchain.
3. The engine sets `lastPackedCount = -1`, forcing an immediate full repaint even if no shapes changed position, eliminating black frame flashes during window resizing.

---

## Next Steps

- Learn how to diagnose rendering anomalies in **[Diagnostics & Debugging](advanced/debugging.md)**.
- Review the complete **[Engine API Reference](reference/engine.md)**.
