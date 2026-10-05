import React, { useState } from 'react';
import { SparklesIcon } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { AIChatDrawer } from '../ai/AIChatDrawer';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout() {
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1280);
  const [chatOpen, setChatOpen] = useState(false);

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
      <div className="fixed bottom-5 right-5 z-50">
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          aria-label="Open CrimeVista AI assistant"
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-analytics text-white shadow-pop transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics focus-visible:ring-offset-2"
        >
          <SparklesIcon className="h-6 w-6" aria-hidden />
        </button>
      </div>
      <AIChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
