import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LiquidProvider, type EngineBgType } from 'liquid-ui';
import { PrismApp } from './PrismApp';
import bgTahoe from '../assets/bg-tahoe-light.webp';
import bgVideo from '../assets/bg-video-fish.mp4';

/*
 * Prism mock — MAX MATERIAL build.
 *
 * Textured mode by default so refraction/dispersion have a real GPU backdrop
 * to bend. `?dom=1` falls back to DOM mode over a dark wallpaper.
 */

const params = new URLSearchParams(window.location.search);
const domMode = params.get('dom') === '1';
const useVideo = params.get('bg') === 'video';

const background: EngineBgType | undefined = domMode
  ? undefined
  : useVideo
    ? { kind: 'video', url: bgVideo }
    : { kind: 'image', url: bgTahoe };

// Kill the CSS `backdrop-filter` on every liquid surface — the user wants the
// GPU material only (no interior CSS blur anywhere, tooltip/modal included).
const noCssBlur = document.createElement('style');
noCssBlur.textContent =
  '.liquid-ui-surface{-webkit-backdrop-filter:none !important;backdrop-filter:none !important;}';
document.head.appendChild(noCssBlur);

const backendParam = params.get('backend');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiquidProvider
      backdropMode={domMode ? 'dom' : 'textured'}
      background={background}
      maxDpr={2}
      backend={backendParam === 'webgl' || backendParam === 'webgpu' ? backendParam : 'auto'}
      debugPreserveDrawingBuffer={params.get('readback') === '1'}
    >
      <PrismApp wallpaper={domMode} dark={useVideo || domMode} />
    </LiquidProvider>
  </StrictMode>,
);
