import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { LiquidGlassInput } from '../types';
import { LiquidSurface } from './LiquidSurface';

export interface LiquidModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  glass?: LiquidGlassInput;
  radius?: number;
  /** Accessible dialog label (use either this or ariaLabelledBy). */
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

/**
 * Accessible modal dialog on a glass panel: focus trap, Escape to close,
 * aria-modal wiring. The overlay dims the page; the panel is a LiquidSurface
 * so the GPU material renders behind real DOM content.
 */
export function LiquidModal({
  open,
  onClose,
  children,
  glass = 'frosted',
  radius = 24,
  ariaLabel,
  ariaLabelledBy,
}: LiquidModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && panel) {
        // Minimal focus trap.
        const focusables = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="liquid-ui-modal__overlay"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <LiquidSurface
        as="div"
        glass={glass}
        radius={radius}
        interaction={{ hover: false }}
        className="liquid-ui-modal__panel"
        style={{ outline: 'none' }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          tabIndex={-1}
          style={{ outline: 'none' }}
        >
          {children}
        </div>
      </LiquidSurface>
    </div>,
    document.body,
  );
}
