import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { LiquidGlassInput, LiquidInteraction, LiquidMaterial } from '../types';
import { resolveMaterial } from '../materials';
import { useLiquidContext } from '../context';
import { ScalarSpring } from '../engine/interaction';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { materialFallbackClasses } from './fallback';

export interface LiquidSurfaceProps
  extends React.HTMLAttributes<HTMLElement>,
    React.AriaAttributes {
  /** The semantic DOM element to render (div, button, input, …). */
  as?: keyof HTMLElementTagNameMap;
  children?: ReactNode;
  glass?: LiquidGlassInput;
  className?: string;
  style?: CSSProperties;
  /** Radius override (px) — wins over material.radius. */
  radius?: number;
  /** Tint override (any CSS color) applied to the DOM layer. */
  tintCss?: string;
  interaction?: LiquidInteraction;
  disabled?: boolean;
  /** Press spring depth (0-1). */
  pressDepth?: number;
  /** ARIA role forwarded to the DOM element. */
  role?: React.AriaRole;
  /** For as="button": the button type. */
  type?: 'button' | 'submit' | 'reset';
  /** Called with pointer position for glare/magnetism, normalized to [-1, 1]. */
  onPointerNorm?: (x: number, y: number, active: boolean) => void;
  /** Extra data attributes forwarded to the DOM element. */
  [key: `data-${string}`]: string | undefined;
}

/**
 * The core primitive every liquid component composes.
 *
 * Responsibilities:
 * - renders the semantic DOM element (content never lives in WebGL)
 * - registers/unregisters its geometry with the shared engine
 * - resolves the material (preset string or override object)
 * - drives press/hover springs and reports geometry deltas to the engine
 * - applies the CSS fallback layer when GPU is unavailable
 *
 * The GPU canvas draws the material *behind* this element's DOM content;
 * the element itself stays transparent with its border radius matching
 * the SDF shape so the two layers coincide pixel-perfectly.
 */
