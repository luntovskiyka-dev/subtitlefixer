import { describe, expect, it } from 'vitest';
import { listOgCards } from './card';

describe('listOgCards', () => {
  it('lists the public pages', () => {
    const cards = listOgCards();
    expect(cards.map((card) => card.path)).toEqual([
      '/',
      '/ass-to-srt',
      '/fix-subtitle-drift',
      '/fix-subtitle-encoding',
      '/shift-subtitles',
      '/srt-to-vtt',
      '/vtt-to-srt',
      '/about',
      '/privacy',
      '/guides/srt-vs-vtt-vs-ass',
      '/guides/subtitles-out-of-sync',
    ]);
    expect(cards.map((card) => card.path).sort()).toEqual([
      '/',
      '/about',
      '/ass-to-srt',
      '/fix-subtitle-drift',
      '/fix-subtitle-encoding',
      '/guides/srt-vs-vtt-vs-ass',
      '/guides/subtitles-out-of-sync',
      '/privacy',
      '/shift-subtitles',
      '/srt-to-vtt',
      '/vtt-to-srt',
    ]);
    for (const card of cards) {
      expect(card.title.trim()).not.toBe('');
      expect(card.description.trim()).not.toBe('');
      expect(card.path).not.toContain('styleguide');
    }
  });
});
