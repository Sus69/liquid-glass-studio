---
title: Material Composition & Overrides
description: Layering partial overrides on presets and creating scalable application design tokens.
page_type: guide
status: published
---

# Material Composition & Overrides

You rarely need to specify all 22 material properties from scratch. In most cases, you will take an existing preset and apply **partial overrides** to customize specific properties like thickness, blur, or tint.

---

## How Material Resolution Works

When you pass an object to the `glass` prop, Liquid UI resolves it through `resolveMaterial()`:

```typescript
// If glass is a string: returns a deep clone of that preset
resolveMaterial('frosted')

// If glass is a partial override:
// Clones LIQUID_PRESETS.strong as the baseline, shallow-merges top-level fields,
// and deep-merges nested `tint` and `shadowOffset`.
resolveMaterial({ thickness: 30, blur: 8 })
```

### Deep Merging of Nested Objects
Because `tint` and `shadowOffset` are nested objects, Liquid UI automatically deep-merges them so you only need to override the channels you care about:

```tsx
// You only need to specify the color; defaults are preserved:
<LiquidCard glass={{ tint: { r: 59, g: 130, b: 246, a: 0.2 } }}>
  Blue Tinted Glass
</LiquidCard>
```

---

## Deriving from Specific Presets

If you want to override a preset *other* than `'strong'`, combine `resolvePreset()` with object spreading:

```tsx
import { resolvePreset, LiquidCard } from 'liquid-ui';

// Base: 'frosted' preset with extra dispersion and custom tint
const customFrosted = {
  ...resolvePreset('frosted'),
  dispersion: 8,
  tint: { r: 240, g: 245, b: 255, a: 0.35 },
};

export function CardExample() {
  return (
    <LiquidCard glass={customFrosted}>
      <h3>Custom Frosted Surface</h3>
    </LiquidCard>
  );
}
```

---

## Scalable Design Token Pattern

For medium and large applications, we recommend defining a centralized material tokens module:

```typescript
// src/theme/glassTokens.ts
import { resolvePreset, type LiquidMaterial } from 'liquid-ui';

export const GLASS_TOKENS = {
  // Heavy dimensional cards
  card: {
    ...resolvePreset('strong'),
    thickness: 24,
    shadowExpand: 28,
    shadow: 0.18,
  },

  // Crisp, responsive buttons
  control: {
    ...resolvePreset('soft'),
    thickness: 12,
    fresnel: 0.25,
    glare: 0.85,
  },

  // Floating menus and popovers
  overlay: {
    ...resolvePreset('frosted'),
    blur: 14,
    tint: { r: 15, g: 23, b: 42, a: 0.65 },
  },
} as const;
```

Now import and use these tokens across your application for unified, consistent material design:

```tsx
import { LiquidCard, LiquidButton } from 'liquid-ui';
import { GLASS_TOKENS } from './theme/glassTokens';

export function Component() {
  return (
    <LiquidCard glass={GLASS_TOKENS.card}>
      <LiquidButton glass={GLASS_TOKENS.control}>Action</LiquidButton>
    </LiquidCard>
  );
}
```

---

## Next Steps

- Explore the complete list of properties in the **[Material Properties Reference](materials/properties.md)**.
- Learn how to structure real UI pages in **[Building Real Interfaces](guides/building-interfaces.md)**.
