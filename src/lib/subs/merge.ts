import { assToCues } from './assToSrt';
import { parseSrt, serializeSrt } from './srt';
import { normalizeNewlines } from './text';
import type { Cue, ParseError, SubtitleFormat } from './types';
import { parseVtt, serializeVtt, vttCueTextToSrt } from './vtt';

/** "Two languages (dual)" or "Join parts (CD1 + CD2)". */
export type MergeMode = 'dual' | 'join';

export type MergeInput = {
  cues: Cue[];
  errors: ParseError[];
};

export type DualOptions = {
  /** Put the text of the second file above the text of the first file. */
  secondOnTop: boolean;
};

export type DualResult = {
  cues: Cue[];
  /** Lines of the second file added to a line of the first file. */
  paired: number;
  /** Lines of the second file kept as their own subtitle, with their own times. */
  unpaired: number;
};

/** Trimmed lines, empty lines dropped (an empty line would end an SRT block). */
function tidyText(text: string): string {
  return normalizeNewlines(text)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join('\n');
}

/**
 * One input file as cues ready for an SRT or VTT file. SRT text is kept, VTT text is cleaned
 * as for VTT to SRT (`vttCueTextToSrt`), ASS/SSA as for ASS to SRT (`assToCues`).
 * Cues left with no text are dropped. Parser errors are returned unchanged.
 */
export function readMergeInput(input: string, format: SubtitleFormat): MergeInput {
  const parsed = format === 'srt' ? parseSrt(input) : format === 'vtt' ? parseVtt(input) : assToCues(input);
  const cues: Cue[] = [];
  for (const cue of parsed.cues) {
    const text = tidyText(format === 'vtt' ? vttCueTextToSrt(cue.text) : cue.text);
    if (text !== '') cues.push({ start: cue.start, end: cue.end, text });
  }
  return { cues, errors: parsed.errors };
}

/** Milliseconds during which both cues are on screen. */
export function overlapMs(a: Cue, b: Cue): number {
  return Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
}

function byStart(cues: readonly Cue[]): Cue[] {
  return cues
    .map((cue, index) => ({ cue, index }))
    .sort((x, y) => x.cue.start - y.cue.start || x.cue.end - y.cue.end || x.index - y.index)
    .map((item) => item.cue);
}

/**
 * Two languages in one file. The first file sets the timings. Each cue of the second file is
 * added to the cue of the first file it overlaps most in time (the earlier one on a tie), so one
 * cue can carry several lines. A cue that overlaps no cue of the first file is kept with its own
 * times. The result is sorted by start time. No cue is lost.
 */
export function mergeDual(first: readonly Cue[], second: readonly Cue[], options: DualOptions): DualResult {
  const main = byStart(first);
  const extra = byStart(second);
  const attached: string[][] = main.map(() => []);
  const alone: Cue[] = [];
  for (const cue of extra) {
    let best = -1;
    let bestOverlap = 0;
    for (let index = 0; index < main.length; index += 1) {
      const candidate = main[index];
      if (!candidate) continue;
      if (candidate.start >= cue.end) break;
      const overlap = overlapMs(candidate, cue);
      if (overlap > bestOverlap) {
        best = index;
        bestOverlap = overlap;
      }
    }
    const list = attached[best];
    if (best >= 0 && list) list.push(cue.text);
    else alone.push({ start: cue.start, end: cue.end, text: cue.text });
  }
  const merged = main.map((cue, index) => {
    const lines = attached[index] ?? [];
    const parts = options.secondOnTop ? [...lines, cue.text] : [cue.text, ...lines];
    return { start: cue.start, end: cue.end, text: parts.join('\n') };
  });
  return {
    cues: byStart([...merged, ...alone]),
    paired: extra.length - alone.length,
    unpaired: alone.length,
  };
}

/** Where part 2 starts when it follows part 1: the end of the last line of part 1, plus the gap. */
export function joinStartMs(first: readonly Cue[], gapMs: number): number {
  let end = 0;
  for (const cue of first) end = Math.max(end, cue.end);
  return end + gapMs;
}

