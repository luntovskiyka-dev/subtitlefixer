import { afterEach, describe, expect, it, vi } from 'vitest';
import sampleAss from '../../../tests/fixtures/sample.ass?raw';
import { FPS_23_976, scaleCues, scaleSubtitleFile, syncCues, syncSubtitleFile } from './index';
import type { Cue } from './types';

function stubFetch(): ReturnType<typeof vi.fn> {
  const fetchSpy = vi.fn(() => {
    throw new Error('fetch must not be called');
  });
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

describe('syncCues', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps the first start to 0 and the last start to 11000 without fetch', () => {
    const fetchSpy = stubFetch();
    const cues: Cue[] = [
      { start: 0, end: 1000, text: 'Open' },
      { start: 5000, end: 6000, text: 'Middle', style: 'Default' },
      { start: 10000, end: 12000, text: 'Close' },
    ];
    const original = cues.map((cue) => ({ ...cue }));

    const result = syncCues(cues, 0, 0, 10000, 11000);

    expect(result.removed).toBe(0);
    expect(result.trimmed).toBe(0);
    expect(result.cues.map((cue) => cue.start)).toEqual([0, 5500, 11000]);
    expect(result.cues[1]?.start).toBe(5500);
    expect(result.cues.map((cue) => cue.text)).toEqual(['Open', 'Middle', 'Close']);
    expect(result.cues[1]).toEqual({ start: 5500, end: 6600, text: 'Middle', style: 'Default' });
    expect(cues).toEqual(original);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('throws when the two start times are equal and does not produce cues', () => {
    const fetchSpy = stubFetch();
    const cues: Cue[] = [
      { start: 1000, end: 2000, text: 'A' },
      { start: 1000, end: 3000, text: 'B' },
    ];

    expect(() => syncCues(cues, 1000, 0, 1000, 5000)).toThrow(Error);
    expect(cues).toEqual([
      { start: 1000, end: 2000, text: 'A' },
      { start: 1000, end: 3000, text: 'B' },
    ]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('removes a cue that ends at or before zero and trims a negative start', () => {
    const cues: Cue[] = [
      { start: 0, end: 400, text: 'Gone' },
      { start: 500, end: 1500, text: 'Clip', style: 'A' },
      { start: 2000, end: 2500, text: 'Stay' },
    ];

    expect(syncCues(cues, 0, -1000, 10000, 9000)).toEqual({
      cues: [
        { start: 0, end: 500, text: 'Clip', style: 'A' },
        { start: 1000, end: 1500, text: 'Stay' },
      ],
      removed: 1,
      trimmed: 1,
    });
    expect(cues[0]?.start).toBe(0);
  });
});

describe('scaleCues', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps 25 → 23.976 within 50 ms of the 24000/1001 fraction across two hours', () => {
    const fetchSpy = stubFetch();
    expect(FPS_23_976).toBe(24000 / 1001);

    const twoHours = 2 * 60 * 60 * 1000;
    const cues: Cue[] = [];
    for (let start = 0; start <= twoHours; start += 60_000) {
      cues.push({ start, end: start + 2_000, text: `At ${start}` });
    }

    const result = scaleCues(cues, 25, FPS_23_976);
    const scale = 25 / (24000 / 1001);

    expect(result.cues).toHaveLength(cues.length);
    expect(result.removed).toBe(0);
    expect(result.trimmed).toBe(0);
    result.cues.forEach((cue, index) => {
      const source = cues[index];
      if (!source) return;
      for (const [next, previous] of [
        [cue.start, source.start],
        [cue.end, source.end],
      ] as const) {
        expect(Math.abs(next - previous * scale)).toBeLessThanOrEqual(50);
        expect(next).toBe(Math.round(previous * (25 / (24000 / 1001))));
      }
      expect(cue.text).toBe(source.text);
    });
    expect(cues[0]?.start).toBe(0);
    expect(cues.at(-1)?.start).toBe(twoHours);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('subtitle file output', () => {
  it('keeps an ASS header, styles, comments, and dialogue text', () => {
    const written = scaleSubtitleFile(sampleAss, 'ass', 2, 1);
    expect(written.text.startsWith(sampleAss.slice(0, sampleAss.indexOf('Dialogue:')))).toBe(true);
    expect(written.text).toContain('Comment: 0,0:00:06.00,0:00:07.00,Default,,0,0,0,,skip me');
    expect(written.text).toContain('{\\k20}Hello');
    expect(written.text).toContain('Line one\\NLine two');
    expect(written.text).toContain('Dialogue: 0,0:00:02.00,0:00:07.00,Karaoke,,0,0,0,,{\\k20}Hello');
    expect(written.text).toContain(
      'Dialogue: 0,0:00:08.00,0:00:10.00,Default,,0,0,0,,Line one\\NLine two',
    );
  });

  it('numbers kept SRT cues in array order', () => {
    const input = [
      '9',
      '00:00:00,000 --> 00:00:00,400',
      'Gone',
      '',
      '4',
      '00:00:00,500 --> 00:00:01,500',
      'Clip',
      '',
      '8',
      '00:00:02,000 --> 00:00:02,500',
      'Stay',
      '',
    ].join('\n');

    const written = syncSubtitleFile(input, 'srt', 0, -1000, 10000, 9000);
    expect(written.removed).toBe(1);
    expect(written.trimmed).toBe(1);
    expect(written.text).toBe(
      ['1', '00:00:00,000 --> 00:00:00,500', 'Clip', '', '2', '00:00:01,000 --> 00:00:01,500', 'Stay', ''].join(
        '\n',
      ),
    );
  });

  it('does not write a file when the two start times are equal', () => {
    expect(() => syncSubtitleFile('1\n00:00:01,000 --> 00:00:02,000\nHi\n', 'srt', 1000, 0, 1000, 2000)).toThrow(
      Error,
    );
  });
});
