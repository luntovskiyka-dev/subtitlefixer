import { describe, expect, it } from 'vitest';
import { decodeBytes } from './encoding';
import {
  joinParts,
  joinPreview,
  joinStartMs,
  mergeDual,
  mergedFileName,
  mergeSubtitles,
  overlapMs,
  readMergeInput,
  vttSafeText,
  type MergeOptions,
} from './merge';
import { parseSrt, serializeSrt } from './srt';
import type { Cue } from './types';

const ENGLISH = `1
00:00:01,200 --> 00:00:03,800
Where are you going?

2
00:00:04,100 --> 00:00:06,500
To the station.
`;

const SPANISH = `1
00:00:01,300 --> 00:00:03,700
¿Adónde vas?

2
00:00:04,000 --> 00:00:06,600
A la estación.
`;

const DUAL: MergeOptions = { mode: 'dual', output: 'srt', secondOnTop: false, gapMs: 0, startMs: null };
const JOIN: MergeOptions = { mode: 'join', output: 'srt', secondOnTop: false, gapMs: 0, startMs: null };

const cue = (start: number, end: number, text: string): Cue => ({ start, end, text });
const srt = (text: string) => readMergeInput(text, 'srt');

describe('mergeDual', () => {
  it('gives the merged file shown on the page', () => {
    const result = mergeSubtitles(srt(ENGLISH), srt(SPANISH), DUAL);
    expect(result.text).toBe(`1
00:00:01,200 --> 00:00:03,800
Where are you going?
¿Adónde vas?

2
00:00:04,100 --> 00:00:06,500
To the station.
A la estación.
`);
    expect(result).toMatchObject({ count: 2, paired: 2, unpaired: 0 });
  });

  it('puts the second file on top when the order is swapped, keeping the first file timings', () => {
    const result = mergeSubtitles(srt(ENGLISH), srt(SPANISH), { ...DUAL, secondOnTop: true });
    expect(result.text).toBe(`1
00:00:01,200 --> 00:00:03,800
¿Adónde vas?
Where are you going?

2
00:00:04,100 --> 00:00:06,500
A la estación.
To the station.
`);
  });

  it('adds each line to the line it overlaps most, so one subtitle can carry two lines', () => {
    const first = [cue(0, 5000, 'A long line'), cue(5000, 8000, 'A2')];
    const second = [cue(0, 2400, 'b1'), cue(2600, 5000, 'b2'), cue(4500, 7500, 'b3')];
    const result = mergeDual(first, second, { secondOnTop: false });
    expect(result.cues).toEqual([cue(0, 5000, 'A long line\nb1\nb2'), cue(5000, 8000, 'A2\nb3')]);
    expect(result).toMatchObject({ paired: 3, unpaired: 0 });
  });

  it('keeps a line that overlaps nothing with its own times, sorted in, and loses no line', () => {
    const first = [cue(1000, 2000, 'A1'), cue(5000, 6000, 'A2')];
    const second = [cue(2000, 3000, 'touching'), cue(6500, 7000, 'after'), cue(0, 900, 'before'), cue(5200, 5800, 'b')];
    const result = mergeDual(first, second, { secondOnTop: false });
    expect(result.cues).toEqual([
      cue(0, 900, 'before'),
      cue(1000, 2000, 'A1'),
      cue(2000, 3000, 'touching'),
      cue(5000, 6000, 'A2\nb'),
      cue(6500, 7000, 'after'),
    ]);
    expect(result).toMatchObject({ paired: 1, unpaired: 3 });
    const lines = serializeSrt(result.cues).split('\n');
    for (const line of [...first, ...second].map((item) => item.text)) {
      expect(lines.filter((item) => item === line)).toHaveLength(1);
    }
  });

  it('two files with different splits: every line of both files is in the result once', () => {
    const first: Cue[] = [];
    const second: Cue[] = [];
    for (let index = 0; index < 60; index += 1) first.push(cue(index * 3000, index * 3000 + 2500, `A${index}`));
    for (let index = 0; index < 97; index += 1) second.push(cue(index * 1850 + 300, index * 1850 + 1700, `B${index}`));
    const result = mergeDual(first, second, { secondOnTop: false });
    expect(result.paired + result.unpaired).toBe(97);
    const lines = result.cues.flatMap((item) => item.text.split('\n'));
    expect(lines.sort()).toEqual([...first, ...second].map((item) => item.text).sort());
    const starts = result.cues.map((item) => item.start);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });

  it('picks the earlier line on a tie and does not depend on input order', () => {
    const first = [cue(3000, 5000, 'A2'), cue(1000, 3000, 'A1')];
    const result = mergeDual(first, [cue(2000, 4000, 'b')], { secondOnTop: false });
    expect(result.cues).toEqual([cue(1000, 3000, 'A1\nb'), cue(3000, 5000, 'A2')]);
  });

  it('measures overlap in milliseconds, and touching lines do not overlap', () => {
    expect(overlapMs(cue(1200, 3800, ''), cue(1300, 3700, ''))).toBe(2400);
    expect(overlapMs(cue(0, 1000, ''), cue(1000, 2000, ''))).toBe(0);
  });
});

