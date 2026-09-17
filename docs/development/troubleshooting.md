---
title: Troubleshooting Guide
description: Diagnosing and resolving common runtime issues, shader compilation errors, and visual anomalies.
page_type: guide
status: published
---

# Troubleshooting Guide

This guide details empirical failure modes, diagnostic techniques, and verified remedies encountered when integrating and operating Liquid UI.

---

## 1. Top Common Issues & Solutions

### Issue A: "Refraction is completely invisible; the glass looks like flat transparency"
- **Root Cause**: Snell's law computes light deflection based on spatial gradients in the background texture. If the background behind the glass is a solid monochrome color (e.g. `#ffffff` or `#1e1e1e`), sampling the background at offset coordinates returns the identical color:
  $$\text{Color}(\vec{uv} + \Delta\vec{uv}) \equiv \text{Color}(\vec{uv})$$
- **Remedy**: Ensure your backdrop has visual texture, photographic imagery, video streams, or high-contrast CSS gradients. Test with `<LiquidCard glass="frosted">` to verify that diffusion veils and specular highlights render properly.

### Issue B: "Buttons look flat or missing borders/styles"
- **Root Cause**: The required CSS stylesheet was not imported at your application root.
- **Remedy**: Ensure you import the styles once in your entry point (`main.tsx` or `_app.tsx`):
  ```tsx
  import 'liquid-ui/styles.css';
  ```

### Issue C: "Warning: Shape registry overflow (max 48 shapes exceeded)"
- **Root Cause**: More than 48 `<LiquidSurface>` components are simultaneously mounted and visible in the DOM. The registry limits shapes to 48 (`MAX_SHAPES = 48`) to guarantee compatibility with mobile fragment uniform vectors.
- **Remedy**: Avoid wrapping repeated list items or table rows in separate liquid surfaces. Wrap the container card in `<LiquidCard>`, and render inner rows as plain HTML DOM elements.

### Issue D: "Stale shader errors or WGSL syntax errors in Vite dev server"
- **Root Cause**: Vite's pre-bundling cache (`.vite/`) occasionally caches raw shader asset transforms.
- **Remedy**: Delete the Vite cache and restart:
  ```bash
  rm -rf node_modules/.vite
  npm run dev
  ```

### Issue E: "Content disappears behind glass / z-index stacking issues"
- **Root Cause**: `<LiquidProvider>` creates a coordinate-aligned canvas at `z-index: 0`. If parent elements create new CSS stacking contexts with `isolation: isolate` or negative z-indices, DOM content may slip behind the canvas.
- **Remedy**: Liquid UI components automatically wrap their children in relative positioning with `z-index: 1`. Ensure custom wrappers do not apply `z-index: -1`.

---

## 2. Diagnostics via Global Debug Handle

In browser development environments, Liquid UI mounts a diagnostic object onto the window:

```js
window.__LIQUID_UI__
```

Open DevTools Console and inspect the runtime state:

```javascript
// Check active backend (webgpu or webgl2)
console.log(window.__LIQUID_UI__.engine.backendType);

// Inspect total registered shapes
console.log(window.__LIQUID_UI__.registry.getAll());

// Check if any shapes were dropped due to capacity limits
console.log(window.__LIQUID_UI__.registry.droppedInLastPack);

// Inspect packed uniform vectors
console.log(window.__LIQUID_UI__.registry.packed);
```

---

## 3. WebGL2 Context Loss Recovery

If the operating system resets the GPU driver (e.g. waking from sleep or switching graphics cards), the WebGL context may be lost:

1. Liquid UI listens for `webglcontextlost` on the canvas.
2. It prevents default browser handling (`event.preventDefault()`).
3. Upon receiving `webglcontextrestored`, `LiquidEngine` automatically reinitializes shaders, buffers, and textures.

---

## Next Steps

- Review accessibility specifications in **[Accessibility](development/accessibility.md)**.
- Verify platform support in **[Browser Support](development/browser-support.md)**.
