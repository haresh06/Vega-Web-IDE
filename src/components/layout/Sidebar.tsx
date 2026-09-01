'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
  Home,
  BookOpen,
  FlaskConical,
  Code2,
  Trophy,
  Radio,
  Cpu,
  Wrench,
  LayoutDashboard,
  Award,
  BookMarked,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  User,
  LogIn,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'CORE PLATFORM',
    items: [
      { href: '/', label: 'Overview', icon: Home },
      { href: '/learn', label: 'Learn Center', icon: BookOpen, badge: '12 Paths' },
      { href: '/experiment', label: 'Protocol Lab', icon: FlaskConical, badge: 'Interactive' },
      { href: '/ide', label: 'VEGA Studio IDE', icon: Code2 },
      { href: '/challenges', label: 'Challenges & Quizzes', icon: Trophy },
    ],
  },
  {
    title: 'HARDWARE & LABS',
    items: [
      { href: '/ota', label: 'OTA Firmware Flash', icon: Radio },
      { href: '/boards', label: 'VEGA ARIES v2', icon: Cpu },
      { href: '/troubleshoot', label: 'Troubleshoot Guide', icon: Wrench },
    ],
  },
  {
    title: 'PROGRESS & DOCS',
    items: [
      { href: '/dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
      { href: '/progress', label: 'Progress & Badges', icon: Award },
      { href: '/docs', label: 'Documentation', icon: BookMarked },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/" className="sidebar-brand-mobile">
          <span className="brand-logo-icon">◆</span>
          <span className="brand-logo-text">VEGA LAB</span>
          <span className="brand-badge">ARIES v2</span>
        </Link>

        <button
          className="mobile-theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Left Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-show' : ''}`}>
        {/* 11. BRAND HEADER */}
        <div className="sidebar-header">
          <Link href="/" className="sidebar-brand">
            <div className="brand-icon-box">
              <span className="brand-logo-icon">◆</span>
            </div>
            {!isCollapsed && (
              <div className="brand-text-col">
                <span className="brand-logo-title">VEGA LAB</span>
                <span className="brand-logo-sub">THEJAS32 RISC-V</span>
              </div>
            )}
          </Link>

          <button
            className="collapse-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* 12. HARDWARE STATUS CARD */}
        {!isCollapsed ? (
          <div className="sidebar-status-wrapper">
            <div className="sidebar-status-card">
              <div className="status-header-row">
                <span className="status-pulse-dot" />
                <span className="status-board-name">ARIES v2 • THEJAS32</span>
              </div>
              <div className="status-detail-row">
                <span className="status-state-label">Ready &amp; Online</span>
                <span className="status-frequency-badge">100MHz</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="sidebar-status-collapsed-wrapper">
            <div className="sidebar-status-dot-only" title="ARIES v2 • Ready & Online (100MHz)">
              <span className="status-pulse-dot" />
            </div>
          </div>
        )}

        {/* SCROLLABLE NAVIGATION SECTION */}
        <nav className="sidebar-nav">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="sidebar-section">
              {!isCollapsed && (
                <div className="sidebar-section-title">
                  <span>{group.title}</span>
                  <span className="section-divider-line" />
                </div>
              )}

              <div className="sidebar-section-items">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {/* Active Left Indicator */}
                      {isActive && <span className="sidebar-active-indicator" />}

                      {/* Fixed 24px Icon Container */}
                      <span className="sidebar-nav-icon">
                        <Icon size={19} strokeWidth={isActive ? 2.2 : 1.9} />
                      </span>

                      {/* Navigation Label */}
                      {!isCollapsed && (
                        <span className="sidebar-nav-label">{item.label}</span>
                      )}

                      {/* Right-Aligned Badge */}
                      {!isCollapsed && item.badge && (
                        <span className="sidebar-nav-badge">{item.badge}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* 13. SIDEBAR FOOTER */}
        <div className="sidebar-footer">
          {/* Theme Switcher */}
          <button
            className="sidebar-footer-theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            <span className="footer-icon-box">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </span>
            {!isCollapsed && (
              <span className="footer-theme-text">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          {/* Developer Profile / Sign In */}
          {!isCollapsed ? (
            <Link href="/login" className="sidebar-user-card">
              <div className="user-avatar-circle">
                <User size={15} />
              </div>
              <div className="user-info-col">
                <span className="user-name">Developer Portal</span>
                <span className="user-sub">Sign In / Profile</span>
              </div>
              <LogIn size={15} className="user-arrow-icon" />
            </Link>
          ) : (
            <Link href="/login" className="sidebar-user-icon-btn" title="Developer Portal / Sign In">
              <User size={18} />
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
