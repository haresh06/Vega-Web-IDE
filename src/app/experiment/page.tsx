'use client';

import Link from 'next/link';
import { useState } from 'react';
import { experiments, protocolLabs } from '@/data/learning-content';

export default function ExperimentPage() {
  const [activeTab, setActiveTab] = useState<'protocols' | 'hardware'>('protocols');
  const [selectedProto, setSelectedProto] = useState<'uart' | 'i2c' | 'spi'>('uart');

  return (
    <div className="experiment-page">
      <div className="page-header">
        <div className="header-badge">
          <span>🔬</span> INTERACTIVE LABS
        </div>
        <h1>Protocol & Hardware Laboratories</h1>
        <p>Conduct hands-on experiments with UART, I2C, and SPI serial protocols, sensors, and live embedded hardware.</p>
      </div>

      {/* Lab Mode Toggle */}
      <div className="lab-toggle-row">
        <button
          className={`toggle-btn ${activeTab === 'protocols' ? 'active' : ''}`}
          onClick={() => setActiveTab('protocols')}
        >
          🔌 Protocol Labs (UART, I2C, SPI)
        </button>
        <button
          className={`toggle-btn ${activeTab === 'hardware' ? 'active' : ''}`}
          onClick={() => setActiveTab('hardware')}
        >
          ⚙️ Hardware Experiments ({experiments.length})
        </button>
      </div>

      {activeTab === 'protocols' ? (
        <div className="protocols-lab-view">
          {/* Protocol Selector */}
          <div className="proto-cards-grid">
            {(['uart', 'i2c', 'spi'] as const).map(key => {
              const proto = protocolLabs[key];
              return (
                <div
                  key={key}
                  className={`proto-summary-card card ${selectedProto === key ? 'active' : ''}`}
                  onClick={() => setSelectedProto(key)}
                >
                  <div className="card-top-line">
                    <span className="proto-code-name">{key.toUpperCase()}</span>
                    <span className="step-counter">{proto.steps.length} Steps</span>
                  </div>
                  <h3>{proto.name}</h3>
                  <p>{proto.description}</p>
                  <div className="card-bottom-action">
                    <span>{selectedProto === key ? '● Selected Lab' : 'Click to Inspect'}</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Protocol Deep-Dive Steps */}
          <div className="active-proto-steps card">
            <div className="active-proto-header">
              <div>
                <h2>{protocolLabs[selectedProto].name} — Interactive Steps</h2>
                <p>{protocolLabs[selectedProto].description}</p>
              </div>
              <Link href={`/learn`} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                Open in Learn Center →
              </Link>
            </div>

            <div className="steps-grid-aligned">
              {protocolLabs[selectedProto].steps.map((step) => (
                <Link
                  key={step.id}
                  href={`/learn?tab=protocols&proto=${selectedProto}&step=${step.id}`}
                  className="step-card-item interactive-step-link"
                >
                  <div className="step-num-pill">{String(step.id).padStart(2, '0')}</div>
                  <div className="step-content-col">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                  <span className="step-link-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="experiments-grid">
          {experiments.map((exp, i) => (
            <div key={i} className="exp-card card">
              <div className="exp-header">
                <span className={`badge badge-${exp.difficulty}`}>{exp.difficulty.toUpperCase()}</span>
                <span className="exp-time">⏱ {exp.estimatedMin} min</span>
              </div>
              <h3>{exp.title}</h3>
              <p className="exp-objective">{exp.objective}</p>

              <div className="exp-hardware">
                <h4>Required Hardware</h4>
                <div className="hw-tags">
                  {exp.hardware.map((h, j) => (
                    <span key={j} className="hw-tag">{h}</span>
                  ))}
                </div>
              </div>

              <div className="exp-steps">
                <h4>Steps ({exp.steps.length})</h4>
                {exp.steps.slice(0, 3).map((step, j) => (
                  <div key={j} className="exp-step">
                    <span className="step-num">{step.order}</span>
                    <span>{step.title}</span>
                  </div>
                ))}
                {exp.steps.length > 3 && (
                  <span className="more-steps">+{exp.steps.length - 3} more steps...</span>
                )}
              </div>

              <div className="exp-footer">
                <Link href={`/experiment/${exp.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                  Start Experiment →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .experiment-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.5rem 2rem 5rem;
        }
        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.9rem;
          background: rgba(6, 214, 160, 0.1);
          border: 1px solid rgba(6, 214, 160, 0.25);
          border-radius: 999px;
          color: var(--color-accent-cyan);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 0.75rem;
        }
        .page-header h1 {
          font-size: 2.2rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
        }
        .page-header p {
          color: var(--color-text-secondary);
          font-size: 1rem;
          max-width: 700px;
          margin: 0 auto;
        }

        .lab-toggle-row {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .toggle-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-btn:hover {
          color: var(--color-text-primary);
          border-color: var(--color-accent-cyan);
        }
        .toggle-btn.active {
          background: rgba(6, 214, 160, 0.12);
          border-color: var(--color-accent-cyan);
          color: var(--color-accent-cyan);
        }

        /* Protocol Lab Cards */
        .proto-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .proto-summary-card {
          cursor: pointer;
          transition: all 0.25s;
          border: 1px solid var(--color-border);
        }
        .proto-summary-card:hover {
          border-color: var(--color-accent-cyan);
          transform: translateY(-2px);
        }
        .proto-summary-card.active {
          background: rgba(6, 214, 160, 0.08);
          border-color: var(--color-accent-cyan);
          box-shadow: 0 4px 20px rgba(6, 214, 160, 0.15);
        }
        .card-top-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.65rem;
        }
        .proto-code-name {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--color-accent-cyan);
        }
        .step-counter {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }
        .proto-summary-card h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
        }
        .proto-summary-card p {
          font-size: 0.82rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        .card-bottom-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          color: var(--color-accent-cyan);
          font-weight: 600;
          border-top: 1px solid var(--color-border);
          padding-top: 0.65rem;
        }

        /* Active Protocol Detailed Step Grid */
        .active-proto-steps {
          padding: 2rem;
        }
        .active-proto-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.75rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 1rem;
        }
        .active-proto-header h2 {
          font-size: 1.35rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }
        .active-proto-header p {
          font-size: 0.88rem;
          color: var(--color-text-secondary);
        }
        .steps-grid-aligned {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }
        .step-card-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          background: var(--color-bg-input);
          border-radius: 8px;
          border: 1px solid var(--color-border);
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }
        .step-card-item:hover {
          border-color: var(--color-accent-cyan);
          background: rgba(6, 214, 160, 0.08);
          transform: translateY(-2px);
        }
        .step-link-arrow {
          margin-left: auto;
          color: var(--color-accent-cyan);
          font-size: 0.95rem;
          transition: transform 0.2s;
        }
        .step-card-item:hover .step-link-arrow {
          transform: translateX(3px);
        }
        .step-num-pill {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--color-accent-cyan);
          background: rgba(6, 214, 160, 0.12);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }
        .step-content-col h4 {
          font-size: 0.92rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }
        .step-content-col p {
          font-size: 0.78rem;
          color: var(--color-text-muted);
          line-height: 1.4;
        }

        /* Hardware Experiments Grid */
        .experiments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }
        .exp-card {
          display: flex;
          flex-direction: column;
        }
        .exp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .exp-time {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
        .exp-card h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .exp-objective {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .exp-hardware {
          margin-bottom: 1rem;
        }
        .exp-hardware h4 {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--color-text-muted);
          margin-bottom: 0.4rem;
          text-transform: uppercase;
        }
        .hw-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .hw-tag {
          padding: 0.2rem 0.55rem;
          background: var(--color-bg-input);
          border-radius: 4px;
          font-size: 0.72rem;
          color: var(--color-text-secondary);
        }
        .exp-steps {
          margin-bottom: 1rem;
        }
        .exp-steps h4 {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--color-text-muted);
          margin-bottom: 0.4rem;
          text-transform: uppercase;
        }
        .exp-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0;
          font-size: 0.8rem;
          color: var(--color-text-secondary);
        }
        .step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(6, 214, 160, 0.1);
          color: var(--color-accent-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .more-steps {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          padding-left: 28px;
        }
        .exp-footer {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }

        @media (max-width: 900px) {
          .proto-cards-grid { grid-template-columns: 1fr; }
          .active-proto-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
        }
      `}</style>
    </div>
  );
}
