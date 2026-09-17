# RENDERING FORENSICS — Liquid Glass Studio / liquid-ui

**Scope:** every pixel of `/` (Studio), `/mock.html` (Prism), `/showcase.html`, produced by the actual source in this repo. Everything below is **verified against source files** (paths given inline) and, where marked **[LIVE]**, against the running page via DOM/computed-style probes. Spec/browser/project classification is explicit.

**How to read this document.** There are two independent pixel pipelines that merge once, at one well-defined point:

- **Pipeline D (DOM):** the browser's normal cascade → layout → paint → composite of HTML/CSS.
- **Pipeline G (GPU):** the library's own 4-pass WebGL2/WebGPU renderer drawing into one `<canvas>`, which is just an ordinary replaced element in Pipeline D.

The GPU canvas is **not** special to the compositor. It is painted at its DOM position, in the paint order of its stacking context, exactly like an `<img>`. Everything above it must therefore be explained by DOM rules; everything *inside* it is explained by the draw-call order below.

Stage order (spec-mandated, for reference throughout):

```
DOM order → CSS cascade (style) → computed style → layout/formatting →
stacking-context construction → painting order → (compositor: layerize →
rasterize → composite) → screen
```

---

## 1. The stage pipeline and what each stage consumes

| Stage | Inputs | Project-specific actors |
|---|---|---|
| **DOM order** | JSX render tree | `LiquidProvider` renders container div, then children; `LiquidEngine.doAttach` **inserts the canvas as `container.firstChild`** (`LiquidEngine.ts`, `insertBefore(canvas, container.firstChild)`) — canvas is DOM-first among root children **[LIVE: `canvasIsFirstChild: true`]** |
| **CSS cascade** | 3 stylesheets + inline styles + injected `<style>`s | `src/index.scss` (Studio page only), `packages/liquid-ui/src/styles/styles.css` (imported once via `src/index.ts`), `App.module.scss` (Studio), runtime-injected: mock's `noCssBlur` (`main.tsx` appends `!important` backdrop-filter kill), `LiquidButton.tsx` module-scope `#liquid-ui-keyframes` spinner keyframes |
| **Computed style** | cascade result | materials are NOT CSS — they become **shader uniforms** (see §4) |
| **Layout** | computed styles | `PrismApp` layout is inline-style flex; the fixed dock wrapper is `position:fixed; left:0; right:0; bottom:26; pointer-events:none` |
| **Stacking contexts** | positioned/effected elements | full census in §3 |
| **Paint order** | stacking contexts | CSS painting algorithm; canvas paints at its tree position (§3) |
| **Raster/Composite** | paint ops | SPEC: canvas content is composited as a texture. BROWSER DETAIL (Chrome): the canvas gets its own composited layer once it has a WebGL/WebGPU context; drawingBuffer invalidation after present (WebGL, absent `preserveDrawingBuffer`) is implementation behavior this project explicitly relies on (`debugPreserveDrawingBuffer` option exists because default `false` makes `readPixels` outside the render frame read garbage) |

**Why this matters here:** z-index alone decides nothing. Order of staged data (see §7.2) decides *what* the GPU draws, and DOM/cascade rules decide *where the canvas result lands* relative to every other pixel.

---

## 2. Page-by-page element inventory (source → DOM → paint)

### 2.1 `/` — Studio (`index.html` → `src/main.tsx` → `App.tsx`)

DOM skeleton (final, after React commits):

```
body                                  ← index.scss grid-pattern background (CSS gradients, body layer)
└── #root                             ← normal flow, no position → NOT a stacking context
    ├── (leva panel)                  ← portal'd by leva to #root > div; App.module.scss targets
    │                                    `#root > div[class^='leva-']` with translucent bg
    ├── header.header                 ← App.module.scss: position:fixed; top:12px; centered via
    │                                    transform:translateX(-50%) → transform CREATES a stacking
    │                                    context; no z-index → z:auto, paints in tree order among
    │                                    positioned = above in-flow siblings that come later?? NO —
    │                                    it is BEFORE the canvas window in tree order, both
    │                                    positioned (fixed / relative), no z-index on either →
    │                                    tree order wins → canvas window paints ABOVE header
    ├── PresetControls                 ← in-flow
    └── ResizableWindow                ← wraps the canvas container (relative wrapper)
        └── div.canvasContainer        ← overflow:hidden (clips children)
            └── canvas.styles.canvas   ← THE studio GPU canvas. transform:scale(calc(1/var(--dpr)))
                                         transform-origin:top left → transform creates a stacking
                                         context AND is the DPR display-size mechanism: backing
                                         store = width*dpr, CSS size = layout size, displayed at 1/dpr.
                                         touch-action:none (no rendering effect)
