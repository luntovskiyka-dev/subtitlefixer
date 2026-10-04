import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PLAIN,
  parseClock,
  plainTextToCues,
  readingMs,
  splitUnits,
  timestampedTextToCues,
  wrapUnit,
} from './fromText';
import { serializeSrt } from './srt';
import { serializeVtt } from './vtt';

const PAGE_TEXT = "Hi, and welcome back.\nToday we're fixing subtitles.\nFirst, open your file.\n";
const READING = { cps: 17, minMs: 1000, maxMs: 7000 };

describe('plainTextToCues: the example on /txt-to-srt', () => {
  it('times each line at 17 characters per second, one after another', () => {
    const result = plainTextToCues(PAGE_TEXT, DEFAULT_PLAIN);
    expect(result.error).toBeNull();
    expect(serializeSrt(result.cues)).toBe(
      [
        '1',
        '00:00:00,000 --> 00:00:01,235',
        'Hi, and welcome back.',
        '',
        '2',
        '00:00:01,235 --> 00:00:02,941',
        "Today we're fixing subtitles.",
        '',
        '3',
        '00:00:02,941 --> 00:00:04,235',
        'First, open your file.',
        '',
      ].join('\n'),
    );
  });

  it('writes the same cues as VTT', () => {
    const result = plainTextToCues(PAGE_TEXT, DEFAULT_PLAIN);
    const vtt = serializeVtt(result.cues);
    expect(vtt.startsWith('WEBVTT\n\n')).toBe(true);
    expect(vtt).toContain('00:00:01.235 --> 00:00:02.941');
  });

  it('starts at the start time and adds the gap between subtitles', () => {
    const result = plainTextToCues(PAGE_TEXT, { ...DEFAULT_PLAIN, startMs: 5000, gapMs: 100 });
    expect(result.cues.map((cue) => [cue.start, cue.end])).toEqual([
      [5000, 6235],
      [6335, 8041],
      [8141, 9435],
    ]);
  });

  it('keeps each subtitle between the minimum and maximum duration', () => {
    const long = 'a'.repeat(40);
    const result = plainTextToCues(`Hi.\n${long}`, { ...DEFAULT_PLAIN, cps: 5, minMs: 1000, maxMs: 7000 });
    expect(result.cues.map((cue) => cue.end - cue.start)).toEqual([1000, 7000]);
  });

  it('skips empty lines and asks for text when there is none', () => {
    expect(plainTextToCues('\n  \nOne\n\nTwo\n').cues.map((cue) => cue.text)).toEqual(['One', 'Two']);
    expect(plainTextToCues('  \n ').error).toBe('Add some text first.');
  });
});

describe('plainTextToCues: split by sentences', () => {
  it('makes each sentence its own subtitle, even when several are on one line', () => {
    const result = plainTextToCues('Hi there. How are you? Fine!\nNext line', { ...DEFAULT_PLAIN, split: 'sentences' });
    expect(result.cues.map((cue) => cue.text)).toEqual(['Hi there.', 'How are you?', 'Fine!', 'Next line']);
  });

  it('keeps closing quotes with the sentence and splits CJK punctuation', () => {
    expect(splitUnits('He said "Go." Then left.', 'sentences')).toEqual(['He said "Go."', 'Then left.']);
    expect(splitUnits('你好。再见！', 'sentences')).toEqual(['你好。', '再见！']);
  });
});

