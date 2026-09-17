---
title: LiquidSurface
description: The foundational primitive mapping semantic DOM elements to the GPU liquid glass engine.
page_type: component
status: published
---

# LiquidSurface

`<LiquidSurface>` is the core primitive upon which every component in Liquid UI is built. It renders a semantic DOM element, measures its client bounding box via `ResizeObserver`, registers its geometry with the engine's `ShapeRegistry`, and drives local damped harmonic spring oscillators for interactive press and hover motion.

```tsx
import { LiquidSurface } from 'liquid-ui';

export function CustomSurface() {
  return (
    <LiquidSurface
      as="section"
      glass="soft"
      radius={18}
      interaction={{ hover: true, press: true, strength: 0.15 }}
      style={{ padding: 24, maxWidth: 420 }}
    >
      <h3>Custom Semantic Glass Section</h3>
      <p>Native DOM elements layered over GPU-rendered liquid glass.</p>
    </LiquidSurface>
  );
}
```

---

## Props Reference

`LiquidSurfaceProps` extends `React.HTMLAttributes<HTMLElement>` and `React.AriaAttributes`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `keyof HTMLElementTagNameMap` | `'div'` | The semantic HTML element tag to render (`'div'`, `'button'`, `'nav'`, `'aside'`, etc.). |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'strong'` | Preset name (`'soft'`, `'clear'`, `'frosted'`, `'dark'`, `'strong'`) or partial material override object. |
| `radius` | `number` | From material (`16`) | Explicit corner radius override in CSS pixels. Wins over `material.radius`. |
| `tintCss` | `string` | `undefined` | Optional CSS color applied to the DOM element background. |
| `interaction` | `LiquidInteraction` | `undefined` | Interaction tuning: `{ hover?, press?, strength?, spring? }`. |
| `pressDepth` | `number` | `0.06` | Compression depth factor applied to the SDF shape upon pointer down (0 to 1). |
| `disabled` | `boolean` | `false` | When true, disables pointer-following glare and spring deformation. |
| `onPointerNorm`| `(x: number, y: number, active: boolean) => void` | `undefined` | Callback receiving normalized pointer position $[-1, 1]$ relative to the surface center. |
| `role` | `React.AriaRole` | `undefined` | ARIA role forwarded to the underlying DOM element. |
| `type` | `'button' \| 'submit' \| 'reset'` | `undefined` | HTML button type when `as="button"`. |
| `className` | `string` | `undefined` | Class names merged onto the DOM element alongside `.liquid-ui-surface`. |
| `style` | `React.CSSProperties` | `undefined` | Inline styles merged onto the DOM element. |
| `ref` | `React.ForwardedRef<HTMLElement>` | `undefined` | Forwarded ref attaching directly to the rendered DOM element. |

---

## Lifecycle & Architecture

1. **Mount & Registration**:
   - On mount, if `<LiquidProvider>` is ready, `LiquidSurface` calls `engine.registry.register(material)`.
   - The engine assigns a unique integer ID and stores the shape in its `ShapeRegistry`.
2. **Measurement Synchronization**:
   - An internal `ResizeObserver` observes the element.
   - When resized or repositioned, `engine.computeShapeGeometry(el, material)` calculates `x, y, halfWidth, halfHeight` relative to the provider root and pushes the updated geometry to the registry.
3. **Intersection Culling**:
   - An `IntersectionObserver` with a `120px` root margin monitors element visibility.
   - When scrolled out of the viewport, `registry.setVisible(id, false)` marks the shape invisible, eliminating GPU rendering overhead.
4. **Spring Animation Stepping**:
   - Includes two `ScalarSpring` instances: `pressSpring` (`stiffness: 420, damping: 24`) and `hoverSpring` (`stiffness: 260, damping: 22`).
   - The scheduler steps these springs each animation frame. When moving, the GPU SDF shape deforms dynamically.
5. **Fallback Layer**:
   - If WebGL2 and WebGPU are unsupported (`!engine?.backend.gpu`), `LiquidSurface` automatically injects the `.liquid-ui-fallback` CSS class to render an accessible CSS backdrop-filter fallback.

---

## Accessibility & Semantic HTML

- **Native Semantic Tags**: Always use the `as` prop to render appropriate semantic elements (`as="button"`, `as="nav"`, `as="header"`).
- **Reduced Motion**: Directly respects the user's `prefers-reduced-motion` preference via `useReducedMotion()`. When active, spring oscillations are suppressed and hover offsets are forced to zero.
- **Ref Forwarding**: `ref` points to the native HTML element, allowing full integration with focus management libraries, form controllers, and layout tools.

---

## Common Mistakes

> [!WARNING]
> **Don't render without an enclosing LiquidProvider**: `LiquidSurface` requires `<LiquidProvider>` higher in the tree. Without it, the element renders as a standard un-styled transparent container.

> [!WARNING]
> **Don't apply opaque CSS background colors**: Liquid surfaces must remain transparent (`background: transparent`) so the GPU glass canvas sitting underneath can show through. To tint the glass, use the `tint` field on the material or the `tintCss` prop.

---

## Next Steps

- See how `<LiquidSurface>` is pre-configured for layout in **[LiquidDiv](components/liquid-div.md)**.
- Explore interactive button capabilities in **[LiquidButton](components/liquid-button.md)**.
