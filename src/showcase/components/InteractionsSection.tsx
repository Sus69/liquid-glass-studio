import { useState } from 'react';
import {
  LiquidButton,
  LiquidCard,
  LiquidIconButton,
  LiquidPill,
  LiquidToggle,
  LiquidTooltip,
} from 'liquid-ui';
import { ShowcaseStage } from './ShowcaseStage';
import {
  IconSparkles,
  IconZap,
  IconSliders,
  IconCompass,
  IconRefresh,
} from './Icons';

export function InteractionsSection() {
  const [pointerCoord, setPointerCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [stiffness, setStiffness] = useState<number>(420);
  const [damping, setDamping] = useState<number>(24);
  const [magneticStrength, setMagneticStrength] = useState<number>(0.2);
  const [pressCount, setPressCount] = useState<number>(0);
  const [toggleVal, setToggleVal] = useState<boolean>(true);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setPointerCoord({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) });
  };

  const handlePointerLeave = () => {
    setPointerCoord({ x: 0, y: 0 });
  };

  const glareAngleDeg = Math.round((Math.atan2(pointerCoord.y, pointerCoord.x) * 180) / Math.PI);

  return (
    <section id="interactions" className="section-wrapper">
      <div className="section-header">
        <div className="micro-label">04 // PHYSICS &amp; MOTION</div>
        <h2 className="section-title">Interaction Laboratory</h2>
        <p className="section-description">
          The glass is alive. Motion is physically driven by second-order spring equations,
          pointer-following glare vectors, and real-time GPU SDF surface compression.
        </p>
      </div>

      <ShowcaseStage
        defaultBackdrop="tahoe-dark"
        defaultBackdropMode="textured"
        stageTag="PHYSICS BENCH"
        stageTitle="MOTION &amp; SPRING TELEMETRY"
        minHeight={620}
      >
        <div className="interaction-lab-grid">
          {/* Panel 1: Pointer Vector & Specular Glare Tracking */}
          <LiquidCard glass="frosted" radius={24} className="interaction-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconSparkles style={{ color: '#38bdf8', fontSize: 16 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  SPECULAR GLARE &amp; POINTER FIELD
                </span>
              </div>
              <LiquidPill statusColor="#38bdf8" glass="clear" style={{ fontSize: 10 }}>
                LCH Highlight Band
              </LiquidPill>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: 'var(--lq-text-muted)' }}>
              Move cursor over the coordinate pad below to observe real-time glare orientation and
              normal vector calculation.
            </p>

            {/* Interactive Coordinate Crosshair Pad */}
            <div
              className="pointer-vector-pad"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              <div
                className="vector-crosshair-h"
                style={{ top: `${((pointerCoord.y + 1) / 2) * 100}%` }}
              />
              <div
                className="vector-crosshair-v"
                style={{ left: `${((pointerCoord.x + 1) / 2) * 100}%` }}
              />
              <div
                className="vector-pointer-orb"
                style={{
                  left: `${((pointerCoord.x + 1) / 2) * 100}%`,
                  top: `${((pointerCoord.y + 1) / 2) * 100}%`,
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 10,
                  fontSize: 10,
                  fontFamily: 'var(--lq-font-mono)',
                  color: '#94a3b8',
                }}
              >
                TOUCH / POINTER GRID
              </span>
            </div>

            {/* Telemetry Readouts */}
            <div className="telemetry-row">
              <span style={{ color: '#64748b' }}>POINTER VECTOR:</span>
              <span style={{ color: '#38bdf8' }}>
                X: {pointerCoord.x >= 0 ? `+${pointerCoord.x.toFixed(2)}` : pointerCoord.x.toFixed(2)} &bull; Y:{' '}
                {pointerCoord.y >= 0 ? `+${pointerCoord.y.toFixed(2)}` : pointerCoord.y.toFixed(2)}
              </span>
            </div>

            <div className="telemetry-row">
              <span style={{ color: '#64748b' }}>SPECULAR GLARE ANGLE:</span>
              <span style={{ color: '#34d399' }}>{glareAngleDeg}&deg; (u_glareAngle)</span>
            </div>
          </LiquidCard>

          {/* Panel 2: Magnetic Hover & Displacement */}
          <LiquidCard glass="frosted" radius={24} className="interaction-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconZap style={{ color: '#f59e0b', fontSize: 16 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  MAGNETIC HOVER DISPLACEMENT
                </span>
              </div>
              <LiquidPill statusColor="#f59e0b" glass="clear" style={{ fontSize: 10 }}>
                Spring Euler
              </LiquidPill>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: 'var(--lq-text-muted)' }}>
              Interactive surfaces track cursor proximity and dynamically shift their SDF optical
              center with spring physics.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: '24px 0',
              }}
            >
              <LiquidButton
                variant="primary"
                size="lg"
                interaction={{ hover: true, press: true, strength: magneticStrength }}
              >
                Hover &amp; Press Me
              </LiquidButton>

              <LiquidTooltip content="Magnetic icon tile">
                <LiquidIconButton
                  aria-label="Compass"
                  glass="strong"
                  size={48}
                  interaction={{ hover: true, press: true, strength: magneticStrength * 1.5 }}
                >
                  <IconCompass style={{ fontSize: 22 }} />
                </LiquidIconButton>
              </LiquidTooltip>
            </div>

            {/* Slider to adjust strength */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'var(--lq-font-mono)', color: '#94a3b8' }}>
                MAGNETIC STRENGTH: {magneticStrength.toFixed(2)}
              </span>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={magneticStrength}
                onChange={(e) => setMagneticStrength(parseFloat(e.target.value))}
                style={{ width: 120 }}
              />
            </div>

            <div className="telemetry-row">
              <span style={{ color: '#64748b' }}>SPRING PARAMETERS:</span>
              <span style={{ color: '#38bdf8' }}>k: 260 N/m &bull; c: 22 Ns/m</span>
            </div>
          </LiquidCard>

          {/* Panel 3: SDF Press Compression */}
          <LiquidCard glass="frosted" radius={24} className="interaction-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconSliders style={{ color: '#a855f7', fontSize: 16 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  SDF PRESS COMPRESSION
                </span>
              </div>
              <LiquidPill statusColor="#a855f7" glass="clear" style={{ fontSize: 10 }}>
                0.08 Depth
              </LiquidPill>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: 'var(--lq-text-muted)' }}>
              Pressing a button deforms the actual GPU Signed Distance Field superellipse geometry,
              refracting light differently in real time.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '18px 0' }}>
              <LiquidButton
                variant="primary"
                size="lg"
                onClick={() => setPressCount((c) => c + 1)}
              >
                Press Compressions: {pressCount}
              </LiquidButton>
              <LiquidButton
                variant="ghost"
                size="sm"
                onClick={() => setPressCount(0)}
              >
                <IconRefresh style={{ fontSize: 14 }} />
              </LiquidButton>
            </div>

            <div className="telemetry-row">
              <span style={{ color: '#64748b' }}>PRESS DEPTH:</span>
              <span style={{ color: '#38bdf8' }}>0.08 (SDF compression factor)</span>
            </div>

            <div className="telemetry-row">
              <span style={{ color: '#64748b' }}>DEFORMATION ENGINE:</span>
              <span style={{ color: '#34d399' }}>ScalarSpring (stiffness: 420, damping: 24)</span>
            </div>
          </LiquidCard>

          {/* Panel 4: Toggle Spring Movement */}
          <LiquidCard glass="frosted" radius={24} className="interaction-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconSparkles style={{ color: '#34d399', fontSize: 16 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  SPRING SWITCH PHYSICS
                </span>
              </div>
              <LiquidPill statusColor={toggleVal ? '#34d399' : '#f59e0b'} glass="clear" style={{ fontSize: 10 }}>
                {toggleVal ? 'State: TRUE' : 'State: FALSE'}
              </LiquidPill>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: 'var(--lq-text-muted)' }}>
              The switch track renders optical liquid glass while the DOM thumb rides on spring
              physics with cubic-bezier easing.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '18px 0' }}>
              <LiquidToggle
                checked={toggleVal}
                onCheckedChange={setToggleVal}
                width={64}
                aria-label="Physics Demo Switch"
              />
              <LiquidPill statusColor={toggleVal ? '#34d399' : '#ff453a'} glass="soft">
                {toggleVal ? 'Hardware Link Active' : 'Offline'}
              </LiquidPill>
            </div>

            <div className="telemetry-row">
              <span style={{ color: '#64748b' }}>BEZIER CURVE:</span>
              <span style={{ color: '#38bdf8' }}>cubic-bezier(0.34, 1.56, 0.64, 1)</span>
            </div>

            <div className="telemetry-row">
              <span style={{ color: '#64748b' }}>ACCESSIBILITY:</span>
              <span style={{ color: '#34d399' }}>role=&quot;switch&quot;, aria-checked</span>
            </div>
          </LiquidCard>
        </div>
      </ShowcaseStage>
    </section>
  );
}
