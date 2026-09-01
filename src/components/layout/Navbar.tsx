'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

const navItems = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/learn', label: 'Learn', icon: '📚' },
  { href: '/experiment', label: 'Experiment', icon: '🔬' },
  { href: '/ide', label: 'IDE', icon: '💻' },
  { href: '/challenges', label: 'Challenges', icon: '🏆' },
  { href: '/progress', label: 'Progress', icon: '📊' },
  { href: '/dashboard', label: 'Dashboard', icon: '📋' },
  { href: '/boards', label: 'VEGA Boards', icon: '🔧' },
  { href: '/docs', label: 'Docs', icon: '📖' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">VEGA</span>
          <span className="logo-sub">Learn & Lab</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`navbar-link ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="navbar-controls">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link href="/login" className="btn-nav-login">
            Sign In
          </Link>
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(10, 14, 23, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--color-border);
        }
        [data-theme="light"] .navbar {
          background: rgba(248, 250, 252, 0.9);
        }
        .navbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .logo-icon {
          font-size: 1.5rem;
          color: var(--color-accent-cyan);
        }
        .logo-text {
          font-size: 1.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo-sub {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .navbar-link {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.65rem;
          border-radius: 6px;
          text-decoration: none;
          color: var(--color-text-secondary);
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .navbar-link:hover {
          color: var(--color-text-primary);
          background: rgba(255, 255, 255, 0.05);
        }
        [data-theme="light"] .navbar-link:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        .navbar-link.active {
          color: var(--color-accent-cyan);
          background: rgba(6, 214, 160, 0.1);
        }
        .nav-icon {
          font-size: 0.85rem;
        }
        .navbar-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .theme-toggle {
          background: none;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 0.35rem 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .theme-toggle:hover {
          border-color: var(--color-accent-cyan);
        }
        .btn-nav-login {
          padding: 0.4rem 1rem;
          background: linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-blue));
          color: #000;
          font-weight: 600;
          font-size: 0.8rem;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-nav-login:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(6, 214, 160, 0.3);
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--color-text-primary);
          font-size: 1.3rem;
          cursor: pointer;
        }
        .mobile-nav {
          display: none;
          padding: 0.5rem 1rem 1rem;
          border-top: 1px solid var(--color-border);
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.75rem;
          border-radius: 6px;
          text-decoration: none;
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          color: var(--color-accent-cyan);
          background: rgba(6, 214, 160, 0.1);
        }
        @media (max-width: 1100px) {
          .navbar-links { display: none; }
          .mobile-toggle { display: block; }
          .mobile-nav { display: block; }
        }
        @media (max-width: 600px) {
          .logo-sub { display: none; }
          .btn-nav-login { display: none; }
        }
      `}</style>
    </nav>
  );
}
