import { useState, useEffect } from 'react';
import { IconGitHub, IconSparkles, IconExternalLink } from './Icons';

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'hero', label: 'Overview' },
  { id: 'materials', label: 'Materials' },
  { id: 'scenes', label: 'Scenes' },
  { id: 'interactions', label: 'Physics' },
  { id: 'dock', label: 'Dock' },
  { id: 'blobs', label: 'Metaballs' },
  { id: 'depth', label: 'Composition' },
  { id: 'app', label: 'Interface' },
  { id: 'components', label: 'Components' },
  { id: 'engineering', label: 'Engineering' },
];

export function HeaderNav() {
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_ITEMS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header className="showcase-header">
      <nav className="header-glass-bar" aria-label="Showcase Navigation">
        <a href="#hero" className="header-brand" onClick={(e) => scrollToSection(e, 'hero')}>
          <div className="brand-icon">
            <IconSparkles style={{ fontSize: 16, color: '#fff' }} />
          </div>
          <span className="brand-title">Liquid UI</span>
          <span className="brand-badge">v0.1</span>
        </a>

        <div className="header-nav-links">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`nav-link-btn ${isActive ? 'is-active' : ''}`}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <div className="header-actions">
          <a href="/docs.html" className="header-action-btn btn-docs" title="Documentation">
            <span>Docs</span>
            <IconExternalLink style={{ fontSize: 13 }} />
          </a>
          <a href="/studio.html" className="header-action-btn btn-docs" title="Shader Studio">
            <span>Studio</span>
          </a>
          <a
            href="https://github.com/Sus69/liquid-glass-studio"
            target="_blank"
            rel="noreferrer"
            className="header-action-btn btn-github"
            title="GitHub Repository"
          >
            <IconGitHub style={{ fontSize: 14 }} />
            <span>GitHub</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
