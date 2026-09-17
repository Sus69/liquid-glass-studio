import { useEffect, useRef, useState, type RefObject } from 'react';

export interface ElementBounds {
  width: number;
  height: number;
}

/**
 * Observe an element's size (ResizeObserver) and viewport visibility
 * (IntersectionObserver). Off-screen components unregister from the engine,
 * so scrolling a LiquidDock out of view costs zero GPU work.
 */
export function useElementBounds(ref: RefObject<HTMLElement | null>): ElementBounds {
  const [bounds, setBounds] = useState<ElementBounds>({ width: 0, height: 0 });
  const visibleRef = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const r = entry.contentRect;
        setBounds({ width: r.width, height: r.height });
      }
    });
    ro.observe(el);

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          visibleRef.current = entry.isIntersecting;
        }
      },
      { rootMargin: '120px' },
    );
    io.observe(el);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [ref]);

  return bounds;
}

/** Read current viewport visibility (set by useElementBounds). */
export function makeVisibilityGetter(ref: RefObject<HTMLElement | null>): () => boolean {
  return () => visibleRefFor(ref);
}

// Shared visibility store so the getter pattern works across hook instances.
const visibilityMap = new WeakMap<HTMLElement, boolean>();

function visibleRefFor(ref: RefObject<HTMLElement | null>): boolean {
  const el = ref.current;
  if (!el) return false;
  return visibilityMap.get(el) ?? true;
}

if (typeof window !== 'undefined') {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visibilityMap.set(entry.target as HTMLElement, entry.isIntersecting);
      }
    },
    { rootMargin: '120px' },
  );

  // Observe any element registered via data attribute.
  const mo = new MutationObserver(() => {
    document.querySelectorAll('[data-liquid-observe]').forEach((el) => {
      if (!visibilityMap.has(el as HTMLElement)) {
        io.observe(el);
        visibilityMap.set(el as HTMLElement, true);
      }
    });
  });
  mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true });
}
