import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useControls, folder } from 'leva';
import {
  LiquidProvider,
  LiquidSurface,
  LiquidButton,
  LiquidCard,
  type EngineBgType,
} from 'liquid-ui';
import bgGrid from '../assets/bg-grid.png';
import bgBars from '../assets/bg-bars.png';
import bgTahoe from '../assets/bg-tahoe-light.webp';

function Step3App() {
  const [backend, setBackend] = useState<'auto' | 'webgl' | 'webgpu'>('auto');

  const controls = useControls('Step 3: Multi-Layer Pipeline', {
    LayerArchitecture: folder({
      mode: {
        value: 'multipass',
        options: ['multipass', 'flat-singlepass'],
        label: 'Pipeline Architecture',
      },
    }),
    CardLayer0: folder({
      cardTintR: { value: 140, min: 0, max: 255, step: 1 },
      cardTintG: { value: 60, min: 0, max: 255, step: 1 },
      cardTintB: { value: 240, min: 0, max: 255, step: 1 },
      cardTintA: { value: 0.25, min: 0, max: 1, step: 0.05 },
      cardRefraction: { value: 1.45, min: 1.0, max: 2.5, step: 0.05 },
      cardThickness: { value: 60, min: 10, max: 120, step: 5 },
    }),
    ButtonLayer1: folder({
      buttonRefraction: { value: 1.6, min: 1.0, max: 3.0, step: 0.05 },
      buttonDispersion: { value: 45, min: 0, max: 100, step: 5 },
      buttonThickness: { value: 35, min: 5, max: 80, step: 5 },
    }),
    Backdrop: folder({
      pattern: {
        value: 'photo',
        options: ['photo', 'grid', 'bars'],
      },
    }),
  });

  const background: EngineBgType = useMemo(() => {
    switch (controls.pattern) {
      case 'bars':
        return { kind: 'image', url: bgBars };
      case 'grid':
        return { kind: 'image', url: bgGrid };
      case 'photo':
      default:
        return { kind: 'image', url: bgTahoe };
    }
  }, [controls.pattern]);

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
          maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: '#a855f7', marginBottom: 8 }}>
          STEP 3: Multi-Layer Z-Index & Multi-Pass Composition
        </div>
        <div style={{ marginBottom: 4 }}>
          Current Mode: <strong style={{ color: controls.mode === 'multipass' ? '#38bdf8' : '#f59e0b' }}>
            {controls.mode === 'multipass' ? 'MULTI-PASS (Layer 1 refracts Layer 0)' : 'FLAT SINGLE-PASS (Current Engine)'}
          </strong>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
          {controls.mode === 'multipass' ? (
            <>
              <strong>Pipeline:</strong> Background → Layer 0 Glass (Card) → FBO Buffer → Layer 1 Glass (Buttons) → Screen.<br />
              The button refracts both the purple card's body/fresnel AND the background below it!
            </>
          ) : (
            <>
              <strong>Flat Single-Pass Defect:</strong> Upper button only samples the root background. It looks completely through the purple card, failing to refract the card's tinted glass.
            </>
          )}
        </div>
      </div>

      {/* Layer Composition Stage */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Layer 0: Background Card */}
        <LiquidCard
          layer={0}
          glass={{
            thickness: controls.cardThickness,
            refraction: controls.cardRefraction,
            tint: {
              r: controls.cardTintR,
              g: controls.cardTintG,
              b: controls.cardTintB,
              a: controls.cardTintA,
            },
            radius: 28,
            roundness: 5,
            fresnel: 0.6,
            glare: 0.7,
            blur: 0,
            merge: 0,
          }}
          style={{
            width: 520,
            padding: 36,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            position: 'relative',
          }}
        >
          <div style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
              Layer 0: Glass Card Container
            </h3>
            <p style={{ margin: '8px 0 0', opacity: 0.8, fontSize: 14 }}>
              Notice the tinted purple glass body. Below are Layer 1 components placed directly inside.
            </p>
          </div>

          {/* Layer 1: Floating Buttons inside Card */}
          <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
            <LiquidButton
              layer={1}
              variant="primary"
              glass={{
                thickness: controls.buttonThickness,
                refraction: controls.buttonRefraction,
                dispersion: controls.buttonDispersion,
                tint: { r: 255, g: 255, b: 255, a: 0.1 },
                radius: 14,
                roundness: 4,
                merge: 0,
              }}
            >
              Layer 1 Action
            </LiquidButton>

            <LiquidButton
              layer={1}
              variant="secondary"
              glass={{
                thickness: controls.buttonThickness,
                refraction: controls.buttonRefraction,
                dispersion: controls.buttonDispersion,
                tint: { r: 56, g: 189, b: 248, a: 0.2 },
                radius: 14,
                roundness: 4,
                merge: 0,
              }}
            >
              Cyan Glass Pill
            </LiquidButton>
          </div>
        </LiquidCard>
      </div>
    </LiquidProvider>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<Step3App />);
}
