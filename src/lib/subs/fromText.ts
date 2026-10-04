import { normalizeNewlines } from './text';
import type { Cue } from './types';

/** Longest subtitle line, as in the Netflix English style guide. */
export const MAX_LINE = 42;

export type SplitMode = 'lines' | 'sentences';

export type ReadingOptions = {
  /** Characters per second. Every character counts, spaces and punctuation included. */
  cps: number;
  minMs: number;
  maxMs: number;
};

export type PlainOptions = ReadingOptions & {
  split: SplitMode;
  startMs: number;
  gapMs: number;
  /** Fit to total duration: the last subtitle ends here. Null keeps reading-speed timing. */
  totalMs: number | null;
};

export const DEFAULT_PLAIN: PlainOptions = {
  split: 'lines',
  startMs: 0,
  cps: 17,
  minMs: 1000,
  maxMs: 7000,
  gapMs: 0,
  totalMs: null,
};

export type FromTextResult = {
  cues: Cue[];
  /** Problems that stop the conversion. No cues are returned with an error. */
  error: string | null;
  /** Lines that were skipped or timed differently. The cues are still returned. */
  warnings: string[];
};

function charCount(text: string): number {
  return [...text.replace(/\n/g, ' ')].length;
}

/** Reading time for one subtitle, rounded to the millisecond and kept between min and max. */
export function readingMs(text: string, options: ReadingOptions): number {
  const raw = Math.round((charCount(text) / options.cps) * 1000);
  return Math.min(options.maxMs, Math.max(options.minMs, raw));
}

/**
 * hh:mm:ss,mmm, h:mm:ss.mmm, mm:ss or m:ss. Milliseconds are optional.
 * Returns null for anything else, or when minutes or seconds are 60 or more.
 */
export function parseClock(value: string): number | null {
  const match = /^(?:(\d+):)?(\d{1,2}):(\d{2})(?:[,.](\d{1,3}))?$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1] ?? '0');
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  if (minutes > 59 || seconds > 59) return null;
  const fraction = match[4] ?? '';
  const ms = fraction === '' ? 0 : Number(fraction.padEnd(3, '0'));
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + ms;
}

