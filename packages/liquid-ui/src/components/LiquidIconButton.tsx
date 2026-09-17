import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import type { LiquidGlassInput, LiquidInteraction } from '../types';
import { LiquidSurface } from './LiquidSurface';

export interface LiquidIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'children'> {
  /** Accessible name — required (icon-only buttons have no text content). */
  'aria-label': string;
  children?: ReactNode;
  glass?: LiquidGlassInput;
  size?: number;
  radius?: number;
  interaction?: LiquidInteraction;
  className?: string;
  style?: CSSProperties;
}

/**
 * Icon-only glass button. Focus heavily on pointer interaction: glare shifts
 * with pointer position, the shape compresses on press, and the icon stays
 * crisp DOM (never rendered through WebGL).
 *
 * ```tsx
 * <LiquidIconButton aria-label="Search"><SearchIcon /></LiquidIconButton>
 * ```
 */
export const LiquidIconButton = forwardRef<HTMLButtonElement, LiquidIconButtonProps>(
  function LiquidIconButton(
    { children, glass = 'soft', size = 40, radius, interaction, className, style, ...rest },
    ref,
  ) {
    return (
      <LiquidSurface
        ref={ref}
        as="button"
        type="button"
        glass={glass}
        radius={radius ?? Math.round(size / 2)}
        interaction={interaction ?? { hover: true, press: true, strength: 0.2 }}
        pressDepth={0.1}
        className={`liquid-ui-icon-button${className ? ` ${className}` : ''}`}
        style={{ width: size, height: size, ...style }}
        {...rest}
      >
        {children}
      </LiquidSurface>
    );
  },
);
