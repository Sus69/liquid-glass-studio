import { useState } from 'react';
import {
  LiquidDock,
  LiquidDockItem,
  LiquidPill,
  LiquidTooltip,
  type LiquidPresetName,
} from 'liquid-ui';
import { ShowcaseStage } from './ShowcaseStage';
import {
  IconCompass,
  IconMail,
  IconMusic,
  IconTerminal,
  IconSettings,
  IconFolder,
  IconImage,
  IconVideo,
  IconSparkles,
} from './Icons';

export function DockSection() {
  const [magnification, setMagnification] = useState<number>(1.65);
  const [proximity, setProximity] = useState<number>(140);
  const [dockGlass, setDockGlass] = useState<LiquidPresetName>('clear');
  const [activeItem, setActiveItem] = useState<string>('music');

  const dockItems = [
    { id: 'finder', label: 'Finder', icon: <IconFolder /> },
    { id: 'safari', label: 'Safari', icon: <IconCompass /> },
    { id: 'mail', label: 'Mail', icon: <IconMail /> },
    { id: 'photos', label: 'Photos', icon: <IconImage /> },
    { id: 'movies', label: 'Cinema', icon: <IconVideo /> },
    { id: 'music', label: 'Spatial Music', icon: <IconMusic /> },
    { id: 'terminal', label: 'Console', icon: <IconTerminal /> },
    { id: 'settings', label: 'Preferences', icon: <IconSettings /> },
  ];

  return (
    <section id="dock" className="section-wrapper">
      <div className="section-header">
        <div className="micro-label">05 // NAVIGATION PRIMITIVE</div>
        <h2 className="section-title">The Liquid Dock</h2>
        <p className="section-description">
          A desktop-grade navigation dock where cursor proximity drives continuous spring
          magnification and SDF smooth-minimum blending between neighboring glass items.
        </p>
      </div>

      <ShowcaseStage
        defaultBackdrop="tahoe-light"
        defaultBackdropMode="textured"
        stageTag="PROXIMITY FIELD"
        stageTitle="DESKTOP DOCK COMPOSITION"
        minHeight={560}
      >
        <div className="dock-stage-viewport">
          {/* Dock Configuration Toolbar */}
          <div className="dock-controls-drawer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconSparkles style={{ color: '#38bdf8', fontSize: 14 }} />
              <span style={{ fontSize: 12, fontFamily: 'var(--lq-font-mono)', fontWeight: 700, color: '#fff' }}>
                MAGNIFICATION: {magnification.toFixed(2)}x
              </span>
            </div>

            <input
              type="range"
              min="1.0"
              max="2.2"
              step="0.05"
              value={magnification}
              onChange={(e) => setMagnification(parseFloat(e.target.value))}
              style={{ width: 100 }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 10 }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--lq-font-mono)', color: '#94a3b8' }}>
                PROXIMITY: {proximity}px
              </span>
            </div>

            <input
              type="range"
              min="60"
              max="240"
              step="10"
              value={proximity}
              onChange={(e) => setProximity(parseInt(e.target.value, 10))}
              style={{ width: 100 }}
            />

            {/* Material Presets for Dock */}
            <div style={{ display: 'flex', gap: 4, marginLeft: 10 }}>
              {(['clear', 'soft', 'frosted', 'strong', 'dark'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDockGlass(preset)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 999,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: dockGlass === preset ? 'rgba(59, 130, 246, 0.35)' : 'transparent',
                    color: dockGlass === preset ? '#fff' : 'var(--lq-text-muted)',
                    fontSize: 10,
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

          {/* Centered Ambient Label */}
          <div style={{ position: 'absolute', top: 100, textAlign: 'center' }}>
            <LiquidPill statusColor="#34d399" glass="dark">
              Move cursor near the dock items to observe physical proximity lift &amp; SDF merge
            </LiquidPill>
          </div>

          {/* The Desktop Dock */}
          <LiquidDock
            glass={dockGlass}
            magnification={magnification}
            proximity={proximity}
            radius={28}
          >
            {dockItems.map((item) => (
              <LiquidTooltip key={item.id} content={item.label} side="top">
                <LiquidDockItem
                  aria-label={item.label}
                  glass={dockGlass === 'dark' ? 'dark' : 'soft'}
                  onClick={() => setActiveItem(item.id)}
                  style={{
                    position: 'relative',
                    boxShadow: activeItem === item.id ? '0 0 16px rgba(56, 189, 248, 0.5)' : undefined,
                  }}
                >
                  <div className="dock-item-icon-wrap">{item.icon}</div>
                  {activeItem === item.id && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#38bdf8',
                        boxShadow: '0 0 6px #38bdf8',
                      }}
                    />
                  )}
                </LiquidDockItem>
              </LiquidTooltip>
            ))}
          </LiquidDock>
        </div>
      </ShowcaseStage>
    </section>
  );
}
