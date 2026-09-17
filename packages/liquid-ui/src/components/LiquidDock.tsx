import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { LiquidGlassInput } from '../types';
import { LiquidSurface } from './LiquidSurface';
import { ScalarSpring } from '../engine/interaction';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface LiquidDockProps {
  children?: ReactNode;
  glass?: LiquidGlassInput;
  radius?: number;
  /** Max scale a dock item reaches under the pointer (default 1.45). */
  magnification?: number;
  /** Distance (px) over which magnification falls off. */
  proximity?: number;
  className?: string;
  style?: CSSProperties;
}

export interface LiquidDockItemProps {
  children?: ReactNode;
  /** Triggered when the pointer presses the item. */
  onClick?: () => void;
  /** Material for this item (default 'soft'). */
  glass?: LiquidGlassInput;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

interface ItemSpring {
  spring: ScalarSpring;
  el: HTMLElement | null;
}

/**
 * High-quality dock/navigation primitive — the showcase component.
 *
 * Pointer proximity drives per-item spring magnification + lift; the glass
 * items share the single engine canvas, and the SDF merge radius makes
 * neighboring items visually blend as they grow (the original blob effect).
 *
 * ```tsx
 * <LiquidDock>
 *   <LiquidDockItem>Home</LiquidDockItem>
 *   <LiquidDockItem>Projects</LiquidDockItem>
 * </LiquidDock>
 * ```
 */
export function LiquidDock({
  children,
  glass = 'clear',
  radius = 26,
  magnification = 1.45,
  proximity = 110,
  className,
  style,
}: LiquidDockProps) {
  const reducedMotion = useReducedMotion();
  const dockRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef(new Map<number, ItemSpring>());
  const pointerXRef = useRef<number | null>(null);

  const items = useMemo(() => Children.toArray(children).filter(isValidElement), [children]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      pointerXRef.current = e.clientX;
    },
    [],
  );

  const handlePointerLeave = useCallback(() => {
    pointerXRef.current = null;
  }, []);

  // Spring integration for item transforms — DOM transforms, no React
  // re-renders; the engine keeps seeing the (resized) rects and reacts.
  useEffect(() => {
    if (reducedMotion) return;
    let last = performance.now();
    let raf = 0;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;

      const dock = dockRef.current;
      if (!dock) return;
      const dockRect = dock.getBoundingClientRect();
      const px = pointerXRef.current;

      let idx = 0;
      for (const [, item] of itemsRef.current) {
        const el = item.el;
        if (!el) {
          idx++;
          continue;
        }
        const r = el.getBoundingClientRect();
        const center = r.left + r.width / 2 - dockRect.left;

        let target = 1;
        if (px != null) {
          const dist = Math.abs(px - dockRect.left - center);
          const influence = Math.max(0, 1 - dist / proximity);
          target = 1 + (magnification - 1) * influence * influence;
        }

        item.spring.setTarget(target);
        const moving = item.spring.step(dt);
        const v = item.spring.value;
        if (moving || v !== 1) {
          const lift = (v - 1) * -10;
          el.style.transform = `translateY(${lift.toFixed(2)}px) scale(${v.toFixed(3)})`;
          el.style.transformOrigin = 'bottom center';
        }
        idx++;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [magnification, proximity, reducedMotion, items.length]);

  return (
    <LiquidSurface
      as="div"
      glass={glass}
      radius={radius}
      interaction={{ hover: false }}
      className={`liquid-ui-dock${className ? ` ${className}` : ''}`}
      style={style}
    >
      <div
        ref={dockRef}
        style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 10 }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {items.map((child, i) => {
          return (
            <DockItemSlot key={i} index={i} itemsRef={itemsRef}>
              {child}
            </DockItemSlot>
          );
        })}
      </div>
    </LiquidSurface>
  );
}

/** Internal: attaches a spring + element ref to each dock item. */
function DockItemSlot({
  index,
  itemsRef,
  children,
}: {
  index: number;
  itemsRef: React.MutableRefObject<Map<number, ItemSpring>>;
  children: ReactElement;
}) {
  useEffect(() => {
    const entry: ItemSpring = {
      spring: new ScalarSpring({ value: 1, target: 1, stiffness: 380, damping: 20 }),
      el: null,
    };
    itemsRef.current.set(index, entry);
    return () => {
      itemsRef.current.delete(index);
    };
  }, [index, itemsRef]);

  return cloneElement(children as ReactElement<{ ref?: (el: HTMLDivElement | null) => void }>, {
    ref: (el: HTMLDivElement | null) => {
      const entry = itemsRef.current.get(index);
      if (entry) entry.el = el;
      const original = (children as ReactElement<{ ref?: unknown }>).props.ref;
      if (typeof original === 'function') original(el);
    },
  });
}

/**
 * A single dock item (a glass button-like tile).
 */
export const LiquidDockItem = forwardRef<HTMLDivElement, LiquidDockItemProps>(
  function LiquidDockItem({ children, onClick, glass = 'soft', className, style, 'aria-label': ariaLabel }, ref) {
    return (
      <LiquidSurface
        ref={ref}
        as="div"
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        glass={glass}
        radius={16}
        interaction={{ hover: true, press: true, strength: 0.1 }}
        pressDepth={0.07}
        onClick={onClick}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        className={`liquid-ui-dock-item${className ? ` ${className}` : ''}`}
        style={style}
      >
        {children}
      </LiquidSurface>
    );
  },
);
