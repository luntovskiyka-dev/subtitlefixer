import { describe, expect, it } from 'vitest';
import { buildJsonLd } from './jsonld';
import { BRAND } from './urls';

describe('buildJsonLd', () => {
  it('describes a tool as a WebApplication named without the document title', () => {
    const data = buildJsonLd({
      kind: 'webapp',
      name: 'Shift subtitles',
      description: 'Shift timings in the browser.',
      url: 'https://subtitlefixer.com/shift-subtitles',
    });
    expect(data).toMatchObject({
      '@type': 'WebApplication',
      name: 'Shift subtitles',
      url: 'https://subtitlefixer.com/shift-subtitles',
      offers: { price: '0', priceCurrency: 'USD' },
    });
    expect(JSON.stringify(data)).not.toContain('Shift subtitles —');
  });

  it('describes a guide as an Article published by SubtitleFixer', () => {
    expect(
      buildJsonLd({
        kind: 'article',
        headline: 'SRT vs VTT vs ASS',
        description: 'How the three formats differ.',
        url: 'https://subtitlefixer.com/guides/srt-vs-vtt-vs-ass',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'SRT vs VTT vs ASS',
      description: 'How the three formats differ.',
      url: 'https://subtitlefixer.com/guides/srt-vs-vtt-vs-ass',
      publisher: { '@type': 'Organization', name: BRAND },
    });
  });

  it('describes the home page as Organization and WebSite', () => {
    expect(
      buildJsonLd({
        kind: 'home',
        origin: 'https://subtitlefixer.com',
        logo: 'https://subtitlefixer.com/apple-touch-icon.png',
      }),
    ).toEqual([
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: BRAND,
        url: 'https://subtitlefixer.com',
        logo: 'https://subtitlefixer.com/apple-touch-icon.png',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: BRAND,
        url: 'https://subtitlefixer.com',
      },
    ]);
  });

  it('emits nothing for pages that are not a tool, guide, or the home page', () => {
    expect(buildJsonLd({ kind: 'none' })).toBeNull();
  });
});
