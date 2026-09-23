import { useState } from 'react';
import {
  LiquidButton,
  LiquidCard,
  LiquidDock,
  LiquidDockItem,
  LiquidIconButton,
  LiquidPill,
  LiquidToggle,
  LiquidTooltip,
} from 'liquid-ui';
import { ShowcaseStage } from './ShowcaseStage';
import {
  IconChevronDown,
  IconGitHub,
  IconSparkles,
  IconPlay,
  IconPause,
  IconVolume,
  IconSliders,
  IconCompass,
  IconMail,
  IconMusic,
  IconTerminal,
  IconSettings,
} from './Icons';

export function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [spatialAudio, setSpatialAudio] = useState(true);
  const [activeTab, setActiveTab] = useState<'refraction' | 'dispersion' | 'glare'>('refraction');

  const scrollToExplore = () => {
    const el = document.getElementById('materials');
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="hero-section">
      <div className="hero-header-badge">
        <LiquidPill statusColor="#34d399" glass="soft">
          LIQUID UI // OPTICAL INTERFACE ENGINE
        </LiquidPill>
      </div>

      <h1 className="hero-main-title">Liquid UI</h1>
      <h2 className="hero-tagline">Physical glass for the web.</h2>
      <p className="hero-subtitle">
        A GPU-powered React component system for interfaces that bend, refract, and respond like
        real material.
      </p>

      <div className="hero-ctas">
        <LiquidButton variant="primary" size="lg" onClick={scrollToExplore}>
          <span>Explore components</span>
          <IconChevronDown style={{ fontSize: 16 }} />
        </LiquidButton>

        <a
          href="https://github.com/Sus69/liquid-glass-studio"
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <LiquidButton variant="secondary" size="lg">
            <IconGitHub style={{ fontSize: 18 }} />
            <span>View on GitHub</span>
          </LiquidButton>
        </a>
      </div>

      {/* Atmospheric Interactive Hero Stage */}
      <ShowcaseStage
        defaultBackdrop="tahoe-light"
        defaultBackdropMode="textured"
        stageTag="CHAPTER 01"
        stageTitle="HERO ENVIRONMENT"
        minHeight={620}
      >
        <div className="hero-stage-composition">
          {/* Top Telemetry Strip */}
          <div className="hero-telemetry-strip" style={{ width: '100%', maxWidth: 840 }}>
            <LiquidPill statusColor="#60a5fa" glass="frosted">
              WebGL2 / WebGPU Multi-Pass FBO
            </LiquidPill>
            <LiquidPill statusColor="#34d399" glass="clear">
              Snell&apos;s Law Refraction &bull; &eta; = 1.45
            </LiquidPill>
            <LiquidPill statusColor="#a855f7" glass="soft">
              Cauchy Dispersion &bull; Abbe 10.0
            </LiquidPill>
          </div>

          {/* Central Interactive Floating Elements */}
          <div className="hero-floating-grid">
            {/* Left Fragment */}
            <LiquidCard glass="soft" interactive className="hero-fragment-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--lq-font-mono)', color: '#94a3b8' }}>
                  PHYSICS / SPRING
                </span>
                <LiquidPill statusColor="#34d399" glass="clear" style={{ fontSize: 10 }}>
                  Active
                </LiquidPill>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
                Dynamic Optics
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--lq-text-muted)', lineHeight: 1.5 }}>
                Glass compressed via second-order Euler springs on press.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 12, color: '#cbd5e1' }}>Spatial Field</span>
                <LiquidToggle
                  checked={spatialAudio}
                  onCheckedChange={setSpatialAudio}
                  aria-label="Toggle Spatial Audio"
                />
              </div>
            </LiquidCard>

            {/* Center Main Stage Card */}
            <LiquidCard glass="frosted" interactive className="hero-center-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconSparkles style={{ color: '#38bdf8', fontSize: 18 }} />
                  <span style={{ fontSize: 12, fontFamily: 'var(--lq-font-mono)', fontWeight: 700, color: '#fff' }}>
                    AURA MEDIA // 01
                  </span>
                </div>
                <LiquidPill statusColor={isPlaying ? '#34d399' : '#f59e0b'} glass="dark">
                  {isPlaying ? 'Playing' : 'Paused'}
                </LiquidPill>
              </div>

              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#fff' }}>
                  Physical Interface Canvas
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.5 }}>
                  Move your pointer over this glass surface to observe real-time chromatic ray
                  bending, Fresnel edge highlights, and specular glare tracking.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <LiquidButton
                  variant={activeTab === 'refraction' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('refraction')}
                >
                  Refraction
                </LiquidButton>
                <LiquidButton
                  variant={activeTab === 'dispersion' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('dispersion')}
                >
                  Dispersion
                </LiquidButton>
                <LiquidButton
                  variant={activeTab === 'glare' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('glare')}
                >
                  Specular Glare
                </LiquidButton>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LiquidTooltip content={isPlaying ? 'Pause playback' : 'Start playback'}>
                    <LiquidIconButton
                      aria-label="Play/Pause"
                      glass="strong"
                      size={42}
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <IconPause style={{ fontSize: 18 }} /> : <IconPlay style={{ fontSize: 18 }} />}
                    </LiquidIconButton>
                  </LiquidTooltip>

                  <LiquidTooltip content="Volume settings">
                    <LiquidIconButton aria-label="Volume" glass="soft" size={42}>
                      <IconVolume style={{ fontSize: 18 }} />
                    </LiquidIconButton>
                  </LiquidTooltip>

                  <LiquidTooltip content="Audio effects">
                    <LiquidIconButton aria-label="Equalizer" glass="soft" size={42}>
                      <IconSliders style={{ fontSize: 18 }} />
                    </LiquidIconButton>
                  </LiquidTooltip>
                </div>

                <LiquidButton variant="primary" size="sm" onClick={scrollToExplore}>
                  Live Playground
                </LiquidButton>
              </div>
            </LiquidCard>

            {/* Right Fragment */}
            <LiquidCard glass="dark" interactive className="hero-fragment-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--lq-font-mono)', color: '#94a3b8' }}>
                  MATERIAL / DARK
                </span>
                <LiquidPill statusColor="#a855f7" glass="clear" style={{ fontSize: 10 }}>
                  Smoked
                </LiquidPill>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
                Smoked Obsidian
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--lq-text-muted)', lineHeight: 1.5 }}>
                Subtle dark tint over high-index GPU refraction.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <LiquidButton size="sm" variant="secondary" style={{ flex: 1 }}>
                  Inspect
                </LiquidButton>
                <LiquidButton size="sm" variant="ghost">
                  Share
                </LiquidButton>
              </div>
            </LiquidCard>
          </div>

          {/* Bottom Floating Navigation Dock */}
          <LiquidDock glass="clear" magnification={1.45} proximity={120}>
            <LiquidTooltip content="Home">
              <LiquidDockItem aria-label="Home">
                <IconCompass style={{ fontSize: 22 }} />
              </LiquidDockItem>
            </LiquidTooltip>
            <LiquidTooltip content="Messages">
              <LiquidDockItem aria-label="Messages">
                <IconMail style={{ fontSize: 22 }} />
              </LiquidDockItem>
            </LiquidTooltip>
            <LiquidTooltip content="Spatial Audio">
              <LiquidDockItem aria-label="Music">
                <IconMusic style={{ fontSize: 22 }} />
              </LiquidDockItem>
            </LiquidTooltip>
            <LiquidTooltip content="Console">
              <LiquidDockItem aria-label="Terminal">
                <IconTerminal style={{ fontSize: 22 }} />
              </LiquidDockItem>
            </LiquidTooltip>
            <LiquidTooltip content="System Preferences">
              <LiquidDockItem aria-label="Settings">
                <IconSettings style={{ fontSize: 22 }} />
              </LiquidDockItem>
            </LiquidTooltip>
          </LiquidDock>
        </div>
      </ShowcaseStage>
    </section>
  );
}
