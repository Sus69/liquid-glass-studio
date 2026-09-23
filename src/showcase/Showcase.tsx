import { HeaderNav } from './components/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { MaterialLabSection } from './components/MaterialLabSection';
import { ScenesSection } from './components/ScenesSection';
import { InteractionsSection } from './components/InteractionsSection';
import { DockSection } from './components/DockSection';
import { BlobsSection } from './components/BlobsSection';
import { NestedGlassSection } from './components/NestedGlassSection';
import { AppShowcaseSection } from './components/AppShowcaseSection';
import { ComponentIndexSection } from './components/ComponentIndexSection';
import { EngineeringSection } from './components/EngineeringSection';
import { LiquidPill } from 'liquid-ui';
import { IconSparkles, IconGitHub, IconExternalLink } from './components/Icons';

export function Showcase() {
  return (
    <div className="showcase-root">
      {/* Floating Navigation Header */}
      <HeaderNav />

      {/* Main Showcase Chapters Container */}
      <main className="showcase-main">
        {/* Chapter 1: Hero — "Liquid, not glass." */}
        <HeroSection />

        {/* Chapter 2: Material Laboratory */}
        <MaterialLabSection />

        {/* Chapter 3: Components in Context */}
        <ScenesSection />

        {/* Chapter 4: Interaction Laboratory */}
        <InteractionsSection />

        {/* Chapter 5: The Liquid Dock */}
        <DockSection />

        {/* Chapter 6: Organic Liquid & Metaballs */}
        <BlobsSection />

        {/* Chapter 7: Nested Glass & Depth Hierarchy */}
        <NestedGlassSection />

        {/* Chapter 8: Real Application Experience */}
        <AppShowcaseSection />

        {/* Chapter 9: Exhaustive Component Index */}
        <ComponentIndexSection />

        {/* Chapter 10: Accessibility & Engineering Specs */}
        <EngineeringSection />

        {/* Showcase Footer */}
        <footer className="showcase-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-icon" style={{ width: 32, height: 32 }}>
              <IconSparkles style={{ fontSize: 18, color: '#fff' }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Liquid UI</span>
            <LiquidPill statusColor="#34d399" glass="soft">
              v0.1 Release
            </LiquidPill>
          </div>

          <p style={{ margin: 0, fontSize: 14, color: 'var(--lq-text-muted)', maxWidth: 540 }}>
            A GPU-powered React liquid-glass component system engineered with Snell&apos;s law optics,
            hardware-accelerated WebGL2 / WebGPU pipelines, and accessible DOM elements.
          </p>

          <div className="footer-links">
            <a href="/docs.html" className="footer-link">
              Documentation
            </a>
            <span style={{ color: 'var(--lq-border-bright)' }}>&bull;</span>
            <a href="/studio.html" className="footer-link">
              Interactive Shader Studio
            </a>
            <span style={{ color: 'var(--lq-border-bright)' }}>&bull;</span>
            <a
              href="https://github.com/Sus69/liquid-glass-studio"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              GitHub Repository
            </a>
          </div>

          <div className="footer-copy">
            &copy; 2026 Liquid UI &bull; Apache-2.0 License &bull; Designed &amp; Engineered with Physical Optics.
          </div>
        </footer>
      </main>
    </div>
  );
}
