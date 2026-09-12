'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
  Home,
  BookOpen,
  Sparkles,
  FlaskConical,
  Code2,
  Trophy,
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
      { href: '/examples', label: 'Examples', icon: Sparkles },
      { href: '/experiment', label: 'Protocol Lab', icon: FlaskConical, badge: 'Interactive' },
      { href: '/ide', label: 'VEGA Studio IDE', icon: Code2 },
      { href: '/challenges', label: 'Challenges & Quizzes', icon: Trophy },
    ],
  },
  {
    title: 'HARDWARE & LABS',
    items: [
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

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const collapsed = onToggleCollapse ? isCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Sidebar is hidden completely on the landing page ('/')
  if (pathname === '/') {
    return null;
  }

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
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-show' : ''}`}>
        {/* 11. BRAND HEADER */}
        <div className="sidebar-header">
          <Link href="/" className="sidebar-brand" title="VEGA LAB - THEJAS32 RISC-V">
            <div className="brand-icon-box">
              <span className="brand-logo-icon">◆</span>
            </div>
            <div className="brand-text-col">
              <span className="brand-logo-title">VEGA LAB</span>
              <span className="brand-logo-sub">THEJAS32 RISC-V</span>
            </div>
          </Link>

          <button
            type="button"
            className="collapse-toggle-btn"
            onClick={toggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* 12. HARDWARE STATUS CARD */}
        <div className="sidebar-status-wrapper">
          <div className="sidebar-status-card" title="ARIES v2 • Ready & Online (100MHz)">
            <div className="status-header-row">
              <span className="status-pulse-dot" />
              <span className="status-board-name">ARIES v2 • THEJAS32</span>
            </div>
            <div className="status-detail-row">
              <span className="status-state-label">Ready &amp; Online</span>
              <span className="status-frequency-badge">100MHz</span>
            </div>
          </div>
          <div className="sidebar-status-dot-only" title="ARIES v2 • Ready & Online (100MHz)">
            <span className="status-pulse-dot" />
          </div>
        </div>

        {/* SCROLLABLE NAVIGATION SECTION */}
        <nav className="sidebar-nav">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="sidebar-section">
              <div className="sidebar-section-title">
                <span>{group.title}</span>
                <span className="section-divider-line" />
              </div>

              <div className="sidebar-section-items">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                      aria-label={item.label}
                    >
                      {/* Active Left Indicator */}
                      {isActive && <span className="sidebar-active-indicator" />}

                      {/* Fixed 24px Icon Container */}
                      <span className="sidebar-nav-icon">
                        <Icon size={19} strokeWidth={isActive ? 2.2 : 1.9} />
                      </span>

                      {/* Navigation Label */}
                      <span className="sidebar-nav-label">{item.label}</span>

                      {/* Right-Aligned Badge */}
                      {item.badge && (
                        <span className="sidebar-nav-badge">{item.badge}</span>
                      )}

                      {/* Floating tooltip only shown in collapsed mode */}
                      <span className="sidebar-collapsed-tooltip" aria-hidden="true">
                        {item.label}
                      </span>
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
            type="button"
            className="sidebar-footer-theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="footer-icon-box">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </span>
            <span className="footer-theme-text">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
            <span className="sidebar-collapsed-tooltip" aria-hidden="true">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Developer Profile / Sign In */}
          <Link
            href="/login"
            className="sidebar-user-card"
            aria-label="Developer Portal / Sign In"
          >
            <div className="user-avatar-box">
              <User size={15} />
            </div>
            <div className="user-text-col">
              <span className="user-name">Developer Portal</span>
              <span className="user-status">Sign In / Profile</span>
            </div>
            <LogIn size={15} className="user-action-icon" />
            <span className="sidebar-collapsed-tooltip" aria-hidden="true">
              Developer Portal
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
