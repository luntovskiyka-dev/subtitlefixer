const UTF8_BOM = new Uint8Array([0xef, 0xbb, 0xbf]);

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

/**
 * Decode subtitle bytes. Valid UTF-8 never loads the charset detector.
 * Anything else pulls that detector in with a dynamic import.
 */
export async function decodeBytes(bytes: Uint8Array): Promise<{ encoding: string; text: string }> {
  const utf8 = decodeUtf8Fatal(bytes);
  if (utf8 !== null) {
    return { encoding: 'utf-8', text: stripLeadingBom(utf8) };
  }
  const { detectEncodingLabel } = await import('./detectEncoding');
  const encoding = detectEncodingLabel(bytes);
  const text = stripLeadingBom(new TextDecoder(encoding).decode(bytes));
  return { encoding, text };
}

export function decodeWithLabel(bytes: Uint8Array, label: string): { encoding: string; text: string } {
  const text = stripLeadingBom(new TextDecoder(label).decode(bytes));
  return { encoding: label, text };
}

export async function candidateDecodings(
  bytes: Uint8Array,
): Promise<{ encoding: string; text: string }[]> {
  const detected = await decodeBytes(bytes);
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
