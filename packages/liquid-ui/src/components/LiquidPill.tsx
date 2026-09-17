import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import type { LiquidGlassInput } from '../types';
import { LiquidSurface } from './LiquidSurface';

export interface LiquidPillProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  children?: ReactNode;
  glass?: LiquidGlassInput;
  /** Optional leading dot/status color. */
  statusColor?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Compact glass pill for tags, labels, statuses, filters and metadata.
 *
 * ```tsx
 * <LiquidPill statusColor="#34c759">New</LiquidPill>
 * ```
 */
export const LiquidPill = forwardRef<HTMLDivElement, LiquidPillProps>(function LiquidPill(
  { children, glass = 'soft', statusColor, className, style, ...rest },
  ref,
) {
  return (
    <LiquidSurface
      ref={ref}
      as="div"
      glass={glass}
      radius={999}
      interaction={{ hover: false }}
      className={`liquid-ui-pill${className ? ` ${className}` : ''}`}
      style={style}
      {...rest}
    >
      {statusColor ? (
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: statusColor,
            display: 'inline-block',
          }}
        />
      ) : null}
      {children}
    </LiquidSurface>
  );
});
