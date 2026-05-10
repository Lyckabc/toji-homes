import { useState, type FormEvent } from 'react';
import type { SupportStrings } from '../../lib/support/i18n';
import { postComment } from '../../lib/support/goquest-client';

interface Props {
  strings: SupportStrings;
  ticketId: string;
  accessToken: string;
  onPosted?: () => void;
}

export default function ReplyBox({ strings, ticketId, accessToken, onPosted }: Props) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      await postComment(ticketId, accessToken, body.trim());
      setBody('');
      onPosted?.();
    } catch {
      setError(strings.reply.errorSend);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={strings.reply.placeholder}
        rows={3}
        className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 resize-y"
      />
      {error ? <span className="text-xs text-red-600 dark:text-red-400">{error}</span> : null}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold"
        >
          {sending ? strings.reply.sending : strings.reply.send}
        </button>
      </div>
    </form>
  );
}
