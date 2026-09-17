---
title: WebGL2 Backend
description: Deep dive into the WebGL2 MultiPassRenderer, GLSL shaders, framebuffer management, and uniform layouts.
page_type: advanced
status: published
---

# WebGL2 Backend

The WebGL2 backend (`MultiPassRenderer`) provides universal hardware-accelerated glass rendering across virtually 100% of modern desktop and mobile browsers.

---

## Required Hardware Extensions

When initializing the WebGL2 context, the engine verifies the following core capabilities:
- **`EXT_color_buffer_float`**: Enables rendering into 16-bit floating-point textures (`gl.RGBA16F`).
- **`OES_texture_half_float_linear`**: Enables hardware linear filtering for half-float textures during blur sampling.
- **`MAX_FRAGMENT_UNIFORM_VECTORS`**: The engine queries the hardware vector limit to guarantee that all 48 packed shape arrays (384 `vec4` vectors) fit comfortably into shader memory.

---

## Shader Architecture & Compilation

Shaders are written in GLSL ES 3.00 (`#version 300 es`). Modular shader chunks are inlined at build time using `vite-plugin-glsl`:

```
shaders/
├── vertex.glsl            Fullscreen quad coordinates (-1 to 1)
├── fragment-bg.glsl       Background texture & clear pass
├── fragment-bg-vblur.glsl Vertical Gaussian convolution
├── fragment-bg-hblur.glsl Horizontal Gaussian convolution
├── fragment-main.glsl     Final SDF composition & optics
└── lib/
    ├── sdf.glsl           Superellipse & smin distance formulas
    ├── math.glsl          Surface normals, ray intersection, matrices
    └── color.glsl         LCH and sRGB conversions
```

---

## Coordinate System: The Central Y-Flip

WebGL uses a **bottom-up** coordinate system where $(0, 0)$ is the bottom-left corner of the viewport, whereas the browser DOM uses a **top-down** coordinate system where $(0, 0)$ is the top-left corner.

Rather than flipping coordinates inside dozens of component files or per-frame JS loops, Liquid UI handles the coordinate flip centrally in the GLSL shader header:

```glsl
// In shaders/lib/sdf.glsl
vec2 center = vec2(A.x * u_dpr, u_resolution.y - A.y * u_dpr);
```

This single transformation maps DOM bounding rects onto WebGL fragment coordinates with zero runtime CPU overhead.

---

## Uniform Array Layout

In WebGL2, shape uniforms are uploaded as 8 separate uniform arrays of `vec4`:

```glsl
uniform vec4 u_shapesA[48];  // center.xy, halfSize.xy
uniform vec4 u_shapesB[48];  // radius, roundness, scale, offsetX
uniform vec4 u_shapesC[48];  // offsetY, blurEdge, shadowExpand, shadowFactor
uniform vec4 u_shapeM0[48];  // thickness, refraction, refractionDistance, dispersion
uniform vec4 u_shapeM1[48];  // fresnel, fresnelRange, fresnelHardness, glare
uniform vec4 u_shapeM2[48];  // glareRange, glareHardness, glareConvergence, glareOppositeFactor
uniform vec4 u_shapeM3[48];  // glareAngle, shadowPosX, shadowPosY, mergeRate
uniform vec4 u_shapeTint[48];// tint RGBA
```

---

## Next Steps

- Compare with modern WebGPU pipelines in **[WebGPU Backend](advanced/webgpu.md)**.
- Understand distance metrics in **[SDF Shapes & Squircles](advanced/sdf-shapes.md)**.
