# LIQUID UI — INTERNAL RECONNAISSANCE & DOCUMENTATION AUDIT

> **Authoritative Phase 1 Deliverable**  
> Generated from repository source code inspection of `liquid-glass-studio` and `packages/liquid-ui`.  
> Date: 2026-09-17  
> Status: Canonical Source of Truth for Documentation Phases 2–9.

---

## 1. Repository Map

```
liquid-glass-studio/                      (pnpm workspace root)
├── .editorconfig                         Editor configuration
├── .gitignore                            Git ignore rules
├── .prettierrc.js                        Prettier code formatting configuration
├── eslint.config.js                      ESLint flat config (React hooks, refresh, TS)
├── index.html                            Vite HTML entry for Studio playground (/)
├── mock.html                             Vite HTML entry for Prism mock application (/mock.html)
├── showcase.html                         Vite HTML entry for Component Showcase (/showcase.html)
├── package.json                          Workspace root package configuration (scripts & deps)
├── pnpm-lock.yaml                        Pnpm lockfile
├── pnpm-workspace.yaml                   Workspace definition: packages: ['packages/*']
├── tsconfig.json                         Root TS project references
├── tsconfig.app.json                     TS config for Studio app, showcase, and mock UI
├── tsconfig.node.json                    TS config for Vite & tooling
├── vite.config.ts                        Vite config (glsl plugin, react swc, tsconfig paths)
│
├── public/                               Static public assets
│
├── src/                                  Liquid Glass Studio & Demonstration Apps
│   ├── App.tsx                           Studio app (Leva controls, background switching, render canvas)
│   ├── App.module.scss                   Studio styling
│   ├── Controls.tsx                      Leva control definitions & UI bindings
│   ├── index.scss                        Studio global styles
│   ├── main.tsx                          Studio bootstrap
│   ├── studioEngineAdapter.ts            Bridge between Studio GUI controls & engine renderers
│   ├── vite-env.d.ts                     Vite client types
│   ├── assets/                           Studio demo assets (bg-tahoe-light.webp, bg-video-fish.mp4)
│   ├── components/                       Studio canvas components (StudioCanvas)
│   ├── mock-ui/                          Prism Music Mock App (real-world UI proof)
│   │   ├── main.tsx                      Prism mock bootstrap
│   │   └── PrismApp.tsx                  Prism implementation (max-fidelity material hierarchy)
│   ├── shaders/                          GLSL shaders for Studio legacy/adapter pipeline
│   ├── shaders-wgsl/                     WGSL shaders for Studio legacy/adapter pipeline
│   ├── showcase/                         Component Showcase (/showcase.html)
│   │   ├── main.tsx                      Showcase bootstrap
│   │   └── Showcase.tsx                  Interactive showcase demonstrating all 11 UI components
│   └── utils/                            Color, math, and WebGPU detection utilities
│
├── packages/                             Workspace Packages
│   └── liquid-ui/                        THE REUSABLE LIBRARY ('liquid-ui')
│       ├── package.json                  Library package config (name: "liquid-ui", version: "0.1.0")
│       ├── tsconfig.json                 Library TS config
│       ├── tsconfig.build.json           Library d.ts emit configuration
│       ├── vite.lib.config.ts            Library build config (Vite library mode: ESM, CJS, styles.css)
│       ├── dist/                         Built library artifacts (dist/index.mjs, dist/index.cjs, styles.css)
│       ├── docs/
│       │   └── API.md                    Initial library markdown documentation
│       └── src/
│           ├── index.ts                  Canonical public library entry point
│           ├── types.ts                  Canonical public TypeScript definitions
│           ├── context.ts                LiquidContext and useLiquidContext hook
│           ├── components/               React component implementations
│           │   ├── LiquidProvider.tsx    Root context provider and engine host
│           │   ├── LiquidSurface.tsx     Core primitive registering DOM geometry to GPU
│           │   ├── LiquidDiv.tsx         General glass container
│           │   ├── LiquidButton.tsx      Accessible glass button (variants, sizes, loading)
│           │   ├── LiquidCard.tsx        Glass card with optional pointer magnetism
│           │   ├── LiquidPill.tsx        Compact status pill / badge
│           │   ├── LiquidInput.tsx       Accessible DOM input with glass wrapper
│           │   ├── LiquidIconButton.tsx  Circular icon button with mandatory aria-label
│           │   ├── LiquidToggle.tsx      Accessible switch (role="switch")
│           │   ├── LiquidTooltip.tsx     Portal-rendered accessible glass tooltip
│           │   ├── LiquidModal.tsx       Accessible modal dialog (focus trap, Esc key)
│           │   ├── LiquidDock.tsx        Magnifying glass dock & dock items
│           │   ├── LiquidBlob.tsx        Merged gooey SDF glass shapes (LiquidBlob, LiquidBlobShape)
│           │   └── fallback.ts           CSS fallback visual generator
│           ├── materials/                Material system and presets
│           │   ├── presets.ts            Built-in presets (soft, clear, frosted, dark, strong)
│           │   ├── resolveMaterial.ts    Input resolution logic and blur grouping
│           │   ├── toUniforms.ts         Mapping from LiquidMaterial to GPU shader uniforms
│           │   └── materials.test.ts     Vitest unit tests for material resolution & cloning
│           ├── engine/                   GPU rendering engine
│           │   ├── LiquidEngine.ts       Shared engine, canvas, lifecycle, texture manager
│           │   ├── shapes.ts             ShapeRegistry (MAX_SHAPES=48, uniform packing)
│           │   ├── scheduler.ts          Render-on-demand requestAnimationFrame scheduler
│           │   ├── interaction.ts        Physics springs (ScalarSpring, PointerSpring)
│           │   ├── gpuDetect.ts          Cached, single-flight WebGPU detection
│           │   ├── engine.test.ts        Vitest unit tests for registry, springs, scheduler
│           │   ├── backends/
│           │   │   ├── webgl/            WebGL2 MultiPassRenderer & texture helpers
│           │   │   └── webgpu/           WebGPU GPUMultiPassRenderer & texture helpers
│           │   ├── shaders/              GLSL shaders (vertex, bg, vblur, hblur, main, includes)
│           │   └── shaders-wgsl/         WGSL shaders (vertex, bg, vblur, hblur, main)
│           ├── hooks/                    Public React hooks
│           │   ├── index.ts              Hook exports
│           │   ├── useElementBounds.ts   ResizeObserver & IntersectionObserver hook
│           │   └── useReducedMotion.ts   prefers-reduced-motion media query hook
│           └── styles/
│               └── styles.css            Default library stylesheet (root, surface, components, keyframes)
│
└── docs/                                 Repository Documentation
    ├── RENDERING-FORENSICS.md            Deep architectural forensics on rendering pipeline
    └── INTERNAL-DOCS-AUDIT.md            (This document)
```

