import { describe, expect, it } from 'vitest';
import sample from '../../../tests/fixtures/sample.vtt?raw';
import youtube from '../../../tests/fixtures/youtube-auto.vtt?raw';
import { parseVtt, serializeVtt, srtCueTextToVtt } from './vtt';

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

describe('parseVtt: YouTube automatic captions', () => {
  const expected = [
    { start: 160, end: 2270, text: '[Music]' },
    { start: 2270, end: 2280, text: '[Music]' },
    {
      start: 2280,
      end: 4789,
      text: '[Music]\nhey<00:00:02.639><c> everyone</c><00:00:03.000><c> welcome</c><00:00:03.360><c> back</c><00:00:03.600><c> to</c><00:00:03.760><c> the</c>',
    },
    { start: 4789, end: 4799, text: 'hey everyone welcome back to the' },
    {
      start: 4799,
      end: 7349,
      text: "hey everyone welcome back to the\nchannel<00:00:05.200><c> today</c><00:00:05.600><c> we're</c><00:00:05.920><c> fixing</c><00:00:06.319><c> subtitles</c>",
    },
    { start: 7349, end: 7359, text: "channel today we're fixing subtitles" },
    {
      start: 7359,
      end: 10000,
      text: "channel today we're fixing subtitles\nthat<00:00:07.680><c> are</c><00:00:07.919><c> out</c><00:00:08.160><c> of</c><00:00:08.400><c> sync</c>",
    },
  ];

  it('keeps the text that follows a line of spaces inside a cue', () => {
    expect(youtube).toContain('position:0%\n \n[Music]');
    expect(parseVtt(youtube)).toEqual({ cues: expected, errors: [] });
  });

  it('reads the same file with Windows line endings', () => {
    expect(parseVtt(youtube.replace(/\n/g, '\r\n'))).toEqual({ cues: expected, errors: [] });
  });

  it('treats a line of tabs like a line of spaces', () => {
    const result = parseVtt('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n\t\nHello\n');
    expect(result).toEqual({ cues: [{ start: 1000, end: 2000, text: 'Hello' }], errors: [] });
  });

  it('still starts a new cue after a line of spaces, with or without an identifier', () => {
    const result = parseVtt(
      'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nOne\n \n2\n00:00:03.000 --> 00:00:04.000\nTwo\n \n00:00:05.000 --> 00:00:06.000\nThree\n',
    );
    expect(result.errors).toEqual([]);
    expect(result.cues.map((cue) => cue.text)).toEqual(['One', 'Two', 'Three']);
  });

  it('does not join text after two lines of spaces, or a block with a timing arrow', () => {
    const twoLines = parseVtt('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nOne\n \n \nStray\n');
    expect(twoLines.cues).toEqual([{ start: 1000, end: 2000, text: 'One' }]);
    expect(twoLines.errors).toEqual([{ block: 3, message: 'Block 3 is missing a timestamp.' }]);
    const arrow = parseVtt('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nOne\n \nStray\nMore\n00:00:03.000 --> 00:00:04.000\n');
    expect(arrow.cues).toEqual([{ start: 1000, end: 2000, text: 'One' }]);
    expect(arrow.errors).toEqual([{ block: 3, message: 'Block 3 has an invalid timestamp "More".' }]);
  });

  it('does not join text that follows an empty line', () => {
    const result = parseVtt('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nOne\n\nStray\n');
    expect(result.cues).toEqual([{ start: 1000, end: 2000, text: 'One' }]);
    expect(result.errors).toEqual([{ block: 3, message: 'Block 3 is missing a timestamp.' }]);
  });

  it('does not join text to a NOTE or to a block that is not a cue', () => {
    const afterNote = parseVtt('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nOne\n\nNOTE hi\n \nStray\n');
    expect(afterNote.cues).toEqual([{ start: 1000, end: 2000, text: 'One' }]);
    expect(afterNote.errors).toEqual([{ block: 4, message: 'Block 4 is missing a timestamp.' }]);
    const afterBadCue = parseVtt('WEBVTT\n\n00:00:05.000 --> 00:00:01.000\nBackwards\n \nStray\n');
    expect(afterBadCue.cues).toEqual([]);
    expect(afterBadCue.errors.map((error) => error.block)).toEqual([2, 3]);
  });

  it('can keep a cue that ends before it starts', () => {
    const result = parseVtt('WEBVTT\n\n00:00:05.000 --> 00:00:01.000\nBackwards\n', { keepInverted: true });
    expect(result.cues).toEqual([{ start: 5000, end: 1000, text: 'Backwards' }]);
    expect(result.errors[0]?.message).toMatch(/before/i);
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

describe('srtCueTextToVtt', () => {
  it('removes font tags, keeps b/i/u, and escapes bare & and <', () => {
    expect(
      srtCueTextToVtt(
        '<font color="red">Tom & Jerry</font> <b>bold</b> <i>italic</i> <u>under</u> a < b',
      ),
    ).toBe('Tom &amp; Jerry <b>bold</b> <i>italic</i> <u>under</u> a &lt; b');
  });

  it('leaves existing character references alone', () => {
    expect(srtCueTextToVtt('Tom &amp; Jerry &lt;3 caf&#233; &#xE9;')).toBe(
      'Tom &amp; Jerry &lt;3 caf&#233; &#xE9;',
    );
  });

  it('normalizes tag case and drops attributes from b/i/u', () => {
    expect(srtCueTextToVtt('<B class="x">bold</B><I>italic</I>')).toBe(
      '<b>bold</b><i>italic</i>',
    );
  });
});
