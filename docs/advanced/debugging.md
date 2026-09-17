---
title: Diagnostics & Debugging
description: Inspecting GPU draw calls, automated pixel readback testing, and resolving rendering anomalies.
page_type: advanced
status: published
---

# Diagnostics & Debugging

Liquid UI provides dedicated diagnostics handles and debugging flags to inspect internal engine state, verify pixel color outputs, and troubleshoot rendering issues.

---

## The Global Debug Handle: `window.__LIQUID_UI__`

In browser development environments, `<LiquidProvider>` automatically exposes a debugging handle on the `window` object:

```javascript
// In your browser console:
console.log(window.__LIQUID_UI__);

// Inspect active shapes and uniform values:
console.log(window.__LIQUID_UI__.registry.packed);

// Check if any shapes were dropped due to capacity limits:
console.log(window.__LIQUID_UI__.registry.droppedInLastPack);

// Inspect active backend:
console.log(window.__LIQUID_UI__.engine.backend);
```

> [!NOTE]
> `window.__LIQUID_UI__` is automatically cleaned up when `<LiquidProvider>` unmounts.

---

## Automated Pixel Readback Testing

In headless CI environments or visual regression tests, you may need to read rendered pixels back from the canvas using `gl.readPixels()`. 

By default, WebGL clears drawing buffers after compositing to save memory. Set `debugPreserveDrawingBuffer={true}` on `<LiquidProvider>` to retain buffer contents:

```tsx
<LiquidProvider debugPreserveDrawingBuffer={true}>
  <App />
</LiquidProvider>
```

### Example: Probing Canvas Alpha
```javascript
const canvas = document.querySelector('.liquid-ui-engine-canvas');
const gl = canvas.getContext('webgl2');
const pixels = new Uint8Array(4);

// Sample pixel at center:
gl.readPixels(canvas.width / 2, canvas.height / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
console.log(`R:${pixels[0]} G:${pixels[1]} B:${pixels[2]} A:${pixels[3]}`);
```

---

## Common Debugging Scenarios

### 1. Stale Shader Modules in Dev Server
- **Symptom**: You edited a shader or updated a uniform struct, but the browser throws a WebGPU validation error or renders glitched colors.
- **Cause**: Vite caches transformed GLSL and WGSL modules in `.vite/deps`.
- **Fix**: Stop the dev server, delete the cache, and restart:
  ```bash
  rm -rf node_modules/.vite
  pnpm dev
  ```

### 2. WebGPU Uncaptured Error Logs
- **Symptom**: WebGPU canvas goes black, and console displays an uncaptured error.
- **Cause**: A buffer size or alignment mismatch occurred in the uniform layout.
- **Diagnosis**: Liquid UI logs detailed device loss and uncaptured error objects automatically. Check the console for the exact byte offset and struct alignment requirement.

---

## Next Steps

- Consult the **[Troubleshooting & FAQ](development/troubleshooting.md)** for developer issues.
- Check the **[Public API Inventory](reference/api.md)** for exported diagnostic utilities.