describe('join parts', () => {
  const cd1: Cue[] = Array.from({ length: 811 }, (_, index) => cue(index * 4000, index * 4000 + 2000, `Line ${index + 1}`));
  cd1.push(cue(3730400, 3732900, 'See you tomorrow.'));
  const cd2 = `1
00:00:02,000 --> 00:00:04,300
Good morning.

2
00:00:05,000 --> 00:00:06,000
Second line.
`;
  const part1 = { cues: cd1, errors: [] };

  it('gives the joined file shown on the page when part 2 starts at 01:02:15,000', () => {
    const result = mergeSubtitles(part1, srt(cd2), { ...JOIN, startMs: 3735000 });
    expect(result.text).toContain(`812
01:02:10,400 --> 01:02:12,900
See you tomorrow.

813
01:02:17,000 --> 01:02:19,300
Good morning.

814
01:02:20,000 --> 01:02:21,000
Second line.
`);
    expect(result).toMatchObject({ count: 814, partTwoStartMs: 3735000, partsOverlap: false });
  });

  it('starts part 2 right after the last line of part 1 plus the gap', () => {
    expect(joinStartMs(cd1, 0)).toBe(3732900);
    expect(joinStartMs(cd1, 1500)).toBe(3734400);
    const result = mergeSubtitles(part1, srt(cd2), { ...JOIN, gapMs: 1500 });
    expect(result.partTwoStartMs).toBe(3734400);
    expect(result.text).toContain('813\n01:02:16,400 --> 01:02:18,700\nGood morning.\n');
  });

  it('moves every part 2 time by the same amount, so the gaps between its lines stay', () => {
    const second = [cue(2000, 4300, 'x'), cue(10000, 11000, 'y')];
    const joined = joinParts([cue(0, 1000, 'a')], second, 60000);
    expect(joined).toEqual([cue(0, 1000, 'a'), cue(62000, 64300, 'x'), cue(70000, 71000, 'y')]);
    expect(joined[2]!.start - joined[1]!.start).toBe(second[1]!.start - second[0]!.start);
  });

  it('warns when a manual start puts part 2 inside part 1', () => {
    const result = mergeSubtitles(part1, srt(cd2), { ...JOIN, startMs: 3720000 });
    expect(result.partsOverlap).toBe(true);
  });

  it('previews the join point with the joined file numbers', () => {
    const result = mergeSubtitles(part1, srt(cd2), { ...JOIN, startMs: 3735000 });
    const shown = joinPreview(result.text, 812);
    expect(shown.caption).toBe('cues 811–814 of 814');
    expect(shown.preview.startsWith('811\n')).toBe(true);
    expect(shown.preview).toContain('813\n01:02:17,000 --> 01:02:19,300\nGood morning.\n');
    const vtt = mergeSubtitles(part1, srt(cd2), { ...JOIN, output: 'vtt', startMs: 3735000 });
    expect(joinPreview(vtt.text, 812).preview.startsWith('WEBVTT\n\n00:54:00.000 --> 00:54:02.000\nLine 811\n')).toBe(true);
  });

  it('starts an empty part 1 at the gap', () => {
    expect(joinStartMs([], 2000)).toBe(2000);
  });
});

