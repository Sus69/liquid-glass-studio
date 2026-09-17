---
title: 4-Pass Rendering Pipeline
description: Deep architectural walkthrough of bgPass, vBlur, hBlur, and mainPass in Liquid UI.
page_type: advanced
status: published
---

# 4-Pass Rendering Pipeline

To achieve physically realistic optical refraction and specular lighting without sluggish frame rates, Liquid UI uses a multipass offscreen rendering pipeline. The pipeline runs identically across both WebGL2 (`MultiPassRenderer`) and WebGPU (`GPUMultiPassRenderer`).

```
Frame Start
    │
    ▼
[Pass 1: bgPass] ──────► fbBg (RGBA16F)
    │                     - Draws backdrop texture OR
    │                     - Clears transparent premultiplied alpha (DOM mode)
    ▼
[Pass 2: vBlur]  ──────► fbBlurV (RGBA16F)
    │                     - Samples fbBg with 1D Vertical Gaussian kernel
    ▼
[Pass 3: hBlur]  ──────► fbBlurH (RGBA16F)
    │                     - Samples fbBlurV with 1D Horizontal Gaussian kernel
    │                     - Produces final diffused backdrop texture
    ▼
[Pass 4: mainPass] ────► Screen Canvas
                          - Evaluates SDF shapes & superellipses
                          - Ray-marches refraction from fbBg / fbBlurH
                          - Computes chromatic dispersion (RGB split)
                          - Adds Fresnel edge highlights & specular glare
                          - Blends ambient drop shadows
```

---

## Pass Breakdown

### Pass 1: Background (`bgPass`)
- **Target**: `fbBg` (High Dynamic Range float buffer, `RGBA16F`).
- **Function**:
  - In `textured` mode: Renders the uploaded background image, looping video frame, or procedural grid to fill the viewport quad.
  - In `dom` mode: Clears the buffer to transparent black (`rgba(0, 0, 0, 0)`), ensuring that areas outside shapes remain 100% transparent to the underlying HTML page.

### Passes 2 & 3: Separable Gaussian Blur (`vBlur` & `hBlur`)
A 2D Gaussian blur with radius $R$ normally requires $O(R^2)$ texture fetches per pixel. Liquid UI decomposes the Gaussian convolution into two orthogonal 1D passes:
1. `vBlur`: Convolves vertically: $O(R)$ samples.
2. `hBlur`: Convolves horizontally: $O(R)$ samples.

Total complexity drops from $O(R^2)$ to $O(2R)$, allowing heavy frosted glass diffusion ($R=16\text{px}$) to run in sub-millisecond draw calls on mobile hardware.

#### Dynamic Kernel Weights
Gaussian weights are computed on the CPU using `computeGaussianKernelByRadius(radius)`:
$$\sigma = \frac{R}{3.0}, \quad W_i = \exp\left(-\frac{i^2}{2\sigma^2}\right)$$
The weights are normalized and uploaded to the `u_blurWeights` array uniform.

### Pass 4: The Main Composition Pass (`mainPass`)
The final pass evaluates all 48 shapes in a single fragment shader execution:
1. Calculates distances $d$ for all active shapes using superellipse SDF formulas.
2. Computes the surface normal vector $\vec{N} = \text{normalize}(\nabla d)$.
3. Computes refracted texture UV coordinates based on Snell's law:
   $$\text{UV}_{\text{refracted}} = \text{UV} + \vec{N} \cdot \text{refractionDistance} \cdot (\text{refraction} - 1.0)$$
4. Samples chromatic dispersion offsets for Red, Green, and Blue channels.
5. Computes Fresnel rim brightness and directional specular glare bands.
6. Blends ambient drop shadows underneath each shape.

---

## High Dynamic Range (RGBA16F)

Intermediate framebuffers use 16-bit half-float precision (`RGBA16F` in WebGL2, `rgba16float` in WebGPU). Standard 8-bit buffers clamp color values at $1.0$, which crushes intense glare highlights and causes visible color banding in blur gradients. Float buffers preserve high dynamic range lighting across all four passes.

---

## Next Steps

- Explore the WebGL2 implementation in **[WebGL2 Backend](advanced/webgl2.md)**.
- Explore the WebGPU implementation in **[WebGPU Backend](advanced/webgpu.md)**.