---

## 2. Studio vs. Library Distinction

| Dimension | Liquid Glass Studio | `liquid-ui` Library |
|---|---|---|
| **Primary Purpose** | Visual experimentation playground, shader debugging tool, and optical benchmark. | Reusable, production-ready React UI component library for developer applications. |
| **User Audience** | Designers, shader developers, researchers inspecting optics. | Web application developers building user interfaces. |
| **API Surface** | Leva GUI controls, raw URL parameters, direct shader tweaks. | Idiomatic React components (`<LiquidButton>`, `<LiquidCard>`), typed props, named presets. |
| **DOM / Rendering** | Fullscreen WebGL2 canvas rendering single procedural or textured shapes. | Hybrid architecture: Semantic DOM nodes rendered by React, with a single transparent background GPU canvas. |
| **State Management** | Global Leva parameter object. | React props, context, Spring physics, and internal `ShapeRegistry`. |
| **Styling** | Sass modules (`App.module.scss`, `index.scss`). | Clean, modular CSS (`styles.css`) + CSS custom properties + fallback classes. |
| **Entry Point** | `src/main.tsx` (`/`) | `packages/liquid-ui/src/index.ts` (`import { ... } from 'liquid-ui'`). |

---

## 3. Public API Inventory

All exports from `packages/liquid-ui/src/index.ts`:

