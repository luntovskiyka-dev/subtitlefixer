/**
 * Blu-ray PGS (.sup) reader. Segments are PCS, WDS, PDS, ODS and END.
 * Times come from the 90 kHz PTS. A picture ends at the next display set,
 * which is either an empty PCS or the next picture.
 */

export type PgsImage = {
  width: number;
  height: number;
  rgba: Uint8Array;
};

export type PgsCue = {
  start: number;
  end: number;
  image: PgsImage;
};

export class PgsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PgsError';
  }
}

/** How long a picture stays up when the file never hides it. */
export const PGS_MISSING_END_MS = 5000;

const HEADER = 13;
const PCS = 0x16;
const WDS = 0x17;
const PDS = 0x14;
const ODS = 0x15;
const END = 0x80;
const EPOCH_START = 0x80;
const MAX_PIXELS = 2_000_000;

type Rgba = { r: number; g: number; b: number; a: number };

type Crop = { x: number; y: number; width: number; height: number };

type WindowBox = { id: number; x: number; y: number; width: number; height: number };

type ObjectRef = {
  id: number;
  windowId: number;
  x: number;
  y: number;
  crop: Crop | null;
};

type Pcs = {
  pts: number;
  state: number;
  paletteUpdate: boolean;
  paletteId: number;
  objects: ObjectRef[];
};

type Bitmap = { width: number; height: number; indices: Uint8Array };

type PartialBitmap = { width: number; height: number; chunks: Uint8Array[] };

type Ods = {
  id: number;
  first: boolean;
  last: boolean;
  width: number;
  height: number;
  rle: Uint8Array;
};

type Mark =
  | { kind: 'show'; pts: number; image: PgsImage }
  | { kind: 'clear'; pts: number };

function u16(bytes: Uint8Array, offset: number): number {
  return (bytes[offset]! << 8) | bytes[offset + 1]!;
}

function u32(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset]! * 0x1000000 +
    bytes[offset + 1]! * 0x10000 +
    bytes[offset + 2]! * 0x100 +
    bytes[offset + 3]!
  );
}

function clampByte(value: number): number {
  const rounded = Math.round(value);
  if (rounded < 0) return 0;
  if (rounded > 255) return 255;
  return rounded;
}

/** BT.601 studio-range YCbCr, the conversion PGS palettes are authored with. */
export function ycbcrToRgb(y: number, cb: number, cr: number): [number, number, number] {
  const y1 = (y - 16) * 1.164383562;
  const cb1 = cb - 128;
  const cr1 = cr - 128;
  let r = y1 + 1.596026317 * cr1;
  let g = y1 - 0.8129674985 * cr1 - 0.3917615979 * cb1;
  let b = y1 + 2.017232218 * cb1;
  if (r > 254) r += 0.35;
  if (g > 254) g += 0.35;
  if (b > 254) b += 0.35;
  return [clampByte(r), clampByte(g), clampByte(b)];
}

export function ptsToMs(pts: number): number {
  return Math.round(pts / 90);
}

/**
 * PGS RLE. A non-zero byte is one pixel. 0x00 then 0x00 ends the line.
 * Other 0x00 codes are runs of colour 0 or of a following colour.
 */
export function decodePgsRle(rle: Uint8Array, width: number, height: number): Uint8Array {
  const pixels = new Uint8Array(Math.max(0, width) * Math.max(0, height));
  if (width <= 0 || height <= 0) return pixels;
  let i = 0;
  let x = 0;
  let y = 0;
  while (i < rle.length && y < height) {
    const lead = rle[i]!;
    i += 1;
    let index = 0;
    let count = 0;
    if (lead !== 0) {
      index = lead;
      count = 1;
    } else {
      if (i >= rle.length) break;
      const mark = rle[i]!;
      i += 1;
      if (mark === 0) {
        x = 0;
        y += 1;
        continue;
      }
      const mode = mark & 0xc0;
      if (mode === 0x00) {
        count = mark;
      } else if (mode === 0x40) {
        if (i >= rle.length) break;
        count = ((mark & 0x3f) << 8) | rle[i]!;
        i += 1;
      } else if (mode === 0x80) {
        if (i >= rle.length) break;
        count = mark & 0x3f;
        index = rle[i]!;
        i += 1;
      } else {
        if (i + 1 >= rle.length) break;
        count = ((mark & 0x3f) << 8) | rle[i]!;
        i += 1;
        index = rle[i]!;
        i += 1;
      }
    }
    for (let n = 0; n < count && x < width; n += 1) {
      pixels[y * width + x] = index;
      x += 1;
    }
  }
  return pixels;
}

