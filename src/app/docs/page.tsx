'use client';

import Link from 'next/link';
import {
  ExternalLink,
  Cpu,
  Zap,
  HardDrive,
  Clock,
  Radio,
  Share2,
  Layers,
  Terminal,
  Upload,
  FileCode,
  Wifi,
  Sliders,
  Activity,
  Bell,
  Gauge,
  Compass,
  FileText
} from 'lucide-react';
import VegaLabSetupCard from '@/components/ide/VegaLabSetupCard';

export default function DocsPage() {
  return (
    <div className="docs-container">
      {/* Main Page Header */}
      <header className="docs-main-header">
        <div className="header-title-row">
          <span className="book-icon">📖</span>
          <h1>Documentation</h1>
        </div>
        <p className="header-subtitle">
          Official technical reference for VEGA ARIES v2.0 and THEJAS32 RISC-V.
        </p>
      </header>

      {/* ========================================================
          1. HARDWARE DOCUMENTATION SECTION
      ======================================================== */}
      <section className="doc-section-block">
        <div className="section-title-wrap">
          <div className="section-heading">
            <span className="section-icon-gear">⚙</span>
            <h2>1. HARDWARE DOCUMENTATION</h2>
          </div>
          <p className="section-subtext">
            Official datasheets and hardware reference documents.
          </p>
        </div>

        <div className="hardware-grid">
          {/* Card 1: ARIES v2.0 Datasheet */}
          <div className="doc-card hardware-card">
            <div className="card-header-flex">
              <div className="pdf-icon-badge">
                <span className="pdf-text">PDF</span>
              </div>
              <div className="card-title-group">
                <h3>ARIES v2.0 Datasheet</h3>
                <p className="card-desc">Official hardware reference for the VEGA ARIES v2.0 development board.</p>
              </div>
            </div>

            <div className="specs-grid">
              <div className="spec-item">
                <Layers size={14} className="spec-icon" />
                <span className="spec-label">Board</span>
                <span className="spec-value">ARIES v2.0</span>
              </div>
              <div className="spec-item">
                <Cpu size={14} className="spec-icon" />
                <span className="spec-label">Controller</span>
                <span className="spec-value">THEJAS32</span>
              </div>
              <div className="spec-item">
                <HardDrive size={14} className="spec-icon" />
                <span className="spec-label">SRAM</span>
                <span className="spec-value">256 KB</span>
              </div>
              <div className="spec-item">
                <FileCode size={14} className="spec-icon" />
                <span className="spec-label">Flash</span>
                <span className="spec-value">2 MB</span>
              </div>
              <div className="spec-item">
                <Clock size={14} className="spec-icon" />
                <span className="spec-label">Clock</span>
                <span className="spec-value">100 MHz</span>
              </div>
              <div className="spec-item">
                <Zap size={14} className="spec-icon" />
                <span className="spec-label">I/O Voltage</span>
                <span className="spec-value">3.3 V</span>
              </div>
            </div>

            <div className="card-action-row">
              <a
                href="/docs/ARIESv2_0_Datasheet.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-open-doc"
              >
                <span>Open Datasheet</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Card 2: THEJAS32 Datasheet */}
          <div className="doc-card hardware-card">
            <div className="card-header-flex">
              <div className="pdf-icon-badge pdf-thejas">
                <span className="pdf-text">PDF</span>
              </div>
              <div className="card-title-group">
                <h3>THEJAS32 Datasheet</h3>
                <p className="card-desc">Official SoC reference for the THEJAS32 RISC-V processor.</p>
              </div>
            </div>

            <div className="specs-grid">
              <div className="spec-item">
                <Cpu size={14} className="spec-icon" />
                <span className="spec-label">CPU</span>
                <span className="spec-value">VEGA ET1031</span>
              </div>
              <div className="spec-item">
                <Zap size={14} className="spec-icon" />
                <span className="spec-label">ISA</span>
                <span className="spec-value">RISC-V RV32IM</span>
              </div>
              <div className="spec-item">
                <HardDrive size={14} className="spec-icon" />
                <span className="spec-label">SRAM</span>
                <span className="spec-value">256 KB</span>
              </div>
              <div className="spec-item">
                <Radio size={14} className="spec-icon" />
                <span className="spec-label">UART</span>
                <span className="spec-value">3</span>
              </div>
              <div className="spec-item">
                <Share2 size={14} className="spec-icon" />
                <span className="spec-label">SPI</span>
                <span className="spec-value">4</span>
              </div>
              <div className="spec-item">
                <Layers size={14} className="spec-icon" />
                <span className="spec-label">I2C</span>
                <span className="spec-value">3</span>
              </div>
              <div className="spec-item">
                <Sliders size={14} className="spec-icon" />
                <span className="spec-label">GPIO</span>
                <span className="spec-value">32</span>
              </div>
            </div>

            <div className="card-action-row">
              <a
                href="/docs/THEJAS32_Datasheet.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-open-doc"
              >
                <span>Open Datasheet</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. ARIES v2.0 PINOUT SECTION
      ======================================================== */}
      <section className="doc-section-block">
        <div className="section-title-wrap">
          <div className="section-heading">
            <span className="section-icon-cross">📌</span>
            <h2>Pinout Reference</h2>
          </div>
          <p className="section-subtext">
            Official pinout diagram and connector mapping for the VEGA ARIES v2.0 board.
          </p>
        </div>

        <div className="doc-card pinout-presentation-card">
          <div className="pinout-card-header-inner">
            <div className="pinout-header-row">
              <div>
                <h3>ARIES v2.0 Pinout Diagram</h3>
                <p className="pinout-card-subtitle-inner">Official Pinout Diagram PDF &amp; complete connector mapping.</p>
              </div>
              <a
                href="/docs/PINOUT_ARIES_V2.0.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-open-pdf-badge"
              >
                <FileText size={14} />
                <span>Open PDF</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          <div className="pinout-viewport">
            <img
              src="/images/aries-v2-pinout.png"
              alt="Official VEGA ARIES v2.0 Pinout Diagram"
              className="pinout-display-img"
            />
          </div>

          <div className="pinout-bottom-action">
            <a
              href="/images/aries-v2-pinout.png"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-view-fullsize-teal"
            >
              <span>View Full Size</span>
              <ExternalLink size={14} />
            </a>
            <a
              href="/docs/PINOUT_ARIES_V2.0.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-view-pdf-teal"
            >
              <FileText size={14} />
              <span>View PDF</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. FIRMWARE & PROGRAMMING REFERENCE SECTION
      ======================================================== */}
      <section className="doc-section-block">
        <div className="section-title-wrap">
          <div className="section-heading">
            <span className="section-icon-gear">⚙</span>
            <h2>3. FIRMWARE & PROGRAMMING REFERENCE</h2>
          </div>
          <p className="section-subtext">
            Boot modes, programming methods and firmware details.
          </p>
        </div>

        <div className="firmware-grid">
          {/* Card 1: Boot Modes */}
          <Link href="/troubleshoot" className="fw-card">
            <div className="fw-icon-box">
              <Terminal size={18} />
            </div>
            <h4>Boot Modes</h4>
            <p>Boot configuration and modes</p>
          </Link>

          {/* Card 2: UART / XMODEM */}
          <Link href="/learn/uart-comm" className="fw-card">
            <div className="fw-icon-box">
              <Upload size={18} />
            </div>
            <h4>UART / XMODEM Programming</h4>
            <p>Firmware transfer via UART0</p>
          </Link>

          {/* Card 3: SPI Flash Programming */}
          <Link href="/learn/spi-protocol" className="fw-card">
            <div className="fw-icon-box">
              <HardDrive size={18} />
            </div>
            <h4>SPI Flash Programming</h4>
            <p>External SPI flash programming</p>
          </Link>

          {/* Card 4: flasher_min.bin */}
          <Link href="/ide" className="fw-card">
            <div className="fw-icon-box">
              <FileText size={18} />
            </div>
            <h4>flasher_min.bin</h4>
            <p>Bootloader firmware reference</p>
          </Link>

          {/* Card 5: Application .bin */}
          <Link href="/ide" className="fw-card">
            <div className="fw-icon-box">
              <FileCode size={18} />
            </div>
            <h4>Application .bin</h4>
            <p>User application firmware</p>
          </Link>

          {/* Card 6: OTA with ESP32-S3 */}
          <Link href="/ide" className="fw-card fw-card-highlight">
            <div className="fw-icon-box fw-icon-ota">
              <Wifi size={18} />
            </div>
            <h4>OTA with ESP32-S3</h4>
            <p>Wireless firmware flashing in VEGA Studio IDE</p>
          </Link>
        </div>
      </section>

      {/* ========================================================
          4. PERIPHERAL REFERENCE SECTION
      ======================================================== */}
      <section className="doc-section-block">
        <div className="section-title-wrap">
          <div className="section-heading">
            <span className="section-icon-gear">⚙</span>
            <h2>4. PERIPHERAL REFERENCE</h2>
          </div>
          <p className="section-subtext">
            Detailed reference of all on-chip peripherals.
          </p>
        </div>

        <div className="peripheral-chips-grid">
          <Link href="/learn/gpio-programming" className="peri-chip peri-gpio">
            <Sliders size={16} className="peri-icon" />
            <span>GPIO</span>
          </Link>

          <Link href="/learn/uart-comm" className="peri-chip peri-uart">
            <Radio size={16} className="peri-icon" />
            <span>UART</span>
          </Link>

          <Link href="/learn/spi-protocol" className="peri-chip peri-spi">
            <Share2 size={16} className="peri-icon" />
            <span>SPI</span>
          </Link>

          <Link href="/learn/i2c-bus" className="peri-chip peri-i2c">
            <Layers size={16} className="peri-icon" />
            <span>I2C</span>
          </Link>

          <Link href="/learn/timers-counters" className="peri-chip peri-timers">
            <Clock size={16} className="peri-icon" />
            <span>Timers</span>
          </Link>

          <Link href="/learn/timers-counters" className="peri-chip peri-pwm">
            <Activity size={16} className="peri-icon" />
            <span>PWM</span>
          </Link>

          <Link href="/learn/adc-sensors" className="peri-chip peri-adc">
            <Gauge size={16} className="peri-icon" />
            <span>ADC</span>
          </Link>

          <Link href="/learn/interrupts-isr" className="peri-chip peri-interrupts">
            <Bell size={16} className="peri-icon" />
            <span>Interrupts</span>
          </Link>
        </div>
      </section>

      {/* ========================================================
          4. COMPILER & TOOLCHAIN SETUP SECTION
      ======================================================== */}
      <section className="doc-section-block">
        <div className="section-title-wrap">
          <div className="section-heading">
            <span className="section-icon-gear">⚙</span>
            <h2>4. COMPILER & TOOLCHAIN SETUP</h2>
          </div>
          <p className="section-subtext">
            Install the portable VEGA RISC-V compiler package once for local compilation.
          </p>
        </div>

        <div style={{ maxWidth: '460px' }}>
          <VegaLabSetupCard />
        </div>
      </section>

      <style jsx>{`
        /* ========================================================
           DOCUMENTATION CONTAINER & GENERAL SANS TYPOGRAPHY
        ======================================================== */
        .docs-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 2.5rem 1.75rem 6rem 1.75rem;
          font-family: 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #e2e8f0;
          background: #000000;
        }

        /* --------------------------------------------------------
           PAGE HEADER
        -------------------------------------------------------- */
        .docs-main-header {
          text-align: center;
          margin-bottom: 2.75rem;
        }

        .header-title-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 0.5rem;
        }

        .book-icon {
          font-size: 2.2rem;
        }

        .header-title-row h1 {
          font-family: 'General Sans', sans-serif;
          font-size: 2.6rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          color: #a1a1aa;
          font-size: 1.05rem;
          margin: 0;
          font-weight: 400;
        }

        /* --------------------------------------------------------
           SECTION BLOCKS
        -------------------------------------------------------- */
        .doc-section-block {
          margin-bottom: 3.25rem;
        }

        .section-title-wrap {
          margin-bottom: 1.25rem;
        }

        .section-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 0.25rem;
        }

        .section-icon-gear,
        .section-icon-cross {
          color: #ffffff;
          font-size: 1.1rem;
          line-height: 1;
        }

        .section-heading h2 {
          font-family: 'General Sans', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.04em;
          margin: 0;
        }

        .section-subtext {
          color: #a1a1aa;
          font-size: 0.92rem;
          margin: 0;
        }

        /* --------------------------------------------------------
           CARDS COMMON
        -------------------------------------------------------- */
        .doc-card {
          background: #0c0c0e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .doc-card:hover {
          border-color: rgba(255, 255, 255, 0.22);
          background: #101014;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.6);
        }

        /* --------------------------------------------------------
           1. HARDWARE DOCUMENTATION SECTION
        -------------------------------------------------------- */
        .hardware-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .hardware-card {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-header-flex {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 1.5rem;
        }

        .pdf-icon-badge {
          width: 38px;
          height: 46px;
          background: #ffffff;
          border-radius: 6px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 4px;
          position: relative;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
        }

        .pdf-icon-badge::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 12px;
          height: 12px;
          background: #d4d4d8;
          border-bottom-left-radius: 4px;
        }

        .pdf-text {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          font-weight: 900;
          color: #000000;
          letter-spacing: 0.06em;
        }

        .card-title-group h3 {
          font-family: 'General Sans', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 0.35rem 0;
        }

        .card-desc {
          color: #a1a1aa;
          font-size: 0.88rem;
          line-height: 1.45;
          margin: 0;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.85rem 0.5rem;
          margin-bottom: 1.75rem;
        }

        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .spec-icon {
          color: #a1a1aa;
          margin-bottom: 2px;
        }

        .spec-label {
          font-size: 0.74rem;
          color: #71717a;
          font-weight: 500;
        }

        .spec-value {
          font-size: 0.88rem;
          color: #ffffff;
          font-weight: 700;
        }

        .card-action-row {
          margin-top: auto;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .btn-open-doc {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          background: #ffffff;
          border: none;
          color: #000000;
          font-family: 'General Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }

        .btn-open-doc:hover {
          background: #e4e4e7;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.18);
        }

        /* --------------------------------------------------------
           2. PINOUT SECTION (DARK TECHNICAL PANEL)
        -------------------------------------------------------- */
        .pinout-presentation-card {
          background: #0c0c0e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 1.75rem 2rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pinout-presentation-card:hover {
          border-color: rgba(255, 255, 255, 0.22);
          background: #101014;
        }

        .pinout-card-header-inner {
          margin-bottom: 1.25rem;
        }

        .pinout-card-header-inner h3 {
          font-family: 'General Sans', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 0.35rem 0;
        }

        .pinout-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-open-pdf-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 0.95rem;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff;
          font-family: 'General Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-open-pdf-badge:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.3);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .pinout-card-subtitle-inner {
          color: #a1a1aa;
          font-size: 0.88rem;
          margin: 0;
        }

        .pinout-viewport {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow-x: auto;
          padding: 0.5rem 0 1.5rem 0;
          scrollbar-width: thin;
        }

        .pinout-display-img {
          width: 100%;
          max-width: 980px;
          height: auto;
          border-radius: 8px;
          display: block;
          object-fit: contain;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
        }

        .pinout-bottom-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }

        .btn-view-fullsize-teal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0.7rem 1.75rem;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #ffffff;
          color: #000000;
          font-family: 'General Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-view-fullsize-teal:hover {
          background: #e4e4e7;
          border-color: #e4e4e7;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.18);
        }

        .btn-view-pdf-teal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0.7rem 1.75rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-family: 'General Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-view-pdf-teal:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        /* --------------------------------------------------------
           3. FIRMWARE & PROGRAMMING REFERENCE SECTION
        -------------------------------------------------------- */
        .firmware-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 1rem;
        }

        .fw-card {
          background: #0c0c0e;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 1.25rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-decoration: none;
          color: inherit;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fw-card:hover {
          border-color: rgba(255, 255, 255, 0.25);
          background: #141418;
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
        }

        .fw-card-highlight {
          border-color: rgba(255, 255, 255, 0.14);
          background: #101014;
        }

        .fw-icon-box {
          color: #d4d4d8;
          margin-bottom: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fw-icon-ota {
          color: #ffffff;
        }

        .fw-card h4 {
          font-family: 'General Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.35rem 0;
          line-height: 1.3;
        }

        .fw-card p {
          color: #71717a;
          font-size: 0.74rem;
          line-height: 1.4;
          margin: 0;
        }

        /* --------------------------------------------------------
           4. PERIPHERAL REFERENCE SECTION
        -------------------------------------------------------- */
        .peripheral-chips-grid {
          display: grid;
          grid-template-columns: repeat(8, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .peri-chip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0.85rem 0.5rem;
          background: #060608;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          text-decoration: none;
          color: #d4d4d8;
          font-family: 'General Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .peri-chip:hover {
          transform: translateY(-2px);
          background: #141418;
          border-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }

        .peri-icon {
          flex-shrink: 0;
        }

        /* --------------------------------------------------------
           RESPONSIVE BREAKPOINTS
        -------------------------------------------------------- */
        @media (max-width: 1024px) {
          .firmware-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .peripheral-chips-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .docs-container {
            padding: 1.5rem 1rem 4rem 1rem;
          }
          .hardware-grid {
            grid-template-columns: 1fr;
          }
          .firmware-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .peripheral-chips-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .pinout-presentation-card {
            padding: 1.25rem 0.85rem;
          }
          .header-title-row h1 {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .firmware-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
