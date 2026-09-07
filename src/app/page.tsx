'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import FuturisticEcosystemBackground from '@/components/home/FuturisticEcosystemBackground';
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

// ========================================================
// PRECOMPUTED 3D WIREFRAME MATRIX FOR DIGITAL PLANET GLOBE (ELECTRIC CYAN / SPACE BLUE)
// ========================================================
const GLOBE_LAT_COUNT = 24;
const GLOBE_LON_MAX = 34;

const GLOBE_LAT_PATHS = Array.from({ length: GLOBE_LAT_COUNT }).map((_, k) => {
  const t = (k + 1) / GLOBE_LAT_COUNT;
  const yApex = 24 + 276 * Math.pow(t, 1.25);
  return `M ${-200 + k * 8} 320 Q 800 ${yApex} ${1800 - k * 8} 320`;
});

interface LonLine {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isCenter: boolean;
}

interface GlobeNode {
  key: string;
  x: number;
  y: number;
  r: number;
  color: string;
  isPrimary: boolean;
  isCenter: boolean;
}

const GLOBE_LON_LINES: LonLine[] = [];
const GLOBE_INTERSECTION_NODES: GlobeNode[] = [];

for (let j = -GLOBE_LON_MAX; j <= GLOBE_LON_MAX; j++) {
  const u = j / GLOBE_LON_MAX; // -1 to +1
  const xTop = 800 + u * 790;
  const yTop = 24 + 290 * Math.pow((xTop - 800) / 1000, 2);
  const xBot = 800 + u * 940;
  const yBot = 320;
  const isCenter = j === 0;

  GLOBE_LON_LINES.push({ id: j, x1: xTop, y1: yTop, x2: xBot, y2: yBot, isCenter });

  for (let k = 0; k < GLOBE_LAT_COUNT; k++) {
    const t = (k + 1) / GLOBE_LAT_COUNT;
    const x = xTop + t * (xBot - xTop);
    const yApex = 24 + 276 * Math.pow(t, 1.25);
    const y = yApex + (320 - yApex) * Math.pow((x - 800) / (1000 - k * 8), 2);

    const isPrimary = (k % 2 === 0 && j % 2 === 0) || isCenter || (Math.abs(j) === 16 && k === 4);
    const isBrightWhite = isCenter || (k <= 2 && Math.abs(j) <= 6) || (Math.abs(j) % 6 === 0 && k % 4 === 0);
    const color = isBrightWhite ? '#ffffff' : isPrimary ? '#00f0ff' : '#38bdf8';
    const r = isCenter ? (k === 0 ? 4.2 : 2.8) : isBrightWhite ? 2.4 : isPrimary ? 1.8 : 1.1;

    GLOBE_INTERSECTION_NODES.push({
      key: `node-${k}-${j}`,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      r,
      color,
      isPrimary,
      isCenter,
    });
  }
}

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
      {/* ====================================================
          TOP HORIZONTAL GLASS HEADER (Fixed at Top of Viewport)
      ==================================================== */}
      <header className="hero-top-bar">
        {/* LEFT SIDE: [VEGA LAB] [THEJAS32 RISC-V] */}
        <div className="top-brand-group">
          <Link href="/" className="brand-link-wrapper">
            <div className="brand-logo-gem">
              <span className="gem-inner" />
            </div>
            <span className="brand-name">VEGA LAB</span>
          </Link>
          <span className="brand-chip">THEJAS32 RISC-V</span>
        </div>

        {/* RIGHT SIDE: [● ARIES v2.0 Online] [Home] [Learning] [Labs] [IDE] [About] [Get Started →] */}
        <div className="top-nav-right-group">
          <div className="top-status-badge">
            <span className="status-live-dot" />
            <span className="status-text">ARIES v2.0 Online</span>
          </div>

          <nav className="top-nav-links">
            <Link href="/" className="nav-link active">
              <span>Home</span>
              <span className="nav-active-glow" />
            </Link>
            <Link href="/learn" className="nav-link">
              <span>Learning</span>
            </Link>
            <Link href="/experiment" className="nav-link">
              <span>Labs</span>
            </Link>
            <Link href="/ide" className="nav-link">
              <span>IDE</span>
            </Link>
            <Link href="/docs" className="nav-link">
              <span>About</span>
            </Link>
          </nav>

          <Link href="/learn" className="btn-header-cta">
            <span>Get Started</span>
            <ArrowRight size={14} className="cta-arrow" />
          </Link>
        </div>
      </header>

      {/* ========================================================
          1. FULL-SCREEN CINEMATIC CENTERED HERO SECTION
      ======================================================== */}
      <section
        ref={heroSectionRef}
        className={`hero-cinematic-section anim-phase-${animState}`}
      >
        {/* Cinematic Ambient Backdrop Lighting & Technical Grid (Continuous) */}
        <div ref={bgGlowRef} className="hero-glow-layer" />
        <div ref={bgGridRef} className="hero-pcb-grid" />
        <div className="hero-top-flare-streak">
          <div className="flare-center-node" />
        </div>

        {/* Delicate Side Vertical Light Flares & Glowing Star Nodes */}
        <div className="hero-side-flares-container" aria-hidden="true">
          {/* Left Vertical Flares */}
          <div className="side-flare flare-left-1">
            <span className="flare-beam" />
            <span className="flare-star star-1" />
          </div>
          <div className="side-flare flare-left-2">
            <span className="flare-beam" />
            <span className="flare-star star-2" />
          </div>
          <div className="side-flare flare-left-3">
            <span className="flare-beam" />
            <span className="flare-star star-3" />
          </div>

          {/* Right Vertical Flares */}
          <div className="side-flare flare-right-1">
            <span className="flare-beam" />
            <span className="flare-star star-4" />
          </div>
          <div className="side-flare flare-right-2">
            <span className="flare-beam" />
            <span className="flare-star star-5" />
          </div>
          <div className="side-flare flare-right-3">
            <span className="flare-beam" />
            <span className="flare-star star-6" />
          </div>

          {/* Decorative Cyber Mesh Waves on Left & Right */}
          <div className="cyber-wave-left">
            <svg viewBox="0 0 450 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-50 20 C 120 40, 240 180, 450 280" stroke="url(#cyberWaveGradLeft)" strokeWidth="1" opacity="0.45" />
              <path d="M-50 60 C 140 80, 260 200, 450 290" stroke="url(#cyberWaveGradLeft)" strokeWidth="0.8" opacity="0.35" />
              <path d="M-50 100 C 160 120, 280 220, 450 300" stroke="url(#cyberWaveGradLeft)" strokeWidth="0.7" opacity="0.25" />
              <path d="M-50 140 C 180 160, 300 240, 450 310" stroke="url(#cyberWaveGradLeft)" strokeWidth="0.6" opacity="0.2" />
              <defs>
                <linearGradient id="cyberWaveGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f5c4" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.05" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="cyber-wave-right">
            <svg viewBox="0 0 450 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 500 20 C 330 40, 210 180, 0 280" stroke="url(#cyberWaveGradRight)" strokeWidth="1" opacity="0.45" />
              <path d="M 500 60 C 310 80, 190 200, 0 290" stroke="url(#cyberWaveGradRight)" strokeWidth="0.8" opacity="0.35" />
              <path d="M 500 100 C 290 120, 170 220, 0 300" stroke="url(#cyberWaveGradRight)" strokeWidth="0.7" opacity="0.25" />
              <path d="M 500 140 C 270 160, 150 240, 0 310" stroke="url(#cyberWaveGradRight)" strokeWidth="0.6" opacity="0.2" />
              <defs>
                <linearGradient id="cyberWaveGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Digital Planet Wireframe Globe Horizon with Dense Grid & Glowing Intersection Nodes */}
        <div className="hero-planet-globe-container" aria-hidden="true">
          <svg
            className="planet-globe-svg"
            viewBox="0 0 1600 320"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Horizon Rim Electric Neon Gradient */}
              <linearGradient id="globeHorizonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0052cc" stopOpacity="0.1" />
                <stop offset="20%" stopColor="#00aaff" stopOpacity="0.85" />
                <stop offset="42%" stopColor="#00f0ff" stopOpacity="1" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="58%" stopColor="#00f0ff" stopOpacity="1" />
                <stop offset="80%" stopColor="#00aaff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0052cc" stopOpacity="0.1" />
              </linearGradient>

              {/* Grid Lines Subtle Gradient */}
              <linearGradient id="globeGridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.75" />
                <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="70%" stopColor="#1d4ed8" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.04" />
              </linearGradient>

              {/* Planet Atmosphere Deep Royal Blue / Obsidian Radial Background */}
              <radialGradient id="globeAtmosphere" cx="50%" cy="0%" r="75%">
                <stop offset="0%" stopColor="#00aaff" stopOpacity="0.38" />
                <stop offset="18%" stopColor="#042766" stopOpacity="0.85" />
                <stop offset="55%" stopColor="#010e2b" stopOpacity="0.97" />
                <stop offset="100%" stopColor="#00030c" stopOpacity="1" />
              </radialGradient>

              {/* Intense Electric Cyan Center Corona Bloom Behind Scroll Indicator */}
              <radialGradient id="centerHorizonBloom" cx="50%" cy="0%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="20%" stopColor="#00f0ff" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>

              {/* Right Horizon Star Flare Bloom */}
              <radialGradient id="rightStarBloom" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="25%" stopColor="#00f0ff" stopOpacity="0.9" />
                <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>

              <filter id="glowHorizon" x="-10%" y="-40%" width="120%" height="180%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="nodeGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3.5" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="12" result="blur1" />
                <feGaussianBlur stdDeviation="4" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Strict Clipping Mask to keep all grid lines & dots strictly INSIDE the globe */}
              <clipPath id="globeInteriorClip">
                <path d="M -200 320 Q 800 24 1800 320 L 1800 600 L -200 600 Z" />
              </clipPath>
            </defs>

            {/* 1. Deep Atmospheric Gradient Under Horizon */}
            <path
              d="M -200 320 Q 800 24 1800 320 Z"
              fill="url(#globeAtmosphere)"
            />

            {/* 2. Center Radiant Horizon Corona Bloom */}
            <ellipse cx="800" cy="24" rx="260" ry="60" fill="url(#centerHorizonBloom)" filter="url(#strongGlow)" />

            {/* 3. Wireframe Grid & Intersection Nodes Strictly Clipped Under Horizon */}
            <g clipPath="url(#globeInteriorClip)">
              {/* Latitude Arcs */}
              {GLOBE_LAT_PATHS.map((d, idx) => (
                <path
                  key={`lat-${idx}`}
                  d={d}
                  stroke="url(#globeGridGrad)"
                  strokeWidth={idx === 0 ? 1.4 : Math.max(0.5, 1.3 - idx * 0.035)}
                />
              ))}

              {/* Longitude Grid Lines */}
              {GLOBE_LON_LINES.map((line) => (
                <line
                  key={`lon-${line.id}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={line.isCenter ? '#ffffff' : 'url(#globeGridGrad)'}
                  strokeWidth={line.isCenter ? 2.2 : 0.85}
                  opacity={line.isCenter ? 1 : 0.75}
                  filter={line.isCenter ? 'url(#nodeGlow)' : undefined}
                />
              ))}

              {/* Intersection Dots at Square Corners */}
              {GLOBE_INTERSECTION_NODES.map((node) => (
                <circle
                  key={node.key}
                  cx={node.x}
                  cy={node.y}
                  r={node.r}
                  fill={node.color}
                  filter={node.isPrimary || node.isCenter ? 'url(#nodeGlow)' : undefined}
                  opacity={node.isCenter ? 1 : node.isPrimary ? 0.95 : 0.7}
                />
              ))}
            </g>

            {/* 4. Main Luminous Horizon Curved Rim */}
            <path
              d="M -200 320 Q 800 24 1800 320"
              stroke="url(#globeHorizonGrad)"
              strokeWidth="4"
              filter="url(#glowHorizon)"
            />
            <path
              d="M -200 320 Q 800 24 1800 320"
              stroke="#ffffff"
              strokeWidth="1.4"
              opacity="0.95"
            />

            {/* 5. Right Horizon Radiant Star Flare (+ Starburst Spike) */}
            <g transform="translate(1260, 110)">
              <circle cx="0" cy="0" r="45" fill="url(#rightStarBloom)" filter="url(#strongGlow)" />
              <line x1="-36" y1="0" x2="36" y2="0" stroke="#ffffff" strokeWidth="1.8" opacity="0.95" />
              <line x1="0" y1="-36" x2="0" y2="36" stroke="#ffffff" strokeWidth="1.8" opacity="0.95" />
              <line x1="-18" y1="-18" x2="18" y2="18" stroke="#38bdf8" strokeWidth="1.2" opacity="0.8" />
              <line x1="-18" y1="18" x2="18" y2="-18" stroke="#38bdf8" strokeWidth="1.2" opacity="0.8" />
              <circle cx="0" cy="0" r="4" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* Left and Right Side Decorative Text Pillars */}
        <div className="hero-side-decor hero-side-decor-left">
          <span>RISC-V</span>
          <span>EMBEDDED</span>
          <span>SYSTEMS</span>
          <span>REAL IDEAS</span>
          <span>REAL IMPACT</span>
          <span className="side-decor-dash">—</span>
        </div>

        <div className="hero-side-decor hero-side-decor-right">
          <span>LEARN</span>
          <span>BUILD</span>
          <span>FLASH</span>
          <span>INNOVATE</span>
          <span className="side-decor-dash">—</span>
        </div>

        {/* ====================================================
            VEGA ARIES v2 BOARD (3D Orbital Ring: Back Arc -> Board -> Front Arc)
        ==================================================== */}
        <div className="hero-board-backdrop-upper-right">
          <div ref={boardWrapperRef} className="board-cinematic-stage">
            {/* 1. Luminous Radial Ambient Halos behind board */}
            <div className="board-halo-glow" />
            <div className="board-radial-flare" />

            {/* 2. BACK ORBITAL RING (Layered Behind Board - z-index: 1) */}
            <svg
              className="board-orbit-svg board-orbit-back"
              viewBox="0 0 540 540"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="boardOrbitBackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f5c4" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.85" />
                </linearGradient>
                <filter id="orbitBackGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Back Half-Ellipse Arc */}
              <g transform="rotate(-32 270 270)">
                <path
                  d="M 35 270 A 235 92 0 0 1 505 270"
                  stroke="url(#boardOrbitBackGrad)"
                  strokeWidth="3.2"
                  filter="url(#orbitBackGlow)"
                />
                <path
                  d="M 35 270 A 235 92 0 0 1 505 270"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  opacity="0.75"
                />
                {/* Secondary dashed orbit trace */}
                <path
                  d="M 15 270 A 255 105 0 0 1 525 270"
                  stroke="url(#boardOrbitBackGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="6 10"
                  opacity="0.5"
                />
                {/* Back Nodes */}
                <circle cx="270" cy="178" r="3.5" fill="#38bdf8" filter="url(#orbitBackGlow)" />
                <circle cx="430" cy="205" r="3.0" fill="#c084fc" filter="url(#orbitBackGlow)" />
              </g>
            </svg>

            {/* 3. HARDWARE BOARD IMAGE (Middle Layer - z-index: 2) */}
            <img
              src="/images/vega-aries-board.png"
              alt="VEGA ARIES v2.0 THEJAS32 RISC-V Hardware Board"
              className="board-cinematic-image"
              priority-hint="high"
            />

            {/* 4. FRONT ORBITAL RING (Layered in Front of Board - z-index: 3) */}
            <svg
              className="board-orbit-svg board-orbit-front"
              viewBox="0 0 540 540"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="boardOrbitFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f5c4" stopOpacity="1" />
                  <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.95" />
                  <stop offset="75%" stopColor="#818cf8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="1" />
                </linearGradient>
                <filter id="orbitFrontGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Front Half-Ellipse Arc Crossing in Front of the Board */}
              <g transform="rotate(-32 270 270)">
                <path
                  d="M 505 270 A 235 92 0 0 1 35 270"
                  stroke="url(#boardOrbitFrontGrad)"
                  strokeWidth="3.6"
                  filter="url(#orbitFrontGlow)"
                />
                <path
                  d="M 505 270 A 235 92 0 0 1 35 270"
                  stroke="#ffffff"
                  strokeWidth="1.4"
                  opacity="0.95"
                />
                {/* Secondary dashed front orbit */}
                <path
                  d="M 525 270 A 255 105 0 0 1 15 270"
                  stroke="url(#boardOrbitFrontGrad)"
                  strokeWidth="1.6"
                  strokeDasharray="6 10"
                  opacity="0.65"
                />

                {/* Intense Glowing Front Flare Starburst Nodes */}
                <g transform="translate(100, 320)">
                  <circle cx="0" cy="0" r="6" fill="#ffffff" filter="url(#orbitFrontGlow)" />
                  <circle cx="0" cy="0" r="11" fill="#00f5c4" opacity="0.6" filter="url(#orbitFrontGlow)" />
                  <circle cx="0" cy="0" r="22" fill="#00f5c4" opacity="0.25" filter="url(#orbitFrontGlow)" />
                </g>

                <g transform="translate(440, 310)">
                  <circle cx="0" cy="0" r="5" fill="#ffffff" filter="url(#orbitFrontGlow)" />
                  <circle cx="0" cy="0" r="9" fill="#c084fc" opacity="0.6" filter="url(#orbitFrontGlow)" />
                  <circle cx="0" cy="0" r="18" fill="#c084fc" opacity="0.25" filter="url(#orbitFrontGlow)" />
                </g>

                <circle cx="270" cy="362" r="4.5" fill="#38bdf8" filter="url(#orbitFrontGlow)" />
              </g>
            </svg>
          </div>
        </div>

        {/* Foreground Content Fader (Smoothly recedes on scroll without black void) */}
        <div
          className="hero-foreground-fader"
          style={{
            opacity: isHeroVisible ? heroOpacity : 0,
            pointerEvents: isHeroVisible ? 'auto' : 'none',
            visibility: isHeroVisible ? 'visible' : 'hidden',
            transform: `scale(${heroScale}) translateY(${scrollY * 0.12}px)`,
          }}
        >


          {/* ====================================================
              MAIN CENTERED FOREGROUND HERO CONTENT
          ==================================================== */}
          <div ref={textColRef} className="hero-centered-content">
            {/* Top Sub-tagline: EMBED · EXPLORE · EXPERIMENT · INNOVATE */}
            <div className="hero-top-tagline">
              <span>EMBED</span>
              <span className="tagline-dot">·</span>
              <span>EXPLORE</span>
              <span className="tagline-dot">·</span>
              <span>EXPERIMENT</span>
              <span className="tagline-dot">·</span>
              <span>INNOVATE</span>
            </div>

            {/* Main Dominant Headline (Stacked & Centered in General Sans 900) */}
            <h1 className="hero-headline-centered">
              <span className="headline-line headline-line-1">
                <span className="headline-text text-white">LEARN VEGA.</span>
              </span>
              <span className="headline-line headline-line-2">
                <span className="headline-text text-teal-cyan">DEVELOP WITH RISC-V.</span>
              </span>
              <span className="headline-line headline-line-3">
                <span className="headline-text text-blue-purple">BUILD THE FUTURE.</span>
              </span>
            </h1>

            {/* Centered Supporting Description (Max width 850–950px in General Sans 400) */}
            <p className="hero-description-centered">
              A comprehensive training and experimentation platform for VEGA ARIES v2.0 and THEJAS32 RISC-V, designed to provide hands-on learning in embedded systems, processor programming, firmware development, hardware interfacing, and real-world application development.
            </p>

            {/* THREE CENTERED HERO ACTION BUTTONS (Single Row on Desktop) */}
            <div className="hero-cta-buttons-centered">
              {/* 1. START TRAINING (Vibrant Cyan/Teal Filled Neon Pill) */}
              <Link href="/learn" className="btn-hero-learning">
                <div className="btn-blur-halo" />
                <span className="btn-icon">🚀</span>
                <span className="btn-text">START TRAINING</span>
                <ArrowRight size={18} className="btn-arrow" />
              </Link>

              {/* 2. OPEN VEGA IDE (Deep Violet/Indigo Glass Card with Radiant Blur) */}
              <Link href="/ide" className="btn-hero-ide">
                <div className="btn-blur-halo ide-halo" />
                <span className="btn-icon">💻</span>
                <span className="btn-text">OPEN VEGA IDE</span>
              </Link>

              {/* 3. EXPLORE LABS (Translucent Cyan Glass Card with Neon Border) */}
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
            <span className="scroll-chevron">∨</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. DASHBOARD BODY CONTENT (Below 100vh Hero - Continuous Futuristic Environment)
      ======================================================== */}
      <div id="dashboard-body-content" className="dashboard-body-container">
        <FuturisticEcosystemBackground className="ecosystem-futuristic-container">
          {/* 2A. STATISTICS ROW */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card" style={{ '--card-accent': '#06d6a0' } as React.CSSProperties}>
                <div className="stat-icon-wrap" style={{ color: '#06d6a0' }}>
                  <BookOpen size={24} />
                </div>
                <div className="stat-number-wrap">
                  <span className="stat-number">20+</span>
                  <span className="stat-label">Learning Modules</span>
                </div>
                <span className="stat-subtext">Beginner to Advanced</span>
              </div>

              <div className="stat-card" style={{ '--card-accent': '#4cc9f0' } as React.CSSProperties}>
                <div className="stat-icon-wrap" style={{ color: '#4cc9f0' }}>
                  <FlaskConical size={24} />
                </div>
                <div className="stat-number-wrap">
                  <span className="stat-number">3</span>
                  <span className="stat-label">Protocol Labs</span>
                </div>
                <span className="stat-subtext">UART • I2C • SPI (Exact 3 Labs)</span>
              </div>

              <div className="stat-card" style={{ '--card-accent': '#7b2ff7' } as React.CSSProperties}>
                <div className="stat-icon-wrap" style={{ color: '#7b2ff7' }}>
                  <Activity size={24} />
                </div>
                <div className="stat-number-wrap">
                  <span className="stat-number">15+</span>
                  <span className="stat-label">Hardware Experiments</span>
                </div>
                <span className="stat-subtext">Interactive Simulation</span>
              </div>

              <div className="stat-card" style={{ '--card-accent': '#f72585' } as React.CSSProperties}>
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
                  <Link
                    href={feat.href}
                    key={idx}
                    className="feature-glass-card"
                    style={{ '--card-accent': feat.color } as React.CSSProperties}
                  >
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
        </FuturisticEcosystemBackground>
      </div>
    </div>
  );
}
