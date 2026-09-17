---
title: Why Liquid Glass?
description: The optical science, design rationale, and technical necessity behind Liquid UI shaders.
page_type: concept
status: published
---

# Why Liquid Glass?

Over the past decade, user interfaces have evolved from flat minimalism toward rich depth, tactile lighting, and optical material simulation. While modern browsers support CSS `backdrop-filter: blur()`, traditional CSS effects cannot simulate the physical properties of real glass.

Liquid UI was engineered to bridge this gap: rendering genuine optical light refraction, dispersion, and curvature on the GPU without sacrificing web accessibility or layout flexibility.

---

## The Limitations of CSS-Only Glass

Standard CSS glassmorphism is achieved using a combination of semi-transparent backgrounds and `backdrop-filter`:

```css
/* Traditional CSS Glassmorphism */
.css-glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
```

While functional, this approach suffers from four distinct physical limitations:

1. **Zero Optical Thickness**: In CSS, a blurred layer is infinitely thin. It does not possess volume, depth, or beveled edges.
2. **No Refractive Bending**: Real glass bends light rays based on Snell's Law. Straight lines behind a beveled glass edge bend and distort smoothly; CSS blur only diffuses pixels uniformly in place.
3. **No Chromatic Dispersion**: White light consists of varying wavelengths that bend at slightly different angles through glass. High-contrast edges seen through glass display subtle rainbow fringing (chromatic aberration); CSS blur is color-blind.
4. **Static 2D Transforms**: When a user clicks a traditional button, CSS applies an affine transform (`scale(0.96)`). The button simply shrinks as a flat plane rather than fluidly compressing like physical glass.

---

## How Liquid UI Solves This

Liquid UI replaces flat 2D layers with a mathematical representation of curved, physical glass evaluated directly on the GPU:

### 1. Signed Distance Fields (SDF) & Superellipse Curvature
Rather than rendering simple rasterized rectangles, Liquid UI describes every surface as a mathematical Signed Distance Field. This allows shaders to calculate the exact distance from every pixel to the surface boundary with sub-pixel precision.

Furthermore, Liquid UI supports **superellipse curvature** ($n=5.0$), producing continuous mathematical squircles identical to Apple's industrial design, avoiding the abrupt curvature discontinuity found in standard circular CSS `border-radius`.

### 2. Surface Normals & Ray Marching
By computing the mathematical gradient of the SDF ($\vec{N} = \text{normalize}(\nabla d)$), the GPU computes a 3D surface normal vector for every point along the beveled edge. This normal vector drives:
- **Refraction**: Incident light rays are displaced proportionally to the surface thickness and refractive index.
- **Specular Glare**: Directional highlights simulate an overhead light source sweeping across the lens curvature.
- **Fresnel Edge Lighting**: Grazing angles reflect higher intensity light, producing crisp, luminous glass rims.

### 3. Tactile Spring Physics
Interactive elements incorporate damped harmonic oscillators (`ScalarSpring` and `PointerSpring`). When a user presses a `<LiquidButton>`, the press depth deforms the SDF parameter $d$ directly in the shader. The glass visibly bulges and compresses at the edges while text remains perfectly stationary.

---

## When to Use Liquid UI

| Recommended For | Not Recommended For |
|---|---|
| **High-Impact Hero Elements**: Prominent cards, call-to-action buttons, navigation docks, and modal dialogs. | **Dense Data Tables**: Large grids with hundreds of microscopic rows where optical refraction reduces scanability. |
| **Media & Portfolio Applications**: Music players, video editors, creative platforms, and visual dashboards. | **E-Readers & Heavy Text Readers**: High-volume editorial articles where maximum contrast and zero distortion are required. |
| **Tactile Interfaces**: Premium consumer products where fluid touch and hover interactions drive user delight. | **Low-Power IoT Displays**: Embedded hardware without WebGL2 acceleration. |

---

## Next Steps

- Explore the **[Architecture Overview](introduction/architecture.md)** to see how the DOM and GPU pipeline work together.
- Jump to the **[Quick Start Guide](getting-started/quickstart.md)** to add liquid glass to your React app.
