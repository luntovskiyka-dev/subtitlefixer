import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import brokenAss from '../../../tests/fixtures/broken-block.ass?raw';
import sampleAss from '../../../tests/fixtures/sample.ass?raw';
import { assToSrt, parse } from './index';

function dialogue(start: string, end: string, text: string, style = 'Default'): string {
  return `Dialogue: 0,${start},${end},${style},,0,0,0,,${text}`;
}

describe('assToSrt', () => {
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

  it('drops the karaoke tag from sample.ass and keeps both cues', () => {
    const result = assToSrt(sampleAss);
    expect(result.errors).toEqual([]);

    const parsed = parse(result.text, 'srt');
    expect(parsed.errors).toEqual([]);
    expect(parsed.cues).toEqual([
      { start: 1000, end: 3500, text: 'Hello' },
      { start: 4000, end: 5000, text: 'Line one\nLine two' },
    ]);
    expect(result.text).not.toContain('{\\k20}');
    expect(result.text).not.toContain('\\N');
    expect(parsed.cues[1]?.text).toContain('\n');
  });

  it('collapses two Dialogue lines with the same times and the same words', () => {
    const result = assToSrt(
      [
        dialogue('0:00:01.00', '0:00:03.00', 'Hello', 'Default'),
        dialogue('0:00:01.00', '0:00:03.00', 'Hello', 'Alt'),
      ].join('\n'),
    );

    expect(result.errors).toEqual([]);
    const cues = parse(result.text, 'srt').cues;
    expect(cues).toEqual([{ start: 1000, end: 3000, text: 'Hello' }]);
    expect(cues[0]).not.toHaveProperty('style');
  });

  it('keeps the longer line when a karaoke fragment shares times with a full line', () => {
    const result = assToSrt(
      [
        dialogue('0:00:01.00', '0:00:04.00', '{\\k20}Hel', 'Karaoke'),
        dialogue('0:00:01.00', '0:00:04.00', '{\\k20}Hello there', 'Karaoke'),
      ].join('\n'),
    );

    expect(result.errors).toEqual([]);
    expect(parse(result.text, 'srt').cues).toEqual([
      { start: 1000, end: 4000, text: 'Hello there' },
    ]);
  });

  it('keeps the last text when two different lines have the same length', () => {
    const result = assToSrt(
      [
        dialogue('0:00:01.00', '0:00:02.00', 'AB'),
        dialogue('0:00:01.00', '0:00:02.00', 'CD'),
      ].join('\n'),
    );

    expect(parse(result.text, 'srt').cues).toEqual([{ start: 1000, end: 2000, text: 'CD' }]);
  });

  it('turns {\\i1} and {\\b1} into HTML and closes a tag left open', () => {
    const result = assToSrt(
      [
        dialogue('0:00:01.00', '0:00:02.00', '{\\i1}hello{\\i0}'),
        dialogue('0:00:03.00', '0:00:04.00', '{\\i1}hello'),
        dialogue('0:00:05.00', '0:00:06.00', '{\\b1}strong{\\b0}'),
        dialogue('0:00:07.00', '0:00:08.00', '{\\b1}strong'),
        dialogue('0:00:09.00', '0:00:10.00', '{\\i1\\b1}both'),
        dialogue('0:00:11.00', '0:00:12.00', '{\\an8\\i1\\k20}mixed'),
        dialogue('0:00:13.00', '0:00:14.00', '{\\I1}one{\\I0}{\\B1}two{\\B0}'),
        dialogue('0:00:15.00', '0:00:16.00', '{\\i0}plain'),
      ].join('\n'),
    );

    expect(parse(result.text, 'srt').cues).toEqual([
      { start: 1000, end: 2000, text: '<i>hello</i>' },
      { start: 3000, end: 4000, text: '<i>hello</i>' },
      { start: 5000, end: 6000, text: '<b>strong</b>' },
      { start: 7000, end: 8000, text: '<b>strong</b>' },
      { start: 9000, end: 10000, text: '<i><b>both</b></i>' },
      { start: 11000, end: 12000, text: '<i>mixed</i>' },
      { start: 13000, end: 14000, text: '<i>one</i><b>two</b>' },
      { start: 15000, end: 16000, text: 'plain' },
    ]);
  });

  it('drops a drawing cue and keeps a later spoken line', () => {
    const result = assToSrt(
      [
        dialogue('0:00:01.00', '0:00:02.00', '{\\p1}m 0 0 l 100 0 100 100'),
        dialogue('0:00:02.00', '0:00:03.00', '{\\p2}m 0 0 l 10 10'),
        dialogue('0:00:03.00', '0:00:04.00', '{\\p0}Still spoken'),
        dialogue('0:00:05.00', '0:00:06.00', 'Spoken line'),
      ].join('\n'),
    );

    const cues = parse(result.text, 'srt').cues;
    expect(cues).toEqual([
      { start: 3000, end: 4000, text: 'Still spoken' },
      { start: 5000, end: 6000, text: 'Spoken line' },
    ]);
    expect(result.text).not.toContain('m 0 0');
  });

  it('turns a soft \\\\n into a newline', () => {
    const result = assToSrt(dialogue('0:00:01.00', '0:00:02.00', 'Line one\\nLine two'));
    expect(parse(result.text, 'srt').cues).toEqual([
      { start: 1000, end: 2000, text: 'Line one\nLine two' },
    ]);
  });

  it('collapses two lines that match only after tag cleanup', () => {
    const result = assToSrt(
      [
        dialogue('0:00:01.00', '0:00:03.00', '{\\i1}Hello{\\i0}', 'Default'),
        dialogue('0:00:01.00', '0:00:03.00', '{\\k20\\i1}Hello{\\i0}', 'Karaoke'),
      ].join('\n'),
    );

    const cues = parse(result.text, 'srt').cues;
    expect(cues).toEqual([{ start: 1000, end: 3000, text: '<i>Hello</i>' }]);
    expect(cues[0]).not.toHaveProperty('style');
  });

  it('turns \\h into a space, trims each line, and drops an empty text', () => {
    const result = assToSrt(
      [
        dialogue('0:00:01.00', '0:00:02.00', '{\\k20}'),
        dialogue('0:00:03.00', '0:00:04.00', '  {\\an8}Hello\\hthere  \\N  Next  '),
      ].join('\n'),
    );

    expect(parse(result.text, 'srt').cues).toEqual([
      { start: 3000, end: 4000, text: 'Hello there\nNext' },
    ]);
  });

  it('returns the good cues and the parser error from a broken Dialogue', () => {
    const original = parse(brokenAss, 'ass');
    expect(original.cues.length).toBeGreaterThan(0);
    expect(original.errors.length).toBeGreaterThan(0);

    const result = assToSrt(brokenAss);

    expect(result.errors).toEqual(original.errors);
    expect(parse(result.text, 'srt').cues).toEqual([
      { start: 1000, end: 2000, text: 'Good' },
      { start: 3000, end: 4000, text: 'Still here' },
    ]);
  });
});
