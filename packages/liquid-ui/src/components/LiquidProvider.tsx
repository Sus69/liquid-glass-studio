import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LiquidEngine, type EngineBgType } from '../engine/LiquidEngine';
import { LiquidContext } from '../context';
import type { LiquidBackdropMode } from '../types';

export interface LiquidProviderProps {
  children: ReactNode;
  /** Backdrop mode: textured (full GPU fidelity) | dom (hybrid) | css. Default `dom`. */
  backdropMode?: LiquidBackdropMode;
  /** Backdrop source for textured mode. */
  background?: EngineBgType;
  /** devicePixelRatio cap (default 2). */
  maxDpr?: number;
  /** Force a GPU backend instead of auto-detection (dev/testing). */
  backend?: 'auto' | 'webgl' | 'webgpu';
  /** Keep the drawing buffer valid after compositing (debug/test readback). */
  debugPreserveDrawingBuffer?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Root container that owns the shared LiquidEngine: one GPU canvas for every
 * liquid component rendered beneath it. Place it once, near the app root.
 */
export function LiquidProvider({
  children,
  backdropMode = 'dom',
  background,
  maxDpr,
  backend,
  debugPreserveDrawingBuffer,
  className,
  style,
}: LiquidProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<LiquidEngine | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Create + attach per effect mount (StrictMode-safe): a fresh engine is
    // created for the second mount after the first is disposed.
    const e = new LiquidEngine({
      backdropMode,
      background,
      maxDpr,
      backend,
      debugPreserveDrawingBuffer,
    });
    setEngine(e);

    let cancelled = false;
    e.attach(el).then(() => {
      if (!cancelled) setReady(true);
    });

    // Debug handle (dev convenience, harmless in prod): window.__LIQUID_UI__.
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).__LIQUID_UI__ = {
        engine: e,
        registry: e.registry,
      };
    }

    return () => {
      cancelled = true;
      e.dispose();
      setEngine(null);
      setReady(false);
      if (typeof window !== 'undefined') {
        delete (window as unknown as Record<string, unknown>).__LIQUID_UI__;
      }
    };
    // Engine lifecycle runs once per mount; prop changes route via effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prop changes route into the live engine.
  useEffect(() => {
    if (engine) engine.setBackground(background);
  }, [engine, background]);

  return (
    <LiquidContext.Provider value={{ engine, ready }}>
      <div
        ref={containerRef}
        className={`liquid-ui-root${className ? ` ${className}` : ''}`}
        style={{ position: 'relative', ...style }}
      >
        {children}
      </div>
    </LiquidContext.Provider>
  );
}