### Primary API (Recommended for standard consumer use)
- `LiquidProvider` (`components/LiquidProvider.tsx`): Root provider that initializes and manages the shared GPU engine.
- `LiquidButton` (`components/LiquidButton.tsx`): Accessible glass button supporting primary/secondary/ghost variants and sizes.
- `LiquidCard` (`components/LiquidCard.tsx`): Container with glass material and optional magnetic hover interaction.
- `LiquidDiv` (`components/LiquidDiv.tsx`): Versatile glass layout block for arbitrary DOM content.
- `LiquidPill` (`components/LiquidPill.tsx`): Compact status pill/badge with optional status dot.
- `LiquidInput` (`components/LiquidInput.tsx`): Accessible input field with glass background.
- `LiquidIconButton` (`components/LiquidIconButton.tsx`): Icon button requiring `aria-label`.
- `LiquidToggle` (`components/LiquidToggle.tsx`): Accessible switch (`role="switch"`).
- `LiquidTooltip` (`components/LiquidTooltip.tsx`): Floating glass tooltip anchored to trigger children.
- `LiquidModal` (`components/LiquidModal.tsx`): Modal dialog portal with backdrop blur, focus trap, and Escape key handling.
- `LiquidDock`, `LiquidDockItem` (`components/LiquidDock.tsx`): macOS-style dock with spring proximity magnification.
- `LiquidBlob`, `LiquidBlobShape` (`components/LiquidBlob.tsx`): Smoothly merging SDF metaball containers.
- `LIQUID_PRESETS` (`materials/presets.ts`): Built-in material presets (`soft`, `clear`, `frosted`, `dark`, `strong`).

### Advanced API (For custom styling, layout primitives, and hooks)
- `LiquidSurface` (`components/LiquidSurface.tsx`): Core primitive mapping arbitrary DOM elements to the GPU canvas.
- `LiquidContext`, `useLiquidContext` (`context.ts`): Access to `{ engine, ready }`.
- `useElementBounds` (`hooks/useElementBounds.ts`): ResizeObserver + IntersectionObserver bounds hook.
- `useReducedMotion` (`hooks/useReducedMotion.ts`): Reactive prefers-reduced-motion hook.
- `resolvePreset` (`materials/presets.ts`): Deep-copies a named preset material.
- `cloneMaterial` (`materials/presets.ts`): Clones a material object safely.
- `resolveMaterial` (`materials/resolveMaterial.ts`): Resolves string or override object to `LiquidMaterial`.
- `blurGroupKey` (`materials/resolveMaterial.ts`): Calculates blur pass grouping.
- `materialToShapeUniforms` (`materials/toUniforms.ts`): Translates material parameters into GPU uniforms.

### Low-Level / Engine API (For custom render pipelines and diagnostics)
- `LiquidEngine` (`engine/LiquidEngine.ts`): Core multi-backend engine class.
- `computeGaussianKernelByRadius` (`engine/LiquidEngine.ts`): 1D Gaussian kernel calculator.
- `detectWebGPU` (`engine/gpuDetect.ts`): Probes browser WebGPU support.
- `PointerSpring`, `ScalarSpring` (`engine/interaction.ts`): Damped harmonic oscillator physics.
- `Scheduler` (`engine/scheduler.ts`): Dirty-checking animation loop.
- `MultiPassRenderer`, `ShaderProgram`, `FrameBuffer`, `RenderPass` (`engine/backends/webgl/MultiPassRenderer.ts`): WebGL2 pipeline.
- `GPUMultiPassRenderer` (`engine/backends/webgpu/GPUMultiPassRenderer.ts`): WebGPU pipeline.
- `createEmptyTexture`, `loadTextureFromURL`, `updateVideoTexture` (`engine/backends/webgl/textures.ts`): WebGL2 textures.
- `gpuCreateEmptyTexture`, `gpuLoadTextureFromURL`, `gpuUpdateVideoTexture` (`engine/backends/webgpu/textures.ts`): WebGPU textures.

### Types
- `LiquidMaterial`, `LiquidMaterialOverride`, `LiquidPresetName`
- `LiquidBackdropMode`, `LiquidBackendKind`, `LiquidBackendInfo`
- `LiquidRGB`, `LiquidRGBA`, `LiquidTextureHandle`, `LiquidGlassInput`
- `LiquidShapeState`, `LiquidSpringConfig`, `LiquidInteraction`, `LiquidComponentProps`
- `LiquidProviderProps`, `LiquidSurfaceProps`, `LiquidDivProps`, `LiquidButtonProps`, `LiquidButtonVariant`, `LiquidButtonSize`, `LiquidCardProps`, `LiquidPillProps`, `LiquidInputProps`, `LiquidIconButtonProps`, `LiquidToggleProps`, `LiquidTooltipProps`, `LiquidModalProps`, `LiquidDockProps`, `LiquidDockItemProps`, `LiquidBlobProps`, `LiquidBlobShapeProps`
- `EngineBgType`, `LiquidEngineOptions`, `WebGPUDetectResult`, `ShapeUniforms`, `RenderPassConfig`

