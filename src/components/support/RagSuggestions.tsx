import type { RagHit } from '../../lib/support/gopedia-client';
import type { SupportStrings } from '../../lib/support/i18n';

interface Props {
  hits: RagHit[];
  loading: boolean;
  query: string;
  strings: SupportStrings;
  onResolved?: (hitId: string) => void;
  onNotResolved?: (hitId: string) => void;
}

export default function RagSuggestions({ hits, loading, query, strings, onResolved, onNotResolved }: Props) {
  if (!query.trim()) return null;

  if (loading) {
    return <div className="text-xs text-gray-500 dark:text-gray-400 px-1 py-2">{strings.panel.searching}</div>;
  }

  if (hits.length === 0) {
    return <div className="text-xs text-gray-500 dark:text-gray-400 px-1 py-2">{strings.panel.noResults}</div>;
  }

  const top = hits[0];
  const showFeedback = top && top.score >= 0.75;

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 px-1">{strings.panel.suggestions}</div>
      <ul className="space-y-2">
        {hits.map((h) => (
          <li
            key={h.id}
            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
          >
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{h.title}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-3">{h.snippet}</p>
            {h.url ? (
              <a
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {strings.panel.openTicketCta.replace('→', '')} →
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      {showFeedback ? (
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onResolved?.(top.id)}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            {strings.panel.resolved}
          </button>
          <button
            type="button"
            onClick={() => onNotResolved?.(top.id)}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {strings.panel.notResolved}
          </button>
        </div>
      ) : null}
    </div>
  );
}
