import { publicEnv, isGopediaConfigured } from './env';

export interface RagHit {
  id: string;
  title: string;
  snippet: string;
  url?: string;
  score: number;
}

export async function ragSearch(query: string, signal?: AbortSignal): Promise<RagHit[]> {
  if (!isGopediaConfigured()) return [];
  if (!query.trim()) return [];
  const res = await fetch(`${publicEnv('PUBLIC_GOPEDIA_BASE')}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': publicEnv('PUBLIC_GOPEDIA_KEY'),
    },
    body: JSON.stringify({ query, top_k: 3, score_threshold: 0.6 }),
    signal,
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { hits?: RagHit[]; results?: RagHit[] };
  const list = data.hits ?? data.results ?? [];
  return list.slice(0, 3);
}
