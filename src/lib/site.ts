/** Apex marketing host (no scheme, no path). */
export const SITE_DOMAIN = 'toji.homes' as const;

/** Canonical site origin for SEO, Astro `site`, and absolute URLs. */
export const SITE_ORIGIN = `https://${SITE_DOMAIN}` as const;

/** `https://{subdomain}.{SITE_DOMAIN}` for homelab / service links. */
export function siteHost(subdomain: string): string {
  return `https://${subdomain}.${SITE_DOMAIN}`;
}
