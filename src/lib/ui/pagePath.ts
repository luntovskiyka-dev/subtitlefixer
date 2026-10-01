/** Pathname of the page being rendered, without a trailing slash or `.html`. */
export function pagePath(pathname: string): string {
  let path = pathname.replace(/\/+$/, '');
  if (path.endsWith('.html')) path = path.slice(0, -'.html'.length);
  if (path === '' || path === '/index') return '/';
  return path;
}
