import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useControls, folder } from 'leva';
import {
  LiquidProvider,
  LiquidSurface,
  type LiquidMaterial,
  type EngineBgType,
} from 'liquid-ui';
import bgGrid from '../assets/bg-grid.png';
import bgBars from '../assets/bg-bars.png';
import bgTahoe from '../assets/bg-tahoe-light.webp';

function Step1App() {
  const [backend, setBackend] = useState<'auto' | 'webgl' | 'webgpu'>('auto');

  const controls = useControls('Step 1: Ground-Truth Single SDF Shape', {
    Geometry: folder({
      width: { value: 340, min: 100, max: 600, step: 10 },
      height: { value: 220, min: 100, max: 600, step: 10 },
      radius: { value: 36, min: 0, max: 100, step: 1 },
      roundness: { value: 5, min: 1, max: 10, step: 0.5 },
    }),
    Optics: folder({
      thickness: { value: 60, min: 5, max: 150, step: 1 },
      refraction: { value: 1.52, min: 1.0, max: 3.0, step: 0.01 },
      refractionDistance: { value: 16, min: 0, max: 50, step: 1 },
      dispersion: { value: 35, min: 0, max: 100, step: 1 },
    }),
    Lighting: folder({
      fresnel: { value: 0.7, min: 0, max: 1, step: 0.05 },
      fresnelRange: { value: 25, min: 5, max: 100, step: 1 },
      glare: { value: 0.8, min: 0, max: 1, step: 0.05 },
      glareAngle: { value: 45, min: 0, max: 360, step: 5 },
    }),
    Backdrop: folder({
      backgroundPattern: {
        value: 'grid',
        options: ['grid', 'bars', 'photo'],
      },
    }),
  });

  const background: EngineBgType = useMemo(() => {
    switch (controls.backgroundPattern) {
      case 'bars':
        return { kind: 'image', url: bgBars };
      case 'photo':
        return { kind: 'image', url: bgTahoe };
      case 'grid':
      default:
        return { kind: 'image', url: bgGrid };
    }
  }, [controls.backgroundPattern]);

  const material: LiquidMaterial = useMemo(
    () => ({
      thickness: controls.thickness,
      refraction: controls.refraction,
      refractionDistance: controls.refractionDistance,
      dispersion: controls.dispersion,
      fresnel: controls.fresnel,
      fresnelRange: controls.fresnelRange,
      fresnelHardness: 0.2,
      glare: controls.glare,
      glareRange: 28,
      glareHardness: 0.25,
      glareConvergence: 0.5,
      glareOppositeFactor: 0.3,
      glareAngle: controls.glareAngle,
      blur: 0,
      borderBlend: false,
      tint: { r: 255, g: 255, b: 255, a: 0.05 },
      shadow: 0.35,
      shadowExpand: 10,
      shadowOffset: { x: 0, y: 12 },
      merge: 0,
      radius: controls.radius,
      roundness: controls.roundness,
    }),
    [controls],
  );

  // Snell's Law calculations at critical points
  const criticalAngleDeg = useMemo(() => {
    const n = Math.max(controls.refraction, 1.0001);
    return ((Math.asin(1 / n) * 180) / Math.PI).toFixed(1);
  }, [controls.refraction]);

  return (
    <LiquidProvider
      backdropMode="textured"
      background={background}
      maxDpr={2}
      backend={backend}
      style={{ width: '100vw', height: '100vh', position: 'relative' }}
    >
      {/* Optics & Physics Diagnostics Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 100,
          background: 'rgba(11, 15, 23, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 12,
          padding: '16px 20px',
          color: '#e2e8f0',
          fontSize: 13,
          fontFamily: 'monospace',
          maxWidth: 380,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: '#38bdf8', marginBottom: 8 }}>
          STEP 1: Single SDF Ground-Truth Refraction
        </div>
        <div style={{ marginBottom: 4 }}>
          Index of Refraction ($n$): <strong>{controls.refraction}</strong>
        </div>
        <div style={{ marginBottom: 4 }}>
          Critical Angle ($\theta_c$): <strong>{criticalAngleDeg}°</strong>
        </div>
        <div style={{ marginBottom: 4 }}>
          Edge Thickness: <strong>{controls.thickness}px</strong>
        </div>
        <div style={{ marginBottom: 4 }}>
          Dispersion $\Delta\lambda$: <strong>{controls.dispersion}%</strong>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
          Snell's Law: $n_1 \sin\theta_i = n_2 \sin\theta_t$<br />
          Verify straight grid lines bend continuously without ray inversion or clipping.
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          {(['auto', 'webgl', 'webgpu'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBackend(b)}
              style={{
                background: backend === b ? '#38bdf8' : 'rgba(255,255,255,0.08)',
                color: backend === b ? '#0b0f17' : '#e2e8f0',
                border: 'none',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {b.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Centered Isolated Liquid Glass Shape */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <LiquidSurface
          glass={material}
          style={{
            width: controls.width,
            height: controls.height,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0,0,0,0.6)',
            pointerEvents: 'auto',
            cursor: 'grab',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
            Single SDF Lens
          </div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
            {controls.width} × {controls.height} px
          </div>
        </LiquidSurface>
      </div>
    </LiquidProvider>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<Step1App />);
}
