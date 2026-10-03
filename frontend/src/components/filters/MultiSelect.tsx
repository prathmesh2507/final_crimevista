import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/constants';

interface MultiSelectProps {
  id: string;
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function MultiSelect({ id, label, options, value, onChange, loading = false, disabled = false }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const summary = loading ? 'Loading…' : value.length === 0 ? 'All' : value.length === 1 ? value[0] : `${value.length} selected`;
  const visible = query ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase())) : options;
  const toggle = (option: string) => onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);

  return (
    <div ref={rootRef} className="relative">
      <span id={`${id}-label`} className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </span>
      <button
        type="button"
        id={id}
        aria-haspopup="true"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}`}
        disabled={disabled || loading}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics disabled:cursor-not-allowed disabled:opacity-60',
          open ? 'border-analytics' : 'border-line hover:border-subtle'
        )}>
        
        <span className={cn('truncate', value.length ? 'font-medium text-fg' : 'text-muted')}>{summary}</span>
        <ChevronDownIcon className={cn('h-4 w-4 shrink-0 text-subtle transition-transform duration-150', open && 'rotate-180')} aria-hidden />
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16, ease: EASE_OUT }}
          className="absolute left-0 z-40 mt-1 w-full min-w-[240px] origin-top rounded-lg border border-line bg-surface p-1 shadow-pop">
          
            {options.length > 7 &&
          <div className="relative mb-1 p-1">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
                <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              aria-label={`Search ${label}`}
              className="h-9 w-full rounded-md border border-line bg-canvas pl-8 pr-2 text-sm focus:border-analytics focus:outline-none" />
            
              </div>
          }
            <fieldset className="max-h-64 overflow-y-auto">
              <legend className="sr-only">{label}</legend>
              {visible.map((option) =>
            <label key={option} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-fg hover:bg-canvas">
                  <input type="checkbox" checked={value.includes(option)} onChange={() => toggle(option)} className="h-4 w-4 rounded border-line accent-analytics" />
                  <span className="truncate">{option}</span>
                </label>
            )}
              {!visible.length && <p className="px-2.5 py-3 text-sm text-muted">{options.length ? 'No matches' : 'No options returned by the backend'}</p>}
            </fieldset>
            {value.length > 0 &&
          <div className="mt-1 border-t border-line pt-1">
                <button type="button" onClick={() => onChange([])} className="w-full rounded-md px-2.5 py-2 text-left text-xs font-medium text-analytics hover:bg-canvas">
                  Clear selection
                </button>
              </div>
          }
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}