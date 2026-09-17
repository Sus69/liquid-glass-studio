import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LiquidProvider, type EngineBgType } from 'liquid-ui';
import { Showcase } from './Showcase';
import bgTahoe from '../assets/bg-tahoe-light.webp';
import bgVideo from '../assets/bg-video-fish.mp4';

const params = new URLSearchParams(window.location.search);
const bgParam = params.get('bg');
const backendParam = params.get('backend');

const background: EngineBgType | undefined =
  bgParam === 'photo'
    ? { kind: 'image', url: bgTahoe }
    : bgParam === 'video'
      ? { kind: 'video', url: bgVideo }
      : undefined;

const backdropMode = bgParam === 'photo' || bgParam === 'video' ? 'textured' : 'dom';
const backend = backendParam === 'webgl' || backendParam === 'webgpu' ? backendParam : 'auto';
const debugReadback = params.get('debugReadback') === '1';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiquidProvider
      backdropMode={backdropMode}
      background={background}
      maxDpr={2}
      backend={backend}
      debugPreserveDrawingBuffer={debugReadback}
    >
      <Showcase textured={backdropMode === 'textured'} />
    </LiquidProvider>
  </StrictMode>,
);
