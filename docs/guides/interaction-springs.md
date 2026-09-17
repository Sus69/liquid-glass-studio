---
title: Interaction and Spring Physics
description: Deep dive into Liquid UI's dual-spring physics engine, pointer tracking, and zero-re-render animation loops.
page_type: guide
status: published
---

# Interaction and Spring Physics

Liquid UI interfaces feel alive and tactile because glass elements physically react to user touch and cursor motion. Instead of rigid linear CSS transitions, Liquid UI employs a dual-spring physics model executed directly within the rendering scheduler.

Crucially, **spring animations never trigger React component re-renders**. They update uniform buffers directly on the requestAnimationFrame loop.

---

## 1. Dual-Spring Architecture

Liquid UI splits physical motion into two specialized spring classes located in `packages/liquid-ui/src/engine/interaction.ts`:

```
User Input Event (pointermove / pointerdown)
      │
      ├── Pointer Tracking ──────► PointerSpring (2D Vector)
      │                            - Tracks cursor offset from shape center
      │                            - Calculates velocity (px/ms)
      │                            - Modulates specular glare & highlight shifts
      │
      └── Press Compression ─────► ScalarSpring (1D Scalar)
                                   - Computes physical push-in depth
                                   - Semi-implicit Euler integration
                                   - Recovers elastically on pointerup
```

---

## 2. PointerSpring: 2D Velocity & Parallax

The `PointerSpring` tracks the cursor's relative offset inside a liquid surface. As the pointer moves across the glass, the bevels and specular highlights deform dynamically.

```ts
export class PointerSpring {
  // Uses @react-spring/web's headless Controller
  start(target: SpringVec2, config?: { stiffness?: number; damping?: number }): void {
    this.controller.start({
      to: { x: target.x, y: target.y },
      config: config
        ? { tension: config.stiffness ?? 170, friction: config.damping ?? 26 }
        : undefined,
    });
  }
}
```

### Dynamic Velocity Coupling
The spring controller measures finite time differences ($\Delta t$) to compute instantaneous pointer velocity:
$$\vec{v} = \frac{\Delta \vec{x}}{\Delta t}$$
This velocity is fed into shader uniforms to momentarily amplify chromatic aberration and light refraction during fast gestures.

---

## 3. ScalarSpring: 1D Tactile Press Response

When a user clicks or presses a `<LiquidButton>` or interactive `<LiquidCard>`, the surface compresses elastically into the screen before bouncing back:

```ts
export class ScalarSpring {
  value: number;       // Current scale/depth (default 1.0)
  velocity = 0;
  target: number;      // Target scale/depth
  stiffness: number;   // Default 300
  damping: number;     // Default 22

  /** Semi-implicit Euler integration run every rAF frame */
  step(dt: number): boolean {
    const delta = this.target - this.value;
    const acceleration = this.stiffness * delta - this.damping * this.velocity;
    this.velocity += acceleration * dt;
    this.value += this.velocity * dt;
    return Math.abs(delta) > 0.0001 || Math.abs(this.velocity) > 0.0001;
  }
}
```

Because `ScalarSpring.step(dt)` runs inside `LiquidEngine.render()`, updating the shape's uniform representation takes less than $0.01\text{ms}$ with zero DOM churn.

---

## 4. Configuring Component Interactions

Every liquid component exposes the `interaction` and `pressDepth` props:

```tsx
<LiquidButton
  variant="primary"
  pressDepth={0.12} // Compresses by 12% on click
  interaction={{
    hover: true,    // Enable glare tracking
    press: true,    // Enable elastic push-in
    strength: 0.15, // Multiplier for parallax displacement
  }}
>
  Tactile Button
</LiquidButton>
```

### Disabling Interactions for Passive Containers
For background cards or static information displays, disable pointer tracking to reduce unnecessary calculations:

```tsx
<LiquidCard interaction={{ hover: false, press: false }}>
  {/* Completely static surface; never wakes scheduler on hover */}
</LiquidCard>
```

---

## 5. Settlement and Sleep Detection

To conserve battery on laptops and mobile devices, springs must not simulate indefinitely. Liquid UI uses an epsilon-settlement check:

```ts
export function springSettled(speed: SpringVec2, position: SpringVec2, target: SpringVec2, eps = 0.05): boolean {
  return (
    Math.abs(speed.x) < eps &&
    Math.abs(speed.y) < eps &&
    Math.abs(position.x - target.x) < eps &&
    Math.abs(position.y - target.y) < eps
  );
}
```

Once all active springs report `settled` and pointer movement stops, `Scheduler.step()` suspends GPU rendering until the next user event.

---

## 6. Reduced Motion Support

When a user enables `prefers-reduced-motion: reduce` in their operating system:
1. `useReducedMotion()` returns `true`.
2. Pointer hover parallax displacement is clamped to `0`.
3. Press spring compression transitions instantly without oscillation.

---

## Next Steps

- Learn about dynamic layout shifts in **[Responsive Layouts](guides/responsive-layouts.md)**.
- Review power savings in **[Performance Optimization](guides/performance.md)**.
