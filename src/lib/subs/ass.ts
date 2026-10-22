import { classifyCueShift } from './shift';
import { isBlankInput, normalizeCueText, normalizeNewlines } from './text';
import { formatAssTimestamp, parseAssTimestamp } from './time';
import type { Cue, ParseError, ParseOptions, ParseResult } from './types';

type FieldMap = {
  start: number;
  end: number;
  style: number;
  text: number;
  count: number;
};

/** Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text */
const DEFAULT_FIELDS: FieldMap = {
  start: 1,
  end: 2,
  style: 3,
  text: 9,
  count: 10,
};

function parseFormatLine(line: string): FieldMap | null {
  const names = line
    .replace(/^Format:\s*/i, '')
    .split(',')
    .map((name) => name.trim().toLowerCase());
  const start = names.indexOf('start');
  const end = names.indexOf('end');
  const style = names.indexOf('style');
  const text = names.lastIndexOf('text');
  if (start < 0 || end < 0 || text < 0 || text !== names.length - 1) return null;
  return { start, end, style, text, count: names.length };
}

/** Split a Dialogue body. The last field is Text and may contain commas. */
function splitFields(body: string, count: number): string[] | null {
  const parts: string[] = [];
  let rest = body;
  for (let i = 0; i < count - 1; i++) {
    const comma = rest.indexOf(',');
    if (comma === -1) return null;
    parts.push(rest.slice(0, comma).trim());
    rest = rest.slice(comma + 1);
  }
  parts.push(rest);
  return parts;
}

function parseDialogue(
  line: string,
  fields: FieldMap,
  lineNumber: number,
  keepInverted: boolean,
): { cue?: Cue; error?: ParseError } {
  const parts = splitFields(line.replace(/^Dialogue:\s*/i, ''), fields.count);
  if (!parts) {
    return {
      error: {
        block: lineNumber,
        message: `Line ${lineNumber} has too few fields for a Dialogue line.`,
      },
    };
  }

  const startText = parts[fields.start] ?? '';
  const endText = parts[fields.end] ?? '';
  const start = parseAssTimestamp(startText);
  const end = parseAssTimestamp(endText);
  if (start === null || end === null) {
    return {
      error: {
        block: lineNumber,
        message: `Line ${lineNumber} has an invalid timestamp (${startText} --> ${endText}).`,
      },
    };
  }
  const cue: Cue = {
    start,
    end,
    text: (parts[fields.text] ?? '').replace(/\\N/g, '\n'),
  };
  const style = fields.style >= 0 ? parts[fields.style]?.trim() : undefined;
  if (style) cue.style = style;
  if (end < start) {
    const error: ParseError = {
      block: lineNumber,
      message: `Line ${lineNumber} ends before it starts (${startText} --> ${endText}).`,
    };
    if (!keepInverted) return { error };
    return { cue, error };
  }
  return { cue };
}

export function parseAss(input: string, options?: ParseOptions): ParseResult {
  if (isBlankInput(input)) return { cues: [], errors: [] };

  const keepInverted = options?.keepInverted === true;
  const cues: Cue[] = [];
  const errors: ParseError[] = [];
  let inEvents = false;
  let fields = DEFAULT_FIELDS;

  const lines = normalizeNewlines(input).split('\n');
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '') continue;

    const section = /^\[(.+)]$/.exec(trimmed);
    if (section) {
      inEvents = section[1].toLowerCase() === 'events';
      continue;
    }

    if (inEvents && /^Format:/i.test(trimmed)) {
      const parsed = parseFormatLine(trimmed);
      if (parsed) fields = parsed;
      continue;
    }

    if (!/^Dialogue:/i.test(trimmed)) continue;

    const parsed = parseDialogue(trimmed, fields, i + 1, keepInverted);
    if (parsed.cue) cues.push(parsed.cue);
    if (parsed.error) errors.push(parsed.error);
  }

  return { cues, errors };
}

type RawLine = { text: string; ending: string };

/** Split into lines without changing `\n`, `\r\n`, or a final line that has no ending. */
function splitKeepEndings(input: string): RawLine[] {
  if (input === '') return [];
  const lines: RawLine[] = [];
  const pattern = /\r\n|\n|\r/g;
  let last = 0;
  for (const match of input.matchAll(pattern)) {
    const index = match.index ?? last;
    lines.push({ text: input.slice(last, index), ending: match[0] });
    last = index + match[0].length;
  }
  if (last < input.length) lines.push({ text: input.slice(last), ending: '' });
  return lines;
}

function fieldSpans(body: string, count: number): { start: number; end: number }[] | null {
  const spans: { start: number; end: number }[] = [];
  let pos = 0;
  for (let i = 0; i < count - 1; i++) {
    const comma = body.indexOf(',', pos);
    if (comma === -1) return null;
    spans.push({ start: pos, end: comma });
    pos = comma + 1;
  }
  spans.push({ start: pos, end: body.length });
  return spans;
}

function replaceFieldTime(field: string, formatted: string): string {
  const leading = field.length - field.trimStart().length;
  const trimmedEnd = field.trimEnd();
  const trailing = field.length - trimmedEnd.length;
  if (leading + trailing >= field.length) return formatted;
  return `${field.slice(0, leading)}${formatted}${trailing > 0 ? field.slice(field.length - trailing) : ''}`;
}

