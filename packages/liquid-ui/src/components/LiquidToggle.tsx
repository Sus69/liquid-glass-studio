import { forwardRef, type CSSProperties } from 'react';
import type { LiquidGlassInput } from '../types';
import { LiquidSurface } from './LiquidSurface';

export interface LiquidToggleProps {
  /** Controlled checked state. */
  checked: boolean;
  /** Called with the next state on activation. */
  onCheckedChange: (checked: boolean) => void;
  /** Disabled interaction. */
  disabled?: boolean;
  glass?: LiquidGlassInput;
  /** Track width in px (height is width * 0.55). */
  width?: number;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

/**
 * Accessible switch (`role="switch"`, `aria-checked`) with a spring-driven
 * thumb. The track is the liquid material; the thumb rides DOM.
 *
 * ```tsx
 * <LiquidToggle checked={enabled} onCheckedChange={setEnabled} aria-label="Dark mode" />
 * ```
 */
export const LiquidToggle = forwardRef<HTMLButtonElement, LiquidToggleProps>(function LiquidToggle(
  { checked, onCheckedChange, disabled, glass = 'soft', width = 52, className, style, 'aria-label': ariaLabel },
  ref,
) {
  const height = Math.round(width * 0.55);
  const thumb = height - 6;

  return (
    <LiquidSurface
      ref={ref}
      as="button"
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      glass={glass}
      radius={height / 2}
      interaction={{ hover: true, press: true, strength: 0.08 }}
      pressDepth={0.05}
      disabled={disabled}
      data-checked={checked ? 'true' : 'false'}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`liquid-ui-toggle${className ? ` ${className}` : ''}`}
      style={{ width, height, ...style }}
    >
      <span
        aria-hidden="true"
        className="liquid-ui-toggle__thumb"
        style={{ width: thumb, height: thumb }}
      />
    </LiquidSurface>
  );
});