export const LiquidSurface = forwardRef<HTMLElement, LiquidSurfaceProps>(
  function LiquidSurface(
    {
      as = 'div',
      children,
      glass,
      className,
      style,
      radius,
      tintCss,
      interaction,
      disabled,
      pressDepth = 0.06,
      onPointerNorm,
      ...dataAttrs
    },
    forwardedRef,
  ) {
    const { engine, ready } = useLiquidContext();
    const reducedMotion = useReducedMotion();

    const material: LiquidMaterial = useMemo(() => {
      const m = resolveMaterial(glass);
      if (radius != null) m.radius = radius;
      return m;
    }, [glass, radius]);

    const localRef = useRef<HTMLElement | null>(null);
    const setRef = useCallback(
      (el: HTMLElement | null) => {
        localRef.current = el;
        const id = shapeIdRef.current;
        if (el && engine && id != null) engine.registry.setElement(id, el);
        if (typeof forwardedRef === 'function') forwardedRef(el);
        else if (forwardedRef) (forwardedRef as { current: HTMLElement | null }).current = el;
      },
      [forwardedRef, engine],
    );

    const shapeIdRef = useRef<number | null>(null);
    const pressSpring = useRef(new ScalarSpring({ stiffness: 420, damping: 24 }));
    const hoverSpring = useRef(new ScalarSpring({ value: 0, target: 0, stiffness: 260, damping: 22 }));
    const pointerRef = useRef({ x: 0, y: 0, inside: false });
    const geometryRef = useRef({ x: 0, y: 0, halfWidth: 0, halfHeight: 0 });

    // Register with the engine when it's ready.
    useEffect(() => {
      if (!engine || !ready) return;
      const id = engine.registry.register(material);
      shapeIdRef.current = id;
      if (localRef.current) engine.registry.setElement(id, localRef.current);
      return () => {
        engine.registry.unregister(id);
        shapeIdRef.current = null;
      };
    }, [engine, ready]); // material changes are pushed per-frame below

    // Push material updates into the registry (presets switch live).
    useEffect(() => {
      const engineRef = engine;
      const id = shapeIdRef.current;
      if (!engineRef || id == null) return;
      const shape = engineRef.registry.get(id);
      if (shape) {
        shape.state.material = material;
        shape.dirty = true;
      }
    }, [engine, material]);

    // Visibility-based unregistration.
    useEffect(() => {
      const engineRef = engine;
      const id = shapeIdRef.current;
      const el = localRef.current;
      if (!engineRef || id == null || !el) return;
      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) engineRef.registry.setVisible(id, entry.isIntersecting);
        },
        { rootMargin: '120px' },
      );
      io.observe(el);
      return () => io.disconnect();
    }, [engine, ready]);

    // Geometry sync: ResizeObserver + rAF-throttled rect read.
    useEffect(() => {
      const engineRef = engine;
      const id = shapeIdRef.current;
      const el = localRef.current;
      if (!engineRef || id == null || !el) return;

      let raf = 0;
      const sync = () => {
        const geo = engineRef.computeShapeGeometry(el, material);
        geometryRef.current = geo;
        const shape = engineRef.registry.get(id);
        if (shape) {
          const hoverScale = 1;
          shape.state = {
            ...shape.state,
            x: geo.x,
            y: geo.y,
            halfWidth: geo.halfWidth,
            halfHeight: geo.halfHeight,
            radius: material.radius,
            roundness: material.roundness,
            scale: pressSpring.current.value * hoverScale,
            offsetX: reducedMotion ? 0 : pointerRef.current.x * (interaction?.strength ?? 0.12) * hoverSpring.current.value,
            offsetY: reducedMotion ? 0 : pointerRef.current.y * (interaction?.strength ?? 0.12) * hoverSpring.current.value,
          };
          shape.dirty = true;
        }
      };

      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(sync);
      });
      ro.observe(el);
      sync();

      return () => {
        ro.disconnect();
        cancelAnimationFrame(raf);
      };
    }, [engine, ready, material, interaction?.strength, reducedMotion]);

    // Spring integration loop: press + hover springs step every frame while
    // the component is mounted; the engine skips frames when nothing moves.
    useEffect(() => {
      if (!engine || !ready) return;
      const id = shapeIdRef.current;
      if (id == null) return;

      return engine.scheduler.add(() => {
        const shape = engine.registry.get(id);
        if (!shape) return;

        const pressMoving = pressSpring.current.step(1 / 60);
        const hoverMoving = hoverSpring.current.step(1 / 60);

        const targetScale = pointerRef.current.inside && !disabled ? 1 + pressDepth * 0.15 : 1;
        // Note: press sets target directly from events; this only relaxes hover.
        if (pointerRef.current.inside && !reducedMotion) {
          hoverSpring.current.setTarget(1);
        } else {
          hoverSpring.current.setTarget(0);
        }
        void targetScale;

        if (pressMoving || hoverMoving) {
          shape.state = {
            ...shape.state,
            scale: pressSpring.current.value,
            offsetX: reducedMotion ? 0 : pointerRef.current.x * (interaction?.strength ?? 0.12) * hoverSpring.current.value,
            offsetY: reducedMotion ? 0 : pointerRef.current.y * (interaction?.strength ?? 0.12) * hoverSpring.current.value,
          };
          shape.dirty = true;
        }
      });
    }, [engine, ready, disabled, pressDepth, interaction?.strength, reducedMotion]);

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        const el = localRef.current;
        if (!el || disabled) return;
        const rect = el.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        pointerRef.current = { x: nx, y: ny, inside: true };
        onPointerNorm?.(nx, ny, true);
      },
      [disabled, onPointerNorm],
    );

    const handlePointerEnter = useCallback(() => {
      if (disabled) return;
      pointerRef.current.inside = true;
      hoverSpring.current.setTarget(1);
    }, [disabled]);

    const handlePointerLeave = useCallback(() => {
      pointerRef.current.inside = false;
      hoverSpring.current.setTarget(0);
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
      onPointerNorm?.(0, 0, false);
    }, [onPointerNorm]);

    const handlePointerDown = useCallback(() => {
      if (disabled || reducedMotion) return;
      pressSpring.current.setTarget(1 - pressDepth);
    }, [disabled, pressDepth, reducedMotion]);

    const handlePointerUp = useCallback(() => {
      pressSpring.current.setTarget(1);
    }, []);

    const Tag = as as React.ElementType;
    const fallback = !ready || !engine?.backend.gpu;

    const domStyle: CSSProperties = {
      position: 'relative',
      borderRadius: `${material.radius}px`,
      zIndex: 1,
      ...style,
    };

    return (
      <Tag
        ref={setRef}
        className={
          `liquid-ui-surface${fallback ? ` ${materialFallbackClasses(material)}` : ''}` +
          `${className ? ` ${className}` : ''}`
        }
        style={domStyle}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        data-liquid-observe=""
        {...(disabled ? { 'data-disabled': 'true' } : {})}
        {...dataAttrs}
      >
        {children}
      </Tag>
    );
  },
);
