import { afterEach, describe, expect, it, vi } from 'vitest';
import sampleAss from '../../../tests/fixtures/sample.ass?raw';
import sampleSrt from '../../../tests/fixtures/sample.srt?raw';
import sampleSsa from '../../../tests/fixtures/sample.ssa?raw';
import sampleVtt from '../../../tests/fixtures/sample.vtt?raw';
import { parse, serialize, shiftAssText, shiftCues } from './index';
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
      expect(shifted.removed).toBe(0);
      expect(shifted.trimmed).toBe(0);
      expect(shifted.cues.map((cue) => cue.text)).toEqual(parsed.cues.map((cue) => cue.text));
      expect(shifted.cues.map((cue) => cue.style)).toEqual(parsed.cues.map((cue) => cue.style));
      expect(times(shifted.cues)).toEqual(
        parsed.cues.map((cue) => [cue.start + 1500, cue.end + 1500]),
      );

      const again = parse(serialize(shifted.cues, sample.format), sample.format);
      expect(again.errors).toEqual([]);
      expect(times(again.cues)).toEqual(times(shifted.cues));
      expect(again.cues.map((cue) => cue.text)).toEqual(shifted.cues.map((cue) => cue.text));
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('drops a cue that moves fully before zero and trims one that overlaps zero', () => {
    for (const sample of samples) {
      const parsed = parse(sample.text, sample.format);
      expect(parsed.errors).toEqual([]);

      const shifted = shiftCues(parsed.cues, -2000);

      expect(shifted.removed).toBe(0);
      expect(shifted.trimmed).toBe(1);
      expect(times(shifted.cues)).toEqual([
        [0, 1500],
        [2000, 3000],
      ]);
      expect(shifted.cues.map((cue) => cue.text)).toEqual(parsed.cues.map((cue) => cue.text));

      const again = parse(serialize(shifted.cues, sample.format), sample.format);
      expect(again.errors).toEqual([]);
      expect(times(again.cues)).toEqual(times(shifted.cues));
      expect(again.cues.map((cue) => cue.text)).toEqual(parsed.cues.map((cue) => cue.text));
    }

    const gone = [{ start: 1000, end: 1800, text: 'Gone', style: 'Default' }];
    expect(shiftCues(gone, -2000)).toEqual({ cues: [], removed: 1, trimmed: 0 });
    expect(gone[0]?.start).toBe(1000);
  });

  it('trims a cue that overlaps zero and keeps its style', () => {
    expect(shiftCues([{ start: 1000, end: 3500, text: 'Hello', style: 'Karaoke' }], -2000)).toEqual({
      cues: [{ start: 0, end: 1500, text: 'Hello', style: 'Karaoke' }],
      removed: 0,
      trimmed: 1,
    });
  });

  it('drops a cue that ends at zero, including zero-length at 00:00:00,000', () => {
    expect(shiftCues([{ start: 0, end: 0, text: 'Empty' }], 0)).toEqual({
      cues: [],
      removed: 1,
      trimmed: 0,
    });
    expect(shiftCues([{ start: 250, end: 250, text: 'Point' }], -250)).toEqual({
      cues: [],
      removed: 1,
      trimmed: 0,
    });
    expect(shiftCues([{ start: 400, end: 1000, text: 'Edge' }], -1000)).toEqual({
      cues: [],
      removed: 1,
      trimmed: 0,
    });
  });

  it('leaves earlier cues untouched when fromCue is set', () => {
    for (const sample of samples) {
      const parsed = parse(sample.text, sample.format);
      expect(parsed.errors).toEqual([]);

      const shifted = shiftCues(parsed.cues, 1500, 2);

      expect(shifted.removed).toBe(0);
      expect(shifted.trimmed).toBe(0);
      expect(shifted.cues[0]).toEqual(parsed.cues[0]);
      expect(shifted.cues[1]).toEqual({
        ...parsed.cues[1],
        start: (parsed.cues[1]?.start ?? 0) + 1500,
        end: (parsed.cues[1]?.end ?? 0) + 1500,
      });
      expect(shifted.cues[0]).not.toBe(parsed.cues[0]);

      const again = parse(serialize(shifted.cues, sample.format), sample.format);
      expect(again.errors).toEqual([]);
      expect(times(again.cues)).toEqual(times(shifted.cues));
      expect(again.cues.map((cue) => cue.text)).toEqual(parsed.cues.map((cue) => cue.text));
    }
  });

  it('does not count cues before fromCue as trimmed or removed', () => {
    const cues: Cue[] = [
      { start: 100, end: 200, text: 'Stay', style: 'Early' },
      { start: 300, end: 400, text: 'Gone' },
      { start: 800, end: 1600, text: 'Overlap', style: 'Late' },
    ];

    const shifted = shiftCues(cues, -1000, 2);

    expect(shifted).toEqual({
      cues: [
        { start: 100, end: 200, text: 'Stay', style: 'Early' },
        { start: 0, end: 600, text: 'Overlap', style: 'Late' },
      ],
      removed: 1,
      trimmed: 1,
    });
    expect(shifted.cues[0]).not.toBe(cues[0]);
    expect(cues[0]?.start).toBe(100);
    expect(cues[1]?.start).toBe(300);
  });

  it('shifts from the third cue onward when fromCue is 3', () => {
    const cues: Cue[] = [
      { start: 1000, end: 2000, text: 'One' },
      { start: 3000, end: 4000, text: 'Two', style: 'Default' },
      { start: 5000, end: 6000, text: 'Three', style: 'Karaoke' },
    ];

    expect(shiftCues(cues, 500, 3)).toEqual({
      cues: [
        { start: 1000, end: 2000, text: 'One' },
        { start: 3000, end: 4000, text: 'Two', style: 'Default' },
        { start: 5500, end: 6500, text: 'Three', style: 'Karaoke' },
      ],
      removed: 0,
      trimmed: 0,
    });
    expect(cues[2]?.start).toBe(5000);
  });

  it('shifts every cue when fromCue is omitted or below 1', () => {
    const parsed = parse(sampleSrt, 'srt');
    const all = shiftCues(parsed.cues, 1000);
    expect(shiftCues(parsed.cues, 1000, 0)).toEqual(all);
    expect(shiftCues(parsed.cues, 1000, -2)).toEqual(all);
    expect(times(all.cues)).toEqual([
      [2000, 4500],
      [5000, 6000],
    ]);
    expect(all.removed).toBe(0);
    expect(all.trimmed).toBe(0);
  });

  it('numbers kept SRT cues from 1 and omits a zero-length cue', () => {
    const result = shiftCues(
      [
        { start: 100, end: 400, text: 'Gone' },
        { start: 1000, end: 1000, text: 'Zero' },
        { start: 800, end: 2200, text: 'Trim' },
        { start: 3000, end: 4000, text: 'Second' },
        { start: 5000, end: 6000, text: 'Third' },
      ],
      -1000,
    );

    expect(result.removed).toBe(2);
    expect(result.trimmed).toBe(1);
    expect(serialize(result.cues, 'srt')).toBe(
      [
        '1',
        '00:00:00,000 --> 00:00:01,200',
        'Trim',
        '',
        '2',
        '00:00:02,000 --> 00:00:03,000',
        'Second',
        '',
        '3',
        '00:00:04,000 --> 00:00:05,000',
        'Third',
        '',
      ].join('\n'),
    );
  });
});

