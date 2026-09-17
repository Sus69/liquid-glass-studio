---
title: LiquidDock & LiquidDockItem
description: macOS-style magnifying glass dock with spring proximity physics and SDF optical merging.
page_type: component
status: published
---

# LiquidDock & LiquidDockItem

`<LiquidDock>` is a flagship navigation primitive modeled after the classic macOS dock. As the user's pointer moves across the dock, neighboring items fluidly scale up via proximity-based spring physics. 

Because all items share the single GPU engine canvas, the SDF `merge` parameter causes adjacent magnifying items to optically blend like molten liquid glass.

```tsx
import { LiquidDock, LiquidDockItem } from 'liquid-ui';

export function NavigationDock() {
  return (
    <LiquidDock magnification={1.5} proximity={120}>
      <LiquidDockItem aria-label="Home" onClick={() => alert('Home')}>
        🏠
      </LiquidDockItem>
      <LiquidDockItem aria-label="Projects" onClick={() => alert('Projects')}>
        📁
      </LiquidDockItem>
      <LiquidDockItem aria-label="Analytics" onClick={() => alert('Analytics')}>
        📊
      </LiquidDockItem>
      <LiquidDockItem aria-label="Settings" onClick={() => alert('Settings')}>
        ⚙️
      </LiquidDockItem>
    </LiquidDock>
  );
}
```

---

## Props Reference

### `LiquidDockProps`
| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | **Required** | Two or more `<LiquidDockItem>` components. |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'clear'` | Material preset for the dock background container. |
| `radius` | `number` | `26` | Corner radius in CSS pixels for the dock container. |
| `magnification` | `number` | `1.45` | Maximum scaling multiplier reached directly under the pointer. |
| `proximity` | `number` | `110` | Distance in CSS pixels over which magnification falls off. |
| `className` | `string` | `undefined` | Additional class names for the dock wrapper. |
| `style` | `React.CSSProperties` | `undefined` | Custom inline styles for the dock wrapper. |

### `LiquidDockItemProps`
| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | **Required** | Content rendered inside the dock item (typically an icon). |
| `onClick` | `() => void` | `undefined` | Click handler invoked on selection. |
| `glass` | `LiquidPresetName \| LiquidMaterialOverride` | `'soft'` | Material preset for this specific item. |
| `'aria-label'` | `string` | `undefined` | Accessible label for the item. |
| `className` | `string` | `undefined` | Additional class names. |
| `style` | `React.CSSProperties` | `undefined` | Custom inline styles. |

---

## Proximity Spring Mechanics

1. **Continuous Distance Evaluation**: On pointer movement across the dock, the horizontal distance $\Delta x = |x_{\text{pointer}} - x_{\text{item}}|$ is calculated for every child item.
2. **Smooth Cosine Falloff**: A normalized factor $f = \cos(\pi \cdot \Delta x / \text{proximity})$ determines the target scale.
3. **Independent Springs**: Each `<LiquidDockItem>` runs an independent `ScalarSpring`, ensuring that scaling and return-to-rest animations remain buttery smooth without triggering heavy React component re-renders.
4. **Optical Merging**: Adjacent items expand into each other, and the GPU's `u_mergeRate` blends their glass borders seamlessly into a unified liquid contour.

---

## Next Steps

- Explore organic liquid blobs in **[LiquidBlob](components/liquid-blob.md)**.
- Learn about the underlying spring physics in **[Interaction & Springs](core-concepts/interaction.md)**.
