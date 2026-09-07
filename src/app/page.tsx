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
} from 'lucide-react';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);
  const [animState, setAnimState] = useState<'initial' | 'zooming' | 'receding' | 'settled'>('initial');

  // DOM Refs for 60 FPS transform updates without triggering React re-renders
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const boardWrapperRef = useRef<HTMLDivElement>(null);
  const bgGlowRef = useRef<HTMLDivElement>(null);
  const bgGridRef = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);

  // Mouse parallax state for requestAnimationFrame loop
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const isReducedMotion = useRef(false);

  // 1. Cinematic Intro Timeline
  useEffect(() => {
    // Check user preference for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion.current = motionQuery.matches;

    if (isReducedMotion.current) {
      setAnimState('settled');
      return;
    }

    // Step 1: Initial Mount -> Zooming (Board appears close & large)
    const t1 = setTimeout(() => {
      setAnimState('zooming');
    }, 50);

    // Step 2: Receding (Board pulls back to Left side, Text starts revealing on Right)
    const t2 = setTimeout(() => {
      setAnimState('receding');
    }, 900);

    // Step 3: Settled (Parallax enabled, all elements fully interactive)
    const t3 = setTimeout(() => {
      setAnimState('settled');
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // 2. High-Performance Mouse Parallax Loop (rAF + Lerp)
  useEffect(() => {
    if (animState !== 'settled' || isReducedMotion.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1; // -1 to 1
      const y = (e.clientY / innerHeight) * 2 - 1; // -1 to 1
      targetPos.current = { x, y };
    };

    const updateParallax = () => {
      // Lerp (Linear Interpolation) for buttery smooth spring easing
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.055;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.055;

      const { x, y } = currentPos.current;

      // Board: Subtle 3D tilt & gentle translation
      if (boardWrapperRef.current) {
        boardWrapperRef.current.style.transform = `perspective(1200px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg) translate3d(${x * 14}px, ${y * 10}px, 0px)`;
      }

      // Background Grid & Glow: Gentle counter-parallax for deep perspective
      if (bgGridRef.current) {
        bgGridRef.current.style.transform = `translate3d(${-x * 18}px, ${-y * 14}px, 0px)`;
      }
      if (bgGlowRef.current) {
        bgGlowRef.current.style.transform = `translate3d(${-x * 25}px, ${-y * 20}px, 0px) scale(${1 + Math.abs(x * 0.05)})`;
      }

      // Text Column: Extremely subtle stabilization parallax
      if (textColRef.current) {
        textColRef.current.style.transform = `translate3d(${x * 4}px, ${y * 3}px, 0px)`;
      }

      rafId.current = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [animState]);

  // Scroll listener for hero fade-out and scroll-triggered animations
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);

      if (y > 80 && !statsAnimated) {
        setStatsAnimated(true);
      }

      const journeyElem = document.getElementById('learning-journey-section');
      if (journeyElem) {
        const rect = journeyElem.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          const step = Math.min(3, Math.max(0, Math.floor((window.innerHeight * 0.75 - rect.top) / 120)));
          setActiveJourneyStep(step);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [statsAnimated]);

  // Hero fade-out calculation for smooth transition into dashboard
  const heroOpacity = Math.max(0, Math.min(1, 1 - scrollY / 500));
  const heroScale = Math.max(0.92, 1 - (scrollY / 1000) * 0.08);
  const isHeroVisible = heroOpacity > 0.01;

  // Features list
  const features = [
    {
      icon: BookOpen,
      title: 'LEARNING PATHS',
      desc: 'Structured curriculum taking you from Embedded C fundamentals to advanced RTOS & firmware architecture.',
      tag: 'Beginner → Expert',
      href: '/learn',
      color: '#06d6a0',
    },
    {
      icon: FlaskConical,
      title: 'PROTOCOL LABS',
      desc: 'Deep-dive interactive laboratories for UART, I2C, and SPI bus protocols with real-time waveform inspection.',
      tag: 'UART • I2C • SPI (3 Labs)',
      href: '/experiment',
      color: '#4cc9f0',
    },
    {
      icon: Code2,
      title: 'VEGA STUDIO IDE',
      desc: 'Integrated browser-based C/C++ editor with toolchain compilation, serial monitor, and live simulator.',
      tag: 'Code • Build • Run',
      href: '/ide',
      color: '#7b2ff7',
    },
    {
      icon: Radio,
      title: 'OTA FIRMWARE FLASH',
      desc: 'Wireless over-the-air firmware deployment through the ESP32 wireless bridge using the XMODEM protocol.',
      tag: 'Wi-Fi → ESP32 Bridge',
      href: '/ota',
      color: '#ff6b35',
    },
    {
      icon: Cpu,
      title: 'HARDWARE & SENSORS',
      desc: 'Comprehensive pinouts, schematic guides, and sensor labs for temperature, ultrasonic, and light modules.',
      tag: 'VEGA ARIES v2.0',
      href: '/boards',
      color: '#ffd60a',
    },
    {
      icon: Trophy,
      title: 'CHALLENGES & QUIZZES',
      desc: 'Hands-on embedded programming challenges, debugging puzzles, quizzes, and earned milestone badges.',
      tag: 'Test Your Mastery',
      href: '/challenges',
      color: '#f72585',
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
    <div className="overview-page">
      {/* ========================================================
          1. FULL-SCREEN CINEMATIC CENTERED HERO SECTION
      ======================================================== */}
      <section
        ref={heroSectionRef}
        className={`hero-cinematic-section anim-phase-${animState}`}
        style={{
          opacity: isHeroVisible ? heroOpacity : 0,
          pointerEvents: isHeroVisible ? 'auto' : 'none',
          visibility: isHeroVisible ? 'visible' : 'hidden',
          transform: `scale(${heroScale}) translateY(${scrollY * 0.12}px)`,
        }}
      >
        {/* Cinematic Ambient Backdrop Lighting & Technical Grid */}
        <div ref={bgGlowRef} className="hero-glow-layer" />
        <div ref={bgGridRef} className="hero-pcb-grid" />
        <div className="hero-light-flare-streak" />

        {/* ====================================================
            TOP MINIMAL BRANDING BAR (Left: Brand, Right: Online Status)
        ==================================================== */}
        <header className="hero-top-bar">
          <div className="top-brand-group">
            <div className="brand-logo-gem">
              <span className="gem-inner" />
            </div>
            <div className="brand-titles">
              <span className="brand-name">VEGA LAB</span>
              <span className="brand-chip">THEJAS32 RISC-V</span>
            </div>
          </div>

          <div className="top-status-badge">
            <span className="status-live-dot" />
            <span className="status-text">ARIES v2.0 Online</span>
          </div>
        </header>

        {/* ====================================================
            VEGA ARIES v2 BOARD (CINEMATIC BACKGROUND ENTITY)
        ==================================================== */}
        <div className="hero-board-backdrop-center">
          <div ref={boardWrapperRef} className="board-cinematic-stage">
            {/* Luminous Radial Neon Halo behind board */}
            <div className="board-halo-glow" />

            {/* Hardware Board Image */}
            <img
              src="/images/vega-aries-board.png"
              alt="VEGA ARIES v2.0 THEJAS32 RISC-V Hardware Board"
              className="board-cinematic-image"
              priority-hint="high"
            />
          </div>
        </div>

        {/* ====================================================
            MAIN CENTERED FOREGROUND HERO CONTENT
        ==================================================== */}
        <div ref={textColRef} className="hero-centered-content">
          {/* Main Dominant Headline (Stacked & Centered in General Sans 900) */}
          <h1 className="hero-headline-centered">
            <span className="headline-line headline-line-1">
              <span className="headline-text text-white">LEARN VEGA.</span>
            </span>
            <span className="headline-line headline-line-2">
              <span className="headline-text text-emerald">DEVELOP WITH RISC-V.</span>
            </span>
            <span className="headline-line headline-line-3">
              <span className="headline-text text-cyan-gradient">BUILD THE FUTURE.</span>
            </span>
          </h1>

          {/* Centered Supporting Description (Max width 850–950px in General Sans 400) */}
          <p className="hero-description-centered">
            A comprehensive training and experimentation platform for VEGA ARIES v2.0 and THEJAS32 RISC-V, designed to provide hands-on learning in embedded systems, processor programming, firmware development, hardware interfacing, and real-world application development.
          </p>

          {/* THREE CENTERED HERO ACTION BUTTONS (Single Row on Desktop) */}
          <div className="hero-cta-buttons-centered">
            {/* 1. START TRAINING (Luminous Emerald-Cyan Gradient with Ambient Glow) */}
            <Link href="/learn" className="btn-hero-learning">
              <div className="btn-blur-halo" />
              <span className="btn-icon">🚀</span>
              <span className="btn-text">START TRAINING</span>
              <ArrowRight size={18} className="btn-arrow" />
            </Link>

            {/* 2. OPEN VEGA IDE (Indigo/Purple Glass Card with Radiant Blur) */}
            <Link href="/ide" className="btn-hero-ide">
              <div className="btn-blur-halo ide-halo" />
              <span className="btn-icon">💻</span>
              <span className="btn-text">OPEN VEGA IDE</span>
            </Link>

            {/* 3. EXPLORE LABS (Cyan/Teal Glass Card with Shimmer Blur) */}
            <Link href="/experiment" className="btn-hero-labs">
              <div className="btn-blur-halo labs-halo" />
              <span className="btn-icon">🔬</span>
              <span className="btn-text">EXPLORE LABS</span>
            </Link>
          </div>
        </div>

        {/* ====================================================
            BOTTOM CENTERED SCROLL INDICATOR
        ==================================================== */}
        <div
          className="hero-scroll-indicator"
          onClick={() => {
            const bodyElem = document.getElementById('dashboard-body-content');
            if (bodyElem) bodyElem.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="scroll-label">SCROLL TO EXPLORE</span>
          <div className="scroll-mouse-icon">
            <span className="scroll-mouse-wheel" />
          </div>
        </div>
      </section>

      {/* ========================================================
          2. DASHBOARD BODY CONTENT (Below 100vh Hero)
      ======================================================== */}
      <div id="dashboard-body-content" className="dashboard-body-container">
        {/* 2A. STATISTICS ROW */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ color: '#06d6a0' }}>
                <BookOpen size={24} />
              </div>
              <div className="stat-number-wrap">
                <span className="stat-number">20+</span>
                <span className="stat-label">Learning Modules</span>
              </div>
              <span className="stat-subtext">Beginner to Advanced</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ color: '#4cc9f0' }}>
                <FlaskConical size={24} />
              </div>
              <div className="stat-number-wrap">
                <span className="stat-number">3</span>
                <span className="stat-label">Protocol Labs</span>
              </div>
              <span className="stat-subtext">UART • I2C • SPI (Exact 3 Labs)</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ color: '#7b2ff7' }}>
                <Activity size={24} />
              </div>
              <div className="stat-number-wrap">
                <span className="stat-number">15+</span>
                <span className="stat-label">Hardware Experiments</span>
              </div>
              <span className="stat-subtext">Interactive Simulation</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ color: '#f72585' }}>
                <Trophy size={24} />
              </div>
              <div className="stat-number-wrap">
                <span className="stat-number">12</span>
                <span className="stat-label">Skill Badges</span>
              </div>
              <span className="stat-subtext">Certificates &amp; Achievements</span>
            </div>
          </div>
        </section>

        {/* 2B. FEATURE CARDS (3x2 Grid) */}
        <section className="section-block">
          <div className="section-header-row">
            <div>
              <span className="section-tag-pill">CORE ECOSYSTEM</span>
              <h2 className="section-main-title">
                Everything You Need to <span className="gradient-text">Master Embedded Systems</span>
              </h2>
            </div>
            <p className="section-header-desc">
              From register-level manipulation to OTA deployment on indigenous RISC-V hardware.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Link href={feat.href} key={idx} className="feature-glass-card">
                  <div className="card-top-row">
                    <div className="feature-icon-box" style={{ color: feat.color, borderColor: `${feat.color}40`, background: `${feat.color}15` }}>
                      <Icon size={22} />
                    </div>
                    <span className="feature-tag-badge" style={{ color: feat.color, borderColor: `${feat.color}35`, background: `${feat.color}10` }}>
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="feature-title">{feat.title}</h3>
                  <p className="feature-desc">{feat.desc}</p>

                  <div className="card-action-link" style={{ color: feat.color }}>
                    <span>Launch Module</span>
                    <ArrowRight size={15} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 2C. LEARNING JOURNEY (Interactive Sequential Pipeline) */}
        <section id="learning-journey-section" className="section-block">
          <div className="section-header-row">
            <div>
              <span className="section-tag-pill">STRUCTURED ROADMAP</span>
              <h2 className="section-main-title">
                From Beginner to <span className="gradient-text">Embedded Engineer</span>
              </h2>
            </div>
            <p className="section-header-desc">
              Progressive mastery pipeline designed specifically for the VEGA RISC-V processor family.
            </p>
          </div>

          <div className="journey-pipeline-container">
            {journeyStages.map((stage, sIdx) => {
              const isPassed = activeJourneyStep >= sIdx;
              return (
                <div key={sIdx} className={`journey-stage-card ${isPassed ? 'active-stage' : ''}`}>
                  <div className="stage-top-indicator">
                    <span className="stage-number-badge">{stage.stage}</span>
                    <span className="stage-status-dot" />
                  </div>

                  <h4 className="stage-title">{stage.title}</h4>
                  <span className="stage-subtitle">{stage.subtitle}</span>
                  <p className="stage-desc">{stage.desc}</p>

                  <div className="stage-topics-list">
                    {stage.topics.map((top, tIdx) => (
                      <span key={tIdx} className="stage-topic-chip">
                        <CheckCircle2 size={12} className="chip-check" />
                        {top}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2D. WHY VEGA ARIES v2.0? (TECHNICAL SPECIFICATIONS) */}
        <section className="section-block">
          <div className="why-vega-card">
            <div className="why-vega-left">
              <span className="section-tag-pill">HARDWARE ARCHITECTURE</span>
              <h3 className="why-vega-title">Why VEGA ARIES v2.0?</h3>
              <p className="why-vega-summary">
                An embedded development platform built around the THEJAS32 RISC-V processor,
                designed for hands-on learning, firmware development, and real hardware experimentation.
              </p>

              <div className="specs-checklist">
                {[
                  { label: 'THEJAS32 RISC-V Core', detail: '32-bit RV32IM architecture operating at 100MHz clock frequency' },
                  { label: 'Dual Memory Subsystem', detail: '256KB on-chip high-speed SRAM + 2MB SPI Flash storage' },
                  { label: '32 Multiplexed GPIO Lines', detail: 'Configurable digital pins with interrupt & pull-up capabilities' },
                  { label: 'Full Peripheral Set', detail: 'Dedicated hardware controllers for UART0/1, I2C, SPI, PWM & Timers' },
                  { label: 'Analog Sensing & ADC', detail: '10-bit multi-channel Analog-to-Digital converter for sensor data' },
                  { label: 'Wireless OTA Bridge', detail: 'Integrated ESP32 gateway enabling remote over-the-air firmware updates' },
                ].map((spec, idx) => (
                  <div key={idx} className="spec-check-item">
                    <div className="spec-check-icon">
                      <CheckCircle2 size={16} color="#06d6a0" />
                    </div>
                    <div>
                      <strong className="spec-title-text">{spec.label}: </strong>
                      <span className="spec-detail-text">{spec.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="why-vega-right">
              <div className="architecture-block-diagram">
                <div className="arch-header">
                  <Cpu size={18} color="#06d6a0" />
                  <span>THEJAS32 RISC-V SoC Architecture</span>
                </div>
                <div className="arch-blocks-grid">
                  <div className="arch-core-box">
                    <span className="arch-core-title">RV32IM CORE</span>
                    <span className="arch-core-sub">100 MHz Pipeline</span>
                  </div>
                  <div className="arch-mem-box">
                    <span>256KB SRAM</span>
                    <span>2MB SPI Flash</span>
                  </div>
                  <div className="arch-bus-bar">INTERNAL SYSTEM INTERCONNECT BUS</div>
                  <div className="arch-periph-row">
                    <span className="periph-chip">UART 0/1</span>
                    <span className="periph-chip">I2C BUS</span>
                    <span className="periph-chip">SPI BUS</span>
                    <span className="periph-chip">PWM / TMR</span>
                    <span className="periph-chip">10-bit ADC</span>
                    <span className="periph-chip">32 GPIO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2E. WIRELESS FIRMWARE DELIVERY (OTA PIPELINE ARCHITECTURE) */}
        <section className="section-block">
          <div className="ota-showcase-panel">
            <div className="ota-panel-header">
              <div className="ota-badge">
                <Wifi size={16} color="#ff6b35" />
                <span>WIRELESS FIRMWARE DELIVERY</span>
              </div>
              <h3 className="ota-title">Understanding the VEGA OTA Flashing Pipeline</h3>
              <p className="ota-desc">
                Our architecture decouples network connectivity from the core processor using a dedicated ESP32 wireless gateway:
              </p>
            </div>

            {/* Pipeline Flow Diagram */}
            <div className="ota-pipeline-flow">
              <div className="ota-step-node">
                <div className="ota-node-icon"><Terminal size={20} /></div>
                <span className="ota-node-name">Laptop / Web IDE</span>
                <span className="ota-node-sub">Source Code / GCC</span>
              </div>

              <div className="ota-flow-arrow">
                <span className="flow-label">firmware.bin</span>
                <div className="flow-line" />
              </div>

              <div className="ota-step-node">
                <div className="ota-node-icon"><Wifi size={20} /></div>
                <span className="ota-node-name">Wi-Fi Gateway</span>
                <span className="ota-node-sub">HTTP / WebSocket</span>
              </div>

              <div className="ota-flow-arrow">
                <span className="flow-label">Binary Packets</span>
                <div className="flow-line" />
              </div>

              <div className="ota-step-node">
                <div className="ota-node-icon"><Zap size={20} /></div>
                <span className="ota-node-name">ESP32 Bridge</span>
                <span className="ota-node-sub">XMODEM Buffer</span>
              </div>

              <div className="ota-flow-arrow">
                <span className="flow-label">UART0 (115200)</span>
                <div className="flow-line" />
              </div>

              <div className="ota-step-node ota-final-node">
                <div className="ota-node-icon"><Cpu size={20} /></div>
                <span className="ota-node-name">VEGA ARIES v2.0</span>
                <span className="ota-node-sub">THEJAS32 Core Flash</span>
              </div>
            </div>

            <div className="ota-architecture-note">
              <ShieldCheck size={16} color="#06d6a0" />
              <span>
                <strong>Architectural Note:</strong> The VEGA board receives the firmware image via its hardware UART0 port from the ESP32 wireless bridge module.
              </span>
            </div>
          </div>
        </section>

        {/* 2F. LIVE SYSTEM TELEMETRY */}
        <section className="section-block">
          <div className="section-header-row">
            <div>
              <span className="section-tag-pill">SYSTEM DIAGNOSTICS</span>
              <h2 className="section-main-title">
                Live System <span className="gradient-text">Diagnostics &amp; Telemetry</span>
              </h2>
            </div>
            <p className="section-header-desc">
              Real-time hardware interface telemetry and simulator environment state.
            </p>
          </div>

          <div className="telemetry-grid">
            <div className="telemetry-card">
              <div className="telemetry-header">
                <span className="telemetry-dot online" />
                <span className="telemetry-label">VEGA ARIES v2.0</span>
              </div>
              <span className="telemetry-value">Ready &amp; Emulated</span>
              <span className="telemetry-sub">Web Interactive Simulation Active</span>
            </div>

            <div className="telemetry-card">
              <div className="telemetry-header">
                <span className="telemetry-dot online" />
                <span className="telemetry-label">THEJAS32 Processor</span>
              </div>
              <span className="telemetry-value">100.00 MHz</span>
              <span className="telemetry-sub">RV32IM RISC-V Pipeline Ready</span>
            </div>

            <div className="telemetry-card">
              <div className="telemetry-header">
                <span className="telemetry-dot online" />
                <span className="telemetry-label">Serial Interface</span>
              </div>
              <span className="telemetry-value">UART0 • 115200</span>
              <span className="telemetry-sub">Serial Terminal Driver Standby</span>
            </div>

            <div className="telemetry-card">
              <div className="telemetry-header">
                <span className="telemetry-dot standby" />
                <span className="telemetry-label">Hardware USB Link</span>
              </div>
              <span className="telemetry-value">○ Web Virtual Mode</span>
              <span className="telemetry-sub">Physical Board Not Connected</span>
            </div>
          </div>
        </section>

        {/* 2G. BOTTOM CALL TO ACTION */}
        <section className="overview-bottom-cta">
          <div className="bottom-cta-card">
            <h2 className="cta-headline">Ready to Master Indigenous RISC-V Embedded Systems?</h2>
            <p className="cta-sub">
              Join thousands of engineers learning, coding, and deploying on the VEGA ARIES v2.0 ecosystem.
            </p>
            <div className="cta-action-row">
              <Link href="/learn" className="btn-hero-learning" style={{ padding: '1rem 2.4rem' }}>
                <span className="btn-icon">🚀</span>
                <span className="btn-text">Start Learning Center</span>
                <ArrowRight size={18} className="btn-arrow" />
              </Link>
              <Link href="/ide" className="btn-hero-ide" style={{ padding: '1rem 2.4rem' }}>
                <span className="btn-icon">💻</span>
                <span className="btn-text">Launch VEGA Studio IDE</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2H. CLEAN OVERVIEW FOOTER */}
        <footer className="overview-page-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span className="footer-brand-title">VEGA LEARN &amp; LAB</span>
              <span className="footer-brand-sub">Indigenous Embedded Systems Learning Platform</span>
            </div>
            <div className="footer-right">
              <span>Powered by THEJAS32 RISC-V • VEGA ARIES v2.0 • C-DAC India</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
