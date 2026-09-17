import { useState, useEffect } from 'react';
import { DocsSidebar } from './DocsSidebar';
import { DocsContent } from './DocsContent';
import { navigation } from './docsData';
import './docs.scss';

export function DocsApp() {
  // Read path from location.hash or default to introduction/index.md
  const [currentPath, setCurrentPath] = useState(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || 'introduction/index.md';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) setCurrentPath(hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="docs-app">
      <header className="docs-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            className="docs-copy-btn"
            style={{ display: 'block' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <a
            href="#introduction/index.md"
            className="docs-brand"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('introduction/index.md');
            }}
          >
            <span>Liquid UI</span>
            <span className="docs-brand-badge">v{navigation.version}</span>
          </a>
        </div>

        <nav className="docs-nav-links">
          <a href="/studio.html" className="docs-nav-pill docs-nav-pill-studio" title="Interactive Shader & Physics Studio">
            <span className="docs-nav-icon">🎛️</span>
            <span className="docs-nav-label">Liquid Studio</span>
          </a>
          <a href="/showcase.html" className="docs-nav-pill docs-nav-pill-showcase" title="Interactive Component Catalog">
            <span className="docs-nav-icon">🧩</span>
            <span className="docs-nav-label">UI Showcase</span>
          </a>
          <a href="/mock.html" className="docs-nav-pill docs-nav-pill-mock" title="Prism Glass Music Player Demo">
            <span className="docs-nav-icon">🎵</span>
            <span className="docs-nav-label">Mock UI</span>
          </a>
          <span className="docs-nav-separator" />
          <a
            href="https://www.npmjs.com/package/@sus_69/liquid-ui"
            className="docs-nav-link docs-nav-ext"
            target="_blank"
            rel="noreferrer"
            title="View on npm"
          >
            <span>npm</span> <span className="docs-nav-arrow">↗</span>
          </a>
          <a
            href="https://github.com/Sus69/liquid-glass-studio"
            className="docs-nav-link docs-nav-ext"
            target="_blank"
            rel="noreferrer"
            title="GitHub Repository"
          >
            <span>GitHub</span> <span className="docs-nav-arrow">↗</span>
          </a>
        </nav>
      </header>

      <div className="docs-container">
        <DocsSidebar
          currentPath={currentPath}
          onSelectPath={handleNavigate}
          isOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />
        <DocsContent currentPath={currentPath} onNavigate={handleNavigate} />
      </div>
    </div>
  );
}
