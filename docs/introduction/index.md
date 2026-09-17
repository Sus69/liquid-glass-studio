---
title: What is Liquid UI?
description: An introduction to Liquid UI, a reusable React component library for physically plausible liquid glass interfaces.
page_type: concept
status: published
---

# What is Liquid UI?

**Liquid UI** (`liquid-ui`) is a reusable React component library that renders physically plausible, real-time liquid glass user interfaces. It brings optical refraction, chromatic dispersion, directional specular glare, Fresnel edge reflections, and tactile spring-driven compression to standard web applications.

Unlike conventional CSS-only approaches that rely on simple translucent layers and flat background blurs, Liquid UI simulates genuine physical optics through a dedicated GPU pipeline while keeping your text, icons, and interactive elements completely native, accessible, and responsive within the DOM.

```tsx
import { LiquidProvider, LiquidButton, LiquidCard } from 'liquid-ui';
import 'liquid-ui/styles.css';

export function App() {
  return (
    <LiquidProvider backdropMode="dom">
      <LiquidCard glass="frosted" style={{ maxWidth: 360 }}>
        <h2>Welcome to Liquid UI</h2>
        <p>Physically dimensional liquid glass with zero WebGL boilerplate.</p>
        <LiquidButton variant="primary">Get Started</LiquidButton>
      </LiquidCard>
    </LiquidProvider>
  );
}
```

---

## Core Principles

### 1. Hybrid Rendering Model (DOM Content + GPU Material)
In Liquid UI, your content is **never rendered inside a canvas or shader**. Text, inputs, links, buttons, and semantic markup are always native browser DOM elements. 

A single, shared GPU canvas (WebGL2 or WebGPU) sits invisibly behind your React components (`z-index: 0`, `pointer-events: none`, `aria-hidden="true"`). As components mount, resize, or move, they register their bounding boxes with the shared engine, which draws the physical glass material, edge bevels, and optical highlights directly behind them in real-time.

### 2. Physical Optics, Not Flat Blurs
Liquid glass features real-world optical phenomena modeled through Signed Distance Field (SDF) mathematics:
- **Refraction**: Light bends as it passes through the thick glass edge, distorting the scene behind it.
- **Chromatic Dispersion**: White light splits into spectral wavelengths along high-contrast borders, producing subtle chromatic aberration.
- **Specular Glare**: Directional light bands track pointer movement across curved squircle bevels.
- **Fresnel Reflections**: Grazing angles illuminate the outer boundary of the surface.
- **Physical Press Springs**: Clicking or tapping a surface compresses the 3D SDF geometry itself on the GPU, producing tactile fluid displacement rather than a flat 2D CSS scale.

### 3. Studio vs. Library
It is essential to distinguish between the two entities in this ecosystem:

| | Liquid Glass Studio | `liquid-ui` Library |
|---|---|---|
| **Role** | Visual experimentation environment, shader laboratory, and parameter tuning tool. | Reusable, production-ready React component library for developers. |
| **API** | Leva GUI sliders, raw URL parameters, direct shader controls. | Declarative React components (`<LiquidButton>`, `<LiquidCard>`), typed props, named presets. |
| **Usage** | Playground for finding optimal optical values. | Package integrated into applications via `npm` or `pnpm`. |

---

## What the Library Provides

Liquid UI exports a complete suite of ready-to-use primitives and components:

- **Root & Context**:
  - `LiquidProvider`: Manages the shared engine, canvas lifecycle, and backend selection.
  - `useLiquidContext`: React hook to inspect engine readiness and active GPU backend.
- **Core Primitive**:
  - `LiquidSurface`: Foundational element that maps any semantic DOM tag to the GPU.
- **Components**:
  - `LiquidButton`: Interactive button with variants (`primary`, `secondary`, `ghost`), sizes, and loading states.
  - `LiquidCard`: Glass container with optional magnetic pointer response.
  - `LiquidDiv`: Flexible layout block with convenient padding, dimensions, and tinting.
  - `LiquidPill`: Compact stadium badge with optional status indicator dot.
  - `LiquidInput`: Accessible text input field on frosted glass.
  - `LiquidIconButton`: Circular icon button with enforced accessibility labeling.
  - `LiquidToggle`: Accessible switch (`role="switch"`) with spring-driven glass thumb.
  - `LiquidTooltip`: Floating glass tooltip portal anchored to trigger elements.
  - `LiquidModal`: Dialog overlay with focus trapping and Escape key listener.
  - `LiquidDock` & `LiquidDockItem`: macOS-style magnifying glass dock.
  - `LiquidBlob` & `LiquidBlobShape`: Gooey, organically merging SDF metaball shapes.
- **Materials & Presets**:
  - `LIQUID_PRESETS`: Built-in optical styles (`soft`, `clear`, `frosted`, `dark`, `strong`).
  - `resolveMaterial`: Deep-merging preset and custom override resolver.

---

## Multi-Backend Architecture

Liquid UI automatically detects the client environment and selects the best available rendering backend:

```
WebGPU (Modern, high performance)
  ↓ (fallback if unsupported)
WebGL2 (Universal evergreen support)
  ↓ (fallback if context lost / unavailable)
CSS Fallback (Pure backdrop-filter & box-shadows)
```

No matter which backend is active, the component API remains completely identical. On devices without WebGL2 or WebGPU support, Liquid UI gracefully falls back to CSS approximations without throwing runtime exceptions.

---

## Next Steps

- **[Installation Guide](getting-started/installation.md)**: Install `liquid-ui` and required peer dependencies.
- **[Quick Start](getting-started/quickstart.md)**: Build your first functional glass interface in under 2 minutes.
- **[Why Liquid Glass?](introduction/why-liquid-glass.md)**: Dive into the optical science behind our shaders.
- **[Architecture Overview](introduction/architecture.md)**: Learn how the DOM and GPU coordinate each frame.
