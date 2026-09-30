import { parse, serialize } from './index';
import type { Cue, ParseError } from './types';

type Mark = 'i' | 'b';

/** {\p1}, {\p2}, and any other drawing-on tag. {\p0} turns drawing off. */
function hasDrawingOn(text: string): boolean {
  for (const block of text.matchAll(/\{[^}]*\}/g)) {
    for (const code of block[0].matchAll(/\\p(\d+)/gi)) {
      const level = Number(code[1]);
      if (level > 0) return true;
    }
  }
  return false;
}

function openTag(mark: Mark): string {
  return `<${mark}>`;
}

function closeTag(mark: Mark): string {
  return `</${mark}>`;
}

/** Keep italic and bold toggles, in the order written. Drop every other code. */
function marksFromBlock(block: string, open: Mark[]): string {
  let tags = '';
  for (const code of block.matchAll(/\\([ib])([01])/gi)) {
    const name = code[1]?.toLowerCase();
    const flag = code[2];
    if ((name !== 'i' && name !== 'b') || flag === undefined) continue;
    const mark: Mark = name;
    if (flag === '1') {
      if (open.includes(mark)) continue;
      open.push(mark);
      tags += openTag(mark);
      continue;
    }
    const index = open.lastIndexOf(mark);
    if (index === -1) continue;
    open.splice(index, 1);
    tags += closeTag(mark);
  }
  return tags;
}

/**
 * Drop drawing cues. Turn italic and bold into HTML, strip other overrides,
 * turn \N and \n into newlines and \h into a space, then trim each line.
 * A tag that is still open at the end of the cue is closed there.
 * Returns null when the cue is a drawing and must be removed.
 */
function stripCueText(text: string): string | null {
  if (hasDrawingOn(text)) return null;

  const open: Mark[] = [];
  let cleaned = '';
  let last = 0;
  for (const match of text.matchAll(/\{[^}]*\}/g)) {
    const index = match.index ?? 0;
    cleaned += text.slice(last, index);
    cleaned += marksFromBlock(match[0], open);
    last = index + match[0].length;
  }
  cleaned += text.slice(last);

  cleaned = cleaned.replace(/\\N/g, '\n').replace(/\\n/g, '\n').replace(/\\h/g, ' ');
  cleaned = cleaned
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

  while (open.length > 0) {
    const mark = open.pop();
    if (mark) cleaned += closeTag(mark);
  }
  return cleaned;
}

function isEmptyText(text: string): boolean {
  return text.trim() === '';
}

/**
 * Same wording: one cue. Different wording: the longest text.
 * Two different texts of the same length: the last one in the group.
 */
function chooseText(texts: readonly string[]): string {
  const first = texts[0] ?? '';
  if (texts.every((text) => text === first)) return first;

  let chosen = first;
  let chosenLength = first.length;
  for (let index = 1; index < texts.length; index += 1) {
    const text = texts[index] ?? '';
    if (text.length >= chosenLength) {
      chosen = text;
      chosenLength = text.length;
    }
  }
  return chosen;
}

/** Cues that share a start and an end are one group, in their original order. */
function collapseLayerDuplicates(cues: readonly Cue[]): Cue[] {
  const order: string[] = [];
  const groups = new Map<string, { start: number; end: number; texts: string[] }>();

  for (const cue of cues) {
    const text = stripCueText(cue.text);
    if (text === null || isEmptyText(text)) continue;

    const key = `${cue.start}\0${cue.end}`;
    const existing = groups.get(key);
    if (existing) {
      existing.texts.push(text);
      continue;
    }
    groups.set(key, { start: cue.start, end: cue.end, texts: [text] });
    order.push(key);
  }

  const kept: Cue[] = [];
  for (const key of order) {
    const group = groups.get(key);
    if (!group) continue;
    kept.push({
      start: group.start,
      end: group.end,
      text: chooseText(group.texts),
    });
  }
  return kept;
}

/**
 * Parse ASS/SSA, strip overrides, collapse duplicate layers, and write SRT.
 * Parser errors are returned unchanged. Nothing is sent over the network.
 */
export function assToSrt(text: string): { text: string; errors: ParseError[] } {
  const parsed = parse(text, 'ass');
  return {
    text: serialize(collapseLayerDuplicates(parsed.cues), 'srt'),
    errors: parsed.errors,
  };
}
