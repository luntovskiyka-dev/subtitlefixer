import { assToCues } from './assToSrt';
import { parseSrt } from './srt';
import { normalizeNewlines } from './text';
import type { Cue, ParseError, SubtitleFormat } from './types';
import { decodeVttEntities, parseVtt } from './vtt';

/** "Text only", "With timestamps" or "Paragraphs". */
export type TextLayout = 'text' | 'timestamps' | 'paragraphs';

export type ToTextOptions = {
  layout: TextLayout;
  /** Paragraphs only: a gap of at least this many milliseconds starts a new paragraph. */
  pauseMs: number;
  /** Drop a line that is the same as the line kept right before it. */
  removeRepeats: boolean;
  /** Keep a cue whose end is before its start. The parser error is still returned. */
  keepInverted?: boolean;
};

export const DEFAULT_TO_TEXT: ToTextOptions = {
  layout: 'text',
  pauseMs: 2000,
  removeRepeats: false,
};

export type ToTextResult = {
  text: string;
  /** Subtitles that still had text after cleaning. */
  count: number;
  errors: ParseError[];
};

type TextCue = {
  start: number;
  end: number;
  lines: string[];
};

/** .srt, .vtt, .ass or .ssa, by file name. Anything else is null. */
export function subtitleFormatFromName(name: string): SubtitleFormat | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.srt')) return 'srt';
  if (lower.endsWith('.vtt')) return 'vtt';
  if (lower.endsWith('.ass') || lower.endsWith('.ssa')) return 'ass';
  return null;
}

/** movie.srt -> movie.txt. A name that is already taken gets " (2)", " (3)" and so on. */
export function textFileNames(names: readonly string[]): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    const base = name.replace(/\.(?:srt|vtt|ass|ssa)$/i, '') || 'subtitles';
    let candidate = `${base}.txt`;
    let copy = 2;
    while (used.has(candidate.toLowerCase())) {
      candidate = `${base} (${copy}).txt`;
      copy += 1;
    }
    used.add(candidate.toLowerCase());
    return candidate;
  });
}

const ARROW = '-->';

/**
 * YouTube automatic captions put a line holding only spaces inside a cue.
 * The shared parser joins that text back itself (one such line, see `vtt.ts`);
 * this step stays so that /srt-to-txt reads looser files exactly as before:
 * it removes the line when a text line follows that is not a cue identifier.
 */
export function dropInnerSpaceLines(input: string): string {
  const lines = normalizeNewlines(input).split('\n');
  const kept: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const isSpaceOnly = line.length > 0 && line.trim() === '';
    if (isSpaceOnly) {
      const previous = kept[kept.length - 1] ?? '';
      const next = lines[index + 1] ?? '';
      const afterNext = lines[index + 2] ?? '';
      const insideCue =
        previous.trim() !== '' &&
        next.trim() !== '' &&
        !next.includes(ARROW) &&
        !afterNext.includes(ARROW);
      if (insideCue) continue;
    }
    kept.push(line);
  }
  return kept.join('\n');
}

/** One cue's text as clean lines: tags removed, speakers kept, empty lines dropped. */
export function cleanCueLines(text: string, format: SubtitleFormat): string[] {
  let body = normalizeNewlines(text);
  if (format === 'ass') {
    body = body.replace(/\\N/g, '\n').replace(/\\n/g, '\n').replace(/\\h/g, ' ');
  }
  body = body
    .replace(/<v(?:\.[^\s>]*)?\s+([^>]+)>/gi, (_whole, speaker: string) => `${speaker.trim()}: `)
    .replace(/<\/?(?:[a-z][^<>]*|\d[\d:.]*)>/gi, '')
    .replace(/\{\\[^}]*\}/g, '');
  if (format === 'vtt') body = decodeVttEntities(body);
  return body
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line !== '');
}

function readCues(input: string, format: SubtitleFormat, keepInverted: boolean): { cues: Cue[]; errors: ParseError[] } {
  const options = keepInverted ? { keepInverted: true } : undefined;
  if (format === 'srt') return parseSrt(input, options);
  if (format === 'vtt') return parseVtt(dropInnerSpaceLines(input), options);
  return assToCues(input, options);
}

/** Drop a line when it equals the line kept right before it, across cue borders. */
export function removeRepeatedLines(cues: readonly TextCue[]): TextCue[] {
  let previous: string | null = null;
  const kept: TextCue[] = [];
  for (const cue of cues) {
    const lines: string[] = [];
    for (const line of cue.lines) {
      if (line === previous) continue;
      lines.push(line);
      previous = line;
    }
    if (lines.length > 0) kept.push({ ...cue, lines });
  }
  return kept;
}

/** [hh:mm:ss], rounded down to the second. */
export function formatStamp(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `[${pad(hours)}:${pad(minutes)}:${pad(seconds)}]`;
}

function layOut(cues: readonly TextCue[], options: ToTextOptions): string {
  if (cues.length === 0) return '';
  if (options.layout === 'timestamps') {
    return `${cues.map((cue) => `${formatStamp(cue.start)} ${cue.lines.join(' ')}`).join('\n')}\n`;
  }
  if (options.layout === 'paragraphs') {
    const paragraphs: string[][] = [];
    let previousEnd: number | null = null;
    for (const cue of cues) {
      const current = paragraphs[paragraphs.length - 1];
      if (!current || (previousEnd !== null && cue.start - previousEnd >= options.pauseMs)) {
        paragraphs.push([cue.lines.join(' ')]);
      } else {
        current.push(cue.lines.join(' '));
      }
      previousEnd = cue.end;
    }
    return `${paragraphs.map((words) => words.join(' ')).join('\n\n')}\n`;
  }
  return `${cues.map((cue) => cue.lines.join(' ')).join('\n')}\n`;
}

/**
 * SRT, VTT or ASS/SSA to plain text. Cue numbers, timestamps, headers, NOTE/STYLE/REGION
 * blocks and tags are removed; a multi-line subtitle becomes one line. Runs on the device.
 */
export function subtitlesToText(
  input: string,
  format: SubtitleFormat,
  options: ToTextOptions = DEFAULT_TO_TEXT,
): ToTextResult {
  const parsed = readCues(input, format, options.keepInverted === true);
  let cues: TextCue[] = parsed.cues
    .map((cue) => ({ start: cue.start, end: cue.end, lines: cleanCueLines(cue.text, format) }))
    .filter((cue) => cue.lines.length > 0);
  if (options.removeRepeats) cues = removeRepeatedLines(cues);
  return { text: layOut(cues, options), count: cues.length, errors: parsed.errors };
}
