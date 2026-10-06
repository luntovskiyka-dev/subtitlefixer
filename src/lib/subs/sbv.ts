import { serializeSrt } from './srt';
import { splitBlocks } from './text';
import { formatSrtTimestamp, formatVttTimestamp, parseVttTimestamp } from './time';
import type { Cue, ParseError } from './types';
import { serializeVtt } from './vtt';

/**
 * YouTube SubViewer `.sbv` → SRT or VTT.
 * Nothing in this module is sent over the network.
 */

const NO_CUES = 'No SBV cues were found.';

export type SbvOutput = 'srt' | 'vtt';

export type SbvSpan = {
  first: string;
  last: string;
};

export type SbvResult = {
  text: string;
  cues: Cue[];
  errors: ParseError[];
  span: SbvSpan | null;
};

/** A message when this file is not a YouTube `.sbv`, or null when the name is fine. */
export function sbvFileError(name: string): string | null {
  if (!name.toLowerCase().endsWith('.sbv')) return 'Use a YouTube .sbv file.';
  return null;
}

function parseSbvTimeLine(line: string): { start: number; end: number } | null {
  const comma = line.indexOf(',');
  if (comma < 0 || line.indexOf(',', comma + 1) !== -1) return null;
  const start = parseVttTimestamp(line.slice(0, comma));
  const end = parseVttTimestamp(line.slice(comma + 1));
  if (start === null || end === null) return null;
  return { start, end };
}

function spanOf(cues: readonly Cue[], format: SbvOutput): SbvSpan | null {
  const first = cues[0];
  const last = cues[cues.length - 1];
  if (!first || !last) return null;
  const stamp = format === 'vtt' ? formatVttTimestamp : formatSrtTimestamp;
  return { first: stamp(first.start), last: stamp(last.end) };
}

/**
 * Convert a YouTube SubViewer file to SRT (default) or VTT.
 * Each block is `start,end` (`0:00:01.200,0:00:03.800`), then the text, then a blank line.
 * Times stay exact to the millisecond. Hours are written with two digits.
 */
export function sbvToSubtitles(text: string, format: SbvOutput = 'srt'): SbvResult {
  const cues: Cue[] = [];
  const errors: ParseError[] = [];

  for (const [index, block] of splitBlocks(text).entries()) {
    const blockNumber = index + 1;
    const lines = block.split('\n');
    const range = parseSbvTimeLine((lines[0] ?? '').trim());
    if (!range) {
      errors.push({ block: blockNumber, message: `Block ${blockNumber} is not an SBV time line.` });
      continue;
    }
    if (range.end < range.start) {
      errors.push({ block: blockNumber, message: `Block ${blockNumber} ends before it starts.` });
      continue;
    }
    const cueText = lines.slice(1).join('\n');
    if (cueText.trim() === '') {
      errors.push({ block: blockNumber, message: `Block ${blockNumber} has no caption text.` });
      continue;
    }
    cues.push({ start: range.start, end: range.end, text: cueText });
  }

  if (cues.length === 0) {
    errors.push({ block: 1, message: NO_CUES });
    return { text: '', cues, errors, span: null };
  }

  return {
    text: format === 'vtt' ? serializeVtt(cues) : serializeSrt(cues),
    cues,
    errors,
    span: spanOf(cues, format),
  };
}

/** `movie.sbv` → `movie.srt` or `movie.vtt`, with a suffix when two files would share a name. */
export function outputNamesForSbv(names: readonly string[], extension: SbvOutput): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    const stripped = name.replace(/\.sbv$/i, '');
    const base = stripped === '' || stripped === name ? 'subtitles' : stripped;
    let candidate = `${base}.${extension}`;
    let copy = 2;
    while (used.has(candidate.toLowerCase())) {
      candidate = `${base} (${copy}).${extension}`;
      copy += 1;
    }
    used.add(candidate.toLowerCase());
    return candidate;
  });
}
