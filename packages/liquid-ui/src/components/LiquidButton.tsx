import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import type { LiquidGlassInput, LiquidInteraction, LiquidPresetName } from '../types';
import { LiquidSurface } from './LiquidSurface';

export type LiquidButtonVariant = 'primary' | 'secondary' | 'ghost';
export type LiquidButtonSize = 'sm' | 'md' | 'lg';

export interface LiquidButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  children?: ReactNode;
  /** Visual variant. */
  variant?: LiquidButtonVariant;
  /** Size preset. */
  size?: LiquidButtonSize;
  glass?: LiquidGlassInput;
  radius?: number;
  interaction?: LiquidInteraction;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

const VARIANT_PRESET: Record<LiquidButtonVariant, LiquidPresetName> = {
  primary: 'strong',
  secondary: 'soft',
  ghost: 'clear',
};

/**
 * Real accessible `<button>` with the liquid material applied.
 *
 * Hover: pointer-following displacement + glare response (springs).
 * Press: spring compression of the SDF shape — the glass itself deforms,
 * not just a CSS scale.
 *
 * ```tsx
 * <LiquidButton variant="primary" size="lg">Get Started</LiquidButton>
 * ```
 */
export const LiquidButton = forwardRef<HTMLButtonElement, LiquidButtonProps>(function LiquidButton(
  {
    children,
    variant = 'primary',
    size = 'md',
    glass,
    radius,
    interaction,
    loading = false,
    disabled,
    className,
    style,
    ...rest
  },
  ref,
) {
  const resolvedGlass = glass ?? VARIANT_PRESET[variant];

  return (
    <LiquidSurface
      ref={ref}
      as="button"
      type="button"
      glass={resolvedGlass}
      radius={radius ?? 14}
      interaction={interaction ?? { hover: true, press: true, strength: 0.16 }}
      pressDepth={0.08}
      disabled={disabled || loading}
      data-variant={variant}
      data-loading={loading ? 'true' : undefined}
      className={`liquid-ui-button liquid-ui-button--${variant} liquid-ui-button--${size}${className ? ` ${className}` : ''}`}
      style={style}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          style={{
            width: '1em',
            height: '1em',
            borderRadius: '50%',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            animation: 'liquid-ui-spin 0.8s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : null}
      {children}
    </LiquidSurface>
  );
});

// Keyframes are injected once for the loading spinner.
if (typeof document !== 'undefined' && !document.getElementById('liquid-ui-keyframes')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'liquid-ui-keyframes';
  styleEl.textContent = `@keyframes liquid-ui-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(styleEl);
}