describe('input and output', () => {
  it('reads VTT and ASS files the same way as the converters, so formats can be mixed', () => {
    const vtt = readMergeInput(
      'WEBVTT\n\n00:01.000 --> 00:03.000\n<v Anna>Hi &amp; <c.yellow>bye</c></v>\n\n00:04.000 --> 00:05.000\n<00:00:04.200><c> </c>\n',
      'vtt',
    );
    expect(vtt.cues).toEqual([cue(1000, 3000, 'Anna: Hi & bye')]);
    const ass = readMergeInput(
      '[Script Info]\nScriptType: v4.00+\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:01.00,0:00:03.00,Default,,0,0,0,,{\\i1}Hola{\\i0}\\N\\Nadiós\n',
      'ass',
    );
    expect(ass.cues).toEqual([cue(1000, 3000, '<i>Hola</i>\nadiós')]);
    const merged = mergeSubtitles(vtt, ass, DUAL);
    expect(merged.text).toBe('1\n00:00:01,000 --> 00:00:03,000\nAnna: Hi & bye\n<i>Hola</i>\nadiós\n');
  });

  it('keeps parser errors and the good lines next to them', () => {
    const input = readMergeInput('1\n00:00:01,000 --> 00:00:02,000\nok\n\nbroken block\n', 'srt');
    expect(input.cues).toEqual([cue(1000, 2000, 'ok')]);
    expect(input.errors).toHaveLength(1);
  });

  it('writes VTT with a header and escapes characters a player would read as markup', () => {
    const result = mergeSubtitles(srt(ENGLISH), readMergeInput('1\n00:00:01,000 --> 00:00:02,000\nTom & Jerry <3 <i>yes</i>\n', 'srt'), {
      ...DUAL,
      output: 'vtt',
    });
    expect(result.text).toBe(
      'WEBVTT\n\n00:00:01.200 --> 00:00:03.800\nWhere are you going?\nTom &amp; Jerry &lt;3 <i>yes</i>\n\n00:00:04.100 --> 00:00:06.500\nTo the station.\n',
    );
    expect(vttSafeText('&amp; stays, & goes')).toBe('&amp; stays, &amp; goes');
  });

  it('merges a GBK file with a UTF-8 file into readable UTF-8 text', async () => {
    const gbkHex =
      '310a30303a30303a30312c333030202d2d3e2030303a30303a30332c3730300ac4e3d2aac8a5c4c4b6f9a3bf0a0a320a30303a30303a30342c303030202d2d3e2030303a30303a30362c3630300ac8a5bbf0b3b5d5bea1a30a0a330a30303a30303a30372c303030202d2d3e2030303a30303a30392c3030300ac3f7ccecbcfba3acc2b7c9cfd0a1d0c4a1a30a';
    const gbk = Uint8Array.from((gbkHex.match(/../g) ?? []).map((pair) => Number.parseInt(pair, 16)));
    const chinese = await decodeBytes(gbk);
    expect(chinese.encoding).toBe('gb18030');
    const english = await decodeBytes(new TextEncoder().encode(ENGLISH));
    expect(english.encoding).toBe('utf-8');
    const result = mergeSubtitles(srt(english.text), srt(chinese.text), DUAL);
    expect(result.text).toBe(`1
00:00:01,200 --> 00:00:03,800
Where are you going?
你要去哪儿？

2
00:00:04,100 --> 00:00:06,500
To the station.
去火车站。

3
00:00:07,000 --> 00:00:09,000
明天见，路上小心。
`);
    expect(parseSrt(result.text).errors).toEqual([]);
  });

  it('names the result after the first file', () => {
    expect(mergedFileName('Movie.CD1.srt', 'srt')).toBe('Movie.CD1.merged.srt');
    expect(mergedFileName('film.en.ASS', 'vtt')).toBe('film.en.merged.vtt');
    expect(mergedFileName('.srt', 'srt')).toBe('subtitles.merged.srt');
  });
});

