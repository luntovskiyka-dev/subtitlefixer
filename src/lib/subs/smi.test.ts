import { describe, expect, it } from 'vitest';
import { serializeSrt } from './srt';
import { classLabel, cleanSmiText, isSmiName, parseSmi, selectSmiGroup, smiOutputNames } from './smi';

const PAGE = `<SAMI>
<HEAD><STYLE TYPE="text/css"><!--
.KRCC { Name: Korean; lang: ko-KR; }
--></STYLE></HEAD>
<BODY>
<SYNC Start=1200><P Class=KRCC>안녕하세요.
<SYNC Start=3800><P Class=KRCC>&nbsp;
<SYNC Start=4100><P Class=KRCC>어디 가세요?<br>역으로요.
<SYNC Start=7450><P Class=KRCC>&nbsp;
</BODY>
</SAMI>`;

describe('parseSmi', () => {
  it('turns the page example into SRT, with nbsp as the end time and br as a new line', () => {
    const result = parseSmi(PAGE);
    expect(result.error).toBeNull();
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]?.id).toBe('KRCC');
    expect(result.groups[0]?.name).toBe('Korean');
    expect(result.groups[0]?.lang).toBe('ko-KR');
    expect(serializeSrt(result.groups[0]?.cues ?? [])).toBe(`1
00:00:01,200 --> 00:00:03,800
안녕하세요.

2
00:00:04,100 --> 00:00:07,450
어디 가세요?
역으로요.
`);
  });

  it('keeps each language class separate', () => {
    const smi = `<SAMI><BODY>
<SYNC Start=0><P Class=ENCC>Hello<P Class=KRCC>안녕
<SYNC Start=2000><P Class=ENCC>&nbsp;<P Class=KRCC>&nbsp;
</BODY></SAMI>`;
    const result = parseSmi(smi);
    expect(result.groups.map((group) => group.id)).toEqual(['ENCC', 'KRCC']);
    expect(result.groups[0]?.cues).toEqual([{ start: 0, end: 2000, text: 'Hello' }]);
    expect(result.groups[1]?.cues[0]?.text).toBe('안녕');
  });

  it('strips font tags, keeps italic, and decodes entities', () => {
    expect(cleanSmiText('A <font color="red">red</font> &amp; <i>yes</i>')).toBe('A red & <i>yes</i>');
    const smi = '<SAMI><BODY><SYNC Start=0><P Class=ENCC>Tom &amp; <b>Jerry</b><SYNC Start=1500><P Class=ENCC>&nbsp;</BODY></SAMI>';
    expect(parseSmi(smi).groups[0]?.cues[0]?.text).toBe('Tom & <b>Jerry</b>');
  });

  it('sorts sync points that are out of order and warns', () => {
    const smi = '<SAMI><BODY><SYNC Start=3000><P>Second<SYNC Start=1000><P>First<SYNC Start=4000><P>&nbsp;</BODY></SAMI>';
    const result = parseSmi(smi);
    expect(result.warnings.some((warning) => warning.includes('out of order'))).toBe(true);
    expect(result.groups[0]?.cues.map((cue) => cue.text)).toEqual(['First', 'Second']);
    expect(result.groups[0]?.cues[0]?.start).toBe(1000);
  });

  it('times the last cue by reading speed when nothing follows it', () => {
    const smi = '<SAMI><BODY><SYNC Start=1000><P Class=ENCC>Hi</BODY></SAMI>';
    const cue = parseSmi(smi).groups[0]?.cues[0];
    expect(cue?.start).toBe(1000);
    expect(cue?.end).toBe(2000);
  });

  it('drops a cue whose end is not after its start', () => {
    const smi = '<SAMI><BODY><SYNC Start=1000><P>Same<SYNC Start=1000><P>Next<SYNC Start=3000><P>&nbsp;</BODY></SAMI>';
    const result = parseSmi(smi);
    expect(result.dropped).toBe(1);
    expect(result.groups[0]?.cues.map((cue) => cue.text)).toEqual(['Next']);
  });

  it('rejects a file with no sync points', () => {
    expect(parseSmi('<SAMI><BODY><P>Hello</P></BODY></SAMI>').error).toBe("This doesn't look like an SMI file.");
  });

  it('falls back when the chosen class is missing', () => {
    const result = parseSmi(PAGE);
    const selected = selectSmiGroup(result, 'ENCC');
    expect(selected.group?.id).toBe('KRCC');
    expect(selected.warning).toContain('ENCC');
    expect(classLabel(result.groups[0] ?? { id: 'KRCC', name: 'Korean', lang: null })).toBe('KRCC — Korean');
  });
});

describe('smi names', () => {
  it('accepts .smi and .sami', () => {
    expect(isSmiName('Movie.SMI')).toBe(true);
    expect(isSmiName('movie.sami')).toBe(true);
    expect(isSmiName('movie.srt')).toBe(false);
  });

  it('adds the class only when the file has several languages', () => {
    expect(
      smiOutputNames([
        { name: 'movie.smi', classId: 'KRCC', multi: false },
        { name: 'movie.sami', classId: 'KRCC', multi: true },
        { name: 'movie.smi', classId: 'ENCC', multi: true },
      ]),
    ).toEqual(['movie.srt', 'movie.KRCC.srt', 'movie.ENCC.srt']);
  });
});
