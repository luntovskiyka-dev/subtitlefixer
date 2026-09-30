import { afterEach, describe, expect, it, vi } from 'vitest';
import sampleAss from '../../../tests/fixtures/sample.ass?raw';
import sampleSrt from '../../../tests/fixtures/sample.srt?raw';
import sampleVtt from '../../../tests/fixtures/sample.vtt?raw';
import { parse, serialize, shiftCues } from './index';
import type { Cue, SubtitleFormat } from './types';

const samples: { format: SubtitleFormat; text: string }[] = [
  { format: 'srt', text: sampleSrt },
  { format: 'vtt', text: sampleVtt },
  { format: 'ass', text: sampleAss },
];

function times(cues: readonly Cue[]): [number, number][] {
  return cues.map((cue) => [cue.start, cue.end]);
}

describe('shiftCues', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds a positive offset and round-trips each sample without fetch', () => {
    const fetchSpy = vi.fn(() => {
      throw new Error('fetch must not be called');
    });
    vi.stubGlobal('fetch', fetchSpy);

    for (const sample of samples) {
      const parsed = parse(sample.text, sample.format);
      expect(parsed.errors).toEqual([]);
      const original = parsed.cues.map((cue) => ({ ...cue }));

      const shifted = shiftCues(parsed.cues, 1500);

      expect(parsed.cues).toEqual(original);
      expect(shifted.map((cue) => cue.text)).toEqual(parsed.cues.map((cue) => cue.text));
      expect(shifted.map((cue) => cue.style)).toEqual(parsed.cues.map((cue) => cue.style));
      expect(times(shifted)).toEqual(parsed.cues.map((cue) => [cue.start + 1500, cue.end + 1500]));

      const again = parse(serialize(shifted, sample.format), sample.format);
      expect(again.errors).toEqual([]);
      expect(times(again.cues)).toEqual(times(shifted));
      expect(again.cues.map((cue) => cue.text)).toEqual(shifted.map((cue) => cue.text));
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('clamps a negative offset that crosses zero', () => {
    for (const sample of samples) {
      const parsed = parse(sample.text, sample.format);
      expect(parsed.errors).toEqual([]);

      const shifted = shiftCues(parsed.cues, -2000);

      expect(times(shifted)).toEqual([
        [0, 1500],
        [2000, 3000],
      ]);
      expect(shifted.map((cue) => cue.text)).toEqual(parsed.cues.map((cue) => cue.text));

      const again = parse(serialize(shifted, sample.format), sample.format);
      expect(again.errors).toEqual([]);
      expect(times(again.cues)).toEqual(times(shifted));
      expect(again.cues.map((cue) => cue.text)).toEqual(parsed.cues.map((cue) => cue.text));
    }
  });

  it('leaves earlier cues untouched when fromCue is set', () => {
    for (const sample of samples) {
      const parsed = parse(sample.text, sample.format);
      expect(parsed.errors).toEqual([]);

      const shifted = shiftCues(parsed.cues, 1500, 2);

      expect(shifted[0]).toEqual(parsed.cues[0]);
      expect(shifted[1]).toEqual({
        ...parsed.cues[1],
        start: (parsed.cues[1]?.start ?? 0) + 1500,
        end: (parsed.cues[1]?.end ?? 0) + 1500,
      });
      expect(shifted[0]).not.toBe(parsed.cues[0]);

      const again = parse(serialize(shifted, sample.format), sample.format);
      expect(again.errors).toEqual([]);
      expect(times(again.cues)).toEqual(times(shifted));
      expect(again.cues.map((cue) => cue.text)).toEqual(parsed.cues.map((cue) => cue.text));
    }
  });

  it('shifts from the third cue onward when fromCue is 3', () => {
    const cues: Cue[] = [
      { start: 1000, end: 2000, text: 'One' },
      { start: 3000, end: 4000, text: 'Two', style: 'Default' },
      { start: 5000, end: 6000, text: 'Three', style: 'Karaoke' },
    ];

    expect(shiftCues(cues, 500, 3)).toEqual([
      { start: 1000, end: 2000, text: 'One' },
      { start: 3000, end: 4000, text: 'Two', style: 'Default' },
      { start: 5500, end: 6500, text: 'Three', style: 'Karaoke' },
    ]);
    expect(cues[2]?.start).toBe(5000);
  });

  it('shifts every cue when fromCue is omitted or below 1', () => {
    const parsed = parse(sampleSrt, 'srt');
    const all = shiftCues(parsed.cues, 1000);
    expect(shiftCues(parsed.cues, 1000, 0)).toEqual(all);
    expect(shiftCues(parsed.cues, 1000, -2)).toEqual(all);
    expect(times(all)).toEqual([
      [2000, 4500],
      [5000, 6000],
    ]);
  });

  it('sets the end to the start when the clamped end is earlier', () => {
    expect(shiftCues([{ start: 100, end: 40, text: 'Backwards', style: 'Default' }], -50)).toEqual([
      { start: 50, end: 50, text: 'Backwards', style: 'Default' },
    ]);
  });
});
