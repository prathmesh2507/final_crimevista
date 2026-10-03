import React from 'react';
import { NavLink } from 'react-router-dom';
import type { NavItem } from '../../data/navigation';
import { cn } from '../../utils/cn';

export function SidebarLink({ item, collapsed }: {item: NavItem;collapsed: boolean;}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
      cn(
        'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics',
        collapsed && 'justify-center px-0',
        isActive ? 'bg-ink-700 text-white' : 'text-ink-300 hover:bg-ink-800 hover:text-white'
      )
      }>
      
      {({ isActive }) =>
      <>
          <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-white')} aria-hidden />
          {collapsed ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
        </>
      }
    </NavLink>);

}