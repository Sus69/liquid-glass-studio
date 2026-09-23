import { useState } from 'react';
import {
  LiquidButton,
  LiquidCard,
  LiquidDiv,
  LiquidIconButton,
  LiquidInput,
  LiquidPill,
  LiquidToggle,
  LiquidTooltip,
} from 'liquid-ui';
import { ShowcaseStage } from './ShowcaseStage';
import {
  IconPlay,
  IconPause,
  IconSkipBack,
  IconSkipForward,
  IconShuffle,
  IconRepeat,
  IconVolume,
  IconAirplay,
  IconSearch,
  IconCommand,
  IconSliders,
  IconCpu,
  IconZap,
  IconShield,
  IconWifi,
  IconBluetooth,
  IconSun,
  IconMoon,
  IconCode,
  IconCopy,
  IconCheck,
  IconSparkles,
  IconTerminal,
} from './Icons';

type SceneKey = 'music' | 'command' | 'settings' | 'dashboard';

export function ScenesSection() {
  const [activeScene, setActiveScene] = useState<SceneKey>('music');

  // Music Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isShuffle, setIsShuffle] = useState(true);
  const [isRepeat, setIsRepeat] = useState(false);
  const [progress, setProgress] = useState(64);

  // Command Palette State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'commands' | 'files' | 'settings'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Settings State
  const [neuralEngine, setNeuralEngine] = useState(true);
  const [spatialAudio, setSpatialAudio] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [darkVeil, setDarkVeil] = useState(true);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const commandItems = [
    { id: '1', title: 'Open Optical Shader Studio', cat: 'commands', shortcut: '⌘⇧S', icon: <IconSparkles /> },
    { id: '2', title: 'Toggle WebGPU / WebGL2 Backend', cat: 'settings', shortcut: '⌘B', icon: <IconCpu /> },
    { id: '3', title: 'Inspect Shape Registry Uniforms', cat: 'commands', shortcut: '⌥U', icon: <IconCode /> },
    { id: '4', title: 'Export Glass Material Preset as JSON', cat: 'files', shortcut: '⌘E', icon: <IconTerminal /> },
  ].filter((item) => {
    if (selectedCategory !== 'all' && item.cat !== selectedCategory) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <section id="scenes" className="section-wrapper">
      <div className="section-header">
        <div className="micro-label">03 // REALISTIC COMPOSITION</div>
        <h2 className="section-title">Components in Context</h2>
        <p className="section-description">
          Liquid UI primitives are not isolated cards in a grid. They are designed to nest, layer,
          and compose into tactile, shipping-grade product experiences.
        </p>
      </div>

      {/* Scene Switcher Bar */}
      <div className="scenes-switcher-bar">
        <button
          type="button"
          onClick={() => setActiveScene('music')}
          className={`scene-tab-btn ${activeScene === 'music' ? 'is-active' : ''}`}
        >
          <span>01 / Spatial Music Player</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveScene('command')}
          className={`scene-tab-btn ${activeScene === 'command' ? 'is-active' : ''}`}
        >
          <span>02 / Command Palette</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveScene('settings')}
          className={`scene-tab-btn ${activeScene === 'settings' ? 'is-active' : ''}`}
        >
          <span>03 / System Control Center</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveScene('dashboard')}
          className={`scene-tab-btn ${activeScene === 'dashboard' ? 'is-active' : ''}`}
        >
          <span>04 / Telemetry Dashboard</span>
        </button>
      </div>

      {/* Scene Stage Container */}
      <ShowcaseStage
        defaultBackdrop={activeScene === 'music' ? 'video-fish' : activeScene === 'command' ? 'tahoe-dark' : 'tahoe-light'}
        defaultBackdropMode="textured"
        stageTag="SCENE IN CONTEXT"
        stageTitle={
          activeScene === 'music'
            ? 'AURA // NOW PLAYING'
            : activeScene === 'command'
              ? 'SPOTLIGHT // COMMAND'
              : activeScene === 'settings'
                ? 'SYSTEM // CONTROL'
                : 'METRICS // DASHBOARD'
        }
        minHeight={600}
      >
        {/* ========================================================
            Scene A: Spatial Music Player
           ======================================================== */}
        {activeScene === 'music' && (
          <LiquidCard
            glass="frosted"
            interactive
            radius={28}
            className="scene-music-card"
          >
            {/* Album Artwork with Fluid Gradient & Optical Glass Refraction */}
            <div className="music-album-art">
              <span className="album-vinyl-icon">♪</span>
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  display: 'flex',
                  gap: 6,
                }}
              >
                <LiquidPill statusColor="#34d399" glass="dark">
                  Hi-Res Lossless
                </LiquidPill>
                <LiquidPill glass="dark">24-bit / 96 kHz</LiquidPill>
              </div>
              <div style={{ position: 'absolute', bottom: 14, right: 14 }}>
                <LiquidPill statusColor="#38bdf8" glass="dark">
                  Dolby Atmos
                </LiquidPill>
              </div>
            </div>

            {/* Track Info */}
            <div className="music-track-meta">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="music-track-title">Resonance (Spatial Remaster)</h3>
                <LiquidTooltip content="AirPlay Output: Living Room">
                  <LiquidIconButton aria-label="AirPlay" glass="soft" size={36}>
                    <IconAirplay style={{ fontSize: 16 }} />
                  </LiquidIconButton>
                </LiquidTooltip>
              </div>
              <p className="music-track-artist">HOME &bull; Odyssey Spatial Studio Master</p>
            </div>

            {/* Scrubber */}
            <div className="music-scrubber">
              <div
                className="scrubber-track"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                  setProgress(pct);
                }}
              >
                <div className="scrubber-fill" style={{ width: `${progress}%` }}>
                  <div className="scrubber-handle" />
                </div>
              </div>
              <div className="scrubber-times">
                <span>2:46</span>
                <span>4:18</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="music-controls">
              <LiquidTooltip content="Shuffle">
                <LiquidIconButton
                  aria-label="Shuffle"
                  glass={isShuffle ? 'strong' : 'clear'}
                  size={40}
                  onClick={() => setIsShuffle(!isShuffle)}
                >
                  <IconShuffle style={{ fontSize: 16, color: isShuffle ? '#38bdf8' : 'inherit' }} />
                </LiquidIconButton>
              </LiquidTooltip>

              <LiquidTooltip content="Previous Track">
                <LiquidIconButton aria-label="Previous" glass="soft" size={44}>
                  <IconSkipBack style={{ fontSize: 18 }} />
                </LiquidIconButton>
              </LiquidTooltip>

              <LiquidTooltip content={isPlaying ? 'Pause' : 'Play'}>
                <LiquidIconButton
                  aria-label="Play/Pause"
                  glass="strong"
                  size={56}
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{ transform: 'scale(1.05)' }}
                >
                  {isPlaying ? <IconPause style={{ fontSize: 24 }} /> : <IconPlay style={{ fontSize: 24 }} />}
                </LiquidIconButton>
              </LiquidTooltip>

              <LiquidTooltip content="Next Track">
                <LiquidIconButton aria-label="Next" glass="soft" size={44}>
                  <IconSkipForward style={{ fontSize: 18 }} />
                </LiquidIconButton>
              </LiquidTooltip>

              <LiquidTooltip content="Repeat">
                <LiquidIconButton
                  aria-label="Repeat"
                  glass={isRepeat ? 'strong' : 'clear'}
                  size={40}
                  onClick={() => setIsRepeat(!isRepeat)}
                >
                  <IconRepeat style={{ fontSize: 16, color: isRepeat ? '#38bdf8' : 'inherit' }} />
                </LiquidIconButton>
              </LiquidTooltip>
            </div>
          </LiquidCard>
        )}

        {/* ========================================================
            Scene B: Command Palette / Spotlight Search
           ======================================================== */}
        {activeScene === 'command' && (
          <LiquidCard
            glass="frosted"
            radius={24}
            className="scene-command-card"
          >
            {/* Search Input Bar */}
            <LiquidInput
              placeholder="Type a command or search actions… (e.g. shader, webgpu)"
              glass="clear"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leading={<IconSearch style={{ fontSize: 18, color: '#93c5fd' }} />}
              trailing={
                <LiquidPill glass="soft" style={{ fontSize: 10, padding: '2px 8px' }}>
                  ⌘K
                </LiquidPill>
              }
            />

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'commands', 'files', 'settings'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: selectedCategory === cat ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedCategory === cat ? '#fff' : 'var(--lq-text-muted)',
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Command Results */}
            <div className="command-results-list">
              {commandItems.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--lq-text-muted)', fontSize: 13 }}>
                  No matching commands found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                commandItems.map((item) => (
                  <div
                    key={item.id}
                    className="command-result-item"
                    onClick={() => handleCopy(item.title, item.id)}
                  >
                    <div className="command-item-left">
                      <div className="command-item-icon">{item.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>
                          Category: {item.cat}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <LiquidPill glass="soft" style={{ fontSize: 11 }}>
                        {item.shortcut}
                      </LiquidPill>
                      <LiquidTooltip content="Execute command">
                        <LiquidIconButton aria-label="Execute" glass="soft" size={32}>
                          {copiedId === item.id ? (
                            <IconCheck style={{ color: '#34d399', fontSize: 14 }} />
                          ) : (
                            <IconCopy style={{ fontSize: 14 }} />
                          )}
                        </LiquidIconButton>
                      </LiquidTooltip>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: 'var(--lq-text-dim)',
                paddingTop: 8,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span>Navigation: &uarr; &darr; &bull; Select: ↵ &bull; Dismiss: Esc</span>
              <LiquidPill statusColor="#34d399" glass="clear" style={{ fontSize: 10 }}>
                Raycast Engine Connected
              </LiquidPill>
            </div>
          </LiquidCard>
        )}

        {/* ========================================================
            Scene C: System Settings / Control Center
           ======================================================== */}
        {activeScene === 'settings' && (
          <LiquidDiv
            glass="frosted"
            radius={28}
            padding={28}
            className="scene-control-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>
                  System Control Center
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--lq-text-muted)' }}>
                  Hardware acceleration &amp; physical rendering switches
                </p>
              </div>
              <LiquidPill statusColor="#38bdf8" glass="strong">
                GPU Engine 2.4 GHz
              </LiquidPill>
            </div>

            <div className="control-tiles-grid">
              {/* Tile 1: Neural Acceleration */}
              <div className="control-tile">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IconZap style={{ color: '#f59e0b', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Neural Optics</div>
                    <div style={{ fontSize: 11, color: 'var(--lq-text-muted)' }}>
                      {neuralEngine ? 'Enabled (120 FPS)' : 'Disabled'}
                    </div>
                  </div>
                </div>
                <LiquidToggle
                  checked={neuralEngine}
                  onCheckedChange={setNeuralEngine}
                  aria-label="Toggle Neural Optics"
                />
              </div>

              {/* Tile 2: Spatial Audio */}
              <div className="control-tile">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IconAirplay style={{ color: '#06b6d4', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Spatial Audio</div>
                    <div style={{ fontSize: 11, color: 'var(--lq-text-muted)' }}>
                      {spatialAudio ? 'Binaural Lossless' : 'Off'}
                    </div>
                  </div>
                </div>
                <LiquidToggle
                  checked={spatialAudio}
                  onCheckedChange={setSpatialAudio}
                  aria-label="Toggle Spatial Audio"
                />
              </div>

              {/* Tile 3: Wi-Fi */}
              <div className="control-tile">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IconWifi style={{ color: '#3b82f6', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Wi-Fi 7 Pro</div>
                    <div style={{ fontSize: 11, color: 'var(--lq-text-muted)' }}>
                      {wifiEnabled ? 'Connected (Aether-5G)' : 'Disconnected'}
                    </div>
                  </div>
                </div>
                <LiquidToggle
                  checked={wifiEnabled}
                  onCheckedChange={setWifiEnabled}
                  aria-label="Toggle Wi-Fi"
                />
              </div>

              {/* Tile 4: Bluetooth */}
              <div className="control-tile">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IconBluetooth style={{ color: '#a855f7', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Bluetooth</div>
                    <div style={{ fontSize: 11, color: 'var(--lq-text-muted)' }}>
                      {bluetoothEnabled ? '3 Devices Paired' : 'Off'}
                    </div>
                  </div>
                </div>
                <LiquidToggle
                  checked={bluetoothEnabled}
                  onCheckedChange={setBluetoothEnabled}
                  aria-label="Toggle Bluetooth"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <LiquidButton variant="ghost" size="sm">
                Reset Defaults
              </LiquidButton>
              <LiquidButton variant="primary" size="sm">
                Apply System Configuration
              </LiquidButton>
            </div>
          </LiquidDiv>
        )}

        {/* ========================================================
            Scene D: Telemetry Dashboard
           ======================================================== */}
        {activeScene === 'dashboard' && (
          <div className="scene-dashboard-grid">
            {/* Card 1: GPU Render Time */}
            <LiquidCard glass="clear" interactive className="dashboard-metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--lq-font-mono)', color: '#94a3b8' }}>
                  GPU PIPELINE
                </span>
                <LiquidPill statusColor="#34d399" glass="dark" style={{ fontSize: 10 }}>
                  Pass 1-4
                </LiquidPill>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>0.38 ms</div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--lq-text-muted)' }}>
                Frame submission latency under 120 FPS target budget.
              </p>
              <div style={{ marginTop: 10 }}>
                <LiquidButton size="sm" variant="secondary" style={{ width: '100%' }}>
                  Profile Shader Passes
                </LiquidButton>
              </div>
            </LiquidCard>

            {/* Card 2: Active Surfaces */}
            <LiquidCard glass="soft" interactive className="dashboard-metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--lq-font-mono)', color: '#94a3b8' }}>
                  SURFACE REGISTRY
                </span>
                <LiquidPill statusColor="#38bdf8" glass="dark" style={{ fontSize: 10 }}>
                  Batched
                </LiquidPill>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>14 / 48</div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--lq-text-muted)' }}>
                Active glass components packed in uniform vectors.
              </p>
              <div style={{ marginTop: 10 }}>
                <LiquidButton size="sm" variant="primary" style={{ width: '100%' }}>
                  View Shape Buffer
                </LiquidButton>
              </div>
            </LiquidCard>

            {/* Card 3: Refraction Quality */}
            <LiquidCard glass="dark" interactive className="dashboard-metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--lq-font-mono)', color: '#94a3b8' }}>
                  SNELL&apos;S ACCURACY
                </span>
                <LiquidPill statusColor="#a855f7" glass="clear" style={{ fontSize: 10 }}>
                  LCH Space
                </LiquidPill>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>99.8%</div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--lq-text-muted)' }}>
                Cauchy dispersion sampling with 2-pass Gaussian blur.
              </p>
              <div style={{ marginTop: 10 }}>
                <LiquidButton size="sm" variant="ghost" style={{ width: '100%' }}>
                  Inspect Ray Vectors
                </LiquidButton>
              </div>
            </LiquidCard>
          </div>
        )}
      </ShowcaseStage>
    </section>
  );
}
