---
title: Interaction Physics & Tactile Feedback
description: Understanding Liquid UI's dual-spring physics engine, zero-re-render animation loops, and cursor tracking.
page_type: concept
status: published
---

# Interaction Physics & Tactile Feedback

A critical differentiator of Liquid UI is its **tactile physical response**. Instead of flat, static glass panels or linear CSS color transitions, liquid surfaces physically deform and refract light in response to pointer gestures.

Crucially, **these physics simulations run at 60fps/120fps without causing React component re-renders**.

```
User Input Event (Pointer Down / Move / Up)
      │
      ├── Pointer Tracking ──────► PointerSpring (2D Vector)
      │                            - Real-time cursor displacement
      │                            - Instantaneous velocity measurement (px/ms)
      │                            - Glare band angular rotation
      │
      └── Elastic Compression ───► ScalarSpring (1D Scalar)
                                   - Physical push-in scale (pressDepth)
                                   - Semi-implicit Euler integration
                                   - Damped harmonic oscillation on release
```

---

## 1. Dual-Spring Subsystem

Liquid UI decouples pointer interaction into two distinct spring models:

### 1. PointerSpring (2D Vector Parallax)
- Tracks the distance between the cursor and the surface center:
  $$\vec{\Delta} = \vec{p}_{\text{cursor}} - \vec{p}_{\text{center}}$$
- Computes pointer speed in pixels per millisecond ($\text{px/ms}$).
- When the cursor moves quickly, the measured speed momentarily amplifies the surface's refractive index and chromatic dispersion, creating a subtle, delightful optical wake.

### 2. ScalarSpring (1D Press Depth)
- Handles physical compression when clicking or tapping a button or card:
  $$\text{Target} = 1.0 - \text{pressDepth}$$
- Integrates using semi-implicit Euler physics inside `Scheduler.step(dt)`:
  $$a = (\text{stiffness} \times \Delta) - (\text{damping} \times v)$$
  $$v \mathrel{+}= a \times dt, \quad \text{scale} \mathrel{+}= v \times dt$$
- When released, the button bounces past $1.0$ before settling smoothly.

---

## 2. Zero React Re-Renders

In standard React architectures, updating animation coordinates requires `useState` or `useSpring`, triggering re-renders of the host component and its children.

Liquid UI completely avoids this bottleneck:
1. Pointer events write directly into mutable physics controller refs (`hoverSpring.current`, `pressSpring.current`).
2. The `Scheduler` requestAnimationFrame loop samples these values and writes them straight into WebGL2/WebGPU uniform buffers.
3. React never reconciles the DOM tree during hover, drag, or press interactions.

---

## 3. Reduced Motion Support

For users who have enabled `prefers-reduced-motion: reduce`:
- The `useReducedMotion` hook automatically detects the setting.
- Cursor hover parallax displacement is zeroed (`offsetX = 0`, `offsetY = 0`).
- Press compression snaps instantly without spring oscillation.

---

## Next Steps

- Explore backdrop modes in **[Backdrop Architecture](core-concepts/backdrops.md)**.
- Learn how to build real layouts in **[Building Real Interfaces](guides/building-interfaces.md)**.
