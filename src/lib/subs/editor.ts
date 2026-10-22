import type { Cue, SubtitleFormat } from './types';

export type EditorCue = {
  id: string;
  start: number;
  end: number;
  text: string;
};

export type CueIssue = 'negative' | 'overlap' | 'empty' | 'order';

/** Render every row at this size and below. Above it, only a window of rows is built. */
export const EDITOR_VIRTUAL_THRESHOLD = 1000;
export const EDITOR_ROW_HEIGHT = 188;

const EDITOR_TIME = /^(\d+):([0-5]\d):([0-5]\d)[,.](\d{1,3})$/;

/** hh:mm:ss,mmm or hh:mm:ss.mmm. Anything else is null. */
export function parseEditorTime(value: string): number | null {
  const match = EDITOR_TIME.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const fraction = match[4] ?? '';
  const ms = Number(fraction.padEnd(3, '0'));
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + ms;
}

export function editorCuesFrom(cues: readonly Cue[], idAt: (index: number) => string): EditorCue[] {
  return cues.map((cue, index) => ({
    id: idAt(index),
    start: cue.start,
    end: cue.end,
    text: cue.text,
  }));
}

/** end before start, overlap with the next row, empty text, or a start before the previous start. */
export function cueIssues(cues: readonly EditorCue[]): Map<string, CueIssue[]> {
  const issues = new Map<string, CueIssue[]>();
  const add = (id: string, issue: CueIssue) => {
    const list = issues.get(id);
    if (list) list.push(issue);
    else issues.set(id, [issue]);
  };
  cues.forEach((cue, index) => {
    if (cue.end < cue.start) add(cue.id, 'negative');
    if (cue.text.trim() === '') add(cue.id, 'empty');
    const previous = cues[index - 1];
    if (previous && cue.start < previous.start) add(cue.id, 'order');
    const next = cues[index + 1];
    if (next && cue.end > next.start) add(cue.id, 'overlap');
  });
  return issues;
}

export function issueLabel(issue: CueIssue): string {
  if (issue === 'negative') return 'Ends before it starts';
  if (issue === 'overlap') return 'Overlaps the next line';
  if (issue === 'empty') return 'No text';
  return 'Out of order';
}

/**
 * Split one cue at a UTF-16 cursor. Times are split by character count, at least 1 ms each.
 * A cursor at either end, or a cue shorter than 2 ms, returns null.
 */
export function splitEditorCue(cue: EditorCue, cursor: number, nextId: () => string): [EditorCue, EditorCue] | null {
  const length = cue.text.length;
  const at = Math.trunc(cursor);
  if (at <= 0 || at >= length) return null;
  const duration = cue.end - cue.start;
  if (duration < 2) return null;
  const span = Math.min(duration - 1, Math.max(1, Math.round((duration * at) / length)));
  const first: EditorCue = { id: cue.id, start: cue.start, end: cue.start + span, text: cue.text.slice(0, at) };
  const second: EditorCue = { id: nextId(), start: cue.start + span, end: cue.end, text: cue.text.slice(at) };
  return [first, second];
}

/** Start of the first, end of the second, text joined with a newline. */
export function mergeEditorCues(first: EditorCue, second: EditorCue): EditorCue {
  const left = first.text.replace(/\n+$/, '');
  const right = second.text.replace(/^\n+/, '');
  const text = left === '' ? right : right === '' ? left : `${left}\n${right}`;
  return { id: first.id, start: first.start, end: second.end, text };
}

/** A blank cue after the previous one, or at 00:00:00,000 when there is no previous cue. */
export function blankCueAfter(previous: EditorCue | null, id: string): EditorCue {
  const start = previous ? previous.end : 0;
  return { id, start, end: start + 2000, text: '' };
}

export function sortForDownload(cues: readonly EditorCue[]): { cues: EditorCue[]; orderChanged: boolean } {
  const sorted = [...cues].sort((a, b) => a.start - b.start || a.end - b.end || a.id.localeCompare(b.id));
  const orderChanged = sorted.some((cue, index) => cue.id !== cues[index]?.id);
  return { cues: sorted, orderChanged };
}

export type VisibleRange = { start: number; end: number };

/** Full list up to the threshold. Above it, the rows that cover the scroll window, plus overscan. */
export function visibleCueRange(
  count: number,
  scrollTop: number,
  viewHeight: number,
  rowHeight: number,
  overscan = 6,
): VisibleRange {
  if (count <= EDITOR_VIRTUAL_THRESHOLD) return { start: 0, end: count };
  const height = rowHeight > 0 ? rowHeight : 1;
  const start = Math.max(0, Math.floor(Math.max(0, scrollTop) / height) - overscan);
  const visible = Math.ceil(Math.max(viewHeight, height) / height) + overscan * 2;
  return { start, end: Math.min(count, start + visible) };
}

export function editorOutputName(name: string, format: 'srt' | 'vtt'): string {
  const base = name.replace(/\.(?:srt|vtt|ass|ssa)$/i, '') || 'subtitles';
  return `${base}.${format}`;
}

export function editorFormatFromName(name: string): SubtitleFormat | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.srt')) return 'srt';
  if (lower.endsWith('.vtt')) return 'vtt';
  if (lower.endsWith('.ass') || lower.endsWith('.ssa')) return 'ass';
  return null;
}

export function formatIssueCount(issues: ReadonlyMap<string, readonly CueIssue[]>): string {
  const count = issues.size;
  if (count === 0) return '';
  return `${count} line${count === 1 ? '' : 's'} need${count === 1 ? 's' : ''} attention.`;
}
