---
title: LiquidBlob & LiquidBlobShape
description: Organic, smoothly merging liquid glass metaballs driven by GPU smooth-minimum SDFs.
page_type: component
status: published
---

# LiquidBlob & LiquidBlobShape

`<LiquidBlob>` unlocks the Studio's signature organic metaball effect as a reusable React component. When two or more `<LiquidBlobShape>` children are placed inside, the GPU evaluates a smooth-minimum polynomial function ($\text{smin}$) across their boundaries, causing the glass shapes to blend together like mercury or water droplets.

```tsx
import { LiquidBlob, LiquidBlobShape } from 'liquid-ui';

export function MergingLogo() {
  return (
    <LiquidBlob
      glass="clear"
      merge={0.12}
      style={{ position: 'relative', width: 280, height: 160 }}
    >
      <LiquidBlobShape
        x={20}
        y={20}
        width={100}
        height={100}
        radius={50}
      />
      <LiquidBlobShape
        x={90}
        y={35}
        width={80}
        height={80}
        radius={40}
      />
    </LiquidBlob>
  );
}
```

---

## Props Reference

### `LiquidBlobProps`
| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | **Required** | Two or more `<LiquidBlobShape>` elements. |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'clear'` | Base material preset for all child shapes. |
| `merge` | `number` | `0.08` | Smooth minimum blending radius. Higher values create gooey-er, wider liquid bridges. |
| `className` | `string` | `undefined` | Additional class names. |
| `style` | `React.CSSProperties` | `undefined` | Custom inline styles. |

### `LiquidBlobShapeProps`
| Prop | Type | Default | Description |
|---|---|---|---|
| `x` | `number \| string` | **Required** | X coordinate relative to the blob container (`40` or `'20%'`). |
| `y` | `number \| string` | **Required** | Y coordinate relative to the blob container (`20` or `'10%'`). |
| `width` | `number \| string` | **Required** | Shape width in pixels or CSS units. |
| `height` | `number \| string` | **Required** | Shape height in pixels or CSS units. |
| `radius` | `number` | `undefined` | Corner radius. If omitted, uses circular/squircle defaults from material. |
| `children` | `React.ReactNode` | `undefined` | Content rendered inside this specific blob shape. |
| `className` | `string` | `undefined` | Additional class names. |
| `style` | `React.CSSProperties` | `undefined` | Custom inline styles. |

---

## Smooth Minimum Mathematics

Traditional boolean unions between shapes produce sharp, abrupt geometric intersections:
$$d = \min(d_1, d_2)$$

In Liquid UI, `<LiquidBlob>` evaluates a quadratic smooth minimum polynomial function:
$$h = \max(k - |d_1 - d_2|, 0) / k$$
$$\text{smin}(d_1, d_2, k) = \min(d_1, d_2) - h^2 \cdot k \cdot 0.25$$

Where $k$ is controlled by the `merge` prop:
- `merge={0.02}`: Tight, subtle bridge; shapes only blend when almost touching.
- `merge={0.08}`: Balanced liquid glass droplets.
- `merge={0.20}`: Heavy molten fluid; shapes merge across significant distances.

---

## Next Steps

- Learn about optical properties in the **[Material Properties Reference](materials/properties.md)**.
- Understand the underlying SDF algorithms in **[SDF Shapes & Squircles](advanced/sdf-shapes.md)**.
