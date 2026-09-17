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
          <a href="/showcase.html" className="docs-nav-link" target="_blank" rel="noreferrer">
            Showcase ↗
          </a>
          <a href="/mock.html" className="docs-nav-link" target="_blank" rel="noreferrer">
            Prism Mock ↗
          </a>
          <a href="/" className="docs-nav-link" target="_blank" rel="noreferrer">
            Studio Lab ↗
          </a>
          <a
            href="https://github.com/Sus69/liquid-glass-studio"
            className="docs-nav-link"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
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
