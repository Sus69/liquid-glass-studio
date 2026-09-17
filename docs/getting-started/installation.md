---
title: Installation
description: Install liquid-ui, configure required peer dependencies, and import stylesheets.
page_type: guide
status: published
---

# Installation

Install `@sus_69/liquid-ui` alongside its required peer dependencies using your preferred package manager.

```bash
# Using npm
npm install @sus_69/liquid-ui react react-dom @react-spring/web

# Using pnpm
pnpm add @sus_69/liquid-ui react react-dom @react-spring/web

# Using yarn
yarn add @sus_69/liquid-ui react react-dom @react-spring/web
```

---

## Peer Dependencies

Liquid UI requires the following peer dependencies:

| Package | Version Requirement | Purpose |
|---|---|---|
| `react` | `>=18.0.0` | React core library (supports React 18 and React 19). |
| `react-dom` | `>=18.0.0` | React DOM renderer and portal support. |
| `@react-spring/web` | `>=9.0.0` | Damped harmonic oscillator physics for tactile interactions. |

---

## Import the Stylesheet

Liquid UI relies on baseline CSS rules for positioning the GPU canvas, applying default component geometry, defining focus rings, and configuring CSS fallbacks.

Import the stylesheet once at your application's entry point (e.g., `main.tsx`, `index.tsx`, or `App.tsx`):

```tsx
// At the top of your main entry file
import 'liquid-ui/styles.css';
```

> [!TIP]
> If your bundler supports bundling CSS directly from JavaScript packages, `styles.css` is also automatically included when importing from `'liquid-ui'`. However, explicitly importing `'liquid-ui/styles.css'` guarantees styles load before component hydration.

---

## Framework & Bundler Notes

### Vite
Liquid UI works out of the box with Vite. No custom plugins or configuration are required.

### Next.js (App Router)
Because Liquid UI initializes client-side WebGL2/WebGPU canvases and uses browser APIs (`ResizeObserver`, `IntersectionObserver`, `requestAnimationFrame`), components rendered with Liquid UI must be Client Components:

```tsx
// app/page.tsx
'use client';

import { LiquidProvider, LiquidButton } from 'liquid-ui';
import 'liquid-ui/styles.css';

export default function Page() {
  return (
    <LiquidProvider>
      <LiquidButton variant="primary">Client Glass Button</LiquidButton>
    </LiquidProvider>
  );
}
```

---

## Next Steps

- Follow the **[Quick Start Guide](getting-started/quickstart.md)** to verify your setup with a working component.
- Learn about configuring the root in **[Using LiquidProvider](getting-started/provider.md)**.
