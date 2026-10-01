import { describe, expect, it } from 'vitest';
import { pagePath } from './pagePath';

describe('pagePath', () => {
  it('matches file-format build pathnames and clean URLs', () => {
    expect(pagePath('/shift-subtitles.html')).toBe('/shift-subtitles');
    expect(pagePath('/shift-subtitles')).toBe('/shift-subtitles');
    expect(pagePath('/shift-subtitles/')).toBe('/shift-subtitles');
    expect(pagePath('/index.html')).toBe('/');
    expect(pagePath('/')).toBe('/');
    expect(pagePath('/about.html')).toBe('/about');
    expect(pagePath('/guides/srt-vs-vtt-vs-ass.html')).toBe('/guides/srt-vs-vtt-vs-ass');
  });
});
