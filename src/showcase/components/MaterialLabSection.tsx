import { useState, useMemo } from 'react';
import {
  LiquidButton,
  LiquidCard,
  LiquidDiv,
  LiquidIconButton,
  LiquidPill,
  LiquidToggle,
  LiquidTooltip,
  LIQUID_PRESETS,
  type LiquidPresetName,
  type LiquidMaterialOverride,
} from 'liquid-ui';
import { ShowcaseStage } from './ShowcaseStage';
import {
  IconSparkles,
  IconEye,
  IconZap,
  IconSettings,
  IconVolume,
  IconSliders,
  IconRefresh,
} from './Icons';

interface PresetInfo {
  name: LiquidPresetName;
  label: string;
  sub: string;
  description: string;
  opticalClass: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAX';
}

const PRESET_INFOS: PresetInfo[] = [
  {
    name: 'soft',
    label: 'Soft',
    sub: 'Subtle & Air-Light',
    description: 'Barely-there liquid glass with gentle edge highlights and light Gaussian diffusion.',
    opticalClass: 'LOW',
  },
  {
    name: 'clear',
    label: 'Clear',
    sub: 'Pure Optical Crystal',
    description: 'Maximum refractive index (&eta; = 1.50) with heavy Cauchy dispersion (10.0) and pristine clarity.',
    opticalClass: 'MAX',
  },
  {
    name: 'frosted',
    label: 'Frosted',
    sub: 'Milky Gaussian Veil',
    description: 'Heavy 12px Gaussian backdrop blur with smooth edge diffusion and translucent milk tint.',
    opticalClass: 'MEDIUM',
  },
  {
    name: 'strong',
    label: 'Strong',
    sub: 'Studio Signature',
    description: 'High-contrast refractive rim, specular LCH glare bands, and physical chromatic splitting.',
    opticalClass: 'HIGH',
  },
  {
    name: 'dark',
    label: 'Dark',
    sub: 'Smoked Obsidian',
    description: 'Deep tinted smoke veil over high-refraction optical glass for rich dark mode aesthetics.',
    opticalClass: 'HIGH',
  },
];

