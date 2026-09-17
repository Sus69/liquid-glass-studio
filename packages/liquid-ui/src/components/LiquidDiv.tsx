import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import type { LiquidGlassInput, LiquidInteraction } from '../types';
import { LiquidSurface } from './LiquidSurface';

export interface LiquidDivProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  children?: ReactNode;
  /** Preset name or material override. */
  glass?: LiquidGlassInput;
  /** Corner radius (px). */
  radius?: number;
  /** Padding (px or CSS value). */
  padding?: number | string;
  /** Explicit width (px or CSS value). */
  width?: number | string;
  /** Explicit height (px or CSS value). */
  height?: number | string;
  /** CSS tint applied to the DOM layer (in addition to material tint). */
  tint?: string;
  interaction?: LiquidInteraction;
  className?: string;
  style?: CSSProperties;
}

/**
 * General-purpose liquid glass container. Behaves like a normal DOM div —
 * children are real, accessible DOM nodes; the GPU canvas provides the
 * material behind them.
 *
 * ```tsx
 * <LiquidDiv glass="strong" radius={24}>Content</LiquidDiv>
 * ```
 */
export const LiquidDiv = forwardRef<HTMLDivElement, LiquidDivProps>(function LiquidDiv(
  { children, glass, radius, padding, width, height, tint, interaction, className, style, ...rest },
  ref,
) {
  const surfaceStyle: CSSProperties = {
    ...(padding != null ? { padding: typeof padding === 'number' ? `${padding}px` : padding } : null),
    ...(width != null ? { width: typeof width === 'number' ? `${width}px` : width } : null),
    ...(height != null ? { height: typeof height === 'number' ? `${height}px` : height } : null),
    ...(tint != null ? { background: tint } : null),
    ...style,
  };

  return (
    <LiquidSurface
      ref={ref}
      as="div"
      glass={glass}
      radius={radius}
      interaction={interaction ?? { hover: false }}
      className={className}
      style={surfaceStyle}
      {...rest}
    >
      {children}
    </LiquidSurface>
  );
});
