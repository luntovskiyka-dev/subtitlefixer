import { describe, expect, it } from 'vitest';
import sample from '../../../tests/fixtures/sample.srt?raw';
import { parse, serialize } from './index';

describe('SRT → VTT → SRT', () => {
  it('keeps the cue count, start, and end from the sample file', () => {
    const original = parse(sample, 'srt');
    expect(original.errors).toEqual([]);

    const fromVtt = parse(serialize(original.cues, 'vtt'), 'vtt');
    expect(fromVtt.errors).toEqual([]);

    const roundTrip = parse(serialize(fromVtt.cues, 'srt'), 'srt');
    expect(roundTrip.errors).toEqual([]);
    expect(roundTrip.cues).toHaveLength(original.cues.length);
    expect(roundTrip.cues.map((cue) => cue.start)).toEqual(original.cues.map((cue) => cue.start));
    expect(roundTrip.cues.map((cue) => cue.end)).toEqual(original.cues.map((cue) => cue.end));
  });

  it('keeps millisecond precision, including a multiline cue', () => {
    const source = `1
00:00:01,001 --> 00:00:03,500
Hello

2
01:02:03,004 --> 01:02:05,009
Line one
Line two
`;
    const original = parse(source, 'srt');
    const fromVtt = parse(serialize(original.cues, 'vtt'), 'vtt');
    const roundTrip = parse(serialize(fromVtt.cues, 'srt'), 'srt');

    expect(roundTrip.cues).toEqual(original.cues);
    expect(roundTrip.cues.map((cue) => [cue.start, cue.end])).toEqual([
      [1001, 3500],
      [3_723_004, 3_725_009],
    ]);
  });
});
