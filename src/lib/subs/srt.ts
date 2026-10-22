import { isBlankInput, normalizeCueText, splitBlocks } from './text';
import { parseSrtTimestamp, formatSrtTimestamp } from './time';
import type { Cue, ParseError, ParseResult } from './types';

const SRT_ARROW =
  /^(\d+:[0-5]\d:[0-5]\d,\d{3})\s*-->\s*(\d+:[0-5]\d:[0-5]\d,\d{3})(?:\s+.*)?$/;

function parseSrtTimeLine(line: string): { start: number; end: number } | null {
  const match = SRT_ARROW.exec(line.trim());
  if (!match) return null;
  const start = parseSrtTimestamp(match[1]);
  const end = parseSrtTimestamp(match[2]);
  if (start === null || end === null) return null;
  return { start, end };
}

function parseSrtBlock(block: string, blockNumber: number): { cue?: Cue; error?: ParseError } {
  const lines = block.split('\n');
  const firstLine = lines[0]?.trim() ?? '';
  // Cue numbers are optional in practice: some tools write the timestamp first.
  const timeLineIndex = parseSrtTimeLine(firstLine) ? 0 : 1;
  if (timeLineIndex >= lines.length) {
    return {
      error: {
        block: blockNumber,
        message: `Block ${blockNumber} is missing a cue number or timestamp.`,
      },
    };
  }

  if (timeLineIndex === 1 && !/^\d+$/.test(firstLine)) {
    return {
      error: {
        block: blockNumber,
        message: `Block ${blockNumber} has cue number "${firstLine}", which is not a whole number.`,
      },
    };
  }

  const timeLine = lines[timeLineIndex].trim();
  const range = parseSrtTimeLine(timeLine);
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

export function parseSrt(input: string): ParseResult {
  if (isBlankInput(input)) return { cues: [], errors: [] };

  const cues: Cue[] = [];
  const errors: ParseError[] = [];
  for (const [index, block] of splitBlocks(input).entries()) {
    const parsed = parseSrtBlock(block, index + 1);
    if (parsed.cue) cues.push(parsed.cue);
    if (parsed.error) errors.push(parsed.error);
  }
  return { cues, errors };
}

export function serializeSrt(cues: readonly Cue[]): string {
  if (cues.length === 0) return '';
  const blocks = cues.map((cue, index) => {
    const text = normalizeCueText(cue.text);
    const start = formatSrtTimestamp(cue.start);
    const end = formatSrtTimestamp(cue.end);
    return `${index + 1}\n${start} --> ${end}\n${text}`;
  });
  return `${blocks.join('\n\n')}\n`;
}
