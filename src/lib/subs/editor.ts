import { parseSrt } from './srt';
import type { Cue, ParseError, SubtitleFormat } from './types';
import { parseVtt } from './vtt';

export type EditorCue = {
  id: string;
  start: number;
  end: number;
  text: string;
};

export type CueIssue = 'negative' | 'zero' | 'overlap' | 'empty' | 'order';

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

/** Load SRT or VTT for the editor. A cue that ends before it starts is kept. */
export function loadEditorCues(
  text: string,
  format: 'srt' | 'vtt',
  idAt: (index: number) => string,
): { cues: EditorCue[]; errors: ParseError[] } {
  const parsed = format === 'srt' ? parseSrt(text, { keepInverted: true }) : parseVtt(text, { keepInverted: true });
  return { cues: editorCuesFrom(parsed.cues, idAt), errors: parsed.errors };
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
    else if (cue.end === cue.start) add(cue.id, 'zero');
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
  if (issue === 'zero') return 'Lasts zero seconds';
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

export function cloneEditorCues(cues: readonly EditorCue[]): EditorCue[] {
  return cues.map((cue) => ({ id: cue.id, start: cue.start, end: cue.end, text: cue.text }));
}

/** One undo step. The stored rows are copies, so later edits do not change them. */
export function rememberEditorCues(
  history: readonly (readonly EditorCue[])[],
  cues: readonly EditorCue[],
  limit = 50,
): EditorCue[][] {
  const next = [...history.map((step) => cloneEditorCues(step)), cloneEditorCues(cues)];
  return next.length > limit ? next.slice(next.length - limit) : next;
}

export function undoEditorCues(history: readonly (readonly EditorCue[])[]): { history: EditorCue[][]; cues: EditorCue[] | null } {
  if (history.length === 0) return { history: [], cues: null };
  const cues = history[history.length - 1] ?? null;
  return {
    history: history.slice(0, -1).map((step) => cloneEditorCues(step)),
    cues: cues ? cloneEditorCues(cues) : null,
  };
}

/** Classes that show Undo as ready or unavailable. Shared chrome (size, radius) stays put. */
export const UNDO_READY_CLASSES = ['border-edge', 'bg-surface', 'text-ink', 'shadow-hard-sm'] as const;
export const UNDO_DISABLED_CLASSES = ['border-dashed', 'border-muted', 'bg-subtle', 'text-muted', 'shadow-none'] as const;

/** Undo is available only when the stack has a step. `aria-disabled` follows that, not the initial markup. */
export function undoButtonState(steps: number): {
  disabled: boolean;
  ariaDisabled: 'true' | null;
  add: readonly string[];
  remove: readonly string[];
} {
  const disabled = steps <= 0;
  return {
    disabled,
    ariaDisabled: disabled ? 'true' : null,
    add: disabled ? UNDO_DISABLED_CLASSES : UNDO_READY_CLASSES,
    remove: disabled ? UNDO_READY_CLASSES : UNDO_DISABLED_CLASSES,
  };
}

/**
 * One undo step for a run of typing. The first keystroke in a focus session stores the text
 * from before that keystroke. Later keystrokes in the same session do not add steps.
 */
export function pushTextUndo(
  history: readonly (readonly EditorCue[])[],
  cues: readonly EditorCue[],
  sessionOpen: boolean,
): { history: EditorCue[][]; sessionOpen: true } {
  if (sessionOpen) return { history: history.map((step) => cloneEditorCues(step)), sessionOpen: true };
  return { history: rememberEditorCues(history, cues), sessionOpen: true };
}

/** Home goes to the first cue. End goes to the last scroll pixel, which includes the last cue. */
export function editorEdgeOffset(key: 'Home' | 'End', scrollHeight: number, clientHeight: number): number {
  if (key === 'Home') return 0;
  return Math.max(0, scrollHeight - Math.max(0, clientHeight));
}

/** Merge index with the next row. Null when there is no next row. */
export function mergeEditorCueAt(cues: readonly EditorCue[], index: number): EditorCue[] | null {
  const first = cues[index];
  const second = cues[index + 1];
  if (!first || !second) return null;
  const next = cues.slice();
  next.splice(index, 2, mergeEditorCues(first, second));
  return next;
}

/**
 * Empty lines are not written unless the user chooses to skip them.
 * `blocked` means the download should not start.
 */
export function cuesForDownload(
  cues: readonly EditorCue[],
  skipEmpty: boolean,
): { cues: EditorCue[]; skipped: number; blocked: boolean } {
  const skipped = cues.filter((cue) => cue.text.trim() === '').length;
  if (skipped === 0) return { cues: cues.slice(), skipped: 0, blocked: false };
  if (!skipEmpty) return { cues: [], skipped, blocked: true };
  const kept = cues.filter((cue) => cue.text.trim() !== '');
  if (kept.length === 0) return { cues: [], skipped, blocked: true };
  return { cues: kept, skipped, blocked: false };
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

/** Scroll height stays `count * rowHeight` wherever the window sits, so the scrollbar does not collapse. */
export function virtualCueBox(count: number, range: VisibleRange, rowHeight: number): { total: number; offset: number } {
  const height = rowHeight > 0 ? rowHeight : 1;
  return { total: Math.max(0, count) * height, offset: range.start * height };
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
