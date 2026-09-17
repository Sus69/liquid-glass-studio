---
title: WebGPU Backend
description: Architecture of the GPUMultiPassRenderer, WGSL shaders, bind groups, and uniform buffer alignment.
page_type: advanced
status: published
---

# WebGPU Backend

The WebGPU backend (`GPUMultiPassRenderer`) provides cutting-edge hardware acceleration using the modern WebGPU standard. It delivers reduced driver overhead, consistent memory layouts, and direct WGSL execution.

---

## Architecture Overview

```
LiquidEngine
    │
    ▼
GPUMultiPassRenderer
    ├── GPUDevice & GPUQueue
    ├── GPUTexture (rgba16float HDR buffers)
    ├── GPUBindGroupLayout & GPUBindGroup (Ping-Pong textures & samplers)
    ├── GPUBuffer (UniformBuffer: 64B header + 384 vec4 rows)
    └── 4x GPURenderPipeline (bg, vblur, hblur, main)
```

---

## 16-Byte Alignment & The `_headerPad` Forensics

Under the WGSL specification, an array of structures or vectors (`array<vec4f, 48>`) must be aligned to a **16-byte boundary**.

In initial versions of the renderer, the scalar header fields (resolution, DPR, shape count, etc.) consumed 36 bytes (9 32-bit floats). When WGSL placed the subsequent shape array into memory, it automatically rounded up the starting offset from byte 36 to the next 16-byte boundary (byte 48).

Because the JavaScript Float32Array packer began writing shape vectors at byte 32, every shape read by the GPU was shifted by one row:
- Shape 0 read garbage header values.
- `u_transparentBg` read corrupted memory, causing DOM mode to render opaque black veils.

### The Fix
To establish 1:1 binary parity between the JavaScript Float32Array packer and the WGSL memory layout, an explicit padding vector `_headerPad: vec4f` was added to the WGSL `Uniforms` struct:

```wgsl
struct Uniforms {
  u_resolution: vec2f,
  u_resolution1x: vec2f,
  u_dpr: f32,
  u_shapeCount: f32,
  u_transparentBg: f32,
  u_bgType: f32,
  u_bgTextureRatio: f32,
  u_bgTextureReady: f32,
  _headerPad: vec4f, // Guarantees array<vec4f> starts cleanly at row 4

  u_shapesA: array<vec4f, 48>,
  u_shapesB: array<vec4f, 48>,
  u_shapesC: array<vec4f, 48>,
  u_shapeM0: array<vec4f, 48>,
  u_shapeM1: array<vec4f, 48>,
  u_shapeM2: array<vec4f, 48>,
  u_shapeM3: array<vec4f, 48>,
  u_shapeTint: array<vec4f, 48>,
};
```

Both the CPU packer and the GPU shader now agree on exact byte offsets, guaranteeing pixel-perfect material fidelity across all platforms.

---

## Device Loss & Error Recovery

WebGPU devices can be lost due to OS power management, driver restarts, or tab freezing. To prevent silent whiteouts:
- **`device.lost` listener**: Logs the loss reason and message loudly to the console.
- **`uncapturederror` listener**: Intercepts shader validation errors and pipeline creation failures.
- **Fallback Trigger**: If a device loss occurs, the engine automatically notifies React context and gracefully falls back to CSS.

---

## Next Steps

- Explore the fallback mechanics in **[CSS Fallback Architecture](advanced/css-fallback.md)**.
- Learn about optical calculations in **[Refraction & Optical Physics](advanced/optical-effects.md)**.
