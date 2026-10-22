import type { PgsImage } from './pgs';

export class VobSubError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VobSubError';
  }
}

export type VobTrack = { index: number; id: string; label: string };

export type VobCue = {
  start: number;
  end: number;
  image: PgsImage;
};

const MISSING_END_MS = 5000;

function ascii(bytes: Uint8Array): string {
  let out = '';
  for (const byte of bytes) out += String.fromCharCode(byte);
  return out;
}

/** Language tracks listed in an IDX file, in file order. */
export function listVobTracks(idxText: string): VobTrack[] {
  const tracks: VobTrack[] = [];
  for (const line of idxText.split(/\r\n|\n|\r/)) {
    const match = /^\s*id:\s*([A-Za-z0-9_-]+)\s*,\s*index:\s*(\d+)/i.exec(line);
    if (!match?.[1] || match[2] === undefined) continue;
    const index = Number(match[2]);
    tracks.push({ index, id: match[1].toLowerCase(), label: `${match[1].toUpperCase()} (track ${index})` });
  }
  return tracks;
}

type Stamp = { time: number; pos: number; track: number };

function parseClock(value: string): number | null {
  const match = /^(\d+):([0-5]\d):([0-5]\d):(\d{1,3})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const ms = Number((match[4] ?? '').padEnd(3, '0'));
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + ms;
}

