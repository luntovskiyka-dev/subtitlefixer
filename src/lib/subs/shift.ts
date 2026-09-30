import type { Cue } from './types';

function copyCue(cue: Cue, start: number, end: number): Cue {
  const next: Cue = { start, end, text: cue.text };
  if (cue.style !== undefined) next.style = cue.style;
  return next;
}

export type ShiftResult = {
  cues: Cue[];
  removed: number;
  trimmed: number;
};

/** How one cue changes. `fromCue` is 1-based; cues before it are copied. */
export type CueShift =
  | { kind: 'unchanged'; cue: Cue }
  | { kind: 'removed' }
  | { kind: 'shifted'; cue: Cue; trimmed: boolean };

export function classifyCueShift(
  cue: Cue,
  offsetMs: number,
  index: number,
  fromCue?: number,
): CueShift {
  const first = fromCue !== undefined && fromCue >= 1 ? fromCue : 1;
  if (index + 1 < first) return { kind: 'unchanged', cue: copyCue(cue, cue.start, cue.end) };

  const start = cue.start + offsetMs;
  const end = cue.end + offsetMs;
  // Fully before zero, ending on 00:00:00,000, or zero-length there.
  if (end <= 0) return { kind: 'removed' };
  if (start < 0) return { kind: 'shifted', cue: copyCue(cue, 0, end), trimmed: true };
  return { kind: 'shifted', cue: copyCue(cue, start, end), trimmed: false };
}

/**
 * Add `offsetMs` to each selected cue.
 * `fromCue` is 1-based. Omit it, or pass a value below 1, to shift every cue.
 * Cues before that line are copied and are not counted as trimmed or removed.
 * Does not mutate `cues`.
 */
export function shiftCues(cues: readonly Cue[], offsetMs: number, fromCue?: number): ShiftResult {
  const next: Cue[] = [];
  let removed = 0;
  let trimmed = 0;

  cues.forEach((cue, index) => {
    const change = classifyCueShift(cue, offsetMs, index, fromCue);
    if (change.kind === 'removed') {
      removed += 1;
      return;
    }
    next.push(change.cue);
    if (change.kind === 'shifted' && change.trimmed) trimmed += 1;
  });

  return { cues: next, removed, trimmed };
}
