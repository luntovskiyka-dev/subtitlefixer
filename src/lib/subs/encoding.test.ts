import { afterEach, describe, expect, it, vi } from 'vitest';
import { candidateDecodings, decodeBytes, decodeWithLabel, encodeUtf8 } from './encoding';
import {
  candidateDecodings as candidateDecodingsFromIndex,
  decodeBytes as decodeFromIndex,
  decodeWithLabel as decodeWithLabelFromIndex,
  encodeUtf8 as encodeFromIndex,
} from './index';

/** Build single-byte legacy encodings from TextDecoder's 0–255 code units. */
function legacyBytes(encoding: string, text: string): Uint8Array {
  const decoder = new TextDecoder(encoding);
  const byteForChar = new Map<string, number>();
  for (let byte = 0; byte < 256; byte += 1) {
    const char = decoder.decode(Uint8Array.of(byte));
    if ([...char].length === 1 && char !== '\uFFFD' && !byteForChar.has(char)) {
      byteForChar.set(char, byte);
    }
  }

  const chars = [...text];
  const bytes = new Uint8Array(chars.length);
  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    const byte = byteForChar.get(char);
    if (byte === undefined) {
      const code = char.codePointAt(0) ?? 0;
      throw new Error(`Cannot encode U+${code.toString(16)} with ${encoding}`);
    }
    bytes[index] = byte;
  }
  return bytes;
}

function repeatPhrase(phrase: string, times: number): string {
  return Array.from({ length: times }, () => phrase).join(' ');
}

const CYRILLIC = 'Привет, субтитры сдвинуться на две секунды.';
const ARABIC = 'مرحبا، الترجمة تتحرک لمدة ثانيتين.';
const TURKISH = "İstanbul'da altyazılar iki saniye kayıyor.";
const GREEK = 'Οι υπότιτλοι μετακινούνται δύο δευτερόλεπτα.';

const LEGACY = [
  { encoding: 'windows-1251', phrase: CYRILLIC, script: (code: number) => code >= 0x0400 && code <= 0x04ff },
  { encoding: 'windows-1256', phrase: ARABIC, script: (code: number) => code >= 0x0600 && code <= 0x06ff },
  { encoding: 'iso-8859-9', phrase: TURKISH, script: (code: number) => code >= 0x00c0 && code <= 0x024f },
  { encoding: 'iso-8859-7', phrase: GREEK, script: (code: number) => code >= 0x0370 && code <= 0x03ff },
] as const;

describe('decodeBytes', () => {
  it.each(LEGACY)('decodes $encoding text to the original phrase', ({ encoding, phrase, script }) => {
    for (const char of phrase) {
      const code = char.codePointAt(0) ?? 0;
      if (code < 0x80) continue;
      expect(script(code), `U+${code.toString(16)} is outside ${encoding}`).toBe(true);
    }

    const text = repeatPhrase(phrase, 8);
    const decoded = decodeBytes(legacyBytes(encoding, text));
    expect(decoded.encoding).toBe(encoding);
    expect(decoded.text).toBe(text);
    expect(decoded.text.startsWith(phrase)).toBe(true);
  });

  it('decodes UTF-8 with and without a BOM', () => {
    for (const phrase of [CYRILLIC, ARABIC, TURKISH, GREEK]) {
      const plain = decodeBytes(encodeUtf8(phrase, false));
      expect(plain).toEqual({ encoding: 'utf-8', text: phrase });

      const marked = decodeBytes(encodeUtf8(phrase, true));
      expect(marked).toEqual({ encoding: 'utf-8', text: phrase });
      expect(marked.text.includes('\uFEFF')).toBe(false);
    }
  });
});

