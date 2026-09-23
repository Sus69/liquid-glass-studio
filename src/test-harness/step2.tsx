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

function Step2App() {
  const [backend, setBackend] = useState<'auto' | 'webgl' | 'webgpu'>('auto');

  const controls = useControls('Step 2: Merged vs Disjoint Shapes', {
    MetaballMerge: folder({
      mergeRate: { value: 0.0, min: 0.0, max: 0.4, step: 0.01 },
      separationDistance: { value: 160, min: 40, max: 400, step: 5 },
    }),
    ShapeDimensions: folder({
      shapeSize: { value: 180, min: 80, max: 300, step: 10 },
      radius: { value: 40, min: 0, max: 100, step: 1 },
      roundness: { value: 5, min: 1, max: 10, step: 0.5 },
    }),
    Optics: folder({
      thickness: { value: 50, min: 5, max: 100, step: 1 },
      refraction: { value: 1.5, min: 1.0, max: 3.0, step: 0.02 },
      dispersion: { value: 30, min: 0, max: 100, step: 1 },
    }),
    Backdrop: folder({
      pattern: {
        value: 'grid',
        options: ['grid', 'bars', 'photo'],
      },
    }),
  });

  const background: EngineBgType = useMemo(() => {
    switch (controls.pattern) {
      case 'bars':
        return { kind: 'image', url: bgBars };
      case 'photo':
        return { kind: 'image', url: bgTahoe };
      case 'grid':
      default:
        return { kind: 'image', url: bgGrid };
    }
  }, [controls.pattern]);

  const baseMaterial: LiquidMaterial = useMemo(
    () => ({
      thickness: controls.thickness,
      refraction: controls.refraction,
      refractionDistance: 14,
      dispersion: controls.dispersion,
      fresnel: 0.65,
      fresnelRange: 24,
      fresnelHardness: 0.2,
      glare: 0.75,
      glareRange: 26,
      glareHardness: 0.25,
      glareConvergence: 0.5,
      glareOppositeFactor: 0.3,
      glareAngle: 45,
      blur: 0,
      borderBlend: false,
      tint: { r: 255, g: 255, b: 255, a: 0.05 },
      shadow: 0.3,
      shadowExpand: 8,
      shadowOffset: { x: 0, y: 10 },
      merge: controls.mergeRate,
      radius: controls.radius,
      roundness: controls.roundness,
    }),
    [controls],
  );

  const materialA = useMemo(
    () => ({
      ...baseMaterial,
      tint: { r: 56, g: 189, b: 248, a: 0.12 }, // Cyan tint
    }),
    [baseMaterial],
  );

  const materialB = useMemo(
    () => ({
      ...baseMaterial,
      tint: { r: 244, g: 63, b: 94, a: 0.12 }, // Rose tint
    }),
    [baseMaterial],
  );

  return (
    <LiquidProvider
      backdropMode="textured"
      background={background}
      maxDpr={2}
      backend={backend}
      style={{ width: '100vw', height: '100vh', position: 'relative' }}
    >
      {/* Diagnostics Overlay */}
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
        <div style={{ fontWeight: 700, fontSize: 14, color: '#f43f5e', marginBottom: 8 }}>
          STEP 2: Merged vs Disjoint Shapes
        </div>
        <div style={{ marginBottom: 4 }}>
          Merge Rate: <strong>{controls.mergeRate === 0 ? '0 (DISJOINT / ISOLATED)' : controls.mergeRate}</strong>
        </div>
        <div style={{ marginBottom: 4 }}>
          Distance: <strong>{controls.separationDistance}px</strong>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
          <strong>Test Case 1 (merge = 0):</strong> As shapes approach, their distance fields must NOT warp each other. Straight overlap cut.<br />
          <strong>Test Case 2 (merge &gt; 0):</strong> As shapes approach, a smooth organic liquid bridge forms with continuous surface normals.
        </div>
      </div>

      {/* Shapes Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${controls.separationDistance - controls.shapeSize}px`,
        }}
      >
        <LiquidSurface
          glass={materialA}
          style={{
            width: controls.shapeSize,
            height: controls.shapeSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
            fontWeight: 700,
            fontSize: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          Shape A
        </LiquidSurface>

        <LiquidSurface
          glass={materialB}
          style={{
            width: controls.shapeSize,
            height: controls.shapeSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f43f5e',
            fontWeight: 700,
            fontSize: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          Shape B
        </LiquidSurface>
      </div>
    </LiquidProvider>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<Step2App />);
}