---

## 4. Component Matrix

| Component | HTML Tag | Default Glass | Default Radius | Key Interactions | Accessibility Features |
|---|---|---|---|---|---|
| `LiquidProvider` | `<div>` (`.liquid-ui-root`) | N/A | N/A | Engine lifecycle management | Offscreen canvas `aria-hidden="true"`, `pointer-events: none` |
| `LiquidSurface` | Configurable (`as="div"`) | `'strong'` | From material (16px) | Damped press & hover springs, pointer normalization | Fallback classes on GPU unavailability, ref forwarding |
| `LiquidButton` | `<button type="button">` | By variant (`primary`:'strong', `secondary`:'soft', `ghost`:'clear') | 14px | Pointer glare tracking, SDF press compression, optional spinner | Native button, `data-disabled`, `aria-hidden` spinner |
| `LiquidCard` | `<div>` | `'soft'` | 20px | Optional pointer magnetism (`interactive={true}`) | Native HTML block elements inside |
| `LiquidDiv` | `<div>` | `'strong'` | From material | Static or configurable | Pass-through layout block |
| `LiquidPill` | `<div>` | `'soft'` | 999px (stadium) | Static | Optional decorative indicator `aria-hidden="true"` |
| `LiquidInput` | `<div>` wrapping `<input>` | `'frosted'` | 14px | Focus states on inner input | Inner `<input>` receives forwarded `ref` and standard attributes |
| `LiquidIconButton` | `<button type="button">` | `'soft'` | `size / 2` (circular) | Strong glare response (strength 0.2), press compression | Mandatory `aria-label` required by TypeScript prop types |
| `LiquidToggle` | `<button type="button">` | `'soft'` | `height / 2` | Click toggle, press depth compression | `role="switch"`, `aria-checked={checked}`, keyboard activatable |
| `LiquidTooltip` | Portal `<div>` | `'dark'` | 10px | Hover / Focus timer delay (150ms default) | `role="tooltip"`, clones trigger to wire focus/blur/hover |
| `LiquidModal` | Portal `<div>` | `'frosted'` | 24px | Backdrop overlay click dismiss | `role="dialog"`, `aria-modal="true"`, focus trap, Esc key listener |
| `LiquidDock` | `<div>` | `'clear'` | 26px | Pointer proximity spring magnification | Scaled items preserve crisp text and DOM interactions |
| `LiquidDockItem` | `<div>` via `LiquidSurface` | `'soft'` | Inherited | Click handler, magnification scaling | Native DOM click target |
| `LiquidBlob` | `<div>` | `'clear'` | N/A | Sibling SDF smooth minimum (`smin`) blending | Preserves DOM children inside each shape |
| `LiquidBlobShape`| `<div>` | `'clear'` | Inherited | Positioned via `x, y, width, height` | Renders DOM content inside merged liquid glass |

---

## 5. LiquidProvider & Context Architecture

- **Single Engine per Provider**: `LiquidProvider` instantiates exactly one `LiquidEngine`.
- **Canvas Ownership**: Creates a single `<canvas className="liquid-ui-engine-canvas">` positioned absolutely behind children with `pointer-events: none` and `z-index: 0`.
- **StrictMode Resilience**: To survive React 18/19 StrictMode double-mount cycles without resource leakage or dead contexts, the engine is instantiated inside the `useEffect` hook and attached asynchronously.
- **Global Debug Hook**: Attaches `window.__LIQUID_UI__ = { engine, registry }` during development.
- **Context Contract**:
  ```typescript
  export interface LiquidContextValue {
    engine: LiquidEngine | null;
    ready: boolean;
  }
  ```

---

## 6. LiquidSurface Deep Analysis

`LiquidSurface` is the foundational bridge between React's virtual DOM and the GPU pipeline:
1. **Geometry Registration**: Upon mounting and engine readiness, it registers with `engine.registry.register(material)`.
2. **Measurement & Sync**: Uses `ResizeObserver` combined with `requestAnimationFrame` to track DOM bounding boxes relative to the `LiquidProvider` root.
3. **Visibility Management**: Uses `IntersectionObserver` with a `120px` root margin. Offscreen surfaces are marked invisible, eliminating GPU rendering overhead when scrolled away.
4. **Spring Physics**: Contains two local damped spring systems:
   - `pressSpring`: `stiffness: 420`, `damping: 24` (triggers on pointer down/up).
   - `hoverSpring`: `stiffness: 260`, `damping: 22` (tracks pointer enter/leave/movement).
