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
  LiquidBlob,
  LiquidBlobShape,
  LiquidSurface,
  type LiquidButtonVariant,
  type LiquidButtonSize,
  type LiquidPresetName,
} from 'liquid-ui';
import {
  IconSearch,
  IconSparkles,
  IconCopy,
  IconCheck,
  IconCompass,
  IconMusic,
  IconSettings,
  IconSliders,
  IconExternalLink,
} from './Icons';

type CategoryFilter = 'all' | 'actions' | 'surfaces' | 'forms' | 'feedback' | 'navigation' | 'organic';

export function ComponentIndexSection() {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Component Sandboxes state
  // 1. Button
  const [btnVariant, setBtnVariant] = useState<LiquidButtonVariant>('primary');
  const [btnSize, setBtnSize] = useState<LiquidButtonSize>('md');
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnGlass, setBtnGlass] = useState<LiquidPresetName>('strong');

  // 2. Card
  const [cardGlass, setCardGlass] = useState<LiquidPresetName>('frosted');
  const [cardInteractive, setCardInteractive] = useState(true);

  // 3. Div
  const [divGlass, setDivGlass] = useState<LiquidPresetName>('soft');
  const [divRadius, setDivRadius] = useState(20);

  // 4. Dock
  const [dockGlass, setDockGlass] = useState<LiquidPresetName>('clear');

  // 5. IconButton
  const [iconBtnGlass, setIconBtnGlass] = useState<LiquidPresetName>('soft');
  const [iconBtnSize, setIconBtnSize] = useState(42);

  // 6. Input
  const [inputValue, setInputValue] = useState('Search textures…');
  const [inputGlass, setInputGlass] = useState<LiquidPresetName>('frosted');

  // 7. Modal
  const [modalOpen, setModalOpen] = useState(false);

  // 8. Pill
  const [pillColor, setPillColor] = useState('#34d399');
  const [pillGlass, setPillGlass] = useState<LiquidPresetName>('soft');

  // 9. Toggle
  const [toggleChecked, setToggleChecked] = useState(true);
  const [toggleGlass, setToggleGlass] = useState<LiquidPresetName>('soft');

  // 10. Tooltip
  const [tooltipSide, setTooltipSide] = useState<'top' | 'bottom'>('top');

  // 11. Blob
  const [blobMerge, setBlobMerge] = useState(0.1);

  // 12. Surface
  const [surfaceAs, setSurfaceAs] = useState<'div' | 'button'>('div');

  const copyCode = (code: string, key: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <section id="components" className="section-wrapper">
      <div className="section-header">
        <div className="micro-label">09 // COMPONENT CATALOG</div>
        <h2 className="section-title">Component Index</h2>
        <p className="section-description">
          Exhaustive catalog of all 12 Liquid UI primitives. Every component renders real DOM
          elements with hardware-accelerated GPU optics.
        </p>
      </div>

      {/* Category Filters */}
      <div className="catalog-filters-bar">
        {[
          { id: 'all', label: 'All Components' },
          { id: 'actions', label: 'Actions' },
          { id: 'surfaces', label: 'Surfaces' },
          { id: 'forms', label: 'Forms & Controls' },
          { id: 'feedback', label: 'Feedback' },
          { id: 'navigation', label: 'Navigation' },
          { id: 'organic', label: 'Organic Fluids' },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id as CategoryFilter)}
            className={`catalog-filter-btn ${filter === c.id ? 'is-active' : ''}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid of Component Catalog Cards */}
      <div className="component-cards-grid">
        {/* ========================================================
            1. LiquidButton
           ======================================================== */}
        {(filter === 'all' || filter === 'actions') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidButton</h3>
                <p className="component-card-desc">
                  Real &lt;button&gt; with spring hover displacement and SDF press compression.
                </p>
              </div>
              <LiquidPill statusColor="#38bdf8" glass="soft">
                Action
              </LiquidPill>
            </div>

            <div className="component-card-sandbox">
              <LiquidButton
                variant={btnVariant}
                size={btnSize}
                loading={btnLoading}
                disabled={btnDisabled}
                glass={btnGlass}
              >
                {btnLoading ? 'Loading…' : btnDisabled ? 'Disabled' : 'Get Started'}
              </LiquidButton>
            </div>

            <div className="component-card-controls">
              {/* Variant */}
              <div style={{ display: 'flex', gap: 4 }}>
                {(['primary', 'secondary', 'ghost'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBtnVariant(v)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--lq-border)',
                      background: btnVariant === v ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: btnVariant === v ? '#fff' : 'var(--lq-text-muted)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Size */}
              <div style={{ display: 'flex', gap: 4 }}>
                {(['sm', 'md', 'lg'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBtnSize(s)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--lq-border)',
                      background: btnSize === s ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: btnSize === s ? '#fff' : 'var(--lq-text-muted)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* States */}
              <button
                type="button"
                onClick={() => setBtnLoading(!btnLoading)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--lq-border)',
                  background: btnLoading ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                  color: btnLoading ? '#fff' : 'var(--lq-text-muted)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Loading
              </button>

              <button
                type="button"
                onClick={() => setBtnDisabled(!btnDisabled)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--lq-border)',
                  background: btnDisabled ? 'rgba(239, 68, 68, 0.3)' : 'transparent',
                  color: btnDisabled ? '#fff' : 'var(--lq-text-muted)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Disabled
              </button>
            </div>

            <div className="component-card-code">
              <code>
                {`<LiquidButton variant="${btnVariant}" size="${btnSize}"${btnLoading ? ' loading' : ''}${btnDisabled ? ' disabled' : ''}>Get Started</LiquidButton>`}
              </code>
              <button
                type="button"
                onClick={() =>
                  copyCode(
                    `<LiquidButton variant="${btnVariant}" size="${btnSize}">Get Started</LiquidButton>`,
                    'btn',
                  )
                }
                className="code-copy-btn"
              >
                {copiedKey === 'btn' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'btn' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            2. LiquidCard
           ======================================================== */}
        {(filter === 'all' || filter === 'surfaces') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidCard</h3>
                <p className="component-card-desc">
                  Glass container surface with optional pointer-following magnetic response.
                </p>
              </div>
              <LiquidPill statusColor="#10b981" glass="soft">
                Surface
              </LiquidPill>
            </div>

            <div className="component-card-sandbox">
              <LiquidCard
                glass={cardGlass}
                interactive={cardInteractive}
                radius={20}
                style={{ width: 280, padding: 20 }}
              >
                <h4 style={{ margin: '0 0 6px', fontSize: 16, color: '#fff' }}>Project Aurora</h4>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--lq-text-muted)' }}>
                  Optical glass card responding to cursor movements.
                </p>
                <div style={{ marginTop: 12 }}>
                  <LiquidButton size="sm" variant="primary">
                    Open Project
                  </LiquidButton>
                </div>
              </LiquidCard>
            </div>

            <div className="component-card-controls">
              <div style={{ display: 'flex', gap: 4 }}>
                {(['soft', 'clear', 'frosted', 'strong', 'dark'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCardGlass(preset)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--lq-border)',
                      background: cardGlass === preset ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: cardGlass === preset ? '#fff' : 'var(--lq-text-muted)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCardInteractive(!cardInteractive)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--lq-border)',
                  background: cardInteractive ? 'rgba(52, 211, 153, 0.3)' : 'transparent',
                  color: cardInteractive ? '#fff' : 'var(--lq-text-muted)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Interactive: {cardInteractive ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="component-card-code">
              <code>{`<LiquidCard glass="${cardGlass}" interactive={${cardInteractive}}>...</LiquidCard>`}</code>
              <button
                type="button"
                onClick={() =>
                  copyCode(
                    `<LiquidCard glass="${cardGlass}" interactive={${cardInteractive}}>\n  <h3>Title</h3>\n</LiquidCard>`,
                    'card',
                  )
                }
                className="code-copy-btn"
              >
                {copiedKey === 'card' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'card' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            3. LiquidDiv
           ======================================================== */}
        {(filter === 'all' || filter === 'surfaces') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidDiv</h3>
                <p className="component-card-desc">
                  General-purpose DOM div container backed by the GPU material shader.
                </p>
              </div>
              <LiquidPill statusColor="#10b981" glass="soft">
                Surface
              </LiquidPill>
            </div>

            <div className="component-card-sandbox">
              <LiquidDiv
                glass={divGlass}
                radius={divRadius}
                padding={20}
                style={{ width: 280 }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Container Surface</div>
                <div style={{ fontSize: 11, color: 'var(--lq-text-muted)', marginTop: 4 }}>
                  Corner Radius: {divRadius}px
                </div>
              </LiquidDiv>
            </div>

            <div className="component-card-controls">
              <div style={{ display: 'flex', gap: 4 }}>
                {(['soft', 'clear', 'frosted', 'strong', 'dark'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDivGlass(preset)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--lq-border)',
                      background: divGlass === preset ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: divGlass === preset ? '#fff' : 'var(--lq-text-muted)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <span style={{ fontSize: 11, color: '#94a3b8' }}>Radius:</span>
              <input
                type="range"
                min="8"
                max="40"
                value={divRadius}
                onChange={(e) => setDivRadius(parseInt(e.target.value, 10))}
                style={{ width: 80 }}
              />
            </div>

            <div className="component-card-code">
              <code>{`<LiquidDiv glass="${divGlass}" radius={${divRadius}}>...</LiquidDiv>`}</code>
              <button
                type="button"
                onClick={() =>
                  copyCode(`<LiquidDiv glass="${divGlass}" radius={${divRadius}}>Content</LiquidDiv>`, 'div')
                }
                className="code-copy-btn"
              >
                {copiedKey === 'div' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'div' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            4. LiquidDock & LiquidDockItem
           ======================================================== */}
        {(filter === 'all' || filter === 'navigation') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidDock &amp; LiquidDockItem</h3>
                <p className="component-card-desc">
                  Proximity magnification dock primitive with SDF smooth-minimum merging.
                </p>
              </div>
              <LiquidPill statusColor="#a855f7" glass="soft">
                Navigation
              </LiquidPill>
            </div>

            <div className="component-card-sandbox">
              <LiquidDock glass={dockGlass} magnification={1.5} proximity={100}>
                <LiquidDockItem aria-label="Home">
                  <IconCompass style={{ fontSize: 18 }} />
                </LiquidDockItem>
                <LiquidDockItem aria-label="Music">
                  <IconMusic style={{ fontSize: 18 }} />
                </LiquidDockItem>
                <LiquidDockItem aria-label="Settings">
                  <IconSettings style={{ fontSize: 18 }} />
                </LiquidDockItem>
              </LiquidDock>
            </div>

            <div className="component-card-controls">
              <div style={{ display: 'flex', gap: 4 }}>
                {(['clear', 'soft', 'frosted', 'strong', 'dark'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDockGlass(preset)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--lq-border)',
                      background: dockGlass === preset ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: dockGlass === preset ? '#fff' : 'var(--lq-text-muted)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="component-card-code">
              <code>{`<LiquidDock glass="${dockGlass}" magnification={1.5} proximity={100}>\n  <LiquidDockItem>...</LiquidDockItem>\n</LiquidDock>`}</code>
              <button
                type="button"
                onClick={() =>
                  copyCode(
                    `<LiquidDock glass="${dockGlass}" magnification={1.5}>\n  <LiquidDockItem aria-label="Home">🏠</LiquidDockItem>\n</LiquidDock>`,
                    'dock',
                  )
                }
                className="code-copy-btn"
              >
                {copiedKey === 'dock' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'dock' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            5. LiquidIconButton
           ======================================================== */}
        {(filter === 'all' || filter === 'actions') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidIconButton</h3>
                <p className="component-card-desc">
                  Icon-only glass button with crisp DOM vector content and pointer-following glare.
                </p>
              </div>
              <LiquidPill statusColor="#38bdf8" glass="soft">
                Action
              </LiquidPill>
            </div>

            <div className="component-card-sandbox" style={{ gap: 14 }}>
              <LiquidIconButton
                aria-label="Search"
                glass={iconBtnGlass}
                size={iconBtnSize}
              >
                <IconSearch style={{ fontSize: iconBtnSize * 0.45 }} />
              </LiquidIconButton>
              <LiquidIconButton
                aria-label="Settings"
                glass={iconBtnGlass}
                size={iconBtnSize}
              >
                <IconSettings style={{ fontSize: iconBtnSize * 0.45 }} />
              </LiquidIconButton>
              <LiquidIconButton
                aria-label="Sliders"
                glass={iconBtnGlass}
                size={iconBtnSize}
              >
                <IconSliders style={{ fontSize: iconBtnSize * 0.45 }} />
              </LiquidIconButton>
            </div>

            <div className="component-card-controls">
              <div style={{ display: 'flex', gap: 4 }}>
                {(['soft', 'clear', 'frosted', 'strong', 'dark'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setIconBtnGlass(preset)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--lq-border)',
                      background: iconBtnGlass === preset ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: iconBtnGlass === preset ? '#fff' : 'var(--lq-text-muted)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <span style={{ fontSize: 11, color: '#94a3b8' }}>Size:</span>
              <input
                type="range"
                min="32"
                max="56"
                value={iconBtnSize}
                onChange={(e) => setIconBtnSize(parseInt(e.target.value, 10))}
                style={{ width: 80 }}
              />
            </div>

            <div className="component-card-code">
              <code>{`<LiquidIconButton aria-label="Search" glass="${iconBtnGlass}" size={${iconBtnSize}}><SearchIcon /></LiquidIconButton>`}</code>
              <button
                type="button"
                onClick={() =>
                  copyCode(
                    `<LiquidIconButton aria-label="Search" glass="${iconBtnGlass}" size={${iconBtnSize}}><IconSearch /></LiquidIconButton>`,
                    'iconbtn',
                  )
                }
                className="code-copy-btn"
              >
                {copiedKey === 'iconbtn' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'iconbtn' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            6. LiquidInput
           ======================================================== */}
        {(filter === 'all' || filter === 'forms') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidInput</h3>
                <p className="component-card-desc">
                  Real DOM &lt;input&gt; with glass refraction backing and leading/trailing slots.
                </p>
              </div>
              <LiquidPill statusColor="#f59e0b" glass="soft">
                Forms
              </LiquidPill>
            </div>

            <div className="component-card-sandbox">
              <LiquidInput
                glass={inputGlass}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                leading={<IconSearch style={{ fontSize: 16, color: '#93c5fd' }} />}
                style={{ width: 280 }}
              />
            </div>

            <div className="component-card-controls">
              <div style={{ display: 'flex', gap: 4 }}>
                {(['frosted', 'soft', 'clear', 'dark'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setInputGlass(preset)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--lq-border)',
                      background: inputGlass === preset ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: inputGlass === preset ? '#fff' : 'var(--lq-text-muted)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="component-card-code">
              <code>{`<LiquidInput glass="${inputGlass}" leading={<SearchIcon />} placeholder="Search..." />`}</code>
              <button
                type="button"
                onClick={() =>
                  copyCode(
                    `<LiquidInput glass="${inputGlass}" leading={<IconSearch />} placeholder="Search..." />`,
                    'input',
                  )
                }
                className="code-copy-btn"
              >
                {copiedKey === 'input' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'input' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            7. LiquidModal
           ======================================================== */}
        {(filter === 'all' || filter === 'feedback') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidModal</h3>
                <p className="component-card-desc">
                  Accessible dialog on a glass panel with focus trapping and Escape key support.
                </p>
              </div>
              <LiquidPill statusColor="#06b6d4" glass="soft">
                Feedback
              </LiquidPill>
            </div>

            <div className="component-card-sandbox">
              <LiquidButton variant="primary" onClick={() => setModalOpen(true)}>
                Open Glass Modal
              </LiquidButton>

              <LiquidModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                ariaLabel="Showcase Dialog"
                glass="frosted"
              >
                <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#fff' }}>Glass Modal Dialog</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--lq-text-muted)' }}>
                  This modal renders real DOM children with a focus trap and accessible Escape key
                  dismissal.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <LiquidButton variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                    Cancel
                  </LiquidButton>
                  <LiquidButton variant="primary" size="sm" onClick={() => setModalOpen(false)}>
                    Confirm
                  </LiquidButton>
                </div>
              </LiquidModal>
            </div>

            <div className="component-card-controls">
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Wired via createPortal to document.body
              </span>
            </div>

            <div className="component-card-code">
              <code>{`<LiquidModal open={${modalOpen}} onClose={() => setOpen(false)} glass="frosted">...</LiquidModal>`}</code>
              <button
                type="button"
                onClick={() =>
                  copyCode(
                    `<LiquidModal open={open} onClose={() => setOpen(false)} glass="frosted">\n  <h2>Title</h2>\n</LiquidModal>`,
                    'modal',
                  )
                }
                className="code-copy-btn"
              >
                {copiedKey === 'modal' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'modal' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            8. LiquidPill
           ======================================================== */}
        {(filter === 'all' || filter === 'feedback') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidPill</h3>
                <p className="component-card-desc">
                  Compact glass pill for status indicators, tags, badges, and filters.
                </p>
              </div>
              <LiquidPill statusColor="#06b6d4" glass="soft">
                Feedback
              </LiquidPill>
            </div>

            <div className="component-card-sandbox" style={{ gap: 10 }}>
              <LiquidPill statusColor={pillColor} glass={pillGlass}>
                Active Status
              </LiquidPill>
              <LiquidPill statusColor="#38bdf8" glass="clear">
                v0.1 Release
              </LiquidPill>
              <LiquidPill statusColor="#a855f7" glass="dark">
                Dolby 96kHz
              </LiquidPill>
            </div>

            <div className="component-card-controls">
              <div style={{ display: 'flex', gap: 4 }}>
                {(['#34d399', '#38bdf8', '#f59e0b', '#ef4444', '#a855f7'] as const).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setPillColor(color)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: color,
                      border: pillColor === color ? '2px solid #fff' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: 4 }}>
                {(['soft', 'clear', 'frosted', 'dark'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPillGlass(preset)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--lq-border)',
                      background: pillGlass === preset ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: pillGlass === preset ? '#fff' : 'var(--lq-text-muted)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="component-card-code">
              <code>{`<LiquidPill statusColor="${pillColor}" glass="${pillGlass}">Active Status</LiquidPill>`}</code>
              <button
                type="button"
                onClick={() =>
                  copyCode(
                    `<LiquidPill statusColor="${pillColor}" glass="${pillGlass}">Active</LiquidPill>`,
                    'pill',
                  )
                }
                className="code-copy-btn"
              >
                {copiedKey === 'pill' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'pill' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            9. LiquidToggle
           ======================================================== */}
        {(filter === 'all' || filter === 'forms') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidToggle</h3>
                <p className="component-card-desc">
                  Accessible switch (`role=&quot;switch&quot;`) with a spring-driven thumb and glass track.
                </p>
              </div>
              <LiquidPill statusColor="#f59e0b" glass="soft">
                Forms
              </LiquidPill>
            </div>

            <div className="component-card-sandbox" style={{ gap: 16 }}>
              <LiquidToggle
                checked={toggleChecked}
                onCheckedChange={setToggleChecked}
                glass={toggleGlass}
                width={56}
                aria-label="Toggle setting"
              />
              <span style={{ fontSize: 13, color: '#fff' }}>
                {toggleChecked ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="component-card-controls">
              <div style={{ display: 'flex', gap: 4 }}>
                {(['soft', 'clear', 'frosted', 'dark'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setToggleGlass(preset)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--lq-border)',
                      background: toggleGlass === preset ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: toggleGlass === preset ? '#fff' : 'var(--lq-text-muted)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="component-card-code">
              <code>{`<LiquidToggle checked={${toggleChecked}} onCheckedChange={setChecked} glass="${toggleGlass}" aria-label="Feature" />`}</code>
              <button
                type="button"
                onClick={() =>
                  copyCode(
                    `<LiquidToggle checked={checked} onCheckedChange={setChecked} glass="${toggleGlass}" aria-label="Feature" />`,
                    'toggle',
                  )
                }
                className="code-copy-btn"
              >
                {copiedKey === 'toggle' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'toggle' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            10. LiquidTooltip
           ======================================================== */}
        {(filter === 'all' || filter === 'feedback') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidTooltip</h3>
                <p className="component-card-desc">
                  Accessible hover &amp; focus tooltip wired with aria-describedby.
                </p>
              </div>
              <LiquidPill statusColor="#06b6d4" glass="soft">
                Feedback
              </LiquidPill>
            </div>

            <div className="component-card-sandbox" style={{ gap: 14 }}>
              <LiquidTooltip content="Export configuration" side={tooltipSide}>
                <LiquidIconButton aria-label="Export" glass="soft">
                  <IconExternalLink style={{ fontSize: 18 }} />
                </LiquidIconButton>
              </LiquidTooltip>

              <LiquidTooltip content="Tune optical shaders" side={tooltipSide}>
                <LiquidIconButton aria-label="Tune" glass="clear">
                  <IconSliders style={{ fontSize: 18 }} />
                </LiquidIconButton>
              </LiquidTooltip>
            </div>

            <div className="component-card-controls">
              <div style={{ display: 'flex', gap: 4 }}>
                {(['top', 'bottom'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTooltipSide(s)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--lq-border)',
                      background: tooltipSide === s ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: tooltipSide === s ? '#fff' : 'var(--lq-text-muted)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    Side: {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="component-card-code">
              <code>{`<LiquidTooltip content="Settings" side="${tooltipSide}">\n  <LiquidIconButton aria-label="Settings"><SettingsIcon /></LiquidIconButton>\n</LiquidTooltip>`}</code>
              <button
                type="button"
                onClick={() =>
                  copyCode(
                    `<LiquidTooltip content="Settings" side="${tooltipSide}">\n  <LiquidIconButton aria-label="Settings"><IconSettings /></LiquidIconButton>\n</LiquidTooltip>`,
                    'tip',
                  )
                }
                className="code-copy-btn"
              >
                {copiedKey === 'tip' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'tip' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            11. LiquidBlob & LiquidBlobShape
           ======================================================== */}
        {(filter === 'all' || filter === 'organic') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidBlob &amp; LiquidBlobShape</h3>
                <p className="component-card-desc">
                  SDF smooth-min organic metaball merging calculated in GPU fragment shaders.
                </p>
              </div>
              <LiquidPill statusColor="#ec4899" glass="soft">
                Organic
              </LiquidPill>
            </div>

            <div className="component-card-sandbox">
              <LiquidBlob
                merge={blobMerge}
                style={{ position: 'relative', width: 240, height: 120 }}
              >
                <LiquidBlobShape x={20} y={20} width={80} height={80} radius={40} />
                <LiquidBlobShape x={90} y={35} width={70} height={70} radius={35} />
                <LiquidBlobShape x={150} y={15} width={80} height={80} radius={40} />
              </LiquidBlob>
            </div>

            <div className="component-card-controls">
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Merge Rate: {blobMerge.toFixed(2)}</span>
              <input
                type="range"
                min="0.02"
                max="0.2"
                step="0.01"
                value={blobMerge}
                onChange={(e) => setBlobMerge(parseFloat(e.target.value))}
                style={{ width: 100 }}
              />
            </div>

            <div className="component-card-code">
              <code>{`<LiquidBlob merge={${blobMerge.toFixed(2)}}>\n  <LiquidBlobShape x={20} y={20} width={80} height={80} />\n</LiquidBlob>`}</code>
              <button
                type="button"
                onClick={() =>
                  copyCode(
                    `<LiquidBlob merge={${blobMerge.toFixed(2)}}>\n  <LiquidBlobShape x={20} y={20} width={80} height={80} radius={40} />\n</LiquidBlob>`,
                    'blob',
                  )
                }
                className="code-copy-btn"
              >
                {copiedKey === 'blob' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'blob' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            12. LiquidSurface
           ======================================================== */}
        {(filter === 'all' || filter === 'surfaces') && (
          <div className="component-catalog-card">
            <div className="component-card-header">
              <div>
                <h3 className="component-card-title">LiquidSurface</h3>
                <p className="component-card-desc">
                  Core polymorphic foundation backing every component in the system.
                </p>
              </div>
              <LiquidPill statusColor="#10b981" glass="soft">
                Surface Primitive
              </LiquidPill>
            </div>

            <div className="component-card-sandbox">
              <LiquidSurface
                as={surfaceAs}
                glass="clear"
                radius={18}
                interaction={{ hover: true, press: true, strength: 0.15 }}
                style={{ padding: '12px 24px', color: '#fff', fontWeight: 600 }}
              >
                Polymorphic Surface ({surfaceAs})
              </LiquidSurface>
            </div>

            <div className="component-card-controls">
              <div style={{ display: 'flex', gap: 4 }}>
                {(['div', 'button'] as const).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSurfaceAs(tag)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--lq-border)',
                      background: surfaceAs === tag ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: surfaceAs === tag ? '#fff' : 'var(--lq-text-muted)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    as=&quot;{tag}&quot;
                  </button>
                ))}
              </div>
            </div>

            <div className="component-card-code">
              <code>{`<LiquidSurface as="${surfaceAs}" glass="clear" radius={18}>Content</LiquidSurface>`}</code>
              <button
                type="button"
                onClick={() =>
                  copyCode(
                    `<LiquidSurface as="${surfaceAs}" glass="clear" radius={18}>Content</LiquidSurface>`,
                    'surface',
                  )
                }
                className="code-copy-btn"
              >
                {copiedKey === 'surface' ? <IconCheck style={{ color: '#34d399' }} /> : <IconCopy />}
                <span>{copiedKey === 'surface' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
