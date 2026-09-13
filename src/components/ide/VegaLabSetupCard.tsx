'use client';

import React from 'react';
import { Download, Monitor, CheckCircle2 } from 'lucide-react';
import { getVegaInstallerUrl } from '@/config/installer';

interface VegaLabSetupCardProps {
  className?: string;
  compact?: boolean;
}

export default function VegaLabSetupCard({ className = '', compact = false }: VegaLabSetupCardProps) {
  const downloadUrl = getVegaInstallerUrl();

  return (
    <div className={`vega-setup-card ${compact ? 'compact' : ''} ${className}`}>
      <div className="setup-header">
        <div className="setup-title-group">
          <Monitor size={compact ? 14 : 16} className="setup-icon" />
          <h4 className="setup-title">VEGA Lab Setup</h4>
        </div>
        <span className="platform-tag">Windows</span>
      </div>

      <p className="setup-desc">
        Install the VEGA Compiler Helper once to enable local Build & Flash.
      </p>

      <a
        href={downloadUrl}
        download="VEGA-Lab-Setup.exe"
        className="setup-download-btn"
        id="vega-lab-setup-download-btn"
      >
        <Download size={compact ? 13 : 15} className="download-icon" />
        <span>Download VEGA Lab Setup</span>
      </a>

      <div className="setup-note">
        <CheckCircle2 size={12} className="note-icon" />
        <span>One-time installation. No Arduino IDE required.</span>
      </div>

      <style jsx>{`
        .vega-setup-card {
          background: #0c0c0e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 0.85rem;
          margin: 0.75rem 0.5rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          transition: all 0.2s ease;
        }
        .vega-setup-card:hover {
          border-color: rgba(255, 255, 255, 0.16);
          background: #101014;
        }
        .vega-setup-card.compact {
          padding: 0.65rem;
          margin: 0.5rem;
          gap: 0.45rem;
        }
        .setup-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .setup-title-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        :global(.setup-icon) {
          color: #ffffff;
        }
        .setup-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .platform-tag {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #e4e4e7;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }
        .setup-desc {
          font-size: 0.73rem;
          line-height: 1.35;
          color: #a1a1aa;
          margin: 0;
        }
        .setup-download-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.45rem 0.75rem;
          background: #ffffff;
          color: #000000;
          font-size: 0.76rem;
          font-weight: 700;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          margin-top: 0.2rem;
          box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
        }
        .setup-download-btn:hover {
          transform: translateY(-1px);
          background: #e4e4e7;
          box-shadow: 0 4px 14px rgba(255, 255, 255, 0.2);
          color: #000000;
        }
        :global(.download-icon) {
          flex-shrink: 0;
        }
        .setup-note {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.67rem;
          color: #71717a;
          line-height: 1.25;
          margin-top: 0.1rem;
        }
        :global(.note-icon) {
          color: #a1a1aa;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
