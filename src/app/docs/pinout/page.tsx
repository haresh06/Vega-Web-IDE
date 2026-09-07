'use client';

import Link from 'next/link';
import { ExternalLink, FileText, ZoomIn, ChevronRight, Info, ArrowLeft } from 'lucide-react';

export default function PinoutPage() {
  return (
    <div className="pinout-doc-page">
      {/* Top Breadcrumbs */}
      <nav className="doc-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/docs" className="breadcrumb-link">
          <ArrowLeft size={13} className="breadcrumb-back-icon" />
          <span>Documentation</span>
        </Link>
        <ChevronRight size={13} className="breadcrumb-sep" />
        <Link href="/docs" className="breadcrumb-link">Pinout</Link>
        <ChevronRight size={13} className="breadcrumb-sep" />
        <span className="breadcrumb-current">ARIES v2.0 Pinout Diagram</span>
      </nav>

      {/* Page Header with Action Buttons */}
      <header className="pinout-page-header">
        <div className="header-left">
          <div className="header-title-row">
            <span className="header-icon">📌</span>
            <h1>ARIES v2.0 Pinout Diagram</h1>
          </div>
          <p className="header-subtitle">
            Complete pinout reference for the VEGA ARIES v2.0 development board.
          </p>
        </div>

        <div className="header-actions">
          <a
            href="/docs/ARIESv2_0_Datasheet.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-open-datasheet-header"
          >
            <FileText size={15} />
            <span>Open Datasheet</span>
            <ExternalLink size={14} />
          </a>
          <span className="pdf-tag">PDF</span>
        </div>
      </header>

      {/* Main Pinout Presentation Panel */}
      <main className="pinout-main-card">
        {/* Top bar with quick indicator */}
        <div className="card-top-bar">
          <span className="board-badge">VEGA ARIES v2.0 • THEJAS32 RISC-V</span>
          <a
            href="/images/aries-v2-pinout.png"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-quick-zoom"
            title="Open full-resolution image in new tab"
          >
            <ZoomIn size={14} />
            <span>View Full Size</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* High-Resolution Diagram Container */}
        <div className="diagram-scroll-viewport">
          <img
            src="/images/aries-v2-pinout.png"
            alt="Official VEGA ARIES v2.0 Pinout and Connector Mapping Diagram"
            className="pinout-full-diagram"
          />
        </div>

        {/* Card Footer Actions */}
        <div className="card-bottom-bar">
          <a
            href="/images/aries-v2-pinout.png"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-view-fullsize-large"
          >
            <ZoomIn size={16} />
            <span>View Full Size (Original Resolution)</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </main>

      {/* Technical Information Note */}
      <aside className="technical-info-note">
        <Info size={16} className="note-icon" />
        <p className="note-text">
          Pin assignments and peripheral functions are based on the official VEGA ARIES v2.0 documentation.
          Refer to the official datasheet for complete electrical and functional specifications.
        </p>
      </aside>

      <style jsx>{`
        .pinout-doc-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.25rem 2rem 5rem 2rem;
          font-family: 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #e2e8f0;
        }

        /* --------------------------------------------------------
           BREADCRUMBS
        -------------------------------------------------------- */
        .doc-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
        }

        .breadcrumb-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #06d6a0;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .breadcrumb-link:hover {
          color: #38bdf8;
          text-decoration: underline;
        }

        .breadcrumb-back-icon {
          margin-right: 2px;
        }

        .breadcrumb-sep {
          color: #475569;
        }

        .breadcrumb-current {
          color: #94a3b8;
          font-weight: 500;
        }

        /* --------------------------------------------------------
           PAGE HEADER
        -------------------------------------------------------- */
        .pinout-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .header-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-icon {
          font-size: 1.75rem;
        }

        .header-title-row h1 {
          font-family: 'General Sans', sans-serif;
          font-size: 2.2rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          color: #94a3b8;
          font-size: 1rem;
          margin: 0;
          line-height: 1.5;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 0.25rem;
        }

        .btn-open-datasheet-header {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0.65rem 1.15rem;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(6, 214, 160, 0.15), rgba(56, 189, 248, 0.12));
          border: 1px solid rgba(6, 214, 160, 0.35);
          color: #06d6a0;
          font-family: 'General Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-open-datasheet-header:hover {
          background: linear-gradient(135deg, #06d6a0, #0284c7);
          color: #041210;
          border-color: transparent;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(6, 214, 160, 0.35);
        }

        .pdf-tag {
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 800;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 4px 8px;
          border-radius: 6px;
        }

        /* --------------------------------------------------------
           MAIN PINOUT PANEL
        -------------------------------------------------------- */
        .pinout-main-card {
          background: #0d1322;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          margin-bottom: 2rem;
          transition: border-color 0.2s ease;
        }

        .pinout-main-card:hover {
          border-color: rgba(6, 214, 160, 0.25);
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .board-badge {
          font-family: var(--font-mono, monospace);
          font-size: 0.78rem;
          font-weight: 700;
          color: #06d6a0;
          background: rgba(6, 214, 160, 0.1);
          border: 1px solid rgba(6, 214, 160, 0.25);
          padding: 3px 10px;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }

        .btn-quick-zoom {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .btn-quick-zoom:hover {
          color: #06d6a0;
        }

        .diagram-scroll-viewport {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow-x: auto;
          padding: 0.5rem 0 1.5rem 0;
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 214, 160, 0.3) rgba(255, 255, 255, 0.05);
        }

        .pinout-full-diagram {
          width: 100%;
          max-width: 1060px;
          height: auto;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          object-fit: contain;
          display: block;
        }

        .card-bottom-bar {
          display: flex;
          justify-content: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .btn-view-fullsize-large {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0.75rem 1.75rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #f1f5f9;
          font-family: 'General Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-view-fullsize-large:hover {
          background: linear-gradient(135deg, rgba(6, 214, 160, 0.2), rgba(56, 189, 248, 0.15));
          border-color: rgba(6, 214, 160, 0.4);
          color: #06d6a0;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(6, 214, 160, 0.25);
        }

        /* --------------------------------------------------------
           TECHNICAL INFO NOTE
        -------------------------------------------------------- */
        .technical-info-note {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 1.15rem 1.4rem;
          background: rgba(6, 214, 160, 0.05);
          border: 1px solid rgba(6, 214, 160, 0.2);
          border-radius: 10px;
          color: #94a3b8;
          font-size: 0.88rem;
          line-height: 1.6;
        }

        .note-icon {
          color: #06d6a0;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .note-text {
          margin: 0;
        }

        /* --------------------------------------------------------
           RESPONSIVE BREAKPOINTS
        -------------------------------------------------------- */
        @media (max-width: 768px) {
          .pinout-doc-page {
            padding: 1.5rem 1rem 3.5rem 1rem;
          }
          .pinout-page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .header-title-row h1 {
            font-size: 1.7rem;
          }
          .pinout-main-card {
            padding: 1rem 0.75rem;
          }
          .btn-view-fullsize-large {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
