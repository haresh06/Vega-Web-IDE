'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownProps {
  content: string;
}

// Function to parse inline markdown (bold, inline code, italics, links)
export function renderInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex to match **bold**, `code`, *italic*, [link](url)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // **Bold**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="lesson-text-bold">
          {renderInlineMarkdown(boldText)}
        </strong>
      );
    }

    // `Inline Code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeText = part.slice(1, -1);
      return (
        <code key={index} className="lesson-inline-code">
          {codeText}
        </code>
      );
    }

    // *Italic*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const italicText = part.slice(1, -1);
      return (
        <em key={index} className="lesson-text-italic">
          {italicText}
        </em>
      );
    }

    // [Link](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, linkText, linkUrl] = linkMatch;
      return (
        <a
          key={index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="lesson-link"
        >
          {linkText}
        </a>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function CodeBlockWithCopy({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="lesson-code-block-wrapper">
      <div className="lesson-code-header">
        <span className="lesson-code-lang">{lang || 'C / C++'}</span>
        <button className="lesson-code-copy-btn" onClick={handleCopy} title="Copy code">
          {copied ? (
            <>
              <Check size={13} className="copy-icon-success" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="lesson-code-pre">
        <code className={`language-${lang || 'c'}`}>{code}</code>
      </pre>
    </div>
  );
}

type ParsedBlock =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'code'; code: string; lang: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; text: string }
  | { type: 'p'; text: string };

function parseMarkdownDocument(rawContent: string): ParsedBlock[] {
  const lines = rawContent.replace(/\r\n/g, '\n').split('\n');
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Fenced Code Block: ```lang
    if (trimmed.startsWith('```')) {
      const lang = trimmed.replace(/^```/, '').trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i++; // skip closing ```
      }
      blocks.push({
        type: 'code',
        code: codeLines.join('\n'),
        lang: lang || 'c',
      });
      continue;
    }

    // 2. Headings (H1 - H4)
    if (trimmed.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: trimmed.replace(/^####\s+/, '') });
      i++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.replace(/^###\s+/, '') });
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.replace(/^##\s+/, '') });
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.replace(/^#\s+/, '') });
      i++;
      continue;
    }

    // 3. Callouts / Blockquotes (> text)
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      blocks.push({
        type: 'callout',
        text: quoteLines.join(' '),
      });
      continue;
    }

    // 4. Markdown Tables (| col | col |)
    if (trimmed.startsWith('|') && trimmed.includes('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const tLine = lines[i].trim();
        // Ignore separator line like |---|---|---|
        if (!tLine.match(/^\|\s*[-:]+[-| :]*\|$/)) {
          tableLines.push(tLine);
        }
        i++;
      }

      if (tableLines.length >= 1) {
        const parseRow = (r: string) =>
          r
            .split('|')
            .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1 || c.trim().length > 0)
            .map(c => c.trim());

        const headers = parseRow(tableLines[0]);
        const rows = tableLines.slice(1).map(parseRow);

        blocks.push({
          type: 'table',
          headers,
          rows,
        });
      }
      continue;
    }

    // 5. Unordered List (- item or * item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'ul',
        items,
      });
      continue;
    }

    // 6. Ordered List (1. item, 2. item)
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'ol',
        items,
      });
      continue;
    }

    // 7. Standard Paragraph (consume continuous text lines)
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('> ') &&
      !lines[i].trim().startsWith('|') &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('* ') &&
      !/^\d+\.\s/.test(lines[i].trim())
    ) {
      pLines.push(lines[i].trim());
      i++;
    }

    if (pLines.length > 0) {
      blocks.push({
        type: 'p',
        text: pLines.join(' '),
      });
    }
  }

  return blocks;
}

export default function LessonMarkdownRenderer({ content }: MarkdownProps) {
  if (!content) return null;

  const blocks = parseMarkdownDocument(content);

  return (
    <div className="lesson-markdown-body">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'code':
            return <CodeBlockWithCopy key={idx} code={block.code} lang={block.lang} />;

          case 'h1':
            return (
              <h1 key={idx} className="lesson-h1">
                {renderInlineMarkdown(block.text)}
              </h1>
            );

          case 'h2':
            return (
              <h2 key={idx} className="lesson-h2">
                {renderInlineMarkdown(block.text)}
              </h2>
            );

          case 'h3':
            return (
              <h3 key={idx} className="lesson-h3">
                {renderInlineMarkdown(block.text)}
              </h3>
            );

          case 'h4':
            return (
              <h4 key={idx} className="lesson-h4">
                {renderInlineMarkdown(block.text)}
              </h4>
            );

          case 'callout':
            return (
              <blockquote key={idx} className="lesson-callout">
                <div className="callout-indicator" />
                <div className="callout-text">{renderInlineMarkdown(block.text)}</div>
              </blockquote>
            );

          case 'table':
            return (
              <div key={idx} className="lesson-table-container">
                <table className="lesson-table">
                  <thead>
                    <tr>
                      {block.headers.map((h, hi) => (
                        <th key={hi}>{renderInlineMarkdown(h)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci}>{renderInlineMarkdown(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'ul':
            return (
              <ul key={idx} className="lesson-ul">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="lesson-li">
                    <span className="lesson-bullet-dot" />
                    <div className="lesson-li-text">{renderInlineMarkdown(item)}</div>
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={idx} className="lesson-ol">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="lesson-oli">
                    <span className="lesson-ol-num">{String(itemIdx + 1).padStart(2, '0')}</span>
                    <div className="lesson-oli-text">{renderInlineMarkdown(item)}</div>
                  </li>
                ))}
              </ol>
            );

          case 'p':
          default:
            return (
              <p key={idx} className="lesson-p">
                {renderInlineMarkdown(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
