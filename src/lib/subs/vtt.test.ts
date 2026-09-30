import { describe, expect, it } from 'vitest';
import sample from '../../../tests/fixtures/sample.vtt?raw';
import { parseVtt, serializeVtt } from './vtt';

describe('parseVtt', () => {
  it('parses cues and skips NOTE, STYLE, and REGION without errors', () => {
    const result = parseVtt(sample);
    expect(result.errors).toEqual([]);
    expect(result.cues).toEqual([
      { start: 1000, end: 3500, text: 'Hello' },
      { start: 4000, end: 5000, text: 'Line one\nLine two' },
    ]);
  });

  it('reads a header note, cue settings, and a short timestamp', () => {
    const result = parseVtt(`WEBVTT - English

NOTE inline note

00:01.500 --> 00:02.000 align:start position:0%
Short

00:00:01.5 --> 00:00:02.25
Fraction
`);
    expect(result.errors).toEqual([]);
    expect(result.cues).toEqual([
      { start: 1500, end: 2000, text: 'Short' },
      { start: 1500, end: 2250, text: 'Fraction' },
    ]);
  });

  it('reports a missing header and still keeps valid cues', () => {
    const result = parseVtt('00:00:01.000 --> 00:00:02.000\nHello\n');
    expect(result.cues).toEqual([{ start: 1000, end: 2000, text: 'Hello' }]);
    expect(result.errors).toEqual([{ block: 1, message: 'Missing WEBVTT header.' }]);
  });

  it('keeps neighbors when one cue ends before it starts', () => {
    const result = parseVtt(`WEBVTT

00:00:01.000 --> 00:00:02.000
Good

00:00:05.000 --> 00:00:01.000
Backwards

00:00:03.000 --> 00:00:04.000
Also good
`);
    expect(result.cues.map((cue) => cue.text)).toEqual(['Good', 'Also good']);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.block).toBe(3);
    expect(result.errors[0]?.message).toMatch(/before/i);
  });

  it('treats a header-only file as no cues and no errors', () => {
    expect(parseVtt('WEBVTT\n')).toEqual({ cues: [], errors: [] });
  });
});

describe('serializeVtt', () => {
  it('writes a WEBVTT header and dot timestamps', () => {
    const text = serializeVtt([
      { start: 1000, end: 3500, text: 'Hello' },
      { start: 4000, end: 5000, text: 'Line one\nLine two' },
    ]);
    expect(text.startsWith('WEBVTT\n')).toBe(true);
    expect(text).toContain('00:00:01.000 --> 00:00:03.500\nHello');
    expect(text).toContain('00:00:04.000 --> 00:00:05.000\nLine one\nLine two');
    expect(parseVtt(text)).toEqual({
      cues: [
        { start: 1000, end: 3500, text: 'Hello' },
        { start: 4000, end: 5000, text: 'Line one\nLine two' },
      ],
      errors: [],
    });
  });

  it('returns an empty string for no cues', () => {
    expect(serializeVtt([])).toBe('');
  });
});
