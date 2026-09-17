# LIQUID UI — INTERNAL MATERIAL SYSTEM AUDIT

> **Authoritative Phase 5 Deliverable**  
> Complete audit of `LiquidMaterial`, `LiquidMaterialOverride`, presets, resolution, and shader uniform mappings.  
> Date: 2026-09-17  
> Status: Canonical Material Reference

---

## 1. Complete Property Specification Matrix

| Public Property | TypeScript Type | Units | Known Range | Default (`strong`) | Shader Uniform | Uniform Mapping Rule | Source File |
|---|---|---|---|---|---|---|---|
| `thickness` | `number` | CSS px | $> 0$ | `20` | `u_refThickness` | Direct scalar | `src/types.ts:30` |
| `refraction` | `number` | Index ratio | $\ge 1.0$ (1 = none) | `1.4` | `u_refFactor` | Direct scalar | `src/types.ts:32` |
| `refractionDistance` | `number` | Displacement factor | $0.0 - 0.2$ | `0.05` | `u_refDistance` | Direct scalar | `src/types.ts:34` |
| `dispersion` | `number` | Aberration amount | $0 - 50$ | `7` | `u_refDispersion` | Direct scalar | `src/types.ts:36` |
| `fresnel` | `number` | Normalized intensity| $0.0 - 1.0$ | `0.2` | `u_refFresnelFactor`| Direct scalar | `src/types.ts:38` |
| `fresnelRange` | `number` | Falloff spread | $10 - 100$ | `36` | `u_refFresnelRange` | Direct scalar | `src/types.ts:40` |
| `fresnelHardness` | `number` | Sharpness factor | $0.0 - 1.0$ | `0.2` | `u_refFresnelHardness`| Direct scalar | `src/types.ts:42` |
| `glare` | `number` | Normalized intensity| $0.0 - 1.0$ | `0.9` | `u_glareFactor` | Direct scalar | `src/types.ts:44` |
| `glareRange` | `number` | Band spread | $10 - 100$ | `30` | `u_glareRange` | Direct scalar | `src/types.ts:46` |
| `glareHardness` | `number` | Sharpness factor | $0.0 - 1.0$ | `0.2` | `u_glareHardness` | Direct scalar | `src/types.ts:48` |
| `glareConvergence` | `number` | Exponent control | $0.0 - 1.0$ | `0.5` | `u_glareConvergence`| Direct scalar | `src/types.ts:50` |
| `glareOppositeFactor`| `number` | Secondary ratio | $0.0 - 1.0$ | `0.8` | `u_glareOppositeFactor`| Direct scalar | `src/types.ts:52` |
| `glareAngle` | `number` | Degrees ($^\circ$) | $-180^\circ - 180^\circ$| `-45` | `u_glareAngle` | `(angle * Math.PI) / 180` (radians)| `src/types.ts:54` |
| `blur` | `number` | Blur radius (px) | $0 - 64$ | `1` | `u_blurRadius` | Direct scalar (batched by blurGroupKey)| `src/types.ts:56` |
| `borderBlend` | `boolean` | Boolean flag | `true \| false` | `true` | `u_blurEdge` | `borderBlend ? 1 : 0` | `src/types.ts:58` |
| `tint` | `LiquidRGBA` | RGB (0-255), A (0-1)| $r,g,b \in [0,255], a \in [0,1]$ | `{r:255, g:255, b:255, a:0}` | `u_tint` | `[r/255, g/255, b/255, a]` | `src/types.ts:60` |
| `shadowExpand` | `number` | Spread radius (px) | $0 - 100$ | `25` | `u_shadowExpand` | Direct scalar | `src/types.ts:62` |
| `shadow` | `number` | Opacity factor | $0.0 - 1.0$ | `0.15` | `u_shadowFactor` | Direct scalar | `src/types.ts:64` |
| `shadowOffset` | `{x:number, y:number}`| Offset (px) | CSS pixels | `{x:0, y:-10}` | `u_shadowPosition` | `[-x, -y]` (negated for shader coords)| `src/types.ts:66` |
| `merge` | `number` | Smooth min rate | $0.0 - 0.5$ | `0.05` | `u_mergeRate` | Direct scalar | `src/types.ts:68` |
| `radius` | `number` | Corner radius (px) | $\ge 0$ | `16` | `u_shapeRadius` | Overridden by component radius prop | `src/types.ts:70` |
| `roundness` | `number` | Superellipse exponent| $2.0 - 10.0$ | `5` | `u_shapeRoundness` | $2=\text{ellipse}, 5\approx\text{squircle}$ | `src/types.ts:72` |

