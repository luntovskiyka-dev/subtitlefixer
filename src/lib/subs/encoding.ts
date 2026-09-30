import jschardet from 'jschardet';

const UTF8_BOM = new Uint8Array([0xef, 0xbb, 0xbf]);

/**
 * jschardet labels (compat names and aliases) mapped onto TextDecoder labels.
 * windows-1254 is the WHATWG name for iso-8859-9, so both decode the same way.
 */
const DECODER_LABELS: Record<string, string> = {
  'utf-8': 'utf-8',
  utf8: 'utf-8',
  'utf-8-sig': 'utf-8',
  ascii: 'utf-8',
  'us-ascii': 'utf-8',
  'windows-1251': 'windows-1251',
  cp1251: 'windows-1251',
  'windows-1252': 'windows-1252',
  cp1252: 'windows-1252',
  'iso-8859-1': 'windows-1252',
  'iso8859-1': 'windows-1252',
  latin1: 'windows-1252',
  'windows-1256': 'windows-1256',
  cp1256: 'windows-1256',
  'iso-8859-7': 'iso-8859-7',
  'iso8859-7': 'iso-8859-7',
  'iso-8859-8': 'iso-8859-8',
  'iso8859-8': 'iso-8859-8',
  'iso-8859-9': 'iso-8859-9',
  'iso8859-9': 'iso-8859-9',
  'windows-1254': 'iso-8859-9',
  cp1254: 'iso-8859-9',
  latin5: 'iso-8859-9',
  'shift-jis': 'shift_jis',
  'shift_jis': 'shift_jis',
  sjis: 'shift_jis',
  cp932: 'shift_jis',
  'windows-31j': 'shift_jis',
  gb18030: 'gb18030',
  gbk: 'gb18030',
  gb2312: 'gb18030',
};

function detectorKey(label: string): string {
  return label.trim().toLowerCase().replace(/_/g, '-');
}

function mapDetectedEncoding(label: string | null): string {
  if (!label) return 'utf-8';
  const key = detectorKey(label);
  const mapped = DECODER_LABELS[key];
  if (mapped) return mapped;
  try {
    const canonical = new TextDecoder(key).encoding;
    if (canonical === 'windows-1254') return 'iso-8859-9';
    return canonical;
  } catch {
    return 'utf-8';
  }
}

function hasUtf8Bom(bytes: Uint8Array): boolean {
  return (
    bytes.length >= UTF8_BOM.length &&
    bytes[0] === UTF8_BOM[0] &&
    bytes[1] === UTF8_BOM[1] &&
    bytes[2] === UTF8_BOM[2]
  );
}

function stripLeadingBom(text: string): string {
  return text.replace(/^\uFEFF/, '');
}

/** Extra readings, in this order, after the detected decoding. At most three are kept. */
const EXTRA_LABELS = [
  'windows-1251',
  'windows-1252',
  'windows-1256',
  'iso-8859-7',
  'iso-8859-9',
  'shift_jis',
  'gb18030',
] as const;

export function decodeBytes(bytes: Uint8Array): { encoding: string; text: string } {
  const detected = jschardet.detect(bytes);
  const encoding = hasUtf8Bom(bytes) ? 'utf-8' : mapDetectedEncoding(detected.encoding);
  const text = stripLeadingBom(new TextDecoder(encoding).decode(bytes));
  return { encoding, text };
}

export function decodeWithLabel(bytes: Uint8Array, label: string): { encoding: string; text: string } {
  const text = stripLeadingBom(new TextDecoder(label).decode(bytes));
  return { encoding: label, text };
}

export function candidateDecodings(bytes: Uint8Array): { encoding: string; text: string }[] {
  const detected = decodeBytes(bytes);
  const results: { encoding: string; text: string }[] = [detected];
  for (const label of EXTRA_LABELS) {
    if (results.length >= 4) break;
    const decoded = decodeWithLabel(bytes, label);
    if (decoded.text === detected.text) continue;
    results.push(decoded);
  }
  return results;
}

const MOJIBAKE_VIAS = ['windows-1252', 'windows-1251'] as const;

export type MojibakeVia = (typeof MOJIBAKE_VIAS)[number];

const MOJIBAKE_MARKERS = new Set(['Ã', 'Ð', 'Ñ', 'Р', 'С']);

const singleByteMaps = new Map<MojibakeVia, Map<string, number>>();

function singleByteMap(via: MojibakeVia): Map<string, number> {
  const cached = singleByteMaps.get(via);
  if (cached) return cached;

  const decoder = new TextDecoder(via);
  const map = new Map<string, number>();
  for (let byte = 0; byte < 256; byte += 1) {
    const char = decoder.decode(Uint8Array.of(byte));
    if (char.length !== 1 || char === '\uFFFD' || map.has(char)) continue;
    map.set(char, byte);
  }
  singleByteMaps.set(via, map);
  return map;
}

function encodeSingleByte(text: string, via: MojibakeVia): Uint8Array | null {
  const map = singleByteMap(via);
  const chars = [...text];
  const bytes = new Uint8Array(chars.length);
  for (let index = 0; index < chars.length; index += 1) {
    const byte = map.get(chars[index] ?? '');
    if (byte === undefined) return null;
    bytes[index] = byte;
  }
  return bytes;
}

function decodeUtf8Fatal(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function markerCount(text: string): number {
  let count = 0;
  for (const char of text) {
    if (MOJIBAKE_MARKERS.has(char)) count += 1;
  }
  return count;
}

function repairVia(text: string, via: MojibakeVia): { text: string; via: MojibakeVia } | null {
  const bytes = encodeSingleByte(text, via);
  if (!bytes) return null;
  const decoded = decodeUtf8Fatal(bytes);
  if (decoded === null || decoded === text || decoded.includes('\uFFFD')) return null;
  return { text: decoded, via };
}

/**
 * Undo UTF-8 that was opened as windows-1252 or windows-1251.
 * A string that is already correct UTF-8 returns null.
 */
export function repairMojibake(text: string): { text: string; via: MojibakeVia } | null {
  const western = repairVia(text, 'windows-1252');
  const cyrillic = repairVia(text, 'windows-1251');
  if (western && cyrillic) {
    return markerCount(cyrillic.text) < markerCount(western.text) ? cyrillic : western;
  }
  return western ?? cyrillic;
}

export function encodeUtf8(text: string, bom: boolean): Uint8Array {
  const encoded = new TextEncoder().encode(text);
  if (!bom) return encoded;
  const out = new Uint8Array(UTF8_BOM.length + encoded.length);
  out.set(UTF8_BOM, 0);
  out.set(encoded, UTF8_BOM.length);
  return out;
}
