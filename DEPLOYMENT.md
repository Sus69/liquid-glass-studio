# 🚀 Liquid Glass Studio & Liquid UI — Deployment Guide

This guide details the complete deployment architecture for the **Liquid UI** npm package, the **Documentation Portal**, and the **Liquid Glass Studio** interactive playground.

```
                    REPOSITORY ROOT (liquid-glass-studio)
                                     │
      ┌──────────────────────────────┼──────────────────────────────┐
      ▼                              ▼                              ▼
  npm Package                  Docs Website                  Studio Playground
(packages/liquid-ui)        (dist-docs/index.html)        (dist-studio/index.html)
      │                              │                              │
Published to npm           Deployable to Vercel/Cloudflare  Deployable to Vercel/Cloudflare
```

---

## 1. Monorepo Distribution Overview

| Target | Output Directory | Build Command | Hosting Target |
|---|---|---|---|
| **`liquid-ui` (Library)** | `packages/liquid-ui/dist/` | `pnpm build:lib` | **npm Registry** |
| **Documentation Portal** | `dist-docs/` | `pnpm build:docs` | **Vercel / Cloudflare Pages** |
| **Liquid Glass Studio** | `dist-studio/` | `pnpm build:studio` | **Vercel / Cloudflare Pages** |
| **Unified Multi-Page Site** | `dist/` | `pnpm build` | **Vercel / Netlify** |

---

## 2. Deploying the Documentation Website

The documentation portal is a statically pre-bundled multi-page application with live search, responsive navigation, and syntax-highlighted code blocks.

### Option A: Standalone Project on Vercel (Recommended)
When creating a new project in the [Vercel Dashboard](https://vercel.com/):
1. Import the Git repository.
2. Select **Framework Preset**: `Vite` (or `Other`).
3. Set **Build Command**: `pnpm build:docs`
4. Set **Output Directory**: `dist-docs`
5. Alternatively, Vercel automatically detects `vercel.docs.json` if configured in project settings.

### Option B: Cloudflare Pages
1. Connect Git repository in Cloudflare Pages.
2. Build command: `pnpm build:docs`
3. Output directory: `dist-docs`

---

## 3. Deploying Liquid Glass Studio

The Studio is an interactive shader playground allowing real-time parameter tuning with Leva controls, video backgrounds, and multi-pass inspection.

### Option A: Standalone Project on Vercel
1. Import the Git repository.
2. Set **Build Command**: `pnpm build:studio`
3. Set **Output Directory**: `dist-studio`
4. Uses `vercel.studio.json` with clean rewrites for `/mock` and `/showcase`.

### Option B: Unified Deployment (Studio + Docs + Mock + Showcase)
If you deploy the repository using the default root configuration:
1. Build command: `pnpm build`
2. Output directory: `dist`
3. The root `vercel.json` provides clean rewrites:
   - `/` $\rightarrow$ Studio Playground (`index.html`)
   - `/docs` $\rightarrow$ Documentation Portal (`docs.html`)
   - `/mock` $\rightarrow$ Prism Music App Demo (`mock.html`)
   - `/showcase` $\rightarrow$ Component Showcase (`showcase.html`)

---

## 4. Publishing `liquid-ui` to npm

### Prerequisites:
- An active npm account.
- An npm access token with publishing rights (`Automation` or `Publish` token).
- If publishing under the default name `liquid-ui`, ensure you own the package name on npm. If the name is claimed or you prefer an organization namespace, update `"name"` in `packages/liquid-ui/package.json` to `@your-org/liquid-ui`.

### Publishing Locally:
```bash
# 1. Build and verify all tests
pnpm build:lib
pnpm test
pnpm test:consumer

# 2. Pack and inspect tarball
pnpm pack:lib

# 3. Log in to npm (if not already authenticated)
npm login

# 4. Publish to npm registry
cd packages/liquid-ui
npm publish --access public
```

### Publishing via GitHub Actions (Automated CI/CD):
1. In your GitHub repository, navigate to **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
2. Add a repository secret named `NPM_TOKEN` containing your npm automation token.
3. Push a Git release tag:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```
4. The `.github/workflows/release.yml` workflow will automatically:
   - Run typechecks and unit tests
   - Verify consumer integration
   - Build production ESM, CJS, and TypeScript declaration bundles
   - Publish to npm with public access
   - Create a GitHub Release with the `.tgz` tarball attached

---

## 5. Local Development Commands Reference

```bash
# Install all dependencies across workspace
pnpm install

# Start Vite development server (Studio, Docs, Showcase, Mock)
pnpm dev

# Build the liquid-ui library (ESM, CJS, d.ts)
pnpm build:lib

# Build the Documentation Portal (dist-docs/)
pnpm build:docs

# Build Liquid Glass Studio (dist-studio/)
pnpm build:studio

# Run all test suites
pnpm test

# Run consumer test fixture
pnpm test:consumer

# Typecheck workspace and library
pnpm typecheck
```
