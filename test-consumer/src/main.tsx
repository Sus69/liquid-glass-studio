import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  LiquidProvider,
  LiquidSurface,
  LiquidButton,
  LiquidCard,
  LiquidPill,
  LiquidInput,
  LiquidToggle,
  LiquidModal,
  LiquidDock,
  LiquidDockItem,
  LiquidBlob,
  LiquidBlobShape,
  resolveMaterial,
  useLiquidContext,
} from 'liquid-ui';
import 'liquid-ui/styles.css';

function TestApp() {
  const [toggle, setToggle] = useState(false);
  const [inputVal, setInputVal] = useState('Consumer test string');
  const [modalOpen, setModalOpen] = useState(false);

  const customMaterial = resolveMaterial({
    refraction: 1.4,
    blur: 16,
    dispersion: 1.2,
  });

  return (
    <LiquidProvider backdropMode="dom">
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h1>Consumer App Verification</h1>

        <LiquidCard glass="frosted" radius={24} style={{ marginBottom: 20 }}>
          <h2>Card Title</h2>
          <p>Testing liquid card and custom material resolution.</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
            <LiquidPill statusColor="#10b981">Status: Active</LiquidPill>
            <LiquidButton variant="primary" onClick={() => setModalOpen(true)}>
              Open Modal
            </LiquidButton>
            <LiquidToggle checked={toggle} onCheckedChange={setToggle} aria-label="Toggle setting" />
          </div>
        </LiquidCard>

        <LiquidSurface as="section" glass={customMaterial} radius={18} style={{ padding: 20, marginBottom: 20 }}>
          <h3>Form Field Test</h3>
          <LiquidInput
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type here..."
          />
        </LiquidSurface>

        <div style={{ marginBottom: 20 }}>
          <LiquidDock>
            <LiquidDockItem aria-label="Item 1">🚀</LiquidDockItem>
            <LiquidDockItem aria-label="Item 2">⚙️</LiquidDockItem>
            <LiquidDockItem aria-label="Item 3">✨</LiquidDockItem>
          </LiquidDock>
        </div>

        <LiquidBlob merge={0.12} style={{ position: 'relative', width: 300, height: 120 }}>
          <LiquidBlobShape x={20} y={20} width={80} height={80} radius={40} />
          <LiquidBlobShape x={70} y={20} width={70} height={70} radius={35} />
        </LiquidBlob>

        <LiquidModal open={modalOpen} onClose={() => setModalOpen(false)} ariaLabel="Consumer Modal Test">
          <div style={{ padding: 24 }}>
            <h3>Modal Dialog Loaded</h3>
            <p>Verification of focus trap and modal surface.</p>
            <LiquidButton onClick={() => setModalOpen(false)}>Close</LiquidButton>
          </div>
        </LiquidModal>
      </div>
    </LiquidProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
