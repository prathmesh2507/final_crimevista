import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { EllipsisIcon, XIcon } from 'lucide-react';
import { MOBILE_MORE_NAV, MOBILE_PRIMARY_NAV } from '../../data/navigation';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/constants';

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const moreActive = MOBILE_MORE_NAV.some((item) => location.pathname.startsWith(item.to));

  useEffect(() => setMoreOpen(false), [location.pathname]);

  return (
    <>
      <AnimatePresence>
        {moreOpen &&
        <>
            <motion.div
            className="fixed inset-0 z-40 bg-ink-900/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMoreOpen(false)}
            aria-hidden />
          
            <motion.div
            role="dialog"
            aria-label="More navigation"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-surface px-4 pb-24 pt-4 shadow-pop md:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: EASE_OUT }}>
            
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-fg">More</p>
                <button type="button" onClick={() => setMoreOpen(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-canvas">
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {MOBILE_MORE_NAV.map((item) =>
              <li key={item.to}>
                    <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                  cn('flex h-14 items-center gap-3 rounded-xl border px-4 text-sm font-medium', isActive ? 'border-analytics bg-analytics-soft text-analytics-strong' : 'border-line text-fg')
                  }>
                  
                      <item.icon className="h-5 w-5" aria-hidden />
                      {item.label}
                    </NavLink>
                  </li>
              )}
              </ul>
            </motion.div>
          </>
        }
      </AnimatePresence>

      <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="grid grid-cols-5">
          {MOBILE_PRIMARY_NAV.map((item) =>
          <li key={item.to}>
              <NavLink
              to={item.to}
              className={({ isActive }) => cn('flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium', isActive ? 'text-analytics' : 'text-muted')}>
              
                <item.icon className="h-5 w-5" aria-hidden />
                <span className="truncate">{item.label.replace('Crime ', '')}</span>
              </NavLink>
            </li>
          )}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              aria-expanded={moreOpen}
              className={cn('flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium', moreActive || moreOpen ? 'text-analytics' : 'text-muted')}>
              
              <EllipsisIcon className="h-5 w-5" aria-hidden />
              More
            </button>
          </li>
        </ul>
      </nav>
    </>);

}