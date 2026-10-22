import { mapAssDialogueText } from './ass';
import { parse } from './index';
import { serializeSrt } from './srt';
import type { Cue, SubtitleFormat } from './types';
import { serializeVtt } from './vtt';

export type CleanOptions = {
  brackets: boolean;
  parentheses: boolean;
  speakers: boolean;
  music: boolean;
  tags: boolean;
};

export const CLEAN_OFF: CleanOptions = {
  brackets: false,
  parentheses: false,
  speakers: false,
  music: false,
  tags: false,
};

export type CleanPart = { text: string; removed: boolean };

export type CleanPreview = {
  start: number;
  end: number;
  parts: CleanPart[];
  deleted: boolean;
};

export type CleanResult = {
  text: string;
  changed: number;
  deleted: number;
  preview: CleanPreview[];
};

const SPEAKER = /^[A-Z](?:[A-Z0-9 .'-]{0,30})?:\s*/;
const MUSIC = /^[♪♫#\s]+$/;
const MUSIC_MARK = /[♪♫#]/;

function anyOption(options: CleanOptions): boolean {
  return options.brackets || options.parentheses || options.speakers || options.music || options.tags;
}

function cut(parts: readonly CleanPart[], pattern: RegExp): CleanPart[] {
  const next: CleanPart[] = [];
  for (const part of parts) {
    if (part.removed || part.text === '') {
      next.push(part);
      continue;
    }
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const expression = new RegExp(pattern.source, flags);
    let last = 0;
    for (const match of part.text.matchAll(expression)) {
      const at = match.index ?? 0;
      if (at > last) next.push({ text: part.text.slice(last, at), removed: false });
      if (match[0] !== '') next.push({ text: match[0], removed: true });
      last = at + match[0].length;
    }
    if (last < part.text.length) next.push({ text: part.text.slice(last), removed: false });
  }
  return next;
}

function keptText(parts: readonly CleanPart[]): string {
  return parts
    .filter((part) => !part.removed)
    .map((part) => part.text)
    .join('');
}

function markKeptPrefix(parts: readonly CleanPart[], count: number): CleanPart[] {
  let left = count;
  const next: CleanPart[] = [];
  for (const part of parts) {
    if (part.removed || left <= 0) {
      next.push(part);
      continue;
    }
    if (part.text.length <= left) {
      next.push({ text: part.text, removed: true });
      left -= part.text.length;
      continue;
    }
    next.push({ text: part.text.slice(0, left), removed: true });
    next.push({ text: part.text.slice(left), removed: false });
    left = 0;
  }
  return next;
}

function cleanLine(line: string, options: CleanOptions): CleanPart[] {
  let parts: CleanPart[] = [{ text: line, removed: false }];
  if (options.tags) {
    parts = cut(parts, /<\/?[a-z][^>\n]*>/gi);
    parts = cut(parts, /\{\\[^}]*\}/g);
  }
  if (options.brackets) parts = cut(parts, /\[[\s\S]*?\]/g);
  if (options.parentheses) parts = cut(parts, /\([\s\S]*?\)/g);
  if (options.speakers) {
    const match = SPEAKER.exec(keptText(parts));
    if (match?.[0] && /[A-Za-z]/.test(match[0])) parts = markKeptPrefix(parts, match[0].length);
  }
  const kept = keptText(parts).trim();
  if (options.music && kept !== '' && MUSIC.test(kept) && MUSIC_MARK.test(kept)) {
    return [{ text: line, removed: true }];
  }
  if (kept === '') return [{ text: line, removed: true }];
  const trimmed = keptText(parts).trim();
  return [{ text: trimmed, removed: false }, ...parts.filter((part) => part.removed && part.text.trim() !== '')];
}

/** Mark the pieces a cleaner option removes. The kept text is the cue after cleaning. */
export function cleanCueParts(text: string, options: CleanOptions): CleanPart[] {
  const source = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = source.split('\n');
  const parts: CleanPart[] = [];
  const kept: string[] = [];
  lines.forEach((line, index) => {
    const lineParts = cleanLine(line, options);
    const lineKept = keptText(lineParts).trim();
    if (lineKept !== '') kept.push(lineKept);
    parts.push(...lineParts.filter((part) => part.removed && part.text.trim() !== ''));
    if (index < lines.length - 1 && lineKept !== '') parts.push({ text: '\n', removed: false });
  });
  if (kept.length === 0) return [{ text: source, removed: true }];
  const cleaned = kept.join('\n');
  const removed = parts.filter((part) => part.removed);
  if (removed.length === 0) return [{ text: cleaned, removed: false }];
  return [...removed, { text: cleaned, removed: false }];
}

function previewFrom(cues: readonly Cue[], options: CleanOptions): { preview: CleanPreview[]; changed: number; deleted: number; kept: Cue[] } {
  const preview: CleanPreview[] = [];
  const kept: Cue[] = [];
  let changed = 0;
  let deleted = 0;
  for (const cue of cues) {
    const parts = cleanCueParts(cue.text, options);
    const after = keptText(parts).trim();
    const deletedCue = after === '';
    if (deletedCue) deleted += 1;
    else if (after !== cue.text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()) changed += 1;
    preview.push({ start: cue.start, end: cue.end, parts, deleted: deletedCue });
    if (!deletedCue) kept.push({ start: cue.start, end: cue.end, text: after });
  }
  return { preview, changed, deleted, kept };
}

export function cleanSubtitles(input: string, format: SubtitleFormat, options: CleanOptions): CleanResult {
  if (!anyOption(options)) {
    const parsed = parse(input, format);
    return {
      text: input,
      changed: 0,
      deleted: 0,
      preview: parsed.cues.map((cue) => ({
        start: cue.start,
        end: cue.end,
        parts: [{ text: cue.text, removed: false }],
        deleted: false,
      })),
    };
  }

  if (format === 'ass') {
    const preview: CleanPreview[] = [];
    let changed = 0;
    let deleted = 0;
    const text = mapAssDialogueText(input, (cue) => {
      const parts = cleanCueParts(cue.text, options);
      const after = keptText(parts).trim();
      const deletedCue = after === '';
      if (deletedCue) deleted += 1;
      else if (after !== cue.text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()) changed += 1;
      preview.push({ start: cue.start, end: cue.end, parts, deleted: deletedCue });
      if (deletedCue) return null;
      return after === cue.text ? cue.text : after;
    });
    return { text, changed, deleted, preview };
  }

  const parsed = parse(input, format);
  const view = previewFrom(parsed.cues, options);
  const text = format === 'vtt' ? serializeVtt(view.kept) : serializeSrt(view.kept);
  return { text, changed: view.changed, deleted: view.deleted, preview: view.preview };
}
