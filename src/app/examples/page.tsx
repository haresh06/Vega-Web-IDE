'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Cpu,
  BookOpen,
  Code2,
  Lightbulb,
  Palette,
  ToggleLeft,
  Terminal,
  Monitor,
  Grid,
  Layers,
  ArrowRight,
  X,
  Copy,
  Check,
  AlertTriangle,
  FileCode,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { EXAMPLE_CATEGORIES, EXAMPLES_DATA } from '@/data/examples';
import { Example, ExampleCategory, ExampleFile } from '@/types/example';
import './examples.css';

// Map icon string to Lucide icon component
function renderExampleIcon(iconName: string, size = 20) {
  switch (iconName.toLowerCase()) {
    case 'lightbulb':
      return <Lightbulb size={size} />;
    case 'palette':
      return <Palette size={size} />;
    case 'toggleleft':
      return <ToggleLeft size={size} />;
    case 'terminal':
      return <Terminal size={size} />;
    case 'search':
      return <Search size={size} />;
    case 'monitor':
      return <Monitor size={size} />;
    case 'grid':
      return <Grid size={size} />;
    case 'cpu':
      return <Cpu size={size} />;
    default:
      return <Sparkles size={size} />;
  }
}

export default function ExamplesPage() {
  const router = useRouter();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExampleCategory>('All');

  // Modal State
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [previewActiveFileName, setPreviewActiveFileName] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Unsaved Warning State
  const [pendingOpenExample, setPendingOpenExample] = useState<Example | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Filtered Examples
  const filteredExamples = useMemo(() => {
    return EXAMPLES_DATA.filter(example => {
      // Category Match
      const matchesCategory =
        selectedCategory === 'All' ||
        example.category === selectedCategory ||
        example.secondaryCategories?.includes(selectedCategory);

      // Search Query Match
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        example.name.toLowerCase().includes(q) ||
        example.description.toLowerCase().includes(q) ||
        example.category.toLowerCase().includes(q) ||
        example.hardware.some(h => h.toLowerCase().includes(q)) ||
        example.libraries.some(l => l.toLowerCase().includes(q)) ||
        example.whatYouLearn.some(w => w.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  // Handle open details modal
  const handleOpenDetails = (example: Example) => {
    setSelectedExample(example);
    setPreviewActiveFileName(example.mainFile || example.files[0]?.name || '');
    setCopiedCode(false);
  };

  const handleCloseDetails = () => {
    setSelectedExample(null);
    setCopiedCode(false);
  };

  // Copy code from preview
  const handleCopyCode = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Check if current project in IDE has modified/unsaved code
  const checkHasUnsavedChanges = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const savedFilesStr = localStorage.getItem('vega_ide_project_files_v2');
      if (!savedFilesStr) return false;

      const cleanBaselineStr = localStorage.getItem('vega_ide_clean_baseline');
      if (cleanBaselineStr && cleanBaselineStr === savedFilesStr) {
        return false;
      }

      // If user has a saved project that differs from clean baseline or has more than 0 files
      const parsed = JSON.parse(savedFilesStr);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        // If there's an explicit clean baseline that differs, prompt unsaved
        if (cleanBaselineStr && cleanBaselineStr !== savedFilesStr) {
          return true;
        }
      }
    } catch {
      return false;
    }
    return false;
  };

  // Initiating the "Open in IDE" flow
  const handleInitiateOpenInIde = (example: Example) => {
    if (checkHasUnsavedChanges()) {
      setPendingOpenExample(example);
      setShowUnsavedWarning(true);
    } else {
      executeLoadExampleToIde(example);
    }
  };

  // Perform actual transfer of example files to IDE localStorage and navigate
  const executeLoadExampleToIde = (example: Example) => {
    try {
      const filesMap: Record<string, { content: string; language: string }> = {};

      example.files.forEach((file: ExampleFile) => {
        let lang = file.language || 'c';
        if (file.name.endsWith('.cpp')) lang = 'cpp';
        if (file.name.endsWith('.c') || file.name.endsWith('.h')) lang = 'c';
        if (file.name.endsWith('.md')) lang = 'markdown';

        filesMap[file.name] = {
          content: file.content,
          language: lang,
        };
      });

      const serialized = JSON.stringify(filesMap);
      localStorage.setItem('vega_ide_project_files_v2', serialized);
      localStorage.setItem('vega_ide_active_file_v2', example.mainFile || Object.keys(filesMap)[0]);
      localStorage.setItem('vega_ide_project_name', example.name);
      localStorage.setItem('vega_ide_clean_baseline', serialized);

      // Close all modals
      setShowUnsavedWarning(false);
      setSelectedExample(null);
      setPendingOpenExample(null);

      // Seamlessly navigate to existing IDE
      router.push('/ide');
    } catch (err) {
      console.error('Error loading example into IDE:', err);
      router.push('/ide');
    }
  };

  return (
    <div className="examples-page">
      {/* 1. Header & Hero */}
      <div className="examples-header">
        <div className="examples-header-badge">
          <Sparkles size={14} />
          <span>VEGA ARIES v2 • RV32IM</span>
        </div>
        <h1 className="examples-title">Examples</h1>
        <p className="examples-subtitle">
          Learn, explore and build with ready-to-use examples for VEGA ARIES v2.
        </p>

        {/* Quick Highlights */}
        <div className="examples-stats-row">
          <div className="stat-chip">
            <div className="stat-chip-icon">
              <Code2 size={20} />
            </div>
            <div className="stat-chip-text">
              <span className="stat-chip-value">{EXAMPLES_DATA.length} Verified</span>
              <span className="stat-chip-label">Production Examples</span>
            </div>
          </div>

          <div className="stat-chip">
            <div className="stat-chip-icon">
              <Cpu size={20} />
            </div>
            <div className="stat-chip-text">
              <span className="stat-chip-value">THEJAS32</span>
              <span className="stat-chip-label">RISC-V Microcontroller</span>
            </div>
          </div>

          <div className="stat-chip">
            <div className="stat-chip-icon">
              <BookOpen size={20} />
            </div>
            <div className="stat-chip-text">
              <span className="stat-chip-value">100% Native</span>
              <span className="stat-chip-label">Compiler Compatible</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Category Controls */}
      <div className="examples-controls">
        <div className="search-input-wrap">
          <div className="search-icon-box">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="examples-search-input"
            placeholder="Search examples by name, peripheral, sensor, or library (e.g. LCD, SPI, RGB, Button)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories Bar */}
        <div className="category-pills-wrap">
          {EXAMPLE_CATEGORIES.map(category => (
            <button
              key={category}
              type="button"
              className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Results Count Bar */}
      <div className="examples-count-bar">
        <span>
          Showing <span className="examples-count-highlight">{filteredExamples.length}</span> example
          {filteredExamples.length === 1 ? '' : 's'} in{' '}
          <strong style={{ color: '#cbd5e1' }}>{selectedCategory}</strong>
        </span>
        {searchQuery && (
          <button
            type="button"
            className="btn-reset-filter"
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </button>
        )}
      </div>

      {/* 4. Examples Cards Grid */}
      <div className="examples-grid">
        {filteredExamples.map(example => (
          <div key={example.id} className="example-card">
            <div>
              {/* Card Top */}
              <div className="example-card-top">
                <div className="example-icon-box">
                  {renderExampleIcon(example.icon, 22)}
                </div>
                <div className="example-badges-wrap">
                  <span className="example-category-badge">{example.category}</span>
                  {example.difficulty && (
                    <span
                      className={`example-difficulty-badge ${example.difficulty.toLowerCase()}`}
                    >
                      {example.difficulty}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="example-card-title">{example.name}</h3>
              <p className="example-card-desc">{example.description}</p>

              {/* Hardware & Libraries Meta */}
              <div className="example-meta-section">
                <div className="example-meta-row">
                  <span className="meta-label">
                    <Cpu size={12} /> Hardware:
                  </span>
                  {example.hardware.map((h, i) => (
                    <span key={i} className="meta-tag">
                      {h}
                    </span>
                  ))}
                </div>

                <div className="example-meta-row">
                  <span className="meta-label">
                    <BookOpen size={12} /> Libraries:
                  </span>
                  {example.libraries.length > 0 ? (
                    example.libraries.map((lib, i) => (
                      <span key={i} className="meta-tag lib-tag">
                        #{lib}
                      </span>
                    ))
                  ) : (
                    <span className="meta-tag" style={{ color: '#64748b' }}>
                      None (Built-in)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="example-card-actions">
              <button
                type="button"
                className="btn-example-details"
                onClick={() => handleOpenDetails(example)}
                title="Inspect example description, wiring, and source code preview"
              >
                <FileCode size={14} />
                <span>Details</span>
              </button>

              <button
                type="button"
                className="btn-example-open"
                onClick={() => handleInitiateOpenInIde(example)}
                title="Load this example project into the VEGA Studio IDE"
              >
                <span>Open in IDE</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredExamples.length === 0 && (
          <div className="examples-empty">
            <div className="empty-icon">
              <Search size={40} />
            </div>
            <h3 className="empty-title">No matching examples found</h3>
            <p className="empty-desc">
              Try adjusting your search terms or selecting a different category from the filters above.
            </p>
            <button
              type="button"
              className="btn-reset-filter"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          5. MODAL: EXAMPLE DETAILS & CODE PREVIEW
          ======================================================== */}
      {selectedExample && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div
            className="example-modal-card"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-breadcrumb">
                <span className="breadcrumb-root">Examples</span>
                <span>/</span>
                <span className="breadcrumb-active">{selectedExample.name}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseDetails}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Title & Badges */}
              <div className="modal-title-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="example-icon-box" style={{ width: 38, height: 38 }}>
                    {renderExampleIcon(selectedExample.icon, 20)}
                  </div>
                  <h2 className="modal-title">{selectedExample.name}</h2>
                </div>
                <div className="example-badges-wrap">
                  <span className="example-category-badge">{selectedExample.category}</span>
                  {selectedExample.difficulty && (
                    <span
                      className={`example-difficulty-badge ${selectedExample.difficulty.toLowerCase()}`}
                    >
                      {selectedExample.difficulty}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="modal-desc">{selectedExample.description}</p>

              {/* What You'll Learn */}
              <div>
                <h4 className="modal-section-title">
                  <CheckCircle2 size={16} /> What You&apos;ll Learn
                </h4>
                <ul className="learn-list">
                  {selectedExample.whatYouLearn.map((item, i) => (
                    <li key={i} className="learn-item">
                      <Check size={16} className="learn-check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hardware Required */}
              <div>
                <h4 className="modal-section-title">
                  <Cpu size={16} /> Hardware Required
                </h4>
                <div className="tags-row">
                  {selectedExample.hardware.map((h, i) => (
                    <span key={i} className="tag-badge">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Libraries Required */}
              <div>
                <h4 className="modal-section-title">
                  <BookOpen size={16} /> Libraries Required
                </h4>
                <div className="tags-row">
                  {selectedExample.libraries.length > 0 ? (
                    selectedExample.libraries.map((lib, i) => (
                      <span key={i} className="tag-badge lib">
                        #{lib}
                      </span>
                    ))
                  ) : (
                    <span className="tag-badge" style={{ color: '#64748b' }}>
                      No external libraries required (Core Arduino API)
                    </span>
                  )}
                </div>
              </div>

              {/* Source Code Preview */}
              <div>
                <h4 className="modal-section-title">
                  <Code2 size={16} /> Code Preview
                </h4>
                <div className="code-preview-wrap">
                  <div className="code-preview-header">
                    <div className="code-tabs">
                      {selectedExample.files.map(f => (
                        <button
                          key={f.name}
                          type="button"
                          className={`code-tab ${
                            previewActiveFileName === f.name ? 'active' : ''
                          }`}
                          onClick={() => setPreviewActiveFileName(f.name)}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="btn-copy-code"
                      onClick={() => {
                        const activeF =
                          selectedExample.files.find(f => f.name === previewActiveFileName) ||
                          selectedExample.files[0];
                        if (activeF) handleCopyCode(activeF.content);
                      }}
                      title="Copy code to clipboard"
                    >
                      {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div className="code-content-box">
                    {selectedExample.files.find(f => f.name === previewActiveFileName)?.content ||
                      selectedExample.files[0]?.content}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={handleCloseDetails}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-modal-primary"
                onClick={() => handleInitiateOpenInIde(selectedExample)}
              >
                <span>Open in IDE</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. MODAL: UNSAVED WORK WARNING DIALOG
          ======================================================== */}
      {showUnsavedWarning && pendingOpenExample && (
        <div
          className="modal-overlay"
          onClick={() => setShowUnsavedWarning(false)}
        >
          <div
            className="unsaved-modal-card"
            onClick={e => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="unsaved-title"
          >
            <div className="unsaved-icon-wrap">
              <AlertTriangle size={26} />
            </div>
            <h3 id="unsaved-title" className="unsaved-title">
              Your current project has unsaved changes.
            </h3>
            <p className="unsaved-desc">
              Opening <strong>&quot;{pendingOpenExample.name}&quot;</strong> will replace the current
              files in your IDE workspace. Any unsaved modifications will be lost.
            </p>
            <div className="unsaved-actions">
              <button
                type="button"
                className="btn-unsaved-cancel"
                onClick={() => {
                  setShowUnsavedWarning(false);
                  setPendingOpenExample(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-unsaved-confirm"
                onClick={() => executeLoadExampleToIde(pendingOpenExample)}
              >
                Open Example
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
