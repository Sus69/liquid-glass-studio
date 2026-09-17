import { useState } from 'react';
import {
  LiquidBlob,
  LiquidBlobShape,
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
  type LiquidMaterial,
  type LiquidMaterialOverride,
} from 'liquid-ui';

/* ------------------------------------------------------------------ */
/* EXACT STUDIO REFERENCE VALUES (Liquid Glass Studio Source of Truth)*/
/* ------------------------------------------------------------------ */

export const PRISM_MATERIAL: LiquidMaterial = {
  // Material settings
  thickness: 20.00,
  refractionDistance: 0.05,
  refraction: 1.40,
  dispersion: 7.00,

  fresnelRange: 36.00,
  fresnelHardness: 0.20,
  fresnel: 0.20,

  glareRange: 30.00,
  glareHardness: 0.20,
  glare: 0.90,
  glareConvergence: 0.50,
  glareOppositeFactor: 0.80,
  glareAngle: -45.0,

  blur: 1,
  borderBlend: true,

  tint: { r: 255, g: 255, b: 255, a: 0 },

  shadowExpand: 25.00,
  shadow: 0.15,
  shadowOffset: {
    x: 0,
    y: -10,
  },

  // Shape settings
  merge: 0.05,
  radius: 16,
  roundness: 5.00,
};

export const PRISM_SHAPE = {
  width: 200,
  height: 200,
  radius: 80,
  superEllipseFactor: 5.00,
  mergeRate: 0.05,
  showSecondShape: true,
};

export const PRISM_ANIMATION = {
  morph: 10.00,
};

/* ------------------------------------------------------------------ */
/* Glass Hierarchy: Coherent material system for nested elements     */
/* Smaller controls feel like smaller pieces of that same material    */
/* ------------------------------------------------------------------ */

/** For interactive buttons, inputs and toggles (32-48px) */
export const PRISM_CONTROL_MATERIAL: LiquidMaterialOverride = {
  ...PRISM_MATERIAL,
  thickness: 10.00,
  shadowExpand: 14.00,
  shadow: 0.10,
  shadowOffset: { x: 0, y: -4 },
};

/** For compact status pills and subtle indicators */
export const PRISM_SUBTLE_MATERIAL: LiquidMaterialOverride = {
  ...PRISM_MATERIAL,
  thickness: 8.00,
  shadowExpand: 10.00,
  shadow: 0.08,
  shadowOffset: { x: 0, y: -2 },
};

/* ------------------------------------------------------------------ */
/* Inline icons (crisp DOM — never rendered through WebGL)             */
/* ------------------------------------------------------------------ */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const Icon = {
  Play: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
      <path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none" />
    </svg>
  ),
  Pause: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
      <path d="M8 5v14M16 5v14" strokeWidth="2.4" />
    </svg>
  ),
  SkipBack: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
      <path d="M18 5v14L8 12zM6 5v14" />
    </svg>
  ),
  SkipFwd: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
      <path d="M6 5v14l10-7zM18 5v14" />
    </svg>
  ),
  Heart: ({ filled }: { filled?: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7.5-4.7-9.4-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.4 11c-1.9 4.3-9.4 9-9.4 9z" />
    </svg>
  ),
  Shuffle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
      <path d="M16 4h4v4M4 20 20 4M4 4l5 5m6 6 5 5m0 0h-4m4 0v-4" />
    </svg>
  ),
  Repeat: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
      <path d="m17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4m14 5v1a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Bell: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
      <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2.2 2.2 0 0 0 4 0" />
    </svg>
  ),
  Gear: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>
  ),
  Compass: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </svg>
  ),
  Library: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M4 4v16M9 4v16M14 5l5 15" />
    </svg>
  ),
  Radio: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7.8 16.2a6 6 0 0 1 0-8.4m8.4 0a6 6 0 0 1 0 8.4M4.9 19.1a10 10 0 0 1 0-14.2m14.2 0a10 10 0 0 1 0 14.2" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function AlbumArt({ gradient, label }: { gradient: string; label: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: gradient,
        display: 'grid',
        placeItems: 'center',
        fontSize: 20,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}

