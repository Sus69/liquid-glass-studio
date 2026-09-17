# liquid-ui

Reusable liquid-glass UI components for React, powered by the rendering engine
extracted from [Liquid Glass Studio](https://github.com/…).

```tsx
import { LiquidButton } from 'liquid-ui';

<LiquidButton>Get Started</LiquidButton>
```

No canvas. No shaders. No renderer setup. The engine underneath does the GPU
work (WebGPU when available, WebGL2 otherwise); your components stay real,
accessible DOM.

---

## Install

```bash
npm install liquid-ui
# peer deps: react >= 18, react-dom >= 18, @react-spring/web >= 9
```

## Quick start

Wrap your app (or any subtree) once in `LiquidProvider`. It owns **one shared
GPU canvas** that renders the glass material for every liquid component on the
page.

```tsx
import { LiquidProvider, LiquidCard, LiquidButton } from 'liquid-ui';

export default function App() {
  return (
    <LiquidProvider backdrop={{ mode: 'dom' }}>
      <LiquidCard glass="frosted" radius={24}>
        <h2>Hello</h2>
        <LiquidButton variant="primary">Continue</LiquidButton>
      </LiquidCard>
    </LiquidProvider>
  );
}
```

Then load the stylesheet once:

```ts
import 'liquid-ui/styles.css';
```

## Components

| Component | Element | Notes |
| --- | --- | --- |
| `LiquidDiv` | `<div>` | General glass container; the base primitive |
| `LiquidButton` | `<button>` | Variants `primary/secondary/ghost`, sizes, `loading`, `disabled` |
| `LiquidCard` | `<div>` | `interactive` for pointer-following motion |
| `LiquidPill` | `<span>` | Tags, statuses, filters |
| `LiquidInput` | `<input>` | Real text input with a glass surround |
| `LiquidIconButton` | `<button>` | Requires `aria-label` |
| `LiquidToggle` | `<button role="switch">` | Spring-based thumb |
| `LiquidTooltip` | portal + `role="tooltip"` | Wraps any trigger |
| `LiquidModal` | accessible dialog | Focus trap, `Esc` to close |
| `LiquidDock` + `LiquidDockItem` | `<nav>` + items | Pointer-proximity magnification |
| `LiquidBlob` | decorative layer | The Studio's SDF `smin` merging, as a primitive |

`LiquidSurface` is the lower-level primitive all of the above are built on —
use it directly for custom shapes.

## Materials

Every component accepts `glass` as a preset name or a partial override:

```tsx
<LiquidCard glass="soft" />
<LiquidCard glass="dark" />

<LiquidDiv
  glass={{ blur: 18, refraction: 0.8, dispersion: 0.2, glare: 0.3, thickness: 20 }}
>
  Content
</LiquidDiv>
```

Presets: `soft`, `clear`, `frosted`, `dark`, `strong` (the Studio defaults).

The full `LiquidMaterial` maps 1:1 onto the original Studio shader uniforms —
`thickness` → `u_refThickness`, `dispersion` → `u_refDispersion`,
`fresnel` → `u_refFresnelFactor`, `glare` → `u_glareFactor`, and so on. Advanced
users can import `LIQUID_PRESETS`, `resolveMaterial` and
`materialToShapeUniforms` for full control; basic usage never needs them.

## Backdrop modes

`LiquidProvider` decides how the glass obtains the pixels behind it:

- **`dom`** *(default)* — one transparent GPU canvas overlays the page. The
  engine draws shape edges, refraction rims, Fresnel, glare, tint and shadows
  with per-pixel alpha (premultiplied compositing); the interior blur of real
  page content comes from `backdrop-filter` on the component. Best for normal
  app UI over any DOM content.
- **`textured`** — full Studio fidelity. The backdrop (image, video, canvas) is
  uploaded as a GPU texture and the complete 4-pass pipeline — background +
  separable Gaussian blur, refraction, dispersion, LCH glare — runs against it.
  Use for hero surfaces over known imagery.
- **`css`** — no GPU. Pure `backdrop-filter`/box-shadow approximation;
  automatic fallback when WebGPU **and** WebGL2 are both unavailable.

Selection is automatic (`WebGPU → WebGL2 → CSS`) unless you pin it:

```tsx
<LiquidProvider backend="webgl" backdrop={{ mode: 'textured', source: photoUrl }}>
```

## Performance

- **One renderer per page**, not per component — 29 surfaces share a single
  canvas and pipeline.
- **Render-on-demand** — the loop skips GPU submission when nothing is dirty or
  in motion; static pages cost one cheap check per frame.
- **Blur batching** — shapes with similar blur radii share one blur pass
  (`blurGroupKey` quantizes upward so nothing under-blurs).
- **Capped DPR**, resolution-scaled canvas, visibility-based unregistration
  (offscreen shapes stop rendering), and full disposal on unmount.

## Accessibility & motion

Components render semantic DOM (`<button>`, `<input>`, `role="switch"`,
focus-trapped dialogs). The GPU canvas is `aria-hidden` and `pointer-events:
none`. `prefers-reduced-motion` disables hover/press spring animation.

## TypeScript

The public API is fully typed — `LiquidMaterial`, `LiquidPresetName`,
`LiquidBackdropMode`, `LiquidInteraction`, per-component props — with no `any`
in the exported surface. Types ship with the package.

## Development

This package lives in the `liquid-glass-studio` pnpm workspace:

```bash
pnpm install
npx pnpm --filter liquid-ui test        # vitest unit tests
npx pnpm --filter liquid-ui typecheck   # tsc --noEmit
npx pnpm --filter liquid-ui build       # ESM + CJS + d.ts into dist/
npx pnpm dev                            # Studio (engine playground)
# Showcase page (exercises every component through the library):
npx pnpm exec vite --open /showcase.html
```

The original **Studio** app is preserved as the engine's debug playground: its
Leva controls drive the same engine the components use.

## Full documentation

Complete API reference — architecture diagram, every component prop, the full
material→uniform mapping, backdrop modes, performance model, engine internals,
and gotchas — lives in [`docs/API.md`](docs/API.md).

## Credits

Rendering technology (SDF shapes, refraction, dispersion, Fresnel, glare,
multipass compositing) from Liquid Glass Studio.
