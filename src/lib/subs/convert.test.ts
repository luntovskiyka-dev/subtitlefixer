import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import brokenSrt from '../../../tests/fixtures/broken-block.srt?raw';
import sampleSrt from '../../../tests/fixtures/sample.srt?raw';
import sampleVtt from '../../../tests/fixtures/sample.vtt?raw';
import { convertSubtitle, parse } from './index';
import type { Cue } from './types';

function cueFields(cues: readonly Cue[]): { start: number; end: number; text: string }[] {
  return cues.map((cue) => ({ start: cue.start, end: cue.end, text: cue.text }));
}

describe('convertSubtitle', () => {
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

  it('keeps cue start, end, and text through SRT to VTT to SRT', () => {
    const original = parse(sampleSrt, 'srt');
    expect(original.errors).toEqual([]);

    const asVtt = convertSubtitle(sampleSrt, 'srt', 'vtt');
    expect(asVtt.errors).toEqual([]);

    const back = convertSubtitle(asVtt.text, 'vtt', 'srt');
    expect(back.errors).toEqual([]);
    expect(cueFields(parse(back.text, 'srt').cues)).toEqual(cueFields(original.cues));
  });

  it('keeps cue start, end, and text through VTT to SRT to VTT', () => {
    const original = parse(sampleVtt, 'vtt');
    expect(original.errors).toEqual([]);

    const asSrt = convertSubtitle(sampleVtt, 'vtt', 'srt');
    expect(asSrt.errors).toEqual([]);

    const back = convertSubtitle(asSrt.text, 'srt', 'vtt');
    expect(back.errors).toEqual([]);
    expect(cueFields(parse(back.text, 'vtt').cues)).toEqual(cueFields(original.cues));
  });

  it('returns the good cues and the original errors from a broken block', () => {
    const original = parse(brokenSrt, 'srt');
    expect(original.cues.length).toBeGreaterThan(0);
    expect(original.errors.length).toBeGreaterThan(0);

    const converted = convertSubtitle(brokenSrt, 'srt', 'vtt');

    expect(converted.errors).toEqual(original.errors);
    expect(cueFields(parse(converted.text, 'vtt').cues)).toEqual(cueFields(original.cues));
  });
});
