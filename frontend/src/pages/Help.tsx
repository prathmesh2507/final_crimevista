import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, BookOpenTextIcon, ChevronDownIcon, SparklesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HELP_SECTIONS } from '../data/helpContent';
import { cn } from '../utils/cn';

export function Help() {
  const [openSection, setOpenSection] = useState('welcome');

  const quickLinks = useMemo(
    () => HELP_SECTIONS.map((section) => ({ id: section.id, label: section.title })),
    [],
  );

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-analytics/20 bg-analytics-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-analytics">
              <SparklesIcon className="h-3.5 w-3.5" />
              Quick start
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-fg">CrimeVista Help & guide</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Learn how to read the dashboard, investigate hotspots, work with filters, and use the AI assistant without leaving the current workflow.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-analytics px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-analytics/90"
          >
            Open dashboard
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
            <BookOpenTextIcon className="h-4 w-4 text-analytics" />
            Jump to section
          </div>
          <nav className="space-y-1.5">
            {quickLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => setOpenSection(link.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors',
                  openSection === link.id ? 'bg-analytics-soft text-analytics-strong' : 'text-muted hover:bg-canvas',
                )}
              >
                <span>{link.label}</span>
                <ChevronDownIcon className={cn('h-4 w-4 transition-transform', openSection === link.id && 'rotate-180')} />
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-4">
          {HELP_SECTIONS.map((section, index) => {
            const isOpen = openSection === section.id;
            return (
              <motion.section
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
              >
                <button
                  type="button"
                  onClick={() => setOpenSection(isOpen ? '' : section.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Section {index + 1}</p>
                    <h2 className="mt-1 text-lg font-semibold text-fg">{section.title}</h2>
                  </div>
                  <ChevronDownIcon className={cn('h-5 w-5 text-muted transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="border-t border-line px-5 py-4">
                    <p className="text-sm text-muted">{section.summary}</p>
                    <ul className="mt-4 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-sm text-fg">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-analytics" aria-hidden />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
