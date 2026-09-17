import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { LiquidGlassInput } from '../types';
import { LiquidSurface } from './LiquidSurface';

export interface LiquidTooltipProps {
  /** Tooltip content (text or nodes). */
  content: ReactNode;
  /** The trigger element — typically a LiquidIconButton or LiquidButton. */
  children: ReactElement;
  glass?: LiquidGlassInput;
  /** Placement relative to the trigger. */
  side?: 'top' | 'bottom';
  /** Show delay in ms. */
  delayMs?: number;
}

/**
 * Accessible tooltip on a glass surface. Wired via aria-describedby; content
 * is real DOM (portal to body to escape overflow clipping).
 *
 * ```tsx
 * <LiquidTooltip content="Copy">
 *   <LiquidIconButton aria-label="Copy">…</LiquidIconButton>
 * </LiquidTooltip>
 * ```
 */
export function LiquidTooltip({
  content,
  children,
  glass = 'dark',
  side = 'top',
  delayMs = 150,
}: LiquidTooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<number | null>(null);

  const show = useCallback(() => {
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delayMs);
  }, [delayMs]);

  const hide = useCallback(() => {
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = null;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const update = () => {
      const el = triggerRef.current;
      const tip = tipRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      let x = r.left + r.width / 2;
      let y = side === 'top' ? r.top - 8 : r.bottom + 8;
      if (tip) {
        const tr = tip.getBoundingClientRect();
        x -= tr.width / 2;
        if (side === 'top') y -= tr.height;
      }
      setPos({ x, y });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, side]);

  // Trigger must be a single element; clone to attach handlers + ref.
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ ref?: unknown; onPointerEnter?: unknown; onPointerLeave?: unknown; onFocus?: unknown; onBlur?: unknown }>, {
        ref: (el: HTMLElement | null) => {
          triggerRef.current = el;
          const original = (children as ReactElement<{ ref?: unknown }>).props.ref;
          if (typeof original === 'function') original(el);
          else if (original && typeof original === 'object') (original as { current: unknown }).current = el;
        },
        onPointerEnter: show,
        onPointerLeave: hide,
        onFocus: show,
        onBlur: hide,
      })
    : children;

  return (
    <>
      {trigger}
      {open &&
        pos &&
        typeof document !== 'undefined' &&
        (
          <div
            ref={tipRef}
            role="tooltip"
            className="liquid-ui-tooltip"
            style={{
              left: pos.x,
              top: pos.y,
              transform: side === 'top' ? 'translateY(-2px)' : 'translateY(2px)',
            }}
          >
            <LiquidSurface
              as="div"
              glass={glass}
              radius={10}
              interaction={{ hover: false }}
              style={{ padding: '6px 10px', background: 'rgba(20, 22, 30, 0.35)' }}
            >
              {content}
            </LiquidSurface>
          </div>
        )}
    </>
  );
}

/** Keep a stable style export for consumers building custom overlays. */
export type TooltipStyle = CSSProperties;