describe('plainTextToCues: fit to total duration', () => {
  it('stretches the timings to end at the total, longer lines getting more time', () => {
    const result = plainTextToCues(PAGE_TEXT, { ...DEFAULT_PLAIN, totalMs: 72_000 });
    expect(result.error).toBeNull();
    const cues = result.cues;
    expect(cues[0]?.start).toBe(0);
    expect(cues[2]?.end).toBe(72_000);
    expect(cues[0]?.end).toBe(cues[1]?.start);
    expect(cues.map((cue) => cue.end - cue.start)).toEqual([21_000, 29_000, 22_000]);
  });

  it('keeps the start time and the gaps', () => {
    const result = plainTextToCues(PAGE_TEXT, { ...DEFAULT_PLAIN, startMs: 10_000, gapMs: 1000, totalMs: 84_000 });
    expect(result.cues.map((cue) => [cue.start, cue.end])).toEqual([
      [10_000, 31_000],
      [32_000, 61_000],
      [62_000, 84_000],
    ]);
  });

  it('refuses a total that is not after the start time', () => {
    const result = plainTextToCues(PAGE_TEXT, { ...DEFAULT_PLAIN, startMs: 60_000, totalMs: 60_000 });
    expect(result.cues).toEqual([]);
    expect(result.error).toBe('The total duration must be longer than the start time plus all the gaps.');
  });
});

describe('wrapUnit', () => {
  it('keeps a line of up to 42 characters', () => {
    const line = 'x'.repeat(42);
    expect(wrapUnit(line)).toEqual([line]);
  });

  it('splits a longer line into two balanced lines', () => {
    const unit = 'This sentence is a little longer than forty-two characters.';
    const [chunk, extra] = wrapUnit(unit);
    expect(extra).toBeUndefined();
    const lines = chunk?.split('\n') ?? [];
    expect(lines).toHaveLength(2);
    expect(lines.join(' ')).toBe(unit);
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(42);
    expect(Math.abs((lines[0]?.length ?? 0) - (lines[1]?.length ?? 0))).toBeLessThan(12);
  });

  it('makes more subtitles of up to two lines for a very long line', () => {
    const unit = Array.from({ length: 30 }, (_value, index) => `word${index}`).join(' ');
    const chunks = wrapUnit(unit);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      const lines = chunk.split('\n');
      expect(lines.length).toBeLessThanOrEqual(2);
      for (const line of lines) expect(line.length).toBeLessThanOrEqual(42);
    }
    expect(chunks.join(' ').replace(/\n/g, ' ')).toBe(unit);
  });

  it('breaks a single word longer than 42 characters', () => {
    expect(wrapUnit('y'.repeat(50))).toEqual([`${'y'.repeat(42)}\n${'y'.repeat(8)}`]);
  });

  it('times wrapped subtitles one by one', () => {
    const unit = Array.from({ length: 30 }, (_value, index) => `word${index}`).join(' ');
    const result = plainTextToCues(unit, DEFAULT_PLAIN);
    expect(result.cues.length).toBe(wrapUnit(unit).length);
    expect(result.cues[1]?.start).toBe(result.cues[0]?.end);
  });
});

describe('timestampedTextToCues: the example on /txt-to-srt', () => {
  it('keeps the times; each subtitle ends at the next start, the last one at its reading time', () => {
    const text = "0:00 Hi, and welcome back.\n0:04 Today we're fixing subtitles.\n0:09 First, open your file.\n";
    const result = timestampedTextToCues(text, READING);
    expect(result.error).toBeNull();
    expect(result.warnings).toEqual([]);
    expect(serializeSrt(result.cues)).toBe(
      [
        '1',
        '00:00:00,000 --> 00:00:04,000',
        'Hi, and welcome back.',
        '',
        '2',
        '00:00:04,000 --> 00:00:09,000',
        "Today we're fixing subtitles.",
        '',
        '3',
        '00:00:09,000 --> 00:00:10,294',
        'First, open your file.',
        '',
      ].join('\n'),
    );
  });
});

