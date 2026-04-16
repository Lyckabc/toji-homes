import { SITE_ORIGIN } from './site';

export interface AlternateLink {
  hreflang: string;
  href: string;
}

/** Normalize: no trailing slash; root is `/` (비교·페어링용). */
function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

/** 공개 URL: 루트만 `/`, 나머지는 끝 `/` (trailingSlash always). */
function publicPath(path: string): string {
  const p = normalizePath(path);
  if (p === '/') return '/';
  return `${p}/`;
}

/**
 * English at `/` (default) + Korean under `/ko/*` — hreflang alternates.
 * `x-default` points to the English URL for the current page (default locale).
 */
export function getAlternateLinks(site: URL | string | undefined, pathname: string): AlternateLink[] {
  const root = (site ? String(site) : SITE_ORIGIN).replace(/\/$/, '');
  const p = normalizePath(pathname);

  const isKoHome = p === '/ko';
  const isKoNested = p.startsWith('/ko/');
  const isKo = isKoHome || isKoNested;

  let koPath: string;
  let enPath: string;

  if (isKo) {
    if (isKoHome) {
      koPath = '/ko/';
      enPath = '/';
    } else {
      koPath = publicPath(p);
      const stripped = p.replace(/^\/ko\/?/, '') || '';
      enPath = stripped ? publicPath(`/${stripped}`) : '/';
    }
  } else {
    enPath = publicPath(p);
    koPath = p === '/' ? '/ko/' : publicPath(`/ko${p}`);
  }

  const toAbsolute = (path: string) => {
    if (path === '/' || path === '') return `${root}/`;
    const pub = path.endsWith('/') ? path : `${path}/`;
    return `${root}${pub}`;
  };

  return [
    { hreflang: 'ko', href: toAbsolute(koPath) },
    { hreflang: 'en', href: toAbsolute(enPath) },
    { hreflang: 'x-default', href: toAbsolute(enPath) },
  ];
}

export function getCanonicalUrl(site: URL | string | undefined, pathname: string): URL {
  const base = site ?? SITE_ORIGIN;
  const p = normalizePath(pathname);
  const pathForUrl = publicPath(p);
  return new URL(pathForUrl, base);
}
