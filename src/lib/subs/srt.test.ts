import { describe, expect, it } from 'vitest';
import broken from '../../../tests/fixtures/broken-block.srt?raw';
import multiline from '../../../tests/fixtures/multiline.srt?raw';
import sample from '../../../tests/fixtures/sample.srt?raw';
import { parseSrt, serializeSrt } from './srt';

describe('parseSrt', () => {
  it('parses the sample file into cues', () => {
    const result = parseSrt(sample);
    expect(result.errors).toEqual([]);
    expect(result.cues).toEqual([
      { start: 1000, end: 3500, text: 'Hello' },
      { start: 4000, end: 5000, text: 'Line one\nLine two' },
    ]);
  });

  it('parses multiline SRT text', () => {
    const result = parseSrt(multiline);
    expect(result.errors).toEqual([]);
    expect(result.cues).toEqual([
      { start: 10_250, end: 12_000, text: 'Line one\nLine two\nLine three' },
    ]);
  });

  it('keeps valid blocks when one block in a fixture ends before it starts', () => {
    const result = parseSrt(broken);
    expect(result.cues).toEqual([
      { start: 1000, end: 3500, text: 'Hello' },
      { start: 6000, end: 7500, text: 'Still here' },
    ]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.block).toBe(2);
    expect(result.errors[0]?.message).toMatch(/before/i);
  });

  it('keeps neighbors when a block is not a cue', () => {
    const result = parseSrt(`1
00:00:01,000 --> 00:00:02,000
Good

not a cue

3
00:00:03,000 --> 00:00:04,000
Also good
`);
    expect(result.cues.map((cue) => cue.text)).toEqual(['Good', 'Also good']);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.block).toBe(2);
  });

  it('accepts a BOM, CR/LF, and positioning after the timestamp', () => {
    const result = parseSrt(
      '\uFEFF1\r\n00:00:01,000 --> 00:00:03,500 X1:52 X2:303 Y1:392 Y2:429\r\nHello\r\n',
    );
    expect(result.errors).toEqual([]);
    expect(result.cues).toEqual([{ start: 1000, end: 3500, text: 'Hello' }]);
  });

  it('accepts a cue without a cue number', () => {
    const result = parseSrt(`00:00:01,000 --> 00:00:02,000
No number

00:00:03,000 --> 00:00:04,000
Still no number
`);
    expect(result.errors).toEqual([]);
    expect(result.cues).toEqual([
      { start: 1000, end: 2000, text: 'No number' },
      { start: 3000, end: 4000, text: 'Still no number' },
    ]);
  });

  it('accepts numbered and unnumbered cues in the same file', () => {
    const result = parseSrt(`1
00:00:01,000 --> 00:00:02,000
Numbered

00:00:03,000 --> 00:00:04,000
Unnumbered
`);
    expect(result.errors).toEqual([]);
    expect(result.cues.map((cue) => cue.text)).toEqual(['Numbered', 'Unnumbered']);
  });

  it('keeps a cue whose end equals its start', () => {
    const result = parseSrt('1\n00:00:01,000 --> 00:00:01,000\nHold\n');
    expect(result.errors).toEqual([]);
    expect(result.cues).toEqual([{ start: 1000, end: 1000, text: 'Hold' }]);
  });
});

describe('serializeSrt', () => {
  it('numbers cues and writes comma timestamps', () => {
    const text = serializeSrt([
      { start: 1000, end: 3500, text: 'Hello' },
      { start: 4000, end: 5000, text: 'Line one\nLine two' },
    ]);
    expect(text).toBe(sample);
    expect(parseSrt(text).cues).toEqual(parseSrt(sample).cues);
  });

  it('round-trips an empty cue text', () => {
    const cues = [{ start: 0, end: 1000, text: '' }];
    expect(parseSrt(serializeSrt(cues))).toEqual({ cues, errors: [] });
  });

  it('returns an empty string for no cues', () => {
    expect(serializeSrt([])).toBe('');
  });
});
