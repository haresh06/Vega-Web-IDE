'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FlaskConical,
  Code2,
  Radio,
  Cpu,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Activity,
  Terminal,
  Wifi,
  ShieldCheck,
  Zap,
  Monitor,
  Lightbulb,
  Menu,
  X,
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Refs for mouse-following studio light flare
  const heroRef = useRef<HTMLElement>(null);
  const flareRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const isInsideHero = useRef(false);
  const flareRafId = useRef<number | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(motionQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleChange);
    return () => motionQuery.removeEventListener('change', handleChange);
  }, []);

  // Mouse-following subtle studio light flare loop (rAF + smooth lerp)
  useEffect(() => {
    if (isReducedMotion || typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none)').matches) return;

    const heroEl = heroRef.current;
    if (!heroEl) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroEl.getBoundingClientRect();
      targetPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (!isInsideHero.current) {
        isInsideHero.current = true;
        currentPos.current = { ...targetPos.current };
        if (flareRef.current) flareRef.current.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      isInsideHero.current = false;
      if (flareRef.current) flareRef.current.style.opacity = '0';
    };

    const updateFlare = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.08;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.08;

      if (flareRef.current) {
        flareRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0px)`;
      }

      flareRafId.current = requestAnimationFrame(updateFlare);
    };

    heroEl.addEventListener('mousemove', handleMouseMove, { passive: true });
    heroEl.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    flareRafId.current = requestAnimationFrame(updateFlare);

    return () => {
      heroEl.removeEventListener('mousemove', handleMouseMove);
      heroEl.removeEventListener('mouseleave', handleMouseLeave);
      if (flareRafId.current) cancelAnimationFrame(flareRafId.current);
    };
  }, [isReducedMotion]);

  // Hero fade-out passive scroll listener
  useEffect(() => {
    if (isReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isReducedMotion]);

  // IntersectionObserver for scroll-reveal sections
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target); // Trigger once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Compute smooth hero scroll transformations
  const heroOpacity = isReducedMotion ? 1 : Math.max(0, 1 - scrollY / 420);
  const heroTranslateY = isReducedMotion ? 0 : Math.min(60, scrollY * 0.14);
  const boardScale = isReducedMotion ? 1 : Math.max(0.92, 1 - (scrollY / 1000) * 0.1);

  // Features list
  const ecosystemFeatures = [
    {
      icon: BookOpen,
      title: 'LEARNING PATHS',
      desc: 'Structured curriculum taking you from Embedded C fundamentals to advanced RTOS & firmware architecture.',
      tag: 'Beginner → Expert',
      href: '/learn',
    },
    {
      icon: FlaskConical,
      title: 'PROTOCOL LABS',
      desc: 'Deep-dive interactive laboratories for UART, I2C, and SPI bus protocols with real-time waveform inspection.',
      tag: 'UART • I2C • SPI (3 Labs)',
      href: '/experiment',
    },
    {
      icon: Code2,
      title: 'VEGA STUDIO IDE',
      desc: 'Integrated browser-based C/C++ editor with toolchain compilation, serial monitor, and live simulator.',
      tag: 'Code • Build • Run',
      href: '/ide',
    },
    {
      icon: Radio,
      title: 'OTA FIRMWARE FLASH',
      desc: 'Wireless over-the-air firmware deployment through the ESP32 wireless bridge using the XMODEM protocol.',
      tag: 'Wi-Fi → ESP32 Bridge',
      href: '/ide',
    },
    {
      icon: Cpu,
      title: 'HARDWARE & SENSORS',
      desc: 'Comprehensive pinouts, schematic guides, and sensor labs for temperature, ultrasonic, and light modules.',
      tag: 'VEGA ARIES v2.0',
      href: '/boards',
    },
    {
      icon: Trophy,
      title: 'CHALLENGES & QUIZZES',
      desc: 'Hands-on embedded programming challenges, debugging puzzles, quizzes, and earned milestone badges.',
      tag: 'Test Your Mastery',
      href: '/challenges',
    },
  ];

  // Learning journey stages
  const journeyStages = [
    {
      stage: '01',
      title: 'Beginner Foundations',
      subtitle: 'Embedded C & Core GPIO',
      desc: 'Bit manipulation, memory-mapped registers, clock configuration, and digital I/O control on RISC-V.',
      topics: ['Embedded C', 'Memory Maps', 'GPIO In/Out', 'LEDs & Keys'],
    },
    {
      stage: '02',
      title: 'Protocol Integration',
      subtitle: 'UART • I2C • SPI Buses',
      desc: 'Mastering full-duplex UART communication, two-wire I2C sensor bus, and high-speed SPI flash transfers.',
      topics: ['UART Serial', 'I2C OLED/Sensors', 'SPI Flash', 'Packet Frames'],
    },
    {
      stage: '03',
      title: 'Advanced Architecture',
      subtitle: 'Timers, Interrupts & OTA',
      desc: 'Hardware timer interrupts, PWM motor control, bootloaders, and Wi-Fi OTA firmware updating.',
      topics: ['Timer ISRs', 'PWM Signals', 'ADC Inputs', 'OTA Bootloader'],
    },
    {
      stage: '04',
      title: 'Hardware Mastery',
      subtitle: 'VEGA ARIES v2.0 Production',
      desc: 'Building autonomous embedded IoT applications deployed on the indigenous THEJAS32 RISC-V processor.',
      topics: ['THEJAS32 Core', 'Autonomous Nodes', 'Edge Firmware', 'C-DAC Ecosystem'],
    },
  ];

  return (
    <div className={`overview-page-wrapper ${mobileMenuOpen ? 'mobile-drawer-open' : ''}`}>
      {/* Background Low-Key Lighting */}
      <div className="overview-bg-lighting" aria-hidden="true" />

      {/* ====================================================
          1. STICKY MINIMAL HEADER BAR
      ==================================================== */}
      <header className="minimal-header-sticky">
        <div className="minimal-header-inner">
          {/* Left: Brand Logo & Chip */}
          <div className="header-brand-group">
            <Link href="/" className="header-brand-group">
              <div className="brand-icon-box">
                <div className="brand-icon-dot" />
              </div>
              <span className="brand-title-text">VEGA LAB</span>
            </Link>
            <span className="brand-chip-badge">THEJAS32 RISC-V</span>
          </div>

          {/* Center / Right: Navigation */}
          <nav className="header-nav-links">
            <Link href="/" className="header-nav-item active">
              Home
            </Link>
            <Link href="/learn" className="header-nav-item">
              Learning
            </Link>
            <Link href="/experiment" className="header-nav-item">
              Labs
            </Link>
            <Link href="/ide" className="header-nav-item">
              IDE
            </Link>
            <Link href="/docs" className="header-nav-item">
              About
            </Link>
          </nav>

          {/* Right CTA Button */}
          <Link href="/learn" className="header-cta-btn">
            <span>Get Started</span>
            <ArrowRight size={14} />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ====================================================
          2. CINEMATIC HERO SECTION (Fades & Recedes Smoothly on Scroll)
      ==================================================== */}
      <section
        ref={heroRef}
        className="minimal-hero-section"
        style={{
          opacity: heroOpacity,
          transform: `translateY(-${heroTranslateY}px)`,
        }}
      >
        {/* Subtle Pointer-Following Studio Light Flare */}
        <div ref={flareRef} className="hero-mouse-flare" aria-hidden="true" />

        {/* Left Column: Headlines & CTAs */}
        <div className="hero-content-col">
          <div className="hero-eyebrow">
            EMBED &nbsp;·&nbsp; EXPLORE &nbsp;·&nbsp; EXPERIMENT &nbsp;·&nbsp; INNOVATE
          </div>

          <h1 className="hero-headline">
            <span className="headline-primary">LEARN VEGA.</span>
            <span className="headline-secondary">BUILD THE FUTURE.</span>
          </h1>

          <p className="hero-supporting-text">
            A hands-on learning and experimentation platform for
            <br className="hidden sm:inline" /> VEGA ARIES v2.0 and THEJAS32 RISC-V.
          </p>

          <div className="hero-cta-row">
            {/* Primary Action Button */}
            <Link href="/learn" className="btn-primary-orange">
              <span>START TRAINING</span>
              <ArrowRight size={15} />
            </Link>

            {/* Secondary Action Button */}
            <Link href="/ide" className="btn-secondary-dark">
              <Monitor size={16} />
              <span>OPEN VEGA IDE</span>
            </Link>
          </div>
        </div>

        {/* Right Column: VEGA ARIES v2.0 Board Visual on Black Studio Surface */}
        <div className="hero-visual-col">
          <div
            className="board-studio-stage"
            style={{
              transform: `scale(${boardScale})`,
              transition: 'transform 0.1s linear',
            }}
          >
            <div className="board-floor-reflection" />
            <img
              src="/images/vega-aries-board-studio.png"
              alt="VEGA ARIES v2.0 Hardware Board on Black Studio Surface"
              className="board-photo-img"
            />
          </div>
        </div>
      </section>

      {/* ====================================================
          3. MINIMAL FEATURE ROW (Staggered Scroll Reveal)
      ==================================================== */}
      <section className="minimal-feature-row scroll-reveal">
        <Link href="/learn" className="feature-col-item stagger-1">
          <BookOpen size={24} strokeWidth={1.5} className="feature-col-icon" />
          <span className="feature-col-title">LEARN</span>
        </Link>

        <Link href="/ide" className="feature-col-item stagger-2">
          <Code2 size={24} strokeWidth={1.5} className="feature-col-icon" />
          <span className="feature-col-title">BUILD</span>
        </Link>

        <Link href="/experiment" className="feature-col-item stagger-3">
          <Cpu size={24} strokeWidth={1.5} className="feature-col-icon" />
          <span className="feature-col-title">EXPERIMENT</span>
        </Link>

        <Link href="/challenges" className="feature-col-item stagger-4">
          <Lightbulb size={24} strokeWidth={1.5} className="feature-col-icon" />
          <span className="feature-col-title">INNOVATE</span>
        </Link>
      </section>

      {/* ====================================================
          4. STATS SUMMARY ROW
      ==================================================== */}
      <div className="section-block-wrapper scroll-reveal">
        <div className="stats-grid-row">
          <div className="stat-dark-card stagger-1">
            <BookOpen size={22} className="stat-icon-pill" />
            <span className="stat-large-num">20+</span>
            <span className="stat-label-title">Learning Modules</span>
            <span className="stat-label-sub">Beginner to Advanced</span>
          </div>

          <div className="stat-dark-card stagger-2">
            <FlaskConical size={22} className="stat-icon-pill" />
            <span className="stat-large-num">3</span>
            <span className="stat-label-title">Protocol Labs</span>
            <span className="stat-label-sub">UART • I2C • SPI</span>
          </div>

          <div className="stat-dark-card stagger-3">
            <Activity size={22} className="stat-icon-pill" />
            <span className="stat-large-num">15+</span>
            <span className="stat-label-title">Hardware Experiments</span>
            <span className="stat-label-sub">Interactive Simulation</span>
          </div>

          <div className="stat-dark-card stagger-4">
            <Trophy size={22} className="stat-icon-pill" />
            <span className="stat-large-num">12</span>
            <span className="stat-label-title">Skill Badges</span>
            <span className="stat-label-sub">Certificates &amp; Mastery</span>
          </div>
        </div>
      </div>

      {/* ====================================================
          5. CORE ECOSYSTEM (6 Cards 3x2 Grid)
      ==================================================== */}
      <section className="section-block-wrapper scroll-reveal">
        <div className="section-header-centered">
          <span className="section-tag-pill">CORE ECOSYSTEM</span>
          <h2 className="section-main-heading">Everything You Need to Master Embedded Systems</h2>
          <p className="section-sub-desc">
            From register-level manipulation to OTA deployment on indigenous RISC-V hardware.
          </p>
        </div>

        <div className="features-3x2-grid">
          {ecosystemFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Link
                href={feat.href}
                key={idx}
                className={`ecosystem-dark-card stagger-${(idx % 3) + 1}`}
              >
                <div className="card-top-header">
                  <div className="card-icon-frame">
                    <Icon size={20} />
                  </div>
                  <span className="card-badge-pill">{feat.tag}</span>
                </div>

                <h3 className="card-feature-title">{feat.title}</h3>
                <p className="card-feature-desc">{feat.desc}</p>

                <div className="card-action-arrow">
                  <span>Launch Module</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ====================================================
          6. STRUCTURED ROADMAP (4 Cards)
      ==================================================== */}
      <section className="section-block-wrapper scroll-reveal">
        <div className="section-header-centered">
          <span className="section-tag-pill">STRUCTURED ROADMAP</span>
          <h2 className="section-main-heading">From Beginner to Embedded Engineer</h2>
          <p className="section-sub-desc">
            Progressive mastery pipeline designed specifically for the VEGA RISC-V processor family.
          </p>
        </div>

        <div className="roadmap-stages-grid">
          {journeyStages.map((stage, sIdx) => (
            <div key={sIdx} className={`stage-dark-card stagger-${sIdx + 1}`}>
              <div className="stage-header-row">
                <span className="stage-number-tag">{stage.stage}</span>
                <span className="stage-dot" />
              </div>

              <h3 className="stage-title-text">{stage.title}</h3>
              <div className="stage-sub-text">{stage.subtitle}</div>
              <p className="stage-desc-text">{stage.desc}</p>

              <div className="stage-topics-tags">
                {stage.topics.map((top, tIdx) => (
                  <span key={tIdx} className="topic-chip-tag">
                    <CheckCircle2 size={11} />
                    {top}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================
          7. HARDWARE ARCHITECTURE & SPECS
      ==================================================== */}
      <section className="section-block-wrapper scroll-reveal">
        <div className="specs-panel-container">
          <div className="specs-checklist-col">
            <div>
              <span className="section-tag-pill">HARDWARE ARCHITECTURE</span>
              <h2 className="section-main-heading" style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>
                Why VEGA ARIES v2.0?
              </h2>
              <p className="section-sub-desc" style={{ marginBottom: '1.5rem' }}>
                An embedded development platform built around the THEJAS32 RISC-V processor,
                designed for hands-on learning, firmware development, and hardware experimentation.
              </p>
            </div>

            <div className="specs-checklist-col">
              {[
                { label: 'THEJAS32 RISC-V Core', detail: '32-bit RV32IM architecture operating at 100MHz clock frequency' },
                { label: 'Dual Memory Subsystem', detail: '256KB on-chip high-speed SRAM + 2MB SPI Flash storage' },
                { label: '32 Multiplexed GPIO Lines', detail: 'Configurable digital pins with interrupt & pull-up capabilities' },
                { label: 'Full Peripheral Set', detail: 'Dedicated hardware controllers for UART0/1, I2C, SPI, PWM & Timers' },
                { label: 'Analog Sensing & ADC', detail: '10-bit multi-channel Analog-to-Digital converter for sensor data' },
                { label: 'Wireless OTA Bridge', detail: 'Integrated ESP32 gateway enabling remote over-the-air firmware updates' },
              ].map((spec, idx) => (
                <div key={idx} className="spec-line-item">
                  <CheckCircle2 size={16} className="spec-check-icon" />
                  <div>
                    <span className="spec-title-bold">{spec.label}: </span>
                    <span className="spec-detail-muted">{spec.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="arch-diagram-card">
            <div className="arch-diagram-header">
              <Cpu size={18} />
              <span>THEJAS32 RISC-V SoC Architecture</span>
            </div>

            <div className="arch-boxes-stack">
              <div className="arch-core-pill">
                <span>RV32IM CORE</span>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>100 MHz Pipeline</span>
              </div>

              <div className="arch-mem-pill">
                <div className="mem-chip">256KB SRAM</div>
                <div className="mem-chip">2MB SPI Flash</div>
              </div>

              <div className="arch-bus-strip">INTERNAL SYSTEM INTERCONNECT BUS</div>

              <div className="arch-periphs-chips">
                <div className="periph-mini-chip">UART 0/1</div>
                <div className="periph-mini-chip">I2C BUS</div>
                <div className="periph-mini-chip">SPI BUS</div>
                <div className="periph-mini-chip">PWM / TMR</div>
                <div className="periph-mini-chip">10-bit ADC</div>
                <div className="periph-mini-chip">32 GPIO</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          8. WIRELESS FIRMWARE DELIVERY (OTA Pipeline)
      ==================================================== */}
      <section className="section-block-wrapper scroll-reveal">
        <div className="ota-pipeline-box">
          <div>
            <span className="section-tag-pill">WIRELESS FIRMWARE DELIVERY</span>
            <h2 className="section-main-heading" style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>
              Understanding the VEGA OTA Flashing Pipeline
            </h2>
            <p className="section-sub-desc">
              Decoupling network connectivity from the core processor using a dedicated ESP32 wireless gateway:
            </p>
          </div>

          <div className="ota-flow-steps">
            <div className="ota-node-item">
              <div className="ota-node-icon-box"><Terminal size={18} /></div>
              <span className="ota-node-title">Laptop / Web IDE</span>
              <span className="ota-node-subtext">Source Code / GCC</span>
            </div>

            <div className="ota-arrow-step">
              <span className="ota-arrow-label">firmware.bin</span>
              <ArrowRight size={16} />
            </div>

            <div className="ota-node-item">
              <div className="ota-node-icon-box"><Wifi size={18} /></div>
              <span className="ota-node-title">Wi-Fi Gateway</span>
              <span className="ota-node-subtext">HTTP / Discover</span>
            </div>

            <div className="ota-arrow-step">
              <span className="ota-arrow-label">Binary Packets</span>
              <ArrowRight size={16} />
            </div>

            <div className="ota-node-item">
              <div className="ota-node-icon-box"><Zap size={18} /></div>
              <span className="ota-node-title">ESP32 Bridge</span>
              <span className="ota-node-subtext">XMODEM Buffer</span>
            </div>

            <div className="ota-arrow-step">
              <span className="ota-arrow-label">UART0 (115200)</span>
              <ArrowRight size={16} />
            </div>

            <div className="ota-node-item">
              <div className="ota-node-icon-box"><Cpu size={18} /></div>
              <span className="ota-node-title">VEGA ARIES v2.0</span>
              <span className="ota-node-subtext">THEJAS32 Flash</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
            <ShieldCheck size={16} style={{ color: '#ffffff', flexShrink: 0 }} />
            <span>
              <strong style={{ color: '#ffffff' }}>Architectural Note:</strong> The VEGA board receives firmware via its hardware UART0 port from the ESP32 wireless bridge module.
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================
          9. LIVE SYSTEM DIAGNOSTICS & TELEMETRY
      ==================================================== */}
      <section className="section-block-wrapper scroll-reveal">
        <div className="section-header-centered">
          <span className="section-tag-pill">SYSTEM DIAGNOSTICS</span>
          <h2 className="section-main-heading">Live System Diagnostics &amp; Telemetry</h2>
          <p className="section-sub-desc">
            Real-time hardware interface telemetry and simulator environment state.
          </p>
        </div>

        <div className="telemetry-4-grid">
          <div className="telemetry-dark-card stagger-1">
            <span className="telemetry-card-title">
              <span className="telemetry-status-dot" />
              VEGA ARIES v2.0
            </span>
            <span className="telemetry-card-value">Ready &amp; Emulated</span>
            <span className="telemetry-card-sub">Web Interactive Simulation Active</span>
          </div>

          <div className="telemetry-dark-card stagger-2">
            <span className="telemetry-card-title">
              <span className="telemetry-status-dot" />
              THEJAS32 Processor
            </span>
            <span className="telemetry-card-value">100.00 MHz</span>
            <span className="telemetry-card-sub">RV32IM RISC-V Pipeline Ready</span>
          </div>

          <div className="telemetry-dark-card stagger-3">
            <span className="telemetry-card-title">
              <span className="telemetry-status-dot" />
              Serial Interface
            </span>
            <span className="telemetry-card-value">UART0 • 115200</span>
            <span className="telemetry-card-sub">Serial Terminal Driver Standby</span>
          </div>

          <div className="telemetry-dark-card stagger-4">
            <span className="telemetry-card-title">
              <span className="telemetry-status-dot" style={{ background: '#71717a' }} />
              Hardware USB Link
            </span>
            <span className="telemetry-card-value">Web Virtual Mode</span>
            <span className="telemetry-card-sub">Ready for Web Serial Connection</span>
          </div>
        </div>
      </section>

      {/* ====================================================
          10. BOTTOM CALL TO ACTION
      ==================================================== */}
      <section className="section-block-wrapper scroll-reveal">
        <div className="bottom-cta-banner">
          <h2 className="cta-banner-title">Ready to Master Indigenous RISC-V Embedded Systems?</h2>
          <p className="cta-banner-sub">
            Join thousands of engineers learning, coding, and deploying on the VEGA ARIES v2.0 ecosystem.
          </p>
          <div className="hero-cta-row">
            <Link href="/learn" className="btn-primary-orange">
              <span>START LEARNING CENTER</span>
              <ArrowRight size={15} />
            </Link>
            <Link href="/ide" className="btn-secondary-dark">
              <Monitor size={16} />
              <span>LAUNCH VEGA STUDIO IDE</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================
          11. THIN-LINE FOOTER
      ==================================================== */}
      <footer className="minimal-footer">
        <div className="footer-copyright">
          © 2025 VEGA LAB. All rights reserved.
        </div>

        <div className="footer-links-group">
          <Link href="/docs" className="footer-link-item">
            Privacy
          </Link>
          <span className="footer-link-separator">|</span>
          <Link href="/docs" className="footer-link-item">
            Terms
          </Link>
          <span className="footer-link-separator">|</span>
          <Link href="/docs" className="footer-link-item">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
