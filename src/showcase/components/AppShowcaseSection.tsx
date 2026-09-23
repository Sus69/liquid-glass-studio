import { useState } from 'react';
import {
  LiquidButton,
  LiquidCard,
  LiquidDiv,
  LiquidDock,
  LiquidDockItem,
  LiquidIconButton,
  LiquidInput,
  LiquidModal,
  LiquidPill,
  LiquidToggle,
  LiquidTooltip,
} from 'liquid-ui';
import { ShowcaseStage } from './ShowcaseStage';
import {
  IconSearch,
  IconSparkles,
  IconSliders,
  IconFolder,
  IconMusic,
  IconTerminal,
  IconSettings,
  IconPlay,
  IconPause,
  IconVolume,
  IconZap,
  IconCompass,
  IconAirplay,
  IconCheck,
} from './Icons';

export function AppShowcaseSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [activeProject, setActiveProject] = useState('project-1');
  const [eqMaster, setEqMaster] = useState(true);
  const [spatialBinaural, setSpatialBinaural] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const projects = [
    { id: 'project-1', name: 'Aura Studio Master', tracks: 16, duration: '4:18', status: 'Ready' },
    { id: 'project-2', name: 'Chronos Soundtrack', tracks: 32, duration: '12:40', status: 'Exported' },
    { id: 'project-3', name: 'VisionOS UI Sounds', tracks: 8, duration: '1:12', status: 'Editing' },
  ];

  return (
    <section id="app" className="section-wrapper">
      <div className="section-header">
        <div className="micro-label">08 // REAL APPLICATION EXPERIENCE</div>
        <h2 className="section-title">Chronos Spatial Workstation</h2>
        <p className="section-description">
          A production-grade desktop application interface demonstrating intentional material
          hierarchy, generous negative space, and strategic optical glass placement.
        </p>
      </div>

      <ShowcaseStage
        defaultBackdrop="tahoe-dark"
        defaultBackdropMode="textured"
        stageTag="APPLICATION WINDOW"
        stageTitle="CHRONOS SPATIAL PRO WORKSPACE"
        minHeight={680}
      >
        <div className="app-window-frame">
          {/* Window Title Bar */}
          <div className="app-titlebar">
            <div className="window-dots">
              <span className="window-dot dot-red" />
              <span className="window-dot dot-yellow" />
              <span className="window-dot dot-green" />
              <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 12, color: '#e2e8f0' }}>
                Chronos Studio Pro &mdash; Spatial Remaster v3.2
              </span>
            </div>

            {/* Top Search & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LiquidInput
                placeholder="Search tracks or presets…"
                glass="soft"
                padding="6px 12px"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                style={{ width: 220 }}
                leading={<IconSearch style={{ fontSize: 14, color: '#94a3b8' }} />}
              />
              <LiquidButton
                variant="primary"
                size="sm"
                onClick={() => setModalOpen(true)}
              >
                <span>Export Master</span>
              </LiquidButton>
            </div>
          </div>

          {/* Window Body: Sidebar + Main Canvas + Inspector */}
          <div className="app-workspace-body">
            {/* Left Sidebar */}
            <aside className="app-sidebar">
              <div style={{ fontSize: 11, fontFamily: 'var(--lq-font-mono)', color: '#64748b', fontWeight: 700 }}>
                WORKSPACES
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {projects.map((p) => {
                  const isActive = activeProject === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveProject(p.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#fff' : 'var(--lq-text-muted)' }}>
                          {p.name}
                        </span>
                        {isActive && <IconCheck style={{ color: '#38bdf8', fontSize: 12 }} />}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--lq-text-dim)' }}>
                        {p.tracks} tracks &bull; {p.duration}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 'auto' }}>
                <LiquidDiv glass="soft" radius={12} padding={12}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    Dolby Renderer
                  </div>
                  <LiquidPill statusColor="#34d399" glass="dark" style={{ fontSize: 10 }}>
                    120.0 FPS &bull; 0.35ms
                  </LiquidPill>
                </LiquidDiv>
              </div>
            </aside>

            {/* Main Center Canvas: Audio Waveform Tracks */}
            <main className="app-canvas-area">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>
                    Multi-Track Arrangement
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--lq-text-muted)' }}>
                    Binaural 3D Soundstage &bull; 96 kHz / 32-bit Float
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <LiquidPill statusColor="#38bdf8" glass="clear">
                    BPM 128
                  </LiquidPill>
                  <LiquidPill statusColor="#a855f7" glass="clear">
                    Key: A Minor
                  </LiquidPill>
                </div>
              </div>

              {/* Tracks Visualizer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Track 1 */}
                <div className="audio-timeline-track">
                  <span style={{ fontSize: 12, fontWeight: 700, width: 80, color: '#93c5fd' }}>
                    Synth Lead
                  </span>
                  <svg className="waveform-svg" viewBox="0 0 300 24" preserveAspectRatio="none">
                    <path
                      d="M0,12 Q15,2 30,12 T60,12 T90,3 T120,21 T150,12 T180,4 T210,20 T240,12 T270,6 T300,12"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                  </svg>
                  <LiquidPill statusColor="#34d399" glass="dark" style={{ fontSize: 10 }}>
                    Mute / Solo
                  </LiquidPill>
                </div>

                {/* Track 2 */}
                <div className="audio-timeline-track">
                  <span style={{ fontSize: 12, fontWeight: 700, width: 80, color: '#f472b6' }}>
                    Sub Bass
                  </span>
                  <svg className="waveform-svg" viewBox="0 0 300 24" preserveAspectRatio="none">
                    <path
                      d="M0,12 Q20,22 40,12 T80,12 T120,2 T160,22 T200,12 T240,2 T280,22 T300,12"
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="2.5"
                    />
                  </svg>
                  <LiquidPill statusColor="#34d399" glass="dark" style={{ fontSize: 10 }}>
                    Sidechain
                  </LiquidPill>
                </div>

                {/* Track 3 */}
                <div className="audio-timeline-track">
                  <span style={{ fontSize: 12, fontWeight: 700, width: 80, color: '#34d399' }}>
                    Holographic Pad
                  </span>
                  <svg className="waveform-svg" viewBox="0 0 300 24" preserveAspectRatio="none">
                    <path
                      d="M0,12 Q30,6 60,12 T120,12 T180,7 T240,17 T300,12"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.8"
                    />
                  </svg>
                  <LiquidPill statusColor="#38bdf8" glass="dark" style={{ fontSize: 10 }}>
                    AirPlay
                  </LiquidPill>
                </div>
              </div>

              {/* Floating Bottom Transport Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  marginTop: 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <LiquidIconButton
                    aria-label="Play/Pause"
                    glass="strong"
                    size={38}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <IconPause style={{ fontSize: 16 }} /> : <IconPlay style={{ fontSize: 16 }} />}
                  </LiquidIconButton>
                  <span style={{ fontSize: 12, fontFamily: 'var(--lq-font-mono)', color: '#fff' }}>
                    02:46:18 / 04:18:00
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <LiquidButton size="sm" variant="secondary">
                    Add Track
                  </LiquidButton>
                  <LiquidButton size="sm" variant="primary" onClick={() => setModalOpen(true)}>
                    Export
                  </LiquidButton>
                </div>
              </div>
            </main>

            {/* Right Inspector Panel */}
            <aside className="app-inspector">
              <div style={{ fontSize: 11, fontFamily: 'var(--lq-font-mono)', color: '#64748b', fontWeight: 700 }}>
                OPTICAL DSP MASTER
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#e2e8f0' }}>Binaural Spatial</span>
                  <LiquidToggle
                    checked={spatialBinaural}
                    onCheckedChange={setSpatialBinaural}
                    aria-label="Toggle Spatial Audio"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#e2e8f0' }}>Master EQ</span>
                  <LiquidToggle
                    checked={eqMaster}
                    onCheckedChange={setEqMaster}
                    aria-label="Toggle Master EQ"
                  />
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <LiquidCard glass="clear" style={{ padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Master Limiter</div>
                  <div style={{ fontSize: 10, color: 'var(--lq-text-muted)', marginTop: 2 }}>
                    True Peak -0.1 dBFS
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <LiquidButton size="sm" variant="ghost" style={{ width: '100%', fontSize: 11 }}>
                      Configure DSP
                    </LiquidButton>
                  </div>
                </LiquidCard>
              </div>
            </aside>
          </div>
        </div>

        {/* Real Accessible LiquidModal */}
        <LiquidModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          ariaLabel="Export Master Audio"
          glass="frosted"
          radius={26}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconSparkles style={{ color: '#38bdf8', fontSize: 20 }} />
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>
                Export Spatial Master
              </h3>
            </div>

            <p style={{ margin: 0, fontSize: 14, color: 'var(--lq-text-muted)', lineHeight: 1.6 }}>
              The rendered audio file will be encoded with high-precision 32-bit floating point
              binaural impulse responses and embedded metadata.
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: 14,
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontFamily: 'var(--lq-font-mono)',
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Format:</span>
                <span style={{ color: '#38bdf8' }}>Apple Lossless (ALAC)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Resolution:</span>
                <span style={{ color: '#34d399' }}>96.0 kHz / 24-bit</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Spatial Engine:</span>
                <span style={{ color: '#a855f7' }}>Liquid DSP v2.4</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <LiquidButton variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </LiquidButton>
              <LiquidButton variant="primary" onClick={() => setModalOpen(false)}>
                Confirm &amp; Export
              </LiquidButton>
            </div>
          </div>
        </LiquidModal>
      </ShowcaseStage>
    </section>
  );
}
