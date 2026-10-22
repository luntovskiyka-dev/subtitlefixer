import { describe, expect, it } from 'vitest';
import {
  cleanCueLines,
  dropInnerSpaceLines,
  formatStamp,
  subtitleFormatFromName,
  subtitlesToText,
  textFileNames,
} from './toText';

const PAGE_SRT = `1
00:01:05,200 --> 00:01:07,800
Hi, and <i>welcome back</i>.

2
00:01:08,100 --> 00:01:10,450
Today we're fixing subtitles.

3
00:01:14,000 --> 00:01:16,300
First, open your file.
`;

const YOUTUBE_VTT = [
  'WEBVTT',
  'Kind: captions',
  'Language: en',
  '',
  '00:00:00.000 --> 00:00:02.879 align:start position:0%',
  ' ',
  'hey<00:00:00.320><c> guys</c><00:00:00.640><c> welcome</c>',
  '',
  '00:00:02.879 --> 00:00:02.889 align:start position:0%',
  'hey guys welcome',
  ' ',
  '',
  '00:00:02.889 --> 00:00:05.000 align:start position:0%',
  'hey guys welcome',
  'to<00:00:03.100><c> the</c><00:00:03.400><c> channel</c>',
  '',
  '00:00:05.000 --> 00:00:05.010 align:start position:0%',
  'to the channel',
  ' ',
  '',
  '00:00:05.010 --> 00:00:07.000 align:start position:0%',
  'to the channel',
  'today<00:00:05.500><c> we</c><00:00:05.900><c> fix</c><00:00:06.200><c> subtitles</c>',
  '',
].join('\n');

describe('subtitlesToText: the examples on /srt-to-txt', () => {
  it('Text only: one subtitle per line, tags removed', () => {
    const result = subtitlesToText(PAGE_SRT, 'srt', { layout: 'text', pauseMs: 2000, removeRepeats: false });
    expect(result.text).toBe("Hi, and welcome back.\nToday we're fixing subtitles.\nFirst, open your file.\n");
    expect(result.count).toBe(3);
    expect(result.errors).toEqual([]);
  });

  it('With timestamps: start time in square brackets, rounded down to the second', () => {
    const result = subtitlesToText(PAGE_SRT, 'srt', { layout: 'timestamps', pauseMs: 2000, removeRepeats: false });
    expect(result.text).toBe(
      "[00:01:05] Hi, and welcome back.\n[00:01:08] Today we're fixing subtitles.\n[00:01:14] First, open your file.\n",
    );
  });

  it('Paragraphs: a pause of 2 seconds or more starts a new paragraph', () => {
    const result = subtitlesToText(PAGE_SRT, 'srt', { layout: 'paragraphs', pauseMs: 2000, removeRepeats: false });
    expect(result.text).toBe("Hi, and welcome back. Today we're fixing subtitles.\n\nFirst, open your file.\n");
  });

  it('Paragraphs: the pause can be changed', () => {
    const longer = subtitlesToText(PAGE_SRT, 'srt', { layout: 'paragraphs', pauseMs: 4000, removeRepeats: false });
    expect(longer.text).toBe("Hi, and welcome back. Today we're fixing subtitles. First, open your file.\n");
    const shorter = subtitlesToText(PAGE_SRT, 'srt', { layout: 'paragraphs', pauseMs: 300, removeRepeats: false });
    expect(shorter.text).toBe("Hi, and welcome back.\n\nToday we're fixing subtitles.\n\nFirst, open your file.\n");
  });

  it('uses Text only and keeps repeats by default', () => {
    expect(subtitlesToText(PAGE_SRT, 'srt').text).toBe(
      "Hi, and welcome back.\nToday we're fixing subtitles.\nFirst, open your file.\n",
    );
  });
});

describe('subtitlesToText: cleaning', () => {
  it('joins a multi-line subtitle into one line', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\n<b>First line</b>\n<u>second line</u>\n';
    expect(subtitlesToText(srt, 'srt').text).toBe('First line second line\n');
  });

  it('removes the WEBVTT header, NOTE, STYLE and REGION blocks and cue identifiers', () => {
    const vtt = [
      'WEBVTT - Lecture',
      '',
      'STYLE',
      '::cue { color: yellow }',
      '',
      'REGION',
      'id:left width:40%',
      '',
      'NOTE This is a comment',
      '',
      'intro',
      '00:00:01.000 --> 00:00:02.000 line:90%',
      '<c.yellow>Hello</c> &amp; welcome',
      '',
      '00:00:03.000 --> 00:00:04.000',
      '<lang en>Bye</lang>&nbsp;now',
      '',
    ].join('\n');
    expect(subtitlesToText(vtt, 'vtt').text).toBe('Hello & welcome\nBye now\n');
  });

  it('turns VTT speaker tags into "Name: "', () => {
    const vtt = 'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n<v Anna>Hi there</v>\n\n00:00:02.500 --> 00:00:03.000\n<v.loud Ben Smith>Hello\n';
    expect(subtitlesToText(vtt, 'vtt').text).toBe('Anna: Hi there\nBen Smith: Hello\n');
  });

  it('removes ASS style codes and turns \\N into a line break before joining', () => {
    const ass = [
      '[Script Info]',
      'ScriptType: v4.00+',
      '',
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      'Dialogue: 0,0:00:01.00,0:00:02.50,Default,,0,0,0,,{\\an8}{\\i1}Top line{\\i0}\\NSecond line',
      'Dialogue: 1,0:00:01.00,0:00:02.50,Default,,0,0,0,,{\\an8}{\\i1}Top line{\\i0}\\NSecond line',
      'Dialogue: 0,0:00:03.00,0:00:04.00,Default,,0,0,0,,{\\p1}m 0 0 l 100 0 100 100{\\p0}',
      'Dialogue: 0,0:00:05.00,0:00:06.00,Default,,0,0,0,,Last, with a comma',
    ].join('\n');
    const result = subtitlesToText(ass, 'ass', { layout: 'timestamps', pauseMs: 2000, removeRepeats: false });
    expect(result.text).toBe('[00:00:01] Top line Second line\n[00:00:05] Last, with a comma\n');
  });

  it('removes {\\an8} codes found in SRT files', () => {
    expect(cleanCueLines('{\\an8}Top of the screen', 'srt')).toEqual(['Top of the screen']);
  });

  it('keeps text that only looks like a tag', () => {
    expect(cleanCueLines('a < b and <3 you', 'srt')).toEqual(['a < b and <3 you']);
  });

  it('decodes VTT character references and keeps one that is out of range', () => {
    expect(cleanCueLines('Tom &amp; Jerry&nbsp;&#233; &#99999999;', 'vtt')).toEqual(['Tom & Jerry é &#99999999;']);
  });

  it('drops subtitles that are empty after cleaning', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\n<i></i>\n\n2\n00:00:03,000 --> 00:00:04,000\nText\n';
    const result = subtitlesToText(srt, 'srt');
    expect(result.text).toBe('Text\n');
    expect(result.count).toBe(1);
  });

  it('returns parser errors and keeps the good subtitles', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nGood\n\n2\nnot a time\nBad\n';
    const result = subtitlesToText(srt, 'srt');
    expect(result.text).toBe('Good\n');
    expect(result.errors.length).toBe(1);
  });

  it('returns an empty text for an empty file', () => {
    expect(subtitlesToText('', 'srt')).toEqual({ text: '', count: 0, errors: [] });
  });
});

