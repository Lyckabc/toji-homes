import { useEffect, useMemo, useRef, useState } from 'react';
import { detectSupportLocale, getSupportStrings, type SupportLocale } from '../../lib/support/i18n';
import { ragSearch, type RagHit } from '../../lib/support/gopedia-client';
import RagSuggestions from './RagSuggestions';
import TicketForm from './TicketForm';
import type { CreateTicketResult } from '../../lib/support/goquest-client';

type View = 'panel' | 'form' | 'success';

interface SuccessState {
  id: string;
  token: string;
}

interface HelpWidgetProps {
  locale?: SupportLocale;
}

export default function HelpWidget({ locale: localeProp }: HelpWidgetProps = {}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('panel');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [hits, setHits] = useState<RagHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [locale, setLocale] = useState<SupportLocale>(localeProp ?? 'en');
  const abortRef = useRef<AbortController | null>(null);

  const strings = useMemo(() => getSupportStrings(locale), [locale]);

  useEffect(() => {
    if (!localeProp) setLocale(detectSupportLocale());
  }, [localeProp]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(t);
  }, [query, open]);

  useEffect(() => {
    if (view !== 'panel') return;
    if (!debouncedQuery.trim()) {
      setHits([]);
      setSearching(false);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSearching(true);
    ragSearch(debouncedQuery, ctrl.signal)
      .then((res) => {
        if (!ctrl.signal.aborted) setHits(res);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setHits([]);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setSearching(false);
      });
    return () => ctrl.abort();
  }, [debouncedQuery, view]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function handleSuccess(r: CreateTicketResult) {
    setSuccess({ id: r.id, token: r.public_token });
    setView('success');
  }

  const ticketHref = success
    ? `${locale === 'ko' ? '/ko' : ''}/support/tickets/?id=${encodeURIComponent(success.id)}&token=${encodeURIComponent(
        success.token,
      )}`
    : '#';

  return (
    <div className="fixed right-4 bottom-4 z-[60] flex flex-col items-end pointer-events-none">
      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={strings.panel.title}
          className="pointer-events-auto mb-3 w-[min(22rem,calc(100vw-2rem))] max-h-[min(80vh,38rem)] overflow-hidden flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl"
        >
          <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {view === 'success' ? strings.ticketForm.successTitle : strings.panel.title}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={strings.launcher.close}
              className="rounded-md p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {view === 'panel' ? (
              <div className="flex flex-col gap-3">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={strings.panel.searchPlaceholder}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <RagSuggestions hits={hits} loading={searching} query={debouncedQuery} strings={strings} />
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{strings.panel.fallbackPrompt}</p>
                  <button
                    type="button"
                    onClick={() => setView('form')}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    {strings.panel.openTicketCta}
                  </button>
                </div>
              </div>
            ) : null}

            {view === 'form' ? (
              <TicketForm
                strings={strings}
                locale={locale}
                initialQuery={query}
                onBack={() => setView('panel')}
                onSuccess={handleSuccess}
              />
            ) : null}

            {view === 'success' && success ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">#{success.id}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{strings.ticketForm.successHint}</p>
                <a
                  href={ticketHref}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  {strings.ticketForm.viewTicket}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) setView('panel');
        }}
        aria-label={strings.launcher.open}
        aria-expanded={open}
        className="pointer-events-auto h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
      </button>
    </div>
  );
}
