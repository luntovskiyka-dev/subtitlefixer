import { describe, expect, it } from 'vitest';
import { canonicalHref, canonicalPathname, canonicalSitemapLoc, redirectLocation } from './urls';

const site = 'https://subtitlefixer.com';

describe('canonicalPathname', () => {
  it('keeps a slashless path and the root', () => {
    expect(canonicalPathname('/shift-subtitles')).toBe('/shift-subtitles');
    expect(canonicalPathname('/')).toBe('/');
    expect(canonicalPathname('/guides/srt-vs-vtt-vs-ass')).toBe('/guides/srt-vs-vtt-vs-ass');
  });

  it('drops a trailing slash, .html, and index', () => {
    expect(canonicalPathname('/shift-subtitles/')).toBe('/shift-subtitles');
    expect(canonicalPathname('/shift-subtitles///')).toBe('/shift-subtitles');
    expect(canonicalPathname('/shift-subtitles.html')).toBe('/shift-subtitles');
    expect(canonicalPathname('/shift-subtitles.html/')).toBe('/shift-subtitles');
    expect(canonicalPathname('/index.html')).toBe('/');
    expect(canonicalPathname('/guides/srt-vs-vtt-vs-ass/index.html')).toBe('/guides/srt-vs-vtt-vs-ass');
  });
});

describe('canonicalHref', () => {
  it('matches the public URL with a slash only on the root', () => {
    expect(canonicalHref(site, '/')).toBe('https://subtitlefixer.com/');
    expect(canonicalHref(site, '/shift-subtitles/')).toBe('https://subtitlefixer.com/shift-subtitles');
    expect(canonicalHref(site, '/about.html')).toBe('https://subtitlefixer.com/about');
  });
});

describe('redirectLocation', () => {
  it('301 targets keep the query string', () => {
    expect(redirectLocation(new URL('https://subtitlefixer.com/shift-subtitles'))).toBeNull();
    expect(redirectLocation(new URL('https://subtitlefixer.com/'))).toBeNull();
    expect(redirectLocation(new URL('https://subtitlefixer.com/?q=1'))).toBeNull();
    expect(redirectLocation(new URL('https://subtitlefixer.com/shift-subtitles/'))).toBe('/shift-subtitles');
    expect(redirectLocation(new URL('https://subtitlefixer.com/shift-subtitles.html'))).toBe(
      '/shift-subtitles',
    );
    expect(redirectLocation(new URL('https://subtitlefixer.com/shift-subtitles/?x=1&y=2'))).toBe(
      '/shift-subtitles?x=1&y=2',
    );
    expect(redirectLocation(new URL('https://subtitlefixer.com/shift-subtitles.html?x=1'))).toBe(
      '/shift-subtitles?x=1',
    );
  });
});

describe('canonicalSitemapLoc', () => {
  it('equals the page canonical and skips the styleguide', () => {
    expect(canonicalSitemapLoc('https://subtitlefixer.com/')).toBe('https://subtitlefixer.com/');
    expect(canonicalSitemapLoc('https://subtitlefixer.com/shift-subtitles/')).toBe(
      'https://subtitlefixer.com/shift-subtitles',
    );
    expect(canonicalSitemapLoc('https://subtitlefixer.com/shift-subtitles')).toBe(
      canonicalHref(site, '/shift-subtitles'),
    );
    expect(canonicalSitemapLoc('https://subtitlefixer.com/_styleguide')).toBeNull();
    expect(canonicalSitemapLoc('https://subtitlefixer.com/idx-to-srt')).toBeNull();
    expect(canonicalSitemapLoc('https://subtitlefixer.com/_styleguide/')).toBeNull();
    expect(canonicalSitemapLoc('https://subtitlefixer.com/sup-to-srt')).toBe(canonicalHref(site, '/sup-to-srt'));
    expect(canonicalSitemapLoc('https://subtitlefixer.com/sup-to-srt.html')).toBe(canonicalHref(site, '/sup-to-srt'));
  });
});
