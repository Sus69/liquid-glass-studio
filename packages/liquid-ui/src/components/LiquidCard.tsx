import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import type { LiquidComponentProps, LiquidGlassInput, LiquidInteraction } from '../types';
import { LiquidSurface } from './LiquidSurface';

export interface LiquidCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'>, LiquidComponentProps {
  children?: ReactNode;
  glass?: LiquidGlassInput;
  radius?: number;
  /** Enable pointer-following response. */
  interactive?: boolean;
  interaction?: LiquidInteraction;
  className?: string;
  style?: CSSProperties;
  layer?: number;
}

/**
 * Glass card surface.
 *
 * ```tsx
 * <LiquidCard interactive glass="frosted">
 *   <h2>Project</h2>
 *   <p>Description</p>
 * </LiquidCard>
 * ```
 */
export const LiquidCard = forwardRef<HTMLDivElement, LiquidCardProps>(function LiquidCard(
  { children, glass = 'soft', radius = 20, interactive = false, interaction, className, style, ...rest },
  ref,
) {
  return (
    <LiquidSurface
      ref={ref}
      as="div"
      glass={glass}
      radius={radius}
      interaction={
        interaction ??
        (interactive ? { hover: true, press: false, strength: 0.1 } : { hover: false })
      }
      className={`liquid-ui-card${className ? ` ${className}` : ''}`}
      style={style}
      {...rest}
    >
      {children}
    </LiquidSurface>
  );
});
