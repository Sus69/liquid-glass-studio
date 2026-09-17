---
title: Documentation Maintenance & Style Guide
description: Architecture of the documentation system, authoring guidelines, and validation workflows.
page_type: guide
status: published
---

# Documentation Maintenance & Style Guide

The Liquid UI documentation portal is an integrated, statically pre-bundled web application running inside the `liquid-glass-studio` monorepo. This guide explains how to author, organize, and maintain documentation files.

---

## 1. Information Architecture & Navigation

The documentation hierarchy is defined authoritatively in:
```
docs/navigation.json
```

It specifies 53 pages across 9 logical sections:
1. **Introduction** (`introduction/`)
2. **Getting Started** (`getting-started/`)
3. **Core Concepts** (`core-concepts/`)
4. **Components** (`components/`)
5. **Materials & Optics** (`materials/`)
6. **Guides & Recipes** (`guides/`)
7. **Advanced Architecture** (`advanced/`)
8. **Reference** (`reference/`)
9. **Development & Contributing** (`development/`)

### Navigation Schema
Each item in `docs/navigation.json` follows this schema:
```json
{
  "id": "guides-custom-effects",
  "title": "Creating Custom Glass Effects",
  "path": "guides/custom-effects.md",
  "type": "guide"
}
```

---

## 2. Dynamic Documentation Bundling

Documentation markdown files are ingested at build-time using Vite's eager glob mechanism in `src/docs/docsData.ts`:

```ts
// src/docs/docsData.ts
const rawDocs = import.meta.glob('../../docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
```

Whenever a markdown file is created or updated in `docs/`, Vite's Hot Module Replacement (HMR) immediately refreshes the active page in your browser at `http://localhost:5173/docs.html`.

---

## 3. Authoring Guidelines & Style Rules

### Frontmatter Standard
Every markdown file must begin with YAML frontmatter containing:
```yaml
---
title: Page Title
description: Concise, single-sentence summary of the page's topic.
page_type: concept | guide | component | reference | advanced
status: published
---
```

### Formatting Best Practices
1. **Mathematical Rigor**: When detailing optical physics or geometry formulas, use standard $\LaTeX$ notation:
   $$\vec{N} = \frac{\nabla \text{SDF}(\vec{p})}{\|\nabla \text{SDF}(\vec{p})\|}$$
2. **ASCII Architecture Diagrams**: Use clean ASCII box diagrams to depict data flow, coordinate systems, and multi-pass shader buffers.
3. **GitHub Callouts**: Emphasize critical operational constraints using alerts:
   > [!IMPORTANT]
   > Surfaces beyond the 48-shape limit are logged as warnings and dropped during uniform packing.
4. **Authoritative Source of Truth**: Never fabricate API signatures, props, default values, or benchmarks. Every statement must reflect active source code in `packages/liquid-ui/`.

---

## 4. Verification Workflow

After editing or adding documentation pages, validate the build:

```bash
# 1. Typecheck the workspace
npx tsc -b

# 2. Build the documentation bundle
npx vite build
```

If any markdown path in `navigation.json` is missing or invalid, the build or runtime viewer will flag the error.

---

## Next Steps

- Explore the complete API Reference in **[Public API Catalog](reference/api.md)**.
- Read about contributing in **[Contributing Guidelines](development/contributing.md)**.
