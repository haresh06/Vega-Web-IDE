'use client';

import Link from 'next/link';
import { useState } from 'react';
import { challenges } from '@/data/learning-content';
import { Code2, ArrowLeft, ArrowRight, Zap, CheckCircle2, Terminal } from 'lucide-react';

export default function CodingChallengesPage() {
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const filtered = filter === 'all' ? challenges : challenges.filter(c => c.difficulty === filter);

  return (
    <div className="coding-challenges-page">
      {/* Top Breadcrumbs */}
      <div className="breadcrumbs">
        <Link href="/challenges" className="crumb-link">
          <ArrowLeft size={14} />
          <span>Challenges & Quizzes</span>
        </Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-active">Coding Challenges</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="header-badge">
          <Code2 size={15} />
          <span>Embedded Programming Lab</span>
        </div>
        <h1>💻 VEGA Coding Challenges</h1>
        <p className="page-subtitle">
          Solve real embedded programming problems, write drivers, and test your code against automated test cases.
        </p>
      </div>

      {/* Featured Daily Challenge */}
      <div className="daily-challenge card">
        <div className="daily-badge">
          <Zap size={14} />
          <span>Featured Challenge</span>
        </div>
        <h3>Configure PWM to Control LED Brightness</h3>
        <p>Write an embedded C routine that smoothly increases and decreases LED brightness using hardware PWM registers on GPIO5.</p>
        <div className="daily-footer">
          <span className="badge badge-medium">Medium</span>
          <span className="meta-item">⭐ 150 pts</span>
          <span className="meta-item">⏱ ~30 mins</span>
          <Link href="/challenges/ch-bit-manipulation" className="btn-primary start-daily-btn">
            Accept Challenge →
          </Link>
        </div>
      </div>

      {/* Difficulty Filters */}
      <div className="filters-bar">
        {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All Challenges' : f.charAt(0).toUpperCase() + f.slice(1)}{' '}
            {f !== 'all' && `(${challenges.filter(c => c.difficulty === f).length})`}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="challenges-grid">
        {filtered.map((challenge) => (
          <div key={challenge.id} className="challenge-card card">
            <div className="challenge-header">
              <span className={`badge badge-${challenge.difficulty}`}>{challenge.difficulty.toUpperCase()}</span>
              <span className="challenge-points">⭐ {challenge.points} pts</span>
            </div>
            <h3>{challenge.title}</h3>
            <p className="challenge-desc">{challenge.description}</p>

            <div className="challenge-reqs">
              <h4>Requirements:</h4>
              <ul>
                {challenge.requirements.map((r, j) => (
                  <li key={j}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="challenge-footer">
              <span className="test-count">
                <Terminal size={13} style={{ display: 'inline', marginRight: '4px' }} />
                {challenge.testCases.length} test cases
              </span>
              <Link href={`/challenges/${challenge.id}`} className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}>
                Open IDE →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .coding-challenges-page {
          min-height: calc(100vh - 60px);
          padding: 2rem 2rem 5rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 2rem;
          color: var(--color-text-muted, #64748b);
        }

        .crumb-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--color-text-secondary, #94a3b8);
          text-decoration: none;
          transition: color 0.2s;
        }

        .crumb-link:hover {
          color: var(--color-accent-cyan, #06d6a0);
        }

        .crumb-sep {
          color: var(--color-border, #334155);
        }

        .crumb-active {
          color: var(--color-accent-cyan, #06d6a0);
          font-weight: 600;
        }

        .page-header {
          margin-bottom: 2.5rem;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.75rem;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-accent-cyan, #38bdf8);
          margin-bottom: 0.75rem;
        }

        .page-header h1 {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--color-text-primary, #ffffff);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          color: var(--color-text-secondary, #94a3b8);
          font-size: 1.05rem;
        }

        .daily-challenge {
          background: var(--color-bg-card, #10192e);
          border: 1px solid var(--color-border, #1e293b);
          border-left: 4px solid #f59e0b;
          border-radius: 12px;
          padding: 1.75rem;
          margin-bottom: 2rem;
        }

        .daily-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fbbf24;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .daily-challenge h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary, #ffffff);
          margin-bottom: 0.5rem;
        }

        .daily-challenge p {
          color: var(--color-text-secondary, #94a3b8);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .daily-footer {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .meta-item {
          font-size: 0.82rem;
          color: var(--color-text-muted, #94a3b8);
        }

        .start-daily-btn {
          margin-left: auto;
          font-size: 0.85rem;
          padding: 0.5rem 1.25rem;
        }

        .filters-bar {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }

        .filter-btn {
          padding: 0.4rem 1rem;
          border: 1px solid var(--color-border, #1e293b);
          border-radius: 6px;
          background: transparent;
          color: var(--color-text-muted, #94a3b8);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          border-color: var(--color-accent-cyan, #06d6a0);
          color: var(--color-text-primary, #ffffff);
        }

        .filter-btn.active {
          border-color: rgba(6, 214, 160, 0.4);
          color: var(--color-accent-cyan, #06d6a0);
          background: rgba(6, 214, 160, 0.08);
        }

        .challenges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.25rem;
        }

        .challenge-card {
          background: var(--color-bg-card, #10192e);
          border: 1px solid var(--color-border, #1e293b);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          transition: all 0.25s;
        }

        .challenge-card:hover {
          transform: translateY(-3px);
          border-color: rgba(56, 189, 248, 0.35);
          box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.35);
        }

        .challenge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .challenge-points {
          font-size: 0.82rem;
          font-weight: 700;
          color: #fbbf24;
        }

        .challenge-card h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-text-primary, #ffffff);
          margin-bottom: 0.5rem;
        }

        .challenge-desc {
          color: var(--color-text-secondary, #94a3b8);
          font-size: 0.88rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .challenge-reqs {
          margin-bottom: 1.25rem;
        }

        .challenge-reqs h4 {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-text-muted, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.35rem;
        }

        .challenge-reqs ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .challenge-reqs li {
          font-size: 0.8rem;
          color: var(--color-text-secondary, #94a3b8);
          padding: 0.15rem 0;
        }

        .challenge-reqs li::before {
          content: '✓ ';
          color: var(--color-accent-cyan, #06d6a0);
          font-weight: 700;
        }

        .challenge-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .test-count {
          font-size: 0.75rem;
          color: var(--color-text-muted, #64748b);
        }

        @media (max-width: 768px) {
          .challenges-grid {
            grid-template-columns: 1fr;
          }
          .coding-challenges-page {
            padding: 1.5rem 1rem 4rem;
          }
        }
      `}</style>
    </div>
  );
}
