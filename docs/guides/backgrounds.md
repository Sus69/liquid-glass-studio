---
title: Working with Backgrounds
description: Master backdrop modes, image wallpapers, video textures, and optical refraction physics.
page_type: guide
status: published
---

# Working with Backgrounds

Optical glass is completely defined by what lies behind it. Without light passing through from a background layer, refraction, chromatic dispersion, and blur cannot produce visual distortion.

Liquid UI supports three distinct background architectures via `<LiquidProvider backdropMode={...}>`.

---

## 1. The Physics of Background Refraction

A common issue encountered by first-time users is setting up a glass component over a solid background color (e.g. `#ffffff` or `#121212`) and wondering why no refraction is visible.

### Snell's Law in Pixel Shaders
The shader computes refracted ray deflection:
$$\eta = \frac{n_1}{n_2}$$
$$\vec{T} = \eta \vec{I} + \left(\eta (\vec{N} \cdot \vec{I}) - \sqrt{1 - \eta^2 (1 - (\vec{N} \cdot \vec{I})^2)}\right) \vec{N}$$

The shader samples background texture coordinates at $\vec{uv} + \Delta\vec{uv}$. If every surrounding background pixel has identical RGBA values:
$$\text{Color}(\vec{uv} + \Delta\vec{uv}) \equiv \text{Color}(\vec{uv})$$
The refracted color is mathematically identical to the unrefracted color! Refraction requires **spatial contrast** (patterns, gradients, typography, photography, or video) to produce visible lensing.

---

## 2. Backdrop Modes Comparison

```
┌────────────────────────────────────────────────────────────────────────┐
│ <LiquidProvider backdropMode="dom" | "textured" | "css">               │
├─────────────────┬───────────────────┬──────────────────────────────────┤
│ Mode            │ Rendering Path    │ Best Used For                    │
├─────────────────┼───────────────────┼──────────────────────────────────┤
│ "textured"      │ Pure WebGL2/WebGPU│ Wallpapers, dynamic video loops, │
│                 │ Canvas Texture    │ 60fps fullscreen simulations     │
├─────────────────┼───────────────────┼──────────────────────────────────┤
│ "dom" (default) │ Hybrid DOM + WebGL│ Regular web layouts, interactive │
│                 │ Backdrop          │ CSS gradients, text behind glass │
├─────────────────┼───────────────────┼──────────────────────────────────┤
│ "css"           │ Pure CSS          │ Low-power devices, SSR, headless │
│                 │ backdrop-filter   │ browsers, zero-GPU environments  │
└─────────────────┴───────────────────┴──────────────────────────────────┘
```

---

## 3. Configuring Textured Backgrounds

In `textured` mode, Liquid UI loads your image or video directly into a GPU texture buffer. The fragment shader samples this texture directly during the optical refraction and blur passes.

### Static Image Background

```tsx
import React from 'react';
import { LiquidProvider, LiquidCard } from 'liquid-ui';
import 'liquid-ui/styles.css';

export function TexturedApp() {
  return (
    <LiquidProvider
      backdropMode="textured"
      background={{
        kind: 'image',
        url: '/assets/wallpapers/aurora.webp',
      }}
    >
      <div style={{ minHeight: '100vh', padding: 40 }}>
        <LiquidCard glass="clear" radius={24} style={{ maxWidth: 480 }}>
          <h2>True Optical Lensing</h2>
          <p>
            The background texture is directly sampled by the fragment shader,
            yielding real physical refraction and chromatic dispersion.
          </p>
        </LiquidCard>
      </div>
    </LiquidProvider>
  );
}
```

---

## 4. Working in DOM Mode (Default)

In standard web applications, content exists as real HTML DOM elements rather than static GPU textures. In `dom` mode:
1. The shared WebGL2/WebGPU canvas sits beneath your interactive UI elements.
2. The canvas renders specular glares, bevel shadows, and subtle glass tints.
3. CSS `backdrop-filter` or complementary overlay layers provide real-time DOM blur behind the glass geometry.

```tsx
export function DomApp() {
  return (
    <LiquidProvider backdropMode="dom">
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 20% 30%, #3b82f6 0%, #1e1b4b 60%, #0f172a 100%)',
          padding: 40,
        }}
      >
        <LiquidCard glass="frosted" radius={20}>
          <h3>Hybrid DOM Compositing</h3>
          <p>This vibrant CSS gradient shines through the frosted glass panel.</p>
        </LiquidCard>
      </div>
    </LiquidProvider>
  );
}
```

---

## 5. Dynamic Background Swapping

You can dynamically swap backgrounds at runtime by updating the `background` prop on `<LiquidProvider>`. The underlying engine detects changes and hot-reloads the GPU texture without reconstructing the rendering context:

```tsx
export function WallpaperSwitcher() {
  const [wallpaper, setWallpaper] = useState('/wallpapers/mountain.webp');

  return (
    <LiquidProvider
      backdropMode="textured"
      background={{ kind: 'image', url: wallpaper }}
    >
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 10 }}>
        <button onClick={() => setWallpaper('/wallpapers/ocean.webp')}>Ocean</button>
        <button onClick={() => setWallpaper('/wallpapers/forest.webp')}>Forest</button>
      </div>
      {/* App content */}
    </LiquidProvider>
  );
}
```

---

## Next Steps

- Learn how to stream video textures in **[Images and Video](guides/images-and-video.md)**.
- Explore responsive positioning in **[Responsive Layouts](guides/responsive-layouts.md)**.
