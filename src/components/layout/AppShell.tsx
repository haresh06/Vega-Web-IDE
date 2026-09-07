'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <>
      {/* Sidebar hidden completely on the landing / home page ('/'), visible everywhere else */}
      {!isHomePage && <Sidebar />}

      {/* Main layout container (full-width on home page, offset for sidebar on inner pages) */}
      <div className={isHomePage ? 'app-landing-layout' : 'app-main-layout'}>
        {children}
      </div>
    </>
  );
}