5. **Reduced Motion**: Directly observes `useReducedMotion()`. When active, hover offsets are forced to 0 and press animations resolve immediately without oscillation.
6. **Graceful Degradation**: If WebGL2/WebGPU is unavailable (`ready && !engine.backend.gpu`), automatically injects `.liquid-ui-fallback` CSS classes.

---

## 7. Material System Model

A `LiquidMaterial` represents the complete optical specification for a glass surface:

| Public Property | Type | Default ('strong') | Shader Uniform | Description |
|---|---|---|---|---|
| `thickness` | `number` | `20` | `u_refThickness` | Edge bevel thickness in CSS pixels |
| `refraction` | `number` | `1.4` | `u_refFactor` | Optical refractive index |
| `refractionDistance` | `number` | `0.05` | `u_refDistance` | Ray displacement offset |
| `dispersion` | `number` | `7` | `u_refDispersion` | Chromatic dispersion / spectral split |
| `fresnel` | `number` | `0.2` | `u_refFresnelFactor` | Edge Fresnel rim intensity (0-1) |
| `fresnelRange` | `number` | `36` | `u_refFresnelRange` | Fresnel falloff curve spread |
| `fresnelHardness` | `number` | `0.2` | `u_refFresnelHardness`| Fresnel transition sharpness (0-1) |
| `glare` | `number` | `0.9` | `u_glareFactor` | Specular glare highlight intensity (0-1) |
| `glareRange` | `number` | `30` | `u_glareRange` | Glare band width |
| `glareHardness` | `number` | `0.2` | `u_glareHardness` | Glare edge tightness (0-1) |
| `glareConvergence` | `number` | `0.5` | `u_glareConvergence` | Specular power falloff exponent |
| `glareOppositeFactor`| `number` | `0.8` | `u_glareOppositeFactor`| Secondary glare reflection intensity |
| `glareAngle` | `number` | `-45` | `u_glareAngle` | Glare lighting orientation angle (degrees) |
| `blur` | `number` | `1` | `u_blurRadius` | Background Gaussian blur radius in px |
| `borderBlend` | `boolean` | `true` | `u_blurEdge` | Whether to blend blur into the edge bevel |
| `tint` | `LiquidRGBA` | `{r:255,g:255,b:255,a:0}` | `u_tint` | Glass color absorption filter |
| `shadowExpand` | `number` | `25` | `u_shadowExpand` | Ambient drop shadow spread radius |
| `shadow` | `number` | `0.15` | `u_shadowFactor` | Drop shadow opacity (0-1) |
| `shadowOffset` | `{x:number, y:number}` | `{x:0, y:-10}` | `u_shadowPosition` | Drop shadow directional offset |
| `merge` | `number` | `0.05` | `u_mergeRate` | SDF smooth minimum blend factor |
| `radius` | `number` | `16` | `u_shapeRadius` | Corner radius in CSS pixels |
| `roundness` | `number` | `5` | `u_shapeRoundness` | Squircle superellipse curvature factor |

---

## 8. Built-in Presets Audit

1. **`soft`**: Delicate, translucent glass designed for unobtrusive UI layers (pills, cards, inactive items). Low thickness (12), gentle refraction (1.2), subtle dispersion (2), mild tint alpha (0.08).
2. **`clear`**: Highly refractive, crystal glass. Crisp edges (thickness 24, refraction 1.5, dispersion 10), zero tint, minimal blur (1).
3. **`frosted`**: Heavy milky glass with significant background diffusion. Substantial blur (12), soft highlights (hardness 0.35), high tint veil (`a: 0.28`).
4. **`dark`**: Smoked obsidian glass. Deep dark tint (`rgba(12, 14, 20, 0.55)`), strong refraction (1.45), high glare contrast.
5. **`strong`**: The canonical reference preset replicating the original Studio defaults. Thickness 20, refraction 1.4, dispersion 7, fresnelRange 36, glare 0.9.

Resolution behavior:
- `resolveMaterial(undefined)` returns a deep clone of `strong`.
- `resolveMaterial('presetName')` returns a deep clone of that preset.
- `resolveMaterial({ thickness: 30 })` clones `strong` and deeply overrides the specified properties.

---

## 9. Backdrop Modes

