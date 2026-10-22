import { describe, expect, it } from 'vitest';
import { listOgCards } from './card';

describe('listOgCards', () => {
  it('lists the public pages', () => {
    const cards = listOgCards();
    expect(cards.map((card) => card.path)).toEqual([
      '/',
      '/ass-to-srt',
      '/ass-to-vtt',
      '/dfxp-to-srt',
      '/fix-subtitle-drift',
      '/fix-subtitle-encoding',
      '/merge-subtitles',
      '/sbv-to-srt',
      '/shift-subtitles',
      '/smi-to-srt',
      '/srt-editor',
      '/srt-to-excel',
      '/srt-to-txt',
      '/srt-to-vtt',
      '/srt-to-word',
      '/srt-validator',
      '/stl-to-srt',
      '/sub-to-srt',
      '/subtitle-cleaner',
      '/sup-to-srt',
      '/ttml-to-srt',
      '/txt-to-srt',
      '/txt-to-vtt',
      '/vtt-to-srt',
      '/vtt-to-txt',
      '/xml-to-srt',
      '/about',
      '/privacy',
      '/guides/srt-vs-vtt-vs-ass',
      '/guides/subtitles-out-of-sync',
    ]);
    expect(cards.map((card) => card.path).sort()).toEqual([
      '/',
      '/about',
      '/ass-to-srt',
      '/ass-to-vtt',
      '/dfxp-to-srt',
      '/fix-subtitle-drift',
      '/fix-subtitle-encoding',
      '/guides/srt-vs-vtt-vs-ass',
      '/guides/subtitles-out-of-sync',
      '/merge-subtitles',
      '/privacy',
      '/sbv-to-srt',
      '/shift-subtitles',
      '/smi-to-srt',
      '/srt-editor',
      '/srt-to-excel',
      '/srt-to-txt',
      '/srt-to-vtt',
      '/srt-to-word',
      '/srt-validator',
      '/stl-to-srt',
      '/sub-to-srt',
      '/subtitle-cleaner',
      '/sup-to-srt',
      '/ttml-to-srt',
      '/txt-to-srt',
      '/txt-to-vtt',
      '/vtt-to-srt',
      '/vtt-to-txt',
      '/xml-to-srt',
    ]);
    for (const card of cards) {
      expect(card.title.trim()).not.toBe('');
      expect(card.description.trim()).not.toBe('');
      expect(card.path).not.toContain('styleguide');
    }
  });
});
