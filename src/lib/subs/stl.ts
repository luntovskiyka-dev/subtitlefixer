import type { Cue } from './types';
import { decodeBytes } from './encoding';
import { serializeSrt } from './srt';
import { serializeVtt } from './vtt';

export const SPRUCE_FPS = [23.976, 24, 25, 29.97, 30] as const;

export type StlKind = 'ebu' | 'spruce';

export type StlResult = {
  cues: Cue[];
  kind: StlKind | null;
  fps: number | null;
  warnings: string[];
  error: string | null;
};

const NOT_STL = "This doesn't look like an EBU or Spruce STL subtitle file.";

const DIACRITIC: Record<number, string> = {
  0xc1: '\u0300',
  0xc2: '\u0301',
  0xc3: '\u0302',
  0xc4: '\u0303',
  0xc5: '\u0304',
  0xc6: '\u0306',
  0xc7: '\u0307',
  0xc8: '\u0308',
  0xca: '\u030a',
  0xcb: '\u0327',
  0xcd: '\u030b',
  0xce: '\u0328',
  0xcf: '\u030c',
};

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let out = '';
  for (let index = 0; index < length; index += 1) out += String.fromCharCode(bytes[start + index] ?? 0);
  return out;
}

function timecodeMs(hours: number, minutes: number, seconds: number, frames: number, fps: number): number {
  const base = ((hours * 60 + minutes) * 60 + seconds) * 1000;
  let frameMs = 1000 / fps;
  if (Math.abs(fps - 23.976) < 0.001) frameMs = 1001 / 24;
  if (Math.abs(fps - 29.97) < 0.001) frameMs = 1001 / 30;
  return Math.round(base + frames * frameMs);
}

function ebuFps(code: string): { fps: number; known: boolean } | null {
  const match = /^STL(\d{2})\.(\d{2})$/.exec(code);
  if (!match) return null;
  if (match[1] === '29' && match[2] === '97') return { fps: 29.97, known: true };
  const fps = Number(match[1]);
  if (!Number.isFinite(fps) || fps <= 0) return null;
  return { fps, known: code === 'STL25.01' || code === 'STL30.01' };
}

function charset(cct: string): string | null {
  if (cct === '00') return 'iso-6937';
  if (cct === '01') return 'iso-8859-5';
  if (cct === '02') return 'iso-8859-6';
  if (cct === '03') return 'iso-8859-7';
  if (cct === '04') return 'iso-8859-8';
  return null;
}

function decode6937(bytes: number[]): string {
  let out = '';
  let pending = '';
  const push = (char: string) => {
    out += pending ? `${char}${pending}` : char;
    pending = '';
  };
  for (const byte of bytes) {
    const mark = DIACRITIC[byte];
    if (mark) {
      pending = mark;
      continue;
    }
    if (byte >= 0x20 && byte !== 0x7f) push(String.fromCharCode(byte));
  }
  return out;
}

function decodeRun(bytes: number[], encoding: string): string {
  if (bytes.length === 0) return '';
  if (encoding === 'iso-6937') return decode6937(bytes);
  return new TextDecoder(encoding).decode(Uint8Array.from(bytes));
}

