import { describe, expect, it } from 'vitest';
import { listVobTracks, parseVobSub } from './vobsub';

function bytes(list: number[]): Uint8Array {
  return Uint8Array.from(list);
}

function be(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}

function sampleSpu(): Uint8Array {
  const rle = [0x90];
  const controlAt = 6;
  const commands = [
    0x03, 0x00, 0x00,
    0x04, 0x00, 0xf0,
    0x05, 0x00, 0x00, 0x01, 0x00, 0x00, 0x01,
    0x06, ...be(4), ...be(5),
    0x01,
    0xff,
  ];
  const secondAt = controlAt + 4 + commands.length;
  const second = [...be(90), ...be(secondAt), 0x02, 0xff];
  const body = [...be(0), ...be(secondAt), ...commands, ...second];
  const packet = [...be(4 + body.length), ...be(controlAt), ...rle, ...rle, ...body];
  return bytes(packet);
}

describe('parseVobSub', () => {
  it('lists tracks and decodes one SPU into a white bitmap', () => {
    const spu = sampleSpu();
    const idx = `size: 720x480
palette: ffffff, 000000, 000000, 000000, 000000, 000000, 000000, 000000, 000000, 000000, 000000, 000000, 000000, 000000, 000000, 000000
id: en, index: 0
timestamp: 00:00:01:000, filepos: 000000000
id: fr, index: 1
timestamp: 00:00:02:000, filepos: 000000100
`;
    expect(listVobTracks(idx).map((track) => track.id)).toEqual(['en', 'fr']);
    const cues = parseVobSub(new TextEncoder().encode(idx), spu, 0);
    expect(cues).toHaveLength(1);
    expect(cues[0]?.start).toBe(1000);
    expect(cues[0]?.image.width).toBe(2);
    expect(cues[0]?.image.height).toBe(2);
    expect(cues[0]?.image.rgba[3]).toBe(255);
    expect(cues[0]?.image.rgba[0]).toBe(255);
  });

  it('reads the same SPU wrapped in a private-stream PES packet', () => {
    const spu = sampleSpu();
    const payload = [0x20, ...spu];
    const pes = [0x00, 0x00, 0x01, 0xbd, ...be(3 + payload.length), 0x80, 0x00, 0x00, ...payload];
    const idx = 'id: en, index: 0\ntimestamp: 00:00:01:000, filepos: 000000000\n';
    const cues = parseVobSub(new TextEncoder().encode(idx), bytes(pes), 0);
    expect(cues[0]?.image.width).toBe(2);
    expect(cues[0]?.end).toBeGreaterThan(cues[0]?.start ?? 0);
  });
});
