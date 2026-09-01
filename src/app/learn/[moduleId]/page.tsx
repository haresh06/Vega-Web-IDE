'use client';

import Link from 'next/link';
import { useState, use } from 'react';
import { learningPaths } from '@/data/learning-content';

export default function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params);
  const [activeLesson, setActiveLesson] = useState(0);

  // Find module across all learning paths
  const module = learningPaths
    .flatMap(p => p.modules)
    .find(m => m.id === moduleId);

  if (!module) {
    return (
      <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <h2>Module not found</h2>
        <Link href="/learn" className="btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
          ← Back to Learn Center
        </Link>
      </div>
    );
  }

  const lesson = module.lessons[activeLesson] || module.lessons[0];
  const activeVideoUrl = lesson?.videoUrl || module.videoUrl;
  const activeVideoTitle = lesson?.videoTitle || module.videoTitle || `${module.title} Video Guide`;

  return (
    <div className="module-page">
      {/* Module Left Sidebar */}
      <aside className="module-sidebar">
        <div className="sidebar-header">
          <Link href="/learn" className="back-link">
            ← Back to Learn Center
          </Link>
          <h2>{module.title}</h2>
          <div className="sidebar-meta">
            <span className={`badge badge-${module.difficulty}`}>{module.difficulty.toUpperCase()}</span>
            <span>⏱ {module.estimatedTime} min</span>
            <span>⭐ {module.points} pts</span>
          </div>
        </div>

        <div className="sidebar-lessons">
          <h4>MODULE LESSONS ({module.lessons.length})</h4>
          {module.lessons.map((l, i) => (
            <button
              key={l.id}
              className={`sidebar-lesson ${i === activeLesson ? 'active' : ''} ${l.completed ? 'completed' : ''}`}
              onClick={() => setActiveLesson(i)}
            >
              <span className="sl-check">{l.completed ? '✅' : i === activeLesson ? '▶' : '○'}</span>
              <span className="sl-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="sl-title">{l.title}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-actions">
          <Link
            href={`/ide?project=${module.id}`}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', marginBottom: '0.5rem' }}
          >
            💻 Code in VEGA Studio
          </Link>
          <Link
            href="/challenges"
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
          >
            🏆 Take Challenge
          </Link>
        </div>
      </aside>

      {/* Main Module Content */}
      <main className="module-main">
        {/* Lesson Header */}
        <div className="lesson-header">
          <div className="lesson-meta-top">
            <span className="lesson-badge">Lesson {activeLesson + 1} of {module.lessons.length}</span>
            <span className="mod-category-pill">{module.category.toUpperCase()}</span>
          </div>
          <h1>{lesson.title}</h1>
        </div>

        {/* Embedded YouTube Video Tutorial */}
        {activeVideoUrl && (
          <div className="module-video-card">
            <div className="video-responsive-wrapper">
              <iframe
                src={activeVideoUrl}
                title={activeVideoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="video-bottom-caption">
              <span className="video-icon">🎬</span>
              <span className="video-caption-text">{activeVideoTitle}</span>
            </div>
          </div>
        )}

        {/* Lesson Detailed Content Rendering */}
        <div className="lesson-content">
          {lesson.content.split('\n\n').map((block, i) => {
            if (block.startsWith('## ')) {
              return <h2 key={i} className="content-h2">{block.replace('## ', '')}</h2>;
            }
            if (block.startsWith('### ')) {
              return <h3 key={i} className="content-h3">{block.replace('### ', '')}</h3>;
            }
            if (block.startsWith('```')) {
              const lines = block.split('\n');
              const lang = lines[0].replace('```', '');
              const code = lines.slice(1, -1).join('\n');
              return (
                <div key={i} className="code-block-wrapper">
                  <div className="code-lang">{lang || 'c'}</div>
                  <pre className="code-block"><code>{code}</code></pre>
                </div>
              );
            }
            if (block.startsWith('| ')) {
              const rows = block.split('\n').filter(r => !r.startsWith('|--'));
              const headers = rows[0]?.split('|').filter(Boolean).map(h => h.trim());
              const data = rows.slice(1).map(r => r.split('|').filter(Boolean).map(d => d.trim()));
              return (
                <div key={i} className="table-responsive-wrapper">
                  <table className="content-table">
                    <thead>
                      <tr>{headers?.map((h, j) => <th key={j}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {data.map((row, ri) => (
                        <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            if (block.startsWith('- ')) {
              return (
                <ul key={i} className="content-list">
                  {block.split('\n').filter(l => l.startsWith('- ')).map((item, j) => (
                    <li key={j}>{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            }
            if (block.startsWith('> ')) {
              return (
                <div key={i} className="content-callout-box">
                  {block.replace('> ', '')}
                </div>
              );
            }
            return <p key={i} className="content-p">{block}</p>;
          })}
        </div>

        {/* Lesson Bottom Navigation */}
        <div className="lesson-nav">
          <button
            className="btn-secondary"
            disabled={activeLesson === 0}
            onClick={() => setActiveLesson(activeLesson - 1)}
          >
            ← Previous Lesson
          </button>

          <div className="lesson-progress-tag">
            Lesson {activeLesson + 1} of {module.lessons.length}
          </div>

          {activeLesson < module.lessons.length - 1 ? (
            <button
              className="btn-primary"
              onClick={() => setActiveLesson(activeLesson + 1)}
            >
              Next Lesson →
            </button>
          ) : (
            <Link href={`/ide?project=${module.id}`} className="btn-primary">
              💻 Hands-on Code Lab →
            </Link>
          )}
        </div>
      </main>

      <style jsx>{`
        .module-page {
          display: grid;
          grid-template-columns: 320px 1fr;
          min-height: 100vh;
        }

        /* Sidebar */
        .module-sidebar {
          background: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
          padding: 1.75rem 1.25rem;
          overflow-y: auto;
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .back-link {
          color: var(--color-accent-cyan);
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 600;
          display: block;
          margin-bottom: 1rem;
          transition: transform 0.2s;
        }
        .back-link:hover {
          transform: translateX(-3px);
        }
        .sidebar-header h2 {
          font-size: 1.2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .sidebar-meta {
          display: flex;
          gap: 0.6rem;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .sidebar-lessons {
          flex: 1;
        }
        .sidebar-lessons h4 {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
          margin-bottom: 0.75rem;
        }
        .sidebar-lesson {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.65rem 0.75rem;
          border: 1px solid transparent;
          background: none;
          border-radius: 8px;
          font-size: 0.82rem;
          color: var(--color-text-secondary);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          margin-bottom: 0.25rem;
        }
        .sidebar-lesson:hover {
          background: rgba(6, 214, 160, 0.05);
          color: var(--color-text-primary);
        }
        .sidebar-lesson.active {
          background: rgba(6, 214, 160, 0.12);
          border-color: rgba(6, 214, 160, 0.3);
          color: var(--color-accent-cyan);
          font-weight: 600;
        }
        .sl-check { font-size: 0.8rem; width: 18px; }
        .sl-num { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-text-muted); }
        .sl-title { font-weight: 500; flex: 1; }
        .sidebar-actions {
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--color-border);
        }

        /* Main */
        .module-main {
          padding: 3rem 4rem 6rem;
          max-width: 960px;
        }
        .lesson-header {
          margin-bottom: 2rem;
        }
        .lesson-meta-top {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .lesson-badge {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-accent-cyan);
          background: rgba(6, 214, 160, 0.12);
          padding: 0.25rem 0.65rem;
          border-radius: 4px;
        }
        .mod-category-pill {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }
        .lesson-header h1 {
          font-size: 2rem;
          font-weight: 900;
        }

        /* Video player */
        .module-video-card {
          margin-bottom: 2.25rem;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          background: #000;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        }
        .video-responsive-wrapper {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
        }
        .video-responsive-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .video-bottom-caption {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--color-bg-card);
          border-top: 1px solid var(--color-border);
        }
        .video-icon { font-size: 1rem; }
        .video-caption-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        /* Content rendering */
        .lesson-content {
          line-height: 1.85;
        }
        .content-h2 {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 2.5rem 0 0.85rem;
          color: var(--color-accent-cyan);
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 0.5rem;
        }
        .content-h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 1.75rem 0 0.6rem;
        }
        .content-p {
          color: var(--color-text-secondary);
          margin-bottom: 1.25rem;
          font-size: 0.98rem;
        }
        .content-list {
          margin: 0.75rem 0 1.25rem 1.75rem;
          color: var(--color-text-secondary);
          font-size: 0.95rem;
        }
        .content-list li {
          margin-bottom: 0.4rem;
        }
        .code-block-wrapper {
          margin: 1.5rem 0;
          position: relative;
        }
        .code-lang {
          position: absolute;
          top: 0;
          right: 0;
          padding: 0.3rem 0.75rem;
          font-size: 0.65rem;
          font-family: var(--font-mono);
          color: var(--color-text-muted);
          background: rgba(255,255,255,0.06);
          border-radius: 0 8px 0 6px;
          text-transform: uppercase;
        }
        .table-responsive-wrapper {
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .content-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .content-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: var(--color-bg-input);
          border: 1px solid var(--color-border);
          font-weight: 700;
          color: var(--color-accent-cyan);
        }
        .content-table td {
          padding: 0.65rem 1rem;
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
        }
        .content-callout-box {
          padding: 1rem 1.25rem;
          background: rgba(6, 214, 160, 0.08);
          border-left: 4px solid var(--color-accent-cyan);
          border-radius: 6px;
          color: var(--color-text-primary);
          font-size: 0.92rem;
          margin: 1.25rem 0;
        }

        /* Navigation */
        .lesson-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 3.5rem;
          padding-top: 1.75rem;
          border-top: 1px solid var(--color-border);
        }
        .lesson-nav button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .lesson-progress-tag {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
        }

        @media (max-width: 960px) {
          .module-page { grid-template-columns: 1fr; }
          .module-sidebar {
            position: relative;
            top: 0;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--color-border);
          }
          .module-main { padding: 2rem 1.5rem; }
        }
      `}</style>
    </div>
  );
}
