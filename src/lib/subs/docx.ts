import { strToU8, zipSync } from 'fflate';
import { assToCues } from './assToSrt';
import { parseSrt } from './srt';
import { formatSrtTimestamp } from './time';
import type { Cue, ParseError, SubtitleFormat } from './types';
import {
  cleanCueLines,
  dropInnerSpaceLines,
  removeRepeatedLines,
  subtitlesToText,
  type TextLayout,
} from './toText';
import { parseVtt } from './vtt';

export type DocxLayout = TextLayout | 'table';

export type DocxOptions = {
  layout: DocxLayout;
  pauseMs: number;
  removeRepeats: boolean;
};

export const DEFAULT_DOCX: DocxOptions = {
  layout: 'text',
  pauseMs: 2000,
  removeRepeats: false,
};

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
`;

export function escapeDocx(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function runs(text: string, bold: boolean): string {
  return text
    .split('\n')
    .map((line, index) => {
      const style = bold ? '<w:rPr><w:b/></w:rPr>' : '';
      const br = index > 0 ? '<w:br/>' : '';
      return `<w:r>${style}${br}<w:t xml:space="preserve">${escapeDocx(line)}</w:t></w:r>`;
    })
    .join('');
}

function paragraph(text: string, bold = false): string {
  return `<w:p>${runs(text, bold)}</w:p>`;
}

function cell(text: string, width: number, bold = false): string {
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/></w:tcPr>${paragraph(text, bold)}</w:tc>`;
}

function table(rows: readonly (readonly [string, string, string, string])[]): string {
  const widths = [900, 1800, 1800, 4860];
  const body = rows
    .map((row, index) => {
      const cells = row.map((value, column) => cell(value, widths[column] ?? 1800, index === 0)).join('');
      return `<w:tr>${cells}</w:tr>`;
    })
    .join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="900"/><w:gridCol w:w="1800"/><w:gridCol w:w="1800"/><w:gridCol w:w="4860"/></w:tblGrid>${body}</w:tbl>`;
}

/** A .docx package. Text is XML-escaped. Subtitle tags are not kept as formatting. */
export function buildDocx(body: string): Uint8Array {
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;
  return zipSync(
    {
      '[Content_Types].xml': strToU8(CONTENT_TYPES),
      '_rels/.rels': strToU8(RELS),
      'word/document.xml': strToU8(document),
    },
    { level: 6 },
  );
}

function textBody(text: string, layout: TextLayout): string {
  const trimmed = text.replace(/\n+$/, '');
  if (trimmed === '') return paragraph('');
  const parts = layout === 'paragraphs' ? trimmed.split('\n\n') : trimmed.split('\n');
  return parts.map((part) => paragraph(part)).join('');
}

type TableCue = { start: number; end: number; lines: string[] };

function readCues(input: string, format: SubtitleFormat): { cues: Cue[]; errors: ParseError[] } {
  if (format === 'srt') return parseSrt(input);
  if (format === 'vtt') return parseVtt(dropInnerSpaceLines(input));
  return assToCues(input);
}

function tableCues(input: string, format: SubtitleFormat, removeRepeats: boolean): { cues: TableCue[]; errors: ParseError[] } {
  const parsed = readCues(input, format);
  let cues: TableCue[] = parsed.cues
    .map((cue) => ({ start: cue.start, end: cue.end, lines: cleanCueLines(cue.text, format) }))
    .filter((cue) => cue.lines.length > 0);
  if (removeRepeats) cues = removeRepeatedLines(cues);
  return { cues, errors: parsed.errors };
}

export type DocxResult = {
  bytes: Uint8Array | null;
  count: number;
  errors: ParseError[];
};

/**
 * SRT, VTT or ASS/SSA to a Word document. Text, timestamp and paragraph layouts
 * match SRT to TXT. Table columns are index, start, end and text.
 */
export function subtitlesToDocx(input: string, format: SubtitleFormat, options: DocxOptions = DEFAULT_DOCX): DocxResult {
  if (options.layout === 'table') {
    const tabled = tableCues(input, format, options.removeRepeats);
    if (tabled.cues.length === 0) return { bytes: null, count: 0, errors: tabled.errors };
    const header: [string, string, string, string] = ['#', 'Start', 'End', 'Text'];
    const rows = tabled.cues.map((cue, index): [string, string, string, string] => [
      String(index + 1),
      formatSrtTimestamp(cue.start),
      formatSrtTimestamp(cue.end),
      cue.lines.join('\n'),
    ]);
    return { bytes: buildDocx(table([header, ...rows])), count: tabled.cues.length, errors: tabled.errors };
  }

  const result = subtitlesToText(input, format, {
    layout: options.layout,
    pauseMs: options.pauseMs,
    removeRepeats: options.removeRepeats,
  });
  if (result.count === 0) return { bytes: null, count: 0, errors: result.errors };
  return {
    bytes: buildDocx(textBody(result.text, options.layout)),
    count: result.count,
    errors: result.errors,
  };
}

/** movie.srt -> movie.docx. A name that is already taken gets " (2)". */
export function docxFileNames(names: readonly string[]): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    const base = name.replace(/\.(?:srt|vtt|ass|ssa)$/i, '') || 'subtitles';
    let candidate = `${base}.docx`;
    let copy = 2;
    while (used.has(candidate.toLowerCase())) {
      candidate = `${base} (${copy}).docx`;
      copy += 1;
    }
    used.add(candidate.toLowerCase());
    return candidate;
  });
}
