import {
  Children,
  forwardRef,
  isValidElement,
  useMemo,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { LiquidGlassInput } from '../types';
import { LiquidSurface } from './LiquidSurface';

export interface LiquidBlobProps {
  /**
   * Two or more child blobs. Each child must be a `LiquidBlobShape`.
   * Sibling shapes are merged with the engine's smooth-min SDF — the
   * original blob/merging effect from the Studio, as a reusable primitive.
   */
  children: ReactNode;
  glass?: LiquidGlassInput;
  /** Merge radius — higher values give gooey-er merging (material.merge). */
  merge?: number;
  className?: string;
  style?: CSSProperties;
}

export interface LiquidBlobShapeProps {
  children?: ReactNode;
  /** Center x within the blob container (px or CSS value). */
  x: number | string;
  /** Center y within the blob container (px or CSS value). */
  y: number | string;
  width: number | string;
  height: number | string;
  radius?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * One merged shape inside a LiquidBlob. The shape's DOM element defines its
 * geometry; the GPU SDF renders the merged glass.
 */
export const LiquidBlobShape = forwardRef<HTMLDivElement, LiquidBlobShapeProps>(
  function LiquidBlobShape({ children, x, y, width, height, radius, className, style }, ref) {
    return (
      <LiquidSurface
        ref={ref}
        as="div"
        glass="clear"
        radius={radius}
        interaction={{ hover: false }}
        className={className}
        style={{
          position: 'absolute',
          left: typeof x === 'number' ? `${x}px` : x,
          top: typeof y === 'number' ? `${y}px` : y,
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
      >
        {children}
      </LiquidSurface>
    );
  },
);

/**
 * Smoothly-merging glass blobs — the Studio's signature SDF `smin` effect,
 * unlocked as a component.
 *
 * ```tsx
 * <LiquidBlob merge={0.12} style={{ position: 'relative', width: 300, height: 200 }}>
 *   <LiquidBlobShape x={40} y={40} width={100} height={100} />
 *   <LiquidBlobShape x={120} y={60} width={80} height={80} />
 * </LiquidBlob>
 * ```
 */
export const LiquidBlob = forwardRef<HTMLDivElement, LiquidBlobProps>(function LiquidBlob(
  { children, glass = 'clear', merge = 0.08, className, style },
  ref,
) {
  const shapes = useMemo(
    () => Children.toArray(children).filter((c): c is ReactElement => isValidElement(c)),
    [children],
  );

  // Propagate the merge value to each shape's material.
  const glassOverride = useMemo(
    () => (typeof glass === 'string' ? { merge } : { ...(glass ?? {}), merge }),
    [glass, merge],
  );

  return (
    <div
      ref={ref}
      className={`liquid-ui-blob${className ? ` ${className}` : ''}`}
      style={{ position: 'relative', ...style }}
    >
      {shapes.map((shape, i) => (
        <LiquidSurfaceClone key={i} shape={shape} glass={glassOverride} />
      ))}
    </div>
  );
});

/** Internal: injects the shared merge material into each LiquidBlobShape. */
function LiquidSurfaceClone({
  shape,
  glass,
}: {
  shape: ReactElement;
  glass: LiquidBlobProps['glass'];
}) {
  const props = shape.props as LiquidBlobShapeProps & { glass?: LiquidGlassInput };
  return (
    <LiquidBlobShapeInner {...props} glass={glass}>
      {props.children}
    </LiquidBlobShapeInner>
  );
}

function LiquidBlobShapeInner(props: LiquidBlobShapeProps & { glass?: LiquidGlassInput }) {
  const { glass, x, y, width, height, radius, children, className, style, ...rest } = props;
  return (
    <LiquidSurface
      as="div"
      glass={glass ?? 'clear'}
      radius={radius}
      interaction={{ hover: false }}
      {...rest}
      className={className}
      style={{
        position: 'absolute',
        left: typeof x === 'number' ? `${x}px` : x,
        top: typeof y === 'number' ? `${y}px` : y,
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
    >
      {children}
    </LiquidSurface>
  );
}
