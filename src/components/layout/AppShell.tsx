'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restore saved sidebar collapse state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vega_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vega_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  return (
    <>
      {/* Sidebar hidden completely on the landing / home page ('/'), visible everywhere else */}
      {!isHomePage && (
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
      )}

      {/* Main layout container (full-width on home page, dynamically offsets with sidebar collapse on inner pages) */}
      <div
        className={
          isHomePage
            ? 'app-landing-layout'
            : `app-main-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`
        }
      >
        {children}
      </div>
    </>
  );
}