function ProgressTrack({ pct }: { pct: number }) {
  return (
    <div
      style={{
        height: 4,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.14)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 999,
          background: 'linear-gradient(90deg, #7de0ff, #b39bff)',
        }}
      />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, opacity: 0.9 }}>
      <span style={{ minWidth: 86, opacity: 0.55 }}>{label}</span>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const TRACKS = [
  { title: 'Chromatic Drift', artist: 'Nova Bloom', album: 'Refraction', len: '3:42', art: 'linear-gradient(135deg,#5b8cff,#9b6bff)', icon: '🌊' },
  { title: 'Glasshouse', artist: 'Iris Vega', album: 'Meridian', len: '4:05', art: 'linear-gradient(135deg,#39d0c4,#3f7bff)', icon: '🪩' },
  { title: 'Low Orbit', artist: 'Cassio', album: 'Apogee', len: '2:58', art: 'linear-gradient(135deg,#ff8a5c,#ff4f9a)', icon: '🛰️' },
  { title: 'Fresnel Sky', artist: 'Nova Bloom', album: 'Refraction', len: '5:12', art: 'linear-gradient(135deg,#7de0ff,#5b8cff)', icon: '🌈' },
  { title: 'Smin Merge', artist: 'The Blobs', album: 'Signed Distance', len: '3:21', art: 'linear-gradient(135deg,#b39bff,#ff5cc8)', icon: '🫧' },
];

/* ------------------------------------------------------------------ */
/* The mock app                                                        */
/* ------------------------------------------------------------------ */

