import { isBlankInput, normalizeCueText, normalizeNewlines } from './text';
import { formatVttTimestamp, parseVttTimestamp } from './time';
import type { Cue, ParseError, ParseOptions, ParseResult } from './types';

const VTT_ARROW =
  /^((?:\d+:)?[0-5]\d:[0-5]\d\.\d{1,3})\s*-->\s*((?:\d+:)?[0-5]\d:[0-5]\d\.\d{1,3})(?:\s+.*)?$/;

function parseVttTimeLine(line: string): { start: number; end: number } | null {
  const match = VTT_ARROW.exec(line.trim());
  if (!match) return null;
  const start = parseVttTimestamp(match[1]);
  const end = parseVttTimestamp(match[2]);
  if (start === null || end === null) return null;
  return { start, end };
}

type VttBlock = {
  text: string;
  /** Exactly one line of only spaces or tabs, and no empty line, came before this block. */
  afterSpaceLine: boolean;
};

/**
 * Split a VTT file into blocks. An empty line ends a block, and so does a line of only
 * spaces or tabs. A single line of that second kind is remembered: YouTube automatic
 * captions put one inside a cue, between the timing line and the text, and `parseVtt`
 * joins that text back to its cue.
 */
function splitVttBlocks(input: string): VttBlock[] {
  const blocks: VttBlock[] = [];
  let current: string[] = [];
  let afterSpaceLine = false;
  let spaceLines = 0;
  let emptyLines = 0;
  const flush = () => {
    if (current.length === 0) return;
    blocks.push({ text: current.join('\n'), afterSpaceLine });
    current = [];
  };
  for (const line of normalizeNewlines(input).split('\n')) {
    if (line.trim() === '') {
      flush();
      if (line === '') emptyLines += 1;
      else spaceLines += 1;
      continue;
    }
    if (current.length === 0) {
      afterSpaceLine = blocks.length > 0 && spaceLines === 1 && emptyLines === 0;
      spaceLines = 0;
      emptyLines = 0;
    }
    current.push(line);
  }
  flush();
  return blocks;
}

function firstLine(block: string): string {
  return block.split('\n')[0]?.trim() ?? '';
}

function isWebVttHeader(block: string): boolean {
  return /^WEBVTT($|\s)/.test(firstLine(block));
}

function isSkippableVttBlock(block: string): boolean {
  return /^(NOTE|STYLE|REGION)($|\s)/.test(firstLine(block));
}

function parseVttBlock(block: string, blockNumber: number, keepInverted: boolean): { cue?: Cue; error?: ParseError } {
  const lines = block.split('\n');
  const timeLineIndex = lines[0].includes('-->') ? 0 : 1;
  if (timeLineIndex >= lines.length) {
    return {
      error: {
        block: blockNumber,
        message: `Block ${blockNumber} is missing a timestamp.`,
      },
    };
  }

  const timeLine = lines[timeLineIndex].trim();
  const range = parseVttTimeLine(timeLine);
  if (!range) {
    return {
      error: {
        block: blockNumber,
        message: `Block ${blockNumber} has an invalid timestamp "${timeLine}".`,
      },
    };
  }
  const text = lines.slice(timeLineIndex + 1).join('\n');
  if (range.end < range.start) {
    const error: ParseError = {
      block: blockNumber,
      message: `Block ${blockNumber} ends before it starts (${timeLine}).`,
    };
    if (!keepInverted) return { error };
    return { error, cue: { start: range.start, end: range.end, text } };
  }

  return { cue: { start: range.start, end: range.end, text } };
}

