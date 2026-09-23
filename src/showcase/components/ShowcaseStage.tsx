import { useState, useMemo, type ReactNode, type CSSProperties } from 'react';
import { LiquidProvider, type EngineBgType, type LiquidBackdropMode } from 'liquid-ui';
import type { ShowcaseBackdropKind, BackdropOption } from '../types';
import bgTahoeLight from '../../assets/bg-tahoe-light.webp';
import bgTahoeDark from '../../assets/bg-tahoe-dark.webp';
import bgVideoFish from '../../assets/bg-video-fish.mp4';
import bgText from '../../assets/bg-text.jpg';
import bgBuildings from '../../assets/bg-buildings.png';
import { IconImage, IconVideo, IconGrid, IconCpu, IconSparkles } from './Icons';

export const BACKDROP_OPTIONS: BackdropOption[] = [
  {
    id: 'tahoe-light',
    label: 'Tahoe Light',
    category: 'image',
    description: 'Mountain landscape with bright sky and deep water refraction.',
    url: bgTahoeLight,
  },
  {
    id: 'tahoe-dark',
    label: 'Tahoe Dark',
    category: 'image',
    description: 'Moody alpine atmosphere with high contrast specular edges.',
    url: bgTahoeDark,
  },
  {
    id: 'video-fish',
    label: 'Aquatic 4K',
    category: 'video',
    description: 'Dynamic swimming koi video displaying real-time refractive motion.',
    url: bgVideoFish,
  },
  {
    id: 'text-grid',
    label: 'Text Matrix',
    category: 'image',
    description: 'Dense typographical grid demonstrating chromatic Abbe dispersion.',
    url: bgText,
  },
  {
    id: 'buildings',
    label: 'Architecture',
    category: 'image',
    description: 'High-frequency structural geometry with sharp optical bending.',
    url: bgBuildings,
  },
  {
    id: 'procedural-grid',
    label: 'Procedural Grid',
    category: 'procedural',
    description: 'Engine-native GPU mathematical checkerboard for geometric inspection.',
    proceduralIndex: 0,
  },
];

export interface ShowcaseStageProps {
  children: ReactNode;
  /** Initial backdrop preset */
  defaultBackdrop?: ShowcaseBackdropKind;
  /** Initial backdrop mode */
  defaultBackdropMode?: LiquidBackdropMode;
  /** Whether to show the top toolbar with backdrop switches */
  showToolbar?: boolean;
  /** Custom stage title or micro-tag */
  stageTag?: string;
  stageTitle?: string;
  /** Stage min-height or custom inline styles */
  minHeight?: number | string;
  className?: string;
  style?: CSSProperties;
  /** Optional theme override */
  theme?: 'dark' | 'light' | 'auto';
  /** Extra toolbar actions */
  extraToolbar?: ReactNode;
}

export function ShowcaseStage({
  children,
  defaultBackdrop = 'tahoe-light',
  defaultBackdropMode = 'textured',
  showToolbar = true,
  stageTag,
  stageTitle,
  minHeight = 520,
  className = '',
  style,
  theme = 'dark',
  extraToolbar,
}: ShowcaseStageProps) {
  const [activeBackdrop, setActiveBackdrop] = useState<ShowcaseBackdropKind>(defaultBackdrop);
  const [backdropMode, setBackdropMode] = useState<LiquidBackdropMode>(defaultBackdropMode);

  const currentOption = useMemo(
    () => BACKDROP_OPTIONS.find((opt) => opt.id === activeBackdrop) || BACKDROP_OPTIONS[0],
    [activeBackdrop],
  );

  const background: EngineBgType | undefined = useMemo(() => {
    if (backdropMode === 'dom') return undefined;
    if (currentOption.category === 'video' && currentOption.url) {
      return { kind: 'video', url: currentOption.url };
    }
    if (currentOption.category === 'procedural') {
      return { kind: 'procedural', index: currentOption.proceduralIndex ?? 0 };
    }
    if (currentOption.url) {
      return { kind: 'image', url: currentOption.url };
    }
    return { kind: 'image', url: bgTahoeLight };
  }, [backdropMode, currentOption]);

  return (
    <div
      className={`showcase-stage-container ${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${className}`}
      style={{ minHeight, ...style }}
    >
      {showToolbar && (
        <div className="showcase-stage-toolbar">
          <div className="stage-toolbar-left">
            {stageTag && <span className="stage-tag-badge">{stageTag}</span>}
            {stageTitle && <span className="stage-title-text">{stageTitle}</span>}
            <div className="stage-engine-indicator">
              <span className="engine-pulse-dot" />
              <span className="engine-label-text">
                {backdropMode === 'textured' ? 'GPU TEXTURED REFRACTION' : 'DOM COMPOSITING'}
              </span>
            </div>
          </div>

          <div className="stage-toolbar-right">
            {/* Backdrop Switcher */}
            <div className="stage-backdrop-pills">
              {BACKDROP_OPTIONS.map((opt) => {
                const isActive = activeBackdrop === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActiveBackdrop(opt.id)}
                    className={`stage-backdrop-pill ${isActive ? 'is-active' : ''}`}
                    title={opt.description}
                  >
                    {opt.category === 'video' ? (
                      <IconVideo className="pill-icon" />
                    ) : opt.category === 'procedural' ? (
                      <IconGrid className="pill-icon" />
                    ) : (
                      <IconImage className="pill-icon" />
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mode Switcher */}
            <div className="stage-mode-switch">
              <button
                type="button"
                onClick={() => setBackdropMode('textured')}
                className={`mode-btn ${backdropMode === 'textured' ? 'active' : ''}`}
                title="Full GPU ray refraction with dispersion and Snell's law"
              >
                <IconSparkles />
                <span>Textured</span>
              </button>
              <button
                type="button"
                onClick={() => setBackdropMode('dom')}
                className={`mode-btn ${backdropMode === 'dom' ? 'active' : ''}`}
                title="Hybrid DOM compositing over live page content"
              >
                <IconCpu />
                <span>DOM</span>
              </button>
            </div>

            {extraToolbar}
          </div>
        </div>
      )}

      {/* The LiquidProvider hosting the GPU Engine and WebGL2/WebGPU Canvas */}
      <LiquidProvider
        backdropMode={backdropMode}
        background={background}
        maxDpr={2}
        className="showcase-stage-provider"
      >
        <div className="showcase-stage-content">{children}</div>
      </LiquidProvider>
    </div>
  );
}