function replaceDialogueTimes(
  rawLine: string,
  fields: FieldMap,
  startMs: number,
  endMs: number,
): string {
  const bom = rawLine.startsWith('\uFEFF') ? '\uFEFF' : '';
  const rest = bom === '' ? rawLine : rawLine.slice(1);
  const match = /^(\s*Dialogue:\s*)/i.exec(rest);
  if (!match?.[1]) return rawLine;
  const prefix = match[1];
  const body = rest.slice(prefix.length);
  const spans = fieldSpans(body, fields.count);
  const startSpan = spans?.[fields.start];
  const endSpan = spans?.[fields.end];
  if (!spans || !startSpan || !endSpan) return rawLine;

  const edits = [
    { at: startSpan, value: formatAssTimestamp(startMs) },
    { at: endSpan, value: formatAssTimestamp(endMs) },
  ].sort((a, b) => b.at.start - a.at.start);

  let next = body;
  for (const edit of edits) {
    const field = next.slice(edit.at.start, edit.at.end);
    next = `${next.slice(0, edit.at.start)}${replaceFieldTime(field, edit.value)}${next.slice(edit.at.end)}`;
  }
  return `${bom}${prefix}${next}`;
}

/**
 * Shift Dialogue start/end times inside the original ASS/SSA text.
 * Header, styles, comments, and dialogue text stay as they were.
 * A removed cue drops that Dialogue line. A line that does not parse stays.
 */
export function shiftAssText(input: string, offsetMs: number, fromCue?: number): string {
  const lines = splitKeepEndings(input);
  let inEvents = false;
  let fields = DEFAULT_FIELDS;
  let cueIndex = 0;

  const next = lines.flatMap((line, index) => {
    const source = index === 0 ? line.text.replace(/^\uFEFF/, '') : line.text;
    const trimmed = source.trim();
    if (trimmed === '') return [line];

    const section = /^\[(.+)]$/.exec(trimmed);
    if (section?.[1]) {
      inEvents = section[1].toLowerCase() === 'events';
      return [line];
    }

    if (inEvents && /^Format:/i.test(trimmed)) {
      const parsed = parseFormatLine(trimmed);
      if (parsed) fields = parsed;
      return [line];
    }

    if (!/^Dialogue:/i.test(trimmed)) return [line];

    const parsed = parseDialogue(trimmed, fields, index + 1, false);
    if (!parsed.cue) return [line];

    const change = classifyCueShift(parsed.cue, offsetMs, cueIndex, fromCue);
    cueIndex += 1;
    if (change.kind === 'removed') return [];
    if (change.kind === 'unchanged') return [line];
    return [
      {
        text: replaceDialogueTimes(line.text, fields, change.cue.start, change.cue.end),
        ending: line.ending,
      },
    ];
  });

  return next.map((line) => line.text + line.ending).join('');
}

/**
 * Write new start/end times into Dialogue lines.
 * `next` returns null to drop that line.
 * Header, styles, comments, and dialogue text stay.
 * A Dialogue line that does not parse stays.
 * When the new times match the parsed cue, the line stays byte-for-byte.
 */
export function mapAssDialogueTimes(
  input: string,
  next: (cue: Cue, index: number) => { start: number; end: number } | null,
): string {
  const lines = splitKeepEndings(input);
  let inEvents = false;
  let fields = DEFAULT_FIELDS;
  let cueIndex = 0;

  const mapped = lines.flatMap((line, index) => {
    const source = index === 0 ? line.text.replace(/^\uFEFF/, '') : line.text;
    const trimmed = source.trim();
    if (trimmed === '') return [line];

    const section = /^\[(.+)]$/.exec(trimmed);
    if (section?.[1]) {
      inEvents = section[1].toLowerCase() === 'events';
      return [line];
    }

    if (inEvents && /^Format:/i.test(trimmed)) {
      const parsed = parseFormatLine(trimmed);
      if (parsed) fields = parsed;
      return [line];
    }

    if (!/^Dialogue:/i.test(trimmed)) return [line];

    const parsed = parseDialogue(trimmed, fields, index + 1, false);
    if (!parsed.cue) return [line];

    const change = next(parsed.cue, cueIndex);
    cueIndex += 1;
    if (!change) return [];
    if (change.start === parsed.cue.start && change.end === parsed.cue.end) return [line];
    return [
      {
        text: replaceDialogueTimes(line.text, fields, change.start, change.end),
        ending: line.ending,
      },
    ];
  });

  return mapped.map((line) => line.text + line.ending).join('');
}

export function serializeAss(cues: readonly Cue[]): string {
  if (cues.length === 0) return '';
  const header = [
    '[Script Info]',
    'ScriptType: v4.00+',
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ];
  const dialogues = cues.map((cue) => {
    const style = cue.style ? cue.style : 'Default';
    const text = normalizeCueText(cue.text).replace(/\n/g, '\\N');
    const start = formatAssTimestamp(cue.start);
    const end = formatAssTimestamp(cue.end);
    return `Dialogue: 0,${start},${end},${style},,0,0,0,,${text}`;
  });
  return `${[...header, ...dialogues].join('\n')}\n`;
}
