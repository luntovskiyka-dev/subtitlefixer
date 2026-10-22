import { readingMs, DEFAULT_PLAIN } from './fromText';
import { decodeVttEntities } from './vtt';
import type { Cue } from './types';

export type SmiClass = {
  id: string;
  name: string | null;
  lang: string | null;
};

export type SmiGroup = SmiClass & {
  cues: Cue[];
};

export type SmiResult = {
  groups: SmiGroup[];
  warnings: string[];
  /** Cues dropped because the end time was not after the start time. */
  dropped: number;
  error: string | null;
};

const SYNC_TAG = /<sync\b([^>]*)>/gi;
const PARAGRAPH = /<p\b([^>]*)>([\s\S]*?)(?=<p\b|<\/p>|$)/gi;
const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const CLASS_RULE = /\.([A-Za-z0-9_-]+)\s*\{([^}]*)\}/g;
const START_ATTR = /(?:^|\s)start\s*=\s*(?:"(\d+)"|'(\d+)'|(\d+))/i;
const CLASS_ATTR = /(?:^|\s)class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const DEFAULT_CLASS = 'default';

export function isSmiName(name: string): boolean {
  return /\.(?:smi|sami)$/i.test(name);
}

/** movie.smi -> movie.srt. A file with several languages becomes movie.KRCC.srt. */
export function smiOutputNames(items: readonly { name: string; classId: string; multi: boolean }[]): string[] {
  const used = new Set<string>();
  return items.map((item) => {
    const base = item.name.replace(/\.(?:smi|sami)$/i, '') || 'subtitles';
    const stem = item.multi ? `${base}.${item.classId}` : base;
    let candidate = `${stem}.srt`;
    let copy = 2;
    while (used.has(candidate.toLowerCase())) {
      candidate = `${stem} (${copy}).srt`;
      copy += 1;
    }
    used.add(candidate.toLowerCase());
    return candidate;
  });
}

function stripComments(input: string): string {
  return input.replace(/<!--[\s\S]*?-->/g, '');
}

