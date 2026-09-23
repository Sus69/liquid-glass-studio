import { useState } from 'react';
import {
  LiquidButton,
  LiquidCard,
  LiquidDiv,
  LiquidIconButton,
  LiquidPill,
  LiquidToggle,
} from 'liquid-ui';
import { ShowcaseStage } from './ShowcaseStage';
import { IconLayers, Icon3D, IconSettings, IconZap } from './Icons';

export function NestedGlassSection() {
  const [isIsometric, setIsIsometric] = useState(false);
  const [toggleState, setToggleState] = useState(true);

  return (
    <section id="depth" className="section-wrapper">
      <div className="section-header">
        <div className="micro-label">07 // DEPTH &amp; COMPOSITION</div>
        <h2 className="section-title">Nested Glass &amp; Optical Strata</h2>
        <p className="section-description">
          Glass refracting glass. The engine supports multi-pass FBO pipeline compositing where
          each depth layer renders to an intermediate texture, becoming the refractive background
          for subsequent layers.
        </p>
      </div>

      <ShowcaseStage
        defaultBackdrop="tahoe-light"
        defaultBackdropMode="textured"
        stageTag="DEPTH / 04"
        stageTitle="SURFACE COMPOSITION MODEL"
        minHeight={640}
        extraToolbar={
          <button
            type="button"
            onClick={() => setIsIsometric(!isIsometric)}
            className={`mode-btn ${isIsometric ? 'active' : ''}`}
            title="Toggle 3D Exploded Depth View"
          >
            <Icon3D style={{ fontSize: 14 }} />
            <span>{isIsometric ? 'Flatten View' : '3D Explode'}</span>
          </button>
        }
      >
        <div className="nested-depth-stage">
          <div className={`isometric-container ${isIsometric ? 'is-isometric' : ''}`}>
            {/* Level 0: Large LiquidDiv Container (layer 0 via zIndex) */}
            <LiquidDiv
              glass="soft"
              radius={32}
              padding={32}
              className="depth-stack-base"
              style={{
                zIndex: 0,
                transform: isIsometric ? 'translateZ(0px)' : 'none',
                transition: 'transform 500ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IconLayers style={{ color: '#38bdf8', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                      Primary Container &bull; Layer 0
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--lq-text-muted)' }}>
                      LiquidDiv Root Surface (2-pass Gaussian blur)
                    </div>
                  </div>
                </div>
                <LiquidPill statusColor="#38bdf8" glass="clear" style={{ zIndex: 0 }}>
                  DEPTH 00
                </LiquidPill>
              </div>

              {/* Level 1: Nested LiquidCard (layer 1) */}
              <LiquidCard
                glass="frosted"
                interactive
                radius={24}
                layer={1}
                style={{
                  zIndex: 1,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transform: isIsometric ? 'translateZ(40px)' : 'none',
                  transition: 'transform 500ms ease',
                  boxShadow: isIsometric ? '0 20px 40px rgba(0,0,0,0.4)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--lq-font-mono)', fontWeight: 700, color: '#e2e8f0' }}>
                    NESTED WORKSPACE &bull; Layer 1
                  </span>
                  <LiquidPill statusColor="#34d399" glass="dark" style={{ zIndex: 1 }}>
                    DEPTH 01
                  </LiquidPill>
                </div>

                <p style={{ margin: 0, fontSize: 13, color: 'var(--lq-text-muted)', lineHeight: 1.5 }}>
                  This card sits optically above the container. The GPU shader samples the
                  underlying glass texture, applying secondary refraction and Fresnel highlights.
                </p>

                {/* Level 2: Nested Controls Bar (layer 2) */}
                <LiquidDiv
                  glass="clear"
                  radius={16}
                  padding={14}
                  style={{
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transform: isIsometric ? 'translateZ(80px)' : 'none',
                    transition: 'transform 500ms ease',
                    boxShadow: isIsometric ? '0 20px 50px rgba(0,0,0,0.5)' : undefined,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Level 3: IconButtons and Pills (layer 3) */}
                    <LiquidIconButton aria-label="Settings" glass="strong" size={38} style={{ zIndex: 3 }}>
                      <IconSettings style={{ fontSize: 16 }} />
                    </LiquidIconButton>

                    <LiquidIconButton aria-label="Action" glass="soft" size={38} style={{ zIndex: 3 }}>
                      <IconZap style={{ fontSize: 16 }} />
                    </LiquidIconButton>

                    <LiquidPill statusColor="#a855f7" glass="dark" style={{ zIndex: 3 }}>
                      DEPTH 03 // PILL
                    </LiquidPill>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <LiquidToggle
                      checked={toggleState}
                      onCheckedChange={setToggleState}
                      glass="soft"
                      style={{ zIndex: 3 }}
                      aria-label="Layer Switch"
                    />
                    <LiquidButton variant="primary" size="sm" layer={3} style={{ zIndex: 3 }}>
                      Layer 3 Trigger
                    </LiquidButton>
                  </div>
                </LiquidDiv>
              </LiquidCard>
            </LiquidDiv>
          </div>

          {/* Technical Pipeline Note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 12,
              fontFamily: 'var(--lq-font-mono)',
              color: '#94a3b8',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span>Backdrop Texture</span>
            <span>&rarr;</span>
            <span style={{ color: '#38bdf8' }}>FBO Layer 0 (LiquidDiv)</span>
            <span>&rarr;</span>
            <span style={{ color: '#34d399' }}>FBO Layer 1 (LiquidCard)</span>
            <span>&rarr;</span>
            <span style={{ color: '#a855f7' }}>FBO Layer 2 (LiquidControls)</span>
            <span>&rarr;</span>
            <span style={{ color: '#f59e0b' }}>Screen Pass</span>
          </div>
        </div>
      </ShowcaseStage>
    </section>
  );
}
