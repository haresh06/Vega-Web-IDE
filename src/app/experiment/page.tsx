'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { experiments, protocolLabs } from '@/data/learning-content';

interface ProtocolCardProps {
  protoKey: 'uart' | 'i2c' | 'spi';
  proto: (typeof protocolLabs)['uart'];
  isSelected: boolean;
  onSelect: () => void;
}

function ProtocolCard({ protoKey, proto, isSelected, onSelect }: ProtocolCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
      opacity: 1,
    });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    handleTouchMove(e);
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleTouchEnd = () => {
    setMousePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      className={`proto-summary-card ${isSelected ? 'active-selected' : ''}`}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect();
      }}
      aria-pressed={isSelected}
    >
      {/* Dark Glassmorphism Ambient Corner/Edge Lighting */}
      <div className="card-ambient-edge" aria-hidden="true" />

      {/* Cursor-Following / Touch-Following Spotlight Effect */}
      <div
        className="card-mouse-flare"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
          opacity: mousePos.opacity,
        }}
        aria-hidden="true"
      />

      <div className="card-inner-content">
        <div className="card-top-line">
          <span className="proto-code-badge">{protoKey.toUpperCase()}</span>
          <span className="step-counter-tag">{proto.steps.length} Steps</span>
        </div>

        <h3 className="proto-card-title">{proto.name}</h3>
        <p className="proto-card-desc">{proto.description}</p>

        <div className="card-bottom-action">
          <span className="action-status">
            {isSelected ? (
              <span className="selected-indicator">
                <span className="selected-dot" /> Selected Lab
              </span>
            ) : (
              <span className="inspect-label">Click to Inspect</span>
            )}
          </span>
          <span className="action-arrow">→</span>
        </div>
      </div>
    </div>
  );
}

