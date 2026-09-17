---
title: Responsive Layouts and Sizing
description: Handling fluid CSS layouts, viewport resizing, device pixel ratio scaling, and intersection culling.
page_type: guide
status: published
---

# Responsive Layouts and Sizing

Because Liquid UI components are genuine HTML DOM elements backed by a single coordinate-synced GPU canvas, they integrate seamlessly with standard CSS Flexbox, CSS Grid, media queries, and container queries.

---

## 1. How Coordinate Synchronization Works

Liquid UI synchronizes DOM element boxes to the underlying WebGL2/WebGPU canvas via high-frequency, low-overhead observers:

```
DOM Tree (Flexbox / CSS Grid Layout)
      │
      ├── LiquidSurface Box Bounds
      │     └── Tracked by useElementBounds (ResizeObserver)
      │
      ├── Viewport / Window Resize
      │     └── LiquidEngine.measure() updates canvas width/height & u_resolution
      │
      └── Viewport Visibility
            └── Tracked by IntersectionObserver (120px rootMargin)
```

### Relative Coordinate Normalization
Surfaces measure their bounds relative to the `<LiquidProvider>` root container:
```ts
const rootRect = providerRef.getBoundingClientRect();
const elemRect = surfaceRef.getBoundingClientRect();

const localX = elemRect.left - rootRect.left;
const localY = elemRect.top - rootRect.top;
```
This ensures that CSS layout shifts, parent scrolling, or accordion expansions translate accurately into GPU shape coordinates without manual coordinate math.

---

## 2. Dynamic Viewport Resizing

When the browser window or parent container resizes:
1. `LiquidEngine.measure()` recalculates CSS pixel dimensions and physical canvas backing buffer pixels:
   $$\text{canvas.width} = \text{cssWidth} \times \text{dpr}$$
   $$\text{canvas.height} = \text{cssHeight} \times \text{dpr}$$
2. Uniform `u_resolution` is updated on the GPU.
3. The engine resets its packing cache (`lastPackedCount = -1`), forcing an immediate repaint so surfaces never flicker or stretch during window dragging.

---

## 3. Intersection Culling

Rendering complex SDF shapes and blurs for elements outside the current viewport wastes GPU fillrate. Liquid UI implements automated **Intersection Culling**:

```ts
// packages/liquid-ui/src/components/LiquidSurface.tsx
const observer = new IntersectionObserver(
  ([entry]) => {
    registry.setVisible(id, entry.isIntersecting);
  },
  { rootMargin: '120px' }
);
```

- **120px Lookahead Margin**: Elements beginning to scroll into view are primed and packed into uniforms 120 pixels *before* entering the visible viewport, preventing pop-in artifacts.
- **Off-Screen Occlusion**: Shapes scrolled out of view are skipped during uniform packing, freeing slots for other active surfaces and dropping unnecessary fragment shader evaluations.

---

## 4. Mobile DPR Throttling (`maxDpr`)

Modern smartphones frequently feature high device pixel ratios ($3\times$ or even $4\times$). A $4\times$ screen on a $400\times 900$ viewport requires an unmanageable $1600\times 3600$ ($5.76\text{M}$ pixels) buffer.

To safeguard mobile framerates, `<LiquidProvider>` defaults to `maxDpr={2}`:

```tsx
<LiquidProvider maxDpr={2}>
  {/* Caps pixel density at 2x regardless of physical screen DPR */}
  <App />
</LiquidProvider>
```

On a $3\times$ Super Retina display, capping DPR at $2\times$ reduces fragment shader fillrate load by **55%**, preserving battery life and steady 60fps rendering while remaining visually crisp to the human eye.

---

## 5. Responsive Layout Example

Here is an adaptive dashboard grid demonstrating fluid squircle cards:

```tsx
import React from 'react';
import { LiquidProvider, LiquidCard, LiquidButton } from 'liquid-ui';
import 'liquid-ui/styles.css';

export function ResponsiveGrid() {
  return (
    <LiquidProvider backdropMode="dom">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          <LiquidCard glass="soft" radius={24} interactive>
            <h3>Analytics Overview</h3>
            <p>Cards automatically adapt their SDF dimensions on resize.</p>
          </LiquidCard>

          <LiquidCard glass="soft" radius={24} interactive>
            <h3>User Sessions</h3>
            <p>ResizeObserver updates GPU uniforms smoothly.</p>
          </LiquidCard>

          <LiquidCard glass="soft" radius={24} interactive>
            <h3>System Health</h3>
            <p>IntersectionObserver culls off-screen grid rows.</p>
          </LiquidCard>
        </div>
      </div>
    </LiquidProvider>
  );
}
```

---

## Next Steps

- Maximize frame throughput in **[Performance Optimization](guides/performance.md)**.
- Review browser compatibility in **[Browser Support](development/browser-support.md)**.
