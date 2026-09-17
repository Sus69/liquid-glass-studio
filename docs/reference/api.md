---
title: Public API Catalog
description: Complete authoritative catalog of all exported components, hooks, engine classes, and utilities.
page_type: reference
status: published
---

# Public API Catalog

This document is the authoritative index of every public symbol exported by `liquid-ui` via its entry point (`packages/liquid-ui/src/index.ts`).

```tsx
import {
  LiquidProvider,
  LiquidSurface,
  LiquidButton,
  LiquidCard,
  // ...
} from 'liquid-ui';
import 'liquid-ui/styles.css';
```

---

## 1. Components (13 Symbols)

| Symbol | Nature | File | Description |
|---|---|---|---|
| **[LiquidProvider](getting-started/provider.md)** | Component | `components/LiquidProvider.tsx` | Root context and single WebGL2/WebGPU canvas owner. |
| **[LiquidSurface](components/liquid-surface.md)** | Component | `components/LiquidSurface.tsx` | Core polymorphic primitive (`as="div\|button"`) backed by GPU SDF. |
| **[LiquidDiv](components/liquid-div.md)** | Component | `components/LiquidDiv.tsx` | Drop-in glass `<div>` container with squircle geometry. |
| **[LiquidButton](components/liquid-button.md)** | Component | `components/LiquidButton.tsx` | Tactile interactive button with spring compression and hover glare. |
| **[LiquidCard](components/liquid-card.md)** | Component | `components/LiquidCard.tsx` | Surface panel for cards, dashboards, and modal dialogs. |
| **[LiquidPill](components/liquid-pill.md)** | Component | `components/LiquidPill.tsx` | Capsule badge with stadium radius (`radius={999}`). |
| **[LiquidInput](components/liquid-input.md)** | Component | `components/LiquidInput.tsx` | Form text input on a reactive glass base. |
| **[LiquidIconButton](components/liquid-icon-button.md)** | Component | `components/LiquidIconButton.tsx` | Square/circular icon button with mandatory `aria-label`. |
| **[LiquidToggle](components/liquid-toggle.md)** | Component | `components/LiquidToggle.tsx` | Accessible switch (`role="switch"`) with sliding indicator. |
| **[LiquidTooltip](components/liquid-tooltip.md)** | Component | `components/LiquidTooltip.tsx` | Floating glass popover positioned relative to a trigger element. |
| **[LiquidModal](components/liquid-modal.md)** | Component | `components/LiquidModal.tsx` | Accessible dialog with overlay, focus trap, and Escape dismissal. |
| **[LiquidDock](components/liquid-dock.md)** | Component | `components/LiquidDock.tsx` | macOS-style magnification dock bar. |
| **[LiquidBlob](components/liquid-blob.md)** | Component | `components/LiquidBlob.tsx` | Organic metaball container using polynomial smooth-minimum merging. |

---

## 2. React Hooks (3 Symbols)

| Hook | File | Returns | Description |
|---|---|---|---|
| **[useLiquidContext](reference/hooks.md#1-useliquidcontext)** | `context.ts` | `{ engine, ready }` | Accesses the active `LiquidEngine` instance and readiness state. |
| **[useReducedMotion](reference/hooks.md#2-usereducedmotion)** | `hooks/useReducedMotion.ts` | `boolean` | Subscribes to `(prefers-reduced-motion: reduce)` media query. |
| **[useElementBounds](reference/hooks.md#3-useelementbounds)** | `hooks/useElementBounds.ts` | `{ width, height }` | Observes element size and culls off-screen shapes. |

---

## 3. Materials & Presets (6 Symbols)

| Symbol | Nature | File | Description |
|---|---|---|---|
| **[LIQUID_PRESETS](materials/presets.md)** | Constant Record | `materials/presets.ts` | Built-in presets (`soft`, `clear`, `frosted`, `dark`, `strong`). |
| **[resolvePreset](reference/utilities.md#1-resolvepreset)** | Function | `materials/presets.ts` | Retrieves a preset clone by name. |
| **[cloneMaterial](reference/utilities.md#2-clonematerial)** | Function | `materials/presets.ts` | Deep clones a `LiquidMaterial` object. |
| **[resolveMaterial](reference/utilities.md#3-resolvematerial)** | Function | `materials/resolveMaterial.ts` | Merges preset names and partial overrides into a full material. |
| **[blurGroupKey](reference/utilities.md#4-blurgroupkey)** | Function | `materials/resolveMaterial.ts` | Partitions blur radius into power-of-two batches ($1, 2, 4, 8, \dots$). |
| **[materialToShapeUniforms](reference/utilities.md#5-materialtoshapeuniforms)** | Function | `materials/toUniforms.ts` | Packs high-level material into 8 `vec4` shader uniforms. |

---

## 4. Engine & Physics (5 Symbols)

| Symbol | Nature | File | Description |
|---|---|---|---|
| **[LiquidEngine](reference/engine.md#1-liquidengine)** | Class | `engine/LiquidEngine.ts` | Master engine owning canvas, lifecycle, backends, and render loops. |
| **[detectWebGPU](reference/utilities.md#6-detectwebgpu)** | Async Function | `engine/gpuDetect.ts` | Sniffs browser WebGPU adapter support and limits. |
| **[PointerSpring](reference/engine.md#2-pointerspring)** | Class | `engine/interaction.ts` | 2D spring controller with velocity computation. |
| **[ScalarSpring](reference/engine.md#3-scalarspring)** | Class | `engine/interaction.ts` | 1D semi-implicit Euler spring for tactile press depth. |
| **[Scheduler](reference/engine.md#4-scheduler)** | Class | `engine/scheduler.ts` | Render-on-demand requestAnimationFrame loop coordinator. |

---

## 5. Low-Level Renderer & Textures (7 Symbols)

| Symbol | Nature | File | Description |
|---|---|---|---|
| **[MultiPassRenderer](advanced/webgl2.md)** | Class | `engine/backends/webgl/MultiPassRenderer.ts` | WebGL2 ping-pong render pass orchestrator. |
| **[GPUMultiPassRenderer](advanced/webgpu.md)** | Class | `engine/backends/webgpu/GPUMultiPassRenderer.ts` | WebGPU command encoder and render pipeline manager. |
| **[loadTextureFromURL](reference/utilities.md#7-loadtexturefromurl)** | Function | `engine/backends/webgl/textures.ts` | Loads image URL into a WebGLTexture. |
| **[updateVideoTexture](reference/utilities.md#8-updatevideotexture)** | Function | `engine/backends/webgl/textures.ts` | Copies `HTMLVideoElement` frame into WebGLTexture. |
| **[gpuLoadTextureFromURL](reference/utilities.md#9-gpuloadtexturefromurl)** | Async Function | `engine/backends/webgpu/textures.ts` | Loads image URL into a GPUTexture. |
| **[gpuUpdateVideoTexture](reference/utilities.md#10-gpuupdatevideotexture)** | Async Function | `engine/backends/webgpu/textures.ts` | Zero-copy transfer of video frame into GPUTexture. |
| **computeGaussianKernelByRadius** | Function | `engine/LiquidEngine.ts` | Computes 1D normalized Gaussian convolution weights. |

---

## Next Steps

- Explore all interface definitions in **[TypeScript Types](reference/types.md)**.
- Review hook signatures in **[React Hooks Reference](reference/hooks.md)**.
