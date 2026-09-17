---
title: Development Setup
description: Setting up the local monorepo environment, running dev servers, and executing test suites.
page_type: guide
status: published
---

# Development Setup

This guide walks you through setting up a local development environment for contributing to Liquid UI and the Liquid Glass Studio playground.

---

## 1. Prerequisites

- **Node.js**: Version `18.0.0` or higher (Node 20+ recommended).
- **pnpm**: Version `9.0.0` or higher (`corepack enable pnpm`).
- **Browser with WebGPU/WebGL2**: Modern Chrome, Edge, or Safari 18+ with graphics acceleration enabled.

---

## 2. Monorepo Installation

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/liquid-glass/liquid-glass-studio.git
cd liquid-glass-studio

# Install dependencies across all workspace packages
pnpm install
```

---

## 3. Starting the Development Server

Start Vite's development server from the repository root:

```bash
pnpm dev
```

The server will boot on `http://localhost:5173/`. You can navigate directly to the following entry points:

| URL | Description | Purpose |
|---|---|---|
| **`http://localhost:5173/docs.html`** | **Documentation Portal** | Full documentation browser with live search and markdown viewer. |
| **`http://localhost:5173/`** | **Liquid Glass Studio** | Real-time interactive shader playground with Leva parameter GUI. |
| **`http://localhost:5173/mock.html`** | **Prism Music App** | Production-scale reference application showcasing glass compositing. |
| **`http://localhost:5173/showcase.html`** | **Component Showcase** | Grid exhibiting all 12 component surfaces and their interaction states. |

---

## 4. Running Test Suites

Liquid UI uses [Vitest](https://vitest.dev/) for unit testing materials, coordinate transformations, and engine uniform packing:

```bash
# Run tests once
pnpm --filter liquid-ui test

# Run tests in watch mode during development
pnpm --filter liquid-ui test -- --watch
```

---

## 5. Typechecking & Production Builds

### TypeScript Verification
```bash
# Typecheck the entire monorepo
npx tsc -b

# Typecheck only the liquid-ui package
pnpm --filter liquid-ui typecheck
```

### Production Bundling
```bash
# Build Studio applications and Documentation web app
pnpm build

# Build standalone liquid-ui NPM package (dist/index.mjs, dist/index.cjs, dist/types)
pnpm --filter liquid-ui build
```

---

## Next Steps

- Understand documentation guidelines in **[Documentation Maintenance](development/maintenance.md)**.
- Review public interfaces in **[Public API Catalog](reference/api.md)**.
