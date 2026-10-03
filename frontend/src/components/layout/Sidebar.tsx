import React from 'react';
import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import { NAV_GROUPS, SETTINGS_NAV } from '../../data/navigation';
import { cn } from '../../utils/cn';
import { BrandMark } from './BrandMark';
import { SidebarLink } from './SidebarLink';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col bg-ink-900 transition-[width] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] md:flex',
        collapsed ? 'w-[76px]' : 'w-64'
      )}>
      
      <div className={cn('flex h-16 items-center gap-3 border-b border-ink-700 px-4', collapsed && 'justify-center px-0')}>
        <BrandMark />
        {!collapsed &&
        <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-tight text-white">CrimeVista</p>
            <p className="truncate text-xs text-ink-400">Nagpur Urban Safety</p>
          </div>
        }
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) =>
        <div key={group.label} className="mb-6">
            {!collapsed ?
          <p className="mb-2 px-3 text-xs font-medium text-ink-400">{group.label}</p> :

          <div className="mx-auto mb-2 h-px w-6 bg-ink-700" aria-hidden />
          }
            <ul className="space-y-0.5">
              {group.items.map((item) =>
            <li key={item.to}>
                  <SidebarLink item={item} collapsed={collapsed} />
                </li>
            )}
            </ul>
          </div>
        )}
      </nav>

      <div className="space-y-0.5 border-t border-ink-700 px-3 py-3">
        <SidebarLink item={SETTINGS_NAV} collapsed={collapsed} />
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-ink-400 transition-colors duration-150 hover:bg-ink-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics',
            collapsed && 'justify-center px-0'
          )}>
          
          {collapsed ? <ChevronsRightIcon className="h-[18px] w-[18px]" /> : <ChevronsLeftIcon className="h-[18px] w-[18px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>);

}