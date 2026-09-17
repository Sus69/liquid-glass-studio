import { useState, useMemo } from 'react';
import { allDocItems, docsContentMap, getDocItemIndex, type DocItem } from './docsData';

interface DocsContentProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface ParsedDoc {
  frontmatter: Record<string, string>;
  markdown: string;
}

function parseMarkdownDoc(raw: string): ParsedDoc {
  if (!raw) {
    return { frontmatter: {}, markdown: '# 404 - Document Not Found\n\nThe requested document does not exist.' };
  }

  // Check for frontmatter delimited by ---
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, markdown: raw };
  }

  const yamlBlock = match[1];
  const markdown = match[2];
  const frontmatter: Record<string, string> = {};

  for (const line of yamlBlock.split(/\r?\n/)) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim();
      const val = line.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
      frontmatter[key] = val;
    }
  }

  return { frontmatter, markdown };
}

export function DocsContent({ currentPath, onNavigate }: DocsContentProps) {
  const rawContent = docsContentMap[currentPath] || '';
  const { frontmatter, markdown } = useMemo(() => parseMarkdownDoc(rawContent), [rawContent]);

  const currentIndex = getDocItemIndex(currentPath);
  const prevItem: DocItem | undefined = currentIndex > 0 ? allDocItems[currentIndex - 1] : undefined;
  const nextItem: DocItem | undefined =
    currentIndex >= 0 && currentIndex < allDocItems.length - 1 ? allDocItems[currentIndex + 1] : undefined;

  const pathParts = currentPath.split('/');
  const sectionName = pathParts[0].replace('-', ' ');

  return (
    <main className="docs-content-wrapper">
      <article className="docs-article">
        <div className="docs-breadcrumbs">
          <a
            href="#introduction/index.md"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('introduction/index.md');
            }}
          >
            Docs
          </a>
          <span>/</span>
          <span style={{ textTransform: 'capitalize' }}>{sectionName}</span>
          <span>/</span>
          <span>{frontmatter.title || currentPath}</span>
        </div>

        <MarkdownRenderer content={markdown} onNavigate={onNavigate} />

        <div className="docs-page-nav">
          {prevItem ? (
            <a
              href={`#${prevItem.path}`}
              className="docs-page-nav-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(prevItem.path);
              }}
            >
              <span className="docs-page-nav-hint">← Previous</span>
              <span className="docs-page-nav-title">{prevItem.title}</span>
            </a>
          ) : (
            <div />
          )}

          {nextItem ? (
            <a
              href={`#${nextItem.path}`}
              className="docs-page-nav-link"
              style={{ textAlign: 'right' }}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(nextItem.path);
              }}
            >
              <span className="docs-page-nav-hint">Next →</span>
              <span className="docs-page-nav-title">{nextItem.title}</span>
            </a>
          ) : null}
        </div>
      </article>
    </main>
  );
}

/** Lightweight, reliable Markdown renderer for docs */
function MarkdownRenderer({
  content,
  onNavigate,
}: {
  content: string;
  onNavigate: (path: string) => void;
}) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <div>
      {blocks.map((block, i) => {
        if (block.type === 'h1') return <h1 key={i}>{renderInline(block.content, onNavigate)}</h1>;
        if (block.type === 'h2') return <h2 key={i}>{renderInline(block.content, onNavigate)}</h2>;
        if (block.type === 'h3') return <h3 key={i}>{renderInline(block.content, onNavigate)}</h3>;
        if (block.type === 'p') return <p key={i}>{renderInline(block.content, onNavigate)}</p>;
        if (block.type === 'blockquote')
          return <blockquote key={i}>{renderInline(block.content, onNavigate)}</blockquote>;
        if (block.type === 'code')
          return <CodeBlock key={i} language={block.language || 'typescript'} code={block.content} />;
        if (block.type === 'ul') {
          return (
            <ul key={i}>
              {block.items?.map((item, j) => <li key={j}>{renderInline(item, onNavigate)}</li>)}
            </ul>
          );
        }
        if (block.type === 'table') {
          return (
            <div key={i} style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    {block.headers?.map((h, j) => <th key={j}>{renderInline(h, onNavigate)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {block.rows?.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c}>{renderInline(cell, onNavigate)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

interface Block {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'blockquote' | 'code' | 'ul' | 'table';
  content: string;
  language?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', content: codeLines.join('\n'), language });
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', content: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', content: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', content: line.slice(4).trim() });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', content: quoteLines.join('\n') });
      continue;
    }

    // Markdown Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((s) => s.trim());
        const rows = tableLines.slice(2).map((l) =>
          l
            .split('|')
            .slice(1, -1)
            .map((s) => s.trim()),
        );
        blocks.push({ type: 'table', content: '', headers, rows });
        continue;
      }
    }

    // Bullet List
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: 'ul', content: '', items });
      continue;
    }

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('>') &&
      !(lines[i].includes('|') && lines[i].trim().startsWith('|')) &&
      !lines[i].trim().startsWith('- ')
    ) {
      pLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'p', content: pLines.join(' ') });
  }

  return blocks;
}

function renderInline(text: string, onNavigate: (path: string) => void): React.ReactNode[] {
  // Regex to match inline code, bold, links
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const url = linkMatch[2];
      const isInternal = url.endsWith('.md') || url.startsWith('#');
      if (isInternal) {
        const cleanPath = url.replace(/^#/, '');
        return (
          <a
            key={index}
            href={`#${cleanPath}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(cleanPath);
            }}
          >
            {label}
          </a>
        );
      }
      return (
        <a key={index} href={url} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    return part;
  });
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="docs-code-block">
      <div className="docs-code-header">
        <span>{language}</span>
        <button className="docs-copy-btn" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
