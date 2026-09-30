import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { listOgCards, ogImageFilename } from '../src/lib/og/card.ts';
import { renderOgCard } from '../src/lib/og/render.ts';

const dir = process.argv[2];
if (!dir) throw new Error('Missing output directory.');

const folder = join(dir, 'og');
await mkdir(folder, { recursive: true });
const cards = listOgCards();
for (const card of cards) {
  const png = await renderOgCard(card);
  const file = join(folder, ogImageFilename(card.path));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, png);
}
console.log(`Wrote ${cards.length} Open Graph images.`);
