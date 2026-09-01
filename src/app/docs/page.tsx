'use client';

import Link from 'next/link';

const docSections = [
  {
    title: 'Getting Started',
    icon: '🚀',
    items: [
      { title: 'Platform Overview', desc: 'Introduction to VEGA Learn & Lab' },
      { title: 'Creating an Account', desc: 'Sign up and set up your profile' },
      { title: 'First Steps', desc: 'Navigate the platform and start learning' },
      { title: 'System Requirements', desc: 'Browser and hardware requirements' },
    ]
  },
  {
    title: 'VEGA ARIES v2 Board',
    icon: '🔧',
    items: [
      { title: 'Board Overview', desc: 'Specifications and features' },
      { title: 'Pin Configuration', desc: 'GPIO, UART, SPI, I2C pinout' },
      { title: 'Setting Up', desc: 'Drivers, connections, and first program' },
      { title: 'Board Profiles', desc: 'Managing multiple board configurations' },
    ]
  },
  {
    title: 'VEGA Studio IDE',
    icon: '💻',
    items: [
      { title: 'IDE Overview', desc: 'Editor, build system, and serial monitor' },
      { title: 'Creating Projects', desc: 'Project structure and file management' },
      { title: 'Building Firmware', desc: 'Compilation and firmware generation' },
      { title: 'Flashing', desc: 'Programming the board via XMODEM' },
      { title: 'Serial Monitor', desc: 'UART communication and debugging' },
    ]
  },
  {
    title: 'OTA Updates',
    icon: '📶',
    items: [
      { title: 'Architecture', desc: 'ESP32 gateway and XMODEM protocol' },
      { title: 'Setup Guide', desc: 'Configuring the ESP32 gateway' },
      { title: 'Firmware Management', desc: 'Version control and history' },
      { title: 'Troubleshooting OTA', desc: 'Common issues and solutions' },
    ]
  },
  {
    title: 'Learning System',
    icon: '📚',
    items: [
      { title: 'Learning Paths', desc: 'Beginner, Intermediate, Advanced' },
      { title: 'Modules & Lessons', desc: 'Structured learning content' },
      { title: 'Quizzes', desc: 'Knowledge assessment system' },
      { title: 'Challenges', desc: 'Coding challenges and scoring' },
      { title: 'Progress & Badges', desc: 'Tracking and gamification' },
    ]
  },
  {
    title: 'API Reference',
    icon: '📋',
    items: [
      { title: 'GPIO API', desc: 'gpio_pin_configure, gpio_pin_set, gpio_pin_read' },
      { title: 'UART API', desc: 'uart_configure, uart_write, uart_read' },
      { title: 'SPI API', desc: 'spi_configure, spi_transfer' },
      { title: 'I2C API', desc: 'i2c_configure, i2c_read, i2c_write' },
      { title: 'Timer API', desc: 'timer_configure, timer_start, timer_stop' },
      { title: 'ADC API', desc: 'adc_init, adc_read' },
      { title: 'PWM API', desc: 'pwm_configure, pwm_set_duty' },
    ]
  },
];

export default function DocsPage() {
  return (
    <div className="docs-page">
      <div className="page-header">
        <h1>📖 Documentation</h1>
        <p>Complete reference guide for the VEGA Learn & Lab platform.</p>
        <div className="search-bar">
          <input type="text" placeholder="Search documentation..." className="search-input" />
        </div>
      </div>

      <div className="docs-grid">
        {docSections.map((section, i) => (
          <div key={i} className="card doc-section">
            <h3>{section.icon} {section.title}</h3>
            <div className="doc-items">
              {section.items.map((item, j) => (
                <Link href="#" key={j} className="doc-item">
                  <span className="doc-item-title">{item.title}</span>
                  <span className="doc-item-desc">{item.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .docs-page { max-width: 1200px; margin: 0 auto; padding: 2rem; padding-bottom: 4rem; }
        .page-header { text-align: center; margin-bottom: 2rem; }
        .page-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .page-header p { color: var(--color-text-secondary); margin-bottom: 1.5rem; }
        .search-bar { max-width: 500px; margin: 0 auto; }
        .search-input {
          width: 100%; padding: 0.75rem 1.25rem; border-radius: 8px;
          background: var(--color-bg-card); border: 1px solid var(--color-border);
          color: var(--color-text-primary); font-size: 0.9rem; outline: none;
          transition: border-color 0.2s;
        }
        .search-input:focus { border-color: var(--color-accent-cyan); }
        .search-input::placeholder { color: var(--color-text-muted); }

        .docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
        .doc-section h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; }
        .doc-items { display: flex; flex-direction: column; gap: 0.25rem; }
        .doc-item {
          display: flex; flex-direction: column; padding: 0.6rem 0.75rem; border-radius: 6px;
          text-decoration: none; color: inherit; transition: all 0.2s;
        }
        .doc-item:hover { background: rgba(6,214,160,0.05); }
        .doc-item-title { font-size: 0.85rem; font-weight: 600; color: var(--color-accent-cyan); }
        .doc-item-desc { font-size: 0.75rem; color: var(--color-text-muted); }

        @media (max-width: 768px) { .docs-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
