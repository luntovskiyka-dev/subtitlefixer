import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { decodePgsRle, parseSup, PgsError, ptsToMs, supFileError, supOutputName, ycbcrToRgb } from './pgs';

function u16(value: number): number[] {
  return [(value >> 8) & 255, value & 255];
}

function segment(type: number, pts: number, data: number[]): Uint8Array {
  const out = new Uint8Array(13 + data.length);
  out[0] = 0x50;
  out[1] = 0x47;
  out[2] = Math.floor(pts / 0x1000000) & 255;
  out[3] = Math.floor(pts / 0x10000) & 255;
  out[4] = Math.floor(pts / 0x100) & 255;
  out[5] = pts & 255;
  out[10] = type;
  out[11] = (data.length >> 8) & 255;
  out[12] = data.length & 255;
  out.set(data, 13);
  return out;
}

function join(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

const palette = [0, 0, 0, 16, 128, 128, 0, 1, 235, 128, 128, 255];

function object(id: number, flags: number, x: number, y: number, crop?: number[]): number[] {
  const bytes = [...u16(id), 0, flags, ...u16(x), ...u16(y)];
  if (crop) bytes.push(...crop);
  return bytes;
}

function pcs(state: number, comp: number, objects: number[]): number[] {
  return [...u16(192), ...u16(108), 0x10, ...u16(comp), state, 0, 0, objects.length === 0 ? 0 : 1, ...objects];
}

function show(pts: number, state: number, comp: number, rle: number[], width: number, height: number, placed: number[]): Uint8Array {
  const length = 4 + rle.length;
  const ods = [...u16(1), 0, 0xc0, (length >> 16) & 255, (length >> 8) & 255, length & 255, ...u16(width), ...u16(height), ...rle];
  const wds = [1, 0, ...u16(0), ...u16(0), ...u16(192), ...u16(108)];
  return join([
    segment(0x16, pts, pcs(state, comp, placed)),
    segment(0x17, pts, wds),
    segment(0x14, pts, palette),
    segment(0x15, pts, ods),
    segment(0x80, pts, []),
  ]);
}

function pixel(rgba: Uint8Array, width: number, x: number, y: number): number[] {
  const index = (y * width + x) * 4;
  return [rgba[index] ?? 0, rgba[index + 1] ?? 0, rgba[index + 2] ?? 0, rgba[index + 3] ?? 0];
}

describe('ycbcrToRgb', () => {
  it('maps studio black and white', () => {
    expect(ycbcrToRgb(16, 128, 128)).toEqual([0, 0, 0]);
    expect(ycbcrToRgb(235, 128, 128)).toEqual([255, 255, 255]);
    expect(ycbcrToRgb(128, 100, 160)).toEqual([181, 115, 74]);
  });
});

describe('decodePgsRle', () => {
  it('decodes single pixels, short zero runs, and end of line', () => {
    const pixels = decodePgsRle(Uint8Array.from([0x01, 0x01, 0x00, 0x02, 0x00, 0x00, 0x01, 0x00, 0x03, 0x00, 0x00]), 4, 2);
    expect(Array.from(pixels)).toEqual([1, 1, 0, 0, 1, 0, 0, 0]);
  });

  it('decodes long runs', () => {
    const zeros = decodePgsRle(Uint8Array.from([0x00, 0x40, 70, 0x00, 0x00]), 70, 1);
    expect(zeros.every((value) => value === 0)).toBe(true);
    expect(zeros).toHaveLength(70);
    const color = decodePgsRle(Uint8Array.from([0x00, 0xc0, 70, 0x02, 0x00, 0x00]), 70, 1);
    expect(color.every((value) => value === 2)).toBe(true);
  });
});

describe('ptsToMs', () => {
  it('converts the 90 kHz clock', () => {
    expect(ptsToMs(90_000)).toBe(1000);
    expect(ptsToMs(675_000)).toBe(7500);
  });
});

describe('parseSup', () => {
  const fixture = new Uint8Array(
    readFileSync(fileURLToPath(new URL('../../../tests/fixtures/pgs-two-cues.sup', import.meta.url))),
  );

  it('reads the fixture timeline and pixels', () => {
    const cues = parseSup(fixture);
    expect(cues.map((cue) => [cue.start, cue.end, cue.image.width, cue.image.height])).toEqual([
      [1000, 3000, 4, 2],
      [4000, 6000, 2, 1],
      [6000, 7500, 1, 1],
    ]);
    const first = cues[0]?.image;
    if (!first) throw new Error('missing cue');
    expect(pixel(first.rgba, first.width, 0, 0)).toEqual([255, 255, 255, 255]);
    expect(pixel(first.rgba, first.width, 2, 0)).toEqual([0, 0, 0, 0]);
    expect(pixel(first.rgba, first.width, 0, 1)).toEqual([255, 255, 255, 255]);
    expect(pixel(first.rgba, first.width, 1, 1)).toEqual([0, 0, 0, 0]);
    const second = cues[1]?.image;
    if (!second) throw new Error('missing cue');
    expect(pixel(second.rgba, second.width, 0, 0)).toEqual([255, 255, 255, 255]);
    expect(pixel(second.rgba, second.width, 1, 0)).toEqual([255, 255, 255, 255]);
  });

  it('ends a picture at the next display set when the file never clears the screen', () => {
    const file = join([
      show(90_000, 0x80, 1, [0x01, 0x00, 0x00], 1, 1, object(1, 0, 0, 0)),
      show(180_000, 0x00, 2, [0x01, 0x00, 0x00], 1, 1, object(1, 0, 0, 0)),
    ]);
    const cues = parseSup(file);
    expect(cues.map((cue) => [cue.start, cue.end])).toEqual([
      [1000, 2000],
      [2000, 7000],
    ]);
  });

  it('joins ODS fragments and crops the bitmap', () => {
    const first = [...u16(1), 0, 0x80, 0, 0, 7, ...u16(4), ...u16(1), 0x00, 0x01];
    const second = [...u16(1), 0, 0x40, 0x01, 0x01, 0x00, 0x01, 0x00, 0x00];
    const crop = [...u16(1), ...u16(0), ...u16(2), ...u16(1)];
    const file = join([
      segment(0x16, 90_000, pcs(0x80, 1, object(1, 0x80, 4, 6, crop))),
      segment(0x14, 90_000, palette),
      segment(0x15, 90_000, first),
      segment(0x15, 90_000, second),
      segment(0x80, 90_000, []),
      segment(0x16, 180_000, pcs(0x00, 2, [])),
      segment(0x80, 180_000, []),
    ]);
    const cues = parseSup(file);
    expect(cues).toHaveLength(1);
    expect(cues[0]?.image.width).toBe(2);
    expect(cues[0]?.image.height).toBe(1);
    expect(pixel(cues[0]!.image.rgba, 2, 0, 0)).toEqual([255, 255, 255, 255]);
    expect(pixel(cues[0]!.image.rgba, 2, 1, 0)).toEqual([255, 255, 255, 255]);
    expect(cues[0]?.end).toBe(2000);
  });

  it('clips an object to its window', () => {
    const file = join([
      segment(0x16, 90_000, pcs(0x80, 1, object(1, 0, 0, 0))),
      segment(0x17, 90_000, [1, 0, ...u16(1), ...u16(0), ...u16(2), ...u16(1)]),
      segment(0x14, 90_000, palette),
      segment(0x15, 90_000, [...u16(1), 0, 0xc0, 0, 0, 8, ...u16(4), ...u16(1), 0x00, 0x01, 0x01, 0x01, 0x00, 0x00]),
      segment(0x80, 90_000, []),
    ]);
    const cues = parseSup(file);
    expect(cues[0]?.image.width).toBe(2);
    expect(cues[0]?.image.height).toBe(1);
    expect(cues[0]?.end).toBe(6000);
  });

  it('rejects a file that is not a SUP or is cut off', () => {
    expect(() => parseSup(Uint8Array.from([0, 1, 2]))).toThrow(PgsError);
    expect(() => parseSup(Uint8Array.from([0x50, 0x47, 0, 0, 0, 0, 0, 0, 0, 0, 0x16, 0, 20]))).toThrow(
      'This SUP file is cut off.',
    );
  });
});

describe('sup file names', () => {
  it('rejects DVD image subtitles and names the SRT', () => {
    expect(supFileError('movie.sup')).toBeNull();
    expect(supFileError('movie.SUB')).toMatch(/not supported yet/);
    expect(supFileError('movie.idx')).toMatch(/not supported yet/);
    expect(supFileError('notes.txt')).toMatch(/Blu-ray .sup/);
    expect(supOutputName('Movie.SUP')).toBe('Movie.srt');
    expect(supOutputName('a.b.sup')).toBe('a.b.srt');
  });
});
