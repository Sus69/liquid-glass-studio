# LIQUID UI — INTERNAL DOCUMENTATION GUIDELINES

> **Authoritative Phase 2 Deliverable**  
> Operational standard for authoring, structuring, and maintaining Liquid UI documentation.  
> Date: 2026-09-17  
> Status: Active

---

## 1. Absolute Source-of-Truth Rules

1. **The Source Code Is the Final Authority**:
   - Never document what the library *should* do or what you *wish* it did. Document what the implementation *actually* does.
   - Every prop, type, default, range, function parameter, and behavior must be verified in `packages/liquid-ui/src/`.
   - If a doc comment or README contradicts the TypeScript types or implementation, **the implementation wins**. Record the discrepancy in internal audits.

2. **Zero Fabrication Policy**:
   - Never invent props, methods, exports, types, default values, or CSS variables.
   - If an edge case or limit is unknown or unverified, explicitly state that it is unverified rather than fabricating an answer.

---

## 2. Naming & Terminology Conventions

To preserve conceptual consistency across all documentation pages:

| Term | Preferred Usage | Prohibited / Deprecated Alternatives |
|---|---|---|
| **Liquid UI** (`liquid-ui`) | The reusable React component library package. | "Liquid Glass", "Liquid Engine UI" |
| **Liquid Glass Studio** | The visual playground, shader lab, and benchmark app. | "Liquid UI Studio", "The Library Playground" |
| **`LiquidProvider`** | The root context provider managing the GPU canvas. | "LiquidRoot", "CanvasProvider", "EngineProvider" |
| **`LiquidSurface`** | The primitive mapping DOM element geometry to the GPU. | "SurfacePrimitive", "GlassSurface" |
| **`LiquidMaterial`** | The complete optical material definition interface. | "GlassSettings", "ShaderMaterial" |
| **`LiquidPresetName`** | Built-in presets (`soft`, `clear`, `frosted`, `dark`, `strong`).| "GlassType", "MaterialTheme" |
| **Backdrop Mode** | `'textured'` \| `'dom'` \| `'css'`. | "Glass Mode", "Render Style" |
| **SDF** | Signed Distance Field — GPU distance math used for shapes. | "Vector shapes", "Canvas paths" |
| **Roundness / Squircle** | Superellipse curvature exponent ($n=5$ for Apple squircle). | "Border curvature", "Corner smoothing" |
| **Smooth Minimum (`smin`)**| The blending algorithm merging adjacent shapes. | "Gooey filter", "Metaball blend" |

---

## 3. Documentation Page Types & Templates

All documentation pages belong to one of five distinct types. Do not blend page types haphazardly.

### Type A: Guide (`page_type: guide`)
- **Objective**: Guide the developer through completing a concrete task.
- **Structure**:
  1. Goal & Prerequisites
  2. Step-by-Step Instructions
  3. Working, Copy-Pasteable Code Example
  4. Explanation of Key Steps
  5. Common Gotchas & Next Steps

### Type B: Concept (`page_type: concept`)
- **Objective**: Build mental models and explain how systems work under the hood.
- **Structure**:
  1. High-Level Mental Model (with diagram/flow)
  2. Core Mechanics (DOM vs. GPU, lifecycle, state)
  3. Technical Nuances & Tradeoffs
  4. Cross-links to Guides and API Reference

### Type C: Component (`page_type: component`)
- **Objective**: Complete documentation for an exported React component.
- **Structure**:
  1. Overview & Visual Behavior
  2. Quick Example (Copy-pasteable)
  3. Props Table (Name, Type, Default, Description)
  4. Visual Variants & Sizes (if applicable)
  5. Material Customization
  6. Interaction & Motion
  7. Accessibility (ARIA, focus, keyboard, reduced motion)
  8. Common Mistakes

### Type D: Reference (`page_type: reference`)
- **Objective**: Authoritative, precise type and API contracts.
- **Structure**:
  1. TypeScript Definition
  2. Parameter / Property Deep-Dive
  3. Return Types & Contracts
  4. Related APIs