/** Sentence ends: . ! ? … followed by spaces (closing quotes allowed), or 。！？ in CJK text. */
const SENTENCE_BREAK = /(?<=[.!?…]["'”’»)\]]*)\s+|(?<=[。！？])/u;

/** Non-empty units of text, one per line or one per sentence. A sentence never joins two lines. */
export function splitUnits(text: string, split: SplitMode): string[] {
  const lines = normalizeNewlines(text)
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line !== '');
  if (split === 'lines') return lines;
  return lines.flatMap((line) =>
    line
      .split(SENTENCE_BREAK)
      .map((part) => part.trim())
      .filter((part) => part !== ''),
  );
}

function hardBreak(word: string, max: number): string[] {
  const chars = [...word];
  const pieces: string[] = [];
  for (let index = 0; index < chars.length; index += max) pieces.push(chars.slice(index, index + max).join(''));
  return pieces;
}

function greedyLines(words: readonly string[], max: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current === '') current = word;
    else if (charCount(`${current} ${word}`) <= max) current = `${current} ${word}`;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

/** Two lines of about the same length, each at most max. Falls back to the greedy pair. */
function balancePair(first: string, second: string, max: number): string {
  const words = `${first} ${second}`.split(' ');
  let best = `${first}\n${second}`;
  let bestLongest = Math.max(charCount(first), charCount(second));
  for (let cut = 1; cut < words.length; cut += 1) {
    const top = words.slice(0, cut).join(' ');
    const bottom = words.slice(cut).join(' ');
    const longest = Math.max(charCount(top), charCount(bottom));
    if (longest <= max && longest < bestLongest) {
      best = `${top}\n${bottom}`;
      bestLongest = longest;
    }
  }
  return best;
}

/**
 * A unit of at most 42 characters stays one line. A longer unit is word-wrapped
 * into lines of at most 42 characters, and every two lines make one subtitle.
 */
export function wrapUnit(unit: string, max = MAX_LINE): string[] {
  if (charCount(unit) <= max) return [unit];
  const words = unit.split(' ').flatMap((word) => (charCount(word) > max ? hardBreak(word, max) : [word]));
  const lines = greedyLines(words, max);
  const chunks: string[] = [];
  for (let index = 0; index < lines.length; index += 2) {
    const first = lines[index] ?? '';
    const second = lines[index + 1];
    chunks.push(second === undefined ? first : balancePair(first, second, max));
  }
  return chunks;
}

/** Split [start, end] between chunks in proportion to their length. */
function divide(chunks: readonly string[], start: number, end: number, gapMs = 0): Cue[] {
  const counts = chunks.map(charCount);
  const total = counts.reduce((sum, count) => sum + count, 0) || 1;
  const available = end - start - gapMs * (chunks.length - 1);
  const cues: Cue[] = [];
  let before = 0;
  chunks.forEach((text, index) => {
    const after = before + (counts[index] ?? 0);
    cues.push({
      start: start + Math.round((available * before) / total) + gapMs * index,
      end: start + Math.round((available * after) / total) + gapMs * index,
      text,
    });
    before = after;
  });
  return cues;
}

/** Plain text mode: each line (or sentence) becomes one or more subtitles, timed by reading speed. */
export function plainTextToCues(text: string, options: PlainOptions = DEFAULT_PLAIN): FromTextResult {
  const chunks = splitUnits(text, options.split).flatMap((unit) => wrapUnit(unit));
  if (chunks.length === 0) return { cues: [], error: 'Add some text first.', warnings: [] };

  if (options.totalMs !== null) {
    const available = options.totalMs - options.startMs - options.gapMs * (chunks.length - 1);
    if (available < chunks.length) {
      return {
        cues: [],
        error: 'The total duration must be longer than the start time plus all the gaps.',
        warnings: [],
      };
    }
    return { cues: divide(chunks, options.startMs, options.totalMs, options.gapMs), error: null, warnings: [] };
  }

  const cues: Cue[] = [];
  let at = options.startMs;
  for (const chunk of chunks) {
    const end = at + readingMs(chunk, options);
    cues.push({ start: at, end, text: chunk });
    at = end + options.gapMs;
  }
  return { cues, error: null, warnings: [] };
}

const STAMP = String.raw`(?:\d+:)?\d{1,2}:\d{2}(?:[.,]\d{1,3})?`;
const ARROW_LINE = new RegExp(String.raw`^(${STAMP})\s*-->\s*(${STAMP})(?:\s.*)?$`);
const LEAD_STAMP = new RegExp(String.raw`^(?:\[(${STAMP})\]|\((${STAMP})\)|(${STAMP}))(?:\s+[-–—]\s+|\s+|$)(.*)$`);

type Entry = { start: number; end: number | null; lines: string[] };

/**
 * Text with timestamps mode. Recognises `00:01:05 text`, `[00:01:05] text`, `1:05 text`,
 * a timestamp alone on its line with the text below (YouTube transcript), and
 * `00:01:05,200 --> 00:01:07,000` on its own line with the text below.
 * Each subtitle ends when the next one starts; the last one gets its reading time.
 */
export function timestampedTextToCues(text: string, options: ReadingOptions): FromTextResult {
  const lines = normalizeNewlines(text).split('\n');
  const entries: Entry[] = [];
  let skipped = 0;
  let reordered = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = (lines[index] ?? '').replace(/\s+/g, ' ').trim();
    if (line === '') continue;

    const arrow = ARROW_LINE.exec(line);
    if (arrow) {
      const start = parseClock(arrow[1] ?? '');
      const end = parseClock(arrow[2] ?? '');
      if (start !== null && end !== null) {
        entries.push({ start, end, lines: [] });
        continue;
      }
    }

    const lead = LEAD_STAMP.exec(line);
    if (lead) {
      const start = parseClock(lead[1] ?? lead[2] ?? lead[3] ?? '');
      if (start !== null) {
        const rest = (lead[4] ?? '').trim();
        entries.push({ start, end: null, lines: rest === '' ? [] : [rest] });
        continue;
      }
    }

    const nextLine = (lines.slice(index + 1).find((candidate) => candidate.trim() !== '') ?? '').trim();
    if (/^\d+$/.test(line) && ARROW_LINE.test(nextLine)) continue;

    const current = entries[entries.length - 1];
    if (current) current.lines.push(line);
    else skipped += 1;
  }

  const cues: Cue[] = [];
  entries.forEach((entry, index) => {
    const body = entry.lines.join(' ');
    if (body === '') return;
    const next = entries[index + 1];
    let end = entry.end ?? next?.start ?? null;
    if (end === null || end <= entry.start) {
      if (end !== null) reordered += 1;
      end = entry.start + readingMs(body, options);
    }
    cues.push(...divide(wrapUnit(body), entry.start, end));
  });

  const warnings: string[] = [];
  if (skipped > 0) {
    warnings.push(
      skipped === 1
        ? '1 line before the first timestamp was skipped.'
        : `${skipped} lines before the first timestamp were skipped.`,
    );
  }
  if (reordered > 0) {
    warnings.push(
      reordered === 1
        ? '1 timestamp was not later than the one before it, so that subtitle was timed by reading speed.'
        : `${reordered} timestamps were not later than the ones before them, so those subtitles were timed by reading speed.`,
    );
  }
  if (cues.length === 0) {
    return { cues: [], error: 'No timestamps with text were found. Try "Plain text" mode.', warnings };
  }
  return { cues, error: null, warnings };
}
