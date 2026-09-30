import { expect, it } from 'vitest';
import { listOgCards } from './card';
import { renderOgCard } from './render';

it(
  'renders one card as a 1200 by 630 PNG',
  async () => {
    const card = listOgCards().find((item) => item.path === '/');
    expect(card).toBeDefined();
    const png = await renderOgCard(card!);
    expect([...png.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    expect(view.getUint32(16)).toBe(1200);
    expect(view.getUint32(20)).toBe(630);
  },
  30_000,
);
