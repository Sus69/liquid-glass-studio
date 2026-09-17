---
title: Signed Distance Fields & Shapes
description: How Liquid UI uses mathematical Signed Distance Fields (SDF) and superellipses to render smooth glass geometry.
page_type: concept
status: published
---

# Signed Distance Fields & Shapes

Unlike traditional WebGL libraries that construct shapes out of thousands of triangle meshes, Liquid UI renders glass geometry analytically using **Signed Distance Fields (SDF)**.

An SDF is a mathematical function that takes any pixel coordinate $\vec{p} = (x, y)$ and returns the exact Euclidean distance to the nearest boundary of the shape:
- $\text{SDF}(\vec{p}) < 0$: Pixel is **inside** the glass surface.
- $\text{SDF}(\vec{p}) = 0$: Pixel is on the **exact edge**.
- $\text{SDF}(\vec{p}) > 0$: Pixel is **outside** in empty space.

---

## 1. Superellipse Geometry (Lamé Curves)

Standard CSS `border-radius` produces circular arcs connected to straight lines. At the transition point between the circle and the line, the second derivative of curvature ($C^2$) drops discontinuously to zero, creating visible "pinching" or harsh corners.

Liquid UI uses **Lamé superellipses** to produce continuous, organic squircles identical to Apple design aesthetics:
$$\left|\frac{x}{a}\right|^n + \left|\frac{y}{b}\right|^n = 1$$

```
   n = 2.0 (Circle / Ellipse)         n = 5.0 (Apple iOS Squircle)
          .---.                               .-------.
        /       \                            /         \
       |    +    |                          |     +     |
        \       /                            \         /
          '---'                               '-------'
```

### Squircle Exponent Tuning (`roundness`)
- **`roundness = 2.0`**: Pure geometric circle or ellipse.
- **`roundness = 5.0`**: Standard iOS squircle with smooth curvature transitions.
- **`roundness = 8.0 - 10.0`**: Crisp chamfered rectangle with tight, modern rounded corners.

---

## 2. Computing Surface Normals for Optical Refraction

To bend light rays realistically according to Snell's law, the shader must calculate the **surface normal** $\vec{N}$ at every pixel. Because the geometry is defined as an analytical SDF, the normal is simply the **gradient of the distance function**:

$$\vec{N} = \frac{\nabla \text{SDF}(\vec{p})}{\|\nabla \text{SDF}(\vec{p})\|} = \frac{\left(\frac{\partial \text{SDF}}{\partial x}, \frac{\partial \text{SDF}}{\partial y}\right)}{\sqrt{\left(\frac{\partial \text{SDF}}{\partial x}\right)^2 + \left(\frac{\partial \text{SDF}}{\partial y}\right)^2}}$$

In the fragment shader, this gradient is evaluated across finite differences:
```glsl
vec2 eps = vec2(1.0, 0.0);
vec2 normal = normalize(vec2(
    sdf(p + eps.xy) - sdf(p - eps.xy),
    sdf(p + eps.yx) - sdf(p - eps.yx)
));
```

This yields infinite geometric precision without polygon stepping or edge aliasing.

---

## 3. Shape Merging & Organic Blobs

Because all shapes are evaluated as scalar distance fields, combining two shapes does not require complex CSG (Constructive Solid Geometry) boolean polygon operations.

Instead, Liquid UI applies a **polynomial smooth-minimum function**:

$$smin(d_1, d_2, k) = -\frac{\ln\left(\exp(-k \cdot d_1) + \exp(-k \cdot d_2)\right)}{k}$$

When two liquid surfaces approach each other, their distance fields smoothly merge, causing them to bridge like molten glass or liquid mercury before snapping together. This is exposed directly in `<LiquidBlob>`!

---

## Next Steps

- Understand material properties in **[Material Architecture](core-concepts/materials.md)**.
- Explore presets in **[Material Presets](core-concepts/presets.md)**.
