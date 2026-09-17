---
title: Material Architecture & Optical Physics
description: Core concepts of optical materials in Liquid UI, covering refraction, dispersion, fresnel, and glare.
page_type: concept
status: published
---

# Material Architecture & Optical Physics

Liquid UI models glass as a physical optical medium rather than a simple semi-transparent CSS color. When light passes through a liquid surface, it undergoes real-time physical simulation on your GPU.

```
       Incident Light Ray (I)
                \
                 \
   Fresnel Edge ──\──────── Specular Glare Band
    Highlight      \      /
             ───────▼────/────── Glass Boundary
                    │   /
                    │  /  Refraction (Snell's Law)
                    │ /
             ───────▼▼▼───────── Chromatic Dispersion
                   / | \         (R / G / B Split)
                  R  G  B
                     │
              Backdrop Pixel
```

---

## 1. The Three Optical Parameter Groups

A complete `LiquidMaterial` is governed by 22 parameters partitioned into three physical categories:

### Group A: Refraction, Dispersion & Blur (Backdrop Transmission)
- **`thickness`**: Physical edge bevel depth ($0 - 50\text{px}$). Controls the area over which light rays bend.
- **`refraction`**: Index of refraction ($1.0 - 2.0$). Controls ray deflection angle according to Snell's law.
- **`dispersion`**: Wavelength-dependent chromatic dispersion ($0.0 - 5.0$). Splits light into red, green, and blue spectral rays.
- **`blur`**: Gaussian/Kawase diffusion radius ($0 - 64\text{px}$) applied to light traveling through the body of the glass.
- **`tint`**: RGBA color veil filtered across the transmitted rays.

### Group B: Surface Lighting, Glare & Fresnel (Reflection)
- **`fresnel` & `fresnelHardness`**: Edge luminance governed by Schlick's approximation. Produces the crisp white outline characteristic of real glass panels.
- **`glare` & `glareAngle`**: Rotatable specular reflection bands simulating an overhead directional light source.
- **`glareConvergence` & `glareOppositeFactor`**: Controls glare focal tightness and secondary reflection on opposite bevels.

### Group C: Geometry, Shadows & Morphing
- **`radius`**: Corner curvature in CSS pixels.
- **`roundness`**: Lamé superellipse exponent ($2 = \text{ellipse}$, $5 = \text{iOS squircle}$).
- **`shadow` & `shadowExpand`**: Ambient occlusion drop shadow spread behind the glass volume.
- **`merge`**: Polynomial smooth-minimum blending factor for organic blob clustering.

---

## 2. Uniform Transposition Pipeline

In the rendering pipeline, high-level JavaScript objects are converted into low-level GPU uniform memory:

```ts
import { resolveMaterial, materialToShapeUniforms } from 'liquid-ui';

// 1. Resolve preset name or partial override
const material = resolveMaterial('frosted');

// 2. Transpose into 8 vec4 shader uniforms
const uniforms = materialToShapeUniforms(material, window.devicePixelRatio);
```

Each surface's 22 parameters are packed into an 8-row uniform matrix (`u_shapes_A` through `u_shapes_H`), allowing the shader to evaluate up to 48 distinct glass surfaces in a single GPU draw call.

---

## Next Steps

- Explore tactile spring motion in **[Interaction Physics](core-concepts/interaction.md)**.
- Learn about backdrop sampling in **[Backdrop Architecture](core-concepts/backdrops.md)**.
