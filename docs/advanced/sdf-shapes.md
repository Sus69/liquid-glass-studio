---
title: SDF Shapes & Squircles
description: Superellipse signed distance field formulas, surface normal gradient evaluations, and normalized units.
page_type: advanced
status: published
---

# SDF Shapes & Squircles

Liquid UI does not evaluate shapes using polygon meshes or 2D canvas paths. Instead, all geometry is represented mathematically through **Signed Distance Fields (SDF)** evaluated in fragment shaders.

---

## What is a Signed Distance Field?

An SDF is a mathematical function $f(\vec{p})$ that returns the shortest distance from any point $\vec{p}$ to the boundary of a shape:
- $f(\vec{p}) < 0$: Inside the shape.
- $f(\vec{p}) = 0$: Exactly on the shape boundary.
- $f(\vec{p}) > 0$: Outside the shape.

Because distance can be calculated continuously at every pixel, SDFs produce **infinitely sharp, anti-aliased edges** at any resolution or display scaling factor without geometric tessellation.

---

## The Superellipse Squircle Metric

Standard rounded rectangles in CSS use circular corner fillets ($n=2.0$). At the transition where the straight line meets the circular arc, there is an abrupt second-derivative curvature discontinuity. This is why standard CSS rounded corners can appear "pinched" or mechanical.

Liquid UI uses Gabriel Lamé's **superellipse equation**:
$$\left|\frac{x}{a}\right|^n + \left|\frac{y}{b}\right|^n = 1$$

In `shaders/lib/sdf.glsl`:
- When exponent $n = 2.0$, the shape becomes a standard circular fillet.
- When exponent $n = 5.0$, the curvature transitions smoothly from the flat edge into the corner, producing the organic squircle contour favored in modern industrial design.

---

## Evaluating Surface Normals ($\vec{N}$)

To simulate 3D optical refraction and specular lighting, the shader needs to know the 3D surface tilt (normal vector) at every pixel across the beveled edge.

By computing the numerical gradient of the SDF in screen space using forward finite differences:
$$\nabla d = \left( \frac{\partial d}{\partial x}, \frac{\partial d}{\partial y} \right) \approx \left( \frac{d(x+\epsilon, y) - d(x-\epsilon, y)}{2\epsilon}, \frac{d(x, y+\epsilon) - d(x, y-\epsilon)}{2\epsilon} \right)$$

The 2D surface normal is obtained by normalizing the gradient:
$$\vec{N}_{xy} = \text{normalize}(\nabla d)$$

The Z component is derived from the edge thickness bevel profile:
$$N_z = \sqrt{1.0 - \|\vec{N}_{xy}\|^2 \cdot \text{profile}}$$

This normal vector $\vec{N} = (N_x, N_y, N_z)$ is what bends the refracted light rays and reflects overhead glare.

---

## Half-Extents & Normalized Coordinate Space

### 1. Half-Extents
The engine passes shape dimensions as **half-extents** (`halfWidth = width / 2`, `halfHeight = height / 2`). The distance function operates relative to the shape center:
$$\vec{p}_{\text{local}} = |\vec{p} - \text{center}| - \text{halfSize}$$

### 2. Viewport Height Normalization
To ensure that refraction and glare behave identically across varied window aspect ratios and mobile viewports, all coordinate math is normalized by the viewport height:
$$\vec{p}_{\text{norm}} = \frac{\vec{p}}{\text{u\_resolution.y}}$$

When calculating pixel-space offsets, coordinates are converted back by multiplying with `u_resolution1x.y`.

---

## Next Steps

- See how surface normals drive lighting in **[Optical Physics & Shader Mathematics](advanced/optical-effects.md)**.
- Learn how multiple shapes merge in **[Shape Merging Mechanics](advanced/shape-merging.md)**.
