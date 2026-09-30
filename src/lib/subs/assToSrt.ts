import { parse, serialize } from './index';
import type { Cue, ParseError } from './types';

/** Remove every {...} override, turn \h into a space, and trim each line. */
function stripCueText(text: string): string {
  return text
    .replace(/\{[^}]*\}/g, '')
    .replace(/\\h/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n');
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
    if (isEmptyText(text)) continue;

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