---

## 2. Built-in Preset Comparison Table

| Property | `soft` | `clear` | `frosted` | `dark` | `strong` (Studio Parity) |
|---|---|---|---|---|---|
| `thickness` | `12` | `24` | `16` | `22` | `20` |
| `refraction` | `1.2` | `1.5` | `1.25` | `1.45` | `1.4` |
| `refractionDistance` | `0.035` | `0.06` | `0.04` | `0.055` | `0.05` |
| `dispersion` | `2` | `10` | `1` | `6` | `7` |
| `fresnel` | `0.12` | `0.25` | `0.15` | `0.2` | `0.2` |
| `fresnelRange` | `40` | `25` | `35` | `28` | `36` |
| `fresnelHardness` | `0.25` | `0.15` | `0.3` | `0.2` | `0.2` |
| `glare` | `0.5` | `0.9` | `0.55` | `0.8` | `0.9` |
| `glareRange` | `40` | `25` | `35` | `28` | `30` |
| `glareHardness` | `0.3` | `0.2` | `0.35` | `0.22` | `0.2` |
| `glareConvergence` | `0.4` | `0.5` | `0.4` | `0.5` | `0.5` |
| `glareOppositeFactor`| `0.6` | `0.8` | `0.6` | `0.75` | `0.8` |
| `glareAngle` | `-45` | `-45` | `-45` | `-45` | `-45` |
| `blur` | `2` | `1` | `12` | `4` | `1` |
| `borderBlend` | `true` | `false` | `true` | `true` | `true` |
| `tint` (RGBA) | `{255,255,255, 0.08}` | `{255,255,255, 0}` | `{255,255,255, 0.28}` | `{12,14,20, 0.55}` | `{255,255,255, 0}` |
| `shadowExpand` | `30` | `25` | `28` | `25` | `25` |
| `shadow` | `0.08` | `0.15` | `0.1` | `0.2` | `0.15` |
| `shadowOffset` | `{x:0, y:-8}` | `{x:0, y:-10}` | `{x:0, y:-8}` | `{x:0, y:-10}` | `{x:0, y:-10}` |
| `merge` | `0.06` | `0.05` | `0.06` | `0.05` | `0.05` |
| `radius` | `16` | `16` | `16` | `16` | `16` |
| `roundness` | `5` | `5` | `5` | `5` | `5` |

---

## 3. Material Resolution Mechanics

In `packages/liquid-ui/src/materials/resolveMaterial.ts`:
1. `resolveMaterial(undefined)`: Returns a deep copy of `LIQUID_PRESETS.strong`.
2. `resolveMaterial('presetName')`: Looks up preset and deep-clones both `tint` and `shadowOffset` objects.
3. `resolveMaterial(overrideObject)`: Deep-clones `LIQUID_PRESETS.strong` as base, shallow-merges top-level overrides, and deep-merges nested `tint` (`{ ...base.tint, ...override.tint }`) and `shadowOffset` (`{ ...base.shadowOffset, ...override.shadowOffset }`).

---

## 4. Blur Grouping Mechanics

In `packages/liquid-ui/src/materials/resolveMaterial.ts`:
```typescript
export function blurGroupKey(blur: number): number {
  if (blur <= 1) return 1;
  if (blur <= 2) return 2;
  if (blur <= 4) return 4;
  if (blur <= 8) return 8;
  if (blur <= 16) return 16;
  if (blur <= 32) return 32;
  return 64;
}
```
Blur passes (`vBlur` and `hBlur`) are batched by power-of-two blur radii. Surfaces with similar blur values share a single GPU blur pass, preventing massive fillrate degradation.

---

## 5. Studio → Library Optical Transfer Workflow

When tuning materials in Liquid Glass Studio:
1. Adjust sliders in Studio GUI (`/`).
2. Copy numerical values directly into a `LiquidMaterial` object in application code.
3. Every Studio slider maps 1:1 onto a public `LiquidMaterial` property:
   - `thickness` $\leftrightarrow$ Studio "thickness"
   - `refraction` $\leftrightarrow$ Studio "refraction"
   - `dispersion` $\leftrightarrow$ Studio "dispersion"
   - `fresnel` / `fresnelRange` / `fresnelHardness` $\leftrightarrow$ Studio "fresnel..."
   - `glare...` $\leftrightarrow$ Studio "glare..."
   - `shadow...` $\leftrightarrow$ Studio "shadow..."

---
*End of Internal Material Audit.*