1. **`textured` (Full GPU Pipeline)**:
   - Requires a texture source via `background={{ kind: 'image' | 'video' | 'procedural', ... }}`.
   - Executes the 4-pass GPU pipeline (`bgPass` → `vBlur` → `hBlur` → `mainPass`).
   - True optical refraction and chromatic dispersion bend and separate the backdrop pixels.
2. **`dom` (Hybrid Compositing — Default)**:
   - Transparent canvas with premultiplied alpha rendering rims, glare, tint, and shadows.
   - Glass interior uses CSS `backdrop-filter: blur(...)` to blur live HTML elements underneath.
   - Runs cleanly over arbitrary React layouts without copying the DOM into WebGL textures.
3. **`css` (Fallback Mode)**:
   - Completely disables GPU canvas rendering.
   - Renders CSS borders, shadows, and backdrop filters via `.liquid-ui-fallback`.

---

## 10. Engine Architecture & Rendering Lifecycle

```
React Tree (<LiquidProvider>)
       │
  instantiates
       ▼
  LiquidEngine ◄──────────┐
       │                  │
   registers              │ re-measures every frame
       ▼                  │
  ShapeRegistry           │
 (MAX_SHAPES = 48)        │
       │                  │
  Scheduler (rAF) ────────┘
       │
     packs Float32Arrays (std140 layout: 8 vec4 rows per shape)
       │
  ┌────┴──────────────────────────┐
  ▼                               ▼
WebGL2 MultiPassRenderer      WebGPU GPUMultiPassRenderer
  │ (RGBA16F framebuffers)        │ (WGPU RenderPipelines)
  └──────────────┬────────────────┘
                 ▼
         4-Pass Pipeline:
         1. bgPass (Draws background texture or clears transparent canvas)
         2. vBlur  (Vertical 1D Gaussian blur)
         3. hBlur  (Horizontal 1D Gaussian blur)
         4. mainPass (SDF ray-marched refraction, dispersion, Fresnel, glare)
                 ▼
         Hardware Display
```

- **Render-on-Demand**: The engine loop skips GPU submission if shapes have not moved, springs are settled, and no video texture is ticking.
- **Dynamic Resizing**: Reacts to canvas resize by re-triggering render passes (`lastPackedCount = -1`) preventing black frame flash.

---

## 11. WebGL2 & WebGPU Backend Audit

- **WebGL2 Backend**:
  - Uses `MultiPassRenderer` with `OES_texture_half_float` and `EXT_color_buffer_float`.
  - Framebuffers allocate RGBA16F textures for high dynamic range glare and smooth gradients.
  - GLSL shaders compile with `#version 300 es`.
  - Centers are vertically flipped once centrally to match WebGL's bottom-up coordinate system.
- **WebGPU Backend**:
  - Uses `GPUMultiPassRenderer` targeting `rgba16float` texture formats.
  - WGSL shaders mirror the GLSL math exactly.
  - Uniform buffers explicitly pad 16-byte alignments (`_headerPad: vec4f`) ensuring shape uniform arrays start at exact byte offsets matching the JS Float32Array packer.
  - Attaches `device.lost` and `uncapturederror` listeners to prevent silent canvas dropouts.

---

## 12. Shapes & Signed Distance Fields (SDF)

- **Capacity**: `MAX_SHAPES = 48` across all shaders and CPU registries.
- **Shape Extents**: Calculated as half-extents (`halfWidth = width / 2`, `halfHeight = height / 2`).
- **Normalized Units**: Distance math operates in units normalized by viewport height (`u_resolution.y`), ensuring aspect ratio and device scale independence.
- **Superellipse Math**: Roundness exponent $n$ (`u_shapeRoundness`) controls curvature:
  - $n = 2.0$: Standard circle / ellipse.
  - $n = 5.0$: Apple squircle / smooth rectangle curvature.
- **Shape Merging**: Smooth minimum `smin` function allows adjacent shapes (such as `LiquidBlob` or adjacent `LiquidDockItem` instances) to blend seamlessly like liquid mercury.

---

## 13. Interaction & Animation

- Damped harmonic oscillators (`ScalarSpring`) drive interactive responses:
  - Press compression: scales the SDF shape geometry directly on the GPU, producing physical glass bulging rather than flat 2D CSS affine transforms.
  - Magnetic glare: normalizes pointer location to $[-1, 1]$ and dynamically steers `u_glareAngle` and `u_shapeOffset`.
- Frame budget: Springs step at $60\text{Hz}$ with delta clamping to prevent explosion over frame drops.

