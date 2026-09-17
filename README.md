# 🔮 Liquid Glass Studio & Liquid UI

![frontPhoto](./.github/assets/title.png)

[English](README.md) | [简体中文](README-zh.md) | [O‘zbekcha](README-uz.md)

The Ultimate Web Recreation of Apple’s Liquid Glass UI, powered by WebGL2 & WebGPU. Includes both an interactive shader playground (**Liquid Glass Studio**) and a reusable React component library (**`liquid-ui`**).

---

## 📦 Packages & Applications

This repository is organized as a pnpm workspace containing:

- **[`packages/liquid-ui`](./packages/liquid-ui)**: Reusable liquid-glass React component library (`<LiquidButton>`, `<LiquidCard>`, `<LiquidModal>`, etc.) powered by a shared hardware-accelerated WebGL2/WebGPU engine.
- **[Liquid Glass Studio](./src)**: Interactive real-time shader laboratory for fine-tuning optical parameters, lighting, and backgrounds with Leva controls.
- **[Documentation Portal](./docs)**: Comprehensive documentation website (58 pages) with guides, component references, and architectural deep-dives.
- **[Prism Music App Demo](./mock.html)**: Production reference application exhibiting glass layering and responsive compositing.

---

## 🚀 Quick Start with `liquid-ui`

### 1. Installation

```bash
npm install liquid-ui
# Peer dependencies: react >= 18, react-dom >= 18, @react-spring/web >= 9
```

### 2. Usage

Wrap your application in `<LiquidProvider>` and import the stylesheet:

```tsx
import React from 'react';
import { LiquidProvider, LiquidCard, LiquidButton, LiquidPill } from 'liquid-ui';
import 'liquid-ui/styles.css';

export default function App() {
  return (
    <LiquidProvider backdropMode="dom">
      <div style={{ padding: 40 }}>
        <LiquidCard glass="frosted" radius={24} interactive>
          <LiquidPill statusColor="#10b981">Operational</LiquidPill>
          <h2>Liquid Glass UI</h2>
          <p>Real-time physical refraction with zero-re-render spring physics.</p>
          <LiquidButton variant="primary">Get Started</LiquidButton>
        </LiquidCard>
      </div>
    </LiquidProvider>
  );
}
```

---

## 🛠 Monorepo Development

### Prerequisites
- Node.js (>= 18.0.0, 20+ recommended)
- pnpm (>= 9.0.0)

### Commands

```bash
# Install workspace dependencies
pnpm install

# Start local dev server (serves Studio, Docs, Showcase, and Prism Mock)
pnpm dev

# Build the liquid-ui library (dist/index.mjs, dist/index.cjs, dist/types)
pnpm build:lib

# Build the standalone Documentation Portal (dist-docs/)
pnpm build:docs

# Build the standalone Liquid Glass Studio (dist-studio/)
pnpm build:studio

# Run all test suites
pnpm test

# Run consumer test fixture
pnpm test:consumer

# Typecheck workspace and library
pnpm typecheck
```

---

## 🌐 Deployments

Detailed deployment instructions for Vercel, Cloudflare, and npm are available in **[`DEPLOYMENT.md`](./DEPLOYMENT.md)**.

- **Documentation Portal**: Deploys via `pnpm build:docs` (Output: `dist-docs/`)
- **Liquid Glass Studio**: Deploys via `pnpm build:studio` (Output: `dist-studio/`)
- **Unified Site**: Deploys via `pnpm build` (Output: `dist/`)

---

## 📄 License

[MIT License](LICENSE)