export function parseVtt(input: string, options?: ParseOptions): ParseResult {
  if (isBlankInput(input)) return { cues: [], errors: [] };

  const keepInverted = options?.keepInverted === true;
  const blocks = splitVttBlocks(input);
  const cues: Cue[] = [];
  const errors: ParseError[] = [];
  let index = 0;
  /** The cue made from the block right before this one, if that block was a cue. */
  let previousCue: Cue | null = null;

  if (blocks.length > 0 && isWebVttHeader(blocks[0].text)) {
    index = 1;
  } else if (blocks.length > 0) {
    errors.push({ block: 1, message: 'Missing WEBVTT header.' });
  }

  for (; index < blocks.length; index++) {
    const { text: block, afterSpaceLine } = blocks[index];
    if (isSkippableVttBlock(block)) {
      previousCue = null;
      continue;
    }
    if (previousCue && afterSpaceLine && !block.includes('-->')) {
      // Text after a line of spaces inside a cue (YouTube automatic captions).
      previousCue.text = previousCue.text === '' ? block : `${previousCue.text}\n${block}`;
      continue;
    }
    const parsed = parseVttBlock(block, index + 1, keepInverted);
    previousCue = parsed.cue ?? null;
    if (parsed.cue) cues.push(parsed.cue);
    if (parsed.error) errors.push(parsed.error);
  }

  return { cues, errors };
}

/**
 * Escape cue text for a WebVTT file. `<i>`, `<b>` and `<u>` stay.
 * A bare `&` and any other `<` are escaped so a player does not read them as markup.
 * Existing character references are left alone.
 */
export function escapeVttText(text: string): string {
  return text
    .replace(/&(?!(?:#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]*);)/gi, '&amp;')
    .replace(/<(?![biu]>|\/[biu]>)/gi, '&lt;');
}

export function serializeVtt(cues: readonly Cue[]): string {
  if (cues.length === 0) return '';
  const blocks = cues.map((cue) => {
    const text = escapeVttText(normalizeCueText(cue.text));
    const start = formatVttTimestamp(cue.start);
    const end = formatVttTimestamp(cue.end);
    return `${start} --> ${end}\n${text}`;
  });
  return `WEBVTT\n\n${blocks.join('\n\n')}\n`;
}

const VTT_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  lrm: '',
  rlm: '',
};

/** Decode `&amp;`, `&lt;`, `&#233;`, `&#xE9;` and the other character references VTT uses. */
export function decodeVttEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
    const lower = name.toLowerCase();
    if (lower.startsWith('#')) {
      const code = lower.startsWith('#x') ? Number.parseInt(lower.slice(2), 16) : Number.parseInt(lower.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return VTT_ENTITIES[lower] ?? whole;
  });
}

/**
 * One SRT cue's text for a WebVTT file. `<i>`, `<b>` and `<u>` are kept, `<font>` and
 * other tags are removed with their text left in place, and bare `&` and `<` are escaped
 * so the cue text is valid WebVTT. Existing character references are left alone.
 */
export function srtCueTextToVtt(text: string): string {
  const stripped = normalizeNewlines(text).replace(
    /<(\/?)([a-z][^\s<>]*)(?:\s[^<>]*)?>/gi,
    (_whole, slash?: string, name?: string) => {
      const tag = (name ?? '').toLowerCase();
      return tag === 'i' || tag === 'b' || tag === 'u' ? `<${slash ?? ''}${tag}>` : '';
    },
  );
  return escapeVttText(stripped);
}

/**
 * One VTT cue's text for an SRT file. `<i>`, `<b>` and `<u>` are kept (classes dropped),
 * `<v Anna>` becomes "Anna: ", every other tag is removed (`<c>`, YouTube word timestamps
 * such as `<00:00:02.639>`, `<ruby>`, `<lang>`), character references are decoded, and
 * lines are trimmed; lines left empty are dropped.
 */
export function vttCueTextToSrt(text: string): string {
  const withoutTags = normalizeNewlines(text)
    .replace(/<v(?:\.[^\s>]*)?\s+([^>]+)>/gi, (_whole, speaker: string) => `${speaker.trim()}: `)
    .replace(/<(\/?)([a-z][^\s.<>]*)[^<>]*>|<\d[\d:.]*>/gi, (_whole, slash?: string, name?: string) => {
      const tag = (name ?? '').toLowerCase();
      return tag === 'i' || tag === 'b' || tag === 'u' ? `<${slash ?? ''}${tag}>` : '';
    });
  return decodeVttEntities(withoutTags)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join('\n');
}