export function PrismApp({
  wallpaper = false,
  dark = true,
}: {
  wallpaper?: boolean;
  dark?: boolean;
}) {
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const [hiRes, setHiRes] = useState(true);
  const [losslessOnly, setLosslessOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [view, setView] = useState('Home');

  const tracks = TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.artist.toLowerCase().includes(query.toLowerCase()),
  );

  const fg = dark ? '#f2f5ff' : '#141820';

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: fg,
      }}
    >
      {wallpaper && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            background:
              'radial-gradient(1200px 800px at 15% -10%, #3b2a68 0%, transparent 60%),' +
              'radial-gradient(1000px 700px at 110% 20%, #0e4a5e 0%, transparent 55%),' +
              'radial-gradient(900px 900px at 50% 120%, #63214d 0%, transparent 60%), #0b0d16',
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1, padding: '40px clamp(20px, 6vw, 96px) 150px' }}>
        {/* ================= Top bar ================= */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            justifyContent: 'space-between',
            marginBottom: 34,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LiquidBlob
              merge={PRISM_SHAPE.mergeRate}
              glass={PRISM_MATERIAL}
              style={{ width: 56, height: 56, position: 'relative' }}
            >
              <LiquidBlobShape x={4} y={6} width={26} height={26} radius={13} />
              {PRISM_SHAPE.showSecondShape && (
                <LiquidBlobShape x={22} y={22} width={22} height={22} radius={11} />
              )}
            </LiquidBlob>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: 0.3 }}>Prism</div>
              <div style={{ fontSize: 11, opacity: 0.55 }}>Liquid Glass Studio build</div>
            </div>
          </div>

          <LiquidInput
            aria-label="Search tracks"
            placeholder="Search tracks or artists…"
            glass={PRISM_CONTROL_MATERIAL}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leading={<Icon.Search />}
            style={{ width: 280 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LiquidTooltip content="Notifications">
              <LiquidIconButton aria-label="Notifications" glass={PRISM_CONTROL_MATERIAL} radius={13}>
                <Icon.Bell />
              </LiquidIconButton>
            </LiquidTooltip>
            <LiquidTooltip content="Settings">
              <LiquidIconButton
                aria-label="Settings"
                glass={PRISM_CONTROL_MATERIAL}
                radius={13}
                onClick={() => setModalOpen(true)}
              >
                <Icon.Gear />
              </LiquidIconButton>
            </LiquidTooltip>
            <LiquidPill glass={PRISM_SUBTLE_MATERIAL} statusColor="#34d399">
              Online
            </LiquidPill>
          </div>
        </header>

        {/* ================= Hero + side panels ================= */}
        <main style={{ display: 'flex', gap: 22, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <LiquidCard
            interactive
            glass={PRISM_MATERIAL}
            radius={28}
            style={{ flex: '1 1 420px', padding: 28, minWidth: 320 }}
          >
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div
                style={{
                  width: 118,
                  height: 118,
                  borderRadius: 22,
                  background: 'linear-gradient(135deg,#5b8cff,#9b6bff 55%,#ff5cc8)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 54,
                  flexShrink: 0,
                  boxShadow: '0 14px 40px rgba(90,80,255,0.35)',
                }}
              >
                🌊
              </div>
              <div style={{ minWidth: 0 }}>
                <LiquidPill glass={PRISM_SUBTLE_MATERIAL} statusColor="#7de0ff" style={{ marginBottom: 10 }}>
                  Now playing · {view}
                </LiquidPill>
                <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, letterSpacing: -0.3 }}>
                  Chromatic Drift
                </h1>
                <div style={{ fontSize: 14, opacity: 0.65 }}>Nova Bloom — Refraction · 2026</div>
              </div>
            </div>

            <div style={{ margin: '24px 0 10px' }}>
              <ProgressTrack pct={37} />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  opacity: 0.55,
                  marginTop: 6,
                }}
              >
                <span>1:23</span>
                <span>3:42</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LiquidIconButton aria-label="Shuffle" glass={PRISM_CONTROL_MATERIAL} size={38} radius={13}>
                <Icon.Shuffle />
              </LiquidIconButton>
              <LiquidIconButton aria-label="Previous track" glass={PRISM_CONTROL_MATERIAL} size={42} radius={14}>
                <Icon.SkipBack />
              </LiquidIconButton>
              <LiquidIconButton
                aria-label={playing ? 'Pause' : 'Play'}
                glass={PRISM_CONTROL_MATERIAL}
                size={54}
                radius={18}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Icon.Pause /> : <Icon.Play />}
              </LiquidIconButton>
              <LiquidIconButton aria-label="Next track" glass={PRISM_CONTROL_MATERIAL} size={42} radius={14}>
                <Icon.SkipFwd />
              </LiquidIconButton>
              <LiquidIconButton aria-label="Repeat" glass={PRISM_CONTROL_MATERIAL} size={38} radius={13}>
                <Icon.Repeat />
              </LiquidIconButton>
              <div style={{ flex: 1 }} />
              <LiquidIconButton
                aria-label={liked ? 'Unlike' : 'Like'}
                glass={PRISM_CONTROL_MATERIAL}
                size={38}
                radius={13}
                onClick={() => setLiked((l) => !l)}
                style={liked ? { color: '#ff5c8a' } : undefined}
              >
                <Icon.Heart filled={liked} />
              </LiquidIconButton>
            </div>
          </LiquidCard>

          <div
            style={{
              flex: '1 1 320px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              minWidth: 300,
            }}
          >
            <LiquidDiv glass={PRISM_MATERIAL} radius={24} padding={20} style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Up next</h2>
                <LiquidPill glass={PRISM_SUBTLE_MATERIAL} style={{ fontSize: 11 }}>
                  {tracks.length} tracks
                </LiquidPill>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tracks.map((t, i) => (
                  <div
                    key={t.title}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 10px',
                      borderRadius: 14,
                      background: i === 0 ? 'rgba(125,224,255,0.10)' : 'transparent',
                      fontSize: 13,
                    }}
                  >
                    <AlbumArt gradient={t.art} label={t.icon} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {t.title}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.55 }}>
                        {t.artist} · {t.album}
                      </div>
                    </div>
                    <span style={{ opacity: 0.5, fontSize: 11 }}>{t.len}</span>
                  </div>
                ))}
                {tracks.length === 0 && (
                  <div style={{ opacity: 0.5, fontSize: 13, padding: '12px 4px' }}>
                    No tracks match “{query}”.
                  </div>
                )}
              </div>
            </LiquidDiv>

            <LiquidDiv glass={PRISM_MATERIAL} radius={24} padding={20}>
              <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Playback</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Row label="Hi-res audio">
                  <LiquidToggle
                    checked={hiRes}
                    onCheckedChange={setHiRes}
                    aria-label="Hi-res audio"
                    glass={PRISM_CONTROL_MATERIAL}
                  />
                </Row>
                <Row label="Lossless only">
                  <LiquidToggle
                    checked={losslessOnly}
                    onCheckedChange={setLosslessOnly}
                    aria-label="Lossless only"
                    glass={PRISM_CONTROL_MATERIAL}
                  />
                </Row>
                <Row label="Quality">
                  <LiquidPill glass={PRISM_SUBTLE_MATERIAL} statusColor="#a78bfa" style={{ fontSize: 11 }}>
                    {hiRes ? '24-bit / 192 kHz' : 'Lossless'}
                  </LiquidPill>
                </Row>
                <Row label="Account">
                  <LiquidButton
                    size="sm"
                    variant="ghost"
                    glass={PRISM_CONTROL_MATERIAL}
                    onClick={() => setModalOpen(true)}
                  >
                    Manage plan
                  </LiquidButton>
                </Row>
              </div>
            </LiquidDiv>
          </div>
        </main>

        {/* ================= Dock ================= */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 26,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <LiquidDock magnification={1.5} proximity={120} radius={26} glass={PRISM_MATERIAL}>
              {([
                ['Home', <Icon.Home />],
                ['Explore', <Icon.Compass />],
                ['Library', <Icon.Library />],
                ['Radio', <Icon.Radio />],
                ['Profile', <Icon.User />],
              ] as const).map(([label, icon]) => (
                <LiquidDockItem
                  key={label}
                  aria-label={label}
                  glass={PRISM_CONTROL_MATERIAL}
                  onClick={() => setView(label)}
                  style={{
                    width: 52,
                    height: 52,
                    display: 'grid',
                    placeItems: 'center',
                    color: view === label ? '#7de0ff' : undefined,
                  }}
                >
                  {icon}
                </LiquidDockItem>
              ))}
            </LiquidDock>
          </div>
        </div>

        {/* ================= Modal ================= */}
        <LiquidModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          ariaLabel="Account settings"
          glass={PRISM_MATERIAL}
          radius={26}
        >
          <div style={{ color: fg, minWidth: 340 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 800 }}>Account settings</h2>
            <p style={{ margin: '0 0 18px', fontSize: 13, opacity: 0.65 }}>
              Mock dialog rendered on a liquid glass surface.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <Row label="Hi-res audio">
                <LiquidToggle
                  checked={hiRes}
                  onCheckedChange={setHiRes}
                  aria-label="Hi-res audio"
                  glass={PRISM_CONTROL_MATERIAL}
                />
              </Row>
              <Row label="Lossless only">
                <LiquidToggle
                  checked={losslessOnly}
                  onCheckedChange={setLosslessOnly}
                  aria-label="Lossless only"
                  glass={PRISM_CONTROL_MATERIAL}
                />
              </Row>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <LiquidButton variant="ghost" glass={PRISM_CONTROL_MATERIAL} onClick={() => setModalOpen(false)}>
                Cancel
              </LiquidButton>
              <LiquidButton variant="primary" glass={PRISM_CONTROL_MATERIAL} onClick={() => setModalOpen(false)}>
                Save changes
              </LiquidButton>
            </div>
          </div>
        </LiquidModal>
      </div>
    </div>
  );
}
