'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { experiments } from '@/data/learning-content';

export default function ExperimentDetailPage({ params }: { params: Promise<{ expId: string }> }) {
  const { expId } = use(params);
  const exp = experiments.find(e => e.id === expId);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  if (!exp) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Experiment not found</h2>
        <Link href="/experiment" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>← Back</Link>
      </div>
    );
  }

  const toggleStep = (order: number) => {
    setCompletedSteps(prev =>
      prev.includes(order) ? prev.filter(s => s !== order) : [...prev, order]
    );
  };

  const progress = Math.round((completedSteps.length / exp.steps.length) * 100);

  return (
    <div className="exp-detail">
      <div className="exp-detail-header">
        <Link href="/experiment" className="back-link">← Back to Experiments</Link>
        <div className="exp-detail-meta">
          <span className={`badge badge-${exp.difficulty}`}>{exp.difficulty}</span>
          <span>⏱ {exp.estimatedMin} min</span>
        </div>
        <h1>{exp.title}</h1>
        <p>{exp.objective}</p>
      </div>

      <div className="exp-detail-grid">
        <div className="exp-steps-section card">
          <h3>Steps</h3>
          <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            {completedSteps.length}/{exp.steps.length} completed ({progress}%)
          </div>
          {exp.steps.map((step) => (
            <div
              key={step.order}
              className={`exp-step-item ${completedSteps.includes(step.order) ? 'done' : ''}`}
              onClick={() => toggleStep(step.order)}
            >
              <span className="step-check">{completedSteps.includes(step.order) ? '✅' : '○'}</span>
              <div>
                <span className="step-title">{step.title}</span>
                <span className="step-desc">{step.description}</span>
              </div>
            </div>
          ))}

          {progress === 100 && (
            <div className="completion-msg">
              🎉 Experiment Complete! <Link href="/progress">View Progress →</Link>
            </div>
          )}
        </div>

        <div className="exp-hw-section card">
          <h3>Required Hardware</h3>
          {exp.hardware.map((h, i) => (
            <div key={i} className="hw-item">
              <span>🔧</span> {h}
            </div>
          ))}
          <div style={{ marginTop: '1.5rem' }}>
            <Link href={`/ide?experiment=${exp.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
              💻 Open in VEGA Studio
            </Link>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link href="/troubleshoot" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
              🔍 Troubleshoot Issues
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .exp-detail { max-width: 1000px; margin: 0 auto; padding: 2rem; padding-bottom: 4rem; }
        .exp-detail-header { margin-bottom: 2rem; }
        .back-link { color: var(--color-text-muted); text-decoration: none; font-size: 0.8rem; display: block; margin-bottom: 1rem; }
        .exp-detail-meta { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; font-size: 0.85rem; color: var(--color-text-muted); }
        .exp-detail-header h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; }
        .exp-detail-header p { color: var(--color-text-secondary); font-size: 0.95rem; }

        .exp-detail-grid { display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; }
        .exp-steps-section h3, .exp-hw-section h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }

        .exp-step-item {
          display: flex; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; cursor: pointer;
          transition: all 0.2s; margin-bottom: 0.5rem;
        }
        .exp-step-item:hover { background: rgba(6,214,160,0.05); }
        .exp-step-item.done { opacity: 0.6; }
        .step-check { font-size: 1rem; }
        .step-title { display: block; font-size: 0.9rem; font-weight: 600; }
        .step-desc { display: block; font-size: 0.8rem; color: var(--color-text-muted); }

        .completion-msg {
          margin-top: 1.5rem; padding: 1rem; background: rgba(6,214,160,0.08); border-radius: 8px;
          text-align: center; font-weight: 600; color: var(--color-accent-cyan);
        }
        .completion-msg a { color: var(--color-accent-cyan); margin-left: 0.5rem; }

        .hw-item { display: flex; gap: 0.5rem; padding: 0.4rem 0; font-size: 0.85rem; color: var(--color-text-secondary); }

        @media (max-width: 768px) { .exp-detail-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
