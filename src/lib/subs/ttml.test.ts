import { describe, expect, it } from 'vitest';
import dfxp from '../../../tests/fixtures/dfxp-sample.xml?raw';
import frames from '../../../tests/fixtures/ttml-frames.xml?raw';
import ticks from '../../../tests/fixtures/ttml-ticks.xml?raw';
import youtube from '../../../tests/fixtures/youtube-transcript.xml?raw';
import { serializeSrt } from './srt';
import { decodeRepeatedEntities, parseSubtitleXml as parseXml, parseTtmlTime as parseTime } from './ttml';

describe('TTML time', () => {
  const clock = { frameRate: 30, subFrameRate: 1, tickRate: 1 };

  it('reads clock, offset, frame and tick times', () => {
    expect(parseTime('00:00:01.5', clock)).toBe(1500);
    expect(parseTime('00:00:01:15', clock)).toBe(1500);
    expect(parseTime('12.5s', clock)).toBe(12_500);
    expect(parseTime('1500ms', clock)).toBe(1500);
    expect(parseTime('2m', clock)).toBe(120_000);
    expect(parseTime('1h', clock)).toBe(3_600_000);
    expect(parseTime('30f', clock)).toBe(1000);
    expect(parseTime('2t', clock)).toBe(2000);
  });

  it('uses frameRate times subFrameRate as the tick rate when tickRate is omitted', () => {
    expect(parseTime('25t', { frameRate: 25, subFrameRate: 1, tickRate: 25 })).toBe(1000);
  });
});

describe('parseSubtitleXml', () => {
  it('converts TTML ticks at the file tick rate', () => {
    const parsed = parseXml(ticks);
    expect(parsed.error).toBeNull();
    expect(parsed.kind).toBe('ttml');
    expect(parsed.cues).toEqual([{ start: 1200, end: 3800, text: 'Hi, and welcome back.' }]);
    expect(serializeSrt(parsed.cues)).toContain('00:00:01,200 --> 00:00:03,800');
  });

  it('adds nested div time onto frame timecodes', () => {
    const parsed = parseXml(frames);
    expect(parsed.cues).toEqual([{ start: 11_000, end: 12_000, text: 'Nested' }]);
  });

  it('reads DFXP from the TTAF namespace, including br and italic', () => {
    const parsed = parseXml(dfxp);
    expect(parsed.kind).toBe('dfxp');
    expect(parsed.cues[0]).toEqual({ start: 1200, end: 3800, text: 'Hi, and welcome back.' });
    expect(parsed.cues[1]?.text).toBe("Today we're\n<i>fixing</i> subtitles.");
    expect(parsed.cues[2]?.text).toBe('<b>Bold</b>');
  });

  it('reads YouTube transcript XML and double-escaped entities', () => {
    const parsed = parseXml(youtube);
    expect(parsed.kind).toBe('youtube');
    expect(parsed.cues).toEqual([
      { start: 1200, end: 3800, text: 'Hi, and welcome back.' },
      { start: 4100, end: 7450, text: "Today we're fixing subtitles." },
    ]);
  });

  it('decodes double-escaped named and numeric entities', () => {
    expect(decodeRepeatedEntities('&amp;quot;hi&amp;quot;')).toBe('"hi"');
    expect(decodeRepeatedEntities('&amp;lt;3')).toBe('<3');
    expect(decodeRepeatedEntities('a&amp;gt;b')).toBe('a>b');
    expect(decodeRepeatedEntities('&amp;amp;')).toBe('&');
    expect(decodeRepeatedEntities('&amp;apos;')).toBe("'");
    expect(decodeRepeatedEntities('&amp;#39;')).toBe("'");
    expect(decodeRepeatedEntities('&amp;#60;')).toBe('<');
    expect(decodeRepeatedEntities('&amp;#x3e;')).toBe('>');
    const xml =
      '<transcript><text start="1.2" dur="1.0">Say &amp;quot;hi&amp;quot; &amp;gt;3 &amp;lt;3 &amp;amp; &amp;#38; &amp;#x26; &amp;apos;ok&amp;apos;</text></transcript>';
    expect(parseXml(xml).cues[0]?.text).toBe('Say "hi" >3 <3 & & & \'ok\'');
    expect(parseXml('<transcript><text start="1" dur="1">&amp;lt;b&amp;gt;Hi&amp;lt;/b&amp;gt;</text></transcript>').cues[0]?.text).toBe(
      'Hi',
    );
  });

  it('reads YouTube timedtext paragraphs', () => {
    const xml = '<timedtext format="3"><body><p t="1000" d="500"><s>Hi</s> <s>there</s></p></body></timedtext>';
    expect(parseXml(xml).cues).toEqual([{ start: 1000, end: 1500, text: 'Hi there' }]);
  });

  it('warns on an IMSC image profile and rejects invalid XML', () => {
    const image =
      '<tt ttp:contentProfiles="http://www.w3.org/ns/ttml/profile/imsc1/image"><body><div><p begin="1s" end="2s">x</p></div></body></tt>';
    expect(parseXml(image).warnings.join(' ')).toMatch(/image/i);
    expect(parseXml('<tt><p></tt>').error).toMatch(/valid XML/i);
    expect(parseXml('<project/>').error).toMatch(/isn't a supported/);
  });

  it('keeps SMPTE-TT text and drops a paragraph with no end', () => {
    const xml =
      '<tt xmlns:smpte="http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt"><body><div><p begin="1s" end="2s">Keep</p><p begin="3s">Drop</p></div></body></tt>';
    const parsed = parseXml(xml);
    expect(parsed.cues.map((cue) => cue.text)).toEqual(['Keep']);
    expect(parsed.warnings.join(' ')).toMatch(/no end time/);
  });
});
