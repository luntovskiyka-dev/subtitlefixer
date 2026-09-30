import { isBlankInput, normalizeCueText, normalizeNewlines } from './text';
import { formatAssTimestamp, parseAssTimestamp } from './time';
import type { Cue, ParseError, ParseResult } from './types';

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
  if (end < start) {
    return {
      error: {
        block: lineNumber,
        message: `Line ${lineNumber} ends before it starts (${startText} --> ${endText}).`,
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
  return { cue };
}

export function parseAss(input: string): ParseResult {
  if (isBlankInput(input)) return { cues: [], errors: [] };

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

    const parsed = parseDialogue(trimmed, fields, i + 1);
    if (parsed.cue) cues.push(parsed.cue);
    if (parsed.error) errors.push(parsed.error);
  }

  return { cues, errors };
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
