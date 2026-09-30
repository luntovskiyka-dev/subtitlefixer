import { describe, expect, it } from 'vitest';
import broken from '../../../tests/fixtures/broken-block.ass?raw';
import sampleAss from '../../../tests/fixtures/sample.ass?raw';
import sampleSsa from '../../../tests/fixtures/sample.ssa?raw';
import { parseAss, serializeAss } from './ass';

describe('parseAss', () => {
  it('reads the Dialogue style and keeps override tags', () => {
    const result = parseAss(sampleAss);
    expect(result.errors).toEqual([]);
    expect(result.cues).toEqual([
      { start: 1000, end: 3500, text: '{\\k20}Hello', style: 'Karaoke' },
      { start: 4000, end: 5000, text: 'Line one\nLine two', style: 'Default' },
    ]);
  });

  it('turns \\\\N into a newline and writes \\\\N again', () => {
    const parsed = parseAss(
      'Dialogue: 0,0:00:04.00,0:00:05.00,Default,,0,0,0,,Line one\\NLine two\n',
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.cues[0]).toEqual({
      start: 4000,
      end: 5000,
      text: 'Line one\nLine two',
      style: 'Default',
    });
    const written = serializeAss(parsed.cues);
    expect(written).toContain('Line one\\NLine two');
    expect(parseAss(written).cues[0]?.text).toBe('Line one\nLine two');
  });

  it('keeps {\\\\...} tags in the cue text', () => {
    const result = parseAss(
      'Dialogue: 0,0:00:01.00,0:00:03.50,Karaoke,,0,0,0,,{\\an8}Hello\n',
    );
    expect(result.cues[0]?.text).toBe('{\\an8}Hello');
    expect(result.cues[0]?.style).toBe('Karaoke');
  });

  it('uses the Events Format line, including commas in the text', () => {
    const result = parseAss(`[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Start, End, Style, Text
Dialogue: 0:00:01.00,0:00:03.50,Custom,Hello, world
`);
    expect(result.errors).toEqual([]);
    expect(result.cues).toEqual([
      { start: 1000, end: 3500, text: 'Hello, world', style: 'Custom' },
    ]);
  });

  it('parses an SSA Dialogue line', () => {
    const result = parseAss(sampleSsa);
    expect(result.errors).toEqual([]);
    expect(result.cues).toEqual([{ start: 1000, end: 3500, text: 'Hello', style: 'Title' }]);
  });

  it('keeps valid Dialogue lines when one fixture line ends before it starts', () => {
    const result = parseAss(broken);
    expect(result.cues).toEqual([
      { start: 1000, end: 2000, text: 'Good', style: 'Default' },
      { start: 3000, end: 4000, text: 'Still here', style: 'Keep' },
    ]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.block).toBe(4);
    expect(result.errors[0]?.message).toMatch(/before/i);
  });

  it('describes a malformed Dialogue line and keeps the others', () => {
    const result = parseAss(`[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:02.00,Default,,0,0,0,,Good
Dialogue: 0,not-a-time,0:00:02.00,Default,,0,0,0,,Bad
Dialogue: 0,0:00:03.00,0:00:04.00,Keep,,0,0,0,,Still
`);
    expect(result.cues.map((cue) => cue.text)).toEqual(['Good', 'Still']);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.message).toMatch(/invalid timestamp/i);
  });
});

describe('serializeAss', () => {
  it('writes centisecond timestamps and restores style on parse', () => {
    const cues = parseAss(sampleAss).cues;
    const again = parseAss(serializeAss(cues));
    expect(again.errors).toEqual([]);
    expect(again.cues).toEqual(cues);
  });

  it('uses Default when a cue has no style', () => {
    const text = serializeAss([{ start: 1000, end: 3500, text: 'Hello' }]);
    expect(text).toContain('Dialogue: 0,0:00:01.00,0:00:03.50,Default,,0,0,0,,Hello');
  });

  it('returns an empty string for no cues', () => {
    expect(serializeAss([])).toBe('');
  });
});
