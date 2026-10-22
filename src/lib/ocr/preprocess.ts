import type { PgsImage } from '../subs/pgs';

const SCALE = 2;
const PAD = 10;
/** Pixels fainter than this are the video background, not the letters. */
const INK_ALPHA = 16;

/**
 * Dark text on white, doubled, with a white margin.
 * PGS letters are usually light on a clear background, which OCR reads poorly.
 */
export function preprocessForOcr(image: PgsImage): PgsImage {
  const scaledW = image.width * SCALE;
  const scaledH = image.height * SCALE;
  const width = scaledW + PAD * 2;
  const height = scaledH + PAD * 2;
  const rgba = new Uint8Array(width * height * 4);
  rgba.fill(255);
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const source = (y * image.width + x) * 4;
      const alpha = image.rgba[source + 3] ?? 0;
      let gray = 255;
      if (alpha >= INK_ALPHA) {
        const red = image.rgba[source] ?? 0;
        const green = image.rgba[source + 1] ?? 0;
        const blue = image.rgba[source + 2] ?? 0;
        const luma = Math.round(0.299 * red + 0.587 * green + 0.114 * blue);
        gray = 255 - luma;
      }
      for (let dy = 0; dy < SCALE; dy += 1) {
        for (let dx = 0; dx < SCALE; dx += 1) {
          const ox = PAD + x * SCALE + dx;
          const oy = PAD + y * SCALE + dy;
          const dest = (oy * width + ox) * 4;
          rgba[dest] = gray;
          rgba[dest + 1] = gray;
          rgba[dest + 2] = gray;
          rgba[dest + 3] = 255;
        }
      }
    }
  }
  return { width, height, rgba };
}