---

## 14. Hooks Audit

1. **`useElementBounds(ref)`**:
   - Observes element dimensions via `ResizeObserver`.
   - Disconnects on unmount.
2. **`useReducedMotion()`**:
   - Observes `window.matchMedia('(prefers-reduced-motion: reduce)')`.
   - Returns a reactive boolean that disables spring physics and instant-settles transformations.

---

## 15. Accessibility Audit

- **Library Provided**:
  - Canvas is strictly hidden from accessibility tree (`aria-hidden="true"`, `pointer-events: none`).
  - Native semantic HTML elements: `<button>`, `<input>`, `<div>`.
  - Automatic ARIA roles: `role="switch"` (`LiquidToggle`), `role="tooltip"` (`LiquidTooltip`), `role="dialog"` + `aria-modal="true"` (`LiquidModal`).
  - Keyboard listeners: Escape key dismisses `LiquidModal`; focus trap keeps focus within active dialogs.
  - Mandatory `aria-label` enforced by TypeScript types on `LiquidIconButton`.
  - Automatic `prefers-reduced-motion` compliance.
- **Consumer Responsibility**:
  - Providing descriptive text or labels on generic `LiquidButton` and `LiquidCard` components.
  - Managing high-contrast color choices when applying custom tints to maintain readable text contrast against glass backgrounds.

---

## 16. Backgrounds & Textures

- Supported background types:
  ```typescript
  export type EngineBgType =
    | { kind: 'procedural'; index: 0 | 1 | 2 }
    | { kind: 'image'; url: string }
    | { kind: 'video'; url: string };
  ```
- Image textures: Asynchronously loaded into WebGL/WebGPU textures with mipmapping and linear filtering.
- Video textures: Continuously updated each frame via `HTMLVideoElement` in the render scheduler.
- Procedural textures: Built-in procedural grid / chessboard shaders for testing and demonstration.

---

## 17. Fallback Behavior

- When WebGL2 or WebGPU is unsupported or context is lost:
  - The engine sets `backend = { kind: 'css', gpu: false, reason: ... }`.
  - `LiquidSurface` detects `!engine.backend.gpu` and injects `liquid-ui-fallback`.
  - CSS rules apply `backdrop-filter: blur(12px) saturate(1.5)` and layered translucent box shadows.
  - Text, interactions, and layout remain 100% functional without throwing runtime exceptions.

---

## 18. Existing Documentation Audit

1. **`packages/liquid-ui/docs/API.md`**:
   - Comprehensive initial technical overview written during library refactoring.
   - Accurate architecture diagrams and code snippets.
   - Needs migration and structured splitting into user-friendly Guides, Core Concepts, Component Pages, and formal API Reference.
2. **`docs/RENDERING-FORENSICS.md`**:
   - In-depth forensic analysis of unit mismatches, shader coordinates, and WebGPU buffer alignment.
   - Serves as the ultimate technical reference for Phase 6 (Advanced Architecture).
3. **`README.md`**:
   - Currently describes Liquid Glass Studio (the visual playground). Needs updates in later phases to introduce `liquid-ui` alongside Studio.

---

## 19. Real Usage Examples

Real implementations verified in codebase:
- `src/showcase/Showcase.tsx`: Demonstrates all 11 UI components with controls, sizes, states, and toggleable textured/DOM backdrops.
- `src/mock-ui/PrismApp.tsx`: High-fidelity production mock (music streaming application) featuring glass hero cards, playback docks, search inputs, modal dialogs, and metaball logo animations.

---

## 20. Package & Installation Findings

- Package name: `liquid-ui`.
- Version: `0.1.0`.
- Peer dependencies:
  - `react: ">=18.0.0"`
  - `react-dom: ">=18.0.0"`
  - `@react-spring/web: ">=9.0.0"`
- Build scripts:
  - `pnpm --filter liquid-ui build`: Runs `vite build --config vite.lib.config.ts && tsc -p tsconfig.build.json`.
  - Generates `dist/index.mjs` (ESM), `dist/index.cjs` (CommonJS), `dist/styles.css`, and full TypeScript declaration tree in `dist/types/`.

---

## 21. Prioritized Documentation Gaps

- **CRITICAL**:
  - Step-by-step Quickstart guide (Installation, `LiquidProvider` setup, importing styles).
  - Dedicated component pages for every public component with full prop tables.
  - Material reference explaining how thickness, refraction, dispersion, and glare interact.
