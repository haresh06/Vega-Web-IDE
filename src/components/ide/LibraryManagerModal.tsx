'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, BookOpen, Download, Trash2, CheckCircle2, AlertCircle, RefreshCw, Search } from 'lucide-react';

interface LibraryItem {
  name: string;
  displayName: string;
  author: string;
  version: string;
  description: string;
  header: string;
  category: string;
  url?: string;
  isLocal?: boolean;
  installed?: boolean;
}

interface LibraryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  helperUrl?: string;
}

export default function LibraryManagerModal({ isOpen, onClose, helperUrl = 'http://127.0.0.1:4000' }: LibraryManagerModalProps) {
  const [libraries, setLibraries] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [helperConnected, setHelperConnected] = useState(true);

  const fetchLibraries = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const targetUrls = [helperUrl, 'http://127.0.0.1:4000', 'http://localhost:4000'];
      let res: Response | null = null;

      for (const base of targetUrls) {
        try {
          const r = await fetch(`${base}/libraries`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            cache: 'no-store',
          });
          if (r.ok) {
            res = r;
            break;
          }
        } catch {}
      }

      if (!res) {
        setHelperConnected(false);
        setLibraries([
          {
            name: 'SPI',
            displayName: 'SPI (Hardware SPI Driver)',
            author: 'C-DAC',
            version: '1.0.0',
            description: 'Hardware SPI communication library for THEJAS32 / VEGA ARIES v2',
            header: 'SPI.h',
            category: 'Communication',
            isLocal: true,
            installed: false,
          },
          {
            name: 'Wire',
            displayName: 'Wire (I2C Master Driver)',
            author: 'C-DAC',
            version: '1.0.0',
            description: 'Hardware I2C / TWI communication library for THEJAS32 / VEGA ARIES v2',
            header: 'Wire.h',
            category: 'Communication',
            isLocal: true,
            installed: false,
          },
          {
            name: 'MD_MAX72xx',
            displayName: 'MD_MAX72xx',
            author: 'MajicDesigns',
            version: '3.5.1',
            description: 'LED Matrix Controller for MAX7219/MAX7221 displays',
            header: 'MD_MAX72xx.h',
            category: 'Display',
            installed: false,
          },
          {
            name: 'LiquidCrystal_I2C',
            displayName: 'LiquidCrystal I2C',
            author: 'Frank de Brabander / Marco Schwartz',
            version: '1.1.2',
            description: 'I2C LCD controller for HD44780 displays using PCF8574 I2C backpack',
            header: 'LiquidCrystal_I2C.h',
            category: 'Display',
            installed: false,
          },
        ]);
        return;
      }

      setHelperConnected(true);
      const data = await res.json();
      if (data.success && Array.isArray(data.curatedCatalog)) {
        setLibraries(data.curatedCatalog);
      }
    } catch {
      setHelperConnected(false);
    } finally {
      setLoading(false);
    }
  }, [helperUrl]);

  useEffect(() => {
    if (isOpen) {
      fetchLibraries();
    }
  }, [isOpen, fetchLibraries]);

  const handleInstall = async (lib: LibraryItem) => {
    setActionInProgress(lib.name);
    setStatusMessage(null);
    try {
      const targetUrls = [helperUrl, 'http://127.0.0.1:4000', 'http://localhost:4000'];
      let success = false;
      let errorMsg = 'Failed to connect to VEGA Compiler Helper';

      for (const base of targetUrls) {
        try {
          const res = await fetch(`${base}/libraries/install`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: lib.name }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            success = true;
            setStatusMessage({ type: 'success', text: `✓ ${lib.displayName} installed successfully to C:\\VEGA-LAB\\libraries\\${lib.name}` });
            break;
          } else {
            errorMsg = data.error || errorMsg;
          }
        } catch {}
      }

      if (success) {
        await fetchLibraries();
      } else {
        setStatusMessage({ type: 'error', text: `❌ Installation error: ${errorMsg}` });
      }
    } catch (err: unknown) {
      setStatusMessage({ type: 'error', text: `❌ Installation error: ${(err as Error).message}` });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUninstall = async (lib: LibraryItem) => {
    setActionInProgress(lib.name);
    setStatusMessage(null);
    try {
      const targetUrls = [helperUrl, 'http://127.0.0.1:4000', 'http://localhost:4000'];
      let success = false;
      let errorMsg = 'Failed to connect to VEGA Compiler Helper';

      for (const base of targetUrls) {
        try {
          const res = await fetch(`${base}/libraries/${encodeURIComponent(lib.name)}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (res.ok && data.success) {
            success = true;
            setStatusMessage({ type: 'info', text: `ℹ️ Removed ${lib.displayName} from C:\\VEGA-LAB\\libraries\\${lib.name} (Built-in core fallback active)` });
            break;
          } else {
            errorMsg = data.error || errorMsg;
          }
        } catch {}
      }

      if (success) {
        await fetchLibraries();
      } else {
        setStatusMessage({ type: 'error', text: `❌ Uninstall error: ${errorMsg}` });
      }
    } catch (err: unknown) {
      setStatusMessage({ type: 'error', text: `❌ Uninstall error: ${(err as Error).message}` });
    } finally {
      setActionInProgress(null);
    }
  };

  if (!isOpen) return null;

  const filteredLibraries = libraries.filter(
    (lib) =>
      lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.header.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="lib-modal-overlay" onClick={onClose}>
      <div className="lib-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="lib-modal-header">
          <div className="lib-header-title">
            <BookOpen size={18} className="lib-title-icon" />
            <div>
              <h3>VEGA Library Manager</h3>
              <p className="lib-header-sub">Install verified drivers & libraries to C:\VEGA-LAB\libraries\</p>
            </div>
          </div>
          <button className="lib-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Search & Status Bar */}
        <div className="lib-search-bar">
          <div className="lib-search-input-wrap">
            <Search size={14} className="lib-search-icon" />
            <input
              type="text"
              className="lib-search-input"
              placeholder="Search libraries by name, header (e.g. SPI.h), or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <button className="lib-refresh-btn" onClick={fetchLibraries} disabled={loading} title="Refresh library list">
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          </button>
        </div>

        {/* Notice if helper is disconnected */}
        {!helperConnected && (
          <div className="lib-alert-banner warning">
            <AlertCircle size={14} />
            <span>VEGA Compiler Helper is offline (http://127.0.0.1:4000). Please ensure VEGA Lab is running on your PC.</span>
          </div>
        )}

        {/* Live Status Feedback */}
        {statusMessage && (
          <div className={`lib-alert-banner ${statusMessage.type}`}>
            {statusMessage.type === 'success' && <CheckCircle2 size={14} />}
            {statusMessage.type === 'error' && <AlertCircle size={14} />}
            {statusMessage.type === 'info' && <BookOpen size={14} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Library Cards List */}
        <div className="lib-cards-list">
          {filteredLibraries.length === 0 ? (
            <div className="lib-empty-state">
              <BookOpen size={32} opacity={0.3} />
              <p>No libraries matching &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            filteredLibraries.map((lib) => (
              <div key={lib.name} className={`lib-card ${lib.installed ? 'installed' : ''}`}>
                <div className="lib-card-info">
                  <div className="lib-card-title-row">
                    <span className="lib-card-name">{lib.displayName}</span>
                    <span className="lib-category-badge">{lib.category}</span>
                    {lib.installed && (
                      <span className="lib-installed-badge">
                        <CheckCircle2 size={11} /> Installed
                      </span>
                    )}
                  </div>
                  <div className="lib-card-meta">
                    <span className="lib-meta-author">{lib.author}</span>
                    <span className="lib-meta-sep">•</span>
                    <span className="lib-meta-version">v{lib.version}</span>
                    <span className="lib-meta-sep">•</span>
                    <code className="lib-meta-header">#include &lt;{lib.header}&gt;</code>
                  </div>
                  <p className="lib-card-desc">{lib.description}</p>
                </div>

                <div className="lib-card-actions">
                  {lib.installed ? (
                    <div className="lib-action-btn-group">
                      <button
                        type="button"
                        className="lib-btn lib-btn-danger"
                        onClick={() => handleUninstall(lib)}
                        disabled={actionInProgress === lib.name}
                        title="Uninstall library from user directory"
                      >
                        <Trash2 size={13} />
                        <span>{actionInProgress === lib.name ? 'Removing...' : 'Uninstall'}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="lib-btn lib-btn-primary"
                      onClick={() => handleInstall(lib)}
                      disabled={actionInProgress === lib.name || !helperConnected}
                      title="Install library to C:\VEGA-LAB\libraries\"
                    >
                      <Download size={13} />
                      <span>{actionInProgress === lib.name ? 'Installing...' : 'Install'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="lib-modal-footer">
          <span className="lib-footer-hint">
            💡 When code contains <code>#include &lt;SPI.h&gt;</code>, the compiler automatically discovers and links the library.
          </span>
          <button className="lib-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .lib-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1.5rem;
          animation: lib-fade-in 0.15s ease-out;
        }
        .lib-modal-container {
          background: #0f172a;
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 12px;
          width: 100%;
          max-width: 680px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.1);
          overflow: hidden;
        }
        .lib-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(30, 41, 59, 0.5);
        }
        .lib-header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .lib-title-icon {
          color: var(--color-accent-cyan, #38bdf8);
        }
        .lib-header-title h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #f8fafc;
        }
        .lib-header-sub {
          margin: 0;
          font-size: 0.72rem;
          color: #94a3b8;
          font-family: var(--font-mono, monospace);
        }
        .lib-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .lib-close-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        .lib-search-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(15, 23, 42, 0.6);
        }
        .lib-search-input-wrap {
          display: flex;
          align-items: center;
          flex: 1;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 0.35rem 0.6rem;
          gap: 0.5rem;
        }
        .lib-search-icon {
          color: #64748b;
        }
        .lib-search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #f1f5f9;
          font-size: 0.82rem;
          outline: none;
        }
        .lib-refresh-btn {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          cursor: pointer;
          padding: 0.45rem;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }
        .lib-refresh-btn:hover {
          color: #38bdf8;
          border-color: #38bdf8;
        }
        .lib-alert-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 1.25rem;
          font-size: 0.76rem;
          font-weight: 500;
        }
        .lib-alert-banner.success {
          background: rgba(6, 214, 160, 0.12);
          border-bottom: 1px solid rgba(6, 214, 160, 0.3);
          color: #06d6a0;
        }
        .lib-alert-banner.error {
          background: rgba(239, 68, 68, 0.12);
          border-bottom: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }
        .lib-alert-banner.warning {
          background: rgba(251, 191, 36, 0.12);
          border-bottom: 1px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
        }
        .lib-alert-banner.info {
          background: rgba(56, 189, 248, 0.12);
          border-bottom: 1px solid rgba(56, 189, 248, 0.3);
          color: #38bdf8;
        }
        .lib-cards-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .lib-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 0.85rem 1rem;
          transition: all 0.2s ease;
          gap: 1rem;
        }
        .lib-card:hover {
          border-color: rgba(56, 189, 248, 0.3);
          background: rgba(30, 41, 59, 0.6);
        }
        .lib-card.installed {
          border-color: rgba(6, 214, 160, 0.3);
          background: rgba(6, 214, 160, 0.03);
        }
        .lib-card-info {
          flex: 1;
        }
        .lib-card-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .lib-card-name {
          font-weight: 700;
          font-size: 0.88rem;
          color: #f8fafc;
        }
        .lib-category-badge {
          font-size: 0.66rem;
          font-weight: 600;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.25);
        }
        .lib-installed-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.66rem;
          font-weight: 600;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          background: rgba(6, 214, 160, 0.15);
          color: #06d6a0;
          border: 1px solid rgba(6, 214, 160, 0.3);
        }
        .lib-card-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          color: #94a3b8;
          margin-bottom: 0.35rem;
        }
        .lib-meta-header {
          font-family: var(--font-mono, monospace);
          color: #e2e8f0;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.05rem 0.3rem;
          border-radius: 3px;
          font-size: 0.7rem;
        }
        .lib-card-desc {
          margin: 0;
          font-size: 0.76rem;
          color: #cbd5e1;
          line-height: 1.35;
        }
        .lib-card-actions {
          display: flex;
          align-items: center;
        }
        .lib-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          font-size: 0.76rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .lib-btn-primary {
          background: #38bdf8;
          color: #0f172a;
        }
        .lib-btn-primary:hover:not(:disabled) {
          background: #7dd3fc;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
        }
        .lib-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .lib-btn-danger {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }
        .lib-btn-danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.25);
        }
        .lib-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(30, 41, 59, 0.4);
        }
        .lib-footer-hint {
          font-size: 0.72rem;
          color: #94a3b8;
        }
        .lib-footer-hint code {
          color: #38bdf8;
          font-family: var(--font-mono, monospace);
        }
        .lib-btn-close {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f1f5f9;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 0.35rem 0.85rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .lib-btn-close:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .lib-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 0;
          color: #64748b;
          gap: 0.5rem;
        }
        .spinning {
          animation: lib-spin 1s linear infinite;
        }
        @keyframes lib-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes lib-fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
