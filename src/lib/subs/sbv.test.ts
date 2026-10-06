import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import broken from '../../../tests/fixtures/broken-sbv.sbv?raw';
import sample from '../../../tests/fixtures/youtube.sbv?raw';
import { sbvToSubtitles as sbvFromIndex } from './index';
import { outputNamesForSbv, sbvFileError, sbvToSubtitles } from './sbv';
import { parseSrt } from './srt';
import { parseVtt } from './vtt';

const PAGE_EXAMPLE = `0:00:01.200,0:00:03.800
Hi, and welcome back.

0:00:04.100,0:00:07.450
Today we're fixing subtitles.
`;

describe('sbvToSubtitles', () => {
  const fetchSpy = vi.fn(() => {
    throw new Error('fetch must not be called');
  });

  beforeEach(() => {
    fetchSpy.mockClear();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('converts the page example to numbered SRT with a comma and padded hours', () => {
    const result = sbvToSubtitles(PAGE_EXAMPLE);
    expect(result.errors).toEqual([]);
    expect(result.span).toEqual({ first: '00:00:01,200', last: '00:00:07,450' });
    expect(result.text).toBe(
      '1\n00:00:01,200 --> 00:00:03,800\nHi, and welcome back.\n\n2\n00:00:04,100 --> 00:00:07,450\nToday we\'re fixing subtitles.\n',
    );
    expect(parseSrt(result.text).cues).toEqual([
      { start: 1200, end: 3800, text: 'Hi, and welcome back.' },
      { start: 4100, end: 7450, text: "Today we're fixing subtitles." },
    ]);
    expect(sbvFromIndex).toBe(sbvToSubtitles);
  });

  it('keeps three cues, a multi-line caption and an hour past 9, to the millisecond', () => {
    const result = sbvToSubtitles(sample);
    expect(result.errors).toEqual([]);
    expect(result.cues).toHaveLength(3);
    expect(result.cues[1]?.text).toBe("Today we're fixing subtitles.\nLine two of the same caption.");
    expect(result.cues[2]).toEqual({
      start: 10 * 3_600_000 + 60_000 + 2_000 + 3,
      end: 10 * 3_600_000 + 60_000 + 5_000 + 250,
      text: 'Still going after ten hours.',
    });
    expect(result.text).toContain('10:01:02,003 --> 10:01:05,250');
    expect(result.text).toContain('00:00:01,200 --> 00:00:03,800');
    expect(parseSrt(result.text).cues).toEqual(result.cues);
  });

  it('writes VTT with a period before the milliseconds when that output is chosen', () => {
    const result = sbvToSubtitles(sample, 'vtt');
    expect(result.errors).toEqual([]);
    expect(result.span).toEqual({ first: '00:00:01.200', last: '10:01:05.250' });
    expect(result.text.startsWith('WEBVTT\n')).toBe(true);
    expect(result.text).toContain('00:00:01.200 --> 00:00:03.800');
    expect(result.text).toContain('10:01:02.003 --> 10:01:05.250');
    expect(result.text).toContain("Today we're fixing subtitles.\nLine two of the same caption.");
    expect(parseVtt(result.text).cues).toEqual(result.cues);
  });

  it('keeps a valid cue and reports a bad time line and a cue that ends first', () => {
    const result = sbvToSubtitles(broken);
    expect(result.cues).toEqual([{ start: 8000, end: 9500, text: 'Kept.' }]);
    expect(result.errors.map((error) => error.message)).toEqual([
      'Block 1 ends before it starts.',
      'Block 2 is not an SBV time line.',
    ]);
  });

  it('reports an empty file and a block with no text', () => {
    expect(sbvToSubtitles('').errors.map((error) => error.message)).toEqual(['No SBV cues were found.']);
    expect(sbvToSubtitles('0:00:01.000,0:00:02.000\n').cues).toEqual([]);
    expect(sbvToSubtitles('0:00:01.000,0:00:02.000\n').errors[0]?.message).toBe('Block 1 has no caption text.');
  });
});

describe('outputNamesForSbv', () => {
  it('replaces .sbv and avoids two files sharing a name', () => {
    expect(sbvFileError('captions.sbv')).toBeNull();
    expect(sbvFileError('captions.SBV')).toBeNull();
    expect(sbvFileError('captions.vtt')).toBe('Use a YouTube .sbv file.');
    expect(outputNamesForSbv(['movie.sbv', 'Movie.SBV', 'notes.txt'], 'srt')).toEqual([
      'movie.srt',
      'Movie (2).srt',
      'subtitles.srt',
    ]);
    expect(outputNamesForSbv(['movie.sbv'], 'vtt')).toEqual(['movie.vtt']);
  });
});