export default function ExperimentPage() {
  const [activeTab, setActiveTab] = useState<'protocols' | 'hardware'>('protocols');
  const [selectedProto, setSelectedProto] = useState<'uart' | 'i2c' | 'spi'>('uart');

  return (
    <div className="experiment-page-wrapper">
      {/* Page Header */}
      <div className="page-header-block">
        <div className="header-badge-pill">
          <span>🔬</span>
          <span>INTERACTIVE LABORATORIES</span>
        </div>
        <h1 className="page-main-title">Protocol &amp; Hardware Laboratories</h1>
        <p className="page-sub-description">
          Conduct hands-on experiments with UART, I2C, and SPI serial protocols, sensors, and live embedded hardware.
        </p>
      </div>

      {/* Lab Mode Toggle Buttons */}
      <div className="lab-toggle-row">
        <button
          className={`toggle-tab-btn ${activeTab === 'protocols' ? 'active' : ''}`}
          onClick={() => setActiveTab('protocols')}
          type="button"
        >
          🔌 Protocol Labs (UART, I2C, SPI)
        </button>
        <button
          className={`toggle-tab-btn ${activeTab === 'hardware' ? 'active' : ''}`}
          onClick={() => setActiveTab('hardware')}
          type="button"
        >
          ⚙️ Hardware Experiments ({experiments.length})
        </button>
      </div>

      {activeTab === 'protocols' ? (
        <div className="protocols-lab-view">
          {/* 3 Protocol Cards Grid */}
          <div className="proto-cards-grid">
            {(['uart', 'i2c', 'spi'] as const).map((key) => {
              const proto = protocolLabs[key];
              return (
                <ProtocolCard
                  key={key}
                  protoKey={key}
                  proto={proto}
                  isSelected={selectedProto === key}
                  onSelect={() => setSelectedProto(key)}
                />
              );
            })}
          </div>

          {/* Active Selected Protocol Interactive Steps Panel */}
          <div className="active-proto-steps-panel">
            <div className="active-proto-header">
              <div className="header-text-group">
                <div className="proto-active-pill">
                  <span className="live-dot" />
                  <span>{selectedProto.toUpperCase()} LABORATORY</span>
                </div>
                <h2>{protocolLabs[selectedProto].name} — Interactive Steps</h2>
                <p>{protocolLabs[selectedProto].description}</p>
              </div>
              <Link href="/learn" className="btn-learn-center">
                <span>Open in Learn Center</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="steps-grid-aligned">
              {protocolLabs[selectedProto].steps.map((step) => (
                <Link
                  key={step.id}
                  href={`/learn?tab=protocols&proto=${selectedProto}&step=${step.id}`}
                  className="step-card-item"
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
        /* Hardware Experiments Grid */
        <div className="experiments-grid">
          {experiments.map((exp, i) => (
            <div key={i} className="exp-card-item">
              <div className="exp-card-header">
                <span className={`exp-badge-diff badge-${exp.difficulty}`}>
                  {exp.difficulty.toUpperCase()}
                </span>
                <span className="exp-time-tag">⏱ {exp.estimatedMin} min</span>
              </div>

              <h3 className="exp-card-title">{exp.title}</h3>
              <p className="exp-objective-text">{exp.objective}</p>

              <div className="exp-hardware-group">
                <span className="exp-section-label">Required Hardware</span>
                <div className="hw-tags-row">
                  {exp.hardware.map((h, j) => (
                    <span key={j} className="hw-tag-chip">{h}</span>
                  ))}
                </div>
              </div>

              <div className="exp-steps-group">
                <span className="exp-section-label">Steps ({exp.steps.length})</span>
                <div className="exp-steps-list">
                  {exp.steps.slice(0, 3).map((step, j) => (
                    <div key={j} className="exp-step-row">
                      <span className="step-circle-num">{step.order}</span>
                      <span className="step-title-span">{step.title}</span>
                    </div>
                  ))}
                  {exp.steps.length > 3 && (
                    <span className="more-steps-tag">+{exp.steps.length - 3} more steps...</span>
                  )}
                </div>
              </div>

              <div className="exp-card-footer">
                <Link href={`/experiment/${exp.id}`} className="btn-start-exp">
                  <span>Start Experiment</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .experiment-page-wrapper {
          max-width: 1440px;
          margin: 0 auto;
          padding: 3.5rem 2.5rem 6rem;
          color: #ffffff;
          font-family: var(--font-sans, 'General Sans', -apple-system, sans-serif);
        }

        /* Page Header */
        .page-header-block {
          text-align: center;
          margin-bottom: 2.75rem;
        }

        .header-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.95rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #27272a;
          border-radius: 9999px;
          color: #a1a1aa;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }

        .page-main-title {
          font-size: clamp(2.2rem, 3.8vw, 3rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-bottom: 0.75rem;
        }

        .page-sub-description {
          color: #71717a;
          font-size: 1.05rem;
          max-width: 720px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Mode Toggle */
        .lab-toggle-row {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3.5rem;
        }

        .toggle-tab-btn {
          padding: 0.75rem 1.75rem;
          border-radius: 9999px;
          background: #09090b;
          border: 1px solid #18181b;
          color: #71717a;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-tab-btn:hover {
          color: #ffffff;
          border-color: #27272a;
        }

        .toggle-tab-btn.active {
          background: #18181b;
          border-color: #3f3f46;
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
        }

        /* 3 Protocol Cards Grid */
        .proto-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.75rem;
          margin-bottom: 2.75rem;
        }

        .proto-summary-card {
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(22, 22, 28, 0.78) 0%, rgba(12, 12, 16, 0.88) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 2.25rem 2rem;
          cursor: pointer;
          box-shadow: 
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 0 0 1px rgba(255, 255, 255, 0.02),
            0 10px 30px rgba(0, 0, 0, 0.8);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.25s ease,
                      background 0.25s ease,
                      box-shadow 0.25s ease;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          user-select: none;
        }

        .card-ambient-edge {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: radial-gradient(800px circle at top center, rgba(255, 255, 255, 0.04), transparent 70%);
          pointer-events: none;
          z-index: 1;
        }

        .proto-summary-card:hover {
          border-color: rgba(255, 255, 255, 0.32);
          background: linear-gradient(180deg, rgba(28, 28, 36, 0.85) 0%, rgba(16, 16, 22, 0.92) 100%);
          transform: translateY(-3px);
          box-shadow: 
            inset 0 1px 2px 0 rgba(255, 255, 255, 0.2),
            0 0 18px 0 rgba(255, 255, 255, 0.05),
            0 14px 38px rgba(0, 0, 0, 0.85);
        }

        .proto-summary-card.active-selected {
          background: linear-gradient(180deg, rgba(30, 30, 38, 0.92) 0%, rgba(18, 18, 24, 0.96) 100%);
          border-color: rgba(255, 255, 255, 0.55);
          box-shadow: 
            inset 0 1px 2px 0 rgba(255, 255, 255, 0.25),
            0 0 26px 0 rgba(255, 255, 255, 0.08),
            0 18px 45px rgba(0, 0, 0, 0.92);
          transform: translateY(-2px);
        }

        /* Cursor-Following & Touch-Following Spotlight Effect */
        .card-mouse-flare {
          position: absolute;
          top: 0;
          left: 0;
          width: 380px;
          height: 380px;
          margin-top: -190px;
          margin-left: -190px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          background: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.13) 0%,
            rgba(255, 255, 255, 0.04) 40%,
            transparent 70%
          );
          filter: blur(14px);
          transition: opacity 0.25s ease;
          will-change: transform, opacity;
        }

        .card-inner-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .card-top-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .proto-code-badge {
          font-family: var(--font-mono, monospace);
          font-size: 0.82rem;
          font-weight: 700;
          color: #f1f1f5;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          letter-spacing: 0.08em;
          transition: all 0.2s ease;
        }

        .proto-summary-card.active-selected .proto-code-badge {
          background: rgba(255, 255, 255, 0.16);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.38);
        }

        .step-counter-tag {
          font-size: 0.82rem;
          color: #888894;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .proto-summary-card.active-selected .step-counter-tag {
          color: #b0b0bc;
        }

        .proto-card-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.015em;
          margin: 0 0 0.75rem 0;
          transition: color 0.2s ease;
        }

        .proto-summary-card.active-selected .proto-card-title {
          color: #ffffff;
        }

        .proto-card-desc {
          font-size: 0.92rem;
          line-height: 1.6;
          color: #9c9ca8;
          margin-bottom: 2rem;
          flex: 1;
          transition: color 0.2s ease;
        }

        .proto-summary-card.active-selected .proto-card-desc {
          color: #bcbcc8;
        }

        .card-bottom-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.88rem;
          color: #8e8e9c;
          font-weight: 500;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1.25rem;
          transition: all 0.2s ease;
        }

        .proto-summary-card:hover .card-bottom-action {
          color: #ffffff;
          border-top-color: rgba(255, 255, 255, 0.16);
        }

        .proto-summary-card.active-selected .card-bottom-action {
          border-top-color: rgba(255, 255, 255, 0.22);
          color: #ffffff;
        }

        .proto-summary-card:hover .action-arrow {
          transform: translateX(4px);
          color: #ffffff;
        }

        .action-arrow {
          transition: transform 0.2s ease, color 0.2s ease;
          font-size: 1rem;
          color: #71717a;
        }

        .proto-summary-card.active-selected .action-arrow {
          color: #ffffff;
        }

        .selected-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #ffffff;
          font-weight: 600;
        }

        .selected-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 8px #ffffff, 0 0 16px rgba(255, 255, 255, 0.7);
        }

        /* Active Protocol Deep-Dive Steps Panel */
        .active-proto-steps-panel {
          background: #09090b;
          border: 1px solid #18181b;
          border-radius: 16px;
          padding: 2.75rem 2.5rem;
        }

        .active-proto-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.25rem;
          border-bottom: 1px solid #18181b;
          padding-bottom: 1.75rem;
          gap: 2rem;
        }

        .proto-active-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 600;
          color: #a1a1aa;
          letter-spacing: 0.08em;
          border: 1px solid #27272a;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          margin-bottom: 0.75rem;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
        }

        .active-proto-header h2 {
          font-size: 1.65rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 0.35rem;
          letter-spacing: -0.02em;
        }

        .active-proto-header p {
          font-size: 0.95rem;
          color: #71717a;
          line-height: 1.55;
        }

        .btn-learn-center {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.35rem;
          border-radius: 9999px;
          border: 1px solid #3f3f46;
          background: #111113;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .btn-learn-center:hover {
          border-color: #71717a;
          background: #18181b;
          transform: translateY(-1px);
        }

        .steps-grid-aligned {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.25rem;
        }

        .step-card-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem 1.35rem;
          background: #050507;
          border-radius: 12px;
          border: 1px solid #18181b;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .step-card-item:hover {
          border-color: #3f3f46;
          background: #0c0c0f;
          transform: translateY(-2px);
        }

        .step-num-pill {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-family: var(--font-mono, monospace);
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
          background: #111113;
          border: 1px solid #27272a;
          border-radius: 8px;
          margin-top: 2px;
        }

        .step-content-col {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .step-content-col h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          line-height: 1.4;
        }

        .step-content-col p {
          font-size: 0.82rem;
          color: #71717a;
          line-height: 1.5;
          margin: 0;
        }

        .step-link-arrow {
          margin-left: auto;
          color: #71717a;
          font-size: 1rem;
          flex-shrink: 0;
          align-self: center;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .step-card-item:hover .step-link-arrow {
          color: #ffffff;
          transform: translateX(3px);
        }

        /* Hardware Experiments Grid */
        .experiments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.75rem;
        }

        .exp-card-item {
          background: #09090b;
          border: 1px solid #18181b;
          border-radius: 14px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          transition: all 0.25s ease;
        }

        .exp-card-item:hover {
          border-color: #27272a;
          background: #0c0c0f;
          transform: translateY(-2px);
        }

        .exp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .exp-badge-diff {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          padding: 0.15rem 0.55rem;
          border-radius: 9999px;
          border: 1px solid #27272a;
          color: #a1a1aa;
        }

        .exp-time-tag {
          font-size: 0.78rem;
          color: #71717a;
        }

        .exp-card-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .exp-objective-text {
          font-size: 0.88rem;
          line-height: 1.6;
          color: #71717a;
          margin-bottom: 1.5rem;
        }

        .exp-hardware-group,
        .exp-steps-group {
          margin-bottom: 1.25rem;
        }

        .exp-section-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #52525b;
          margin-bottom: 0.5rem;
        }

        .hw-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .hw-tag-chip {
          padding: 0.2rem 0.55rem;
          background: #111113;
          border: 1px solid #18181b;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #a1a1aa;
        }

        .exp-steps-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .exp-step-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.82rem;
          color: #a1a1aa;
        }

        .step-circle-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #18181b;
          border: 1px solid #27272a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.68rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .more-steps-tag {
          font-size: 0.75rem;
          color: #71717a;
          padding-left: 28px;
        }

        .exp-card-footer {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid #18181b;
        }

        .btn-start-exp {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          background: #111113;
          border: 1px solid #27272a;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-start-exp:hover {
          border-color: #3f3f46;
          background: #18181b;
          transform: translateY(-1px);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .proto-cards-grid {
            grid-template-columns: 1fr;
          }
          .active-proto-header {
            flex-direction: column;
            gap: 1.25rem;
          }
          .steps-grid-aligned {
            grid-template-columns: 1fr;
          }
          .experiments-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
