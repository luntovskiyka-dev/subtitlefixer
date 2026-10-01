import { describe, expect, it } from 'vitest';
import { serialize } from '../subs/index';
import type { Cue } from '../subs/types';
import { previewCaption, slicePreviewCues, slicePreviewLines } from './previewSlice';

function cues(count: number): Cue[] {
  return Array.from({ length: count }, (_, index) => ({
    start: index * 1000,
    end: index * 1000 + 400,
    text: `Cue ${index + 1}`,
  }));
}

function arrows(text: string): number {
  return text.split('-->').length - 1;
}

describe('slicePreviewCues', () => {
  it('keeps the first 6 of 600 SRT cues and reports N', () => {
    const full = serialize(cues(600), 'srt');
    const sliced = slicePreviewCues(full);

    expect(sliced.total).toBe(600);
    expect(sliced.shown).toBe(6);
    expect(sliced.caption).toBe('first 6 of 600 cues');
    expect(arrows(sliced.preview)).toBe(6);
    expect(sliced.preview).toContain('Cue 6');
    expect(sliced.preview).not.toContain('Cue 7');
    expect(full.startsWith(sliced.preview.trimEnd())).toBe(true);
    expect(full.length).toBeGreaterThan(sliced.preview.length);
  });

  it('keeps the first 6 of 600 VTT cues, including the header', () => {
    const full = serialize(cues(600), 'vtt');
    const sliced = slicePreviewCues(full);

    expect(sliced.total).toBe(600);
    expect(sliced.shown).toBe(6);
    expect(sliced.caption).toBe(previewCaption(6, 600));
    expect(sliced.preview.startsWith('WEBVTT\n')).toBe(true);
    expect(arrows(sliced.preview)).toBe(6);
    expect(sliced.preview).toContain('Cue 6');
    expect(sliced.preview).not.toContain('Cue 7');
  });

  it('returns a short file unchanged', () => {
    const full = serialize(cues(2), 'srt');
    const sliced = slicePreviewCues(full);

    expect(sliced.shown).toBe(2);
    expect(sliced.total).toBe(2);
    expect(sliced.caption).toBe('2 cues');
    expect(sliced.preview).toBe(full);
  });

  it('uses the singular when one cue remains', () => {
    const sliced = slicePreviewCues(serialize(cues(1), 'srt'));
    expect(sliced.caption).toBe('1 cue');
    expect(sliced.shown).toBe(1);
  });
});

describe('slicePreviewLines', () => {
  it('keeps the first 12 lines of a long decoding', () => {
    const lines = Array.from({ length: 40 }, (_, index) => `line ${index + 1}`);
    const sliced = slicePreviewLines(`${lines.join('\n')}\n`);

    expect(sliced.total).toBe(40);
    expect(sliced.shown).toBe(12);
    expect(sliced.caption).toBe('first 12 of 40 lines');
    expect(sliced.preview.split('\n')).toHaveLength(12);
    expect(sliced.preview.endsWith('line 12')).toBe(true);
    expect(sliced.preview).not.toContain('line 13');
  });
});
