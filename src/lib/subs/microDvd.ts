import { serializeSrt } from './srt';
import { normalizeNewlines } from './text';
import { formatSrtTimestamp } from './time';
import type { Cue, ParseError } from './types';

/**
 * MicroDVD text `.sub` → SRT. Frame numbers become milliseconds.
 * Nothing in this module is sent over the network.
 */

/** Rates a `{1}{1}…` header may name, and the rates the page offers. */
export const MICRODVD_FPS = [23.976, 24, 25, 29.97, 30] as const;

export const DEFAULT_MICRODVD_FPS = 23.976;

export const VOBSUB_ERROR =
  'This is a VobSub image subtitle (.sub + .idx). The pictures need OCR, which this page does not do.';

const NOT_MICRODVD = 'Use a MicroDVD .sub file.';
const NO_CUES = 'No MicroDVD cues were found.';

const FPS_HEADER = /^\{1\}\{1\}(\d+(?:\.\d+)?)$/;
const CUE_LINE = /^\{(\d+)\}\{(\d+)\}(.*)$/;
const TEXT_TOKEN = /\{([^{}]*)\}|\|/g;

export type MicroDvdSpan = {
  first: string;
  last: string;
};

export type MicroDvdResult = {
  text: string;
  cues: Cue[];
  errors: ParseError[];
  /** Rate used for this file. Null when the file was rejected. */
  fps: number | null;
  /** True when a `{1}{1}23.976` (or 24, 25, 29.97, 30) line supplied the rate. */
  fpsFromFile: boolean;
  span: MicroDvdSpan | null;
};

export type MicroDvdFile = {
  name: string;
  text: string;
  bytes: Uint8Array;
};

type Mark = 'i' | 'b';

function canonicalFps(value: number): number | null {
  for (const fps of MICRODVD_FPS) {
    if (Math.abs(value - fps) < 0.001) return fps;
  }
  return null;
}

/** Frame rate written on the first cue line, or null when that line is a subtitle. */
export function readMicroDvdFps(text: string): number | null {
  const lines = normalizeNewlines(text).split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    return fpsFromHeader(trimmed);
  }
  return null;
}

function fpsFromHeader(trimmed: string): number | null {
  const match = FPS_HEADER.exec(trimmed);
  if (!match?.[1]) return null;
  return canonicalFps(Number(match[1]));
}

/** `{y:i}` / `{y:b}` toggle italics and bold. Other `{…}` tags are dropped. `|` breaks the line. */
function convertMicroDvdText(raw: string): string {
  const open: Mark[] = [];
  let out = '';
  let last = 0;

  const write = (tag: string) => {
    out += tag;
  };

  for (const match of raw.matchAll(TEXT_TOKEN)) {
    const index = match.index ?? 0;
    out += raw.slice(last, index);
    last = index + match[0].length;
    if (match[0] === '|') {
      out += '\n';
      continue;
    }
    const body = (match[1] ?? '').replace(/\s+/g, '').toLowerCase();
    if (body === 'y:i') toggleMark(open, 'i', write);
    else if (body === 'y:b') toggleMark(open, 'b', write);
  }
  out += raw.slice(last);

  for (let index = open.length - 1; index >= 0; index -= 1) {
    out += `</${open[index]}>`;
  }

  return out
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join('\n');
}

/** Turn a mark off, closing and reopening anything nested inside it, or turn it on. */
function toggleMark(open: Mark[], mark: Mark, write: (tag: string) => void): void {
  const index = open.lastIndexOf(mark);
  if (index === -1) {
    open.push(mark);
    write(`<${mark}>`);
    return;
  }
  const later = open.splice(index);
  later.shift();
  for (let cursor = later.length - 1; cursor >= 0; cursor -= 1) {
    write(`</${later[cursor]}>`);
  }
  write(`</${mark}>`);
  for (const inner of later) {
    open.push(inner);
    write(`<${inner}>`);
  }
}

function frameToMs(frame: number, fps: number): number {
  return Math.round((frame * 1000) / fps);
}

