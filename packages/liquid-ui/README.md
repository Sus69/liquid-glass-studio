# 💧 liquid-ui

Reusable, accessible liquid-glass UI components for React, powered by a shared WebGL2 / WebGPU rendering engine.

```tsx
import { LiquidButton } from 'liquid-ui';
import 'liquid-ui/styles.css';

<LiquidButton variant="primary">Get Started</LiquidButton>
```

No raw canvas setup. No custom shaders to compile. The engine underneath handles all GPU optical physics (WebGPU when supported, WebGL2 otherwise, with graceful CSS fallback); your components remain 100% semantic, accessible HTML DOM elements.

---

## 📦 Installation

```bash
npm install liquid-ui
```

### Peer Dependencies
Ensure you have the following peer dependencies installed:
```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0",
    "@react-spring/web": ">=9.0.0"
  }
}
```

---

## 🚀 Quick Start

Wrap your application in `<LiquidProvider>` once near the root. It manages a **single shared GPU canvas** that renders refraction and specular lighting for every liquid component on the page.

```tsx
import React from 'react';
import {
  LiquidProvider,
  LiquidCard,
  LiquidButton,
  LiquidPill,
} from 'liquid-ui';
import 'liquid-ui/styles.css';

export default function App() {
  return (
    <LiquidProvider backdropMode="dom">
      <div style={{ minHeight: '100vh', padding: 40 }}>
        <LiquidCard glass="frosted" radius={24} interactive>
          <LiquidPill statusColor="#10b981">Operational</LiquidPill>
          <h2>Tactile Liquid Glass</h2>
          <p>
            Real-time physical refraction, chromatic dispersion, and
            zero-re-render spring physics.
          </p>
          <LiquidButton variant="primary">Continue</LiquidButton>
        </LiquidCard>
      </div>
    </LiquidProvider>
  );
}
```

---

## 🧩 Components

| Component | Underlying Element | Key Features |
|---|---|---|
| **`<LiquidSurface>`** | Polymorphic (`as="div\|button"`) | Core primitive backing all liquid components |
| **`<LiquidDiv>`** | `<div>` | General glass container with squircle geometry |
| **`<LiquidButton>`** | `<button type="button">` | Variants (`primary`, `secondary`, `ghost`), tactile press spring |
| **`<LiquidCard>`** | `<div>` | Surface panel with optional `interactive` hover glare |
| **`<LiquidPill>`** | `<span>` | Capsule badges and status chips (`radius={999}`) |
| **`<LiquidInput>`** | `<input>` | Accessible form control on a liquid glass base |
| **`<LiquidIconButton>`** | `<button>` | Icon container with compile-time mandatory `'aria-label'` |
| **`<LiquidToggle>`** | `<button role="switch">` | Accessible switch with spring-driven indicator thumb |
| **`<LiquidTooltip>`** | Portal + `role="tooltip"` | Floating glass tooltip positioned relative to trigger |
| **`<LiquidModal>`** | Accessible Dialog | Overlay dimming, Tab/Shift+Tab focus trap, Escape key close |
| **`<LiquidDock>`** | Container + Items | macOS-style magnification dock bar with spring physics |
| **`<LiquidBlob>`** | SVG/DOM Container | Organic metaball merging using polynomial smooth-minimum SDF |

---

## 🎨 Material Presets & Overrides

Every component accepts the `glass` prop as either a preset string or a partial parameter override:

```tsx
// Using a built-in preset
<LiquidCard glass="frosted" />

// Using a partial override
<LiquidButton
  glass={{
    refractiveIndex: 1.45,
    blur: 24,
    dispersion: 1.5,
    tint: [1, 1, 1],
    tintOpacity: 0.15,
  }}
>
  Custom Glass Button
</LiquidButton>
```

### Built-in Presets
- **`soft`** (Default): Ambient, velvety glass with balanced diffusion and gentle edge refraction.
- **`clear`**: Pure transparent crystal with zero blur and vivid chromatic dispersion.
- **`frosted`**: Dense diffusion acrylic for high text legibility on arbitrary backdrops.
- **`dark`**: Smoked obsidian for dark-mode interfaces and stealth HUDs.
- **`strong`**: Intense light bending and rainbow dispersion for hero call-to-action buttons.

---

## 🖼 Backdrop Modes

Configure `<LiquidProvider backdropMode="...">`:

- **`"dom"`** *(Default)*: The GPU canvas sits underneath your HTML layout, drawing specular glares and refraction rims while delegating interior diffusion blur to CSS `backdrop-filter`. Best for standard web applications.
- **`"textured"`**: Full GPU texture sampling. Uploads a static image or 60fps video directly into a GPU texture buffer for true Snell's law refraction.
- **`"css"`**: Universal graceful fallback for headless browsers, SSR, or systems where WebGPU/WebGL2 are unavailable.

---

## ⚡ Performance Guarantees

- **Single Shared Canvas**: Up to 48 shapes share a single GPU draw call and buffer allocation.
- **Render-on-Demand Loop**: Automatically sleeps when shapes and springs settle, consuming **0% continuous GPU cycles** on static pages.
- **Intersection Culling**: Components scrolled out of view are culled 120px before leaving the screen.
- **DPR Throttling**: Caps mobile drawing buffer density at `maxDpr={2}` by default.

---

## ♿ Accessibility

- Canvas is isolated with `aria-hidden="true"` and `pointer-events: none`.
- Screen readers interact exclusively with semantic HTML elements (`<button>`, `<input>`, `role="switch"`, `role="dialog"`).
- Full keyboard focus trap and Escape dismissal in `<LiquidModal>`.
- Automatically respects `prefers-reduced-motion: reduce`.

---

## 📄 License

[MIT License](LICENSE)
