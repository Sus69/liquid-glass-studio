---
title: TypeScript Types Reference
description: Complete authoritative reference for all TypeScript interfaces, types, and unions in Liquid UI.
page_type: reference
status: published
---

# TypeScript Types Reference

All types are exported from `liquid-ui` and match the internal engine architecture directly.

```ts
import type {
  LiquidMaterial,
  LiquidMaterialOverride,
  LiquidPresetName,
  LiquidBackdropMode,
  LiquidBackendKind,
  LiquidBackendInfo,
  LiquidRGB,
  LiquidRGBA,
  LiquidShapeState,
  LiquidSpringConfig,
  LiquidInteraction,
  LiquidComponentProps,
  LiquidGlassInput,
} from 'liquid-ui';
```

---

## 1. Material Types

### `LiquidMaterial`
Full description of optical and geometric parameters. Every property maps directly to a shader uniform.

```ts
export interface LiquidMaterial {
  /** Glass edge thickness in CSS pixels → u_refThickness. Default 20. */
  thickness: number;
  /** Refractive index (1.0 = none, typical glass 1.2-1.6) → u_refFactor. */
  refraction: number;
  /** Refraction offset distance → u_refDistance. Default 20. */
  refractionDistance: number;
  /** Chromatic dispersion amount → u_refDispersion. Default 1.0. */
  dispersion: number;
  /** Fresnel edge-light intensity (0-1) → u_refFresnelFactor. */
  fresnel: number;
  /** Fresnel falloff range → u_refFresnelRange. */
  fresnelRange: number;
  /** Fresnel edge hardness (0-1) → u_refFresnelHardness. */
  fresnelHardness: number;
  /** Glare intensity (0-1) → u_glareFactor. */
  glare: number;
  /** Glare band range → u_glareRange. */
  glareRange: number;
  /** Glare band hardness (0-1) → u_glareHardness. */
  glareHardness: number;
  /** Glare convergence exponent control (0-1) → u_glareConvergence. */
  glareConvergence: number;
  /** Opposite-side glare multiplier (0-1) → u_glareOppositeFactor. */
  glareOppositeFactor: number;
  /** Glare rotation in degrees → u_glareAngle. */
  glareAngle: number;
  /** Backdrop blur radius in CSS px → u_blurRadius. */
  blur: number;
  /** Blend blurred backdrop through the whole edge → u_blurEdge. */
  borderBlend: boolean;
  /** Tint color with alpha → u_tint (rgb 0-255, a 0-1). */
  tint: LiquidRGBA;
  /** Shadow spread in CSS px → u_shadowExpand. */
  shadowExpand: number;
  /** Shadow strength (0-1) → u_shadowFactor. */
  shadow: number;
  /** Shadow offset { x, y } in CSS px → u_shadowPosition. */
  shadowOffset: { x: number; y: number };
  /** Shape merge radius for blob merging → u_mergeRate. */
  merge: number;
  /** Corner radius in CSS px → u_shapeRadius. */
  radius: number;
  /** Superellipse roundness (2=ellipse, 5≈iOS squircle) → u_shapeRoundness. */
  roundness: number;
}
```

### `LiquidMaterialOverride`
Partial representation of `LiquidMaterial`. All properties are optional:
```ts
export type LiquidMaterialOverride = Partial<LiquidMaterial>;
```

### `LiquidPresetName`
Union of built-in preset identifiers:
```ts
export type LiquidPresetName = 'soft' | 'clear' | 'frosted' | 'dark' | 'strong';
```

### `LiquidGlassInput`
Contract accepted by the `glass` prop on all components:
```ts
export type LiquidGlassInput = LiquidPresetName | LiquidMaterialOverride | undefined;
```

---

## 2. Color & Geometry Types

### `LiquidRGB` & `LiquidRGBA`
```ts
export interface LiquidRGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface LiquidRGBA extends LiquidRGB {
  a: number; // 0-1
}
```

### `LiquidShapeState`
Per-frame state representation sent from a DOM component to the shape registry:
```ts
export interface LiquidShapeState {
  x: number;          // Center x (CSS px relative to LiquidProvider)
  y: number;          // Center y (CSS px relative to LiquidProvider)
  halfWidth: number;  // Half-width in CSS px
  halfHeight: number; // Half-height in CSS px
  radius: number;     // Corner radius in CSS px
  roundness: number;  // Squircle exponent (2-10)
  material: LiquidMaterial;
  scale: number;      // Press/hover scale factor (1 = rest)
  offsetX: number;    // Parallax pointer offset x
  offsetY: number;    // Parallax pointer offset y
}
```

---

## 3. Interaction & Physics Types

### `LiquidSpringConfig`
```ts
export interface LiquidSpringConfig {
  stiffness: number; // Higher = snappier (default 170 / 300)
  damping: number;   // Lower = bouncier (default 26 / 22)
  mass?: number;
}
```

### `LiquidInteraction`
```ts
export interface LiquidInteraction {
  /** Enable cursor-following glare/offset motion. */
  hover?: boolean;
  /** Enable elastic press compression. */
  press?: boolean;
  /** Multiplier for cursor parallax displacement (default 0.12). */
  strength?: number;
  /** Custom spring physics tuning. */
  spring?: LiquidSpringConfig;
}
```

---

## 4. Architecture & Engine Types

### `LiquidBackdropMode`
```ts
export type LiquidBackdropMode = 'textured' | 'dom' | 'css';
```

### `LiquidBackendKind` & `LiquidBackendInfo`
```ts
export type LiquidBackendKind = 'webgl' | 'webgpu' | 'css';

export interface LiquidBackendInfo {
  kind: LiquidBackendKind;
  /** True when a real GPU hardware pipeline is running. */
  gpu: boolean;
  /** Human-readable explanation if hardware acceleration was unavailable. */
  reason?: string;
}
```

### `EngineBgType`
```ts
export type EngineBgType =
  | { kind: 'image'; url: string }
  | { kind: 'video'; url: string }
  | { kind: 'none' }
  | undefined;
```

---

## Next Steps

- Review hook signatures in **[React Hooks](reference/hooks.md)**.
- Read about the engine classes in **[Engine Architecture](reference/engine.md)**.
