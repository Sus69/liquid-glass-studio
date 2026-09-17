# LIQUID UI — INTERNAL ARCHITECTURE AUDIT

> **Authoritative Phase 6 Deliverable**  
> Complete technical forensics and architectural documentation of LiquidEngine, multi-pass pipelines, and GPU backends.  
> Date: 2026-09-17  
> Status: Canonical Architecture Reference

---

## 1. Engine & Renderer Module Map

```
packages/liquid-ui/src/engine/
├── LiquidEngine.ts               Central engine coordinator (canvas, lifecycle, scheduler, textures)
├── shapes.ts                     ShapeRegistry (MAX_SHAPES=48, std140 Float32Array packer)
├── scheduler.ts                  Dirty-tracking render-on-demand animation loop
├── gpuDetect.ts                  Asynchronous single-flight WebGPU capability probe
├── interaction.ts                Physics springs: ScalarSpring, PointerSpring
├── backends/
│   ├── webgl/
│   │   ├── MultiPassRenderer.ts  WebGL2 multi-pass engine (RGBA16F framebuffers, texture ping-pong)
│   │   └── textures.ts           WebGL2 texture creation, URL loading, video updates
│   └── webgpu/
│       ├── GPUMultiPassRenderer.ts WebGPU multi-pass engine (RenderPipelines, BindGroups, UniformBuffers)
│       └── textures.ts           WebGPU texture creation, URL loading, video updates
├── shaders/                      GLSL ES 3.00 Shader Suite
│   ├── vertex.glsl               Fullscreen quad vertex shader
│   ├── fragment-bg.glsl          Pass 1: Backdrop texture rendering & transparent canvas clear
│   ├── fragment-bg-vblur.glsl    Pass 2: 1D Vertical Gaussian blur
│   ├── fragment-bg-hblur.glsl    Pass 3: 1D Horizontal Gaussian blur
│   ├── fragment-main.glsl        Pass 4: Ray-marched SDF refraction, dispersion, glare, Fresnel
│   └── lib/                      Shader Includes (inlined via vite-plugin-glsl)
│       ├── sdf.glsl              SDF shape distance formulas (smin, superellipse, half-sizes)
│       ├── math.glsl             Matrix rotations, ray intersection, surface normal gradients
│       └── color.glsl            LCH and sRGB color space conversions
└── shaders-wgsl/                 WGSL (WebGPU) Shader Suite
    ├── vertex.wgsl               Fullscreen quad vertex shader
    ├── fragment-bg.wgsl          Pass 1 in WGSL
    ├── fragment-bg-vblur.wgsl    Pass 2 in WGSL
    ├── fragment-bg-hblur.wgsl    Pass 3 in WGSL
    └── fragment-main.wgsl        Pass 4 in WGSL (mirrors GLSL math 1:1)
```

---

## 2. The 4-Pass Rendering Pipeline

Both WebGL2 and WebGPU execute an identical 4-pass render pipeline:

| Pass | Target Framebuffer | Format | Inputs | Output / Purpose |
|---|---|---|---|---|
| **1. `bgPass`** | `fbBg` | RGBA16F (Float) | Backdrop texture (`u_bgTexture`) or procedural grid | Renders the backdrop source texture. In `dom` mode, clears with premultiplied alpha 0. |
| **2. `vBlur`** | `fbBlurV` | RGBA16F (Float) | `fbBg.texture`, 1D Gaussian kernel weights (`u_blurWeights`)| Vertical 1D Gaussian convolution. |
| **3. `hBlur`** | `fbBlurH` | RGBA16F (Float) | `fbBlurV.texture`, 1D Gaussian kernel weights | Horizontal 1D Gaussian convolution. Produces final diffused backdrop texture. |
| **4. `mainPass`**| Default Canvas Framebuffer| Screen Format | `fbBg.texture`, `fbBlurH.texture`, Shape Uniform Arrays | Evaluates 3D SDF geometry, ray-marched refractions, dispersion, Fresnel rims, specular glare, and ambient drop shadows. |

---

## 3. Coordinate Systems & Normalization Forensics

Three distinct coordinate spaces must align pixel-perfectly:

1. **DOM CSS Coordinates**:
   - `(0, 0)` is top-left of the `<LiquidProvider>` container in CSS pixels.
   - Centers: $x = \text{rect.left} - \text{root.left} + w/2$, $y = \text{rect.top} - \text{root.top} + h/2$.
   - Half-extents: `halfWidth = w / 2`, `halfHeight = h / 2`.
2. **WebGL2 Coordinates**:
   - Bottom-up coordinate origin where $(0, 0)$ is bottom-left.
   - Handled centrally in shader header: `gl_FragCoord.y` is compared against flipped centers:
     `vec2 center = vec2(A.x * u_dpr, u_resolution.y - A.y * u_dpr);`
3. **WebGPU Coordinates**:
   - Top-down coordinate origin where $(0, 0)$ is top-left.
   - Handled at WGSL entry point: `let top_down_frag_coord = vec2f(input.frag_coord.x, input.frag_coord.y);`
4. **Normalized Distance Metric**:
   - SDF formulas divide screen-space coordinates by viewport height (`u_resolution.y`).
   - This ensures aspect-ratio independence and consistent curvature across phone, tablet, and 4K displays.

---

## 4. Uniform Buffer Alignment (std140 WGSL & GLSL)

The uniform packing layout was aligned to prevent WebGPU 16-byte stride mismatches:
- In WGSL, an `array<vec4f>` requires 16-byte alignment.
- Header fields consume 36 bytes (9 32-bit floats), which rounds up to 48 bytes (row 4).
- An explicit `_headerPad: vec4f` was inserted into WGSL structs.
- Float32Array packer starts shape rows at index $16$ (byte 64 in WebGL2, byte 48 in WebGPU), ensuring shape 0 data always lands on row 4.

---

## 5. Capacity & Budget Verification

- `MAX_SHAPES = 48`.
- Total uniform payload: 8 `vec4` arrays $\times 48 = 384$ vectors.
- Verified on WebGL2 initialization against `gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)`.
- If an application registers $> 48$ shapes, `ShapeRegistry.pack()` reports `droppedInLastPack > 0` and logs an explicit warning without crashing.

---
*End of Internal Architecture Audit.*
