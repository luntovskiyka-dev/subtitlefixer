import { strToU8, zipSync } from 'fflate';
import { assToCues } from './assToSrt';
import { encodeUtf8 } from './encoding';
import { parseSrt } from './srt';
import { formatSrtTimestamp } from './time';
import type { Cue, ParseError, SubtitleFormat } from './types';
import { cleanCueLines, dropInnerSpaceLines } from './toText';
import { parseVtt } from './vtt';

export type SheetFormat = 'xlsx' | 'csv';

export type SheetResult = {
  bytes: Uint8Array | null;
  count: number;
  errors: ParseError[];
};

const FORMULA = /^[=+\-@\t\r]/;

/** Stop a spreadsheet from treating a cell as a formula. */
export function guardFormula(value: string): string {
  return FORMULA.test(value) ? `'${value}` : value;
}

function readCues(input: string, format: SubtitleFormat): { cues: Cue[]; errors: ParseError[] } {
  const options = { keepInverted: true };
  if (format === 'srt') return parseSrt(input, options);
  if (format === 'vtt') return parseVtt(dropInnerSpaceLines(input), options);
  return assToCues(input, options);
}

export type SheetRow = { index: number; start: string; end: string; text: string };

export function sheetRows(input: string, format: SubtitleFormat): { rows: SheetRow[]; errors: ParseError[] } {
  const parsed = readCues(input, format);
  const rows = parsed.cues.flatMap((cue, index) => {
    const lines = cleanCueLines(cue.text, format);
    if (lines.length === 0) return [];
    return [
      {
        index: index + 1,
        start: guardFormula(formatSrtTimestamp(cue.start)),
        end: guardFormula(formatSrtTimestamp(cue.end)),
        text: guardFormula(lines.join('\n')),
      },
    ];
  });
  rows.forEach((row, index) => {
    row.index = index + 1;
  });
  return { rows, errors: parsed.errors };
}

function csvField(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** RFC 4180 CSV with CRLF rows. The caller adds the UTF-8 BOM. */
export function rowsToCsv(rows: readonly SheetRow[]): string {
  const lines = ['#,Start,End,Text'];
  for (const row of rows) {
    lines.push([String(row.index), csvField(row.start), csvField(row.end), csvField(row.text)].join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}

export function csvBytes(csv: string): Uint8Array {
  return encodeUtf8(csv, true);
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function columnName(index: number): string {
  let value = index + 1;
  let name = '';
  while (value > 0) {
    const digit = (value - 1) % 26;
    name = String.fromCharCode(65 + digit) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function inline(cell: string, ref: string, style: number): string {
  return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${escapeXml(cell)}</t></is></c>`;
}

export function rowsToXlsx(rows: readonly SheetRow[]): Uint8Array {
  const header = ['#', 'Start', 'End', 'Text'];
  const body = [
    `<row r="1">${header.map((value, index) => inline(value, `${columnName(index)}1`, 1)).join('')}</row>`,
  ];
  rows.forEach((row, index) => {
    const line = index + 2;
    const values = [String(row.index), row.start, row.end, row.text];
    const cells = values
      .map((value, column) => {
        const ref = `${columnName(column)}${line}`;
        if (column === 0) return `<c r="${ref}" s="0"><v>${row.index}</v></c>`;
        return inline(value, ref, column === 3 ? 2 : 0);
      })
      .join('');
    body.push(`<row r="${line}">${cells}</row>`);
  });
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body.join('')}</sheetData><cols><col min="1" max="1" width="8"/><col min="2" max="3" width="16"/><col min="4" max="4" width="48"/></cols></worksheet>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyAlignment="1"><alignment wrapText="1"/></xf></cellXfs></styleSheet>`;
  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Subtitles" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  return zipSync(
    {
      '[Content_Types].xml': strToU8(contentTypes),
      '_rels/.rels': strToU8(rootRels),
      'xl/workbook.xml': strToU8(workbook),
      'xl/_rels/workbook.xml.rels': strToU8(workbookRels),
      'xl/worksheets/sheet1.xml': strToU8(sheet),
      'xl/styles.xml': strToU8(styles),
    },
    { level: 6 },
  );
}

export function subtitlesToSheet(input: string, format: SubtitleFormat, output: SheetFormat): SheetResult {
  const table = sheetRows(input, format);
  if (table.rows.length === 0) return { bytes: null, count: 0, errors: table.errors };
  const bytes = output === 'csv' ? csvBytes(rowsToCsv(table.rows)) : rowsToXlsx(table.rows);
  return { bytes, count: table.rows.length, errors: table.errors };
}

export function sheetFileName(name: string, output: SheetFormat): string {
  const base = name.replace(/\.(?:srt|vtt|ass|ssa)$/i, '') || 'subtitles';
  return `${base}.${output}`;
}
