import { mapAssDialogueTimes, parseAss, serializeAss } from './ass';
import { parseSrt, serializeSrt } from './srt';
import type { Cue, ParseError, ParseResult, SubtitleFormat } from './types';
import { parseVtt, serializeVtt } from './vtt';

/** 23.976 fps, written as the fraction 24000/1001. */
export const FPS_23_976 = 24000 / 1001;

export type DriftResult = {
  cues: Cue[];
  removed: number;
  trimmed: number;
};

export type DriftFileResult = DriftResult & {
  text: string;
  errors: ParseError[];
};

function copyCue(cue: Cue, start: number, end: number): Cue {
  const next: Cue = { start, end, text: cue.text };
  if (cue.style !== undefined) next.style = cue.style;
  return next;
}

/** Drop a cue that ends at or before zero. Pull a negative start up to zero. */
function settle(start: number, end: number): { start: number; end: number; trimmed: boolean } | null {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= 0) return null;
  if (start < 0) return { start: 0, end, trimmed: true };
  return { start, end, trimmed: false };
}

function applyProjected(cues: readonly Cue[], project: (ms: number) => number): DriftResult {
  const next: Cue[] = [];
  let removed = 0;
  let trimmed = 0;

  for (const cue of cues) {
    const settled = settle(project(cue.start), project(cue.end));
    if (!settled) {
      removed += 1;
      continue;
    }
    next.push(copyCue(cue, settled.start, settled.end));
    if (settled.trimmed) trimmed += 1;
  }

  return { cues: next, removed, trimmed };
}

/**
 * t' = a·t + b, with a = (t2' − t1') / (t2 − t1) and b = t1' − a·t1.
 * t1 and t2 are the two cues' current start times.
 */
function linearProject(
  t1: number,
  t1Prime: number,
  t2: number,
  t2Prime: number,
): (ms: number) => number {
  if (![t1, t1Prime, t2, t2Prime].every((value) => Number.isFinite(value))) {
    throw new Error('Sync times must be finite.');
  }
  if (t1 === t2) {
    throw new Error('The two cues start at the same time.');
  }
  const a = (t2Prime - t1Prime) / (t2 - t1);
  const b = t1Prime - a * t1;
  return (ms: number) => Math.round(a * ms + b);
}

/** scale = subtitleFps / videoFps, then round to whole milliseconds. */
function scaleProject(subtitleFps: number, videoFps: number): (ms: number) => number {
  if (!Number.isFinite(subtitleFps) || !Number.isFinite(videoFps) || videoFps === 0) {
    throw new Error('Frame rates must be finite, and the video frame rate must not be zero.');
  }
  const scale = subtitleFps / videoFps;
  return (ms: number) => Math.round(ms * scale);
}

function parseFormat(input: string, format: SubtitleFormat): ParseResult {
  switch (format) {
    case 'srt':
      return parseSrt(input);
    case 'vtt':
      return parseVtt(input);
    case 'ass':
      return parseAss(input);
    default: {
      const unreachable: never = format;
      throw new Error(`Unknown subtitle format: ${String(unreachable)}`);
    }
  }
}

function serializeFormat(cues: readonly Cue[], format: SubtitleFormat): string {
  switch (format) {
    case 'srt':
      return serializeSrt(cues);
    case 'vtt':
      return serializeVtt(cues);
    case 'ass':
      return serializeAss(cues);
    default: {
      const unreachable: never = format;
      throw new Error(`Unknown subtitle format: ${String(unreachable)}`);
    }
  }
}

function writeMapped(text: string, format: SubtitleFormat, project: (ms: number) => number): DriftFileResult {
  const parsed = parseFormat(text, format);
  const result = applyProjected(parsed.cues, project);
  const written =
    format === 'ass'
      ? mapAssDialogueTimes(text, (cue) => {
          const settled = settle(project(cue.start), project(cue.end));
          if (!settled) return null;
          return { start: settled.start, end: settled.end };
        })
      : serializeFormat(result.cues, format);
  return { ...result, text: written, errors: parsed.errors };
}

/** Apply t' = a·t + b to every cue start and end. Does not mutate `cues`. */
export function syncCues(
  cues: readonly Cue[],
  t1: number,
  t1Prime: number,
  t2: number,
  t2Prime: number,
): DriftResult {
  return applyProjected(cues, linearProject(t1, t1Prime, t2, t2Prime));
}

/** Scale every cue by subtitleFps / videoFps and round to whole milliseconds. */
export function scaleCues(cues: readonly Cue[], subtitleFps: number, videoFps: number): DriftResult {
  return applyProjected(cues, scaleProject(subtitleFps, videoFps));
}

export function syncSubtitleFile(
  text: string,
  format: SubtitleFormat,
  t1: number,
  t1Prime: number,
  t2: number,
  t2Prime: number,
): DriftFileResult {
  return writeMapped(text, format, linearProject(t1, t1Prime, t2, t2Prime));
}

export function scaleSubtitleFile(
  text: string,
  format: SubtitleFormat,
  subtitleFps: number,
  videoFps: number,
): DriftFileResult {
  return writeMapped(text, format, scaleProject(subtitleFps, videoFps));
}
