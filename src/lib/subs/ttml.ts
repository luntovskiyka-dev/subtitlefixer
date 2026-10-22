import type { Cue } from './types';
import { serializeSrt } from './srt';
import { serializeVtt } from './vtt';

export type XmlKind = 'ttml' | 'dfxp' | 'youtube';

export type XmlSubtitleResult = {
  cues: Cue[];
  kind: XmlKind | null;
  warnings: string[];
  error: string | null;
};

type Attr = { name: string; local: string; value: string };
type XmlEl = { local: string; attrs: Attr[]; children: Array<XmlEl | string> };

const XML_ERROR = "This file isn't valid XML.";
const UNSUPPORTED = "This XML file isn't a supported subtitle format (TTML/DFXP or YouTube timed text).";
const IMAGE_WARNING = "Image subtitles can't be converted.";

class XmlParseError extends Error {}

function localName(name: string): string {
  const colon = name.indexOf(':');
  return colon === -1 ? name : name.slice(colon + 1);
}

function decodeEntitiesOnce(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (whole, name: string) => {
    const lower = name.toLowerCase();
    if (lower === 'amp') return '&';
    if (lower === 'lt') return '<';
    if (lower === 'gt') return '>';
    if (lower === 'quot') return '"';
    if (lower === 'apos') return "'";
    if (lower.startsWith('#')) {
      const code = lower.startsWith('#x') ? Number.parseInt(lower.slice(2), 16) : Number.parseInt(lower.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return whole;
  });
}

/** YouTube often escapes an entity twice, so `&amp;#39;` should become an apostrophe. */
export function decodeRepeatedEntities(text: string): string {
  let current = text;
  for (let pass = 0; pass < 2; pass += 1) {
    if (!/&(?:#\d+|#x[0-9a-f]+|amp);/i.test(current)) break;
    const next = decodeEntitiesOnce(current);
    if (next === current) break;
    current = next;
  }
  return current.replace(/<[^>]*>/g, '');
}

function parseXml(input: string): XmlEl {
  const source = input.replace(/^\uFEFF/, '');
  let index = 0;

  function peek(): string {
    return source[index] ?? '';
  }

  function eat(expected: string): void {
    if (!source.startsWith(expected, index)) throw new XmlParseError(XML_ERROR);
    index += expected.length;
  }

  function skipMisc(): void {
    for (;;) {
      while (/\s/.test(peek())) index += 1;
      if (source.startsWith('<?', index)) {
        const end = source.indexOf('?>', index + 2);
        if (end === -1) throw new XmlParseError(XML_ERROR);
        index = end + 2;
        continue;
      }
      if (source.startsWith('<!--', index)) {
        const end = source.indexOf('-->', index + 4);
        if (end === -1) throw new XmlParseError(XML_ERROR);
        index = end + 3;
        continue;
      }
      if (source.startsWith('<!DOCTYPE', index) || source.startsWith('<!doctype', index)) {
        index += 9;
        let depth = 0;
        while (index < source.length) {
          const char = source[index];
          index += 1;
          if (char === '[') depth += 1;
          else if (char === ']') depth = Math.max(0, depth - 1);
          else if (char === '>' && depth === 0) break;
        }
        continue;
      }
      if (source.startsWith('<![CDATA[', index)) return;
      return;
    }
  }

  function readName(): string {
    const start = index;
    if (!/[A-Za-z_:]/.test(peek())) throw new XmlParseError(XML_ERROR);
    index += 1;
    while (/[A-Za-z0-9_:.-]/.test(peek())) index += 1;
    return source.slice(start, index);
  }

  function readValue(): string {
    const quote = peek();
    if (quote !== '"' && quote !== "'") throw new XmlParseError(XML_ERROR);
    index += 1;
    const start = index;
    while (index < source.length && source[index] !== quote) index += 1;
    if (index >= source.length) throw new XmlParseError(XML_ERROR);
    const raw = source.slice(start, index);
    index += 1;
    return decodeEntitiesOnce(raw);
  }

  function readAttrs(): Attr[] {
    const attrs: Attr[] = [];
    for (;;) {
      while (/\s/.test(peek())) index += 1;
      if (peek() === '/' || peek() === '>' || peek() === '') break;
      const name = readName();
      while (/\s/.test(peek())) index += 1;
      eat('=');
      while (/\s/.test(peek())) index += 1;
      attrs.push({ name, local: localName(name), value: readValue() });
    }
    return attrs;
  }

  function readElement(): XmlEl {
    eat('<');
    const name = readName();
    const attrs = readAttrs();
    if (source.startsWith('/>', index)) {
      index += 2;
      return { local: localName(name), attrs, children: [] };
    }
    eat('>');
    const children: Array<XmlEl | string> = [];
    let textStart = index;
    while (index < source.length) {
      if (source.startsWith(`</`, index)) {
        if (textStart < index) children.push(decodeEntitiesOnce(source.slice(textStart, index)));
        eat('</');
        const close = readName();
        if (localName(close) !== localName(name)) throw new XmlParseError(XML_ERROR);
        while (/\s/.test(peek())) index += 1;
        eat('>');
        return { local: localName(name), attrs, children };
      }
      if (source.startsWith('<![CDATA[', index)) {
        if (textStart < index) children.push(decodeEntitiesOnce(source.slice(textStart, index)));
        index += 9;
        const end = source.indexOf(']]>', index);
        if (end === -1) throw new XmlParseError(XML_ERROR);
        children.push(source.slice(index, end));
        index = end + 3;
        textStart = index;
        continue;
      }
      if (source.startsWith('<!--', index)) {
        if (textStart < index) children.push(decodeEntitiesOnce(source.slice(textStart, index)));
        const end = source.indexOf('-->', index + 4);
        if (end === -1) throw new XmlParseError(XML_ERROR);
        index = end + 3;
        textStart = index;
        continue;
      }
      if (peek() === '<') {
        if (textStart < index) children.push(decodeEntitiesOnce(source.slice(textStart, index)));
        children.push(readElement());
        textStart = index;
        continue;
      }
      index += 1;
    }
    throw new XmlParseError(XML_ERROR);
  }

  skipMisc();
  if (peek() !== '<') throw new XmlParseError(XML_ERROR);
  const root = readElement();
  skipMisc();
  if (index < source.length) throw new XmlParseError(XML_ERROR);
  return root;
}

function attr(el: XmlEl, local: string): string | null {
  return el.attrs.find((item) => item.local === local)?.value ?? null;
}

function elementId(el: XmlEl): string | null {
  return el.attrs.find((item) => item.name === 'xml:id' || item.local === 'id')?.value ?? null;
}

type Style = { italic: boolean; bold: boolean; underline: boolean };

function emptyStyle(): Style {
  return { italic: false, bold: false, underline: false };
}

function collectStyles(root: XmlEl): Map<string, XmlEl> {
  const styles = new Map<string, XmlEl>();
  const walk = (el: XmlEl) => {
    if (el.local === 'style') {
      const id = elementId(el);
      if (id) styles.set(id, el);
    }
    for (const child of el.children) if (typeof child !== 'string') walk(child);
  };
  walk(root);
  return styles;
}

function styleFromEl(el: XmlEl, styles: Map<string, XmlEl>, seen: Set<string>): Style {
  const result = emptyStyle();
  const ref = attr(el, 'style');
  if (ref) {
    for (const id of ref.split(/\s+/)) {
      if (id === '' || seen.has(id)) continue;
      const target = styles.get(id);
      if (!target) continue;
      seen.add(id);
      const parent = styleFromEl(target, styles, seen);
      result.italic = result.italic || parent.italic;
      result.bold = result.bold || parent.bold;
      result.underline = result.underline || parent.underline;
    }
  }
  if (attr(el, 'fontStyle') === 'italic') result.italic = true;
  if (attr(el, 'fontWeight') === 'bold') result.bold = true;
  const decoration = attr(el, 'textDecoration') ?? '';
  if (decoration.split(/\s+/).includes('underline')) result.underline = true;
  return result;
}

function wrapStyle(text: string, style: Style): string {
  if (text === '') return '';
  let wrapped = text;
  if (style.underline) wrapped = `<u>${wrapped}</u>`;
  if (style.bold) wrapped = `<b>${wrapped}</b>`;
  if (style.italic) wrapped = `<i>${wrapped}</i>`;
  return wrapped;
}

type Clock = { frameRate: number; subFrameRate: number; tickRate: number };

function readClock(root: XmlEl): Clock {
  const frameAttr = attr(root, 'frameRate');
  const frameSpecified = frameAttr !== null && frameAttr.trim() !== '';
  let frameRate = frameSpecified ? Number(frameAttr) : 30;
  if (!Number.isFinite(frameRate) || frameRate <= 0) frameRate = 30;
  const multiplier = attr(root, 'frameRateMultiplier');
  if (multiplier) {
    const parts = multiplier.trim().split(/[:\s]+/).map(Number);
    const numerator = parts[0];
    const denominator = parts[1];
    if (numerator && denominator && numerator > 0 && denominator > 0) frameRate = frameRate * (numerator / denominator);
  }
  const subAttr = attr(root, 'subFrameRate');
  let subFrameRate = subAttr ? Number(subAttr) : 1;
  if (!Number.isFinite(subFrameRate) || subFrameRate <= 0) subFrameRate = 1;
  const tickAttr = attr(root, 'tickRate');
  let tickRate: number;
  if (tickAttr !== null && tickAttr.trim() !== '') {
    tickRate = Number(tickAttr);
    if (!Number.isFinite(tickRate) || tickRate <= 0) tickRate = 1;
  } else if (frameSpecified) tickRate = frameRate * subFrameRate;
  else tickRate = 1;
  return { frameRate, subFrameRate, tickRate };
}

/** TTML clock time, offset time, frames and ticks. Null when the expression is not a time. */
export function parseTtmlTime(value: string, clock: Clock): number | null {
  const text = value.trim();
  const clockMatch = /^(\d+):(\d{2}):(\d{2})(?:\.(\d+)|:(\d+)(?:\.(\d+))?)?$/.exec(text);
  if (clockMatch) {
    const hours = Number(clockMatch[1]);
    const minutes = Number(clockMatch[2]);
    const seconds = Number(clockMatch[3]);
    let ms = ((hours * 60 + minutes) * 60 + seconds) * 1000;
    const fraction = clockMatch[4];
    const frames = clockMatch[5];
    const subFrames = clockMatch[6];
    if (fraction !== undefined) ms += Math.round(Number(`0.${fraction}`) * 1000);
    if (frames !== undefined) ms += Math.round((Number(frames) * 1000) / clock.frameRate);
    if (subFrames !== undefined) ms += Math.round((Number(subFrames) * 1000) / (clock.frameRate * clock.subFrameRate));
    return ms;
  }
  const offset = /^(\d+(?:\.\d+)?)(ms|h|m|s|f|t)$/.exec(text);
  if (!offset) return null;
  const count = Number(offset[1]);
  const metric = offset[2];
  if (metric === 'ms') return Math.round(count);
  if (metric === 's') return Math.round(count * 1000);
  if (metric === 'm') return Math.round(count * 60_000);
  if (metric === 'h') return Math.round(count * 3_600_000);
  if (metric === 'f') return Math.round((count * 1000) / clock.frameRate);
  return Math.round((count * 1000) / clock.tickRate);
}

function spaceMode(el: XmlEl, inherited: 'default' | 'preserve'): 'default' | 'preserve' {
  const value = el.attrs.find((item) => item.name === 'xml:space')?.value;
  if (value === 'preserve' || value === 'default') return value;
  return inherited;
}

function renderText(el: XmlEl, styles: Map<string, XmlEl>, space: 'default' | 'preserve'): string {
  const own = spaceMode(el, space);
  let out = '';
  for (const child of el.children) {
    if (typeof child === 'string') {
      out += own === 'preserve' ? child : child.replace(/\s+/g, ' ');
      continue;
    }
    if (child.local === 'br') {
      out += '\n';
      continue;
    }
    const inner = renderText(child, styles, own);
    out += wrapStyle(inner, styleFromEl(child, styles, new Set()));
  }
  return out;
}

function tidyCueText(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line, index, lines) => line !== '' || (index > 0 && index < lines.length - 1 && lines[index - 1] !== ''))
    .join('\n')
    .trim();
}

function hasImageProfile(root: XmlEl): boolean {
  const walk = (el: XmlEl): boolean => {
    for (const item of el.attrs) {
      const name = item.local.toLowerCase();
      const value = item.value.toLowerCase();
      if ((name === 'profile' || name === 'contentprofiles' || name === 'backgroundimage') && /image/.test(value)) return true;
    }
    if (el.local === 'image') return true;
    return el.children.some((child) => typeof child !== 'string' && walk(child));
  };
  return walk(root);
}

function isDfxp(root: XmlEl): boolean {
  return root.attrs.some((item) => item.name === 'xmlns' || item.name.startsWith('xmlns:')) &&
    root.attrs.some((item) => item.value.includes('ttaf1'));
}

type Range = { begin: number; end: number | null };

function elementRange(el: XmlEl, parent: Range, clock: Clock): Range | null {
  const beginValue = attr(el, 'begin');
  const endValue = attr(el, 'end');
  const durValue = attr(el, 'dur');
  const localBegin = beginValue === null ? 0 : parseTtmlTime(beginValue, clock);
  if (localBegin === null) return null;
  const begin = parent.begin + localBegin;
  if (endValue !== null) {
    const localEnd = parseTtmlTime(endValue, clock);
    if (localEnd === null) return null;
    return { begin, end: parent.begin + localEnd };
  }
  if (durValue !== null) {
    const dur = parseTtmlTime(durValue, clock);
    if (dur === null) return null;
    return { begin, end: begin + dur };
  }
  return { begin, end: parent.end };
}

function collectParagraphs(root: XmlEl, clock: Clock, styles: Map<string, XmlEl>): { cues: Cue[]; dropped: number } {
  const cues: Cue[] = [];
  let dropped = 0;
  const walk = (el: XmlEl, parent: Range, space: 'default' | 'preserve') => {
    const ownSpace = spaceMode(el, space);
    const range = el.local === 'tt' ? parent : elementRange(el, parent, clock);
    if (!range) return;
    if (el.local === 'p') {
      if (range.end === null) {
        dropped += 1;
        return;
      }
      const text = tidyCueText(wrapStyle(renderText(el, styles, ownSpace), styleFromEl(el, styles, new Set())));
      if (text.replace(/<\/?[biu]>/g, '').trim() === '') return;
      cues.push({ start: range.begin, end: range.end, text });
      return;
    }
    for (const child of el.children) {
      if (typeof child !== 'string') walk(child, range, ownSpace);
    }
  };
  walk(root, { begin: 0, end: null }, 'default');
  cues.sort((a, b) => a.start - b.start || a.end - b.end);
  return { cues, dropped };
}

function youtubeCues(root: XmlEl): { cues: Cue[]; warnings: string[] } {
  const cues: Cue[] = [];
  const warnings: string[] = [];
  if (root.local === 'transcript') {
    const texts = root.children.filter((child): child is XmlEl => typeof child !== 'string' && child.local === 'text');
    texts.forEach((el, index) => {
      const startSec = Number(attr(el, 'start') ?? '');
      if (!Number.isFinite(startSec)) return;
      const start = Math.round(startSec * 1000);
      const dur = attr(el, 'dur');
      let end: number | null = null;
      if (dur !== null && dur !== '') {
        const durSec = Number(dur);
        if (Number.isFinite(durSec)) end = start + Math.round(durSec * 1000);
      }
      const next = texts[index + 1];
      if (end === null && next) {
        const nextStart = Number(attr(next, 'start') ?? '');
        if (Number.isFinite(nextStart)) end = Math.round(nextStart * 1000);
      }
      if (end === null) {
        end = start + 2000;
        warnings.push('The last caption has no duration, so it was given 2 seconds.');
      }
      const text = tidyCueText(decodeRepeatedEntities(renderText(el, new Map(), 'preserve')));
      if (text === '') return;
      cues.push({ start, end, text });
    });
    return { cues, warnings };
  }

  const paragraphs: XmlEl[] = [];
  const walk = (el: XmlEl) => {
    if (el.local === 'p') paragraphs.push(el);
    for (const child of el.children) if (typeof child !== 'string') walk(child);
  };
  walk(root);
  for (const el of paragraphs) {
    const start = Number(attr(el, 't') ?? '');
    const dur = Number(attr(el, 'd') ?? '');
    if (!Number.isFinite(start) || !Number.isFinite(dur)) continue;
    const text = tidyCueText(decodeRepeatedEntities(renderText(el, new Map(), 'preserve')));
    if (text === '') continue;
    cues.push({ start: Math.round(start), end: Math.round(start + dur), text });
  }
  return { cues, warnings };
}

/** TTML, DFXP, SMPTE-TT, EBU-TT text, and YouTube timed-text XML. No network access. */
export function parseSubtitleXml(input: string): XmlSubtitleResult {
  let root: XmlEl;
  try {
    root = parseXml(input);
  } catch {
    return { cues: [], kind: null, warnings: [], error: XML_ERROR };
  }

  if (root.local === 'timedtext' || root.local === 'transcript') {
    const youtube = youtubeCues(root);
    if (youtube.cues.length === 0) {
      return { cues: [], kind: 'youtube', warnings: youtube.warnings, error: 'No subtitles found in this YouTube XML file.' };
    }
    return { cues: youtube.cues, kind: 'youtube', warnings: youtube.warnings, error: null };
  }

  if (root.local !== 'tt') return { cues: [], kind: null, warnings: [], error: UNSUPPORTED };

  const kind: XmlKind = isDfxp(root) ? 'dfxp' : 'ttml';
  const warnings: string[] = [];
  if (hasImageProfile(root)) warnings.push(IMAGE_WARNING);
  const clock = readClock(root);
  const styles = collectStyles(root);
  const collected = collectParagraphs(root, clock, styles);
  if (collected.dropped > 0) {
    warnings.push(
      collected.dropped === 1
        ? 'Dropped 1 paragraph with no end time.'
        : `Dropped ${collected.dropped} paragraphs with no end time.`,
    );
  }
  if (collected.cues.length === 0) {
    return {
      cues: [],
      kind,
      warnings,
      error: warnings.includes(IMAGE_WARNING) ? IMAGE_WARNING : 'No subtitles found in this XML file.',
    };
  }
  return { cues: collected.cues, kind, warnings, error: null };
}

export function xmlKindLabel(kind: XmlKind): string {
  if (kind === 'dfxp') return 'DFXP';
  if (kind === 'youtube') return 'YouTube';
  return 'TTML';
}

export function subtitleXmlToText(
  input: string,
  format: 'srt' | 'vtt',
): { text: string; count: number; kind: XmlKind | null; warnings: string[]; error: string | null } {
  const parsed = parseSubtitleXml(input);
  if (parsed.error || parsed.cues.length === 0) {
    return { text: '', count: 0, kind: parsed.kind, warnings: parsed.warnings, error: parsed.error };
  }
  return {
    text: format === 'vtt' ? serializeVtt(parsed.cues) : serializeSrt(parsed.cues),
    count: parsed.cues.length,
    kind: parsed.kind,
    warnings: parsed.warnings,
    error: null,
  };
}
