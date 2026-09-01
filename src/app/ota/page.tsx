'use client';

import { useState } from 'react';

type OTAStatus = 'idle' | 'connecting' | 'detecting' | 'bootloader' | 'flashing' | 'verifying' | 'success' | 'failed';

const firmwareHistory = [
  { version: 'v1.3.0', build: 108, size: '128 KB', checksum: 'A3F2B1C9', date: '2024-08-25', status: 'current' },
  { version: 'v1.2.0', build: 95, size: '124 KB', checksum: '8D7E6F5A', date: '2024-08-20', status: 'previous' },
  { version: 'v1.1.0', build: 82, size: '118 KB', checksum: 'C4D3E2F1', date: '2024-08-15', status: 'previous' },
  { version: 'v1.0.0', build: 70, size: '112 KB', checksum: 'B1A2C3D4', date: '2024-08-10', status: 'previous' },
];

export default function OTAPage() {
  const [otaStatus, setOtaStatus] = useState<OTAStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [isSimulation, setIsSimulation] = useState(true);
  const [flashLog, setFlashLog] = useState<{ time: string; msg: string; type: string }[]>([]);

  const getTime = () => new Date().toLocaleTimeString('en-US', { hour12: false });

  const handleFlash = async () => {
    setFlashLog([]);
    setProgress(0);

    const steps: { status: OTAStatus; msg: string; delay: number }[] = [
      { status: 'connecting', msg: 'Connecting to ESP32 Gateway...', delay: 800 },
      { status: 'connecting', msg: '✓ ESP32 Connected (192.168.1.42)', delay: 600 },
      { status: 'detecting', msg: 'Detecting VEGA ARIES v2...', delay: 700 },
      { status: 'detecting', msg: '✓ VEGA ARIES v2 detected (THEJAS32)', delay: 500 },
      { status: 'bootloader', msg: 'Entering bootloader mode...', delay: 800 },
      { status: 'bootloader', msg: '✓ Bootloader detected (XMODEM ready)', delay: 600 },
      { status: 'flashing', msg: 'Starting XMODEM transfer...', delay: 400 },
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, step.delay));
      setOtaStatus(step.status);
      setFlashLog(prev => [...prev, { time: getTime(), msg: step.msg, type: step.msg.includes('✓') ? 'success' : 'info' }]);
    }

    // Simulate packets
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 100));
      setProgress(i);
      if (i % 20 === 0) {
        setFlashLog(prev => [...prev, { time: getTime(), msg: `Sending packet ${Math.round(i * 6.4)} / 640`, type: 'info' }]);
      }
    }

    await new Promise(r => setTimeout(r, 500));
    setOtaStatus('verifying');
    setFlashLog(prev => [...prev, { time: getTime(), msg: 'Verifying firmware...', type: 'info' }]);
    await new Promise(r => setTimeout(r, 800));
    setOtaStatus('success');
    setFlashLog(prev => [
      ...prev,
      { time: getTime(), msg: '✓ Firmware verified', type: 'success' },
      { time: getTime(), msg: '✓ Flashing complete', type: 'success' },
      { time: getTime(), msg: 'Board reset', type: 'info' },
    ]);
  };

  return (
    <div className="ota-page">
      <div className="page-header">
        <h1>📶 OTA Dashboard</h1>
        <p>Over-The-Air firmware management and flashing via ESP32 gateway.</p>
        <div className="sim-indicator">
          <span className={`status-dot ${isSimulation ? 'disconnected' : 'connected'}`} />
          <span>{isSimulation ? 'SIMULATION MODE' : 'REAL DEVICE'}</span>
          <button onClick={() => setIsSimulation(!isSimulation)} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>Toggle</button>
        </div>
      </div>

      <div className="ota-grid">
        {/* Connection Status */}
        <div className="card ota-status-card">
          <h3>Connection Status</h3>
          <div className="status-list">
            <div className="status-row">
              <span>ESP32 Gateway</span>
              <span className="status-val"><span className="status-dot connected" /> Connected</span>
            </div>
            <div className="status-row">
              <span>VEGA ARIES v2</span>
              <span className="status-val"><span className="status-dot connected" /> Connected</span>
            </div>
            <div className="status-row">
              <span>THEJAS32</span>
              <span className="status-val"><span className="status-dot connected" /> Detected</span>
            </div>
          </div>
        </div>

        {/* Firmware Info */}
        <div className="card ota-firmware-card">
          <h3>Firmware</h3>
          <div className="fw-info">
            <div className="fw-row"><span>Current</span><span className="fw-ver">v1.2.0</span></div>
            <div className="fw-row"><span>New</span><span className="fw-ver new">v1.3.0</span></div>
            <div className="fw-row"><span>Size</span><span>128 KB</span></div>
            <div className="fw-row"><span>Checksum</span><span className="mono">A3F2B1C9</span></div>
            <div className="fw-row"><span>Build</span><span>#108</span></div>
          </div>
        </div>

        {/* Flash Controls */}
        <div className="card ota-controls-card">
          <h3>Flash Controls</h3>
          <div className="ota-buttons">
            <button className="btn-primary" onClick={handleFlash} disabled={otaStatus === 'flashing'}>📶 FLASH</button>
            <button className="btn-secondary">✓ VERIFY</button>
            <button className="btn-secondary">↺ RESET</button>
          </div>
          {otaStatus !== 'idle' && (
            <div className="flash-status-section">
              <div className="flash-status-label">
                Status: <span className={otaStatus === 'success' ? 'success' : otaStatus === 'failed' ? 'error' : 'info'}>
                  {otaStatus.toUpperCase()}
                </span>
              </div>
              {(otaStatus === 'flashing' || otaStatus === 'verifying' || otaStatus === 'success') && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div className="progress-bar" style={{ height: '12px' }}>
                    <div className="progress-bar-fill" style={{ width: `${otaStatus === 'success' ? 100 : progress}%` }} />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '0.25rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                    {otaStatus === 'success' ? '100' : progress}%
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Flash Log */}
        <div className="card ota-log-card">
          <h3>Flash Log</h3>
          <div className="terminal" style={{ height: '250px', padding: '0.75rem' }}>
            {flashLog.length === 0 && (
              <div className="terminal-line"><span className="info">Waiting for flash command...</span></div>
            )}
            {flashLog.map((log, i) => (
              <div key={i} className="terminal-line">
                <span className="timestamp">[{log.time}]</span>{' '}
                <span className={log.type}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Firmware History */}
      <div className="card" style={{ marginTop: '1.5rem', padding: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>📦 Firmware Version History</h3>
        <table className="fw-table">
          <thead>
            <tr><th>Version</th><th>Build</th><th>Size</th><th>Checksum</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {firmwareHistory.map((fw, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fw.version}</td>
                <td>#{fw.build}</td>
                <td>{fw.size}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{fw.checksum}</td>
                <td>{fw.date}</td>
                <td>
                  <span className={`badge ${fw.status === 'current' ? 'badge-easy' : 'badge-info'}`}>
                    {fw.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .ota-page { max-width: 1200px; margin: 0 auto; padding: 2rem; padding-bottom: 4rem; }
        .page-header { text-align: center; margin-bottom: 2rem; }
        .page-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .page-header p { color: var(--color-text-secondary); margin-bottom: 0.75rem; }
        .sim-indicator { display: flex; align-items: center; gap: 0.5rem; justify-content: center; font-size: 0.8rem; font-family: var(--font-mono); color: var(--color-text-muted); }

        .ota-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .ota-status-card h3, .ota-firmware-card h3, .ota-controls-card h3, .ota-log-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }

        .status-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .status-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 0.5rem 0; border-bottom: 1px solid var(--color-border); }
        .status-val { display: flex; align-items: center; gap: 0.4rem; font-weight: 500; color: var(--color-success); }

        .fw-info { display: flex; flex-direction: column; gap: 0.5rem; }
        .fw-row { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.3rem 0; }
        .fw-ver { font-family: var(--font-mono); font-weight: 700; }
        .fw-ver.new { color: var(--color-accent-cyan); }
        .mono { font-family: var(--font-mono); }

        .ota-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .ota-buttons button { flex: 1; justify-content: center; }
        .flash-status-section { margin-top: 1rem; }
        .flash-status-label { font-size: 0.85rem; font-weight: 600; }
        .flash-status-label .success { color: var(--color-success); }
        .flash-status-label .error { color: var(--color-error); }
        .flash-status-label .info { color: var(--color-info); }

        .fw-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .fw-table th { text-align: left; padding: 0.6rem; background: var(--color-bg-input); border: 1px solid var(--color-border); font-weight: 600; color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; }
        .fw-table td { padding: 0.6rem; border: 1px solid var(--color-border); color: var(--color-text-secondary); }

        @media (max-width: 768px) { .ota-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
