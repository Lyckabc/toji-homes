import type { Locale } from '../content/siteContent';

/** Normalize pathname (no trailing slash; root is `/`). */
export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

/** Astro `trailingSlash: 'always'` 와 동일한 공개 경로. */
function toPublicPath(normalized: string): string {
  const p = normalized || '/';
  if (p === '/') return '/';
  if (p === '/ko') return '/ko/';
  return `${p}/`;
}

export function localeFromPath(pathname: string): Locale {
  const p = normalizePathname(pathname);
  return p === '/ko' || p.startsWith('/ko/') ? 'ko' : 'en';
}

/** Switch between default English URLs and Korean `/ko/*`. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const p = normalizePathname(pathname);
  const current = localeFromPath(p);

  if (current === target) {
    return toPublicPath(p);
  }

  if (target === 'en') {
    if (p === '/ko') return '/';
    if (p.startsWith('/ko/')) {
      const rest = p.slice(4);
      return rest ? toPublicPath(`/${rest}`) : '/';
    }
    return toPublicPath(p);
  }

  // target === 'ko'
  if (p === '/') return '/ko/';
  return toPublicPath(`/ko${p}`);
}