function spanOf(cues: readonly Cue[]): MicroDvdSpan | null {
  const first = cues[0];
  const last = cues[cues.length - 1];
  if (!first || !last) return null;
  return {
    first: formatSrtTimestamp(first.start),
    last: formatSrtTimestamp(last.end),
  };
}

function hasNullByte(bytes: Uint8Array | undefined): boolean {
  if (!bytes) return false;
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === 0) return true;
  }
  return false;
}

/** Image-based VobSub: a binary `.sub`, or an `.idx` index. MicroDVD text returns false. */
export function isVobSub(file: { name?: string; text: string; bytes?: Uint8Array }): boolean {
  const name = file.name?.toLowerCase() ?? '';
  if (name.endsWith('.idx')) return true;
  if (hasNullByte(file.bytes) || file.text.includes('\u0000')) return true;
  return /^\s*#\s*VobSub\b/i.test(file.text);
}

/** A message when this file cannot be converted, or null when it is MicroDVD text. */
export function microDvdFileError(file: MicroDvdFile): string | null {
  if (isVobSub(file)) return VOBSUB_ERROR;
  if (!file.name.toLowerCase().endsWith('.sub')) return NOT_MICRODVD;
  return null;
}

function rejected(message: string): MicroDvdResult {
  return {
    text: '',
    cues: [],
    errors: [{ block: 1, message }],
    fps: null,
    fpsFromFile: false,
    span: null,
  };
}

/**
 * Convert MicroDVD text to SRT at `fps`, unless the file starts with a frame-rate line.
 * Times are rounded to milliseconds. A VobSub file returns an error and no cues.
 */
export function microDvdToSrt(
  text: string,
  fps: number,
  file?: { name?: string; bytes?: Uint8Array },
): MicroDvdResult {
  if (isVobSub({ name: file?.name, text, bytes: file?.bytes })) return rejected(VOBSUB_ERROR);

  const rate = Number.isFinite(fps) && fps > 0 ? fps : DEFAULT_MICRODVD_FPS;
  const lines = normalizeNewlines(text).split('\n');
  const cues: Cue[] = [];
  const errors: ParseError[] = [];
  let used = rate;
  let fpsFromFile = false;
  let headerChecked = false;

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const trimmed = (lines[index] ?? '').trim();
    if (trimmed === '') continue;

    if (!headerChecked) {
      headerChecked = true;
      const header = fpsFromHeader(trimmed);
      if (header !== null) {
        used = header;
        fpsFromFile = true;
        continue;
      }
    }

    const match = CUE_LINE.exec(trimmed);
    if (!match) {
      errors.push({ block: lineNumber, message: `Line ${lineNumber} is not a MicroDVD cue.` });
      continue;
    }

    const startFrame = Number(match[1]);
    const endFrame = Number(match[2]);
    if (endFrame < startFrame) {
      errors.push({ block: lineNumber, message: `Line ${lineNumber} ends before it starts.` });
      continue;
    }

    const cueText = convertMicroDvdText(match[3] ?? '');
    if (cueText === '') continue;
    cues.push({
      start: frameToMs(startFrame, used),
      end: frameToMs(endFrame, used),
      text: cueText,
    });
  }

  if (cues.length === 0) {
    errors.push({ block: 1, message: NO_CUES });
    return { text: '', cues, errors, fps: used, fpsFromFile, span: null };
  }

  return {
    text: serializeSrt(cues),
    cues,
    errors,
    fps: used,
    fpsFromFile,
    span: spanOf(cues),
  };
}

/** `movie.sub` → `movie.srt`, with a suffix when two files would share a name. */
export function srtNamesForSub(names: readonly string[]): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    const stripped = name.replace(/\.sub$/i, '');
    const base = stripped === '' || stripped === name ? 'subtitles' : stripped;
    let candidate = `${base}.srt`;
    let copy = 2;
    while (used.has(candidate.toLowerCase())) {
      candidate = `${base} (${copy}).srt`;
      copy += 1;
    }
    used.add(candidate.toLowerCase());
    return candidate;
  });
}