export function MaterialLabSection() {
  const [activePreset, setActivePreset] = useState<LiquidPresetName>('strong');
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [toggleState, setToggleState] = useState<boolean>(true);

  // Custom material overrides
  const [thickness, setThickness] = useState<number>(20);
  const [refraction, setRefraction] = useState<number>(1.4);
  const [dispersion, setDispersion] = useState<number>(7);
  const [blur, setBlur] = useState<number>(1);
  const [fresnel, setFresnel] = useState<number>(0.2);
  const [glare, setGlare] = useState<number>(0.9);

  const baseMaterial = LIQUID_PRESETS[activePreset];

  const effectiveGlass: LiquidPresetName | LiquidMaterialOverride = useMemo(() => {
    if (!customMode) return activePreset;
    return {
      ...baseMaterial,
      thickness,
      refraction,
      dispersion,
      blur,
      fresnel,
      glare,
    };
  }, [customMode, activePreset, baseMaterial, thickness, refraction, dispersion, blur, fresnel, glare]);

  const activeInfo = PRESET_INFOS.find((p) => p.name === activePreset) || PRESET_INFOS[3];

  const handlePresetSelect = (preset: LiquidPresetName) => {
    setActivePreset(preset);
    const m = LIQUID_PRESETS[preset];
    setThickness(m.thickness);
    setRefraction(m.refraction);
    setDispersion(m.dispersion);
    setBlur(m.blur);
    setFresnel(m.fresnel);
    setGlare(m.glare);
  };

  return (
    <section id="materials" className="section-wrapper">
      <div className="section-header">
        <div className="micro-label">02 // OPTICAL LABORATORY</div>
        <h2 className="section-title">Material Laboratory</h2>
        <p className="section-description">
          The same interface geometry viewed through five distinct physical materials. Each preset
          recomputes Snell&apos;s law refraction, Cauchy chromatic dispersion, Fresnel rim falloff, and
          two-pass Gaussian blur.
        </p>
      </div>

      {/* Preset Selector Tabs */}
      <div className="material-preset-tabs">
        {PRESET_INFOS.map((p) => {
          const isSelected = activePreset === p.name;
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => handlePresetSelect(p.name)}
              className={`material-preset-tab ${isSelected ? 'is-active' : ''}`}
            >
              <span className="preset-name">{p.label}</span>
              <span className="preset-sub">{p.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Laboratory Stage */}
      <ShowcaseStage
        defaultBackdrop="text-grid"
        defaultBackdropMode="textured"
        stageTag="OPTICAL TEST BENCH"
        stageTitle={`MATERIAL / ${activePreset.toUpperCase()}`}
        minHeight={580}
      >
        <div className="material-lab-layout">
          {/* Left: The Optical Target Composition */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            {/* Main Test Glass Surface */}
            <LiquidCard
              glass={effectiveGlass}
              interactive
              radius={24}
              style={{
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                color: activePreset === 'dark' ? '#fff' : 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <LiquidPill statusColor="#38bdf8" glass={effectiveGlass}>
                    MATERIAL / {customMode ? 'CUSTOM LAB' : activePreset.toUpperCase()}
                  </LiquidPill>
                  <LiquidPill statusColor="#34d399" glass={effectiveGlass}>
                    REFRACTION / {activeInfo.opticalClass}
                  </LiquidPill>
                </div>
                <LiquidTooltip content="Active light response sensor">
                  <LiquidPill statusColor="#a855f7" glass={effectiveGlass} style={{ fontSize: 10 }}>
                    LIGHT RESPONSE / ACTIVE
                  </LiquidPill>
                </LiquidTooltip>
              </div>

              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800 }}>
                  Optical Bench Specification
                </h3>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.85, lineHeight: 1.6 }}>
                  {activeInfo.description} Move your cursor across the boundary to observe how the
                  high-frequency background behind the surface bends and splits into rainbow RGB
                  fringes.
                </p>
              </div>

              {/* Nested UI Elements inside the test surface */}
              <LiquidDiv
                glass={effectiveGlass}
                radius={16}
                padding={16}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IconZap style={{ color: '#f59e0b', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Photon Transmission</div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Physical ray displacement</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <LiquidToggle
                    checked={toggleState}
                    onCheckedChange={setToggleState}
                    glass={effectiveGlass}
                    aria-label="Toggle photon transmission"
                  />
                  <LiquidButton size="sm" variant="primary" glass={effectiveGlass}>
                    Execute
                  </LiquidButton>
                </div>
              </LiquidDiv>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <LiquidIconButton aria-label="Inspect" glass={effectiveGlass} size={38}>
                    <IconEye style={{ fontSize: 16 }} />
                  </LiquidIconButton>
                  <LiquidIconButton aria-label="Settings" glass={effectiveGlass} size={38}>
                    <IconSettings style={{ fontSize: 16 }} />
                  </LiquidIconButton>
                  <LiquidIconButton aria-label="Volume" glass={effectiveGlass} size={38}>
                    <IconVolume style={{ fontSize: 16 }} />
                  </LiquidIconButton>
                </div>

                <LiquidButton
                  size="sm"
                  variant="secondary"
                  glass={effectiveGlass}
                  onClick={() => setCustomMode(!customMode)}
                >
                  <IconSliders style={{ fontSize: 14 }} />
                  <span>{customMode ? 'Reset Presets' : 'Tune Parameters'}</span>
                </LiquidButton>
              </div>
            </LiquidCard>
          </div>

          {/* Right: Technical Annotation & Telemetry Panel */}
          <div className="material-spec-panel">
            <div className="material-spec-title">
              <span>SHADER UNIFORMS (GLSL / WGSL)</span>
              <span style={{ color: '#38bdf8' }}>FBO PASS 04</span>
            </div>

            <div className="material-uniform-grid">
              <div className="uniform-item">
                <span className="uniform-key">u_refFactor (&eta;)</span>
                <span className="uniform-val">
                  {customMode ? refraction.toFixed(2) : baseMaterial.refraction.toFixed(2)}
                </span>
              </div>
              <div className="uniform-item">
                <span className="uniform-key">u_refDispersion</span>
                <span className="uniform-val">
                  {customMode ? dispersion.toFixed(1) : baseMaterial.dispersion.toFixed(1)}
                </span>
              </div>
              <div className="uniform-item">
                <span className="uniform-key">u_refThickness</span>
                <span className="uniform-val">
                  {customMode ? `${thickness}px` : `${baseMaterial.thickness}px`}
                </span>
              </div>
              <div className="uniform-item">
                <span className="uniform-key">u_blurRadius</span>
                <span className="uniform-val">
                  {customMode ? `${blur}px` : `${baseMaterial.blur}px`}
                </span>
              </div>
              <div className="uniform-item">
                <span className="uniform-key">u_refFresnelFactor</span>
                <span className="uniform-val">
                  {customMode ? fresnel.toFixed(2) : baseMaterial.fresnel.toFixed(2)}
                </span>
              </div>
              <div className="uniform-item">
                <span className="uniform-key">u_glareFactor</span>
                <span className="uniform-val">
                  {customMode ? glare.toFixed(2) : baseMaterial.glare.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Custom Parameter Sliders */}
            {customMode && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--lq-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span>Refraction Index (&eta;): {refraction.toFixed(2)}</span>
                  <input
                    type="range"
                    min="1.0"
                    max="2.0"
                    step="0.05"
                    value={refraction}
                    onChange={(e) => setRefraction(parseFloat(e.target.value))}
                    style={{ width: 110 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span>Dispersion (Abbe): {dispersion.toFixed(1)}</span>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={dispersion}
                    onChange={(e) => setDispersion(parseFloat(e.target.value))}
                    style={{ width: 110 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span>Thickness: {thickness}px</span>
                  <input
                    type="range"
                    min="4"
                    max="40"
                    step="1"
                    value={thickness}
                    onChange={(e) => setThickness(parseInt(e.target.value, 10))}
                    style={{ width: 110 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span>Backdrop Blur: {blur}px</span>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={blur}
                    onChange={(e) => setBlur(parseInt(e.target.value, 10))}
                    style={{ width: 110 }}
                  />
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: '#64748b',
                lineHeight: 1.5,
                borderTop: '1px solid var(--lq-border)',
                paddingTop: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8' }}>
                <IconSparkles style={{ fontSize: 14 }} />
                <span style={{ fontWeight: 700 }}>SNELL&apos;S LAW EQUATION:</span>
              </div>
              <code style={{ display: 'block', marginTop: 4, color: '#94a3b8' }}>
                &theta;T = asin(1.0 / &eta; &times; sin(&theta;I))
              </code>
            </div>
          </div>
        </div>
      </ShowcaseStage>
    </section>
  );
}
