import { isBlankInput, normalizeCueText, splitBlocks } from './text';
import { formatVttTimestamp, parseVttTimestamp } from './time';
import type { Cue, ParseError, ParseResult } from './types';

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

function firstLine(block: string): string {
  return block.split('\n')[0]?.trim() ?? '';
}

function isWebVttHeader(block: string): boolean {
  return /^WEBVTT($|\s)/.test(firstLine(block));
}

function isSkippableVttBlock(block: string): boolean {
  return /^(NOTE|STYLE|REGION)($|\s)/.test(firstLine(block));
}

function parseVttBlock(block: string, blockNumber: number): { cue?: Cue; error?: ParseError } {
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
  if (range.end < range.start) {
    return {
      error: {
        block: blockNumber,
        message: `Block ${blockNumber} ends before it starts (${timeLine}).`,
      },
    };
  }

  return {
    cue: {
      start: range.start,
      end: range.end,
      text: lines.slice(timeLineIndex + 1).join('\n'),
    },
  };
}

export function parseVtt(input: string): ParseResult {
  if (isBlankInput(input)) return { cues: [], errors: [] };

  const blocks = splitBlocks(input);
  const cues: Cue[] = [];
  const errors: ParseError[] = [];
  let index = 0;

  if (blocks.length > 0 && isWebVttHeader(blocks[0])) {
    index = 1;
  } else if (blocks.length > 0) {
    errors.push({ block: 1, message: 'Missing WEBVTT header.' });
  }

  for (; index < blocks.length; index++) {
    const block = blocks[index];
    if (isSkippableVttBlock(block)) continue;
    const parsed = parseVttBlock(block, index + 1);
    if (parsed.cue) cues.push(parsed.cue);
    if (parsed.error) errors.push(parsed.error);
  }

  return { cues, errors };
}

export function serializeVtt(cues: readonly Cue[]): string {
  if (cues.length === 0) return '';
  const blocks = cues.map((cue) => {
    const text = normalizeCueText(cue.text);
    const start = formatVttTimestamp(cue.start);
    const end = formatVttTimestamp(cue.end);
    return `${start} --> ${end}\n${text}`;
  });
  return `WEBVTT\n\n${blocks.join('\n\n')}\n`;
}
