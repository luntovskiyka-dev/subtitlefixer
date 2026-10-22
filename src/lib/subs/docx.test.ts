import { unzipSync, strFromU8 } from 'fflate';
import { describe, expect, it } from 'vitest';
import { buildDocx, escapeDocx, subtitlesToDocx, docxFileNames } from './docx';

const PAGE = `1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

2
00:00:04,100 --> 00:00:07,450
Today we're fixing subtitles.
`;

function documentXml(bytes: Uint8Array): string {
  const files = unzipSync(bytes);
  const xml = files['word/document.xml'];
  if (!xml) throw new Error('missing word/document.xml');
  expect(files['[Content_Types].xml']).toBeTruthy();
  expect(files['_rels/.rels']).toBeTruthy();
  return strFromU8(xml);
}

describe('subtitlesToDocx', () => {
  it('writes one paragraph per subtitle for Text only', () => {
    const result = subtitlesToDocx(PAGE, 'srt');
    expect(result.count).toBe(2);
    expect(result.bytes).not.toBeNull();
    const xml = documentXml(result.bytes ?? new Uint8Array());
    expect(xml).toContain('Hi, and welcome back.');
    expect(xml).toContain("Today we're fixing subtitles.");
    expect(xml.match(/<w:p>/g)).toHaveLength(2);
  });

  it('puts the start time in front of each line', () => {
    const result = subtitlesToDocx(PAGE, 'srt', { layout: 'timestamps', pauseMs: 2000, removeRepeats: false });
    const xml = documentXml(result.bytes ?? new Uint8Array());
    expect(xml).toContain('[00:00:01] Hi, and welcome back.');
    expect(xml).toContain("[00:00:04] Today we're fixing subtitles.");
  });

  it('builds a table with index, start, end and text', () => {
    const result = subtitlesToDocx(PAGE, 'srt', { layout: 'table', pauseMs: 2000, removeRepeats: false });
    const xml = documentXml(result.bytes ?? new Uint8Array());
    expect(xml).toContain('<w:tbl>');
    expect(xml).toContain('>#</w:t>');
    expect(xml).toContain('>Start</w:t>');
    expect(xml).toContain('>End</w:t>');
    expect(xml).toContain('>Text</w:t>');
    expect(xml).toContain('00:00:01,200');
    expect(xml).toContain('00:00:03,800');
    expect(xml).toContain('00:00:04,100');
    expect(xml).toContain('00:00:07,450');
    expect(xml).toContain('<w:b/>');
  });

  it('escapes &, < and > in cue text', () => {
    expect(escapeDocx('a & b <c> "d"')).toBe('a &amp; b &lt;c&gt; &quot;d&quot;');
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nTom & Jerry < 2\n';
    const xml = documentXml(subtitlesToDocx(srt, 'srt').bytes ?? new Uint8Array());
    expect(xml).toContain('Tom &amp; Jerry &lt; 2');
    expect(xml).not.toContain('Tom & Jerry');
  });

  it('returns no document when the file has no text', () => {
    const result = subtitlesToDocx('', 'srt');
    expect(result.bytes).toBeNull();
    expect(result.count).toBe(0);
  });

  it('turns a line break inside a table cell into a Word break', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nLine one\nLine two\n';
    const xml = documentXml(subtitlesToDocx(srt, 'srt', { layout: 'table', pauseMs: 2000, removeRepeats: false }).bytes ?? new Uint8Array());
    expect(xml).toContain('Line one');
    expect(xml).toContain('<w:br/>');
    expect(xml).toContain('Line two');
  });

  it('names docx files and keeps them unique', () => {
    expect(docxFileNames(['movie.srt', 'movie.vtt'])).toEqual(['movie.docx', 'movie (2).docx']);
  });
});

describe('buildDocx', () => {
  it('stores the three package parts', () => {
    const xml = documentXml(buildDocx('<w:p><w:r><w:t>Hi</w:t></w:r></w:p>'));
    expect(xml).toContain('>Hi</w:t>');
  });
});
