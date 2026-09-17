# liquid-ui — Full Documentation

Reusable liquid-glass UI components for React, powered by a shared
WebGL2/WebGPU rendering engine extracted from **Liquid Glass Studio**.

Components are normal, accessible DOM. The GPU provides the material.
You never touch a canvas, a shader, or a framebuffer.

```tsx
import { LiquidProvider, LiquidButton } from 'liquid-ui';

<LiquidProvider>
  <LiquidButton>Get Started</LiquidButton>
</LiquidProvider>
```

---

## Table of contents

1. [Architecture](#architecture)
2. [Installation & setup](#installation--setup)
3. [Backdrop modes](#backdrop-modes)
4. [Components](#components)
5. [Materials](#materials)
6. [Interaction & motion](#interaction--motion)
7. [Performance model](#performance-model)
8. [Fallback chain](#fallback-chain)
9. [Accessibility](#accessibility)
10. [TypeScript exports](#typescript-exports)
11. [Advanced / engine API](#advanced--engine-api)
12. [Development](#development)
13. [Gotchas & limits](#gotchas--limits)

---

## Architecture

```
                 Browser DOM (your content — always real elements)
                     │
              LiquidProvider  (owns ONE LiquidEngine)
                     │
               LiquidSurface  (per-component primitive:
                     │         registers shape + material)
                     ▼
              ShapeRegistry  (N shapes → packed vec4 uniform arrays)
                     │
                 LiquidEngine  (shared canvas, render-on-demand loop,
                     │          blur batching, texture lifecycle)
              ┌──────┴──────┐
              ▼             ▼
          WebGPU        WebGL2  →  CSS fallback
              └──────┬──────┘
                     ▼
        4-pass pipeline (from the original Studio):
        bgPass → vBlur → hBlur (separable Gaussian)
              → mainPass (SDF shapes, refraction,
                dispersion, Fresnel, glare, LCH color)
                     ▼
        Composited glass behind your DOM (premultiplied alpha)
```

- **GPU = material.** Shapes, rims, refraction, dispersion, Fresnel, glare,
  shadows render on the GPU (the Studio's shaders, generalized to N shapes).
- **DOM = content & semantics.** Text, icons, inputs are real elements layered
  above the shared canvas. Nothing critical ever lives inside WebGL.
- **One engine per `LiquidProvider`** — one canvas, one pipeline, no matter
  how many components.

---

## Installation & setup

```bash
npm install liquid-ui
# peer deps: react >= 18, react-dom >= 18, @react-spring/web >= 9
```

Wrap your app once and load the stylesheet once:

```tsx
import { LiquidProvider } from 'liquid-ui';
import 'liquid-ui/styles.css';
```

### `LiquidProvider` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `backdropMode` | `'textured' \| 'dom' \| 'css'` | `'dom'` | How glass obtains the pixels behind it (see below) |
| `background` | `EngineBgType` | — | Backdrop source for textured mode: `{ kind: 'image', url }`, `{ kind: 'video', url }`, or `{ kind: 'procedural', index: 0\|1\|2 }` |
| `maxDpr` | `number` | `2` | devicePixelRatio cap for the GPU canvas |
| `backend` | `'auto' \| 'webgl' \| 'webgpu'` | `'auto'` | Force a backend (dev/testing) |
| `debugPreserveDrawingBuffer` | `boolean` | `false` | Keep the drawing buffer valid for pixel readback (debug/test only) |
| `className`, `style` | — | — | Forwarded to the root div |

The provider renders `<div class="liquid-ui-root" style="position:relative">`
around its children and inserts the engine canvas as its first child
(`position:absolute; inset:0; pointer-events:none; z-index:0`).

---

## Backdrop modes

| Mode | How it works | Use when |
| --- | --- | --- |
| **`dom`** (default) | One *transparent* GPU canvas overlays the page. The shader outputs per-pixel alpha (premultiplied): opaque rims + light tint veil inside shapes. Interior blur of real page content comes from `backdrop-filter` on each surface. | Normal app UI over arbitrary DOM. |
| **`textured`** | The backdrop (image/video) is uploaded as a GPU texture; the full Studio pipeline runs — background, separable Gaussian blur, refraction bending the actual photo pixels, dispersion (chromatic aberration), LCH glare. | Hero surfaces over known imagery. **Required for refraction/dispersion to be visible** — in `dom` mode the GPU canvas cannot see the page, so those effects have nothing to bend. |
| **`css`** | No GPU. `backdrop-filter` + box-shadow approximations from `materialFallbackStyle()`. | Environments with neither WebGPU nor WebGL2. |

Backend selection is automatic: **WebGPU → WebGL2 → CSS** unless `backend` is
pinned. Device loss and GPU errors are logged loudly
(`[liquid-ui] WebGPU device lost: …`) rather than failing silently.

---

## Components

All components share these props: `glass` (preset name or material override),
`className`, `style`, and forward refs to their underlying DOM element.

### `LiquidSurface` — core primitive (advanced)

```tsx
<LiquidSurface as="div" glass="frosted" radius={20} pressDepth={0.06}
               interaction={{ hover: true, press: true, strength: 0.12 }}>
  {children}
</LiquidSurface>
```

Every component composes this. It renders the semantic element (`as` prop),
registers its geometry + material with the engine, drives press/hover springs,
reports pointer-normalized offsets (`onPointerNorm`), applies the CSS fallback
when GPU is unavailable, and supports `role`, `disabled`, `data-*` passthrough.
Use it directly for custom glass shapes.

### `LiquidDiv` — general container

```tsx
<LiquidDiv glass="strong" radius={24} padding={20} width={320}
           tint="rgba(255,0,0,0.08)" interaction={{ hover: true }}>
  Hello world
</LiquidDiv>
```

| Prop | Type | Notes |
| --- | --- | --- |
| `radius` | `number` | Corner radius (px) |
| `padding` | `number \| string` | |
| `width`, `height` | `number \| string` | |
| `tint` | `string` | CSS color on the DOM layer (in addition to material tint) |
| `interaction` | `LiquidInteraction` | |
| …plus all `HTMLAttributes<HTMLDivElement>` | | |

### `LiquidButton` — real `<button>`

```tsx
<LiquidButton variant="primary" size="lg" loading disabled onClick={…}>
  Get Started
</LiquidButton>
```

- `variant`: `'primary'` (strong preset, white text) · `'secondary'` (soft) ·
  `'ghost'` (clear, no backdrop-filter)
- `size`: `'sm' | 'md' | 'lg'` (padding/font-size presets)
- `loading`: spinner replaces nothing — it is prepended and the button
  disables while loading
- `radius` (default 14), `glass`, `interaction` (default hover+press,
  strength 0.16, pressDepth 0.08)
- Spring compression on press (the SDF shape deforms — not a CSS scale),
  pointer-following glare displacement on hover, `:focus-visible` ring.

### `LiquidCard`

```tsx
<LiquidCard interactive glass="frosted" radius={20}>…</LiquidCard>
```

`interactive` enables pointer-following response (hover spring, strength 0.1).
`glass` defaults to `'soft'`.

### `LiquidPill`

```tsx
<LiquidPill statusColor="#34d399" glass="soft">Online</LiquidPill>
```

`statusColor` renders a leading dot. Radius 999, no hover interaction by
default. All div attributes supported.

### `LiquidInput` — real `<input>`

```tsx
<LiquidInput placeholder="Search…" leading={<SearchIcon />} trailing={…}
             glass="frosted" radius={14} padding="10px 14px"
             value={q} onChange={(e) => setQ(e.target.value)} />
```

The glass is the surround; the input itself is transparent DOM text. All
`InputHTMLAttributes` supported (note: the HTML `size` attribute is excluded
from the prop type).

### `LiquidIconButton` — icon-only `<button>`

```tsx
<LiquidIconButton aria-label="Search" size={40} radius={20} glass="soft">
  <SearchIcon />
</LiquidIconButton>
```

`aria-label` is **required** (type-enforced). Strong pointer interaction:
hover+press springs, strength 0.2, pressDepth 0.1.

### `LiquidToggle` — accessible switch

```tsx
<LiquidToggle checked={on} onCheckedChange={setOn}
              aria-label="Hi-res audio" width={52} glass="strong" />
```

`role="switch"` + `aria-checked`; spring-driven thumb rides the DOM while the
track is the liquid material. `disabled` supported. Height = width × 0.55.

### `LiquidTooltip`

```tsx
<LiquidTooltip content="Copy" side="top" delayMs={150}>
  <LiquidIconButton aria-label="Copy">…</LiquidIconButton>
</LiquidTooltip>
```

Portal to `document.body` (escapes overflow clipping), `role="tooltip"`,
`aria-describedby` wiring, glass defaults to `'dark'`.

### `LiquidModal`

```tsx
<LiquidModal open={open} onClose={() => setOpen(false)}
             ariaLabel="Settings" glass="frosted" radius={26}>
  …panel content…
</LiquidModal>
```

Focus trap (Tab/Shift-Tab cycle), Escape closes, overlay click closes,
`aria-modal` dialog, focus restored to the previously focused element.

### `LiquidDock` + `LiquidDockItem` — navigation showcase

```tsx
<LiquidDock magnification={1.45} proximity={110} radius={26} glass="clear">
  <LiquidDockItem aria-label="Home" onClick={…} glass="soft">🏠</LiquidDockItem>
  <LiquidDockItem aria-label="Projects" onClick={…}>📁</LiquidDockItem>
</LiquidDock>
```

Pointer proximity drives per-item spring magnification (default max ×1.45,
falloff 110px) with lift; the shared SDF merge makes neighboring items blend
gooey-ly as they grow. Items are `role="button"` + `tabIndex=0` with
Enter/Space activation. Each item accepts its own `glass`.

### `LiquidBlob` + `LiquidBlobShape` — SDF merging primitive

```tsx
<LiquidBlob merge={0.12} glass="clear"
            style={{ position: 'relative', width: 300, height: 200 }}>
  <LiquidBlobShape x={40} y={40} width={100} height={100} radius={50} />
  <LiquidBlobShape x={120} y={60} width={80} height={80} radius={40} />
</LiquidBlob>
```

The Studio's smooth-min (`smin`) blob merging as a component: sibling shapes
melt together where they approach. `merge` (0–0.3, higher = gooier) propagates
into every shape's material. Shapes are absolutely positioned by `x/y/width/
height` (numbers = px, strings = any CSS value). Content inside shapes is real
DOM.

---

## Materials

`glass` accepts a **preset name** or a **partial override** object
(`LiquidMaterialOverride`); `undefined` = `'strong'`.

### Presets

| Preset | Character | blur | thickness | refraction | dispersion | tint |
| --- | --- | --- | --- | --- | --- | --- |
| `soft` | barely-there glass | 2 | 12 | 1.2 | 2 | white 8% |
| `clear` | crisp refraction | 1 | 24 | 1.5 | 10 | none |
| `frosted` | milky, heavy blur | 12 | 16 | 1.25 | 1 | white 28% |
| `dark` | smoked glass | 4 | 22 | 1.45 | 6 | #0c0e14 55% |
| `strong` | **Studio defaults** | 1 | 20 | 1.4 | 7 | none |

```tsx
<LiquidCard glass="frosted" />
<LiquidCard glass={{ blur: 18, refraction: 0.8, glare: 0.3 }} />
```

Overrides deep-merge onto `strong` (`tint` and `shadowOffset` merge
per-field). Presets are deep-copied on resolve — mutating a resolved material
never leaks into the global presets.

### Full `LiquidMaterial` → uniform mapping

| Field | Type | Uniform | Meaning |
| --- | --- | --- | --- |
| `thickness` | px | `u_refThickness` | Glass edge thickness |
| `refraction` | 1–4 | `u_refFactor` | Index of refraction (1 = none) |
| `refractionDistance` | 0–0.2 | `u_refDistance` | Refraction offset distance |
| `dispersion` | 0–50 | `u_refDispersion` | Chromatic aberration |
| `fresnel` | 0–1 | `u_refFresnelFactor` | Edge-light intensity |
| `fresnelRange` | 0–100 | `u_refFresnelRange` | Fresnel falloff range |
| `fresnelHardness` | 0–1 | `u_refFresnelHardness` | Edge hardness |
| `glare` | 0–1.2 | `u_glareFactor` | Glare intensity |
| `glareRange` | 0–100 | `u_glareRange` | Glare band range |
| `glareHardness` | 0–1 | `u_glareHardness` | Band hardness |
| `glareConvergence` | 0–1 | `u_glareConvergence` | Convergence exponent |
| `glareOppositeFactor` | 0–1 | `u_glareOppositeFactor` | Opposite-side multiplier |
| `glareAngle` | degrees | `u_glareAngle` | Glare rotation (default −45) |
| `blur` | px 0–200 | `u_blurRadius` + weights | Interior backdrop blur |
| `borderBlend` | bool | `u_blurEdge` | Blend blur through the whole edge |
| `tint` | `{r,g,b,a}` | `u_tint` | rgb 0–255, a 0–1 |
| `shadow` | 0–1 | `u_shadowFactor` | Shadow strength |
| `shadowExpand` | 0–100 | `u_shadowExpand` | Shadow spread |
| `shadowOffset` | `{x,y}` | `u_shadowPosition` | Shadow offset |
| `merge` | 0–0.3 | `u_mergeRate` | smin blob merge radius |
| `radius` | px | `u_shapeRadius` | Corner radius |
| `roundness` | 2–7 | `u_shapeRoundness` | Superellipse exponent (2=ellipse, 5≈iOS squircle, 7=max) |

Ranges are the original Studio's Leva control ranges. Helpers:
`LIQUID_PRESETS`, `resolvePreset(name)`, `cloneMaterial(m)`,
`resolveMaterial(glass)`, `materialToShapeUniforms(m)`.

---

## Interaction & motion

```ts
interface LiquidInteraction {
  hover?: boolean;   // pointer-following motion
  press?: boolean;   // spring compression
  strength?: number; // hover displacement multiplier (~0.08–0.2)
  spring?: LiquidSpringConfig; // { stiffness, damping, mass? }
}
```

- Springs are integrated per-frame in the engine scheduler (semi-implicit
  Euler; `ScalarSpring`/`PointerSpring` are exported for custom use).
- Hover displacement shifts the **GPU shape** (offsetX/offsetY), so the glass
  itself moves — not just the DOM.
- Press depth compresses the shape (`scale`), recovering with spring physics.
- `prefers-reduced-motion: reduce` disables hover/press springs and all CSS
  transitions/animations.

---

## Performance model

- **One renderer per page.** All surfaces share the provider's single canvas
  and pipeline (verified: 27 surfaces → 1 canvas).
- **Render-on-demand.** The rAF loop skips GPU submission when nothing is
  dirty, springs are settled, and no video is playing — static pages cost one
  cheap check per frame.
- **Per-frame geometry sync.** The engine re-measures every registered
  element each frame (batched into one contiguous reflow) so fixed-position
  components, scrolling, and transform-based magnification never desync from
  their GPU shapes. Unmoved shapes are not marked dirty.
- **`MAX_SHAPES = 24`.** The uniform arrays render up to 24 shapes per frame
  (sized to stay under WebGL2's guaranteed 224 fragment uniform vectors).
  Additional shapes beyond 24 are skipped by packing order.
- **Blur batching.** Shapes share one blur pass per frame — `blurGroupKey`
  quantizes blur upward into buckets (1/2/4/8/16/32/64) and the majority
  bucket wins for that frame.
- **DPR cap** (`maxDpr`, default 2), canvas sized to the root, intermediate
  buffers are RGBA16F and reused across frames.
- **Visibility culling.** IntersectionObserver (rootMargin 120px) unregisters
  off-screen shapes — scrolling the dock out of view costs zero GPU work.
- **Full disposal.** Unmount releases textures, buffers, and the canvas.

---

## Fallback chain

```
WebGPU → WebGL2 → CSS
```

CSS fallback (`materialFallbackStyle`) approximates the material with
`backdrop-filter: blur(...) saturate(1.4)`, a tinted fill, and box-shadows —
functional, gracefully degraded, never the primary path. The `.liquid-ui-fallback`
class carries the base styles; surfaces also get component fallback classes.

---

## Accessibility

| Component | DOM semantics |
| --- | --- |
| LiquidButton / LiquidIconButton | `<button>` (icon button requires `aria-label`) |
| LiquidInput | `<input>` |
| LiquidToggle | `<button role="switch" aria-checked>` |
| LiquidDockItem | `role="button"` + keyboard Enter/Space |
| LiquidModal | dialog, focus trap, Esc, `aria-modal` |
| LiquidTooltip | `role="tooltip"` + `aria-describedby` |

The engine canvas is `aria-hidden` and `pointer-events: none`. Focus-visible
rings ship for all interactive components.

---

## TypeScript exports

Types: `LiquidMaterial`, `LiquidMaterialOverride`, `LiquidPresetName`,
`LiquidBackdropMode`, `LiquidBackendKind`, `LiquidBackendInfo`, `LiquidRGB`,
`LiquidRGBA`, `LiquidShapeState`, `LiquidSpringConfig`, `LiquidInteraction`,
`LiquidComponentProps`, `LiquidTextureHandle`, `LiquidGlassInput`, plus
per-component props interfaces. No `any` in the public surface. d.ts ships
with the build.

---

## Advanced / engine API

Exported for Studio-style consumers — not needed for basic usage:

- `LiquidEngine` — `attach(container)`, `setBackground(bg)`,
  `computeShapeGeometry(el, material)`, `dispose()`. Owns `registry`
  (`ShapeRegistry`: register/unregister/update/setVisible/pack/packed) and
  `scheduler` (`Scheduler`: render-on-demand rAF loop).
- `MultiPassRenderer` (WebGL2: `ShaderProgram`, `FrameBuffer`, `RenderPass`,
  `setBlendMode('premultiplied' | 'opaque')`) and `GPUMultiPassRenderer`
  (WebGPU, matching pass layout, RGBA16F intermediates).
- Texture helpers: `createEmptyTexture`, `loadTextureFromURL`,
  `updateVideoTexture` (GL) and `gpu*` equivalents.
- `detectWebGPU()`, `computeGaussianKernelByRadius(radius)`.
- Debug handle: `window.__LIQUID_UI__ = { engine, registry }` (set by the
  provider) — inspect live shape state in devtools, e.g.
  `__LIQUID_UI__.registry.list()`.

Engine shader note: per-shape data is packed as 8 `vec4[MAX_SHAPES]` arrays
(`u_shapesA/B/C`, `u_shapeM0-M3`, `u_shapeTint`) so the layout is identical
under std140 (GLSL) and WGSL. `MAX_SHAPES` must stay in sync across
`shaders/lib/sdf.glsl`, the WGSL uniform structs, `shapes.ts`, and the WebGPU
uniform buffer size (64-byte header incl. pad + 8 arrays × 24 vec4s × 16 bytes = 3136 bytes).

---

## Development

```bash
cd liquid-glass-studio
npx pnpm install                     # link the workspace

npx pnpm --filter liquid-ui test     # vitest (23 tests)
npx pnpm --filter liquid-ui typecheck
npx pnpm --filter liquid-ui build    # dist: index.mjs + index.cjs + styles.css + d.ts

npm run dev                          # Studio:      http://localhost:5173/
# pages: / (Studio), /showcase.html, /mock.html (Prism max-material demo)
# params: ?bg=photo | ?bg=video | ?dom=1 (mock) | ?backend=webgl | ?debugReadback=1
```

---

## Gotchas & limits

- **Refraction/dispersion need `textured` mode.** In `dom` mode the GPU canvas
  can't see page content, so only rims/glare/tint/shadow render — by design.
- **24 shapes max per frame** (see MAX_SHAPES above).
- **Dark themes:** DOM-mode surfaces tint dark via `glass="dark"` or a
  `tint` override; the CSS fallback fills otherwise read white-ish.
- **Svelte/Vue/etc.:** the engine is framework-agnostic; only the React layer
  ships today. Web Components wrappers were deliberately deferred (the React
  API is primary).
- **StrictMode is safe:** the provider recreates the engine per effect mount;
  attach is idempotent.
