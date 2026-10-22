import { describe, expect, it } from 'vitest';
import { preprocessForOcr } from './preprocess';
import { cleanOcrText } from './text';
import { isOcrLanguage, OCR_LANGUAGES } from './languages';
import { OCR_CORE_PATH, OCR_LANG_PATH, OCR_WORKER_PATH, ocrAssetUrl } from './paths';

describe('preprocessForOcr', () => {
  it('inverts light ink, doubles it, and pads with white', () => {
    const rgba = new Uint8Array([
      255, 255, 255, 255, 0, 0, 0, 0,
      255, 0, 0, 255, 255, 255, 255, 15,
    ]);
    const source = { width: 2, height: 2, rgba };
    const image = preprocessForOcr(source);
    expect(image.width).toBe(2 * 2 + 20);
    expect(image.height).toBe(2 * 2 + 20);
    expect(Array.from(source.rgba.slice(0, 4))).toEqual([255, 255, 255, 255]);
    const at = (x: number, y: number) => {
      const index = (y * image.width + x) * 4;
      return [image.rgba[index], image.rgba[index + 1], image.rgba[index + 2], image.rgba[index + 3]];
    };
    expect(at(0, 0)).toEqual([255, 255, 255, 255]);
    expect(at(10, 10)).toEqual([0, 0, 0, 255]);
    expect(at(11, 11)).toEqual([0, 0, 0, 255]);
    expect(at(12, 10)).toEqual([255, 255, 255, 255]);
    expect(at(10, 12)).toEqual([179, 179, 179, 255]);
    expect(at(12, 12)).toEqual([255, 255, 255, 255]);
  });
});

describe('cleanOcrText', () => {
  it('trims lines and drops blanks', () => {
    expect(cleanOcrText('  Hello \r\n \n world  ')).toBe('Hello\nworld');
    expect(cleanOcrText('a  b')).toBe('a b');
    expect(cleanOcrText('\n\n')).toBe('');
  });
});

describe('OCR languages and asset paths', () => {
  it('offers the seven languages and same-origin files', () => {
    expect(OCR_LANGUAGES.map((language) => language.code)).toEqual(['eng', 'spa', 'fra', 'deu', 'por', 'ita', 'rus']);
    expect(isOcrLanguage('eng')).toBe(true);
    expect(isOcrLanguage('jpn')).toBe(false);
    expect(OCR_WORKER_PATH).toBe('/ocr/worker.min.js');
    expect(OCR_CORE_PATH).toBe('/ocr');
    expect(OCR_LANG_PATH).toBe('/ocr/lang');
    expect(ocrAssetUrl('https://subtitlefixer.com', OCR_LANG_PATH)).toBe('https://subtitlefixer.com/ocr/lang');
    expect(`${OCR_WORKER_PATH} ${OCR_CORE_PATH} ${OCR_LANG_PATH}`).not.toMatch(/jsdelivr|cdn\./);
  });
});
