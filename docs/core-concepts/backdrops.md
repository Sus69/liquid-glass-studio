---
title: Backdrop Architecture
description: How Liquid UI captures, samples, and refracts background layers across DOM, textured, and CSS modes.
page_type: concept
status: published
---

# Backdrop Architecture

Liquid glass is fundamentally defined by what lies behind it. Because glass is translucent, its appearance is governed by how light from the background is captured, refracted, and filtered.

Liquid UI provides three distinct backdrop architectures to support diverse performance and aesthetic requirements.

```
┌────────────────────────────────────────────────────────────────────────┐
│ LIQUID UI BACKDROP MODES                                               │
├─────────────────┬───────────────────┬──────────────────────────────────┤
│ Mode            │ Sampling Target   │ Performance Profile              │
├─────────────────┼───────────────────┼──────────────────────────────────┤
│ "textured"      │ GPU Texture       │ 60fps true physical refraction,  │
│                 │ (Image / Video)   │ chromatic dispersion, full specs │
├─────────────────┼───────────────────┼──────────────────────────────────┤
│ "dom" (default) │ Hybrid DOM + WebGL│ Lightweight, zero video overhead,│
│                 │ CSS Backdrop      │ perfect text clarity behind glass│
├─────────────────┼───────────────────┼──────────────────────────────────┤
│ "css"           │ Pure CSS          │ 0% GPU requirement, universal    │
│                 │ backdrop-filter   │ fallback for headless/low-power  │
└─────────────────┴───────────────────┴──────────────────────────────────┘
```

---

## 1. "textured" Mode (Maximum Optical Fidelity)

In `textured` mode, your background image or video is loaded directly into a GPU texture buffer:

```tsx
<LiquidProvider
  backdropMode="textured"
  background={{ kind: 'image', url: '/wallpapers/lake.webp' }}
>
  <App />
</LiquidProvider>
```

- **True Snell's Law Refraction**: The shader samples texture pixels at $(\vec{uv} + \Delta\vec{uv})$, bending light rays around the edges of cards and buttons.
- **Wavelength Dispersion**: Red, green, and blue color channels sample the texture at slightly offset positions, generating authentic rainbow prism flares at curved borders.
- **60 FPS Video Streaming**: When configured with `{ kind: 'video', url }`, new video frames are uploaded directly to the GPU texture every frame.

---

## 2. "dom" Mode (Hybrid Default)

In standard web applications, backdrops often consist of interactive HTML elements, nested CSS gradients, and live typography rather than a single static image.

In `dom` mode:
- The GPU canvas renders specular glares, bevel outlines, and ambient drop shadows.
- Interior diffusion blur is delegated to browser-native CSS `backdrop-filter: blur(...)`.
- The engine enters sleep mode when elements are idle, consuming **0% continuous GPU cycles**.

---

## 3. "css" Mode (Universal Fallback)

If hardware acceleration is unavailable, disabled by corporate policy, or blocked by browser flags, Liquid UI degrades gracefully to `css` mode:
- No WebGL2 or WebGPU context is allocated.
- Components apply high-quality CSS `backdrop-filter`, border gradients, and box shadows.
- Guarantees 100% functional integrity and visual polish even on legacy devices or inside server-rendered environments.

---

## Next Steps

- Explore practical recipes in **[Building Real Interfaces](guides/building-interfaces.md)**.
- Learn about hardware acceleration in **[Rendering Pipeline](advanced/pipeline.md)**.
