import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { detectSupportLocale, getSupportStrings, type SupportLocale } from '../../lib/support/i18n';
import { requestMagicLink } from '../../lib/support/auth';

interface Props {
  locale?: SupportLocale;
}

export default function MagicLinkForm({ locale: localeProp }: Props) {
  const [locale, setLocale] = useState<SupportLocale>(localeProp ?? 'en');
  const [ticketId, setTicketId] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strings = useMemo(() => getSupportStrings(locale), [locale]);

  useEffect(() => {
    if (!localeProp) setLocale(detectSupportLocale());
    if (typeof window !== 'undefined') {
      const id = new URL(window.location.href).searchParams.get('id') ?? '';
      setTicketId(id);
    }
  }, [localeProp]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!ticketId.trim() || !email.trim()) return;
    setSending(true);
    try {
      await requestMagicLink(ticketId.trim(), email.trim());
      setDone(true);
    } catch {
      setError(strings.auth.errorSend);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 p-4">
        <p className="text-sm font-semibold text-green-700 dark:text-green-300">{strings.auth.successTitle}</p>
        <p className="text-xs text-green-700/80 dark:text-green-300/80 mt-1">{strings.auth.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{strings.auth.magicTitle}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">{strings.auth.magicHint}</p>

      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-gray-700 dark:text-gray-300">Ticket ID</span>
        <input
          type="text"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
          required
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-gray-700 dark:text-gray-300">{strings.auth.emailLabel}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
        />
      </label>

      {error ? <span className="text-xs text-red-600 dark:text-red-400">{error}</span> : null}

      <button
        type="submit"
        disabled={sending}
        className="mt-1 inline-flex w-fit px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold"
      >
        {sending ? strings.auth.sending : strings.auth.send}
      </button>
    </form>
  );
}
