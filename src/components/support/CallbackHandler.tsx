import { useEffect, useMemo, useState } from 'react';
import { detectSupportLocale, getSupportStrings, type SupportLocale } from '../../lib/support/i18n';
import { exchangeMagicToken } from '../../lib/support/auth';

interface Props {
  locale?: SupportLocale;
}

export default function CallbackHandler({ locale: localeProp }: Props) {
  const [locale, setLocale] = useState<SupportLocale>(localeProp ?? 'en');
  const [error, setError] = useState<string | null>(null);

  const strings = useMemo(() => getSupportStrings(locale), [locale]);

  useEffect(() => {
    if (!localeProp) setLocale(detectSupportLocale());
  }, [localeProp]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    const token = url.searchParams.get('token');
    if (!id || !token) {
      setError(strings.auth.exchangeError);
      return;
    }
    let cancelled = false;
    exchangeMagicToken(id, token)
      .then(() => {
        if (cancelled) return;
        const target = `${locale === 'ko' ? '/ko' : ''}/support/tickets/?id=${encodeURIComponent(id)}`;
        window.location.replace(target);
      })
      .catch(() => {
        if (cancelled) return;
        setError(strings.auth.exchangeError);
      });
    return () => {
      cancelled = true;
    };
  }, [strings, locale]);

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }
  return <p className="text-sm text-gray-500 dark:text-gray-400">{strings.auth.exchanging}</p>;
}