describe('more inputs, encodings and timings', () => {
  /** Russian text as Windows-1251 bytes (only the letters this test uses). */
  const cp1251 = (text: string) =>
    Uint8Array.from([...text].map((char) => {
      const code = char.charCodeAt(0);
      if (code < 0x80) return code;
      if (code >= 0x410 && code <= 0x44f) return code - 0x410 + 0xc0;
      if (code === 0x451) return 0xb8;
      throw new Error(`not in this test's Windows-1251 table: ${char}`);
    }));

  it('merges a Windows-1251 file with Windows line endings and a UTF-8 file with a BOM', async () => {
    const russian = await decodeBytes(
      cp1251('1\r\n00:00:01,000 --> 00:00:03,500\r\nКуда ты идёшь?\r\n\r\n2\r\n00:00:04,000 --> 00:00:06,000\r\nНа вокзал.\r\n'),
    );
    expect(russian.encoding).toBe('windows-1251');
    const english = await decodeBytes(Uint8Array.from([0xef, 0xbb, 0xbf, ...new TextEncoder().encode(ENGLISH)]));
    expect(english.encoding).toBe('utf-8');
    const result = mergeSubtitles(srt(english.text), srt(russian.text), DUAL);
    expect(result.text).toBe(
      '1\n00:00:01,200 --> 00:00:03,800\nWhere are you going?\nКуда ты идёшь?\n\n2\n00:00:04,100 --> 00:00:06,500\nTo the station.\nНа вокзал.\n',
    );
    expect(result.text.charCodeAt(0)).not.toBe(0xfeff);
  });

  it('reads an SSA (v4.00) file and a UTF-16 file', async () => {
    const ssa = readMergeInput(
      '[Script Info]\nScriptType: v4.00\n\n[V4 Styles]\nFormat: Name, Fontname, Fontsize\nStyle: Default,Arial,20\n\n[Events]\nFormat: Marked, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: Marked=0,0:00:01.00,0:00:03.00,Default,,0000,0000,0000,,Bonjour\\Nà tous\n',
      'ass',
    );
    expect(ssa).toEqual({ cues: [cue(1000, 3000, 'Bonjour\nà tous')], errors: [] });
    const utf16 = await decodeBytes(
      Uint8Array.from([0xff, 0xfe, ...[...'1\n00:00:01,500 --> 00:00:02,500\nHello\n'].flatMap((char) => [char.charCodeAt(0), 0])]),
    );
    expect(utf16.encoding).toBe('utf-16le');
    expect(mergeSubtitles(srt(utf16.text), ssa, DUAL).text).toBe('1\n00:00:01,500 --> 00:00:02,500\nHello\nBonjour\nà tous\n');
  });

  it('gives a line that spans two lines of the first file to the one it overlaps most', () => {
    const first = [cue(1000, 3000, 'A1'), cue(3000, 6000, 'A2')];
    const result = mergeDual(first, [cue(2500, 4000, 'b')], { secondOnTop: false });
    expect(result.cues).toEqual([cue(1000, 3000, 'A1'), cue(3000, 6000, 'A2\nb')]);
  });

  it('keeps lines of the second file that fall inside a gap of the first file, in time order', () => {
    const first = [cue(0, 2000, 'A1'), cue(10000, 12000, 'A2')];
    const second = [cue(4000, 5000, 'gap 1'), cue(6000, 7000, 'gap 2'), cue(11000, 12500, 'b')];
    const result = mergeSubtitles({ cues: first, errors: [] }, { cues: second, errors: [] }, { ...DUAL, secondOnTop: true });
    expect(result.text).toBe(
      '1\n00:00:00,000 --> 00:00:02,000\nA1\n\n2\n00:00:04,000 --> 00:00:05,000\ngap 1\n\n3\n00:00:06,000 --> 00:00:07,000\ngap 2\n\n4\n00:00:10,000 --> 00:00:12,000\nb\nA2\n',
    );
    expect(result).toMatchObject({ count: 4, paired: 1, unpaired: 2 });
  });

  it('joins two VTT parts into one VTT file with one header, part 2 after part 1 plus the gap', () => {
    const part1 = readMergeInput('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nOne\n\n00:00:03.000 --> 00:00:04.500\nTwo\n', 'vtt');
    const part2 = readMergeInput('WEBVTT\n\nNOTE part 2\n\n00:00:00.500 --> 00:00:01.000\nThree\n', 'vtt');
    const result = mergeSubtitles(part1, part2, { ...JOIN, output: 'vtt', gapMs: 2000 });
    expect(result.partTwoStartMs).toBe(6500);
    expect(result.text).toBe(
      'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nOne\n\n00:00:03.000 --> 00:00:04.500\nTwo\n\n00:00:07.000 --> 00:00:07.500\nThree\n',
    );
  });

  it('starts part 2 after the part 1 line that ends last, even when part 1 is not in order', () => {
    const first = [cue(5000, 9000, 'long'), cue(6000, 7000, 'short')];
    expect(joinStartMs(first, 0)).toBe(9000);
    const result = mergeSubtitles({ cues: first, errors: [] }, { cues: [cue(0, 1000, 'next')], errors: [] }, JOIN);
    expect(result.text.endsWith('3\n00:00:09,000 --> 00:00:10,000\nnext\n')).toBe(true);
    expect(result.partsOverlap).toBe(false);
  });
});
