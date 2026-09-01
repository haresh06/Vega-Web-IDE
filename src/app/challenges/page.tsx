'use client';

import Link from 'next/link';
import { useState } from 'react';
import { challenges } from '@/data/learning-content';

export default function ChallengesPage() {
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const filtered = filter === 'all' ? challenges : challenges.filter(c => c.difficulty === filter);

  return (
    <div className="challenges-page">
      <div className="page-header">
        <h1>🏆 Coding Challenges</h1>
        <p>Test your embedded systems skills with real-world coding challenges.</p>
      </div>

      {/* Daily Challenge */}
      <div className="daily-challenge card" style={{ maxWidth: 1200, margin: '0 auto 2rem', padding: '2rem' }}>
        <div className="daily-badge">⚡ Daily Challenge</div>
        <h3>Configure PWM to control LED brightness</h3>
        <p>Write a program that gradually increases and decreases LED brightness using PWM on GPIO10.</p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'center' }}>
          <span className="badge badge-medium">Medium</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>⭐ 150 pts</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>⏱ 30 min</span>
          <Link href="/challenges/daily" className="btn-primary" style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>Accept Challenge →</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="filters" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 1rem' }}>
        {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${challenges.filter(c => c.difficulty === f).length})`}
          </button>
        ))}
      </div>

      {/* Challenge Cards */}
      <div className="challenges-grid">
        {filtered.map((challenge, i) => (
          <div key={i} className="challenge-card card">
            <div className="challenge-header">
              <span className={`badge badge-${challenge.difficulty}`}>{challenge.difficulty}</span>
              <span className="challenge-points">⭐ {challenge.points} pts</span>
            </div>
            <h3>{challenge.title}</h3>
            <p>{challenge.description}</p>
            <div className="challenge-reqs">
              <h4>Requirements:</h4>
              <ul>
                {challenge.requirements.map((r, j) => (
                  <li key={j}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="challenge-footer">
              <span className="test-count">📋 {challenge.testCases.length} test cases</span>
              <Link href={`/challenges/${challenge.id}`} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                Start Challenge →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .challenges-page { padding-bottom: 4rem; }
        .page-header { text-align: center; padding: 3rem 2rem 2rem; }
        .page-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .page-header p { color: var(--color-text-secondary); }

        .daily-challenge { border-left: 4px solid var(--color-accent-orange); }
        .daily-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-accent-orange);
          margin-bottom: 0.5rem;
        }
        .daily-challenge h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; }
        .daily-challenge p { color: var(--color-text-secondary); font-size: 0.9rem; }

        .filters { display: flex; gap: 0.5rem; }
        .filter-btn {
          padding: 0.4rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background: none;
          color: var(--color-text-muted);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-btn:hover { border-color: var(--color-accent-cyan); color: var(--color-text-primary); }
        .filter-btn.active { border-color: var(--color-accent-cyan); color: var(--color-accent-cyan); background: rgba(6,214,160,0.08); }

        .challenges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.25rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
        }
        .challenge-card { display: flex; flex-direction: column; }
        .challenge-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .challenge-points { font-size: 0.85rem; font-weight: 600; color: var(--color-accent-yellow); }
        .challenge-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
        .challenge-card p { color: var(--color-text-secondary); font-size: 0.85rem; line-height: 1.6; margin-bottom: 0.75rem; }
        .challenge-reqs h4 { font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); margin-bottom: 0.3rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .challenge-reqs ul { list-style: none; padding: 0; }
        .challenge-reqs li { font-size: 0.8rem; color: var(--color-text-secondary); padding: 0.2rem 0; }
        .challenge-reqs li::before { content: '✓ '; color: var(--color-accent-cyan); }
        .challenge-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--color-border); }
        .test-count { font-size: 0.75rem; color: var(--color-text-muted); }

        @media (max-width: 768px) {
          .challenges-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