describe('shiftAssText', () => {
  it('changes only Dialogue times and keeps the original header, styles, and comments', () => {
    const text = shiftAssText(sampleAss, 1500);
    const expected = sampleAss
      .replace('0:00:01.00,0:00:03.50', '0:00:02.50,0:00:05.00')
      .replace('0:00:04.00,0:00:05.00', '0:00:05.50,0:00:06.50');
    expect(text).toBe(expected);
    expect(text).toContain('{\\k20}Hello');
    expect(text).toContain('Line one\\NLine two');
    expect(text).toContain('Comment: 0,0:00:06.00,0:00:07.00,Default,,0,0,0,,skip me');
  });

  it('removes a Dialogue line that lands before zero and trims one that overlaps', () => {
    const text = shiftAssText(sampleAss, -4500);
    expect(text).not.toContain('{\\k20}Hello');
    expect(text).toContain(
      'Dialogue: 0,0:00:00.00,0:00:00.50,Default,,0,0,0,,Line one\\NLine two',
    );
    expect(text.startsWith(sampleAss.slice(0, sampleAss.indexOf('Dialogue:')))).toBe(true);
    expect(text).toContain('Comment: 0,0:00:06.00,0:00:07.00,Default,,0,0,0,,skip me');
    const shifted = shiftCues(parse(sampleAss, 'ass').cues, -4500);
    expect(shifted).toEqual({
      cues: [{ start: 0, end: 500, text: 'Line one\nLine two', style: 'Default' }],
      removed: 1,
      trimmed: 1,
    });
  });

  it('leaves Dialogue lines before fromCue byte-for-byte', () => {
    const text = shiftAssText(sampleAss, 1500, 2);
    expect(text).toContain('Dialogue: 0,0:00:01.00,0:00:03.50,Karaoke,,0,0,0,,{\\k20}Hello');
    expect(text).toContain(
      'Dialogue: 0,0:00:05.50,0:00:06.50,Default,,0,0,0,,Line one\\NLine two',
    );
  });

  it('keeps an SSA style line and the Marked field', () => {
    const text = shiftAssText(sampleSsa, 1500);
    expect(text).toContain('[V4 Styles]');
    expect(text).toContain(
      'Dialogue: Marked=0,0:00:02.50,0:00:05.00,Title,,0000,0000,0000,,Hello',
    );
  });

  it('leaves a Dialogue line that fails to parse and still reports the error', () => {
    const input = [
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      'Dialogue: 0,0:00:01.00,0:00:02.00,Default,,0,0,0,,Good',
      'Dialogue: 0,not-a-time,0:00:02.00,Default,,0,0,0,,Bad',
      'Dialogue: 0,0:00:03.00,0:00:04.00,Keep,,0,0,0,,Still',
      '',
    ].join('\n');

    const text = shiftAssText(input, 1000);
    expect(text).toContain('Dialogue: 0,0:00:02.00,0:00:03.00,Default,,0,0,0,,Good');
    expect(text).toContain('Dialogue: 0,not-a-time,0:00:02.00,Default,,0,0,0,,Bad');
    expect(text).toContain('Dialogue: 0,0:00:04.00,0:00:05.00,Keep,,0,0,0,,Still');

    const parsed = parse(input, 'ass');
    expect(parsed.errors).toHaveLength(1);
    expect(parsed.errors[0]?.message).toMatch(/invalid timestamp/i);
    expect(shiftCues(parsed.cues, 1000, 2).cues[0]?.text).toBe('Good');
  });

  it('keeps CRLF line endings when a Dialogue line is removed', () => {
    const input = [
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      'Dialogue: 0,0:00:01.00,0:00:01.20,Default,,0,0,0,,Gone',
      'Comment: 0,0:00:06.00,0:00:07.00,Default,,0,0,0,,skip me',
      'Dialogue: 0,0:00:04.00,0:00:05.00,Default,,0,0,0,,Kept',
      '',
    ].join('\r\n');

    const text = shiftAssText(input, -2000);
    expect(text).toBe(
      [
        '[Events]',
        'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
        'Comment: 0,0:00:06.00,0:00:07.00,Default,,0,0,0,,skip me',
        'Dialogue: 0,0:00:02.00,0:00:03.00,Default,,0,0,0,,Kept',
        '',
      ].join('\r\n'),
    );
  });
});
