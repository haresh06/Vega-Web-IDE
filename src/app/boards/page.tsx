'use client';

import Link from 'next/link';
import { useState } from 'react';
import { boardProfiles } from '@/data/boards';

export default function BoardsPage() {
  const board = boardProfiles[0]; // ARIES v2
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [selectedPeripheral, setSelectedPeripheral] = useState<string | null>(null);

  const pinInfo = board.pinout.find(p => p.name === selectedPin);

  return (
    <div className="boards-page">
      <div className="page-header">
        <h1>🔧 VEGA Boards</h1>
        <p>Interactive board visualization and pin configuration guide.</p>
      </div>

      {/* Board Info */}
      <div className="board-info-grid">
        <div className="card board-specs-card">
          <h3>{board.name}</h3>
          <div className="spec-grid">
            {[
              { label: 'Processor', value: board.processor },
              { label: 'Architecture', value: board.architecture },
              { label: 'Clock', value: board.clockSpeed },
              { label: 'SRAM', value: board.sram },
              { label: 'Flash', value: board.flash },
            ].map((spec, i) => (
              <div key={i} className="spec-row">
                <span className="spec-label">{spec.label}</span>
                <span className="spec-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Board SVG */}
        <div className="card board-visual-card">
          <h3>Interactive Pin Diagram</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Click on any pin to see its configuration and available functions.
          </p>
          <div className="board-svg-container">
            <svg viewBox="0 0 400 450" className="board-svg">
              {/* Board body */}
              <rect x="80" y="30" width="240" height="390" rx="12" fill="var(--color-bg-input)" stroke="var(--color-border)" strokeWidth="2" />
              
              {/* MCU chip */}
              <rect x="140" y="160" width="120" height="80" rx="6" fill="var(--color-bg-primary)" stroke="var(--color-accent-cyan)" strokeWidth="2" />
              <text x="200" y="195" textAnchor="middle" fill="var(--color-accent-cyan)" fontSize="12" fontWeight="bold" fontFamily="var(--font-mono)">THEJAS32</text>
              <text x="200" y="215" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8" fontFamily="var(--font-mono)">RISC-V 100MHz</text>

              {/* USB connector */}
              <rect x="175" y="395" width="50" height="25" rx="3" fill="var(--color-bg-card)" stroke="var(--color-border)" strokeWidth="1.5" />
              <text x="200" y="412" textAnchor="middle" fill="var(--color-text-muted)" fontSize="7" fontFamily="var(--font-mono)">USB</text>

              {/* Reset button */}
              <circle cx="130" y="70" r="8" fill="var(--color-bg-card)" stroke="var(--color-border)" strokeWidth="1.5" />
              <text x="130" y="90" textAnchor="middle" fill="var(--color-text-muted)" fontSize="6" fontFamily="var(--font-mono)">RST</text>

              {/* LEDs */}
              <circle cx="270" cy="70" r="4" fill="var(--color-accent-green)" />
              <text x="270" y="85" textAnchor="middle" fill="var(--color-text-muted)" fontSize="6" fontFamily="var(--font-mono)">PWR</text>
              <circle cx="290" cy="70" r="4" fill="var(--color-accent-cyan)" opacity="0.5" />
              <text x="290" y="85" textAnchor="middle" fill="var(--color-text-muted)" fontSize="6" fontFamily="var(--font-mono)">LED</text>

              {/* Left pins */}
              {board.pinout.filter(p => p.x === 50).map((pin, i) => (
                <g key={pin.pin} className="pin-group" onClick={() => setSelectedPin(pin.name)} style={{ cursor: 'pointer' }}>
                  <rect x="60" y={pin.y - 8} width="16" height="16" rx="2"
                    fill={selectedPin === pin.name ? 'var(--color-accent-cyan)' : 'var(--color-bg-card)'}
                    stroke={selectedPin === pin.name ? 'var(--color-accent-cyan)' : 'var(--color-border)'}
                    strokeWidth="1.5" />
                  <text x="55" y={pin.y + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="7" fontFamily="var(--font-mono)">
                    {pin.name}
                  </text>
                </g>
              ))}

              {/* Right pins */}
              {board.pinout.filter(p => p.x === 350).map((pin, i) => (
                <g key={pin.pin} className="pin-group" onClick={() => setSelectedPin(pin.name)} style={{ cursor: 'pointer' }}>
                  <rect x="324" y={pin.y - 8} width="16" height="16" rx="2"
                    fill={selectedPin === pin.name ? 'var(--color-accent-cyan)' : 'var(--color-bg-card)'}
                    stroke={selectedPin === pin.name ? 'var(--color-accent-cyan)' : 'var(--color-border)'}
                    strokeWidth="1.5" />
                  <text x="345" y={pin.y + 4} textAnchor="start" fill="var(--color-text-muted)" fontSize="7" fontFamily="var(--font-mono)">
                    {pin.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Pin info popup */}
          {pinInfo && (
            <div className="pin-info-panel">
              <h4>{pinInfo.name}</h4>
              <p>Pin #{pinInfo.pin}</p>
              <div className="pin-functions">
                <span className="pin-func-label">Functions:</span>
                {pinInfo.functions.map((fn, i) => (
                  <span key={i} className="pin-func-badge">{fn}</span>
                ))}
              </div>
              {pinInfo.functions.find(f => f !== 'GPIO' && f !== 'Power' && f !== 'Ground') && (
                <Link
                  href={`/learn/${pinInfo.functions.find(f => f.startsWith('UART')) ? 'uart-beginner' : pinInfo.functions.find(f => f.startsWith('SPI')) ? 'spi-protocol' : pinInfo.functions.find(f => f.startsWith('I2C')) ? 'i2c-protocol' : pinInfo.functions.find(f => f.startsWith('PWM')) ? 'pwm' : pinInfo.functions.find(f => f.startsWith('ADC')) ? 'adc' : 'gpio'}`}
                  className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', marginTop: '0.75rem' }}
                >
                  Learn about this →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Peripherals */}
      <div className="section-card card">
        <h3>Peripherals</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Click any peripheral to open its learning module.
        </p>
        <div className="peripherals-grid">
          {board.peripherals.map((p, i) => (
            <Link
              key={i}
              href={p.moduleId ? `/learn/${p.moduleId}` : '/learn'}
              className={`peripheral-card ${selectedPeripheral === p.name ? 'selected' : ''}`}
              onClick={() => setSelectedPeripheral(p.name)}
            >
              <div className="peri-header">
                <span className="peri-name">{p.name}</span>
                <span className="peri-count">×{p.count}</span>
              </div>
              <p className="peri-desc">{p.description}</p>
              <span className="peri-link">Learn {p.name} →</span>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .boards-page { max-width: 1200px; margin: 0 auto; padding: 2rem; padding-bottom: 4rem; }
        .page-header { text-align: center; margin-bottom: 2rem; }
        .page-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .page-header p { color: var(--color-text-secondary); }

        .board-info-grid { display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .board-specs-card h3 { font-size: 1.2rem; font-weight: 700; color: var(--color-accent-cyan); margin-bottom: 1rem; }
        .spec-grid { display: flex; flex-direction: column; gap: 0.5rem; }
        .spec-row { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--color-border); }
        .spec-label { font-size: 0.8rem; color: var(--color-text-muted); }
        .spec-value { font-size: 0.8rem; font-weight: 600; font-family: var(--font-mono); }

        .board-visual-card h3 { margin-bottom: 0.25rem; }
        .board-svg-container { display: flex; justify-content: center; }
        .board-svg { max-width: 400px; width: 100%; }
        .pin-group:hover rect { fill: rgba(6,214,160,0.3); stroke: var(--color-accent-cyan); }

        .pin-info-panel {
          margin-top: 1rem; padding: 1rem; background: var(--color-bg-input); border-radius: 8px; border: 1px solid var(--color-accent-cyan);
        }
        .pin-info-panel h4 { font-size: 1rem; font-weight: 700; color: var(--color-accent-cyan); }
        .pin-info-panel p { font-size: 0.8rem; color: var(--color-text-muted); margin: 0.25rem 0; }
        .pin-functions { display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center; margin-top: 0.5rem; }
        .pin-func-label { font-size: 0.75rem; color: var(--color-text-muted); }
        .pin-func-badge {
          padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-family: var(--font-mono);
          background: rgba(6,214,160,0.1); color: var(--color-accent-cyan); border: 1px solid rgba(6,214,160,0.2);
        }

        .section-card { padding: 2rem; }
        .section-card h3 { font-size: 1.1rem; font-weight: 700; }
        .peripherals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .peripheral-card {
          padding: 1.25rem; background: var(--color-bg-input); border: 1px solid var(--color-border); border-radius: 10px;
          text-decoration: none; color: inherit; transition: all 0.2s;
        }
        .peripheral-card:hover { border-color: var(--color-accent-cyan); transform: translateY(-2px); }
        .peripheral-card.selected { border-color: var(--color-accent-cyan); background: rgba(6,214,160,0.05); }
        .peri-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .peri-name { font-weight: 700; font-size: 1rem; }
        .peri-count { font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-accent-cyan); }
        .peri-desc { font-size: 0.8rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 0.5rem; }
        .peri-link { font-size: 0.75rem; color: var(--color-accent-cyan); font-weight: 600; }

        @media (max-width: 900px) { .board-info-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
