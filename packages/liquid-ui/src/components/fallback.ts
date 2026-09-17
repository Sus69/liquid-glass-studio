import type { LiquidMaterial } from '../types';

/**
 * CSS fallback for environments without WebGL2/WebGPU: material → inline
 * backdrop-filter / box-shadow approximations. Functional, gracefully
 * degraded visuals — never the primary path.
 */
export function materialFallbackStyle(m: LiquidMaterial): React.CSSProperties {
  const alpha = m.tint.a;
  const dark = m.tint.r + m.tint.g + m.tint.b < 300;
  return {
    background: dark
      ? `rgba(${Math.round(m.tint.r)}, ${Math.round(m.tint.g)}, ${Math.round(m.tint.b)}, ${Math.min(alpha + 0.25, 0.85)})`
      : `rgba(255, 255, 255, ${Math.min(alpha + 0.12, 0.5)})`,
    backdropFilter: `blur(${Math.max(m.blur, 2)}px) saturate(1.4)`,
    WebkitBackdropFilter: `blur(${Math.max(m.blur, 2)}px) saturate(1.4)`,
    boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, ${(0.25 + m.fresnel * 0.3).toFixed(2)}), 0 8px 24px rgba(0, 0, 0, ${(m.shadow + 0.06).toFixed(2)})`,
    border: 'none',
  };
}

/** Class name hook for the stylesheet-based fallback (used alongside inline style). */
export function materialFallbackClasses(_m: LiquidMaterial): string {
  return 'liquid-ui-fallback';
}
