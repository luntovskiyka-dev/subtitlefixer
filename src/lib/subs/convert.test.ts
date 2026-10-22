import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import brokenSrt from '../../../tests/fixtures/broken-block.srt?raw';
import sampleSrt from '../../../tests/fixtures/sample.srt?raw';
import sampleVtt from '../../../tests/fixtures/sample.vtt?raw';
import youtubeVtt from '../../../tests/fixtures/youtube-auto.vtt?raw';
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

describe('convertSubtitle: VTT to SRT cleans the text', () => {
  it('matches the example on /vtt-to-srt', () => {
    const vtt = [
      'WEBVTT',
      '',
      'NOTE Exported from the web player',
      '',
      '00:00:02.500 --> 00:00:05.000 align:start',
      'Good afternoon, everyone.',
      '',
      '00:00:05.300 --> 00:00:08.960',
      "<v Anna>Let's start with the numbers.",
      '',
    ].join('\n');
    expect(convertSubtitle(vtt, 'vtt', 'srt')).toEqual({
      text: [
        '1',
        '00:00:02,500 --> 00:00:05,000',
        'Good afternoon, everyone.',
        '',
        '2',
        '00:00:05,300 --> 00:00:08,960',
        "Anna: Let's start with the numbers.",
        '',
      ].join('\n'),
      errors: [],
    });
  });

  it('turns YouTube automatic captions into clean SRT: no lost text, no <c> tags, no word timestamps', () => {
    const result = convertSubtitle(youtubeVtt, 'vtt', 'srt');
    expect(result.errors).toEqual([]);
    expect(result.text).toBe(
      [
        '1',
        '00:00:00,160 --> 00:00:02,270',
        '[Music]',
        '',
        '2',
        '00:00:02,270 --> 00:00:02,280',
        '[Music]',
        '',
        '3',
        '00:00:02,280 --> 00:00:04,789',
        '[Music]',
        'hey everyone welcome back to the',
        '',
        '4',
        '00:00:04,789 --> 00:00:04,799',
        'hey everyone welcome back to the',
        '',
        '5',
        '00:00:04,799 --> 00:00:07,349',
        'hey everyone welcome back to the',
        "channel today we're fixing subtitles",
        '',
        '6',
        '00:00:07,349 --> 00:00:07,359',
        "channel today we're fixing subtitles",
        '',
        '7',
        '00:00:07,359 --> 00:00:10,000',
        "channel today we're fixing subtitles",
        'that are out of sync',
        '',
      ].join('\n'),
    );
  });

  it('keeps <i>, <b> and <u> without classes and removes every other tag', () => {
    const vtt =
      'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n<i.yellow>Styled</i> <c.red>red</c> <B>bold</B> <u>under</u>\n<ruby>漢<rt>kan</rt></ruby> <lang en>Hi</lang>\n';
    expect(convertSubtitle(vtt, 'vtt', 'srt').text).toBe(
      '1\n00:00:01,000 --> 00:00:02,000\n<i>Styled</i> red <b>bold</b> <u>under</u>\n漢kan Hi\n',
    );
  });

  it('turns speaker tags into names and decodes character references', () => {
    const vtt =
      'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n<v.loud Ben Smith>Tom &amp; Jerry &lt;3</v>\n&gt;&gt; caf&#233; &#xE9; &#99999999; &unknown;\n';
    expect(convertSubtitle(vtt, 'vtt', 'srt').text).toBe(
      '1\n00:00:01,000 --> 00:00:02,000\nBen Smith: Tom & Jerry <3\n>> café é &#99999999; &unknown;\n',
    );
  });

  it('keeps text that only looks like a tag', () => {
    const vtt = 'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\na < b and <3 you\n';
    expect(convertSubtitle(vtt, 'vtt', 'srt').text).toBe('1\n00:00:01,000 --> 00:00:02,000\na < b and <3 you\n');
  });

  it('drops a cue with no text left and numbers the rest without a gap', () => {
    const vtt = 'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n<c> </c>\n\n00:00:03.000 --> 00:00:04.000\nKept\n';
    expect(convertSubtitle(vtt, 'vtt', 'srt')).toEqual({ text: '1\n00:00:03,000 --> 00:00:04,000\nKept\n', errors: [] });
  });

  it('escapes bare & and < and turns <font> into plain text in SRT to VTT', () => {
    const srt =
      '1\n00:00:01,000 --> 00:00:02,000\n<font color="red">Tom & Jerry</font> <b>bold</b> a < b &amp;\n';
    expect(convertSubtitle(srt, 'srt', 'vtt').text).toBe(
      'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nTom &amp; Jerry <b>bold</b> a &lt; b &amp;\n',
    );
  });

  it('keeps SRT text through SRT to VTT to SRT escaping', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nTom & Jerry <3\n';
    const asVtt = convertSubtitle(srt, 'srt', 'vtt');
    expect(asVtt.text).toBe('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nTom &amp; Jerry &lt;3\n');
    expect(convertSubtitle(asVtt.text, 'vtt', 'srt').text).toBe(
      '1\n00:00:01,000 --> 00:00:02,000\nTom & Jerry <3\n',
    );
  });
});
