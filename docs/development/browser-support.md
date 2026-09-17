---
title: Browser & Platform Compatibility
description: Cross-browser support matrix, GPU hardware acceleration tiers, and CSS fallback degradation.
page_type: guide
status: published
---

# Browser & Platform Compatibility

Liquid UI is built to run everywhere—from bleeding-edge WebGPU-enabled desktop browsers to low-power mobile devices and server-rendered environments.

---

## 1. Compatibility Matrix

| Platform / Browser | Primary Backend | Acceleration Tier | Minimum Version |
|---|---|---|---|
| **Google Chrome / Chromium** | **WebGPU** | Hardware Accelerated | Chrome 113+ (WebGPU), Chrome 56+ (WebGL2) |
| **Microsoft Edge** | **WebGPU** | Hardware Accelerated | Edge 113+ (WebGPU), Edge 79+ (WebGL2) |
| **Apple Safari (macOS)** | **WebGL2 / WebGPU** | Hardware Accelerated | Safari 15+ (WebGL2), Safari 18+ (WebGPU experimental) |
| **Mozilla Firefox** | **WebGL2** | Hardware Accelerated | Firefox 51+ (WebGL2), WebGPU in nightly |
| **Mobile Safari (iOS / iPadOS)** | **WebGL2** | Hardware Accelerated | iOS 15+ |
| **Android Chrome** | **WebGPU / WebGL2** | Hardware Accelerated | Android 12+ (WebGPU on supported hardware) |
| **Node.js / Next.js SSR** | **CSS Fallback** | Universal Graceful Degradation | Node 16+ |
| **Headless / Blocked GPU** | **CSS Fallback** | Universal Graceful Degradation | All Browsers |

---

## 2. Automatic Three-Tier Backend Fallback

Liquid UI performs automated capability sniffing at runtime (`engine/gpuDetect.ts`):

```
                        navigator.gpu available?
                               │
               ┌───────────────┴───────────────┐
               ▼ YES                           ▼ NO
    requestAdapter() succeeds?        WebGL2RenderingContext?
               │                               │
       ┌───────┴───────┐               ┌───────┴───────┐
       ▼ YES           ▼ NO            ▼ YES           ▼ NO
    [WebGPU]        [WebGL2]        [WebGL2]        [CSS Fallback]
```

1. **WebGPU (Tier 1)**: Native WGSL compute and fragment shaders, 16-byte uniform alignment, zero-copy video textures.
2. **WebGL2 (Tier 2)**: Universal GLSL 3.0 ES shaders, power-of-two blur groupings, 8-vec4 uniform packing. Supported on virtually all consumer hardware made since 2016.
3. **CSS Fallback (Tier 3)**: Pure CSS `backdrop-filter: blur(...)` with styled borders and shadows. Activates automatically if GPU contexts are blocked or fail to initialize.

---

## 3. Server-Side Rendering (SSR) Guarantees

Liquid UI is 100% SSR-safe and works out-of-the-box with **Next.js (App & Pages Router)**, **Remix**, **Astro**, and **Vite SSR**:

- All DOM accesses and WebGL initializations are deferred to React `useEffect` hooks.
- During server-side HTML rendering (`typeof window === 'undefined'`), components render standard DOM containers with semantic HTML attributes and fallback styles.
- Zero hydration mismatches occur because initial layout structures are identical between server and client.

---

## 4. Forcing a Specific Backend for Testing

You can override automatic backend detection using the `backend` prop on `<LiquidProvider>`:

```tsx
// Force WebGL2 even on browsers with WebGPU support:
<LiquidProvider backend="webgl">
  <App />
</LiquidProvider>

// Force CSS fallback to test degraded appearance:
<LiquidProvider backdropMode="css">
  <App />
</LiquidProvider>
```

---

## Next Steps

- Explore the complete API Reference in **[Component API](reference/api.md)**.
- Review type definitions in **[TypeScript Types](reference/types.md)**.
