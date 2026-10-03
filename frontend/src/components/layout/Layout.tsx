import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout() {
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1280);

  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-pop">
        Skip to content
      </a>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main" className="flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:px-8">
          <div className="mx-auto w-full max-w-[1480px]">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>);

}