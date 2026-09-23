import { useState, useEffect, useRef } from 'react';
import {
  LiquidBlob,
  LiquidBlobShape,
  LiquidPill,
  LiquidButton,
  type LiquidPresetName,
} from 'liquid-ui';
import { ShowcaseStage } from './ShowcaseStage';
import { IconSparkles, IconRefresh, IconZap, IconCode } from './Icons';

interface BlobNode {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  speedX: number;
  speedY: number;
  phase: number;
}

export function BlobsSection() {
  const [mergeFactor, setMergeFactor] = useState<number>(0.12);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [blobGlass, setBlobGlass] = useState<LiquidPresetName>('clear');

  const [blobs, setBlobs] = useState<BlobNode[]>([
    { id: 1, x: 60, y: 70, width: 140, height: 140, radius: 70, speedX: 0.8, speedY: 0.6, phase: 0 },
    { id: 2, x: 220, y: 110, width: 110, height: 110, radius: 55, speedX: -0.6, speedY: 0.9, phase: 2 },
    { id: 3, x: 380, y: 60, width: 150, height: 150, radius: 75, speedX: 0.7, speedY: -0.8, phase: 4 },
    { id: 4, x: 280, y: 160, width: 90, height: 90, radius: 45, speedX: -0.9, speedY: -0.5, phase: 1 },
  ]);

  const draggingId = useRef<number | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animation Loop (Harmonic Orbital Movement)
  useEffect(() => {
    if (!isAnimating) return;
    let raf = 0;
    let t = 0;

    const tick = () => {
      t += 0.015;
      setBlobs((prev) =>
        prev.map((b) => {
          if (draggingId.current === b.id) return b;
          // Organic Lissajous parametric drift
          const cx = 220 + Math.sin(t * b.speedX + b.phase) * 120 + Math.cos(t * 0.4 + b.id) * 30;
          const cy = 80 + Math.cos(t * b.speedY + b.phase) * 60 + Math.sin(t * 0.5 + b.id) * 20;
          return { ...b, x: Math.max(10, Math.min(480, cx)), y: Math.max(10, Math.min(180, cy)) };
        }),
      );
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isAnimating]);

  const handlePointerDown = (id: number, e: React.PointerEvent) => {
    draggingId.current = id;
    const blob = blobs.find((b) => b.id === id);
    if (blob) {
      dragOffset.current = { x: e.clientX - blob.x, y: e.clientY - blob.y };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingId.current == null) return;
    const id = draggingId.current;
    const nx = Math.max(10, Math.min(500, e.clientX - dragOffset.current.x));
    const ny = Math.max(10, Math.min(200, e.clientY - dragOffset.current.y));
    setBlobs((prev) => prev.map((b) => (b.id === id ? { ...b, x: nx, y: ny } : b)));
  };

  const handlePointerUp = () => {
    draggingId.current = null;
  };

  return (
    <section id="blobs" className="section-wrapper">
      <div className="section-header">
        <div className="micro-label">06 // ORGANIC GPU METABALLS</div>
        <h2 className="section-title">Organic Liquid &amp; Metaballs</h2>
        <p className="section-description">
          GPU Signed Distance Fields with smooth-minimum polynomial merging. Geometries fuse and
          separate dynamically like fluid mercury, calculated per-pixel in WebGL2/WebGPU fragment
          shaders.
        </p>
      </div>

      <ShowcaseStage
        defaultBackdrop="tahoe-dark"
        defaultBackdropMode="textured"
        stageTag="GPU SDF FLUID"
        stageTitle="SMOOTH-MINIMUM RAYMARCHER"
        minHeight={580}
      >
        <div className="blobs-stage-viewport">
          {/* Top Status Header */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <LiquidPill statusColor="#38bdf8" glass="dark">
              SDF LIQUID // SMOOTH-MINIMUM MERGING
            </LiquidPill>
            <LiquidPill statusColor="#34d399" glass="dark">
              u_mergeRate: {mergeFactor.toFixed(2)}
            </LiquidPill>
            <LiquidPill statusColor="#a855f7" glass="dark">
              RAYMARCHED IMPLICIT SURFACES
            </LiquidPill>
          </div>

          {/* Metaball Interactive Stage */}
          <div
            className="blobs-canvas-area"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <LiquidBlob
              glass={blobGlass}
              merge={mergeFactor}
              style={{ position: 'relative', width: '100%', height: '100%' }}
            >
              {blobs.map((b) => (
                <LiquidBlobShape
                  key={b.id}
                  x={b.x}
                  y={b.y}
                  width={b.width}
                  height={b.height}
                  radius={b.radius}
                >
                  <div
                    onPointerDown={(e) => handlePointerDown(b.id, e)}
                    style={{
                      width: '100%',
                      height: '100%',
                      cursor: 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'var(--lq-font-mono)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 700,
                      }}
                    >
                      NODE 0{b.id}
                    </span>
                  </div>
                </LiquidBlobShape>
              ))}
            </LiquidBlob>
          </div>

          {/* Controls Bar */}
          <div className="blobs-controls-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconSparkles style={{ color: '#38bdf8', fontSize: 14 }} />
              <span style={{ fontSize: 12, fontFamily: 'var(--lq-font-mono)', fontWeight: 700, color: '#fff' }}>
                MERGE RATE (k): {mergeFactor.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min="0.02"
              max="0.25"
              step="0.01"
              value={mergeFactor}
              onChange={(e) => setMergeFactor(parseFloat(e.target.value))}
              style={{ width: 120 }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 10 }}>
              <LiquidButton
                variant={isAnimating ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setIsAnimating(!isAnimating)}
              >
                {isAnimating ? 'Pause Orbit' : 'Harmonic Orbit'}
              </LiquidButton>
            </div>

            {/* Material selector */}
            <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
              {(['clear', 'soft', 'strong', 'dark', 'frosted'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBlobGlass(preset)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 999,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: blobGlass === preset ? 'rgba(56, 189, 248, 0.35)' : 'transparent',
                    color: blobGlass === preset ? '#fff' : 'var(--lq-text-muted)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Math Note */}
          <div
            style={{
              marginTop: 18,
              fontSize: 11,
              fontFamily: 'var(--lq-font-mono)',
              color: '#64748b',
              textAlign: 'center',
            }}
          >
            smin(d1, d2, k) = min(d1, d2) - max(k - |d1 - d2|, 0.0)&sup2; / (4.0 &times; k)
          </div>
        </div>
      </ShowcaseStage>
    </section>
  );
}
