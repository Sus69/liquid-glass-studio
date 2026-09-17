import { forwardRef, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import type { LiquidGlassInput } from '../types';
import { LiquidSurface } from './LiquidSurface';

export interface LiquidInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'children' | 'size'> {
  /** Leading icon or element. */
  leading?: ReactNode;
  /** Trailing icon or element. */
  trailing?: ReactNode;
  glass?: LiquidGlassInput;
  radius?: number;
  /** Outer padding of the glass field. */
  padding?: number | string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Real `<input>` on a glass surface. The text is actual DOM text — the
 * engine provides only the material behind it (never render text through
 * WebGL).
 *
 * ```tsx
 * <LiquidInput placeholder="Search…" glass="frosted" />
 * ```
 */
export const LiquidInput = forwardRef<HTMLInputElement, LiquidInputProps>(function LiquidInput(
  { leading, trailing, glass = 'frosted', radius = 14, padding = '10px 14px', className, style, ...rest },
  ref,
) {
  return (
    <LiquidSurface
      as="div"
      glass={glass}
      radius={radius}
      interaction={{ hover: false, press: false }}
      className={`liquid-ui-input-wrap${className ? ` ${className}` : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: typeof padding === 'number' ? `${padding}px` : padding,
        ...style,
      }}
    >
      {leading}
      <input
        ref={ref}
        className="liquid-ui-input"
        style={{ flex: 1, minWidth: 0 }}
        {...rest}
      />
      {trailing}
    </LiquidSurface>
  );
});
