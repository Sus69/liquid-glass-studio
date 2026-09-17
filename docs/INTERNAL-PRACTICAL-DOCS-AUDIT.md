# LIQUID UI — INTERNAL PRACTICAL DOCS AUDIT

> **Authoritative Phase 7 Deliverable**  
> Empirical audit of performance characteristics, accessibility mechanisms, browser support, and failure modes.  
> Date: 2026-09-17  
> Status: Canonical Practical Reference

---

## 1. Performance Model & Empirical Evidence

| Architectural Feature | Source Evidence | Empirical Behavior | Developer Guidance |
|---|---|---|---|
| **Render-on-Demand Loop** | `packages/liquid-ui/src/engine/scheduler.ts:40-48` | If shapes have settled, no pointers are interacting, and no video background is ticking, `Scheduler.step()` returns immediately without submitting GPU draw calls. | Static pages consume 0% continuous GPU cycles. Idle frame times drop to negligible levels. |
| **Blur Grouping** | `packages/liquid-ui/src/materials/resolveMaterial.ts:5-13` | Blur passes are partitioned into power-of-two batches: $1, 2, 4, 8, 16, 32, 64\text{px}$. | Shapes sharing the same blur group share a single GPU blur pass, preventing combinatorial fillrate collapse. |
| **Shape Capacity** | `packages/liquid-ui/src/engine/shapes.ts:11` | `MAX_SHAPES = 48`. Checked against `MAX_FRAGMENT_UNIFORM_VECTORS` at init. | Reserve liquid surfaces for prominent UI cards, buttons, dialogs, and navigation. Dense tables should use plain DOM rows. |
| **DPR Throttling** | `packages/liquid-ui/src/components/LiquidProvider.tsx:13` | `maxDpr` defaults to `2`. Applied in `LiquidEngine.ts:measure()`. | Caps drawing buffer dimensions on 3x/4x mobile retina screens, preventing multi-megapixel fillrate degradation. |
| **Intersection Culling** | `packages/liquid-ui/src/components/LiquidSurface.tsx:134-143` | `IntersectionObserver` with `120px` root margin calls `registry.setVisible(id, isIntersecting)`. | Surfaces scrolled out of view are skipped during uniform packing and fragment evaluations. |

---

## 2. Accessibility Capabilities & Boundaries

### Library-Provided Capabilities (Verified in Source)
1. **Accessibility Tree Isolation**: The canvas element is rendered with `aria-hidden="true"` and `pointer-events: none`, ensuring screen readers never encounter raw canvas elements.
2. **Semantic HTML Preservation**: Components render true semantic elements:
   - `<LiquidButton>` $\rightarrow$ `<button type="button">`
   - `<LiquidInput>` $\rightarrow$ `<input>`
   - `<LiquidToggle>` $\rightarrow$ `<button role="switch">`
   - `<LiquidModal>` $\rightarrow$ `<div role="dialog" aria-modal="true">`
3. **Mandatory Accessible Labeling**: `LiquidIconButtonProps` strictly requires `'aria-label': string` at the TypeScript compile stage.
4. **Modal Dialog Focus Trap**: `LiquidModal` traps keyboard `Tab` cycling within focusable dialog children and restores previous focus on close.
5. **Escape Key Dismissal**: `LiquidModal` registers a global `keydown` listener for the `Escape` key.
6. **Reactive Reduced Motion**: `useReducedMotion()` listens to `(prefers-reduced-motion: reduce)`. When active, pointer hover displacement is zeroed and press springs settle instantly.

### Developer Responsibilities (Boundaries)
- **Contrast**: Liquid UI provides glass refraction and specular highlights; developers must choose background images, text colors, and glass tints that satisfy WCAG contrast requirements (minimum 4.5:1 for body text).
- **Labeling Generic Containers**: When using `<LiquidCard>` or `<LiquidDiv>` as clickable elements, developers must provide appropriate `role="button"`, `tabIndex`, and keyboard handlers.

---

## 3. Browser & Platform Compatibility Matrix

| Environment | Supported Backend | Status / Verification |
|---|---|---|
| **Chrome / Edge (Desktop)** | WebGPU $\rightarrow$ WebGL2 | **Full Hardware Acceleration** (WebGPU on 113+, WebGL2 universal). |
| **Safari 18+ (macOS & iOS)** | WebGPU $\rightarrow$ WebGL2 | **Full Hardware Acceleration** (WebGPU experimental/flagged, WebGL2 stable). |
| **Firefox (Desktop & Android)**| WebGL2 | **Full WebGL2 Acceleration** (WebGPU under active development behind flag). |
| **Mobile Safari (iOS 15+)** | WebGL2 | **Stable WebGL2 Acceleration**. Throttles gracefully via `maxDpr`. |
| **SSR / Node.js** | CSS Fallback | **Zero Runtime Crash**. Detects `typeof window === 'undefined'`. |
| **Headless / WebGL Blocked** | CSS Fallback | **Graceful Degradation**. `.liquid-ui-fallback` classes apply styled backdrop-filters. |

---

## 4. Empirical Failure Modes & Diagnostics

1. **Stale Shader Transform Cache**:
   - *Cause*: Vite's pre-bundling caches transformed `.glsl` and `.wgsl` modules.
   - *Remedy*: Run `rm -rf node_modules/.vite` and restart the dev server.
2. **Disappearing Glass on Canvas Resize**:
   - *Cause*: Resizing an HTML canvas clears its drawing buffer; render-on-demand loops can sleep if no shapes moved.
   - *Remedy*: LiquidEngine explicitly forces `lastPackedCount = -1` in `measure()`, guaranteeing an instant repaint.
3. **Invisible Refraction Over Solid Backdrops**:
   - *Cause*: Snell's law bends light rays from the background. A solid monochrome background yields identical pixel colors regardless of refraction.
   - *Remedy*: Use contrastive photographic textures, video backgrounds, or procedural grids.

---
*End of Internal Practical Docs Audit.*
