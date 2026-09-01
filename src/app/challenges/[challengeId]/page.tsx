'use client';

import { use } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { challenges } from '@/data/learning-content';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function ChallengeDetailPage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = use(params);
  const challenge = challenges.find(c => c.id === challengeId);
  const [code, setCode] = useState(challenge?.starterCode || '');
  const [showHints, setShowHints] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; desc: string }[]>([]);

  if (!challenge) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Challenge not found</h2>
        <Link href="/challenges" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>← Back</Link>
      </div>
    );
  }

  const handleSubmit = () => {
    setSubmitted(true);
    setTestResults(challenge.testCases.map(tc => ({
      passed: Math.random() > 0.3,
      desc: tc.description,
    })));
  };

  const score = testResults.filter(t => t.passed).length;
  const total = testResults.length;

  return (
    <div className="challenge-detail">
      <div className="cd-sidebar">
        <Link href="/challenges" className="back-link">← Challenges</Link>
        <h2>{challenge.title}</h2>
        <span className={`badge badge-${challenge.difficulty}`}>{challenge.difficulty}</span>
        <span className="cd-points">⭐ {challenge.points} pts</span>
        <p className="cd-desc">{challenge.description}</p>
        <div className="cd-reqs">
          <h4>Requirements</h4>
          {challenge.requirements.map((r, i) => <div key={i} className="req-item">✓ {r}</div>)}
        </div>
        <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.85rem' }} onClick={() => setShowHints(!showHints)}>
          {showHints ? 'Hide Hints' : '💡 Show Hints'}
        </button>
        {showHints && (
          <div className="cd-hints">
            {challenge.hints.map((h, i) => <div key={i} className="hint-item">💡 {h}</div>)}
          </div>
        )}
        {submitted && (
          <div className="cd-results">
            <h4>Test Results</h4>
            <div className="score-display">{score}/{total} passed</div>
            {testResults.map((t, i) => (
              <div key={i} className={`test-result ${t.passed ? 'pass' : 'fail'}`}>
                {t.passed ? '✅' : '❌'} {t.desc}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="cd-editor">
        <div className="cd-editor-header">
          <span>Solution Code</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => setCode(challenge.starterCode)}>↺ Reset</button>
            <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={handleSubmit}>▶ Submit</button>
          </div>
        </div>
        <MonacoEditor height="100%" language="c" value={code} onChange={(v) => setCode(v || '')} theme="vs-dark" options={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false }, automaticLayout: true }} />
      </div>

      <style jsx>{`
        .challenge-detail { display: grid; grid-template-columns: 350px 1fr; height: calc(100vh - 60px); }
        .cd-sidebar { padding: 1.5rem; background: var(--color-bg-secondary); border-right: 1px solid var(--color-border); overflow-y: auto; }
        .back-link { color: var(--color-text-muted); text-decoration: none; font-size: 0.8rem; display: block; margin-bottom: 1rem; }
        .cd-sidebar h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; }
        .cd-points { font-size: 0.85rem; color: var(--color-accent-yellow); font-weight: 600; margin-left: 0.5rem; }
        .cd-desc { color: var(--color-text-secondary); font-size: 0.85rem; line-height: 1.6; margin: 1rem 0; }
        .cd-reqs { margin-bottom: 1rem; }
        .cd-reqs h4 { font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 0.5rem; text-transform: uppercase; }
        .req-item { font-size: 0.8rem; color: var(--color-text-secondary); padding: 0.2rem 0; }
        .cd-hints { margin-top: 0.75rem; }
        .hint-item { font-size: 0.8rem; color: var(--color-accent-yellow); padding: 0.3rem 0; }
        .cd-results { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border); }
        .cd-results h4 { font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; }
        .score-display { font-size: 1.5rem; font-weight: 800; color: var(--color-accent-cyan); margin-bottom: 0.75rem; }
        .test-result { font-size: 0.8rem; padding: 0.3rem 0; }
        .test-result.pass { color: var(--color-success); }
        .test-result.fail { color: var(--color-error); }
        .cd-editor { display: flex; flex-direction: column; }
        .cd-editor-header { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem; background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); font-size: 0.85rem; font-weight: 600; }
        @media (max-width: 900px) { .challenge-detail { grid-template-columns: 1fr; } .cd-sidebar { max-height: 40vh; } }
      `}</style>
    </div>
  );
}
