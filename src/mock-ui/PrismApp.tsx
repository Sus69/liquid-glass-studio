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
  type LiquidMaterialOverride,
} from 'liquid-ui';

/* ------------------------------------------------------------------ */
/* THE MAX MATERIAL — every knob from the Studio's Leva panel at or    */
/* near its maximum. Mapped to the engine uniforms (thickness →        */
/* u_refThickness etc.) by materials/toUniforms.ts.                    */
/* ------------------------------------------------------------------ */

const MAX_GLASS: LiquidMaterialOverride = {
  // Geometry
  thickness: 80,           // max 80  (u_refThickness)
  refraction: 4,           // max 4   (u_refFactor — index of refraction)
  refractionDistance: 0.2, // max 0.2 (u_refDistance)
  dispersion: 50,          // max 50  (u_refDispersion — chromatic aberration)
  merge: 0.12,             // smin blob merging (Leva max 0.3)

  // Edge lighting — factors are 0-1 (Leva maxes 100-120 /100)
  fresnel: 1,              // u_refFresnelFactor (max 1)
  fresnelRange: 100,       // max 100
  fresnelHardness: 1,      // max 1
  glare: 1,                // u_glareFactor (max 1.2)
  glareRange: 100,         // max 100
  glareHardness: 1,        // max 1
  glareConvergence: 1,     // max 1
  glareOppositeFactor: 1,  // max 1
  glareAngle: -45,

  // Depth
  shadow: 1,               // max 1 (u_shadowFactor)
  shadowExpand: 100,       // max 100
  shadowOffset: { x: 0, y: -30 },

  // Shape
  roundness: 7,            // superellipse max 7 (max squircle)

  // NO blur — explicitly off
  blur: 0,
  borderBlend: false,
  tint: { r: 255, g: 255, b: 255, a: 0 },
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
              merge={0.3}
              glass={MAX_GLASS}
              style={{ width: 56, height: 56, position: 'relative' }}
            >
              <LiquidBlobShape x={4} y={6} width={26} height={26} radius={13} />
              <LiquidBlobShape x={22} y={22} width={22} height={22} radius={11} />
            </LiquidBlob>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: 0.3 }}>Prism</div>
              <div style={{ fontSize: 11, opacity: 0.55 }}>max material build</div>
            </div>
          </div>

          <LiquidInput
            aria-label="Search tracks"
            placeholder="Search tracks or artists…"
            glass={MAX_GLASS}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leading={<Icon.Search />}
            style={{ width: 280 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LiquidTooltip content="Notifications">
              <LiquidIconButton aria-label="Notifications" glass={MAX_GLASS} radius={13}>
                <Icon.Bell />
              </LiquidIconButton>
            </LiquidTooltip>
            <LiquidTooltip content="Settings">
              <LiquidIconButton
                aria-label="Settings"
                glass={MAX_GLASS}
                radius={13}
                onClick={() => setModalOpen(true)}
              >
                <Icon.Gear />
              </LiquidIconButton>
            </LiquidTooltip>
            <LiquidPill glass={MAX_GLASS} statusColor="#34d399">
              Online
            </LiquidPill>
          </div>
        </header>

        {/* ================= Hero + side panels ================= */}
        <main style={{ display: 'flex', gap: 22, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <LiquidCard
            interactive
            glass={MAX_GLASS}
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
                <LiquidPill glass={MAX_GLASS} statusColor="#7de0ff" style={{ marginBottom: 10 }}>
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
              <LiquidIconButton aria-label="Shuffle" glass={MAX_GLASS} size={38} radius={13}>
                <Icon.Shuffle />
              </LiquidIconButton>
              <LiquidIconButton aria-label="Previous track" glass={MAX_GLASS} size={42} radius={14}>
                <Icon.SkipBack />
              </LiquidIconButton>
              <LiquidIconButton
                aria-label={playing ? 'Pause' : 'Play'}
                glass={MAX_GLASS}
                size={54}
                radius={18}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Icon.Pause /> : <Icon.Play />}
              </LiquidIconButton>
              <LiquidIconButton aria-label="Next track" glass={MAX_GLASS} size={42} radius={14}>
                <Icon.SkipFwd />
              </LiquidIconButton>
              <LiquidIconButton aria-label="Repeat" glass={MAX_GLASS} size={38} radius={13}>
                <Icon.Repeat />
              </LiquidIconButton>
              <div style={{ flex: 1 }} />
              <LiquidIconButton
                aria-label={liked ? 'Unlike' : 'Like'}
                glass={MAX_GLASS}
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
            <LiquidDiv glass={MAX_GLASS} radius={24} padding={20} style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Up next</h2>
                <LiquidPill glass={MAX_GLASS} style={{ fontSize: 11 }}>
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

            <LiquidDiv glass={MAX_GLASS} radius={24} padding={20}>
              <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Playback</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Row label="Hi-res audio">
                  <LiquidToggle
                    checked={hiRes}
                    onCheckedChange={setHiRes}
                    aria-label="Hi-res audio"
                    glass={MAX_GLASS}
                  />
                </Row>
                <Row label="Lossless only">
                  <LiquidToggle
                    checked={losslessOnly}
                    onCheckedChange={setLosslessOnly}
                    aria-label="Lossless only"
                    glass={MAX_GLASS}
                  />
                </Row>
                <Row label="Quality">
                  <LiquidPill glass={MAX_GLASS} statusColor="#a78bfa" style={{ fontSize: 11 }}>
                    {hiRes ? '24-bit / 192 kHz' : 'Lossless'}
                  </LiquidPill>
                </Row>
                <Row label="Account">
                  <LiquidButton
                    size="sm"
                    variant="ghost"
                    glass={MAX_GLASS}
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
            <LiquidDock magnification={1.5} proximity={120} radius={26} glass={MAX_GLASS}>
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
                  glass={MAX_GLASS}
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
          glass={MAX_GLASS}
          radius={26}
        >
          <div style={{ color: fg, minWidth: 340 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 800 }}>Account settings</h2>
            <p style={{ margin: '0 0 18px', fontSize: 13, opacity: 0.65 }}>
              Mock dialog rendered on a max-material liquid surface.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <Row label="Hi-res audio">
                <LiquidToggle
                  checked={hiRes}
                  onCheckedChange={setHiRes}
                  aria-label="Hi-res audio"
                  glass={MAX_GLASS}
                />
              </Row>
              <Row label="Lossless only">
                <LiquidToggle
                  checked={losslessOnly}
                  onCheckedChange={setLosslessOnly}
                  aria-label="Lossless only"
                  glass={MAX_GLASS}
                />
              </Row>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <LiquidButton variant="ghost" glass={MAX_GLASS} onClick={() => setModalOpen(false)}>
                Cancel
              </LiquidButton>
              <LiquidButton variant="primary" glass={MAX_GLASS} onClick={() => setModalOpen(false)}>
                Save changes
              </LiquidButton>
            </div>
          </div>
        </LiquidModal>
      </div>
    </div>
  );
}