describe('encodeUtf8', () => {
  it('prefixes EF BB BF only when a BOM is requested', () => {
    const plain = encodeUtf8(CYRILLIC, false);
    expect([...plain]).toEqual([...new TextEncoder().encode(CYRILLIC)]);

    const marked = encodeUtf8(CYRILLIC, true);
    expect([...marked.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect([...marked.slice(3)]).toEqual([...plain]);
  });

  it('round-trips an empty string', () => {
    expect(decodeBytes(encodeUtf8('', false))).toEqual({ encoding: 'utf-8', text: '' });
    expect([...encodeUtf8('', true)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(decodeBytes(encodeUtf8('', true))).toEqual({ encoding: 'utf-8', text: '' });
  });
});

const EXTRA_ORDER = [
  'windows-1251',
  'windows-1252',
  'windows-1256',
  'iso-8859-7',
  'iso-8859-9',
  'shift_jis',
  'gb18030',
] as const;

describe('candidateDecodings', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists windows-1251 first and other readings whose text differs', () => {
    const text = repeatPhrase(CYRILLIC, 8);
    const bytes = legacyBytes('windows-1251', text);
    const candidates = candidateDecodings(bytes);

    expect(candidates[0]).toEqual({ encoding: 'windows-1251', text });
    expect(candidates.length).toBeGreaterThan(1);
    expect(candidates.length).toBeLessThanOrEqual(4);

    const extras = candidates.slice(1);
    const positions = extras.map((candidate) => EXTRA_ORDER.indexOf(candidate.encoding as (typeof EXTRA_ORDER)[number]));
    expect(positions.every((position) => position >= 0)).toBe(true);
    for (let index = 1; index < positions.length; index += 1) {
      const previous = positions[index - 1] ?? -1;
      const current = positions[index] ?? -1;
      expect(current).toBeGreaterThan(previous);
    }
    for (const candidate of extras) {
      expect(candidate.text).not.toBe(text);
    }
  });

  it('does not treat windows-1252 as the windows-1251 text', () => {
    const text = repeatPhrase(CYRILLIC, 8);
    const bytes = legacyBytes('windows-1251', text);
    const decoded = decodeWithLabel(bytes, 'windows-1252');
    expect(decoded.encoding).toBe('windows-1252');
    expect(decoded.text).not.toBe(text);
  });

  it('lists utf-8 first for UTF-8 Cyrillic bytes', () => {
    const bytes = encodeUtf8(CYRILLIC, false);
    const candidates = candidateDecodings(bytes);
    expect(candidates[0]?.encoding).toBe('utf-8');
    expect(candidates[0]?.text).toBe(CYRILLIC);
    expect(candidates.length).toBeLessThanOrEqual(4);
  });

  it('does not call fetch', () => {
    const fetchSpy = vi.fn(() => {
      throw new Error('fetch must not be called');
    });
    vi.stubGlobal('fetch', fetchSpy);

    const bytes = legacyBytes('windows-1251', repeatPhrase(CYRILLIC, 8));
    candidateDecodings(bytes);
    decodeWithLabel(bytes, 'windows-1252');
    decodeWithLabel(encodeUtf8(CYRILLIC, false), 'utf-8');

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('decodeWithLabel', () => {
  it('strips a leading BOM and keeps the chosen label', () => {
    const decoded = decodeWithLabel(encodeUtf8(CYRILLIC, true), 'utf-8');
    expect(decoded).toEqual({ encoding: 'utf-8', text: CYRILLIC });
    expect(decoded.text.includes('\uFEFF')).toBe(false);
  });

  it('throws when the label is not a TextDecoder label', () => {
    expect(() => decodeWithLabel(Uint8Array.of(0x41), 'not-a-real-encoding')).toThrow();
  });
});

describe('index re-exports', () => {
  it('exposes decodeBytes and encodeUtf8', () => {
    expect(decodeFromIndex).toBe(decodeBytes);
    expect(encodeFromIndex).toBe(encodeUtf8);
    expect(candidateDecodingsFromIndex).toBe(candidateDecodings);
    expect(decodeWithLabelFromIndex).toBe(decodeWithLabel);
  });
});