function concat(parts: readonly Uint8Array[]): Uint8Array {
  let total = 0;
  for (const part of parts) total += part.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function parsePcs(data: Uint8Array, pts: number): Pcs | null {
  if (data.length < 11) return null;
  const objects: ObjectRef[] = [];
  const count = data[10]!;
  let offset = 11;
  for (let index = 0; index < count; index += 1) {
    if (offset + 8 > data.length) break;
    const flags = data[offset + 3]!;
    const ref: ObjectRef = {
      id: u16(data, offset),
      windowId: data[offset + 2]!,
      x: u16(data, offset + 4),
      y: u16(data, offset + 6),
      crop: null,
    };
    offset += 8;
    if ((flags & 0x80) !== 0) {
      if (offset + 8 > data.length) break;
      ref.crop = {
        x: u16(data, offset),
        y: u16(data, offset + 2),
        width: u16(data, offset + 4),
        height: u16(data, offset + 6),
      };
      offset += 8;
    }
    objects.push(ref);
  }
  return {
    pts,
    state: data[7]!,
    paletteUpdate: data[8] === 0x80,
    paletteId: data[9]!,
    objects,
  };
}

function parseWds(data: Uint8Array): WindowBox[] {
  const windows: WindowBox[] = [];
  if (data.length < 1) return windows;
  const count = data[0]!;
  let offset = 1;
  for (let index = 0; index < count && offset + 9 <= data.length; index += 1) {
    windows.push({
      id: data[offset]!,
      x: u16(data, offset + 1),
      y: u16(data, offset + 3),
      width: u16(data, offset + 5),
      height: u16(data, offset + 7),
    });
    offset += 9;
  }
  return windows;
}

function parsePds(data: Uint8Array): { id: number; entries: { index: number; color: Rgba }[] } | null {
  if (data.length < 7) return null;
  const entries: { index: number; color: Rgba }[] = [];
  for (let offset = 2; offset + 5 <= data.length; offset += 5) {
    const [r, g, b] = ycbcrToRgb(data[offset + 1]!, data[offset + 3]!, data[offset + 2]!);
    entries.push({
      index: data[offset]!,
      color: { r, g, b, a: data[offset + 4]! },
    });
  }
  if (entries.length === 0) return null;
  return { id: data[0]!, entries };
}

function parseOds(data: Uint8Array, forceFirst: boolean): Ods | null {
  if (data.length < 4) return null;
  const seq = data[3]!;
  const first = (seq & 0x80) !== 0 || forceFirst;
  const last = (seq & 0x40) !== 0;
  if (first) {
    if (data.length < 11) return null;
    return {
      id: u16(data, 0),
      first: true,
      last,
      width: u16(data, 7),
      height: u16(data, 9),
      rle: data.slice(11),
    };
  }
  return {
    id: u16(data, 0),
    first: false,
    last,
    width: 0,
    height: 0,
    rle: data.slice(4),
  };
}

function cropIndices(
  indices: Uint8Array,
  width: number,
  height: number,
  crop: Crop,
): { indices: Uint8Array; width: number; height: number } | null {
  if (crop.width <= 0 || crop.height <= 0) return null;
  const x0 = Math.max(0, Math.min(crop.x, width));
  const y0 = Math.max(0, Math.min(crop.y, height));
  const x1 = Math.max(x0, Math.min(crop.x + crop.width, width));
  const y1 = Math.max(y0, Math.min(crop.y + crop.height, height));
  const outW = x1 - x0;
  const outH = y1 - y0;
  if (outW <= 0 || outH <= 0) return null;
  const out = new Uint8Array(outW * outH);
  for (let y = 0; y < outH; y += 1) {
    for (let x = 0; x < outW; x += 1) {
      out[y * outW + x] = indices[(y0 + y) * width + (x0 + x)] ?? 0;
    }
  }
  return { indices: out, width: outW, height: outH };
}

function clipWindow(
  bitmap: { x: number; y: number; width: number; height: number; indices: Uint8Array },
  windows: readonly WindowBox[],
  windowId: number,
): { x: number; y: number; width: number; height: number; indices: Uint8Array } | null {
  const win = windows.find((item) => item.id === windowId);
  if (!win) return bitmap;
  const left = Math.max(bitmap.x, win.x);
  const top = Math.max(bitmap.y, win.y);
  const right = Math.min(bitmap.x + bitmap.width, win.x + win.width);
  const bottom = Math.min(bitmap.y + bitmap.height, win.y + win.height);
  if (right <= left || bottom <= top) return null;
  const cropX = left - bitmap.x;
  const cropY = top - bitmap.y;
  const cropW = right - left;
  const cropH = bottom - top;
  if (cropX === 0 && cropY === 0 && cropW === bitmap.width && cropH === bitmap.height) return bitmap;
  const cropped = cropIndices(bitmap.indices, bitmap.width, bitmap.height, {
    x: cropX,
    y: cropY,
    width: cropW,
    height: cropH,
  });
  if (!cropped) return null;
  return { x: left, y: top, width: cropped.width, height: cropped.height, indices: cropped.indices };
}

function compose(
  current: Pcs,
  objects: ReadonlyMap<number, Bitmap>,
  palettes: ReadonlyMap<number, Map<number, Rgba>>,
  windows: readonly WindowBox[],
): PgsImage | null {
  const palette = palettes.get(current.paletteId);
  if (!palette || current.objects.length === 0) return null;
  const placed: { x: number; y: number; width: number; height: number; indices: Uint8Array }[] = [];
  for (const ref of current.objects) {
    const bitmap = objects.get(ref.id);
    if (!bitmap || bitmap.width <= 0 || bitmap.height <= 0) continue;
    let indices = bitmap.indices;
    let width = bitmap.width;
    let height = bitmap.height;
    if (ref.crop) {
      const cropped = cropIndices(indices, width, height, ref.crop);
      if (!cropped) continue;
      indices = cropped.indices;
      width = cropped.width;
      height = cropped.height;
    }
    const visible = clipWindow({ x: ref.x, y: ref.y, width, height, indices }, windows, ref.windowId);
    if (visible) placed.push(visible);
  }
  if (placed.length === 0) return null;
  let minX = placed[0]!.x;
  let minY = placed[0]!.y;
  let maxX = placed[0]!.x + placed[0]!.width;
  let maxY = placed[0]!.y + placed[0]!.height;
  for (const part of placed) {
    minX = Math.min(minX, part.x);
    minY = Math.min(minY, part.y);
    maxX = Math.max(maxX, part.x + part.width);
    maxY = Math.max(maxY, part.y + part.height);
  }
  const width = maxX - minX;
  const height = maxY - minY;
  if (width <= 0 || height <= 0 || width * height > MAX_PIXELS) return null;
  const rgba = new Uint8Array(width * height * 4);
  for (const part of placed) {
    for (let y = 0; y < part.height; y += 1) {
      for (let x = 0; x < part.width; x += 1) {
        const color = palette.get(part.indices[y * part.width + x] ?? 0);
        if (!color || color.a === 0) continue;
        const dx = part.x - minX + x;
        const dy = part.y - minY + y;
        const offset = (dy * width + dx) * 4;
        rgba[offset] = color.r;
        rgba[offset + 1] = color.g;
        rgba[offset + 2] = color.b;
        rgba[offset + 3] = color.a;
      }
    }
  }
  return { width, height, rgba };
}

export function parseSup(bytes: Uint8Array): PgsCue[] {
  if (bytes.length < HEADER || bytes[0] !== 0x50 || bytes[1] !== 0x47) {
    throw new PgsError('This file is not a Blu-ray SUP subtitle.');
  }

  const objects = new Map<number, Bitmap>();
  const partials = new Map<number, PartialBitmap>();
  const palettes = new Map<number, Map<number, Rgba>>();
  let windows: WindowBox[] = [];
  let pcs: Pcs | null = null;
  let forceFirst = true;
  const marks: Mark[] = [];

  const pushMark = (current: Pcs): void => {
    if (current.objects.length === 0) {
      marks.push({ kind: 'clear', pts: current.pts });
      return;
    }
    const image = compose(current, objects, palettes, windows);
    marks.push(image ? { kind: 'show', pts: current.pts, image } : { kind: 'clear', pts: current.pts });
  };

  let offset = 0;
  while (offset < bytes.length) {
    if (offset + HEADER > bytes.length || bytes[offset] !== 0x50 || bytes[offset + 1] !== 0x47) {
      throw new PgsError('This SUP file is cut off.');
    }
    const pts = u32(bytes, offset + 2);
    const type = bytes[offset + 10]!;
    const size = u16(bytes, offset + 11);
    const start = offset + HEADER;
    const end = start + size;
    if (end > bytes.length) throw new PgsError('This SUP file is cut off.');
    const data = bytes.subarray(start, end);

    if (type === PCS) {
      if (pcs) pushMark(pcs);
      pcs = parsePcs(data, pts);
      if (pcs?.state === EPOCH_START) {
        objects.clear();
        partials.clear();
        palettes.clear();
        windows = [];
      }
      forceFirst = true;
    } else if (type === WDS) {
      windows = parseWds(data);
    } else if (type === PDS) {
      const parsed = parsePds(data);
      if (parsed) {
        const map = pcs?.paletteUpdate ? new Map(palettes.get(parsed.id) ?? []) : new Map<number, Rgba>();
        for (const entry of parsed.entries) map.set(entry.index, entry.color);
        palettes.set(parsed.id, map);
      }
    } else if (type === ODS) {
      const ods = parseOds(data, forceFirst);
      forceFirst = false;
      if (ods?.first) {
        partials.set(ods.id, { width: ods.width, height: ods.height, chunks: [ods.rle] });
      } else if (ods) {
        partials.get(ods.id)?.chunks.push(ods.rle);
      }
      if (ods?.last) {
        const partial = partials.get(ods.id);
        if (partial && partial.width > 0 && partial.height > 0) {
          objects.set(ods.id, {
            width: partial.width,
            height: partial.height,
            indices: decodePgsRle(concat(partial.chunks), partial.width, partial.height),
          });
        }
        partials.delete(ods.id);
      }
    } else if (type === END) {
      if (pcs) pushMark(pcs);
      pcs = null;
      forceFirst = true;
    }

    offset = end;
  }

  if (pcs) pushMark(pcs);

  const cues: PgsCue[] = [];
  for (let index = 0; index < marks.length; index += 1) {
    const mark = marks[index];
    if (!mark || mark.kind !== 'show') continue;
    const start = ptsToMs(mark.pts);
    let end = start + PGS_MISSING_END_MS;
    for (let next = index + 1; next < marks.length; next += 1) {
      const following = marks[next];
      if (!following) continue;
      end = ptsToMs(following.pts);
      break;
    }
    if (end <= start) end = start + 1;
    cues.push({ start, end, image: mark.image });
  }
  return cues;
}

export function supFileError(name: string): string | null {
  const lower = name.trim().toLowerCase();
  if (lower.endsWith('.idx') || lower.endsWith('.sub')) {
    return 'DVD .sub/.idx image subtitles are not supported yet. This page reads Blu-ray .sup files.';
  }
  if (!lower.endsWith('.sup')) return 'Use a Blu-ray .sup file.';
  return null;
}

export function supOutputName(name: string): string {
  const trimmed = name.trim() || 'subtitles.sup';
  const dot = trimmed.lastIndexOf('.');
  const base = dot > 0 ? trimmed.slice(0, dot) : trimmed;
  return `${base}.srt`;
}
