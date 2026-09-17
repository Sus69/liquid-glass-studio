---
title: Contributing Guidelines
description: Contributing workflow, code style standards, shader parity rules, and component creation checklist.
page_type: guide
status: published
---

# Contributing Guidelines

Thank you for contributing to Liquid UI! We welcome bug fixes, documentation improvements, shader optimizations, and new component surfaces.

---

## 1. Development Workflow

### Branching & PR Conventions
- **Main Branch**: All development branches branch off from and target `main`.
- **Branch Naming**:
  - `feat/component-name` for new components or engine features.
  - `fix/issue-description` for bug fixes or shader corrections.
  - `docs/page-name` for documentation enhancements.
- **Commit Messages**: Follow Conventional Commits:
  - `feat(components): add LiquidSlider component`
  - `fix(webgpu): correct uniform padding stride in pass3.wgsl`
  - `docs(api): document blurGroupKey partitioning logic`

---

## 2. Component Creation Checklist

When introducing a new liquid glass component (e.g. `<LiquidSlider>`), verify each item in this checklist:

1. **Polymorphic Base**: Wrap the root using `<LiquidSurface>` or pass props through to an underlying DOM element.
2. **Standard Props Contract**: Extend `LiquidComponentProps` (`glass`, `className`, `style`, `children`).
3. **Forwarding Refs**: Always use `React.forwardRef<HTMLElement, Props>` to allow parent components to measure or focus DOM nodes.
4. **CSS Stylesheet**:
   - Place styles in `packages/liquid-ui/src/styles/components/_slider.scss`.
   - Use CSS variables and `.liquid-ui-*` BEM namespace.
   - Include fallback styles for non-GPU environments (`.liquid-ui-fallback`).
5. **Accessibility Contract**:
   - Assign appropriate ARIA roles (e.g. `role="slider"`, `aria-valuenow`).
   - If interactive, handle keyboard navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
   - If purely visual/iconic, enforce `aria-label` at compile time.
6. **Unit Tests**: Add test assertions in `packages/liquid-ui/src/` testing prop pass-through, class names, and preset resolution.

---

## 3. The Shader Parity Rule

Liquid UI supports two distinct graphics pipelines: **WebGL2 (GLSL 3.0 ES)** and **WebGPU (WGSL)**.

> [!IMPORTANT]
> **Any change made to an optical formula in GLSL MUST be implemented with exact 1:1 numerical parity in WGSL, and vice versa.**

### Shader Directories:
- GLSL Shaders: `packages/liquid-ui/src/engine/shaders/`
- WGSL Shaders: `packages/liquid-ui/src/engine/shaders-wgsl/`

### Memory Alignment Constraints:
- In WGSL, uniform structs require strict 16-byte alignment for `vec4<f32>` arrays.
- If you modify global scene uniforms in `header.wgsl`, you must ensure that uniform arrays (such as `u_shapes_A`) begin on an offset evenly divisible by 16 bytes. Notice how `u_headerPad` is utilized in `header.wgsl` to guarantee this alignment.

---

## 4. Verification Commands

Before opening a pull request, ensure all local checks pass without warnings:

```bash
# 1. Typecheck the entire monorepo
npx tsc -b

# 2. Run unit test suites
npx pnpm --filter liquid-ui test

# 3. Verify production Vite build (Studio + Docs)
npx vite build

# 4. Verify standalone library compilation
npx pnpm --filter liquid-ui build
```

---

## Next Steps

- Follow local workstation instructions in **[Development Setup](development/setup.md)**.
- Read about documentation procedures in **[Documentation Maintenance](development/maintenance.md)**.
