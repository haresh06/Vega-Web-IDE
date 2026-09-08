'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FuturisticEcosystemBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  origX: number;
  origY: number;
  origZ: number;
  size: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  pulseSpeed: number;
  pulsePhase: number;
  depth: number;
}

interface CircuitTrace {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  progress: number;
  speed: number;
  color: string;
}

export default function FuturisticEcosystemBackground({
  children,
  className = '',
}: FuturisticEcosystemBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Mouse parallax target and smoothed current coordinates
  const mouseTarget = useRef({ x: 0, y: 0, normX: 0, normY: 0, inside: false });
  const mouseCurrent = useRef({ x: 0, y: 0, normX: 0, normY: 0 });
  const scrollYRef = useRef(0);
  const isVisibleRef = useRef(true);
  const rafId = useRef<number | null>(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check reduced motion preference
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Canvas dimensions
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = Math.max(rect.height, 1200);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track scroll for vertical parallax
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ========================================================================
    // 1. GENERATE 3D DIGITAL PARTICLE PLANET / ORBIT RINGS
    // ========================================================================
    const globeParticles: Particle3D[] = [];
    const sphereRadius = Math.min(width * 0.32, 420);
    const globeColorPalette = ['#38bdf8', '#0ea5e9', '#0284c7', '#7dd3fc', '#94a3b8', '#60a5fa'];

    // Latitude rings
    const latCount = 16;
    const lonCount = 28;
    for (let i = 0; i <= latCount; i++) {
      const theta = (i * Math.PI) / latCount;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let j = 0; j < lonCount; j++) {
        if (i === 0 || i === latCount) {
          if (j !== 0) continue;
        }
        const phi = (j * 2 * Math.PI) / lonCount;
        const x = sphereRadius * sinTheta * Math.cos(phi);
        const y = sphereRadius * cosTheta;
        const z = sphereRadius * sinTheta * Math.sin(phi);

        globeParticles.push({
          x,
          y,
          z,
          origX: x,
          origY: y,
          origZ: z,
          size: Math.random() * 1.6 + 1.0,
          color: globeColorPalette[Math.floor(Math.random() * globeColorPalette.length)],
          alpha: Math.random() * 0.35 + 0.25,
          pulseSpeed: Math.random() * 0.025 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Outer orbital rings particles
    const orbitRingRadii = [sphereRadius * 1.35, sphereRadius * 1.75, sphereRadius * 2.2];
    orbitRingRadii.forEach((rad, ringIdx) => {
      const count = 44 + ringIdx * 16;
      for (let k = 0; k < count; k++) {
        const angle = (k * 2 * Math.PI) / count;
        const tiltX = 0.38 + ringIdx * 0.12;
        const x = rad * Math.cos(angle);
        const y = rad * Math.sin(angle) * Math.sin(tiltX);
        const z = rad * Math.sin(angle) * Math.cos(tiltX);

        globeParticles.push({
          x,
          y,
          z,
          origX: x,
          origY: y,
          origZ: z,
          size: Math.random() * 1.8 + 1.0,
          color: ringIdx === 0 ? '#38bdf8' : ringIdx === 1 ? '#0ea5e9' : '#0284c7',
          alpha: Math.random() * 0.35 + 0.2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    });

    // ========================================================================
    // 2. CONTINUOUS AMBIENT FLOATING TECH PARTICLES (Full Height)
    // ========================================================================
    const ambientParticles: AmbientParticle[] = [];
    const particleCount = 70;
    for (let p = 0; p < particleCount; p++) {
      ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.35 - 0.12,
        size: Math.random() * 2.0 + 0.8,
        baseAlpha: Math.random() * 0.28 + 0.12,
        alpha: Math.random() * 0.28 + 0.12,
        color: globeColorPalette[p % globeColorPalette.length],
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.6 + 0.4,
      });
    }

    // ========================================================================
    // 3. CIRCUIT TRACES & PULSING BUS NODES (RISC-V Hardware Feel)
    // ========================================================================
    const circuitTraces: CircuitTrace[] = [];
    const traceCount = 16;
    for (let t = 0; t < traceCount; t++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const len1 = (Math.random() * 160 + 80) * (Math.random() > 0.5 ? 1 : -1);
      const len2 = (Math.random() * 130 + 50) * (Math.random() > 0.5 ? 1 : -1);
      circuitTraces.push({
        x1: startX,
        y1: startY,
        x2: startX + len1,
        y2: startY,
        x3: startX + len1,
        y3: startY + len2,
        progress: Math.random(),
        speed: Math.random() * 0.003 + 0.0015,
        color: t % 3 === 0 ? '#38bdf8' : t % 3 === 1 ? '#0ea5e9' : '#0284c7',
      });
    }

    // ========================================================================
    // 4. MOUSE EVENT LISTENERS (Section-bound Coordinates)
    // ========================================================================
    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1; // -1 to 1
      const normY = (y / rect.height) * 2 - 1; // -1 to 1

      mouseTarget.current = { x, y, normX, normY, inside: true };

      // Update Card Cursor Spotlights on all cards inside container
      const cards = container.querySelectorAll<HTMLElement>(
        '.feature-glass-card, .stat-card, .journey-stage-card, .why-vega-card, .ota-showcase-panel, .telemetry-card'
      );
      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const cardX = e.clientX - cardRect.left;
        const cardY = e.clientY - cardRect.top;
        card.style.setProperty('--card-mouse-x', `${cardX}px`);
        card.style.setProperty('--card-mouse-y', `${cardY}px`);
      });
    };

    const handleMouseLeave = () => {
      mouseTarget.current.inside = false;
      mouseTarget.current.normX = 0;
      mouseTarget.current.normY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Set visible immediately for seamless transition
    container.classList.add('ecosystem-is-visible');

    // ========================================================================
    // 5. 60 FPS MAIN RENDER LOOP (requestAnimationFrame)
    // ========================================================================
    let rotationAngleY = 0;
    let rotationAngleX = 0.22;
    let waveOffset = 0;
    let time = 0;

    const render = () => {
      time += 0.016;

      // Smooth Lerp for mouse parallax coordinates
      const lerpFactor = 0.045;
      mouseCurrent.current.normX += (mouseTarget.current.normX - mouseCurrent.current.normX) * lerpFactor;
      mouseCurrent.current.normY += (mouseTarget.current.normY - mouseCurrent.current.normY) * lerpFactor;
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * lerpFactor;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * lerpFactor;

      const { normX, normY, x: mX, y: mY } = mouseCurrent.current;

      // Update Mouse Spotlight overlay position
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${mX}px, ${mY}px, 0)`;
        spotlightRef.current.style.opacity = mouseTarget.current.inside ? '1' : '0.35';
      }

      ctx.clearRect(0, 0, width, height);

      // Parallax center shift
      const parallaxShiftX = -normX * 28;
      const parallaxShiftY = -normY * 18;

      // Globe center position (behind the top stats & feature cards)
      const globeCenterX = width * 0.5 + parallaxShiftX;
      const globeCenterY = Math.min(height * 0.15, 380) + parallaxShiftY;

      // Continuous subtle rotation
      if (!isReducedMotion) {
        rotationAngleY += 0.002;
        waveOffset += 0.005;
      }

      // Dynamic tilt based on mouse position
      const currentRotX = rotationAngleX + normY * 0.15;
      const currentRotY = rotationAngleY + normX * 0.22;

      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);

      // ----------------------------------------------------------------------
      // A. DRAW FLOWING CONTINUOUS ENERGY WAVES (Curved Bezier Streams)
      // ----------------------------------------------------------------------
      ctx.save();
      const waveCount = 4;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const yBase = height * (0.1 + w * 0.24) + parallaxShiftY * (0.3 + w * 0.12);
        ctx.moveTo(0, yBase);

        const segments = 16;
        const segWidth = width / segments;

        for (let s = 0; s <= segments; s++) {
          const currentX = s * segWidth;
          const waveAmp = 28 + w * 10;
          const currentY =
            yBase +
            Math.sin(s * 0.38 + waveOffset * 1.2 + w * 1.2) * waveAmp +
            Math.cos(s * 0.25 - waveOffset + w) * (waveAmp * 0.4);

          if (s === 0) {
            ctx.moveTo(currentX, currentY);
          } else {
            const prevX = (s - 1) * segWidth;
            const prevY =
              yBase +
              Math.sin((s - 1) * 0.38 + waveOffset * 1.2 + w * 1.2) * waveAmp +
              Math.cos((s - 1) * 0.25 - waveOffset + w) * (waveAmp * 0.4);
            const cpX = (prevX + currentX) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + currentY) / 2);
          }
        }

        const waveGradient = ctx.createLinearGradient(0, yBase - 80, width, yBase + 80);
        if (w % 2 === 0) {
          waveGradient.addColorStop(0, 'rgba(56, 189, 248, 0.0)');
          waveGradient.addColorStop(0.35, 'rgba(56, 189, 248, 0.12)');
          waveGradient.addColorStop(0.7, 'rgba(2, 132, 199, 0.14)');
          waveGradient.addColorStop(1, 'rgba(14, 165, 233, 0.0)');
        } else {
          waveGradient.addColorStop(0, 'rgba(2, 132, 199, 0.0)');
          waveGradient.addColorStop(0.4, 'rgba(14, 165, 233, 0.10)');
          waveGradient.addColorStop(0.8, 'rgba(56, 189, 248, 0.12)');
          waveGradient.addColorStop(1, 'rgba(2, 132, 199, 0.0)');
        }

        ctx.strokeStyle = waveGradient;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.restore();

      // ----------------------------------------------------------------------
      // B. DRAW CIRCUIT TRACES & PULSING NODES
      // ----------------------------------------------------------------------
      ctx.save();
      circuitTraces.forEach((trace) => {
        ctx.beginPath();
        ctx.moveTo(trace.x1 + parallaxShiftX * 0.25, trace.y1 + parallaxShiftY * 0.25);
        ctx.lineTo(trace.x2 + parallaxShiftX * 0.25, trace.y2 + parallaxShiftY * 0.25);
        ctx.lineTo(trace.x3 + parallaxShiftX * 0.25, trace.y3 + parallaxShiftY * 0.25);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(trace.x3 + parallaxShiftX * 0.25, trace.y3 + parallaxShiftY * 0.25, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fill();

        if (!isReducedMotion) {
          trace.progress += trace.speed;
          if (trace.progress > 1) trace.progress = 0;
        }

        let px = trace.x1;
        let py = trace.y1;
        if (trace.progress < 0.6) {
          const segProgress = trace.progress / 0.6;
          px = trace.x1 + (trace.x2 - trace.x1) * segProgress;
          py = trace.y1;
        } else {
          const segProgress = (trace.progress - 0.6) / 0.4;
          px = trace.x2;
          py = trace.y2 + (trace.y3 - trace.y2) * segProgress;
        }

        px += parallaxShiftX * 0.25;
        py += parallaxShiftY * 0.25;

        ctx.beginPath();
        ctx.arc(px, py, 2.0, 0, Math.PI * 2);
        ctx.fillStyle = trace.color;
        ctx.shadowColor = trace.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.restore();

      // ----------------------------------------------------------------------
      // C. DRAW 3D DIGITAL PARTICLE GLOBE & ORBIT NODES
      // ----------------------------------------------------------------------
      ctx.save();
      // Soft radial glow behind digital globe
      const coreGradient = ctx.createRadialGradient(
        globeCenterX,
        globeCenterY,
        10,
        globeCenterX,
        globeCenterY,
        sphereRadius * 1.6
      );
      coreGradient.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      coreGradient.addColorStop(0.35, 'rgba(2, 132, 199, 0.08)');
      coreGradient.addColorStop(0.7, 'rgba(14, 165, 233, 0.03)');
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(globeCenterX, globeCenterY, sphereRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Project 3D particles onto 2D canvas
      globeParticles.forEach((p) => {
        const x1 = p.origX * cosY - p.origZ * sinY;
        const z1 = p.origZ * cosY + p.origX * sinY;

        const y2 = p.origY * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.origY * sinX;

        const fov = 950;
        const scale = fov / (fov + z2);

        const projX = globeCenterX + x1 * scale;
        const projY = globeCenterY + y2 * scale;

        const depthAlpha = ((z2 + sphereRadius) / (sphereRadius * 2)) * 0.65 + 0.15;
        const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulsePhase) * 0.15 + 0.85;
        const finalAlpha = Math.max(0.08, Math.min(0.88, p.alpha * depthAlpha * pulse));

        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(0.8, p.size * scale), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = finalAlpha;

        if (z2 < 0) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });
      ctx.restore();

      // ----------------------------------------------------------------------
      // D. DRAW AMBIENT FLOATING TECH PARTICLES
      // ----------------------------------------------------------------------
      ctx.save();
      ambientParticles.forEach((p) => {
        if (!isReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.y < -20) p.y = height + 20;
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
        }

        const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulsePhase) * 0.2 + 0.8;
        const finalAlpha = p.baseAlpha * pulse;

        const pX = p.x + parallaxShiftX * p.depth;
        const pY = p.y + parallaxShiftY * p.depth;

        ctx.beginPath();
        ctx.arc(pX, pY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = finalAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });
      ctx.restore();

      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isClient]);

  return (
    <div ref={containerRef} className={`futuristic-ecosystem-wrapper ${className}`}>
      {/* Dynamic Hardware Canvas Layer */}
      <canvas ref={canvasRef} className="ecosystem-dynamic-canvas" />

      {/* RISC-V Ambient Grid Mesh */}
      <div className="ecosystem-mesh-overlay" />

      {/* Luminous Interactive Mouse Spotlight */}
      <div ref={spotlightRef} className="ecosystem-mouse-spotlight" />

      {/* Foreground Content */}
      <div className="ecosystem-content-relative">{children}</div>
    </div>
  );
}