describe('timestampedTextToCues: recognised styles', () => {
  const expected = [
    [65_000, 70_500, 'One'],
    [70_500, 71_500, 'Two'],
  ];
  const pick = (text: string) =>
    timestampedTextToCues(text, READING).cues.map((cue) => [cue.start, cue.end, cue.text]);

  it('00:01:05 text', () => {
    expect(pick('00:01:05 One\n00:01:10,500 Two')).toEqual(expected);
  });

  it('[00:01:05] text', () => {
    expect(pick('[00:01:05] One\n[00:01:10.500] Two')).toEqual(expected);
  });

  it('1:05 text, as in a YouTube transcript', () => {
    expect(pick('1:05 One\n1:10.5 Two')).toEqual(expected);
  });

  it('YouTube transcript with the timestamp on its own line', () => {
    expect(pick('1:05\nOne\n1:10.500\nTwo\n')).toEqual(expected);
  });

  it('00:01:05,200 --> 00:01:07,000 on its own line, with the text below', () => {
    const text = '00:01:05,200 --> 00:01:07,000\nOne\nmore\n\n00:01:08,000 --> 00:01:09,000\nTwo\n';
    expect(pick(text)).toEqual([
      [65_200, 67_000, 'One more'],
      [68_000, 69_000, 'Two'],
    ]);
  });

  it('drops cue numbers from a pasted SRT file', () => {
    const text = '1\n00:00:01,000 --> 00:00:02,000\nHello\n\n2\n00:00:03,000 --> 00:00:04,000\nWorld\n';
    const result = timestampedTextToCues(text, READING);
    expect(result.cues.map((cue) => cue.text)).toEqual(['Hello', 'World']);
    expect(result.warnings).toEqual([]);
  });

  it('accepts hours and a dash after the time', () => {
    expect(pick('1:00:05 - One\n1:00:10 - Two')).toEqual([
      [3_605_000, 3_610_000, 'One'],
      [3_610_000, 3_611_000, 'Two'],
    ]);
  });
});

describe('timestampedTextToCues: problems', () => {
  it('skips lines before the first timestamp and says so', () => {
    const result = timestampedTextToCues('Transcript\nby me\n0:01 Hello', READING);
    expect(result.cues.map((cue) => cue.text)).toEqual(['Hello']);
    expect(result.warnings).toEqual(['2 lines before the first timestamp were skipped.']);
  });

  it('times a subtitle by reading speed when the next timestamp is not later', () => {
    const result = timestampedTextToCues('0:05 First line\n0:03 Second', READING);
    expect(result.cues.map((cue) => [cue.start, cue.end])).toEqual([
      [5000, 6000],
      [3000, 4000],
    ]);
    expect(result.warnings).toEqual([
      '1 timestamp was not later than the one before it, so that subtitle was timed by reading speed.',
    ]);
  });

  it('lets an empty timestamp end the subtitle before it', () => {
    const result = timestampedTextToCues('0:01 Hello\n0:03\n0:10 Again', READING);
    expect(result.cues.map((cue) => [cue.start, cue.end, cue.text])).toEqual([
      [1000, 3000, 'Hello'],
      [10_000, 11_000, 'Again'],
    ]);
  });

  it('splits a long line into two-line subtitles and shares out its time', () => {
    const long = Array.from({ length: 30 }, (_value, index) => `word${index}`).join(' ');
    const result = timestampedTextToCues(`0:00 ${long}\n0:20 End`, READING);
    const parts = result.cues.slice(0, -1);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts[0]?.start).toBe(0);
    expect(parts[parts.length - 1]?.end).toBe(20_000);
  });

  it('asks for plain text mode when there are no timestamps', () => {
    const result = timestampedTextToCues('Just words\nand more', READING);
    expect(result.cues).toEqual([]);
    expect(result.error).toBe('No timestamps with text were found. Try "Plain text" mode.');
  });
});

describe('helpers', () => {
  it('reads clock values', () => {
    expect(parseClock('00:00:00,000')).toBe(0);
    expect(parseClock('00:01:05,2')).toBe(65_200);
    expect(parseClock('1:05')).toBe(65_000);
    expect(parseClock('01:02:03.004')).toBe(3_723_004);
    expect(parseClock('1:60')).toBeNull();
    expect(parseClock('abc')).toBeNull();
  });

  it('counts every character for the reading time', () => {
    expect(readingMs('Hi, and welcome back.', READING)).toBe(1235);
    expect(readingMs("Today we're fixing subtitles.", READING)).toBe(1706);
    expect(readingMs('First, open your file.', READING)).toBe(1294);
  });
});
