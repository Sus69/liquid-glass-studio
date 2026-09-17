import navigationData from '../../docs/navigation.json';

export interface DocItem {
  id: string;
  title: string;
  path: string;
  type: 'concept' | 'guide' | 'component' | 'reference' | 'advanced';
}

export interface DocSection {
  id: string;
  title: string;
  items: DocItem[];
}

export interface NavigationManifest {
  name: string;
  version: string;
  sections: DocSection[];
}

export const navigation: NavigationManifest = navigationData as NavigationManifest;

// Load all markdown files at build time
const rawDocs = import.meta.glob('../../docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Normalize map keyed by relative path (e.g. "introduction/index.md")
export const docsContentMap: Record<string, string> = {};

for (const [key, content] of Object.entries(rawDocs)) {
  // Key format is like "../../docs/introduction/index.md"
  const normalizedPath = key.replace(/^\.\.\/\.\.\/docs\//, '');
  docsContentMap[normalizedPath] = content;
}

// Flat list of all items for search and previous/next navigation
export const allDocItems: DocItem[] = navigation.sections.flatMap((s) => s.items);

export function findDocItemByPath(path: string): DocItem | undefined {
  return allDocItems.find((item) => item.path === path || item.id === path);
}

export function getDocItemIndex(path: string): number {
  return allDocItems.findIndex((item) => item.path === path || item.id === path);
}
