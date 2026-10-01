import { classifyCueShift } from '../subs/shift';
import { formatAssTimestamp, formatSrtTimestamp, formatVttTimestamp } from '../subs/time';
import type { Cue, SubtitleFormat } from '../subs/types';

export type ShiftPreviewRow = {
  number: number;
  oldStart: string;
  newStart: string;
  text: string;
};

function formatStart(ms: number, format: SubtitleFormat): string {
  if (format === 'vtt') return formatVttTimestamp(ms);
  if (format === 'ass') return formatAssTimestamp(ms);
  return formatSrtTimestamp(ms);
}

export function formatOffsetLabel(offsetMs: number): string {
  const sign = offsetMs < 0 ? '−' : '';
  return `${sign}${Math.abs(offsetMs)} ms`;
}

/** Tag next to Preview. `fromCue` is 1-based. */
export function shiftPreviewTag(offsetMs: number, cueCount: number, fromCue?: number): string {
  const offset = formatOffsetLabel(offsetMs);
  if (fromCue !== undefined && fromCue >= 1) return `${offset} · from line ${fromCue}`;
  const noun = cueCount === 1 ? 'cue' : 'cues';
  return `${offset} · all ${cueCount} ${noun}`;
}

export function fileCueLine(label: string, cueCount: number, encoding: string): string {
  const noun = cueCount === 1 ? 'cue' : 'cues';
  const encoded = encoding.toLowerCase() === 'utf-8' ? 'UTF-8' : encoding;
  return `${label} · ${cueCount} ${noun} · ${encoded}`;
}

/** First `limit` cues that survive the same shift the download uses. */
export function shiftPreviewRows(
  cues: readonly Cue[],
  offsetMs: number,
  fromCue: number | undefined,
  format: SubtitleFormat,
  limit = 6,
): { rows: ShiftPreviewRow[]; cueCount: number; tag: string } {
  const rows: ShiftPreviewRow[] = [];
  let cueCount = 0;

  cues.forEach((cue, index) => {
    const change = classifyCueShift(cue, offsetMs, index, fromCue);
    if (change.kind === 'removed') return;
    cueCount += 1;
    if (rows.length >= limit) return;
    rows.push({
      number: cueCount,
      oldStart: formatStart(cue.start, format),
      newStart: formatStart(change.cue.start, format),
      text: change.cue.text,
    });
  });

  return { rows, cueCount, tag: shiftPreviewTag(offsetMs, cueCount, fromCue) };
}

const PREVIEW_LIMIT = 6;

/** Paint the first cues straight into the row template. Keeps this chunk free of row-object keys. */
export function applyShiftPreview(
  list: HTMLElement,
  sample: HTMLElement,
  tag: HTMLElement,
  cues: readonly Cue[],
  offsetMs: number,
  fromCue: number | undefined,
  format: SubtitleFormat,
): void {
  const lines: HTMLElement[] = [];
  let count = 0;
  cues.forEach((cue, index) => {
    const change = classifyCueShift(cue, offsetMs, index, fromCue);
    if (change.kind === 'removed') return;
    count += 1;
    if (count > PREVIEW_LIMIT) return;
    const line = sample.cloneNode(true) as HTMLElement;
    const cells = line.children;
    const times = cells[1] as HTMLElement;
    cells[0].textContent = String(count);
    times.children[0].textContent = formatStart(cue.start, format);
    times.children[1].textContent = formatStart(change.cue.start, format);
    cells[2].textContent = change.cue.text.replace(/\s+/g, ' ').trim();
    lines.push(line);
  });
  list.replaceChildren(...lines);
  tag.textContent = shiftPreviewTag(offsetMs, count, fromCue);
}
