import { normalizeMs } from './time';
import type { Cue } from './types';

function copyCue(cue: Cue, start: number, end: number): Cue {
  const next: Cue = { start, end, text: cue.text };
  if (cue.style !== undefined) next.style = cue.style;
  return next;
}

/**
 * Add `offsetMs` to each selected cue, then clamp with `normalizeMs`.
 * `fromCue` is 1-based. Omit it, or pass a value below 1, to shift every cue.
 */
export function shiftCues(cues: readonly Cue[], offsetMs: number, fromCue?: number): Cue[] {
  const first = fromCue !== undefined && fromCue >= 1 ? fromCue : 1;
  return cues.map((cue, index) => {
    if (index + 1 < first) return copyCue(cue, cue.start, cue.end);
    const start = normalizeMs(cue.start + offsetMs);
    let end = normalizeMs(cue.end + offsetMs);
    if (end < start) end = start;
    return copyCue(cue, start, end);
  });
}
