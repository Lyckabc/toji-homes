import { useEffect, useMemo, useState } from 'react';
import { detectSupportLocale, getSupportStrings, type SupportLocale } from '../../lib/support/i18n';
import TicketForm from './TicketForm';
import type { CreateTicketResult } from '../../lib/support/goquest-client';

interface Props {
  locale?: SupportLocale;
}

export default function StandaloneTicketForm({ locale: localeProp }: Props) {
  const [locale, setLocale] = useState<SupportLocale>(localeProp ?? 'en');
  const [success, setSuccess] = useState<CreateTicketResult | null>(null);

  const strings = useMemo(() => getSupportStrings(locale), [locale]);

  useEffect(() => {
    if (!localeProp) setLocale(detectSupportLocale());
  }, [localeProp]);

  if (success) {
    const href = `${locale === 'ko' ? '/ko' : ''}/support/tickets/?id=${encodeURIComponent(success.id)}&token=${encodeURIComponent(success.public_token)}`;
    return (
      <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 p-5 flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">{strings.ticketForm.successTitle}</h2>
        <p className="text-sm text-green-700/90 dark:text-green-300/90">#{success.id}</p>
        <p className="text-xs text-green-700/80 dark:text-green-300/80">{strings.ticketForm.successHint}</p>
        <a
          href={href}
          className="w-fit inline-flex px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
        >
          {strings.ticketForm.viewTicket}
        </a>
      </div>
    );
  }

  return (
    <TicketForm
      strings={strings}
      locale={locale}
      onBack={() => {
        if (typeof window !== 'undefined') window.history.back();
      }}
      onSuccess={(r) => setSuccess(r)}
    />
  );
}
