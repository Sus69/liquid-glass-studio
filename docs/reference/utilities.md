---
title: Utilities Reference
description: Complete reference for material resolution, math helpers, GPU detection, and texture utilities.
page_type: reference
status: published
---

# Utilities Reference

Liquid UI provides standalone utility functions for material computation, blur partitioning, GPU capability detection, and texture uploads.

```ts
import {
  resolveMaterial,
  blurGroupKey,
  resolvePreset,
  cloneMaterial,
  detectWebGPU,
  springSettled,
  updateVideoTexture,
  gpuUpdateVideoTexture,
} from 'liquid-ui';
```

---

## 1. Material Resolution Utilities

### `resolveMaterial(glass?: LiquidGlassInput): LiquidMaterial`
Merges an input preset name or partial override with the default base material (`soft`).
```ts
// Resolves preset string:
const frostedMat = resolveMaterial('frosted');

// Merges partial override over default:
const customMat = resolveMaterial({ refraction: 1.45, blur: 24 });
```

### `blurGroupKey(blur: number): number`
Partitions an arbitrary continuous blur radius into a discrete power-of-two bucket:
$$\text{blurGroupKey}(\text{blur}) \in \{0, 1, 2, 4, 8, 16, 32, 64\}$$
Shapes sharing the same key reuse an identical GPU blur pass.

### `resolvePreset(name: LiquidPresetName): LiquidMaterial`
Retrieves a fresh, deep copy of a built-in preset (`soft`, `clear`, `frosted`, `dark`, `strong`).

### `cloneMaterial(material: LiquidMaterial): LiquidMaterial`
Creates an independent deep clone of a `LiquidMaterial` object, cloning nested structures like `tint` and `shadowOffset`.

---

## 2. Mathematics & Physics Helpers

### `springSettled(speed, position, target, eps = 0.05): boolean`
Evaluates whether a moving spring has come to rest within a given floating-point epsilon:
```ts
const isSettled = springSettled(
  pointerSpring.speed,
  pointerSpring.value,
  { x: targetX, y: targetY },
  0.05
);
```

### `computeGaussianKernelByRadius(radius: number, sigma?: number): Float32Array`
Calculates a 1D normalized Gaussian convolution kernel array for shader blur passes:
$$G(x) = \frac{1}{\sqrt{2\pi}\sigma} \exp\left(-\frac{x^2}{2\sigma^2}\right)$$
Used by the engine to construct separable horizontal and vertical blur weights.

---

## 3. GPU Hardware Detection

### `detectWebGPU(): Promise<WebGPUDetectResult>`
Tests whether the client environment supports WebGPU:
```ts
export interface WebGPUDetectResult {
  supported: boolean;
  adapter?: GPUAdapter;
  device?: GPUDevice;
  limits?: GPUSupportedLimits;
  reason?: string;
}
```
If `navigator.gpu` is missing, blocked by enterprise policy, or rejected by `requestAdapter()`, `supported` is `false` with a descriptive `reason`.

---

## 4. WebGL2 Texture Utilities

Exported for advanced consumers building custom render passes:

```ts
import {
  loadTextureFromURL,
  updateVideoTexture,
  createEmptyTexture,
} from 'liquid-ui';
```

- **`loadTextureFromURL(gl, url)`**: Loads an image asynchronously, setting `CLAMP_TO_EDGE` and `LINEAR` filtering.
- **`updateVideoTexture(gl, texture, video)`**: Copies the current frame of an `HTMLVideoElement` into an active WebGL texture via `gl.texSubImage2D`.
- **`createEmptyTexture(gl, width, height)`**: Allocates an unpopulated `RGBA` framebuffer texture.

---

## 5. WebGPU Texture Utilities

```ts
import {
  gpuLoadTextureFromURL,
  gpuUpdateVideoTexture,
  gpuCreateEmptyTexture,
} from 'liquid-ui';
```

- **`gpuLoadTextureFromURL(device, url)`**: Fetches an image, decodes it via `createImageBitmap`, and transfers it to a `GPUTexture` via `device.queue.copyExternalImageToTexture`.
- **`gpuUpdateVideoTexture(device, texture, video)`**: Asynchronously uploads the current frame of an `HTMLVideoElement` into a WebGPU texture without stalling the main thread.
- **`gpuCreateEmptyTexture(device, width, height, format)`**: Creates a GPU texture with `TEXTURE_BINDING` and `RENDER_ATTACHMENT` usage flags.

---

## Next Steps

- Consult contributing instructions in **[Contributing Guidelines](development/contributing.md)**.
- Read about local project configuration in **[Development Setup](development/setup.md)**.
