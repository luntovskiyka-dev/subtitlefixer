export const BRAND = 'SubtitleFixer';

/** Canonical pathname: no trailing slash, no `.html`, no `/index`. Root stays `/`. */
export function canonicalPathname(pathname: string): string {
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (withLeadingSlash === '/') return '/';

  let path = withLeadingSlash.replace(/\/+$/, '');
  if (path.endsWith('.html')) {
    path = path.slice(0, -'.html'.length);
  }
  if (path === '' || path === '/index') return '/';
  if (path.endsWith('/index')) {
    path = path.slice(0, -'/index'.length) || '/';
  }
  return path || '/';
}

export function canonicalHref(site: URL | string, pathname: string): string {
  return new URL(canonicalPathname(pathname), site).href;
}

/** Relative Location for a non-canonical request, including the query string. Null when the path is already canonical. */
export function redirectLocation(url: URL): string | null {
  const path = canonicalPathname(url.pathname);
  if (path === url.pathname) return null;
  return `${path}${url.search}`;
}

const UNLISTED = new Set(['/_styleguide', '/idx-to-srt']);

/** Sitemap `<loc>` for a page, or null when the page is not public. */
export function canonicalSitemapLoc(page: string): string | null {
  const url = new URL(page);
  url.pathname = canonicalPathname(url.pathname);
  url.search = '';
  url.hash = '';
  if (UNLISTED.has(url.pathname)) return null;
  return url.href;
}