/**
 * Part 2 after part 1. Every time of part 2 moves by `startMs`, so a line at 00:00:02,000
 * of part 2 lands at `startMs` + 2 s. Part 1 is unchanged; the SRT writer numbers the lines again.
 */
export function joinParts(first: readonly Cue[], second: readonly Cue[], startMs: number): Cue[] {
  const moved = second.map((cue) => ({ start: cue.start + startMs, end: cue.end + startMs, text: cue.text }));
  return [...first.map((cue) => ({ start: cue.start, end: cue.end, text: cue.text })), ...moved];
}

/**
 * Text for a VTT file: a bare `&` becomes `&amp;` and a `<` that does not open a tag becomes
 * `&lt;`, so players show them instead of reading them as markup. `<i>`, `<b>`, `<u>` stay.
 */
export function vttSafeText(text: string): string {
  return text.replace(/&(?!(?:#x[0-9a-f]+|#\d+|[a-z]+);)/gi, '&amp;').replace(/<(?!\/?[a-z])/gi, '&lt;');
}

export type MergeOptions = {
  mode: MergeMode;
  output: 'srt' | 'vtt';
  /** Dual only. */
  secondOnTop: boolean;
  /** Join only: pause after the last line of part 1, used when `startMs` is null. */
  gapMs: number;
  /** Join only: where part 2 starts in the joined video; null means after part 1 plus the gap. */
  startMs: number | null;
};

export type MergeResult = {
  text: string;
  /** Subtitles in the merged file. */
  count: number;
  /** Dual only, see `DualResult`. */
  paired: number;
  unpaired: number;
  /** Join only: where part 2 starts. */
  partTwoStartMs: number | null;
  /** Join only: part 2 starts before the last line of part 1 ends. */
  partsOverlap: boolean;
};

/** Merge two files (already read with `readMergeInput`) into one SRT or VTT text. Runs on the device. */
export function mergeSubtitles(first: MergeInput, second: MergeInput, options: MergeOptions): MergeResult {
  let cues: Cue[];
  let paired = 0;
  let unpaired = 0;
  let partTwoStartMs: number | null = null;
  let partsOverlap = false;
  if (options.mode === 'dual') {
    const dual = mergeDual(first.cues, second.cues, { secondOnTop: options.secondOnTop });
    cues = dual.cues;
    paired = dual.paired;
    unpaired = dual.unpaired;
  } else {
    const startMs = options.startMs ?? joinStartMs(first.cues, options.gapMs);
    cues = joinParts(first.cues, second.cues, startMs);
    partTwoStartMs = startMs;
    const firstSecond = second.cues.reduce((min, cue) => Math.min(min, cue.start), Number.POSITIVE_INFINITY);
    partsOverlap = second.cues.length > 0 && startMs + firstSecond < joinStartMs(first.cues, 0);
  }
  const text =
    options.output === 'vtt'
      ? serializeVtt(cues.map((cue) => ({ ...cue, text: vttSafeText(cue.text) })))
      : serializeSrt(cues);
  return { text, count: cues.length, paired, unpaired, partTwoStartMs, partsOverlap };
}

/**
 * Join preview: the last lines of part 1 and the first lines of part 2, numbered as in the joined
 * file. `firstCount` is the number of part 1 subtitles. A VTT file keeps its header line.
 */
export function joinPreview(text: string, firstCount: number, before = 2, after = 3): { preview: string; caption: string } {
  const blocks = text.replace(/\n+$/, '').split('\n\n');
  const header = blocks[0] === 'WEBVTT' ? blocks.shift() : undefined;
  const from = Math.max(0, firstCount - before);
  const to = Math.min(blocks.length, firstCount + after);
  const shown = blocks.slice(from, to);
  const preview = [...(header ? [header] : []), ...shown].join('\n\n');
  return { preview: preview === '' ? '' : `${preview}\n`, caption: `cues ${from + 1}–${to} of ${blocks.length}` };
}

/** movie.en.srt -> movie.en.merged.srt (or .vtt). */
export function mergedFileName(name: string, format: 'srt' | 'vtt'): string {
  const base = name.replace(/\.(?:srt|vtt|ass|ssa)$/i, '') || 'subtitles';
  return `${base}.merged.${format}`;
}