### Type E: Advanced / Diagnostics (`page_type: advanced`)
- **Objective**: Deep engine architecture, pipelines, shaders, and troubleshooting.
- **Structure**:
  1. Architecture & Pipeline Stages
  2. Buffer / Texture / Memory Layouts
  3. Platform Differences (WebGL2 vs. WebGPU)
  4. Performance Implications & Limits
  5. Diagnostic Procedures

---

## 4. Code Example Conventions

1. **Language**: TypeScript (`tsx` or `ts`) is canonical for all examples.
2. **Imports**:
   - Always import from `'liquid-ui'` (or `./styles.css`).
   - Never import from internal paths like `'liquid-ui/src/engine/...'` unless documenting advanced internals explicitly.
   - Example:
     ```tsx
     import { LiquidProvider, LiquidButton } from 'liquid-ui';
     import 'liquid-ui/styles.css';
     ```
3. **Runnable & Complete**:
   - Examples must be copy-pasteable into a standard React app without hidden variables.
   - If wrapping inside `<LiquidProvider>` is required for the component to render its GPU glass material, either include `<LiquidProvider>` in the example or explicitly note: *`// Requires an enclosing <LiquidProvider>`*.
4. **Prop Accuracy**:
   - Only pass props that actually exist on the component's TypeScript interface.
   - Use verified presets (`'soft'`, `'clear'`, `'frosted'`, `'dark'`, `'strong'`).

---

## 5. API Accuracy & Defaults Rules

1. **Default Values**:
   - Only document defaults that are actually assigned in the source code or in `toUniforms.ts` / `presets.ts`.
   - If a prop defaults to `undefined` or delegates to a child/CSS, document it as such.
2. **Public vs. Advanced vs. Internal**:
   - *Public*: Components (`LiquidButton`, `LiquidCard`, etc.), `LiquidProvider`, presets, types.
   - *Advanced*: `LiquidSurface`, `useLiquidContext`, `resolveMaterial`, `useReducedMotion`.
   - *Internal*: `MultiPassRenderer`, `ShapeRegistry`, `Scheduler`, `ShaderProgram`. Mark internal items clearly with `[Internal]` warnings so regular users do not depend on fragile private classes.

---

## 6. Accessibility & Performance Documentation Rules

1. **No Fake Claims**:
   - Do not claim "Zero CPU cost", "Infinite FPS", or "Universal 100% WCAG AAA rating".
   - State actual performance characteristics:
     - Damped rAF render loop skips GPU passes when shapes are at rest.
     - Per-frame batched DOM rect measurements keep shapes aligned across scroll and CSS transforms.
     - `MAX_SHAPES = 48` hardware budget.
2. **Clear Separation of Responsibility**:
   - Explicitly separate what the library provides (e.g. `aria-hidden` canvas, `role="switch"`, `role="dialog"`, focus trapping) from developer responsibilities (e.g. choosing readable text contrast over dark or clear glass).

---

## 7. Cross-Linking & Navigation Rules

- Every page must contain breadcrumbs and links to parent categories.
- Component pages must link to:
  - The Core Concept of `LiquidSurface`
  - The Material System guide
  - The API reference for its specific prop type
- Never leave dead-end pages. Always provide a "Next Steps" or "Related Reading" section.

---

## 8. Change Synchronization Strategy

When the library code is updated:
1. **Adding a Component**:
   - Update `packages/liquid-ui/src/index.ts`.
   - Add new component page under `docs/components/<name>.md`.
   - Add entry in navigation manifest `docs/navigation.json`.
   - Add component showcase card in `docs.html` / `Showcase.tsx`.
2. **Modifying Props or Materials**:
   - Update TypeScript interface in `packages/liquid-ui/src/types.ts`.
   - Update corresponding component/material doc page.
   - Re-run validation (`npx pnpm test`, `npx pnpm typecheck`).
3. **Deprecating APIs**:
   - Mark with `@deprecated` in JSDoc in TypeScript source.
   - Add noticeable alert box in documentation pointing to the recommended alternative.

---
*End of Internal Documentation Guidelines.*
