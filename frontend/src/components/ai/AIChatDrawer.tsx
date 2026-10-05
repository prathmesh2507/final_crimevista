import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BotIcon, LoaderCircleIcon, MessageSquareTextIcon, SendHorizonalIcon, SparklesIcon, XIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { chatApi, type ChatResponse } from '../../api/chatApi';
import { useFilters } from '../../hooks/useFilters';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/constants';

interface AIChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

const initialMessages = [
  {
    role: 'assistant' as const,
    content: 'I can explain the dashboard, map, hotspots, reports, and filters in the CrimeVista workflow. Ask me anything about the current view.',
  },
];

function getPageLabel(pathname: string) {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/map')) return 'Crime Map';
  if (pathname.startsWith('/hotspots')) return 'Hotspots';
  if (pathname.startsWith('/areas')) return 'Area Explorer';
  if (pathname.startsWith('/upload')) return 'Data Upload';
  if (pathname.startsWith('/reports')) return 'Reports';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/help')) return 'Help';
  return 'General';
}

export function AIChatDrawer({ open, onClose }: AIChatDrawerProps) {
  const location = useLocation();
  const { filters } = useFilters();
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>(initialMessages);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  const pageLabel = useMemo(() => getPageLabel(location.pathname), [location.pathname]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || isSending) return;

    const nextUserMessage = { role: 'user' as const, content: text };
    setMessages((current) => [...current, nextUserMessage]);
    setDraft('');
    setIsSending(true);

    try {
      const response: ChatResponse = await chatApi.ask({
        message: text,
        page: pageLabel,
        filters,
        selectedArea: new URLSearchParams(location.search).get('area'),
      });
      setMessages((current) => [...current, { role: 'assistant', content: response.answer }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'I could not reach the assistant service right now. Try again in a moment or use the built-in Help page for the same guidance.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink-900/35 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 32, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="fixed bottom-5 right-5 z-50 flex h-[80vh] w-[min(92vw,420px)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-pop"
            aria-label="CrimeVista AI assistant"
          >
            <div className="flex items-center justify-between border-b border-line bg-analytics-soft px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-analytics shadow-sm ring-1 ring-analytics/30">
                  <BotIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-fg">CrimeVista AI</p>
                  <p className="text-[11px] text-muted">Context-aware guidance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close AI assistant"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/60 hover:text-fg"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-line bg-canvas/60 px-4 py-2 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <SparklesIcon className="h-3.5 w-3.5 text-analytics" />
                {pageLabel} context
              </span>
              <span className="rounded-full border border-line bg-surface px-2 py-0.5">Live</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-canvas/40 px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    'flex w-full',
                    message.role === 'assistant' ? 'justify-start' : 'justify-end',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm',
                      message.role === 'assistant'
                        ? 'border border-line bg-surface text-fg'
                        : 'bg-analytics text-white',
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2 text-sm text-muted">
                    <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                    Thinking…
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-line bg-surface p-3">
              <label className="sr-only" htmlFor="crimevista-ai-message">Ask CrimeVista AI</label>
              <div className="flex items-end gap-2 rounded-2xl border border-line bg-canvas px-2.5 py-2">
                <textarea
                  id="crimevista-ai-message"
                  rows={2}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void submit();
                    }
                  }}
                  placeholder="Ask about the map, trends, hotspots, or filters…"
                  className="max-h-28 min-h-[42px] flex-1 resize-none bg-transparent px-1 py-1 text-sm text-fg outline-none placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={!draft.trim() || isSending}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-analytics text-white disabled:cursor-not-allowed disabled:bg-analytics/50"
                  aria-label="Send message"
                >
                  <SendHorizonalIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
                <MessageSquareTextIcon className="h-3.5 w-3.5" />
                Built-in guidance is available even without an AI provider key.
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
