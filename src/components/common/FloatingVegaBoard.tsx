'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function FloatingVegaBoard() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [targetRot, setTargetRot] = useState({ rx: 4, ry: -6, tx: 0, ty: 0 });
  const currentRot = useRef({ rx: 4, ry: -6, tx: 0, ty: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize mouse between -1 and 1
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;

      setTargetRot({
        rx: -ny * 16,        // tilt X
        ry: nx * 18,         // tilt Y
        tx: nx * 25,         // shift X
        ty: ny * 20,         // shift Y
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    const animate = () => {
      // Smooth lerp damping
      currentRot.current.rx += (targetRot.rx - currentRot.current.rx) * 0.05;
      currentRot.current.ry += (targetRot.ry - currentRot.current.ry) * 0.05;
      currentRot.current.tx += (targetRot.tx - currentRot.current.tx) * 0.05;
      currentRot.current.ty += (targetRot.ty - currentRot.current.ty) * 0.05;

      if (containerRef.current) {
        const { rx, ry, tx, ty } = currentRot.current;
        containerRef.current.style.transform = `
          translate3d(${tx}px, ${ty}px, 0px)
          rotateX(${rx}deg)
          rotateY(${ry}deg)
        `;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetRot]);

  // CRITICAL REQUIREMENT: Only render on the Overview tab (pathname === '/'), nowhere else!
  if (!isClient || pathname !== '/') {
    return null;
  }

  return (
    <div className="floating-board-wrapper" aria-hidden="true">
      <div className="board-scene">
        <div ref={containerRef} className="board-3d-model">
          {/* Ambient Glow Halo behind the board */}
          <div className="board-glow" />

          {/* Real VEGA ARIES v2 Board Image (Clean transparent cutout, no white background) */}
          <div className="board-image-container">
            <img
              src="/images/vega-aries-board.png"
              alt="VEGA ARIES v2.0 Board"
              className="board-img"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .floating-board-wrapper {
          position: fixed;
          top: 0;
          left: 280px; /* Aligned with the 280px sidebar */
          width: calc(100vw - 280px);
          height: 100vh;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          perspective: 1200px;
          display: flex;
          align-items: center;
          justify-content: center; /* Exactly centered */
        }

        .board-scene {
          position: relative;
          width: 540px;
          height: 540px;
          transform-style: preserve-3d;
          animation: gentleFloat 7s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .board-3d-model {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.08s ease-out;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .board-glow {
          position: absolute;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(6, 214, 160, 0.16) 0%,
            rgba(76, 201, 240, 0.08) 45%,
            transparent 70%
          );
          filter: blur(40px);
          z-index: -1;
          pointer-events: none;
        }

        .board-image-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .board-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: 0.85;
          filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.75))
                 drop-shadow(0 0 45px rgba(6, 214, 160, 0.22));
          transition: opacity 0.3s ease;
          user-select: none;
          pointer-events: none;
        }

        [data-theme="light"] .board-img {
          opacity: 0.45;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.2))
                 drop-shadow(0 0 30px rgba(6, 214, 160, 0.15));
        }

        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px) rotateZ(0deg);
          }
          50% {
            transform: translateY(-14px) rotateZ(1.2deg);
          }
        }

        @media (max-width: 1200px) {
          .floating-board-wrapper {
            left: 0;
            width: 100vw;
          }
          .board-scene {
            width: 420px;
            height: 420px;
            opacity: 0.6;
          }
        }

        @media (max-width: 900px) {
          .floating-board-wrapper {
            left: 0;
            width: 100vw;
          }
          .board-scene {
            width: 340px;
            height: 340px;
            opacity: 0.4;
          }
        }

        @media (max-width: 640px) {
          .board-scene {
            width: 280px;
            height: 280px;
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
