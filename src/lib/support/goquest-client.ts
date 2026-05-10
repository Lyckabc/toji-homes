import { publicEnv, isGoquestConfigured } from './env';

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

export interface TicketComment {
  id: string;
  author_kind: 'customer' | 'staff' | 'system';
  body: string;
  created_at: string;
  is_internal?: boolean;
}

export interface Ticket {
  id: string;
  public_id?: string;
  title: string;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at?: string;
  comments?: TicketComment[];
}

export interface CreateTicketInput {
  title: string;
  description: string;
  type?: 'request' | 'incident' | 'question';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  channel?: 'web' | 'email';
  category?: string;
  requester_email: string;
  metadata?: Record<string, unknown>;
}

export interface CreateTicketResult {
  id: string;
  public_token: string;
}

class HelpdeskNotConfiguredError extends Error {
  constructor() {
    super('helpdesk_not_configured');
    this.name = 'HelpdeskNotConfiguredError';
  }
}

export const isNotConfigured = (e: unknown): e is HelpdeskNotConfiguredError =>
  e instanceof Error && e.name === 'HelpdeskNotConfiguredError';

function ticketsBase(): string {
  const base = publicEnv('PUBLIC_GOQUEST_BASE');
  const wid = publicEnv('PUBLIC_CS_WORKSPACE_ID');
  const pid = publicEnv('PUBLIC_CS_PROJECT_WEB');
  return `${base}/workspaces/${wid}/projects/${pid}`;
}

function authedHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = {
    'X-API-Key': publicEnv('PUBLIC_GOQUEST_KEY'),
    'Content-Type': 'application/json',
  };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function createTicket(input: CreateTicketInput): Promise<CreateTicketResult> {
  if (!isGoquestConfigured()) throw new HelpdeskNotConfiguredError();
  const res = await fetch(`${ticketsBase()}/tickets`, {
    method: 'POST',
    headers: authedHeaders(),
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      type: input.type ?? 'request',
      priority: input.priority ?? 'normal',
      channel: input.channel ?? 'web',
      category: input.category,
      requester_email: input.requester_email,
      metadata: input.metadata ?? {},
    }),
  });
  if (!res.ok) throw new Error(`createTicket_failed_${res.status}`);
  return (await res.json()) as CreateTicketResult;
}

export async function getTicket(id: string, token: string): Promise<Ticket> {
  if (!isGoquestConfigured()) throw new HelpdeskNotConfiguredError();
  const res = await fetch(`${publicEnv('PUBLIC_GOQUEST_BASE')}/tickets/${encodeURIComponent(id)}`, {
    headers: authedHeaders(token),
    credentials: 'include',
  });
  if (res.status === 404 || res.status === 403) throw new Error('ticket_not_found');
  if (!res.ok) throw new Error(`get_ticket_failed_${res.status}`);
  return (await res.json()) as Ticket;
}

export async function postComment(id: string, token: string, body: string): Promise<TicketComment> {
  if (!isGoquestConfigured()) throw new HelpdeskNotConfiguredError();
  const res = await fetch(`${publicEnv('PUBLIC_GOQUEST_BASE')}/tickets/${encodeURIComponent(id)}/comments`, {
    method: 'POST',
    headers: authedHeaders(token),
    credentials: 'include',
    body: JSON.stringify({ body, is_internal: false }),
  });
  if (!res.ok) throw new Error(`post_comment_failed_${res.status}`);
  return (await res.json()) as TicketComment;
}

export function ticketEventSourceUrl(id: string): string {
  const base = publicEnv('PUBLIC_GOQUEST_BASE');
  return `${base}/events?filter=ticket:${encodeURIComponent(id)}`;
}
