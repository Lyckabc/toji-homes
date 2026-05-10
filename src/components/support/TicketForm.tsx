import { useState, type FormEvent } from 'react';
import type { SupportStrings } from '../../lib/support/i18n';
import { createTicket, isNotConfigured, type CreateTicketResult } from '../../lib/support/goquest-client';

interface Props {
  strings: SupportStrings;
  locale: 'ko' | 'en';
  initialQuery?: string;
  onBack: () => void;
  onSuccess: (result: CreateTicketResult) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TicketForm({ strings, locale, initialQuery, onBack, onSuccess }: Props) {
  const [category, setCategory] = useState('general');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(initialQuery ?? '');
  const [body, setBody] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);

  const t = strings.ticketForm;

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = t.errorEmailRequired;
    else if (!EMAIL_RE.test(email)) next.email = t.errorEmailInvalid;
    if (!subject.trim()) next.subject = t.errorSubjectRequired;
    if (!body.trim()) next.body = t.errorBodyRequired;
    if (!consent) next.consent = t.errorConsentRequired;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTopError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await createTicket({
        title: subject.trim(),
        description: body.trim(),
        category,
        requester_email: email.trim(),
        metadata: {
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          page_url: typeof window !== 'undefined' ? window.location.href : undefined,
          locale,
        },
      });
      try {
        localStorage.setItem('last_ticket_token', JSON.stringify({ id: result.id, token: result.public_token }));
      } catch {
        /* ignore quota */
      }
      onSuccess(result);
    } catch (err) {
      if (isNotConfigured(err)) {
        setTopError(t.errorGeneric);
      } else {
        setTopError(t.errorGeneric);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          {t.back}
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.title}</span>
      </div>

      {topError ? (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-md px-2 py-1.5">
          {topError}
        </div>
      ) : null}

      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-gray-700 dark:text-gray-300">{t.category}</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
        >
          <option value="general">{t.categoryGeneral}</option>
          <option value="account">{t.categoryAccount}</option>
          <option value="billing">{t.categoryBilling}</option>
          <option value="bug">{t.categoryBug}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-gray-700 dark:text-gray-300">{t.email}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <span className="text-red-600 dark:text-red-400">{errors.email}</span> : null}
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-gray-700 dark:text-gray-300">{t.subject}</span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t.subjectPlaceholder}
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          aria-invalid={Boolean(errors.subject)}
        />
        {errors.subject ? <span className="text-red-600 dark:text-red-400">{errors.subject}</span> : null}
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-gray-700 dark:text-gray-300">{t.body}</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t.bodyPlaceholder}
          rows={4}
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 resize-y"
          aria-invalid={Boolean(errors.body)}
        />
        {errors.body ? <span className="text-red-600 dark:text-red-400">{errors.body}</span> : null}
      </label>

      <label className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-700"
        />
        <span>{t.consent}</span>
      </label>
      {errors.consent ? <span className="text-xs text-red-600 dark:text-red-400">{errors.consent}</span> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex justify-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold"
      >
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
