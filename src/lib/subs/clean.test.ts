import { describe, expect, it } from 'vitest';
import { cleanSubtitles } from './clean';

const OPTIONS = {
  brackets: true,
  parentheses: true,
  speakers: true,
  music: true,
  tags: false,
};

describe('cleanSubtitles', () => {
  it('removes SDH text, speaker labels, music lines and empty cues', () => {
    const input = `1
00:00:01,200 --> 00:00:03,800
[DOOR SLAMS]

2
00:00:04,100 --> 00:00:07,450
JOHN: Where were you?
(sighs) I waited all night.

3
00:00:08,000 --> 00:00:10,000
♪ ♪
`;
    const cleaned = cleanSubtitles(input, 'srt', OPTIONS);
    expect(cleaned.deleted).toBe(2);
    expect(cleaned.text).toBe(`1
00:00:04,100 --> 00:00:07,450
Where were you?
I waited all night.
`);
  });

  it('removes HTML and ASS tags when that option is on', () => {
    const srt = cleanSubtitles('1\n00:00:01,000 --> 00:00:02,000\n<i>Hi</i> <font color="red">there</font>\n', 'srt', {
      ...OPTIONS,
      brackets: false,
      parentheses: false,
      speakers: false,
      music: false,
      tags: true,
    });
    expect(srt.text).toContain('Hi there');
    expect(srt.text).not.toContain('<i>');
    const ass = `[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:02.00,Default,,0,0,0,,{\\i1}Hi{\\i0}
`;
    const cleaned = cleanSubtitles(ass, 'ass', {
      brackets: false,
      parentheses: false,
      speakers: false,
      music: false,
      tags: true,
    });
    expect(cleaned.text).toContain('Hi');
    expect(cleaned.text).not.toContain('{\\i1}');
    expect(cleaned.text).toContain('[Events]');
  });
});
