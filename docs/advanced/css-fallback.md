---
title: CSS Fallback Architecture
description: Graceful degradation, visual approximation heuristics, and zero-crash guarantees on unsupported devices.
page_type: advanced
status: published
---

# CSS Fallback Architecture

Liquid UI is designed to never crash an application due to missing GPU capabilities. If WebGL2 and WebGPU are unavailable, blocked by corporate security policies, or experience context loss, the library gracefully degrades to an accessible CSS fallback layer.

---

## Fallback Trigger Heuristics

The fallback system activates whenever:
1. `<LiquidProvider backdropMode="css">` is explicitly requested.
2. WebGPU detection fails AND WebGL2 context creation fails.
3. WebGL2 lacks required extensions (`EXT_color_buffer_float`).
4. An active WebGPU device experiences unrecoverable `device.lost`.
5. Running in server-side rendering (SSR) environments where no DOM `window` exists.

When activated, `LiquidEngine` sets `backend.gpu = false` and assigns a descriptive `backend.reason`.

---

## Visual Approximation Heuristics

In `packages/liquid-ui/src/components/fallback.ts`, the engine translates the active `LiquidMaterial` into pure CSS declarations:

```typescript
export function materialFallbackStyle(m: LiquidMaterial): React.CSSProperties {
  const alpha = m.tint.a;
  const dark = m.tint.r + m.tint.g + m.tint.b < 300;

  return {
    background: dark
      ? `rgba(${Math.round(m.tint.r)}, ${Math.round(m.tint.g)}, ${Math.round(m.tint.b)}, ${Math.min(alpha + 0.25, 0.85)})`
      : `rgba(255, 255, 255, ${Math.min(alpha + 0.12, 0.5)})`,
    backdropFilter: `blur(${Math.max(m.blur, 2)}px) saturate(1.4)`,
    WebkitBackdropFilter: `blur(${Math.max(m.blur, 2)}px) saturate(1.4)`,
    boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, ${(0.25 + m.fresnel * 0.3).toFixed(2)}), 0 8px 24px rgba(0, 0, 0, ${(m.shadow + 0.06).toFixed(2)})`,
    border: 'none',
  };
}
```

### Key Heuristic Details
1. **Light / Dark Adaptation**: Computes luminance ($R+G+B < 300$). Dark glass uses a darkened charcoal veil; light glass uses a translucent milky white fill.
2. **Fresnel Emulation**: An inset 1px box-shadow simulates the Fresnel rim highlight proportionally to `material.fresnel`.
3. **Drop Shadow Emulation**: An external box-shadow simulates the ambient drop shadow proportionally to `material.shadow`.
4. **Diffusion**: Native `backdrop-filter: blur(...)` handles background blurring.

---

## Zero-Crash Guarantee

Because the fallback layer relies entirely on standard CSS classes (`.liquid-ui-fallback`) and inline styles, all components, click handlers, form inputs, and animations continue to operate normally. Users still enjoy an elegant glassmorphic experience, while devices with capable GPUs receive full real-time optical refraction.

---

## Next Steps

- Consult the mathematical details of GPU shapes in **[SDF Shapes & Squircles](advanced/sdf-shapes.md)**.
- Explore debugging tools in **[Diagnostics & Debugging](advanced/debugging.md)**.
