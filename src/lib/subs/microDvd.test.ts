import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import broken from '../../../tests/fixtures/broken-microdvd.sub?raw';
import sample from '../../../tests/fixtures/microdvd.sub?raw';
import vobIdx from '../../../tests/fixtures/vobsub.idx?raw';
import { decodeBytes } from './encoding';
import { microDvdToSrt as microDvdFromIndex } from './index';
import {
  DEFAULT_MICRODVD_FPS,
  VOBSUB_ERROR,
  isVobSub,
  microDvdFileError,
  microDvdToSrt,
  readMicroDvdFps,
  srtNamesForSub,
} from './microDvd';
import { parseSrt } from './srt';

/** Single-byte legacy encodings, from TextDecoder's 0–255 code units. */
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
    const char = chars[index] ?? '';
    const byte = byteForChar.get(char);
    if (byte === undefined) throw new Error(`Cannot encode ${char} with ${encoding}`);
    bytes[index] = byte;
  }
  return bytes;
}

describe('microDvdToSrt', () => {
  const fetchSpy = vi.fn(() => {
    throw new Error('fetch must not be called');
  });

  beforeEach(() => {
    fetchSpy.mockClear();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('converts the page example at 25 fps and rounds to milliseconds', () => {
    const result = microDvdToSrt(sample, 25);
    expect(result.errors).toEqual([]);
    expect(result.fps).toBe(25);
    expect(result.fpsFromFile).toBe(false);
    expect(result.span).toEqual({ first: '00:00:00,000', last: '00:00:05,000' });
    expect(result.text).toBe(
      '1\n00:00:00,000 --> 00:00:02,000\nHi, and welcome back.\n\n2\n00:00:02,000 --> 00:00:05,000\nToday we\'re fixing subtitles.\n',
    );
    expect(parseSrt(result.text).cues).toEqual([
      { start: 0, end: 2000, text: 'Hi, and welcome back.' },
      { start: 2000, end: 5000, text: "Today we're fixing subtitles." },
    ]);
    expect(microDvdFromIndex).toBe(microDvdToSrt);
  });

  it('uses a {1}{1} frame-rate line instead of the fps argument', () => {
    const body = '{0}{24}One second at the file rate.\n';
    expect(readMicroDvdFps(`{1}{1}23.976\n${body}`)).toBe(23.976);
    expect(microDvdToSrt(`{1}{1}23.976\n${body}`, 30)).toMatchObject({
      fps: 23.976,
      fpsFromFile: true,
      errors: [],
      cues: [{ start: 0, end: 1001, text: 'One second at the file rate.' }],
    });

    for (const header of ['{1}{1}24', '{1}{1}24.000', '{1}{1}25', '{1}{1}25.000', '{1}{1}29.97', '{1}{1}29.970', '{1}{1}30', '{1}{1}30.000']) {
      const result = microDvdToSrt(`${header}\n{0}{1}Hi\n`, DEFAULT_MICRODVD_FPS);
      expect(result.fpsFromFile).toBe(true);
      expect(result.cues).toHaveLength(1);
      expect(result.fps).not.toBe(DEFAULT_MICRODVD_FPS);
    }
  });

  it('uses the fps argument when the file has no frame-rate line', () => {
    const text = '{0}{24}Hi\n';
    expect(readMicroDvdFps(text)).toBeNull();
    expect(microDvdToSrt(text, 24).cues).toEqual([{ start: 0, end: 1000, text: 'Hi' }]);
    expect(microDvdToSrt(text, 30).cues).toEqual([{ start: 0, end: 800, text: 'Hi' }]);
    expect(microDvdToSrt('{1}{1}15\n', 24).cues[0]?.text).toBe('15');
  });

  it('turns pipes into line breaks and {y:i}/{y:b} into italics and bold', () => {
    const result = microDvdToSrt(broken, 30);
    expect(result.fps).toBe(25);
    expect(result.fpsFromFile).toBe(true);
    expect(result.cues.map((cue) => cue.text)).toEqual([
      'Hello',
      '<i>Line one\n<b>Line two</b></i>',
    ]);
    expect(result.errors.map((error) => error.message)).toEqual([
      'Line 3 is not a MicroDVD cue.',
      'Line 4 ends before it starts.',
    ]);
    expect(result.text).not.toContain('{c:');
    expect(result.text).not.toContain('|');

    const toggled = microDvdToSrt('{0}{10}{Y:B}Bold {y:i}and italic\n', 25);
    expect(toggled.cues[0]?.text).toBe('<b>Bold <i>and italic</i></b>');
  });

  it('rejects a binary VobSub .sub and an .idx file', () => {
    const bytes = Uint8Array.from([0x00, 0x00, 0x01, 0xba, 0x44, 0x00]);
    const binary = { name: 'movie.sub', text: 'not text', bytes };
    expect(isVobSub(binary)).toBe(true);
    expect(microDvdFileError(binary)).toBe(VOBSUB_ERROR);
    expect(microDvdToSrt('not text', 25, { name: 'movie.sub', bytes })).toEqual({
      text: '',
      cues: [],
      errors: [{ block: 1, message: VOBSUB_ERROR }],
      fps: null,
      fpsFromFile: false,
      span: null,
    });

    const idxBytes = new TextEncoder().encode(vobIdx);
    const idx = { name: 'movie.idx', text: vobIdx, bytes: idxBytes };
    expect(isVobSub(idx)).toBe(true);
    expect(microDvdFileError(idx)).toBe(VOBSUB_ERROR);
    expect(microDvdFileError({ name: 'notes.txt', text: 'hello', bytes: new TextEncoder().encode('hello') })).toBe(
      'Use a MicroDVD .sub file.',
    );
  });

  it('reads a Polish Windows-1250 file as UTF-8 text', async () => {
    const polish = '{100}{200}Część pierwsza: żółć, śliwka, źródło i łąka.|To jest polski napis.\n{200}{300}Jeszcze raz: zażółć gęślą jaźń.\n'.repeat(5);
    const decoded = await decodeBytes(legacyBytes('windows-1250', polish));
    expect(decoded.encoding).toBe('windows-1250');
    const result = microDvdToSrt(decoded.text, 25);
    expect(result.errors).toEqual([]);
    expect(result.cues[0]?.text).toBe('Część pierwsza: żółć, śliwka, źródło i łąka.\nTo jest polski napis.');
    expect(result.text).toContain('zażółć gęślą jaźń.');
  });

  it('reports an empty file and names the SRT downloads', () => {
    const empty = microDvdToSrt('   \n', 25);
    expect(empty.cues).toEqual([]);
    expect(empty.errors.map((error) => error.message)).toEqual(['No MicroDVD cues were found.']);
    expect(srtNamesForSub(['Movie.SUB', 'movie.sub', '.sub'])).toEqual([
      'Movie.srt',
      'movie (2).srt',
      'subtitles.srt',
    ]);
  });
});