function parseIdx(text: string): { stamps: Stamp[]; palette: number[][]; delay: number } {
  const palette: number[][] = [];
  const stamps: Stamp[] = [];
  let delay = 0;
  let track = 0;
  for (const line of text.split(/\r\n|\n|\r/)) {
    const pal = /^\s*palette:\s*(.+)$/i.exec(line);
    if (pal?.[1] && palette.length === 0) {
      for (const item of pal[1].split(',')) {
        const hex = item.trim();
        if (!/^[0-9a-f]{6}$/i.test(hex)) continue;
        const value = Number.parseInt(hex, 16);
        palette.push([(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]);
      }
      continue;
    }
    const id = /^\s*id:\s*[A-Za-z0-9_-]+\s*,\s*index:\s*(\d+)/i.exec(line);
    if (id?.[1]) {
      track = Number(id[1]);
      continue;
    }
    const delayLine = /^\s*delay:\s*([+-]?)(\d+:[0-5]\d:[0-5]\d:\d{1,3})/i.exec(line);
    if (delayLine?.[2]) {
      const amount = parseClock(delayLine[2]);
      if (amount !== null) delay = delayLine[1] === '-' ? -amount : amount;
      continue;
    }
    const stamp = /^\s*timestamp:\s*(\d+:[0-5]\d:[0-5]\d:\d{1,3})\s*,\s*filepos:\s*([0-9a-f]+)/i.exec(line);
    if (stamp?.[1] && stamp[2]) {
      const time = parseClock(stamp[1]);
      if (time === null) continue;
      stamps.push({ time: time + delay, pos: Number.parseInt(stamp[2], 16), track });
    }
  }
  return { stamps, palette, delay };
}

class Nibbles {
  private high = true;
  private pos: number;

  constructor(
    private readonly data: Uint8Array,
    start: number,
  ) {
    this.pos = start;
  }

  next(): number {
    if (this.pos >= this.data.length) return 0;
    const byte = this.data[this.pos] ?? 0;
    if (this.high) {
      this.high = false;
      return byte >> 4;
    }
    this.high = true;
    this.pos += 1;
    return byte & 0x0f;
  }

  align(): void {
    if (!this.high) {
      this.high = true;
      this.pos += 1;
    }
  }
}

function readCode(nibbles: Nibbles): number {
  let value = nibbles.next();
  if (value < 0x4) {
    value = (value << 4) | nibbles.next();
    if (value < 0x10) {
      value = (value << 4) | nibbles.next();
      if (value < 0x40) value = (value << 4) | nibbles.next();
    }
  }
  return value;
}

function decodeField(
  pixels: Uint8Array,
  width: number,
  height: number,
  data: Uint8Array,
  offset: number,
  odd: boolean,
): void {
  const nibbles = new Nibbles(data, offset);
  const lines = odd ? Math.floor(height / 2) : Math.ceil(height / 2);
  for (let line = 0; line < lines; line += 1) {
    const y = line * 2 + (odd ? 1 : 0);
    let x = 0;
    while (x < width) {
      const code = readCode(nibbles);
      let length = code >> 2;
      const color = code & 3;
      if (length === 0) length = width - x;
      if (length > width - x) length = width - x;
      if (y < height) {
        for (let index = 0; index < length; index += 1) pixels[(y * width + x + index) * 1] = color;
      }
      x += length;
    }
    nibbles.align();
  }
}

type Control = { start: number; stop: number | null; colors: number[]; alpha: number[]; width: number; height: number; even: number; odd: number };

function readControl(data: Uint8Array, offset: number): Control | null {
  if (offset < 0 || offset + 4 > data.length) return null;
  const colors = [0, 0, 0, 0];
  const alpha = [0, 0, 0, 0];
  let width = 0;
  let height = 0;
  let even = 0;
  let odd = 0;
  let start = 0;
  let stop: number | null = null;
  let pos = offset;
  const seen = new Set<number>();
  while (pos + 4 <= data.length && seen.size < 8 && !seen.has(pos)) {
    seen.add(pos);
    const date = ((data[pos] ?? 0) << 8) | (data[pos + 1] ?? 0);
    const next = ((data[pos + 2] ?? 0) << 8) | (data[pos + 3] ?? 0);
    let cursor = pos + 4;
    while (cursor < data.length) {
      const command = data[cursor] ?? 0xff;
      cursor += 1;
      if (command === 0xff) break;
      if (command === 0x00) continue;
      if (command === 0x01) {
        start = date;
        continue;
      }
      if (command === 0x02) {
        stop = date;
        continue;
      }
      if (command === 0x03 && cursor + 2 <= data.length) {
        const first = data[cursor] ?? 0;
        const second = data[cursor + 1] ?? 0;
        colors[3] = first >> 4;
        colors[2] = first & 0x0f;
        colors[1] = second >> 4;
        colors[0] = second & 0x0f;
        cursor += 2;
        continue;
      }
      if (command === 0x04 && cursor + 2 <= data.length) {
        const first = data[cursor] ?? 0;
        const second = data[cursor + 1] ?? 0;
        alpha[3] = first >> 4;
        alpha[2] = first & 0x0f;
        alpha[1] = second >> 4;
        alpha[0] = second & 0x0f;
        cursor += 2;
        continue;
      }
      if (command === 0x05 && cursor + 6 <= data.length) {
        const raw = data.subarray(cursor, cursor + 6);
        const sx = ((raw[0] ?? 0) << 4) | ((raw[1] ?? 0) >> 4);
        const ex = (((raw[1] ?? 0) & 0x0f) << 8) | (raw[2] ?? 0);
        const sy = ((raw[3] ?? 0) << 4) | ((raw[4] ?? 0) >> 4);
        const ey = (((raw[4] ?? 0) & 0x0f) << 8) | (raw[5] ?? 0);
        width = Math.max(0, ex - sx + 1);
        height = Math.max(0, ey - sy + 1);
        cursor += 6;
        continue;
      }
      if (command === 0x06 && cursor + 4 <= data.length) {
        even = ((data[cursor] ?? 0) << 8) | (data[cursor + 1] ?? 0);
        odd = ((data[cursor + 2] ?? 0) << 8) | (data[cursor + 3] ?? 0);
        cursor += 4;
        continue;
      }
      break;
    }
    if (next <= pos || next >= data.length) break;
    pos = next;
  }
  if (width === 0 || height === 0 || width * height > 2_000_000) return null;
  return { start, stop, colors, alpha, width, height, even, odd };
}

function dateToMs(date: number): number {
  return Math.round((date * 1024) / 90);
}

function paint(data: Uint8Array, control: Control): PgsImage {
  const indexes = new Uint8Array(control.width * control.height);
  decodeField(indexes, control.width, control.height, data, control.even, false);
  decodeField(indexes, control.width, control.height, data, control.odd, true);
  const rgba = new Uint8Array(control.width * control.height * 4);
  for (let index = 0; index < indexes.length; index += 1) {
    const color = indexes[index] ?? 0;
    const opacity = control.alpha[color] ?? 0;
    if (opacity < 8) continue;
    const at = index * 4;
    rgba[at] = 255;
    rgba[at + 1] = 255;
    rgba[at + 2] = 255;
    rgba[at + 3] = 255;
  }
  return { width: control.width, height: control.height, rgba };
}

function spuFrom(data: Uint8Array): { start: number; end: number | null; image: PgsImage } | null {
  if (data.length < 4) return null;
  const size = ((data[0] ?? 0) << 8) | (data[1] ?? 0);
  const controlAt = ((data[2] ?? 0) << 8) | (data[3] ?? 0);
  const packet = size > 4 && size <= data.length ? data.subarray(0, size) : data;
  const control = readControl(packet, controlAt);
  if (!control) return null;
  return {
    start: dateToMs(control.start),
    end: control.stop === null ? null : dateToMs(control.stop),
    image: paint(packet, control),
  };
}

function readPesPayload(data: Uint8Array, offset: number): { next: number; payload: Uint8Array } | null {
  if (offset + 9 > data.length) return null;
  if (data[offset] !== 0 || data[offset + 1] !== 0 || data[offset + 2] !== 1 || data[offset + 3] !== 0xbd) return null;
  const length = ((data[offset + 4] ?? 0) << 8) | (data[offset + 5] ?? 0);
  const header = data[offset + 8] ?? 0;
  const start = offset + 9 + header;
  const end = offset + 6 + length;
  if (start > data.length || end > data.length || start > end) return null;
  return { next: end, payload: data.subarray(start, end) };
}

function collectSpu(data: Uint8Array, track: number): Uint8Array | null {
  const pieces: number[] = [];
  let offset = 0;
  let need: number | null = null;
  if (data.length >= 4 && data[0] === 0 && data[1] === 0 && data[2] === 1 && data[3] === 0xba) {
    offset = 14;
    if ((data[4] ?? 0) >> 6 === 1) {
      const stuffing = (data[13] ?? 0) & 0x07;
      offset = 14 + stuffing;
    }
  }
  while (offset + 4 <= data.length) {
    if (!(data[offset] === 0 && data[offset + 1] === 0 && data[offset + 2] === 1)) {
      offset += 1;
      continue;
    }
    if (data[offset + 3] === 0xba) {
      const stuffing = (data[offset + 13] ?? 0) & 0x07;
      offset += 14 + stuffing;
      continue;
    }
    const pes = readPesPayload(data, offset);
    if (!pes) {
      offset += 1;
      continue;
    }
    offset = pes.next;
    const payload = pes.payload;
    if (payload.length === 0) continue;
    const stream = payload[0] ?? 0;
    if (stream !== 0x20 + track) continue;
    for (let index = 1; index < payload.length; index += 1) pieces.push(payload[index] ?? 0);
    if (need === null && pieces.length >= 2) need = ((pieces[0] ?? 0) << 8) | (pieces[1] ?? 0);
    if (need !== null && pieces.length >= need) return Uint8Array.from(pieces.slice(0, need));
  }
  if (data.length >= 4 && !(data[0] === 0 && data[1] === 0 && data[2] === 1)) {
    const size = ((data[0] ?? 0) << 8) | (data[1] ?? 0);
    if (size >= 4 && size <= data.length) return data.subarray(0, size);
  }
  return pieces.length >= 4 ? Uint8Array.from(pieces) : null;
}

/**
 * DVD VobSub (.idx timings + .sub pictures) for one track.
 * Pictures are white ink on a clear background so the shared OCR prep can read them.
 */
export function parseVobSub(idxBytes: Uint8Array, subBytes: Uint8Array, track = 0): VobCue[] {
  const idx = parseIdx(ascii(idxBytes));
  const selected = idx.stamps.filter((stamp) => stamp.track === track);
  if (selected.length === 0) throw new VobSubError('No subtitles found for this track in the IDX file.');
  const cues: VobCue[] = [];
  for (let index = 0; index < selected.length; index += 1) {
    const stamp = selected[index];
    const next = selected[index + 1];
    if (!stamp) continue;
    const endPos = next ? Math.min(subBytes.length, next.pos) : subBytes.length;
    if (stamp.pos < 0 || stamp.pos >= subBytes.length || endPos <= stamp.pos) continue;
    const packet = collectSpu(subBytes.subarray(stamp.pos, endPos), track);
    if (!packet) continue;
    const spu = spuFrom(packet);
    if (!spu) continue;
    const start = stamp.time + spu.start;
    let end = spu.end === null ? start + MISSING_END_MS : stamp.time + spu.end;
    if (next && spu.end === null) end = next.time;
    if (end <= start) end = start + 1;
    cues.push({ start, end, image: spu.image });
  }
  if (cues.length === 0) throw new VobSubError('No subtitle pictures could be read from this SUB file.');
  return cues;
}

export function pairBaseName(name: string): string {
  return name.replace(/\.(idx|sub)$/i, '').toLowerCase();
}
