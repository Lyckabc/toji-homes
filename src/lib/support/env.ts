/**
 * Browser-safe accessor for PUBLIC_* env. Falls back to empty string when the
 * value is missing so callers can detect "backend not configured" without throwing.
 */
type Key =
  | 'PUBLIC_GOQUEST_BASE'
  | 'PUBLIC_GOQUEST_KEY'
  | 'PUBLIC_GOPEDIA_BASE'
  | 'PUBLIC_GOPEDIA_KEY'
  | 'PUBLIC_CS_WORKSPACE_ID'
  | 'PUBLIC_CS_PROJECT_WEB'
  | 'PUBLIC_ZITADEL_ISSUER'
  | 'PUBLIC_ZITADEL_CLIENT_ID';

const FALLBACK: Record<Key, string> = {
  PUBLIC_GOQUEST_BASE: 'https://goquest.toji.homes/api/v1',
  PUBLIC_GOQUEST_KEY: '',
  PUBLIC_GOPEDIA_BASE: 'https://gopedia.toji.homes/api/v1',
  PUBLIC_GOPEDIA_KEY: '',
  PUBLIC_CS_WORKSPACE_ID: '',
  PUBLIC_CS_PROJECT_WEB: '',
  PUBLIC_ZITADEL_ISSUER: 'https://auth.toji.homes',
  PUBLIC_ZITADEL_CLIENT_ID: '',
};

export function publicEnv(key: Key): string {
  const v = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key];
  if (typeof v === 'string' && v.length > 0) return v;
  return FALLBACK[key];
}

export function isGoquestConfigured(): boolean {
  return Boolean(publicEnv('PUBLIC_GOQUEST_KEY') && publicEnv('PUBLIC_CS_WORKSPACE_ID') && publicEnv('PUBLIC_CS_PROJECT_WEB'));
}

export function isGopediaConfigured(): boolean {
  return Boolean(publicEnv('PUBLIC_GOPEDIA_KEY'));
}