- **IMPORTANT**:
  - Explaining the difference between `textured` and `dom` backdrop modes.
  - Guide on custom presets and material overrides.
  - Accessibility best practices and contrast guidance.
- **ADVANCED**:
  - SDF mathematics, superellipse roundness, and blob merging mechanics.
  - Multi-pass rendering pipeline walkthrough (WebGL2 and WebGPU).
  - WebGL/WebGPU buffer memory layouts and uniform vector limits.
- **INTERNAL / CONTRIBUTING**:
  - Adding new components, materials, or shaders.
  - Build and release workflow.

---

## 22. API Inconsistencies & Verifications

- **Verified**: `MAX_SHAPES` is 48 in `shapes.ts` and shader headers.
- **Verified**: `LiquidIconButton` strictly requires `aria-label`.
- **Verified**: `LiquidInput` forwards ref to the inner `<input>` element while applying glass to the container.
- **Verified**: `LiquidModal` uses `createPortal(..., document.body)` and requires client DOM (`typeof document !== 'undefined'`).
- **Verified**: Stylesheet `import './styles/styles.css'` is bundled in the JS entry, but consumers can also import `liquid-ui/styles.css` directly.

---

## 23. Documentation Terminology Map

- **Liquid UI (`liquid-ui`)**: The reusable React component library.
- **Liquid Glass Studio**: The visual playground and shader experimentation application.
- **`LiquidProvider`**: The root React component managing the canvas and GPU engine.
- **`LiquidSurface`**: The core primitive registering DOM geometry to the GPU shape registry.
- **`LiquidMaterial`**: The TypeScript interface defining optical properties.
- **`LiquidPresetName`**: Named preset identifier (`'soft'` | `'clear'` | `'frosted'` | `'dark'` | `'strong'`).
- **Backdrop Mode**: The pixel acquisition mode (`'textured'` | `'dom'` | `'css'`).
- **SDF (Signed Distance Field)**: Mathematical distance representation used to render smooth shapes and squircle bevels on the GPU.
- **Squircle / Roundness**: Superellipse curvature where exponent $n=5$ produces Apple-style squircle corners.
- **Smooth Minimum (`smin`)**: The algorithm blending adjacent shapes into liquid blobs.

---

## 24. Recommended Future Documentation Architecture

```
Documentation Site
├── Introduction
│   ├── What is Liquid UI?
│   ├── Why Liquid Glass?
│   └── Architecture Overview
├── Getting Started
│   ├── Installation & Setup
│   ├── Quick Start Guide
│   ├── Your First Glass Component
│   └── Styling & CSS
├── Core Concepts
│   ├── LiquidProvider & Canvas Lifecycle
│   ├── LiquidSurface Primitive
│   ├── Backdrop Modes (DOM vs. Textured)
│   ├── The Material System
│   └── Interaction & Springs
├── Components
│   ├── LiquidButton
│   ├── LiquidCard
│   ├── LiquidDiv
│   ├── LiquidPill
│   ├── LiquidInput
│   ├── LiquidIconButton
│   ├── LiquidToggle
│   ├── LiquidTooltip
│   ├── LiquidModal
│   ├── LiquidDock & LiquidDockItem
│   ├── LiquidBlob & LiquidBlobShape
│   └── LiquidSurface
├── Materials & Visuals
│   ├── Material Properties Reference
│   ├── Built-in Presets
│   ├── Creating Custom Materials
│   └── Visual Effects (Refraction, Dispersion, Glare, Fresnel, Shadows)
├── Guides
│   ├── Building Real Interfaces
│   ├── Working with Images & Videos
│   ├── Interaction & Motion Tuning
│   └── Responsive Glass Layouts
├── Advanced
│   ├── Rendering Pipeline Deep Dive
│   ├── WebGL2 Backend
│   ├── WebGPU Backend
│   ├── SDF Shapes & Squircle Curvature
│   └── Blob Merging Mechanics
├── Production & Diagnostics
│   ├── Performance Best Practices
│   ├── Accessibility Guide
│   ├── Fallback Chain & Browser Support
│   └── Troubleshooting & FAQ
├── API Reference
│   ├── Components API
│   ├── Materials API
│   ├── Hooks API
│   ├── Engine API
│   └── TypeScript Definitions
└── Contributing
    ├── Development Setup
    ├── Architecture & Shaders
    └── Maintaining Documentation
```

---
*End of Phase 1 Deliverable.*