function decodeTtiText(field: Uint8Array, encoding: string): string {
  let out = '';
  let italic = false;
  let underline = false;
  let run: number[] = [];
  const flush = () => {
    out += decodeRun(run, encoding);
    run = [];
  };
  const open = (tag: 'i' | 'u', on: boolean) => {
    flush();
    if (on) out += `<${tag}>`;
  };
  const close = (tag: 'i' | 'u', on: boolean) => {
    if (!on) return;
    flush();
    out += `</${tag}>`;
  };
  for (const byte of field) {
    if (byte === 0x8f || byte === 0xff) continue;
    if (byte === 0x8a) {
      flush();
      out += '\n';
      continue;
    }
    if (byte === 0x80) {
      open('i', !italic);
      italic = true;
      continue;
    }
    if (byte === 0x81) {
      close('i', italic);
      italic = false;
      continue;
    }
    if (byte === 0x82) {
      open('u', !underline);
      underline = true;
      continue;
    }
    if (byte === 0x83) {
      close('u', underline);
      underline = false;
      continue;
    }
    if (byte < 0x20) continue;
    run.push(byte);
  }
  flush();
  if (underline) out += '</u>';
  if (italic) out += '</i>';
  return out
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

function parseEbu(bytes: Uint8Array): StlResult {
  if (bytes.length < 1024 + 128) return { cues: [], kind: null, fps: null, warnings: [], error: NOT_STL };
  const code = ascii(bytes, 3, 8);
  const parsedFps = ebuFps(code);
  if (!parsedFps) return { cues: [], kind: null, fps: null, warnings: [], error: NOT_STL };
  const warnings: string[] = [];
  if (!parsedFps.known) warnings.push(`Disk format code ${code} is not STL25.01 or STL30.01. Times use ${parsedFps.fps} fps.`);
  const cct = ascii(bytes, 12, 2);
  const encoding = charset(cct);
  const textEncoding = encoding ?? 'iso-6937';
  if (!encoding) warnings.push(`Character code table ${cct.trim() || 'blank'} is not one of 00–04. Text is read as Latin.`);

  const groups = new Map<number, { start: number; end: number; bytes: number[]; comment: boolean }>();
  const order: number[] = [];
  for (let offset = 1024; offset + 128 <= bytes.length; offset += 128) {
    const block = bytes.subarray(offset, offset + 128);
    const number = ((block[1] ?? 0) << 8) | (block[2] ?? 0);
    const comment = (block[15] ?? 0) !== 0;
    const start = timecodeMs(block[5] ?? 0, block[6] ?? 0, block[7] ?? 0, block[8] ?? 0, parsedFps.fps);
    const end = timecodeMs(block[9] ?? 0, block[10] ?? 0, block[11] ?? 0, block[12] ?? 0, parsedFps.fps);
    let group = groups.get(number);
    if (!group) {
      group = { start, end, bytes: [], comment };
      groups.set(number, group);
      order.push(number);
    }
    if (comment) group.comment = true;
    if (!group.comment) {
      for (let index = 16; index < 128; index += 1) group.bytes.push(block[index] ?? 0);
    }
  }

  const cues: Cue[] = [];
  for (const number of order) {
    const group = groups.get(number);
    if (!group || group.comment) continue;
    const text = decodeTtiText(Uint8Array.from(group.bytes), textEncoding);
    if (text === '') continue;
    cues.push({ start: group.start, end: group.end, text });
  }
  cues.sort((a, b) => a.start - b.start || a.end - b.end);
  if (cues.length === 0) return { cues: [], kind: 'ebu', fps: parsedFps.fps, warnings, error: 'No subtitles found in this EBU STL file.' };
  return { cues, kind: 'ebu', fps: parsedFps.fps, warnings, error: null };
}

const SPRUCE_LINE = /^(\d{2}):(\d{2}):(\d{2}):(\d{2})\s*,\s*(\d{2}):(\d{2}):(\d{2}):(\d{2})\s*,\s*(.*)$/;

function applySpruceMarks(raw: string): string {
  let italic = false;
  let bold = false;
  let underline = false;
  let out = '';
  for (let index = 0; index < raw.length; index += 1) {
    if (raw.startsWith('^I', index) || raw.startsWith('^B', index) || raw.startsWith('^U', index)) {
      const mark = raw[index + 1];
      if (mark === 'I') {
        italic = !italic;
        out += italic ? '<i>' : '</i>';
      } else if (mark === 'B') {
        bold = !bold;
        out += bold ? '<b>' : '</b>';
      } else {
        underline = !underline;
        out += underline ? '<u>' : '</u>';
      }
      index += 1;
      continue;
    }
    out += raw[index] === '|' ? '\n' : raw[index];
  }
  if (underline) out += '</u>';
  if (bold) out += '</b>';
  if (italic) out += '</i>';
  return out
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

function parseSpruce(text: string, fps: number): StlResult {
  const cues: Cue[] = [];
  for (const line of text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/)) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('$')) continue;
    const match = SPRUCE_LINE.exec(trimmed);
    if (!match) continue;
    const start = timecodeMs(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]), fps);
    const end = timecodeMs(Number(match[5]), Number(match[6]), Number(match[7]), Number(match[8]), fps);
    const body = applySpruceMarks(match[9] ?? '');
    if (body === '') continue;
    cues.push({ start, end, text: body });
  }
  if (cues.length === 0) return { cues: [], kind: null, fps: null, warnings: [], error: NOT_STL };
  return { cues, kind: 'spruce', fps, warnings: [], error: null };
}

function looksLikeSpruce(text: string): boolean {
  return text.split(/\r\n|\n|\r/).some((line) => SPRUCE_LINE.test(line.trim()));
}

/** EBU STL binary or Spruce STL text. `spruceFps` is used only for Spruce files. */
export async function parseStl(bytes: Uint8Array, spruceFps = 25): Promise<StlResult> {
  const code = bytes.length >= 11 ? ascii(bytes, 3, 8) : '';
  if (ebuFps(code)) return parseEbu(bytes);
  const decoded = await decodeBytes(bytes);
  if (looksLikeSpruce(decoded.text)) return parseSpruce(decoded.text, spruceFps);
  return { cues: [], kind: null, fps: null, warnings: [], error: NOT_STL };
}

export function stlToText(
  parsed: StlResult,
  format: 'srt' | 'vtt',
): { text: string; count: number } {
  if (parsed.error || parsed.cues.length === 0) return { text: '', count: 0 };
  return {
    text: format === 'vtt' ? serializeVtt(parsed.cues) : serializeSrt(parsed.cues),
    count: parsed.cues.length,
  };
}

export function stlOutputName(name: string, format: 'srt' | 'vtt'): string {
  const base = name.replace(/\.stl$/i, '') || 'subtitles';
  return `${base}.${format}`;
}
