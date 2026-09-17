---
title: Shape Merging Mechanics
description: Polynomial smooth minimum (smin) mathematics for merging liquid glass metaballs and dock items.
page_type: advanced
status: published
---

# Shape Merging Mechanics

When multiple liquid surfaces are placed near each other, Liquid UI can blend them together like droplets of mercury or molten glass. This effect is powered by polynomial **smooth minimum** ($\text{smin}$) blending.

---

## Standard Minimum vs. Smooth Minimum

In standard constructive solid geometry (CSG), the union of two shapes with distance fields $d_1$ and $d_2$ is computed as the raw minimum:
$$d_{\text{union}} = \min(d_1, d_2)$$

While mathematically correct, a raw minimum produces a sharp, creased seam where the boundaries intersect:

```
Raw Minimum:        ───────┐
                           │ (sharp 90° crease)
                    ───────┘

Smooth Minimum:     ───────╮
                            ╰────── (smooth organic bridge)
```

---

## The Quadratic Polynomial Formulation

In `shaders/lib/sdf.glsl`, Liquid UI evaluates Inigo Quilez's quadratic polynomial smooth minimum:

```glsl
float smin(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}
```

### Parameter Breakdown
- $d_1, d_2$: The signed distance fields of Shape 1 and Shape 2.
- $k$: The smoothing radius (governed by the `merge` property in `LiquidMaterial` or the `merge` prop on `<LiquidBlob>`).
- $h$: The interpolation factor ($0.0 \le h \le 1.0$) defining the blend transition window.
- The quadratic term $-k \cdot h \cdot (1.0 - h)$ subtracts distance, pulling the surface outward into a fluid meniscus bridge between the two shapes.

---

## Application in Liquid UI Components

### 1. LiquidBlob
`<LiquidBlob>` configures all its child shapes (`<LiquidBlobShape>`) with identical material properties and applies the parent `merge` rate uniform. In the shader, distances from all child shapes are chained through `smin`:
$$d_{\text{merged}} = \text{smin}\big(\dots \text{smin}(d_1, d_2, k), d_3, k\dots\big)$$

### 2. LiquidDock
Adjacent `<LiquidDockItem>` elements expand during proximity magnification. As their borders approach each other, their shared `merge` setting causes neighboring dock items to organically coalesce.

---

## Next Steps

- Explore the engine coordinator in **[LiquidEngine Internals](advanced/engine.md)**.
- Read about diagnostics in **[Diagnostics & Debugging](advanced/debugging.md)**.
