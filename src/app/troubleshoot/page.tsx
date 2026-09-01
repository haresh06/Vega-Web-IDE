'use client';

import { troubleshootGuides } from '@/data/boards';
import { useState } from 'react';

export default function TroubleshootPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="ts-page">
      <div className="page-header">
        <h1>🔍 Troubleshoot</h1>
        <p>Step-by-step solutions for common hardware and connection issues.</p>
      </div>

      <div className="ts-list">
        {troubleshootGuides.map((guide) => (
          <div key={guide.id} className={`card ts-card ${expanded === guide.id ? 'expanded' : ''}`}>
            <div className="ts-header" onClick={() => setExpanded(expanded === guide.id ? null : guide.id)}>
              <div>
                <span className="ts-category badge badge-info">{guide.category}</span>
                <h3>{guide.title}</h3>
                <div className="ts-symptoms">
                  {guide.symptoms.map((s, i) => (
                    <span key={i} className="symptom-tag">• {s}</span>
                  ))}
                </div>
              </div>
              <span className="ts-arrow">{expanded === guide.id ? '▲' : '▼'}</span>
            </div>
            {expanded === guide.id && (
              <div className="ts-solutions">
                <h4>Solutions</h4>
                {guide.solutions.map((sol) => (
                  <div key={sol.order} className="solution-step">
                    <span className="sol-num">{sol.order}</span>
                    <div>
                      <span className="sol-instruction">{sol.instruction}</span>
                      {sol.detail && <span className="sol-detail">{sol.detail}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .ts-page { max-width: 900px; margin: 0 auto; padding: 2rem; padding-bottom: 4rem; }
        .page-header { text-align: center; margin-bottom: 2rem; }
        .page-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .page-header p { color: var(--color-text-secondary); }

        .ts-list { display: flex; flex-direction: column; gap: 1rem; }
        .ts-card { cursor: pointer; }
        .ts-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .ts-category { margin-bottom: 0.5rem; display: inline-block; }
        .ts-card h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; }
        .ts-symptoms { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .symptom-tag { font-size: 0.8rem; color: var(--color-text-muted); }
        .ts-arrow { color: var(--color-text-muted); font-size: 0.8rem; flex-shrink: 0; margin-top: 0.5rem; }

        .ts-solutions { margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--color-border); }
        .ts-solutions h4 { font-size: 0.8rem; font-weight: 700; color: var(--color-accent-cyan); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .solution-step { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
        .sol-num {
          width: 24px; height: 24px; border-radius: 50%; background: rgba(6,214,160,0.1);
          color: var(--color-accent-cyan); display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
        }
        .sol-instruction { display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.15rem; }
        .sol-detail { display: block; font-size: 0.8rem; color: var(--color-text-secondary); line-height: 1.5; }
      `}</style>
    </div>
  );
}
