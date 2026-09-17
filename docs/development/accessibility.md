---
title: Accessibility & Inclusive Design
description: Architectural accessibility guarantees, semantic HTML preservation, keyboard navigation, and reduced motion.
page_type: guide
status: published
---

# Accessibility & Inclusive Design

A common danger of GPU-accelerated web libraries is rendering visual elements inside a raw `<canvas>`, rendering content completely invisible to screen readers, keyboard focus, and accessibility trees.

**Liquid UI was engineered with a strict accessibility-first architecture**: the GPU canvas is treated strictly as an ambient visual layer, while all interactive content remains 100% semantic HTML in the standard DOM.

---

## 1. Built-in Architectural Guarantees

```
┌────────────────────────────────────────────────────────────────────────┐
│ ACCESSIBILITY ARCHITECTURE                                             │
├───────────────────────┬────────────────────────────────────────────────┤
│ Canvas Isolation      │ aria-hidden="true" and pointer-events: none.   │
│ Semantic Elements     │ Real <button>, <input>, role="switch", etc.    │
│ Strict Prop Contracts │ Mandatory 'aria-label' on LiquidIconButton.    │
│ Dialog Focus Traps    │ Full Tab/Shift+Tab cycle & Escape dismissal.   │
│ prefers-reduced-motion│ Disables parallax and instant-settles springs. │
└───────────────────────┴────────────────────────────────────────────────┘
```

---

## 2. Canvas Isolation from the Accessibility Tree

The underlying GPU canvas created by `LiquidProvider` is strictly excluded from assistive technology:

```html
<canvas
  class="liquid-ui-canvas"
  aria-hidden="true"
  style="pointer-events: none;"
/>
```

- **Screen Readers**: Never perceive or announce canvas elements.
- **Mouse & Touch**: Pass directly through the canvas to interact with real DOM elements beneath or above it.

---

## 3. Semantic Element Preservation

Liquid UI components render genuine HTML elements rather than generic `<div>` tags:

| Component | Rendered Tag | Accessible Role & Attributes |
|---|---|---|
| `<LiquidButton>` | `<button type="button">` | Full native keyboard focus (`Enter`, `Space`) |
| `<LiquidInput>` | `<input>` | Standard form control with native cursor & IME support |
| `<LiquidToggle>` | `<button>` | `role="switch"`, `aria-checked="true\|false"` |
| `<LiquidModal>` | `<div>` | `role="dialog"`, `aria-modal="true"`, focus-trapped |
| `<LiquidIconButton>` | `<button>` | **Compile-time mandatory** `aria-label` attribute |

### TypeScript Compile-Time Enforcement
`LiquidIconButton` enforces accessibility at compile time:

```tsx
// ❌ TypeScript Error: Property 'aria-label' is missing
<LiquidIconButton icon={<SearchIcon />} />

// ✅ Compiles cleanly
<LiquidIconButton icon={<SearchIcon />} aria-label="Search documents" />
```

---

## 4. Modal Dialog Accessibility

`<LiquidModal>` implements the WAI-ARIA Modal Dialog Pattern:

```tsx
<LiquidModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  ariaLabel="Confirm deletion"
>
  <h3>Are you sure?</h3>
  <p>This action cannot be undone.</p>
  <LiquidButton variant="primary" onClick={handleConfirm}>Confirm</LiquidButton>
</LiquidModal>
```

1. **Focus Trap**: Keyboard `Tab` and `Shift+Tab` navigate only within focusable elements inside the modal.
2. **Escape Dismissal**: Pressing the `Escape` key immediately triggers `onClose()`.
3. **Focus Restoration**: Upon unmounting, focus is restored to the element that triggered the modal.

---

## 5. Reduced Motion (`useReducedMotion`)

Liquid UI actively respects users' vestibular and motion sensitivities via the `useReducedMotion` hook:

```ts
// packages/liquid-ui/src/hooks/useReducedMotion.ts
export function useReducedMotion(): boolean {
  // Subscribes to window.matchMedia('(prefers-reduced-motion: reduce)')
}
```

When active:
- **Hover Parallax**: Cursor tracking offsets (`offsetX`, `offsetY`) are clamped to `0`.
- **Press Springs**: Elastic bounces are disabled, transitioning cleanly without oscillation.
- **LiquidDock**: Magnification scaling curves are suppressed.

---

## 6. Developer Responsibilities: Color Contrast

While Liquid UI provides physical light refraction, developers must ensure adequate contrast:
- **WCAG 2.1 AA**: Body text requires a minimum contrast ratio of **4.5:1** against its background; large text requires **3:1**.
- **Transparent Surfaces**: When using `glass="clear"`, ensure background content does not compromise text legibility. For content panels, prefer `glass="frosted"` or `glass="dark"` with high-contrast text colors.

---

## Next Steps

- Review compatibility across engines in **[Browser Support](development/browser-support.md)**.
- Explore the API Reference in **[Component Reference](reference/api.md)**.
