import { publicEnv, isGoquestConfigured } from './env';

const SESSION_KEY = 'toji_helpdesk_session';

export interface HelpdeskSession {
  ticket_id: string;
  access_token: string;
  exp: number;
}

export function loadSession(ticketId: string): HelpdeskSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${SESSION_KEY}:${ticketId}`);
    if (!raw) return null;
    const s = JSON.parse(raw) as HelpdeskSession;
    if (Date.now() / 1000 > s.exp) {
      sessionStorage.removeItem(`${SESSION_KEY}:${ticketId}`);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function saveSession(s: HelpdeskSession): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(`${SESSION_KEY}:${s.ticket_id}`, JSON.stringify(s));
}

export function clearSession(ticketId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(`${SESSION_KEY}:${ticketId}`);
}

export async function exchangeMagicToken(ticketId: string, token: string): Promise<HelpdeskSession> {
  if (!isGoquestConfigured()) throw new Error('helpdesk_not_configured');
  const res = await fetch(`${publicEnv('PUBLIC_GOQUEST_BASE')}/auth/magic-link/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': publicEnv('PUBLIC_GOQUEST_KEY'),
    },
    credentials: 'include',
    body: JSON.stringify({ ticket_id: ticketId, token }),
  });
  if (!res.ok) throw new Error(`magic_exchange_failed_${res.status}`);
  const data = (await res.json()) as { access_token: string; exp: number };
  const session: HelpdeskSession = {
    ticket_id: ticketId,
    access_token: data.access_token,
    exp: data.exp,
  };
  saveSession(session);
  return session;
}

export async function requestMagicLink(ticketId: string, email: string): Promise<void> {
  if (!isGoquestConfigured()) throw new Error('helpdesk_not_configured');
  const res = await fetch(`${publicEnv('PUBLIC_GOQUEST_BASE')}/auth/magic-link/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': publicEnv('PUBLIC_GOQUEST_KEY'),
    },
    body: JSON.stringify({ ticket_id: ticketId, email }),
  });
  if (!res.ok) throw new Error(`magic_request_failed_${res.status}`);
}

/**
 * Strip ?token=... from the URL so the magic-link token doesn't survive a refresh
 * or accidental copy/paste. Per prototype §6.
 */
export function stripTokenFromUrl(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (url.searchParams.has('token')) {
    url.searchParams.delete('token');
    window.history.replaceState({}, '', url.toString());
  }
}
