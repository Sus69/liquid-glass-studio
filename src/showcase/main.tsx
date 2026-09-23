import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LiquidProvider } from 'liquid-ui';
import { Showcase } from './Showcase';
import './showcase.scss';

const params = new URLSearchParams(window.location.search);
const backendParam = params.get('backend');
const backend = backendParam === 'webgl' || backendParam === 'webgpu' ? backendParam : 'auto';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiquidProvider
      backdropMode="dom"
      maxDpr={2}
      backend={backend}
    >
      <Showcase />
    </LiquidProvider>
  </StrictMode>,
);
