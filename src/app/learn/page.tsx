'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { learningPaths, protocolLabs, sensorLabs } from '@/data/learning-content';

type TabType = 'paths' | 'protocols' | 'sensors' | 'peripherals';

function LearnContentComponent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'paths';
  const initialProto = (searchParams.get('proto') as 'uart' | 'i2c' | 'spi') || 'uart';
  const initialStep = Number(searchParams.get('step')) || 1;

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [expandedModule, setExpandedModule] = useState<string | null>('embedded-c-basics');
  const [selectedProtocol, setSelectedProtocol] = useState<'uart' | 'i2c' | 'spi'>(initialProto);
  const [selectedProtocolStep, setSelectedProtocolStep] = useState<number>(initialStep);

  const activeProtoData = protocolLabs[selectedProtocol];
  const activeStepData = activeProtoData.steps.find(s => s.id === selectedProtocolStep) || activeProtoData.steps[0];

  return (
    <div className="learn-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-badge">
          <span>📚</span> BARE-METAL CURRICULUM
        </div>
        <h1>VEGA Embedded Academy</h1>
        <p>Master RISC-V embedded development on THEJAS32 with interactive labs, code examples, and video masterclasses.</p>
      </div>

      {/* Tabs */}
      <div className="tab-container">
        <div className="tab-group-custom">
          {([
            { key: 'paths', label: '🗺️ Learning Paths', count: `${learningPaths.length} Paths` },
            { key: 'protocols', label: '🔌 Protocol Labs', count: 'UART, I2C, SPI' },
            { key: 'sensors', label: '🌡️ Sensor Labs', count: '4 Sensors' },
            { key: 'peripherals', label: '⚙️ Peripherals', count: 'Timers, ADC, PWM' },
          ] as { key: TabType; label: string; count: string }[]).map(tab => (
            <button
              key={tab.key}
              className={`custom-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-btn-title">{tab.label}</span>
              <span className="tab-btn-sub">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="learn-content">
        {/* TAB 1: LEARNING PATHS */}
        {activeTab === 'paths' && (
          <div className="learning-paths">
            {learningPaths.map((path, pathIdx) => (
              <div key={path.id} className="path-section">
                <div className="path-header-card">
                  <div className="path-badge-col">
                    <span className="path-pill" style={{
                      background: pathIdx === 0 ? 'linear-gradient(135deg, #06d6a0, #2dc653)' :
                        pathIdx === 1 ? 'linear-gradient(135deg, #4cc9f0, #7b2ff7)' :
                          'linear-gradient(135deg, #ff6b35, #f72585)'
                    }}>
                      {path.name.toUpperCase()} LEVEL
                    </span>
                  </div>
                  <div className="path-info-col">
                    <h2>{path.name} Embedded Development</h2>
                    <p>{path.description}</p>
                    <div className="path-meta-row">
                      <span><strong>{path.modules.length}</strong> Modules</span>
                      <span>•</span>
                      <span><strong>{path.modules.reduce((a, m) => a + m.estimatedTime, 0)}</strong> Mins Total</span>
                      <span>•</span>
                      <span><strong>{path.modules.reduce((a, m) => a + m.points, 0)}</strong> Points</span>
                    </div>
                  </div>
                </div>

                <div className="modules-list">
                  {path.modules.map((mod, modIdx) => {
                    const isExpanded = expandedModule === mod.id;
                    return (
                      <div
                        key={mod.id}
                        className={`module-card card ${mod.locked ? 'locked' : ''} ${mod.completed ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`}
                      >
                        <div
                          className="module-main-row"
                          onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                        >
                          <div className="module-number-box">
                            {mod.completed ? '✅' : mod.locked ? '🔒' : `${String(modIdx + 1).padStart(2, '0')}`}
                          </div>

                          <div className="module-title-col">
                            <div className="module-badge-row">
                              <span className={`badge badge-${mod.difficulty}`}>{mod.difficulty.toUpperCase()}</span>
                              <span className="module-time-tag">⏱ {mod.estimatedTime} min</span>
                              <span className="module-points-tag">⭐ {mod.points} pts</span>
                            </div>
                            <h3>{mod.title}</h3>
                            <p>{mod.description}</p>
                          </div>

                          <div className="module-expand-indicator">
                            <span className="chevron-icon">{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </div>

                        {/* Accordion Content */}
                        {isExpanded && (
                          <div className="module-details-drawer">
                            {/* Video Preview Banner if available */}
                            {mod.videoUrl && (
                              <div className="video-banner-preview">
                                <div className="video-tag">
                                  <span>▶ VIDEO MASTERCLASS INCLUDED</span>
                                </div>
                                <span className="video-title">{mod.videoTitle || 'Embedded Systems Video Guide'}</span>
                              </div>
                            )}

                            <div className="lessons-container">
                              <h4>COURSE LESSONS ({mod.lessons.length})</h4>
                              <div className="lesson-items-grid">
                                {mod.lessons.map((lesson, li) => (
                                  <Link
                                    href={`/learn/${mod.id}?lesson=${lesson.id}`}
                                    key={lesson.id}
                                    className="lesson-interactive-item"
                                  >
                                    <span className="lesson-bullet">{lesson.completed ? '✅' : '○'}</span>
                                    <span className="lesson-idx">{String(li + 1).padStart(2, '0')}</span>
                                    <span className="lesson-name">{lesson.title}</span>
                                    <span className="lesson-arrow">→</span>
                                  </Link>
                                ))}
                              </div>
                            </div>

                            <div className="module-footer-actions">
                              <Link href={`/learn/${mod.id}`} className="btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
                                {mod.completed ? '📖 Review Module & Video' : mod.progress ? '▶ Continue Learning' : '🚀 Start Module'}
                              </Link>
                              <Link href={`/ide?project=${mod.id}`} className="btn-secondary" style={{ padding: '0.65rem 1.2rem' }}>
                                💻 Open in VEGA IDE
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: PROTOCOL LABS */}
        {activeTab === 'protocols' && (
          <div className="protocol-labs-view">
            {/* Protocol Selector Tabs */}
            <div className="proto-selector-bar">
              {(['uart', 'i2c', 'spi'] as const).map(protoKey => (
                <button
                  key={protoKey}
                  className={`proto-select-btn ${selectedProtocol === protoKey ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedProtocol(protoKey);
                    setSelectedProtocolStep(1);
                  }}
                >
                  <span className="proto-btn-title">{protocolLabs[protoKey].name}</span>
                  <span className="proto-btn-desc">{protoKey.toUpperCase()} 2-4 Wire Serial Bus</span>
                </button>
              ))}
            </div>

            {/* Protocol Master Workspace */}
            <div className="proto-workspace-grid">
              {/* Left Column: Dropdown Steps List */}
              <div className="proto-steps-sidebar card">
                <div className="steps-header">
                  <h3>{activeProtoData.name} Steps</h3>
                  <p>Click any topic below to dive into detailed theory, formulas, and video</p>
                </div>

                <div className="steps-list">
                  {activeProtoData.steps.map((step) => (
                    <button
                      key={step.id}
                      className={`step-nav-btn ${selectedProtocolStep === step.id ? 'active' : ''}`}
                      onClick={() => setSelectedProtocolStep(step.id)}
                    >
                      <span className="step-idx">{String(step.id).padStart(2, '0')}</span>
                      <div className="step-text-wrap">
                        <span className="step-title">{step.title}</span>
                        <span className="step-desc-preview">{step.description}</span>
                      </div>
                      <span className="step-arrow-mark">→</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Deep-Dive Content & Video View */}
              <div className="proto-details-content card">
                <div className="step-detail-header">
                  <div className="step-header-meta">
                    <span className="step-count-badge">Step {activeStepData.id} of {activeProtoData.steps.length}</span>
                    <span className="proto-badge-tag">{activeProtoData.name}</span>
                  </div>
                  <h2>{activeStepData.title}</h2>
                  <p className="step-subheading">{activeStepData.description}</p>
                </div>

                {/* Embedded Video Player */}
                {(activeStepData.videoUrl || activeProtoData.videoUrl) && (
                  <div className="embedded-video-card">
                    <div className="video-player-frame">
                      <iframe
                        src={activeStepData.videoUrl || activeProtoData.videoUrl}
                        title={activeProtoData.videoTitle || activeStepData.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="video-info-bar">
                      <span>🎬 {activeProtoData.videoTitle || 'Embedded Systems Protocol Tutorial'}</span>
                    </div>
                  </div>
                )}

                {/* Detailed Rich Content Body */}
                <div className="step-markdown-body">
                  {activeStepData.content ? (
                    activeStepData.content.split('\n\n').map((block, bi) => {
                      if (block.startsWith('### ')) {
                        return <h3 key={bi} className="detail-h3">{block.replace('### ', '')}</h3>;
                      }
                      if (block.startsWith('```')) {
                        const lines = block.split('\n');
                        const code = lines.slice(1, -1).join('\n');
                        return (
                          <pre key={bi} className="detail-code-block">
                            <code>{code}</code>
                          </pre>
                        );
                      }
                      if (block.startsWith('> ')) {
                        return (
                          <div key={bi} className="detail-callout-box">
                            {block.replace('> ', '')}
                          </div>
                        );
                      }
                      return <p key={bi} className="detail-paragraph">{block}</p>;
                    })
                  ) : (
                    <p className="detail-paragraph">{activeStepData.description}</p>
                  )}
                </div>

                {/* Quick Step Navigation */}
                <div className="step-actions-footer">
                  <button
                    className="btn-secondary"
                    disabled={selectedProtocolStep === 1}
                    onClick={() => setSelectedProtocolStep(selectedProtocolStep - 1)}
                  >
                    ← Previous Step
                  </button>

                  <Link href={`/ide?protocol=${selectedProtocol}`} className="btn-primary">
                    💻 Test {selectedProtocol.toUpperCase()} in VEGA Studio
                  </Link>

                  <button
                    className="btn-secondary"
                    disabled={selectedProtocolStep === activeProtoData.steps.length}
                    onClick={() => setSelectedProtocolStep(selectedProtocolStep + 1)}
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SENSORS */}
        {activeTab === 'sensors' && (
          <div className="sensor-labs-grid">
            {sensorLabs.map(sensor => (
              <div key={sensor.id} className="sensor-item-card card">
                <div className="sensor-top-row">
                  <span className="sensor-big-icon">{sensor.icon}</span>
                  <div>
                    <h3>{sensor.name}</h3>
                    <span className="badge badge-info">{sensor.interface} Interface</span>
                  </div>
                </div>
                <p className="sensor-desc">{sensor.description}</p>

                <div className="sensor-sections-tags">
                  {sensor.sections.map((sec, i) => (
                    <span key={i} className="sensor-sec-pill">{sec}</span>
                  ))}
                </div>

                <div className="sensor-card-footer">
                  <Link href={`/ide?sensor=${sensor.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Experiment with {sensor.name} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: PERIPHERALS */}
        {activeTab === 'peripherals' && (
          <div className="peripheral-labs-grid">
            {[
              { name: 'GPIO', icon: '⚡', desc: 'General Purpose Input/Output: Digital pin driving, reading, and debounce filters.', mod: 'gpio' },
              { name: 'Hardware Timers', icon: '⏱️', desc: '32-bit hardware countdown timers for precise microsecond delays and periodic ISRs.', mod: 'timers' },
              { name: 'PWM Controller', icon: '〰️', desc: '8-channel pulse width modulation for LED dimming and motor speed regulation.', mod: 'pwm' },
              { name: '10-Bit ADC', icon: '📊', desc: '4-channel Analog-to-Digital converter for reading analog sensor voltages.', mod: 'adc' },
              { name: 'UART Serial', icon: '🔌', desc: 'Full-duplex serial communication for debug telemetry and terminal interaction.', mod: 'uart-beginner' },
              { name: 'FreeRTOS Tasks', icon: '⚙️', desc: 'Real-Time Operating System multitasking, queues, semaphores, and preemptive scheduling.', mod: 'rtos' },
            ].map((peri, i) => (
              <div key={i} className="card peri-card">
                <div className="peri-card-top">
                  <span className="peri-icon-badge">{peri.icon}</span>
                  <h3>{peri.name}</h3>
                </div>
                <p>{peri.desc}</p>
                <div className="peri-card-actions">
                  <Link href={`/learn/${peri.mod}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                    Open Peripheral Lab →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .learn-page {
          max-width: 1300px;
          margin: 0 auto;
          padding: 2.5rem 2rem 5rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2.5rem;
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
          margin-bottom: 0.85rem;
        }
        .page-header h1 {
          font-size: 2.2rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--color-text-primary), var(--color-accent-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .page-header p {
          color: var(--color-text-secondary);
          font-size: 1rem;
          max-width: 750px;
          margin: 0 auto;
        }

        /* Custom Modern Tabs */
        .tab-container {
          margin-bottom: 2.5rem;
        }
        .tab-group-custom {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          background: var(--color-bg-card);
          padding: 0.5rem;
          border-radius: 14px;
          border: 1px solid var(--color-border);
        }
        .custom-tab-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.85rem 1rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .custom-tab-btn:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        [data-theme="light"] .custom-tab-btn:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        .custom-tab-btn.active {
          background: rgba(6, 214, 160, 0.12);
          border-color: rgba(6, 214, 160, 0.3);
        }
        .tab-btn-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .custom-tab-btn.active .tab-btn-title {
          color: var(--color-accent-cyan);
        }
        .tab-btn-sub {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          margin-top: 0.2rem;
        }

        /* Learning Paths */
        .path-section {
          margin-bottom: 3.5rem;
        }
        .path-header-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          padding: 1.25rem 1.5rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: 12px;
        }
        .path-pill {
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          color: #000;
          font-weight: 900;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .path-info-col h2 {
          font-size: 1.2rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }
        .path-info-col p {
          color: var(--color-text-secondary);
          font-size: 0.88rem;
          margin-bottom: 0.4rem;
        }
        .path-meta-row {
          display: flex;
          gap: 0.6rem;
          font-size: 0.78rem;
          color: var(--color-text-muted);
        }

        /* Modules */
        .modules-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .module-card {
          border: 1px solid var(--color-border);
          transition: all 0.25s ease;
          border-radius: 12px;
        }
        .module-card.expanded {
          border-color: rgba(6, 214, 160, 0.4);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
        }
        .module-card.completed {
          border-left: 4px solid var(--color-success);
        }
        .module-main-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          cursor: pointer;
        }
        .module-number-box {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--color-bg-input);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 800;
          font-family: var(--font-mono);
          color: var(--color-accent-cyan);
          flex-shrink: 0;
        }
        .module-title-col {
          flex: 1;
        }
        .module-badge-row {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          margin-bottom: 0.35rem;
        }
        .module-time-tag, .module-points-tag {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }
        .module-title-col h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .module-title-col p {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }
        .module-expand-indicator {
          padding: 0.5rem;
          color: var(--color-text-muted);
          font-size: 0.85rem;
        }

        /* Expanded module content */
        .module-details-drawer {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--color-border);
        }
        .video-banner-preview {
          background: rgba(6, 214, 160, 0.08);
          border: 1px dashed rgba(6, 214, 160, 0.3);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .video-tag {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--color-accent-cyan);
          letter-spacing: 0.05em;
        }
        .video-title {
          font-size: 0.82rem;
          color: var(--color-text-primary);
          font-weight: 600;
        }
        .lessons-container h4 {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          letter-spacing: 0.08em;
          margin-bottom: 0.75rem;
        }
        .lesson-items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 0.6rem;
          margin-bottom: 1.25rem;
        }
        .lesson-interactive-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.65rem 0.85rem;
          background: var(--color-bg-input);
          border-radius: 8px;
          text-decoration: none;
          color: var(--color-text-secondary);
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }
        .lesson-interactive-item:hover {
          background: rgba(6, 214, 160, 0.08);
          color: var(--color-text-primary);
          transform: translateX(3px);
        }
        .lesson-idx {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
        .lesson-name {
          flex: 1;
          font-weight: 500;
        }
        .lesson-arrow {
          font-size: 0.85rem;
          color: var(--color-accent-cyan);
        }
        .module-footer-actions {
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }

        /* PROTOCOL LABS VIEW */
        .proto-selector-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .proto-select-btn {
          padding: 1.25rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.25s ease;
        }
        .proto-select-btn:hover {
          border-color: var(--color-accent-cyan);
          transform: translateY(-2px);
        }
        .proto-select-btn.active {
          background: rgba(6, 214, 160, 0.08);
          border-color: var(--color-accent-cyan);
          box-shadow: 0 4px 20px rgba(6, 214, 160, 0.15);
        }
        .proto-btn-title {
          display: block;
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-accent-cyan);
          margin-bottom: 0.25rem;
        }
        .proto-btn-desc {
          display: block;
          font-size: 0.78rem;
          color: var(--color-text-muted);
        }

        /* Protocol Workspace Grid */
        .proto-workspace-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        .proto-steps-sidebar {
          padding: 1.25rem;
          max-height: 750px;
          overflow-y: auto;
        }
        .steps-header h3 {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }
        .steps-header p {
          font-size: 0.78rem;
          color: var(--color-text-muted);
          margin-bottom: 1rem;
        }
        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .step-nav-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          background: var(--color-bg-input);
          border: 1px solid transparent;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }
        .step-nav-btn:hover {
          background: rgba(6, 214, 160, 0.06);
          color: var(--color-text-primary);
        }
        .step-nav-btn.active {
          background: rgba(6, 214, 160, 0.14);
          border-color: var(--color-accent-cyan);
        }
        .step-idx {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-accent-cyan);
        }
        .step-text-wrap {
          flex: 1;
        }
        .step-title {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .step-desc-preview {
          display: block;
          font-size: 0.72rem;
          color: var(--color-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .step-arrow-mark {
          font-size: 0.85rem;
          color: var(--color-accent-cyan);
        }

        /* Detail content */
        .proto-details-content {
          padding: 2rem;
        }
        .step-header-meta {
          display: flex;
          gap: 0.6rem;
          margin-bottom: 0.6rem;
        }
        .step-count-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          background: rgba(6, 214, 160, 0.1);
          color: var(--color-accent-cyan);
          border-radius: 4px;
        }
        .proto-badge-tag {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }
        .step-detail-header h2 {
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 0.35rem;
        }
        .step-subheading {
          color: var(--color-text-secondary);
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
        }

        /* Video Card */
        .embedded-video-card {
          margin-bottom: 1.75rem;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          background: #000;
        }
        .video-player-frame {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
        }
        .video-player-frame iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .video-info-bar {
          padding: 0.65rem 1rem;
          background: var(--color-bg-card);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        /* Markdown rendering */
        .step-markdown-body {
          line-height: 1.8;
          margin-bottom: 2rem;
        }
        .detail-h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--color-accent-cyan);
          margin: 1.5rem 0 0.5rem;
        }
        .detail-paragraph {
          color: var(--color-text-secondary);
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }
        .detail-code-block {
          background: var(--color-bg-terminal);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1.25rem;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          overflow-x: auto;
          color: #d4d4d4;
          margin: 1rem 0;
        }
        .detail-callout-box {
          padding: 1rem 1.25rem;
          background: rgba(251, 191, 36, 0.1);
          border-left: 4px solid var(--color-warning);
          border-radius: 6px;
          color: var(--color-text-primary);
          font-size: 0.88rem;
          margin: 1rem 0;
        }

        .step-actions-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border);
        }

        /* Sensors & Peripherals */
        .sensor-labs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }
        .sensor-item-card {
          display: flex;
          flex-direction: column;
        }
        .sensor-top-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .sensor-big-icon {
          font-size: 2.2rem;
        }
        .sensor-top-row h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .sensor-desc {
          font-size: 0.88rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }
        .sensor-sections-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 1.5rem;
        }
        .sensor-sec-pill {
          padding: 0.2rem 0.55rem;
          background: var(--color-bg-input);
          border-radius: 4px;
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }
        .sensor-card-footer {
          margin-top: auto;
        }

        .peripheral-labs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .peri-card {
          display: flex;
          flex-direction: column;
        }
        .peri-card-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .peri-icon-badge {
          font-size: 1.5rem;
        }
        .peri-card-top h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .peri-card p {
          font-size: 0.88rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }
        .peri-card-actions {
          margin-top: auto;
        }

        @media (max-width: 900px) {
          .tab-group-custom { grid-template-columns: repeat(2, 1fr); }
          .proto-selector-bar { grid-template-columns: 1fr; }
          .proto-workspace-grid { grid-template-columns: 1fr; }
          .path-header-card { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading VEGA Academy...</div>}>
      <LearnContentComponent />
    </Suspense>
  );
}