function field(block: string, name: string): string | null {
  const match = new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;}]+)`, 'i').exec(block);
  const value = match?.[1]?.trim() ?? '';
  return value === '' ? null : value;
}

function classMeta(input: string): Map<string, { name: string | null; lang: string | null }> {
  const meta = new Map<string, { name: string | null; lang: string | null }>();
  for (const style of input.matchAll(STYLE_BLOCK)) {
    const body = style[1] ?? '';
    for (const rule of body.matchAll(CLASS_RULE)) {
      const id = rule[1] ?? '';
      if (id === '' || meta.has(id.toLowerCase())) continue;
      const block = rule[2] ?? '';
      meta.set(id.toLowerCase(), { name: field(block, 'Name'), lang: field(block, 'lang') });
    }
  }
  return meta;
}

function attribute(source: string, pattern: RegExp): string | null {
  const match = pattern.exec(source);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

/** Tags other than i, b and u go away. br becomes a newline. nbsp-only text becomes empty. */
export function cleanSmiText(raw: string): string {
  const kept = raw.replace(/<(\/?)([a-z0-9]+)(?:\s[^<>]*)?\s*\/?>/gi, (_whole, slash: string, name: string) => {
    const tag = name.toLowerCase();
    if (tag === 'br') return '\n';
    if (tag === 'i' || tag === 'b' || tag === 'u') return `<${slash}${tag}>`;
    return '';
  });
  const decoded = decodeVttEntities(kept).replace(/\u00a0/g, ' ');
  return decoded
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line !== '')
    .join('\n');
}

type Event = { start: number; text: string };

function cuesFromEvents(events: readonly Event[]): { cues: Cue[]; dropped: number } {
  const cues: Cue[] = [];
  let dropped = 0;
  let open: Event | null = null;
  const close = (end: number) => {
    if (!open) return;
    if (end > open.start) cues.push({ start: open.start, end, text: open.text });
    else dropped += 1;
    open = null;
  };
  for (const event of events) {
    close(event.start);
    if (event.text !== '') open = event;
  }
  if (open) {
    const duration = readingMs(open.text, DEFAULT_PLAIN);
    cues.push({ start: open.start, end: open.start + duration, text: open.text });
  }
  return { cues, dropped };
}

/**
 * SAMI (.smi, .sami) to cues, one group per language class.
 * An empty sync (often `&nbsp;`) ends the previous cue and adds none.
 * The last cue, which has no following sync, is timed by reading speed.
 */
export function parseSmi(input: string): SmiResult {
  const meta = classMeta(input);
  const source = stripComments(input);
  const tags = [...source.matchAll(SYNC_TAG)];
  if (tags.length === 0) {
    return { groups: [], warnings: [], dropped: 0, error: "This doesn't look like an SMI file." };
  }

  const warnings: string[] = [];
  const syncs: { start: number; html: string }[] = [];
  let skipped = 0;
  let unordered = false;
  let previous = -1;
  for (let index = 0; index < tags.length; index += 1) {
    const tag = tags[index];
    if (!tag) continue;
    const startText = attribute(tag[1] ?? '', START_ATTR);
    const start = startText === null ? Number.NaN : Number(startText);
    if (!Number.isInteger(start)) {
      skipped += 1;
      continue;
    }
    if (start < previous) unordered = true;
    previous = start;
    const from = (tag.index ?? 0) + tag[0].length;
    const to = tags[index + 1]?.index ?? source.length;
    syncs.push({ start, html: source.slice(from, to) });
  }
  if (skipped > 0) warnings.push(`${skipped} sync point${skipped === 1 ? '' : 's'} had no start time and ${skipped === 1 ? 'was' : 'were'} skipped.`);
  if (syncs.length === 0) {
    return { groups: [], warnings, dropped: 0, error: "This doesn't look like an SMI file." };
  }
  if (unordered) warnings.push('Sync points were out of order and have been sorted.');
  syncs.sort((a, b) => a.start - b.start);

  const events = new Map<string, Event[]>();
  const order: string[] = [];
  const remember = (id: string) => {
    const key = id.toLowerCase();
    if (events.has(key)) return key;
    events.set(key, []);
    order.push(id);
    return key;
  };

  for (const sync of syncs) {
    const paragraphs = [...sync.html.matchAll(PARAGRAPH)];
    if (paragraphs.length === 0) continue;
    const byClass = new Map<string, string[]>();
    const seen: string[] = [];
    for (const paragraph of paragraphs) {
      const className = attribute(paragraph[1] ?? '', CLASS_ATTR)?.trim() || DEFAULT_CLASS;
      const key = remember(className);
      const bucket = byClass.get(key);
      if (bucket) bucket.push(paragraph[2] ?? '');
      else {
        byClass.set(key, [paragraph[2] ?? '']);
        seen.push(key);
      }
    }
    for (const key of seen) {
      events.get(key)?.push({ start: sync.start, text: cleanSmiText((byClass.get(key) ?? []).join('\n')) });
    }
  }

  if (order.length === 0) {
    return { groups: [], warnings, dropped: 0, error: "This doesn't look like an SMI file." };
  }

  let dropped = 0;
  const groups: SmiGroup[] = order.map((id) => {
    const key = id.toLowerCase();
    const built = cuesFromEvents(events.get(key) ?? []);
    dropped += built.dropped;
    const info = meta.get(key);
    return { id, name: info?.name ?? null, lang: info?.lang ?? null, cues: built.cues };
  });
  if (dropped > 0) {
    warnings.push(`${dropped} subtitle${dropped === 1 ? '' : 's'} had no duration and ${dropped === 1 ? 'was' : 'were'} left out.`);
  }
  return { groups, warnings, dropped, error: null };
}

export function classLabel(group: SmiClass): string {
  if (group.name && group.name.toLowerCase() !== group.id.toLowerCase()) return `${group.id} — ${group.name}`;
  return group.id;
}

/** The requested class, or the file's first class when that class is missing. */
export function selectSmiGroup(result: SmiResult, classId: string | null): { group: SmiGroup | null; warning: string | null } {
  const first = result.groups[0] ?? null;
  if (!first) return { group: null, warning: null };
  if (classId === null) return { group: first, warning: null };
  const found = result.groups.find((group) => group.id.toLowerCase() === classId.toLowerCase());
  if (found) return { group: found, warning: null };
  return {
    group: first,
    warning: `No ${classId} language in this file. Used ${classLabel(first)} instead.`,
  };
}
