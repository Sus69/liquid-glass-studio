---
title: Performance Optimization
description: Empirical performance guidelines, render-on-demand loops, blur grouping, and shape budgets.
page_type: guide
status: published
---

# Performance Optimization

Real-time optical physics (refraction, multi-tap blurs, chromatic dispersion, and specular lighting) are computationally intensive GPU operations. Liquid UI was architected from inception around strict performance budgets to deliver 60fps interaction on standard laptops and mobile devices.

---

## 1. The Core Performance Pillars

```
┌────────────────────────────────────────────────────────────────────────┐
│ LIQUID UI RUNTIME OPTIMIZATIONS                                       │
├───────────────────────┬────────────────────────────────────────────────┤
│ Render-on-Demand Loop │ 0% continuous GPU usage on idle pages.         │
│ Blur Batch Grouping   │ Power-of-two partitioning (1, 2, 4, 8, 16, 32).│
│ Shape Budget (MAX 48) │ Matches GPU MAX_FRAGMENT_UNIFORM_VECTORS.      │
│ DPR Clamping (maxDpr) │ Protects fillrate on 3x/4x mobile viewports.   │
│ Intersection Culling  │ 120px lookahead culls off-screen shapes.       │
└───────────────────────┴────────────────────────────────────────────────┘
```

---

## 2. Render-on-Demand Execution

Unlike game engines or WebGL demos that blindly execute an unconditional 60fps render loop, Liquid UI's `Scheduler` checks system state before submitting draw calls:

```ts
// packages/liquid-ui/src/engine/scheduler.ts
if (!dirty && !hasVideoData && this.lastPackedCount === this.registry.packed.count) {
  // All springs settled, no cursor movement, no video frame: SKIP FRAME
  return;
}
```

### Measured Impact:
- **Idle State**: GPU load drops to **0%**. Battery consumption is indistinguishable from a static HTML page.
- **Active Gesture**: As soon as a pointer enters or a spring is pushed, the loop wakes immediately to process high-frequency 60fps/120fps updates.

---

## 3. Blur Grouping & Fillrate Conservation

Gaussian and dual-kawase blur algorithms require multi-pass ping-pong framebuffers. If 20 different cards each requested arbitrary blur radii ($7\text{px}, 11\text{px}, 19\text{px}, 23\text{px}$), the GPU would stall from dozens of framebuffer render-target switches.

Liquid UI resolves blur into **power-of-two batches**:
$$\text{Blur Group} \in \{0, 1, 2, 4, 8, 16, 32, 64\}$$

- Elements requesting similar blur values are mapped to the same blur group.
- All shapes in a group share a single blur pass over their bounding region, eliminating redundant render passes.

---

## 4. The 48-Shape Budget (`MAX_SHAPES`)

The shape registry enforces a strict upper limit of **48 active surfaces**:

```ts
// packages/liquid-ui/src/engine/shapes.ts
export const MAX_SHAPES = 48;
```

### Why 48 Shapes?
WebGL2 and WebGPU uniform buffers allocate fragment uniform vectors. Standard mobile GPUs guarantee a minimum of 224 to 256 `vec4` uniform vectors. With 8 `vec4`s required per shape plus global scene uniforms, 48 shapes fit comfortably within the baseline uniform allocation of every supported GPU.

### Architectural Best Practice: Hierarchical Containerization
> [!IMPORTANT]
> **Do not render hundreds of liquid elements in large tables or lists.**
> - ❌ **Anti-pattern**: 200 table rows each wrapped in `<LiquidSurface>`. The registry will log warnings and drop surfaces beyond index 48 (`droppedInLastPack`).
> - ✅ **Recommended**: Wrap the **entire table container** in a single `<LiquidCard>`, and render the 200 rows as standard HTML/CSS DOM elements inside it!

---

## 5. DPR Optimization Checklist

| Device Class | Screen DPR | Default Behavior | Recommendation |
|---|---|---|---|
| **Desktop 1080p** | 1.0x | Native (1.0x) | Uncapped |
| **MacBook Retina** | 2.0x | Native (2.0x) | Default `maxDpr={2}` |
| **High-End Phone (iPhone / Pixel)** | 3.0x - 4.0x | Clamped to 2.0x | Default `maxDpr={2}` |
| **Low-Tier Mobile / Budget Tablet** | 2.0x - 3.0x | Can clamp to 1.5x | Explicit `maxDpr={1.5}` |

```tsx
// For battery-sensitive mobile applications:
<LiquidProvider maxDpr={1.5}>
  <App />
</LiquidProvider>
```

---

## 6. Profiling in Chrome DevTools

1. Open **Chrome DevTools** $\rightarrow$ **More Tools** $\rightarrow$ **Rendering**.
2. Check **Frame Rendering Stats** to observe real-time FPS and GPU memory.
3. Verify that when you stop moving the mouse, the FPS meter drops to **0 FPS**, confirming that the render-on-demand loop has successfully slept.

---

## Next Steps

- Consult common pitfalls in **[Troubleshooting Guide](development/troubleshooting.md)**.
- Review accessibility standards in **[Accessibility](development/accessibility.md)**.