```

Notes:
- `--dpr` is set as an **inline CSS variable on the canvas element** (`style={{['--dpr']: canvasInfo.dpr}}`) and consumed *only* by `.canvas { transform: scale(calc(1 / var(--dpr))) }`. Custom properties inherit, but no descendant uses it. If you change `canvasInfo.dpr` without resizing the backing store, the on-screen size changes via this transform — a pure JS-state → CSS-var → transform → compositing chain.
- The Studio has **no liquid-ui components registered**; it drives the same `MultiPassRenderer`/`GPUMultiPassRenderer` classes directly with `u_mouse`/`u_shapeWidth`/etc. Its render loop is an unconditionally-scheduled `requestAnimationFrame` (`App.tsx` render effect) — unlike the library's render-on-demand scheduler.
- Two shapes: fixed circle + mouse-following rect, hardcoded in `src/shaders/lib/sdf.glsl` (different file from the library's — the Studio keeps its own shader copies for STEP-debug parity; `studioEngineAdapter.ts` exists but `App.tsx` currently builds its renderers from `src/shaders/*` directly).
- Leva panel: portal'd fixed-position UI; above the page by DOM order (last portal child) + fixed positioning, inside its own stacking contexts. `.bgSelect` uses `position:relative; z-index:2` to sit above sibling panel content.

### 2.2 `/mock.html` — Prism (`mock.html` → `src/mock-ui/main.tsx` → `PrismApp.tsx`)

Runtime style injections before render:
1. `#liquid-ui-keyframes` (`LiquidButton.tsx` module scope — fires at import time).
2. `noCssBlur` (`main.tsx`): `.liquid-ui-surface { -webkit-backdrop-filter:none !important; backdrop-filter:none !important; }` — appended to `<head>`, so it lands **after** styles.css in the cascade; with `!important` it wins regardless.

DOM skeleton (verified live):

```
body
└── #root
    └── div.liquid-ui-root                 ← position:relative (inline), z:auto → NOT a stacking
        │                                     context; establishes nothing but IS the coordinate
        │                                     origin for all shape math (rootRect subtraction)
        ├── canvas.liquid-ui-engine-canvas  ← inserted by engine as FIRST CHILD [LIVE verified]
        │                                     inline: position:absolute; inset:0; width/height:100%;
        │                                     pointer-events:none; z-index:0 → positioned + z:0 ⇒
        │                                     STACKING CONTEXT, participates in root's context
        │                                     (see §3 for why z:0 ≠ z:auto matters)
        └── div (content wrapper)           ← position:relative; zIndex:1; padding — positioned,
            │                                 z:1 ⇒ STACKING CONTEXT above canvas
            ├── (wallpaper div)              ← ONLY in dom mode: position:fixed; inset:0;
            │                                 zIndex:0; radial-gradients; aria-hidden
            │                                 ⇒ positioned, z:0 ⇒ SAME stacking level as the
            │                                 canvas, LATER in tree order → paints ABOVE the GPU
            │                                 canvas [LIVE hide-test verified: hiding it reveals
            │                                 the canvas's procedural background + raw rims]
            ├── header (top bar)
            │   ├── div(logo row)
            │   │   ├── LiquidBlob           ← div.liquid-ui-blob (relative, pointer-events:none
            │   │   │                           via .liquid-ui-blob class)
            │   │   │   ├── LiquidBlobShape  ← div.liquid-ui-surface, position:absolute, left/top/
            │   │   │   │                       width/height inline, borderRadius inline, zIndex:1
            │   │   │   └── LiquidBlobShape  ← (2 shapes, smin-merged in GPU via material.merge)
            │   │   └── text (Prism / max material build)
            │   ├── LiquidInput              ← div.liquid-ui-surface (flex, inline styles) wrapping
            │   │   │                           a real <input class=liquid-ui-input> + svg icon
            │   │   └── (::placeholder pseudo — color only, no paint-order effect)
            │   └── div (right cluster)
            │       ├── LiquidTooltip → (closed: nothing rendered; open: portal-less sibling div
            │       │     .liquid-ui-tooltip — position:fixed; z-index:1000 — rendered as a SIBLING
            │       │     inside the content wrapper, NOT a portal; escapes clipping only because
            │       │     no ancestor clips)
            │       ├── LiquidTooltip → LiquidIconButton (button.liquid-ui-surface)
            │       └── LiquidPill           ← div.liquid-ui-surface (radius 999 inline)
            ├── main
            │   ├── LiquidCard (hero)        ← div.liquid-ui-surface.liquid-ui-card; contains real
            │   │                               h1/p/div, ProgressTrack (overflow:hidden bar),
            │   │                               6× LiquidIconButton (buttons), LiquidPill
            │   ├── div (side column)
            │   │   ├── LiquidDiv "Up next"  ← div.liquid-ui-surface; 5 track rows (plain divs,
            │   │   │                           AlbumArt gradient divs — opaque, painted above
            │   │   │                           canvas like everything else)
            │   │   └── LiquidDiv "Playback" ← contains 2× LiquidToggle (button.liquid-ui-surface
            │   │                               with span.liquid-ui-toggle__thumb — position:absolute;
            │   │                               transform:translateX(24px) when checked; will-change:
            │       │                               transform), LiquidPill, LiquidButton(ghost)
            │   └── ...
            ├── div (fixed dock wrapper)     ← position:fixed; inset-x:0; bottom:26; z:AUTO;
            │   │                               pointer-events:none — NOT a stacking context,
            │   │                               not positioned-with-z → dock competes in tree order
            │   └── div (pointerEvents:auto)
            │       └── LiquidDock           ← div.liquid-ui-surface.liquid-ui-dock (zIndex:1 from
            │           │                       LiquidSurface base style) — panel shape
            │           └── div (inline-flex row, ref=dockRef; owns onPointerMove)
            │               └── 5× LiquidDockItem ← div.liquid-ui-surface.liquid-ui-dock-item,
            │                                       zIndex:1; JS writes el.style.transform =
            │                                       translateY(lift) scale(v) every frame while
            │                                       springs move (own rAF loop in LiquidDock.tsx)
            └── LiquidModal (closed: null; open: createPortal → document.body)
                └── div.liquid-ui-modal__overlay ← position:fixed; inset:0; z-index:999
                    └── LiquidSurface modal panel ← .liquid-ui-modal__panel + zIndex:1
```

Every `liquid-ui-surface` element: `position:relative` (or absolute for blob shapes) + `borderRadius:<material.radius>px` + `zIndex:1` + class list `liquid-ui-surface [component classes] [fallback classes only if !gpu]` — `LiquidSurface.tsx` `domStyle`.

**The glass you see under Prism is drawn by the ONE canvas** (`canvases: 1` live). Each surface only contributes: geometry (via `getBoundingClientRect` every frame), material (via React state → registry), and DOM content painted normally.

### 2.3 `/showcase.html` — same architecture as mock, no wallpaper, `bg` param selects textured mode. Sections rendered in one column; dock at bottom; modal portals to body.

---

## 3. Stacking context census + THE paint order

### 3.1 What creates a stacking context in this project

| Element | Creator | z-index scope |
|---|---|---|
| `canvas.liquid-ui-engine-canvas` | `position:absolute` + `z-index:0` (inline, `doAttach`) | Own context; participates as z:0 atomic unit in root's context |
| content wrapper div (Prism) | `position:relative` + `zIndex:1` | Own context; all page content lives inside it |
| wallpaper div (dom mode) | `position:fixed` + `zIndex:0` | Own context; same level as canvas, later in tree |
| every `.liquid-ui-surface` | `position:relative` + `zIndex:1` (`domStyle`) | Own context *when inside the wrapper*; the z:1 vs canvas z:0 is what puts DOM content above GPU glass |
| `.header` (Studio) | `transform: translateX(-50%)` (App.module.scss) | z:auto → tree order |
| Studio `canvas` | `transform: scale(...)` | Own context; also a containing block for fixed descendants (none exist) |
| `.liquid-ui-tooltip` | `position:fixed` + `z-index:1000` | Above everything page-level except modal overlay (999 is BELOW 1000 — see 3.3) |
| `.liquid-ui-modal__overlay` | `position:fixed` + `z-index:999` | Portals to `document.body` → sibling of `#root` → escapes ALL root-internal stacking |
| toggle thumb, dock items | `will-change: transform` + JS-written `transform` | Own contexts; dock item transforms are written by the dock's own rAF (`LiquidDock.tsx`), independent of React |
| `.liquid-ui-button:hover` | `filter: brightness(1.06)` on hover | Creates stacking context + containing block **while hovered**; removed otherwise. (`styles.css`) |
| fallback surfaces (no-GPU env) | `backdrop-filter` (`.liquid-ui-fallback`) | Each becomes its own context |
| **NOT a context:** `div.liquid-ui-root` | only `position:relative`, z auto | children's z-indexes resolve against the nearest ancestor context — which is the **root element / initial** context, not the liquid root |

### 3.2 The critical subtlety: `z-index: 0` vs `z-index: auto` on the canvas

The engine canvas has `z-index: 0` (a *number*), making it a stacking context and a positioned participant at level 0. The wallpaper (dom mode) also sits at level 0. **Tie-break = tree order → wallpaper wins → the wallpaper paints over the GPU canvas.** In dom mode this is currently harmless-by-luck because the canvas's own procedural background (what you'd see) is redundant with the wallpaper, and the rim pixels the canvas *does* want visible are... hidden. [LIVE evidence: hiding the wallpaper exposed chessboard-textured rims.]

Consequences & sensitivities:
- Give the canvas `z-index: -1` → it would go behind `#root`'s background… but `#root`/body backgrounds are painted in an earlier phase (root background), so it stays visible — unless any ancestor gains an opaque background. Then the glass disappears *everywhere*.
- Give any in-flow page element `z-index: 0` → it jumps above the canvas (tree order among equal z:0 positioned elements).
- **Make `.liquid-ui-root` a stacking context** (e.g. `isolation: isolate` or any z-index) → canvas (z:0, first child) and wrapper (z:1) become *locally* ordered: canvas below wrapper, **but the wallpaper inside the wrapper (z:0) would then be above the canvas by construction** (canvas z:0 < wrapper z:1, wallpaper inside wrapper). Today, without a root context, the canvas and wrapper interleave in the *global* order.

### 3.3 The actual paint order for `/mock.html` (dom mode), enumerated

Root element's stacking context (the only global one, unless modal is open):

| # | Paint step | Why (rule) |
|---|---|---|
| 1 | `html`/`body` background (none set on mock; user-agent white) | Root background phase |
| 2 | Non-positioned descendants of root element, tree order | Block backgrounds (none — everything relevant is positioned) |
| 3 | **canvas.liquid-ui-engine-canvas** — GPU frame (bg pass composited or transparent glass-only, per §4) | Positioned, z:0, FIRST among z:0 |
| 4 | **wallpaper div** — fixed, z:0, later than canvas | Positioned, z:0, tree order ⇒ covers the canvas |
| 5 | **content wrapper** (z:1) — atomic: all page content, all surfaces, text, icons, track rows, toggles | Positioned, z:1 > z:0 |
| 6 | **dock wrapper** (fixed, z:auto) then inside it LiquidDock surface (z:1) | z:auto tree-order among positioned; internally its surface z:1 |
| 7 | (Studio only) header with transform | z:auto, tree order |
| 8 | (open modal only) overlay z:999 + panel | Portal to body ⇒ painted after #root entirely; 999 > everything above |

Wait — 6 paints after 5? Yes: dock wrapper comes later in tree order, both effectively at auto/z:1 levels... Precisely: dock wrapper is positioned z:auto → paints in tree order among positioned z:auto/0 elements — after the wallpaper. Its inner surface has z:1 but that only orders *within the wrapper's* context... the wrapper is z:auto, so it does NOT create a context; the inner z:1 surface therefore participates in the *global* context, landing in the same bucket as the content wrapper's z:1 — tie → tree order → dock (later) above content. This is exactly the class of subtlety the table exists to capture: **the dock's z:1 escapes its un-contexted fixed wrapper** and joins the global bucket.

Tooltip (`z:1000`) renders as a sibling in the content wrapper — global bucket z:1000, above everything except... nothing; above modal overlay (999) too if both were open (modal's overlay is in body context at 999; tooltip inside content wrapper's z:1 context... **capped by its ancestor's context!** The content wrapper creates a context (z:1), so the tooltip's z:1000 is *local to that context*; the whole wrapper is atomic at global z:1 ⇒ a tooltip can never cover the modal overlay. This is a live example of "z-index cannot escape its stacking context."

### 3.4 `/` (Studio) paint order

| # | Paint step | Why |
|---|---|---|
| 1 | body's grid background (index.scss multi-gradient) | root background |
| 2 | leva panel + bgSelect grid | `#root > div[class^='leva-']` translucent; `.bgSelect` z:2 relative |
| 3 | PresetControls (in-flow) | non-positioned phase |
| 4 | header (fixed, transform → own context, z:auto) | positioned tree order — painted BEFORE 5 |
| 5 | ResizableWindow container + canvas | later positioned sibling ⇒ **canvas window covers the header** if overlapping |
| 6 | leva <select> popups etc. | leva-internal z-indexes, outside root's contexts via portal to body? (leva renders into its own div under #root; its z-indexes are global within that scope) |

---

## 4. Pipeline G — the GPU canvas: exact draw order

The canvas holds a full offscreen multi-pass pipeline. Order is **array order in the configs** (`LiquidEngine.createWebGLRenderer` / `createWebGPURenderer`), identical for both backends:

| Pass | Input | Output | What it computes |
|---|---|---|---|
| 1. `bgPass` | background texture (image/video/none) | FBO `bgPass` (RGBA16F) | Procedural bg (chessboard/solid/gradient) OR cover-fit sampled texture + **per-shape shadow accumulation** (`exp(-abs(d)/expand) × 0.6 × factor`, clamped 0.6) — `fragment-bg.*` |
| 2. `vBlurPass` | `bgPass` texture | FBO | Gaussian vertical blur, weights = `computeGaussianKernelByRadius(blurGroup)` |
| 3. `hBlurPass` | `vBlurPass` texture | FBO | Gaussian horizontal blur |
| 4. `mainPass` (`outputToScreen`) | `u_blurredBg=hBlurPass`, `u_bg=bgPass` | **the canvas** | Scene SDF (all shapes, smin-merged), nearest-shape material selection, refraction offset sampling w/ dispersion (R/G/B at slightly different offsets), fresnel (LCH lightness lift), glare (angle-banded LCH), tint mix, **dom-mode alpha** (`u_transparentBg`), premultiply |

Per-frame canvas ops in WebGL mode (from `LiquidEngine.startLoop.frame`):
1. `measure()` — reads container rect + DPR; if changed: `canvas.width/height = round(css × dpr)` (→ backing-store wipe), `gl.viewport`, `renderer.resize` (all FBOs re-`texImage2D`), `lastPackedCount = -1` (force repaint).
2. Per-frame geometry refresh — for every registered shape: `el.getBoundingClientRect()`, compare against `shape.state` with 0.25px threshold; changed ⇒ update + `dirty`.
3. Video texture update (if video bg): `texImage2D` from the hidden `<video>` (WebGL), or `copyExternalImageToTexture` (WebGPU; recreates the GPUTexture if size changed).
4. **Render-on-demand gate:** `if (!dirty && !hasVideoData && lastPackedCount === packed.count) return;` — a static page costs nothing; this gate is why stale frames were possible historically (the resize bug) and why *every* mutation path must set `dirty` or reset `lastPackedCount`.
5. `registry.pack()` — visible shapes → 8 Float32Arrays × 32 rows (MAX_SHAPES=32; `droppedInLastPack` counted + console.warn'd). `clearDirty()`.
6. Blur-group election: **majority vote** of `blurGroupKey(material.blur)` across visible shapes → ONE shared blur radius for the whole frame (per-shape blur is a grouping key, not per-shape rendering).
7. Uniform push: header (`u_resolution` [device px], `u_dpr`, `u_shapeCount`, `u_mergeRate=0.05` hard-coded, `u_bgType`, `u_bgTextureRatio`, `u_bgTextureReady`, `u_transparentBg`, `u_premultiply=1`) + 8 shape arrays + `u_blurWeights`.
8. WebGL only: `gl.clearColor(0,0,0,0); gl.clear(COLOR|DEPTH)`.
9. `renderer.render({bgPass:{...}, mainPass:{}})` — the 4 passes in order; final pass blends to screen: WebGL `blendFuncSeparate(ONE, ONE_MINUS_SRC_ALPHA, ...)` (premultiplied) in dom mode, BLEND **disabled** in textured mode; WebGPU pipeline always declares `one / one-minus-src-alpha` (with opaque alpha it degenerates to replace).

Inside `mainPass` fragment (per pixel): coordinate normalization (`u_resolution1x = u_resolution/u_dpr`), Y-flip conventions (GLSL: flip shape centers to bottom-up inside `shapeSDFAt`; WGSL: flip `frag_coord` in `fs_main` — *the two conventions are mirror images and both required*), scene SDF (smin over up to 32 shapes, merge `u_mergeRate`), nearest-shape material, edge physics (`edgeFactor` from asin/tan refraction), dispersion sampling, fresnel `pow(1 + d/1500 × (500/range)² + hardness, 5)`, glare band, tint, edge smoothstep, then dom-alpha (rim ⇒ `max(tint.a×0.8, 0.85)`, interior ⇒ `tint.a×0.8`, × coverage, premultiplied).

Coordinate chain (the single canonical transform, worth memorizing):
```
DOM: getBoundingClientRect (viewport CSS px, top-down)
 → minus rootRect.left/top            (root-relative CSS px, top-down)   [registry state x/y, halfWidth/Height]
 → × dpr                              (device px)                        [shader]
 → GLSL: center.y ← u_resolution.y − y×dpr   (device px, bottom-up)      [shapeSDFAt]
 → ÷ u_resolution.y                   (height-normalized SDF units)      [effect math]
 → nmerged = −merged × u_resolution1x.y   (back to CSS px for edge physics)
```
WGSL replaces the third step with `pixel.y ← u_resolution.y − frag_coord.y` and keeps centers top-down. `offsetY` (pointer-follow) is DOM-convention (down-positive) and is **negated** in the GLSL bottom-up space (`vec2(B.w, -C.x)`), while WGSL keeps it positive — mirror-image pairs again.

---

## 5. Complete rendering tree (dom-mode Prism, open tooltip + dock hovered)

```
Viewport / initial containing block
└── Root stacking context (html)
    ├── [1] body/#root backgrounds (UA white)
    │
    ├── [3] canvas.liquid-ui-engine-canvas — STACKING CONTEXT (abs, z:0)
    │   └── GPU composite: [4 GPU passes inside the canvas bitmap]
    │       bgPass → vBlur → hBlur → mainPass(toScreen, premultiplied src-over)
    │       paint position: full root rect (inset:0)
    │
    ├── [4] wallpaper div (fixed, z:0, later tree order) — STACKING CONTEXT
    │   └── (opaque radial gradients — currently OVERLAYS the canvas's rim pixels)
    │
    ├── [5] content wrapper (rel, z:1) — STACKING CONTEXT (atomic globally)
    │   ├── header: logo row [blob container (rel) → 2 abs surfaces (z:1 local)],
    │   │   LiquidInput surface (z:1) → input (in-flow) + svg
    │   │   right cluster: tooltips' trigger buttons; OPEN tooltip div (fixed, z:1000
    │   │   — LOCAL to this context; cannot exceed wrapper's global z:1)
    │   ├── main → hero card surface (z:1) → pill, 6 icon buttons, track div (overflow:hidden)
    │   │   → "Up next" surface (z:1) → 5 rows (opaque AlbumArt divs painted over glass)
    │   │   → "Playback" surface (z:1) → toggles (thumb: abs + will-change:transform
    │   │       + transition transform 260ms — compositor-driven transform animation)
    │   └── (hovered button: :hover filter brightness ⇒ temporary stacking context + ripple-free)
    │
    ├── [6] dock wrapper (fixed, z:auto — NO context)
    │   └── LiquidDock surface (z:1 ⇒ GLOBAL bucket z:1, after wrapper by tree order)
    │       └── 5 items, each z:1 surface + JS transform (scale/lift) per dock rAF
    │
    └── [8] (modal open) overlay (fixed, z:999, portal in body) — STACKING CONTEXT
        └── panel surface (z:1 local) → dialog content
```

GPU-internal draw order (each rendered frame, both backends):

```
1. measure/resize (conditional)
2. rect re-sync (per shape, 0.25px threshold)
3. video frame upload (conditional)
4. dirty gate → early-out
5. pack uniforms (≤32 shapes) + blur-group majority election
6. bgPass draw (fullscreen tri-strip: background + per-shape shadows)
7. vBlurPass draw (bgPass output)
8. hBlurPass draw (vBlur output)
9. mainPass draw → canvas (SDF glass; premultiplied alpha in dom mode)
10. browser compositor: canvas bitmap composited at DOM paint position [3]
```

---

## 6. Per-element table (paint-order facts, dom-mode Prism)

Legend: SC = stacking context. Paint phases: **B**=block background phase, **F**=float, **I**=inline, **P0/P1…**=positioned z-level, tree order within.

| Element | Source | DOM parent | SC? | Position | z-index | Paint phase | Order vs siblings | Compositing layer | Clipping | Transform | Opacity | Blend | Behind it | In front of it | What can change its order |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| engine canvas | `LiquidEngine.doAttach` | `.liquid-ui-root` (first child) | Yes | absolute inset:0 | 0 | P0 (first) | before wallpaper & wrapper | own (accelerated canvas) | none | none | 1 | — | root bg | wallpaper, wrapper, dock, overlays | root gaining isolation; canvas z change; any earlier z:0 sibling |
| wallpaper (dom) | `PrismApp` | content wrapper | Yes | fixed inset:0 | 0 | P0 (second) | after canvas (tree order tie-break) | likely own (fixed) | none | none | 1 | — | canvas | wrapper content, dock | any z≠0; parent context changes; moving it before canvas in tree |
| content wrapper | `PrismApp` | `.liquid-ui-root` | Yes | relative | 1 | P1 | after all z:0 | groups page | none | none | 1 | — | canvas, wallpaper | dock, tooltip(local), overlays | its z; becoming non-positioned |
| hero card surface | `LiquidSurface domStyle` | main | Yes (local) | relative | 1 (local) | inside wrapper | DOM order among z:1 locals | maybe own (backdrop-filter when not killed) | none | none | 1 | — | GPU glass behind it | its children | hover filter (temporary SC), parent wrapper |
| toggle thumb | `styles.css` + inline | toggle surface | Yes (will-change+transform) | absolute | auto | inside toggle | above track | own (will-change) | none | translateX(24px) when checked | 1 | — | track | — | removing will-change (layer loss), data-checked |
| dock item (hovered) | `LiquidDock` rAF | dock row | Yes (JS transform) | flex item | 1 | inside dock surface | scale/lift over neighbors | own while transformed | none | translateY(lift) scale(v) | 1 | — | dock panel glass | sibling items (transformed paints later) | spring settle (transform removed when v===1 & !moving? — see code: only written while moving or v≠1) |
| tooltip bubble | `LiquidTooltip` | content wrapper (sibling) | Yes (fixed z:1000) | fixed | 1000 (LOCAL) | top of wrapper context | inside wrapper: above all wrapper content | own (fixed) | none (no ancestor clips) | translateY(±2px) | 1 | — | wrapper content | nothing outside wrapper (capped at wrapper's global z:1) | wrapper gaining/losing SC; parent z |
| modal overlay | `LiquidModal` (portal→body) | body | Yes (fixed z:999) | fixed | 999 | after #root | above entire app | own | none | none | 1 | — | everything in #root | its panel | any z>999 in body context |
| Studio header | App.module.scss | #root | Yes (transform) | fixed | auto | positioned, tree order | before canvas window | own (transform) | none | translateX(-50%) | 1 | — | earlier siblings | later siblings incl. canvas window | removing transform; z-index on either |
| Studio canvas | App.tsx | .canvasContainer | Yes (transform) | static(!) | auto | in-flow inside container | — | own | container overflow:hidden | scale(1/–-dpr) | 1 | — | container bg | header if later | --dpr change (visual size!), transform removal |
| Leva panel | leva | #root (portal div) | leva-managed | fixed | leva (large) | top | above page | own | none | none | 1 | — | page | nothing (except later portals) | leva version changes |

**Explicitly non-order-affecting properties in this project** (checked so nothing is silently ignored): `pointer-events` (hit-testing only), `touch-action`, `user-select`, `cursor`, `-webkit-tap-highlight-color`, `font`/`letter-spacing`/`white-space` (text layout inside a box, not box order), `background`/`box-shadow` of fallback surfaces (paint *content*, not order), `margin/padding` (layout, not stacking), `.liquid-ui-blob`'s `pointer-events:none` (hit only).

---

## 7. Rendering dependency chains (the "one variable ripples" map)

### 7.1 Verified causal chains in this codebase

1. **`devicePixelRatio` → everything.** `measure()` dpr (capped by `maxDpr`) → `canvas.width/height` → FBO `texImage2D` sizes → `u_resolution` → shader `u_dpr` → (a) `shapeSDF` scales (`hs = halfSize × dpr × scale`), (b) `u_resolution1x` → all edge physics, (c) refraction offset (`× u_dpr`), (d) GLSL Y-flip (`u_resolution.y − y×dpr`). Change dpr without resize ⇒ glass renders at wrong scale/position. Change `maxDpr` prop ⇒ engine re-measures only on next frame's `measure()` — transient mismatch possible for 1 frame.
2. **`container.getBoundingClientRect()` → canvas size → backing store wipe.** Layout shift (font swap, image load, scrollbar) ⇒ resize ⇒ WebGL buffer cleared ⇒ `lastPackedCount=-1` forces one repaint (the resize-repaint fix). Without it: frozen/stale frame (WebGPU: stretched last frame).
3. **Any DOM mutation that moves an element < 0.25px** ⇒ per-frame refresh ignores it (threshold) — sub-pixel drift is intentionally not tracked.
4. **React state (e.g. `liked`) → re-render → inline style change** ⇒ style recalc → paint; no shape dirty unless the rect changes. Color-only changes never wake the GPU loop (correct: GPU doesn't draw DOM content).
5. **`glass` prop change** → `resolveMaterial` → new material object → effect pushes `shape.state.material` + `dirty: true` → next frame repacks + repaints. Live preset switching works through this chain.
6. **Pointer enters surface** → `pointerRef.inside` → hover spring target 1 → scheduler callback steps spring → `offsetX/offsetY = pointer × strength × hover` → `dirty` → GPU offset uniform → *glass* slides up to `strength` px while DOM element stays put. Strength couples DOM and GPU only through the *registry*, never through CSS.
7. **Dock pointer proximity** → dock's own rAF writes `el.style.transform` → layout/composite of item (its own layer) → next engine frame's rect re-sync sees the *transformed* rect (`getBoundingClientRect` includes transforms!) → shape dirty → GPU glass scales/lifts in sync. **This is why transforms in LiquidDock sync the glass automatically** — rect-reads include transform.
8. **`?dom=1`** → `backdropMode='dom'` → `u_transparentBg=1` → mainPass alpha path + `setBlendMode('premultiplied')`; else textured opaque. One query param flips the entire compositing contract of the canvas.
9. **Background image onload** → `bgTextureReady=true` + `lastPackedCount=-1` → next frame repaints with texture (and stops the loading-gradient). The bg pass's *shadows*, however, are drawn regardless of texture readiness — shadows appear before the photo does.
10. **`u_shapeCount` (=packed count) > MAX_SHAPES** ⇒ `droppedInLastPack>0` ⇒ warn + those shapes simply get no glass (GPU-side), DOM unaffected.
11. **`@media (prefers-reduced-motion: reduce)`** → `useReducedMotion` → (a) CSS transitions killed (styles.css), (b) `offsetX/Y` forced 0 in LiquidSurface, (c) dock spring loop disabled entirely. One media query flattens three motion systems.
12. **StrictMode double-mount** → engine created/attached/disposed/created → two canvases transiently? No: dispose removes the canvas (`canvas.remove()`), and the second engine inserts a fresh one. Observable as double `[liquid-ui] engine ready` logs, not visual duplication. ( Historic two-engine bugs came from failed dispose paths. )
13. **`noCssBlur` injected style** → overrides styles.css backdrop-filter via `!important`+later order → surfaces lose their CSS interior blur in dom mode ⇒ the GPU tint veil is the only interior; visual change without any JS change.
14. **`LiquidButton` import** (anywhere) → module-scope keyframes injection → `<style id="liquid-ui-keyframes">` in head → cascade position: after styles.css (import order), harmless (keyframes don't cascade-conflict).
15. **Hover on `.liquid-ui-button`** → `filter: brightness(1.06)` ⇒ **creates a stacking context on the button while hovered** ⇒ descendants (spinner, icon) re-scope; paint order vs siblings can flip for the hover duration. Indirect effect of a purely cosmetic property.
16. **`will-change: transform` on toggle thumb** → layer promotion (BROWSER DETAIL, Chrome: real composited layer) → its `transition: transform` animates on the compositor thread; removing will-change would make transitions main-thread and can flicker.
17. **`overflow:hidden` on ProgressTrack / modal panel / Studio canvasContainer** → clipping boundary; tooltip escaping modal clipping is only possible because the tooltip is *not* inside the panel; Studio canvas is clipped by its resizable window.

### 7.2 Data-stage dependencies (JS → pixel)

```
material preset/override (React props)
  → resolveMaterial (materials/resolveMaterial.ts)
  → shape.state.material (registry)
  → pack() row encoding (8 vec4 rows — shapes.ts documents each slot)
  → uniform upload (GLSL auto-detected uniforms / WGSL writeMainUniformData)
  → SDF geometry + physics constants per pixel
```
Blur is special: material.blur never reaches the main pass — it's only the **blur-group vote key**; the actual radius used is the majority blurGroup. A single frosted (12px) surface among twenty soft (2px) ones loses the vote and renders with 2px blur. Highest-leverage indirect render property in the library.

---

## 8. THE ACTUAL RENDERING ORDER (one frame, dom-mode Prism, numbered)

1. (JS, any time before frame) React commits → DOM mutations; dock/surface springs step on rAF; observers fire.
2. rAF tick (Scheduler): callbacks run in insertion order — engine frame + each surface's spring callback + each mounted dock's loop is its OWN rAF (unregistered with the Scheduler).
3. Engine frame: `measure()` — container rect + dpr; resize if changed (wipes canvas → force repaint flag).
4. Engine frame: per-shape `getBoundingClientRect()` sweep (one layout read batch, 0.25px threshold) → mark dirty movers.
5. Video texture upload (if any).
6. Dirty gate: nothing moving ⇒ frame ends here (no GPU work).
7. `pack()` → uniform arrays; `clearDirty()`; blur-group election; blend mode sync; `gl.clear`.
8. GPU: `bgPass` (procedural/texture + all shapes' shadows) → `vBlurPass` → `hBlurPass` → `mainPass` (SDF glass, dispersion, fresnel, glare, tint, alpha, premultiply) — one fullscreen quad per pass, 4 draw calls total.
9. Browser style recalc (if any invalidation queued by step 1/springs) → layout (if needed) → paint.
10. DOM paint of root stacking context in the §3.3 order: canvas bitmap → wallpaper → content wrapper (all surfaces' text/icons/toggles, each surface's own z:1 local contexts) → dock (global z:1 tie → tree order) → tooltip inside wrapper.
11. (Modal open:) body-level overlay+panel painted after #root (z:999).
12. Compositor: layers (canvas, fixed elements, will-change/transformed items) tiled, rasterized, blended in paint-order-derived order; present.
13. (WebGL canvas present ⇒ drawingBuffer invalidated unless `preserveDrawingBuffer` — BROWSER DETAIL the readback harness depends on.)

**The answer to "why is THIS pixel in front of THAT pixel" is always one of exactly four things in this project:**
1. higher z-index within the same stacking context (wrapper z:1 > canvas z:0),
2. tree order among equal z-levels (wallpaper > canvas),
3. ancestor stacking-context containment (tooltip z:1000 capped by wrapper z:1; modal wins by living in body),
4. paint phase within the canvas bitmap (mainPass draws over bgPass output inside the GPU; bgPass shadows darken the *backdrop*, never DOM content).

---

## 9. IF I CHANGE X, WHAT BREAKS?

| Change | Direct effect | Ripple (verified chains) |
|---|---|---|
| Canvas `z-index: 0 → -1` | canvas behind wallpaper AND behind any ancestor bg that paints later | glass hidden under opaque page bg; **docked tooltip/modal unaffected**; Studio unaffected (different canvas, no z) |
| `.liquid-ui-root` gets `isolation:isolate` | root becomes SC | canvas(wallpaper inside wrapper ordering changes: wallpaper z:0 inside wrapper's context — now definitively above canvas); tooltip's z:1000 containment unchanged (already capped); global z:1 bucket now split |
| Wallpaper `z-index: 0 → -1` | wallpaper behind canvas | GPU rim pixels become visible (currently masked); procedural bg visible around surfaces in dom mode |
| `maxDpr` 2 → 3 | sharper canvas, more memory | uniform `u_dpr` + resolution change → geometry rescale; SDF cr/pl compliance via validation only in WebGL path |
| `MAX_SHAPES` (shapes.ts) without shaders | pack drops shapes past new cap silently if shader cap lower — mismatch = dropped glass + warning only if over registry cap | keep 4 places in sync (sdf.glsl, WGSL ×2, packer, GPUMultiPassRenderer rows/startRow) |
| `u_mergeRate` (hard-coded 0.05 in engine frame) | smin merge radius between ALL shapes | neighboring surfaces goo together (Studio effect); material.merge currently ignored by engine loop (it uses the global constant) |
| blur of any one surface | only vote participation | majority blurGroup shift can change blur of EVERY visible surface (§7.2) |
| `pressDepth`/hover `strength` | offsetX/Y range | glass slides relative to DOM (up to ~0.2×size); rect re-sync does NOT fight it (it only overwrites x/y/size, preserving offsets — verified in frame code) |
| `prefers-reduced-motion` | 3 systems at once | springs, dock loop, CSS transitions (§7.1.11) |
| `styles.css` `.liquid-ui-surface` backdrop-filter | dom-mode interior blur | in mock it's `!important`-overridden; in showcase it's live — changing styles.css does nothing to the mock until the injected kill is removed |
| content wrapper `zIndex: 1 → auto` | wrapper stops being SC | tooltip escapes cap → could cover modal overlay (z:1000 > 999) — an order inversion with no code change in Tooltip/Modal |
| Remove `insertBefore(canvas, firstChild)` → `appendChild` | canvas last child | tree-order ties flip: canvas above wallpaper (both z:0) ⇒ rims appear over wallpaper |
| `alphaMode: 'premultiplied'` → 'opaque' (WebGPU) | compositor treats canvas as opaque | transparent areas render black over the page in dom mode |
| `gl.disable(gl.BLEND)` in textured mode | mainPass replaces screen | required for full-canvas backdrop; enabling blend would double-composite with page where alpha<1 |
| `u_premultiply: 0` with premultiplied context | color unmultiplied at alpha<1 | glass edges get additive halo (double-bright rims) |
| Chrome `preserveDrawingBuffer` default | readPixels outside frame = undefined content | tests/harnesses MUST set `debugPreserveDrawingBuffer` (BROWSER DETAIL) |
| Font swap after load (no font-size-stable fallback) | layout shift | engine re-measures (resilient), BUT Studio header transform-recenters, leva reflows — no glass desync (per-frame rect sweep) |
| `body` background added in dom mode | paints in root bg phase | still behind canvas (z:0 > background phase) — safe; but any positioned z:-1 element would now hide behind it |
| `video` bg + tab hidden | rAF suspended (BROWSER DETAIL) | loop pauses; on return, `measure()` + dirty state recover; no permanent stale (post-fix) |

---

## 10. Spec vs browser-detail vs project-specific (summary)

- **SPEC-MANDATED:** stacking-context creation rules (position+z, transform, filter, opacity<1, isolation, will-change:transform, backdrop-filter, fixed), paint order (backgrounds → floats → inline → positioned by z then tree), z-index containment by ancestor SC, portal = DOM relocation (React) → new stacking participation, canvas = replaced element painted in tree order, backdrop-filter samples the *painted backdrop* (everything painted beneath it in the isolation root — here: the canvas + wallpaper, because the surface's backdrop root is the page).
- **BROWSER IMPLEMENTATION DETAIL (Chrome-verified behavior this project depends on):** canvas drawingBuffer invalidation after present (hence `debugPreserveDrawingBuffer`); will-change → real compositor layers; occluded/hidden tabs suspending rAF (empirically observed in this project's preview harness); `getPreferredCanvasFormat` (bgra8unorm on Windows); premultiplied canvas contexts; fixed-element layer promotion.
- **PROJECT-SPECIFIC:** canvas as `firstChild` with z:0; surfaces z:1; dom-mode wallpaper z:0 layering (currently above the canvas by tree order); blur majority-vote batching; `u_mergeRate` global constant vs per-shape `material.merge` divergence; Studio's `transform: scale(1/dpr)` display trick; MAX_SHAPES=32 sync contract across 5 files; render-on-demand gate + forced-repaint resets (`lastPackedCount = -1`) as the lifecycle-correctness mechanism.

---

*Sources: all file paths cited inline; live probes (computed styles, canvas count, hide-test, first-child check) run against `http://localhost:5173/mock.html?dom=1&backend=webgl&readback=1`.*
