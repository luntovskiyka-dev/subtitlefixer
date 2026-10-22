import { describe, expect, it } from 'vitest';
import spruce from '../../../tests/fixtures/spruce.stl?raw';
import { parseStl } from './stl';

function gsi(code: string, cct: string): Uint8Array {
  const bytes = new Uint8Array(1024);
  const write = (at: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) bytes[at + index] = text.charCodeAt(index);
  };
  write(3, code);
  write(12, cct);
  return bytes;
}

function tti(number: number, extension: number, startFrame: number, endFrame: number, text: number[], comment = false): Uint8Array {
  const block = new Uint8Array(128);
  block[1] = (number >> 8) & 0xff;
  block[2] = number & 0xff;
  block[3] = extension;
  block[5] = 0;
  block[6] = 0;
  block[7] = Math.floor(startFrame / 25);
  block[8] = startFrame % 25;
  block[9] = 0;
  block[10] = 0;
  block[11] = Math.floor(endFrame / 25);
  block[12] = endFrame % 25;
  block[15] = comment ? 1 : 0;
  text.forEach((byte, index) => {
    block[16 + index] = byte;
  });
  return block;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

describe('parseStl', () => {
  it('reads EBU STL 25 fps Latin text, italics and extension blocks', async () => {
    const acuteE = [0xc2, 0x65];
    const first = tti(1, 0x00, 25, 75, [0x80, ...acuteE, 0x81]);
    const second = tti(1, 0xff, 25, 75, [0x8a, 0x42]);
    const comment = tti(2, 0xff, 100, 125, [0x43], true);
    const file = concat([gsi('STL25.01', '00'), first, second, comment]);
    const parsed = await parseStl(file);
    expect(parsed.kind).toBe('ebu');
    expect(parsed.fps).toBe(25);
    expect(parsed.cues).toEqual([{ start: 1000, end: 3000, text: '<i>e\u0301</i>\nB' }]);
  });

  it('decodes ISO 8859-5 and accepts a non-standard disk code', async () => {
    const cyr = new TextEncoder();
    void cyr;
    const ya = new TextDecoder('iso-8859-5').decode(Uint8Array.of(0xb0));
    expect(ya).toBe('А');
    const file = concat([gsi('STL24.01', '01'), tti(1, 0xff, 0, 24, [0xb0])]);
    const parsed = await parseStl(file);
    expect(parsed.fps).toBe(24);
    expect(parsed.warnings.join(' ')).toMatch(/STL24\.01/);
    expect(parsed.cues[0]?.text).toBe('А');
  });

  it('reads Spruce STL at 25 fps and 29.97 fps', async () => {
    const bytes = new TextEncoder().encode(spruce);
    const at25 = await parseStl(bytes, 25);
    expect(at25.kind).toBe('spruce');
    expect(at25.cues[0]).toEqual({ start: 1200, end: 3800, text: 'Hi, and welcome back.' });
    expect(at25.cues[1]?.text).toBe("Today we're\nfixing subtitles.");
    expect(at25.cues[1]?.start).toBe(4080);
    expect(at25.cues[1]?.end).toBe(7440);
    expect(at25.cues[2]?.text).toBe('<i>italic</i> <b>bold</b>');
    const at2997 = await parseStl(new TextEncoder().encode('00:00:01:00 , 00:00:01:01 , Hi\n'), 29.97);
    expect(at2997.cues[0]?.start).toBe(1000);
    expect(at2997.cues[0]?.end).toBe(1000 + Math.round(1001 / 30));
  });

  it('rejects a 3D model STL', async () => {
    const solid = new TextEncoder().encode('solid cube\nfacet normal 0 0 0\n');
    const parsed = await parseStl(solid);
    expect(parsed.error).toMatch(/EBU or Spruce/);
    expect(parsed.cues).toEqual([]);
  });
});
