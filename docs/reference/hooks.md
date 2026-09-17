---
title: React Hooks Reference
description: Complete documentation for useLiquidContext, useReducedMotion, and useElementBounds.
page_type: reference
status: published
---

# React Hooks Reference

Liquid UI exports three purpose-built React hooks to interface with rendering context, accessibility preferences, and DOM layout measurements.

```tsx
import {
  useLiquidContext,
  useReducedMotion,
  useElementBounds,
} from 'liquid-ui';
```

---

## 1. `useLiquidContext`

Provides access to the underlying `LiquidEngine` singleton and its GPU initialization lifecycle state.

### Signature
```ts
function useLiquidContext(): LiquidContextValue

interface LiquidContextValue {
  /** The shared LiquidEngine instance, or null if outside a LiquidProvider */
  engine: LiquidEngine | null;
  /** True when the GPU backend (WebGPU or WebGL2) has fully initialized */
  ready: boolean;
}
```

### Example Usage
```tsx
import React from 'react';
import { useLiquidContext } from 'liquid-ui';

export function EngineStatusBadge() {
  const { engine, ready } = useLiquidContext();

  if (!ready || !engine) {
    return <span>Initializing GPU...</span>;
  }

  return (
    <div style={{ fontSize: 12, color: '#10b981' }}>
      GPU Active: {engine.backendType.toUpperCase()} ({engine.registry.count} shapes)
    </div>
  );
}
```

---

## 2. `useReducedMotion`

Detects if the user has enabled the operating system's reduced motion setting (`prefers-reduced-motion: reduce`).

### Signature
```ts
function useReducedMotion(): boolean
```

### Behavior
- **Initial Read**: Evaluates `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
- **Reactive Listener**: Subscribes to runtime changes; automatically triggers a re-render if the user toggles their OS accessibility settings while using the app.
- **SSR Safe**: Returns `false` on the server without throwing errors.

### Example Usage
```tsx
import React from 'react';
import { useReducedMotion, LiquidButton } from 'liquid-ui';

export function AccessibleButton() {
  const reducedMotion = useReducedMotion();

  return (
    <LiquidButton
      pressDepth={reducedMotion ? 0 : 0.12}
      interaction={{ hover: !reducedMotion }}
    >
      Click Me
    </LiquidButton>
  );
}
```

---

## 3. `useElementBounds`

Observes a DOM element's width, height, and viewport visibility using native browser observers (`ResizeObserver` and `IntersectionObserver`).

### Signature
```ts
function useElementBounds(ref: RefObject<HTMLElement | null>): ElementBounds

interface ElementBounds {
  width: number;
  height: number;
}
```

### Architectural Behavior
- **ResizeObserver**: Continuously monitors the element's `contentRect`. Whenever padding, borders, or flexbox layouts shift, `width` and `height` update.
- **IntersectionObserver (120px rootMargin)**: Tracks whether the element is within or approaching the viewport. If the element scrolls away, it is marked invisible, allowing the engine to cull it from fragment shader passes.
- **Automatic Cleanup**: Disconnects both observers when the host component unmounts.

### Example Usage
```tsx
import React, { useRef } from 'react';
import { useElementBounds } from 'liquid-ui';

export function DynamicGlassWidget() {
  const cardRef = useRef<HTMLDivElement>(null);
  const bounds = useElementBounds(cardRef);

  return (
    <div ref={cardRef} style={{ resize: 'both', overflow: 'auto', minWidth: 200 }}>
      <p>Card dimensions: {Math.round(bounds.width)}px × {Math.round(bounds.height)}px</p>
    </div>
  );
}
```

---

## Next Steps

- Explore the core engine classes in **[Engine Architecture Reference](reference/engine.md)**.
- Review utility functions in **[Utilities Reference](reference/utilities.md)**.