describe('subtitlesToText: YouTube automatic captions', () => {
  it('keeps the text of cues that contain a line of spaces', () => {
    expect(dropInnerSpaceLines(YOUTUBE_VTT)).not.toContain('\n \nhey<');
    const result = subtitlesToText(YOUTUBE_VTT, 'vtt');
    expect(result.errors).toEqual([]);
    expect(result.text).toBe(
      [
        'hey guys welcome',
        'hey guys welcome',
        'hey guys welcome to the channel',
        'to the channel',
        'to the channel today we fix subtitles',
        '',
      ].join('\n'),
    );
  });

  it('Remove repeated lines keeps one copy of each line', () => {
    const result = subtitlesToText(YOUTUBE_VTT, 'vtt', { layout: 'text', pauseMs: 2000, removeRepeats: true });
    expect(result.text).toBe('hey guys welcome\nto the channel\ntoday we fix subtitles\n');
    expect(result.count).toBe(3);
  });

  it('Remove repeated lines works with timestamps and paragraphs', () => {
    const stamps = subtitlesToText(YOUTUBE_VTT, 'vtt', { layout: 'timestamps', pauseMs: 2000, removeRepeats: true });
    expect(stamps.text).toBe('[00:00:00] hey guys welcome\n[00:00:02] to the channel\n[00:00:05] today we fix subtitles\n');
    const paragraphs = subtitlesToText(YOUTUBE_VTT, 'vtt', { layout: 'paragraphs', pauseMs: 2000, removeRepeats: true });
    expect(paragraphs.text).toBe('hey guys welcome to the channel today we fix subtitles\n');
  });

  it('only drops a line that repeats the line right before it', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nYes.\n\n2\n00:00:03,000 --> 00:00:04,000\nNo.\n\n3\n00:00:05,000 --> 00:00:06,000\nYes.\n';
    const result = subtitlesToText(srt, 'srt', { layout: 'text', pauseMs: 2000, removeRepeats: true });
    expect(result.text).toBe('Yes.\nNo.\nYes.\n');
  });

  it('keeps a real blank line between two VTT cues', () => {
    const vtt = 'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nOne\n \n2\n00:00:03.000 --> 00:00:04.000\nTwo\n';
    expect(subtitlesToText(vtt, 'vtt').text).toBe('One\nTwo\n');
  });

  it('turns the VTT to TXT example into speaker lines', () => {
    const vtt = `WEBVTT

00:00:02.500 --> 00:00:05.000
<v Anna>Good afternoon, everyone.

00:00:05.300 --> 00:00:08.960
<v Ben>Let's start with the <b>numbers</b>.
`;
    expect(subtitlesToText(vtt, 'vtt').text).toBe("Anna: Good afternoon, everyone.\nBen: Let's start with the numbers.\n");
  });
});

describe('helpers', () => {
  it('formats the stamp as [hh:mm:ss], rounded down', () => {
    expect(formatStamp(0)).toBe('[00:00:00]');
    expect(formatStamp(65_999)).toBe('[00:01:05]');
    expect(formatStamp(3_725_000)).toBe('[01:02:05]');
  });

  it('reads the format from the file name', () => {
    expect(subtitleFormatFromName('a.SRT')).toBe('srt');
    expect(subtitleFormatFromName('a.vtt')).toBe('vtt');
    expect(subtitleFormatFromName('a.ass')).toBe('ass');
    expect(subtitleFormatFromName('a.ssa')).toBe('ass');
    expect(subtitleFormatFromName('a.txt')).toBeNull();
  });

  it('names the text files and keeps them unique', () => {
    expect(textFileNames(['movie.srt', 'movie.vtt', 'Movie.ass', 'other.SSA'])).toEqual([
      'movie.txt',
      'movie (2).txt',
      'Movie (3).txt',
      'other.txt',
    ]);
  });
});
