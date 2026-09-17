---
title: Choosing a Backend
description: Automatic GPU detection, manual backend selection, and fallback behavior across WebGPU, WebGL2, and CSS.
page_type: guide
status: published
---

# Choosing a Backend

Liquid UI includes two hardware-accelerated GPU renderers (WebGPU and WebGL2) and a pure CSS fallback layer. 

By default, the engine automatically selects the best available backend on the user's device. However, you can also force specific backends for development, debugging, or automated testing.

---

## The Auto-Detection Chain

When `<LiquidProvider backend="auto">` (the default) mounts, it executes a single-flight asynchronous detection routine:

```
1. Probe WebGPU
   ├── Check `navigator.gpu` existence
   ├── Request `GPUAdapter`
   └── Check device creation & features
         │
         ├── SUCCESS ────────► Initialize WebGPU (GPUMultiPassRenderer)
         │
         └── FAILURE
               │
               ▼
2. Probe WebGL2
   ├── Check `canvas.getContext('webgl2')`
   ├── Query extensions: OES_texture_half_float, EXT_color_buffer_float
   └── Verify uniform vector budget (MAX_FRAGMENT_UNIFORM_VECTORS)
         │
         ├── SUCCESS ────────► Initialize WebGL2 (MultiPassRenderer)
         │
         └── FAILURE
               │
               ▼
3. Activate CSS Fallback
   └── Set `backend.gpu = false`, apply `.liquid-ui-fallback` classes
```

---

## Forcing a Specific Backend

You can override auto-detection using the `backend` prop on `<LiquidProvider>`:

### WebGPU Only
```tsx
<LiquidProvider backend="webgpu">
  {/* Forces WebGPU. If WebGPU is unsupported on the client, gracefully drops to CSS. */}
</LiquidProvider>
```

### WebGL2 Only
```tsx
<LiquidProvider backend="webgl">
  {/* Forces WebGL2, bypassing WebGPU detection. */}
</LiquidProvider>
```

---

## Comparing Backends

| Feature | WebGPU Backend | WebGL2 Backend | CSS Fallback |
|---|---|---|---|
| **Renderer Class** | `GPUMultiPassRenderer` | `MultiPassRenderer` | `fallback.ts` |
| **Shader Language** | WGSL (`.wgsl`) | GLSL ES 3.00 (`.glsl`) | Pure CSS |
| **Precision** | `rgba16float` | `RGBA16F` (Half-float) | 8-bit sRGB |
| **Browser Support** | Chrome 113+, Edge 113+, Safari 18+ (macOS/iOS) | 99%+ of all modern evergreen browsers | Universal (any browser) |
| **Refraction & Glare** | Full GPU Ray-Marching | Full GPU Ray-Marching | Layered box-shadow approximation |

---

## Common First-Step Mistakes

Here are the four most common beginner setup mistakes and how to fix them:

### 1. Forgetting the `<LiquidProvider>` Wrapper
- **Symptom**: Components render like plain, un-styled transparent HTML boxes without glass borders, reflections, or materials.
- **Cause**: Liquid components require an enclosing `<LiquidProvider>` to register their bounding boxes with the GPU engine.
- **Fix**: Wrap your page or root component with `<LiquidProvider>`.

### 2. Omitting the Stylesheet Import
- **Symptom**: The canvas renders on top of your text, blocking clicks, or components collapse to 0px width.
- **Cause**: The stylesheet contains critical rules for `position: relative`, `pointer-events: none` on the canvas, and focus ring outlines.
- **Fix**: Add `import 'liquid-ui/styles.css'` at the top of your application entry file.

### 3. Solid Background in Textured Mode
- **Symptom**: Glass cards appear completely opaque or invisibly gray in `textured` mode.
- **Cause**: Optical refraction works by bending pixels from the background. If the background texture is solid black or solid white, bending a black pixel yields another black pixel—refraction becomes invisible!
- **Fix**: Use photographic backgrounds, gradients, or the procedural chessboard grid (`{ kind: 'procedural', index: 0 }`).

### 4. Exceeding MAX_SHAPES (48 Surfaces)
- **Symptom**: A very dense page with 50+ glass buttons silently loses glass material on buttons 49 and beyond.
- **Cause**: To guarantee sub-millisecond draw calls across mobile GPUs, Liquid UI allocates fixed uniform vectors for up to 48 concurrent shapes.
- **Fix**: Use standard HTML buttons for dense tabular rows, and reserve Liquid UI for hero cards, controls, and dialogs. You can also inspect `registry.droppedInLastPack` in development.

---

## Next Steps

- Explore all component documentation starting with **[LiquidButton](components/liquid-button.md)**.
- Learn the optical details of thickness, refraction, and glare in **[Materials & Optics](core-concepts/materials.md)**.
