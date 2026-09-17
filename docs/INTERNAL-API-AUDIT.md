# LIQUID UI — INTERNAL API & MAINTAINER AUDIT

> **Authoritative Phase 8 Deliverable**  
> Comprehensive audit of all public TypeScript exports, runtime interfaces, engine classes, utility functions, monorepo scripts, and maintenance workflows.  
> Date: 2026-09-17  
> Status: Canonical API Ground Truth

---

## 1. Complete Public Export Taxonomy (`packages/liquid-ui/src/index.ts`)

| Export Category | Identifier | Source Path | Nature |
|---|---|---|---|
| **Root & Context** | `LiquidProvider` | `components/LiquidProvider.tsx` | React Component |
| | `LiquidProviderProps` | `components/LiquidProvider.tsx` | TS Interface |
| | `LiquidContext` | `context.ts` | React Context |
| | `useLiquidContext` | `context.ts` | React Hook |
| **Core Primitive** | `LiquidSurface` | `components/LiquidSurface.tsx` | React Component |
| | `LiquidSurfaceProps` | `components/LiquidSurface.tsx` | TS Interface |
| **Components (11)** | `LiquidDiv`, `LiquidDivProps` | `components/LiquidDiv.tsx` | Component & Props |
| | `LiquidButton`, `LiquidButtonProps`, `LiquidButtonVariant`, `LiquidButtonSize` | `components/LiquidButton.tsx` | Component & Types |
| | `LiquidCard`, `LiquidCardProps` | `components/LiquidCard.tsx` | Component & Props |
| | `LiquidPill`, `LiquidPillProps` | `components/LiquidPill.tsx` | Component & Props |
| | `LiquidInput`, `LiquidInputProps` | `components/LiquidInput.tsx` | Component & Props |
| | `LiquidIconButton`, `LiquidIconButtonProps` | `components/LiquidIconButton.tsx` | Component & Props |
| | `LiquidToggle`, `LiquidToggleProps` | `components/LiquidToggle.tsx` | Component & Props |
| | `LiquidTooltip`, `LiquidTooltipProps` | `components/LiquidTooltip.tsx` | Component & Props |
| | `LiquidModal`, `LiquidModalProps` | `components/LiquidModal.tsx` | Component & Props |
| | `LiquidDock`, `LiquidDockItem`, `LiquidDockProps`, `LiquidDockItemProps` | `components/LiquidDock.tsx` | Components & Props |
| | `LiquidBlob`, `LiquidBlobShape`, `LiquidBlobProps`, `LiquidBlobShapeProps` | `components/LiquidBlob.tsx` | Components & Props |
| **Materials** | `LIQUID_PRESETS` | `materials/presets.ts` | Record<LiquidPresetName, LiquidMaterial> |
| | `resolvePreset` | `materials/presets.ts` | Function |
| | `cloneMaterial` | `materials/presets.ts` | Function |
| | `resolveMaterial` | `materials/resolveMaterial.ts` | Function |
| | `blurGroupKey` | `materials/resolveMaterial.ts` | Function |
| | `materialToShapeUniforms`, `ShapeUniforms` | `materials/toUniforms.ts` | Function & Interface |
| **Engine & Physics** | `LiquidEngine`, `LiquidEngineOptions`, `EngineBgType` | `engine/LiquidEngine.ts` | Class & Types |
| | `computeGaussianKernelByRadius` | `engine/LiquidEngine.ts` | Function |
| | `detectWebGPU`, `WebGPUDetectResult` | `engine/gpuDetect.ts` | Function & Interface |
| | `PointerSpring`, `ScalarSpring` | `engine/interaction.ts` | Physics Classes |
| | `Scheduler` | `engine/scheduler.ts` | Animation Loop Class |
| **Low-Level Backends** | `MultiPassRenderer`, `ShaderProgram`, `FrameBuffer`, `RenderPass`, `RenderPassConfig` | `engine/backends/webgl/MultiPassRenderer.ts` | WebGL2 Engine Classes |
| | `GPUMultiPassRenderer` | `engine/backends/webgpu/GPUMultiPassRenderer.ts` | WebGPU Engine Class |
| | `createEmptyTexture`, `loadTextureFromURL`, `updateVideoTexture` | `engine/backends/webgl/textures.ts` | WebGL2 Texture Utilities |
| | `gpuCreateEmptyTexture`, `gpuLoadTextureFromURL`, `gpuUpdateVideoTexture` | `engine/backends/webgpu/textures.ts` | WebGPU Texture Utilities |
| **Hooks** | `useElementBounds` | `hooks/useElementBounds.ts` | React Hook |
| | `useReducedMotion` | `hooks/useReducedMotion.ts` | React Hook |
| **Core Types** | `LiquidMaterial`, `LiquidMaterialOverride`, `LiquidPresetName`, `LiquidBackdropMode`, `LiquidBackendKind`, `LiquidBackendInfo`, `LiquidRGB`, `LiquidRGBA`, `LiquidShapeState`, `LiquidSpringConfig`, `LiquidInteraction`, `LiquidComponentProps`, `LiquidTextureHandle`, `LiquidGlassInput` | `types.ts` | Authoritative Type Models |

---

## 2. Monorepo Scripts & Build Pipelines

```
pnpm root: liquid-glass-studio/
├── Studio App (Vite + React 19 + MUI + Leva)
└── packages/liquid-ui/
    ├── vite.lib.config.ts (Builds dist/index.cjs, dist/index.mjs, dist/styles.css)
    ├── tsconfig.build.json (Emits dist/types/index.d.ts)
    └── vitest.config.ts (Executes unit test suites)
```

| Command | Working Directory | Purpose |
|---|---|---|
| `pnpm dev` | Root | Boots Studio demo and documentation app on port 5173 |
| `pnpm build` | Root | Compiles Studio and Docs via `tsc -b && vite build` |
| `pnpm --filter liquid-ui build` | Root or `packages/liquid-ui` | Builds production library bundle into `dist/` |
| `pnpm --filter liquid-ui typecheck` | Root or `packages/liquid-ui` | Strict TypeScript typecheck (`tsc --noEmit`) |
| `pnpm --filter liquid-ui test` | Root or `packages/liquid-ui` | Runs all unit tests via Vitest |

---

## 3. Maintenance & Release Workflow

1. **Version Bump**: Increment version in `packages/liquid-ui/package.json` adhering to Semantic Versioning (`major.minor.patch`).
2. **Library Build**: Execute `pnpm --filter liquid-ui build` to generate CJS, ESM, and TypeScript `.d.ts` declaration maps.
3. **Validation**: Execute `pnpm --filter liquid-ui test` and `pnpm --filter liquid-ui typecheck`.
4. **Publishing**: `cd packages/liquid-ui && pnpm publish --access public`.

---
*End of Internal API & Maintainer Audit.*
