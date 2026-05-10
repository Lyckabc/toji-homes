import { useEffect, useMemo, useState } from 'react';
import { detectSupportLocale, getSupportStrings, type SupportLocale } from '../../lib/support/i18n';
import {
  getTicket,
  ticketEventSourceUrl,
  type Ticket,
  type TicketComment,
  type TicketStatus,
} from '../../lib/support/goquest-client';
import {
  exchangeMagicToken,
  loadSession,
  stripTokenFromUrl,
  type HelpdeskSession,
} from '../../lib/support/auth';
import ReplyBox from './ReplyBox';

interface Props {
  /** Optional locale override; defaults to <html lang>. */
  locale?: SupportLocale;
}

type Phase =
  | { kind: 'loading' }
  | { kind: 'need_id' }
  | { kind: 'need_token' }
  | { kind: 'auth_error'; message: string }
  | { kind: 'load_error'; message: string }
  | { kind: 'ready'; ticket: Ticket };

function readSearchParams(): { id: string | null; token: string | null } {
  if (typeof window === 'undefined') return { id: null, token: null };
  const u = new URL(window.location.href);
  return { id: u.searchParams.get('id'), token: u.searchParams.get('token') };
}

export default function TicketThread({ locale: localeProp }: Props) {
  const [locale, setLocale] = useState<SupportLocale>(localeProp ?? 'en');
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [session, setSession] = useState<HelpdeskSession | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const strings = useMemo(() => getSupportStrings(locale), [locale]);

  useEffect(() => {
    if (!localeProp) setLocale(detectSupportLocale());
  }, [localeProp]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { id, token } = readSearchParams();
      if (!id) {
        setPhase({ kind: 'need_id' });
        return;
      }
      setTicketId(id);
      let s = loadSession(id);
      if (!s && token) {
        try {
          s = await exchangeMagicToken(id, token);
          stripTokenFromUrl();
        } catch {
          if (cancelled) return;
          setPhase({ kind: 'auth_error', message: strings.auth.exchangeError });
          return;
        }
      } else if (token) {
        stripTokenFromUrl();
      }
      if (!s) {
        if (cancelled) return;
        setPhase({ kind: 'need_token' });
        return;
      }
      setSession(s);
      try {
        const ticket = await getTicket(id, s.access_token);
        if (cancelled) return;
        setPhase({ kind: 'ready', ticket });
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error && err.message === 'ticket_not_found' ? strings.thread.notFound : strings.thread.errorLoad;
        setPhase({ kind: 'load_error', message: msg });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [strings, refreshTick]);

  useEffect(() => {
    if (phase.kind !== 'ready' || !ticketId || !session) return;
    let es: EventSource | null = null;
    try {
      es = new EventSource(ticketEventSourceUrl(ticketId), { withCredentials: true });
    } catch {
      return;
    }
    const handleComment = (raw: MessageEvent) => {
      try {
        const c = JSON.parse(raw.data) as TicketComment;
        setPhase((prev) =>
          prev.kind === 'ready'
            ? { kind: 'ready', ticket: { ...prev.ticket, comments: [...(prev.ticket.comments ?? []), c] } }
            : prev,
        );
      } catch {
        /* ignore malformed event */
      }
    };
    const handleUpdated = (raw: MessageEvent) => {
      try {
        const patch = JSON.parse(raw.data) as Partial<Ticket>;
        setPhase((prev) =>
          prev.kind === 'ready' ? { kind: 'ready', ticket: { ...prev.ticket, ...patch } } : prev,
        );
      } catch {
        /* ignore */
      }
    };
    es.addEventListener('ticket.comment.added', handleComment as EventListener);
    es.addEventListener('ticket.updated', handleUpdated as EventListener);
    es.addEventListener('ticket.completed', handleUpdated as EventListener);
    es.onerror = () => {
      es?.close();
    };
    return () => {
      es?.close();
    };
  }, [phase.kind, ticketId, session]);

  if (phase.kind === 'loading') {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{strings.thread.loading}</p>;
  }
  if (phase.kind === 'need_id') {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{strings.thread.notFound}</p>;
  }
  if (phase.kind === 'need_token') {
    const magicHref = `${locale === 'ko' ? '/ko' : ''}/support/auth/magic-link/?id=${encodeURIComponent(ticketId ?? '')}`;
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">{strings.auth.magicHint}</p>
        <a
          href={magicHref}
          className="inline-flex w-fit px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
        >
          {strings.auth.send}
        </a>
      </div>
    );
  }
  if (phase.kind === 'auth_error' || phase.kind === 'load_error') {
    return <p className="text-sm text-red-600 dark:text-red-400">{phase.message}</p>;
  }

  const ticket = phase.ticket;
  const statusKey = (ticket.status ?? 'open') as TicketStatus;
  const statusLabel = strings.thread.status[statusKey] ?? ticket.status;
  const isResolved = statusKey === 'resolved' || statusKey === 'closed';

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">#{ticket.public_id ?? ticket.id}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{statusLabel}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {strings.thread.createdLabel}: {new Date(ticket.created_at).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US')}
        </p>
        <h1 className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{ticket.title}</h1>
      </header>

      {isResolved ? (
        <div className="rounded-md border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 px-3 py-2 text-sm text-green-700 dark:text-green-300">
          {strings.thread.resolvedBanner}
        </div>
      ) : null}

      <ol className="flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
        <li className="flex flex-col gap-1">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            [{strings.thread.customer}] {new Date(ticket.created_at).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US')}
          </div>
          <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{ticket.description}</p>
        </li>
        {(ticket.comments ?? [])
          .filter((c) => !c.is_internal)
          .map((c) => (
            <li key={c.id} className="flex flex-col gap-1">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                [{c.author_kind === 'staff' ? strings.thread.staff : strings.thread.customer}]{' '}
                {new Date(c.created_at).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US')}
              </div>
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
      </ol>

      {!isResolved && session ? (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <ReplyBox
            strings={strings}
            ticketId={ticket.id}
            accessToken={session.access_token}
            onPosted={() => setRefreshTick((n) => n + 1)}
          />
        </div>
      ) : null}
    </div>
  );
}
