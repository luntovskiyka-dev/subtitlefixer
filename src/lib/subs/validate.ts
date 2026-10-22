import { detectEncodingLabel } from './detectEncoding';
import { cueIssues, editorCuesFrom, issueLabel } from './editor';
import { parseSrt } from './srt';
import { normalizeNewlines } from './text';

export type ReportLevel = 'error' | 'warning' | 'info';

export type ReportItem = {
  level: ReportLevel;
  line: number;
  /** Cue number printed in the file, when there is one. */
  cue: number | null;
  message: string;
};

export type SrtReport = {
  items: ReportItem[];
  cues: number;
};

const LOOSE_TIME =
  /^(\d+:[0-5]\d:[0-5]\d)([,.])(\d{1,3})\s*-->\s*(\d+:[0-5]\d:[0-5]\d)([,.])(\d{1,3})/;

function blocksWithLines(input: string): { startLine: number; text: string }[] {
  const lines = normalizeNewlines(input).split('\n');
  const blocks: { startLine: number; text: string }[] = [];
  let current: string[] = [];
  let startLine = 1;
  const flush = (line: number) => {
    if (current.length === 0) return;
    blocks.push({ startLine, text: current.join('\n') });
    current = [];
    startLine = line;
  };
  lines.forEach((line, index) => {
    if (line.trim() === '') flush(index + 2);
    else {
      if (current.length === 0) startLine = index + 1;
      current.push(line);
    }
  });
  flush(lines.length + 1);
  return blocks;
}

function clockMs(clock: string, fraction: string): number {
  const parts = clock.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const seconds = parts[2] ?? 0;
  const ms = Number(fraction.padEnd(3, '0'));
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + ms;
}

function cueNumber(block: string): number | null {
  const first = block.split('\n')[0]?.trim() ?? '';
  if (!/^\d+$/.test(first)) return null;
  return Number(first);
}

function timeLine(block: string): { line: string; offset: number } | null {
  const lines = block.split('\n');
  const index = lines.findIndex((line) => line.includes('-->'));
  if (index === -1) return null;
  return { line: lines[index]?.trim() ?? '', offset: index };
}

/**
 * The same cue checks as the SRT editor, plus SRT structure, numbering,
 * a comma-vs-dot hint, and an encoding note.
 */
export function validateSrt(text: string, bytes?: Uint8Array): SrtReport {
  const items: ReportItem[] = [];
  const blocks = blocksWithLines(text);
  const cues: { id: string; start: number; end: number; text: string; line: number; cue: number | null }[] = [];
  let previousNumber: number | null = null;
  let expected = 1;

  blocks.forEach((block, index) => {
    const number = cueNumber(block.text);
    const parsed = parseSrt(`${block.text}\n`, { keepInverted: true });
    const stamp = timeLine(block.text);
    const loose = stamp ? LOOSE_TIME.exec(stamp.line) : null;
    const explained = new Set<string>();

    if (number !== null) {
      if (number !== expected) {
        const follows = previousNumber === null ? '' : `number ${number} follows ${previousNumber}; `;
        items.push({
          level: expected === 1 && previousNumber === null ? 'warning' : 'error',
          line: block.startLine,
          cue: number,
          message:
            expected === 1 && previousNumber === null
              ? `numbering starts at ${number}, not 1`
              : `${follows}expected ${expected}`,
        });
      }
      previousNumber = number;
      expected = number + 1;
    }

    if (parsed.cues.length === 0) {
      const message = parsed.errors[0]?.message ?? `Block ${index + 1} could not be read.`;
      if (loose && (loose[2] === '.' || loose[5] === '.')) {
        items.push({
          level: 'error',
          line: block.startLine + (stamp?.offset ?? 0),
          cue: number,
          message: `invalid time "${stamp?.line ?? ''}": SRT uses a comma before the milliseconds`,
        });
        explained.add('time');
        const start = clockMs(loose[1] ?? '', loose[3] ?? '');
        const end = clockMs(loose[4] ?? '', loose[6] ?? '');
        if (end < start) {
          items.push({
            level: 'error',
            line: block.startLine + (stamp?.offset ?? 0),
            cue: number,
            message: 'ends before it starts',
          });
        } else if (end === start) {
          items.push({
            level: 'warning',
            line: block.startLine + (stamp?.offset ?? 0),
            cue: number,
            message: issueLabel('zero'),
          });
        }
      }
      if (!explained.has('time')) {
        items.push({
          level: 'error',
          line: block.startLine,
          cue: number,
          message: message.replace(/^Block \d+ /, ''),
        });
      }
      return;
    }

    const cue = parsed.cues[0];
    if (!cue) return;
    cues.push({
      id: `c${index}`,
      start: cue.start,
      end: cue.end,
      text: cue.text,
      line: block.startLine,
      cue: number,
    });
    if (cue.end < cue.start) {
      items.push({
        level: 'error',
        line: block.startLine + (stamp?.offset ?? 0),
        cue: number,
        message: 'ends before it starts',
      });
    }
  });

  const issues = cueIssues(editorCuesFrom(cues, (index) => cues[index]?.id ?? String(index)));
  cues.forEach((cue) => {
    const list = issues.get(cue.id) ?? [];
    for (const issue of list) {
      if (issue === 'negative') continue;
      items.push({
        level: issue === 'empty' || issue === 'overlap' || issue === 'order' || issue === 'zero' ? 'warning' : 'error',
        line: cue.line,
        cue: cue.cue,
        message: issueLabel(issue),
      });
    }
  });

  if (bytes && bytes.length > 0) {
    const bom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
    if (bom) items.push({ level: 'info', line: 1, cue: null, message: 'file starts with a UTF-8 BOM' });
    let utf8 = true;
    try {
      new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      utf8 = false;
    }
    if (!utf8) {
      const encoding = detectEncodingLabel(bytes);
      items.push({
        level: 'warning',
        line: 1,
        cue: null,
        message: `file is not UTF-8 (detected ${encoding})`,
      });
    }
  }

  items.sort((a, b) => a.line - b.line || a.message.localeCompare(b.message));
  return { items, cues: cues.length };
}

export function reportLabel(level: ReportLevel, cue: number | null, line: number, message: string): string {
  const where = cue === null ? `line ${line}` : `subtitle ${cue} (line ${line})`;
  const name = level === 'info' ? 'Info' : level === 'warning' ? 'Warning' : 'Error';
  const sentence = message.endsWith('.') ? message : `${message}.`;
  return `${name}, ${where}: ${sentence}`;
}

export function countLevels(items: readonly ReportItem[]): { errors: number; warnings: number } {
  return {
    errors: items.filter((item) => item.level === 'error').length,
    warnings: items.filter((item) => item.level === 'warning').length,
  };
}
