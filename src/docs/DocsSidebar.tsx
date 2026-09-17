import { useState, useMemo } from 'react';
import { navigation, type DocItem } from './docsData';

interface DocsSidebarProps {
  currentPath: string;
  onSelectPath: (path: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export function DocsSidebar({
  currentPath,
  onSelectPath,
  isOpen,
  onCloseMobile,
}: DocsSidebarProps) {
  const [search, setSearch] = useState('');

  const filteredSections = useMemo(() => {
    if (!search.trim()) return navigation.sections;
    const q = search.toLowerCase();
    return navigation.sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q) ||
            item.type.toLowerCase().includes(q),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [search]);

  return (
    <aside className={`docs-sidebar${isOpen ? ' open' : ''}`}>
      <div className="docs-search-box">
        <span className="docs-search-icon">🔍</span>
        <input
          type="text"
          className="docs-search-input"
          placeholder="Search documentation…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <nav>
        {filteredSections.map((section) => (
          <div key={section.id} className="docs-section">
            <div className="docs-section-title">{section.title}</div>
            <ul className="docs-item-list">
              {section.items.map((item: DocItem) => {
                const isActive = item.path === currentPath;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.path}`}
                      className={`docs-item-link${isActive ? ' active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectPath(item.path);
                        onCloseMobile();
                      }}
                    >
                      <span>{item.title}</span>
                      <span className="docs-item-type">{item.type}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
