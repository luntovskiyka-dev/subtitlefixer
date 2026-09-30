// @ts-check
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// A `_` segment under src/pages is not a public route. Inject the guide so /_styleguide still prerenders.
/** @type {import('astro').AstroIntegration} */
const styleguideRoute = {
  name: 'styleguide-route',
  hooks: {
    'astro:config:setup'({ injectRoute }) {
      injectRoute({
        pattern: '/_styleguide',
        entrypoint: './src/views/Styleguide.astro',
        prerender: true,
      });
    },
  },
};

/** @type {import('astro').AstroIntegration} */
const ogImages = {
  name: 'og-images',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const { listOgCards, ogImageFilename } = await import('./src/lib/og/card.ts');
      const { renderOgCard } = await import('./src/lib/og/render.ts');
      const folder = join(fileURLToPath(dir), 'og');
      await mkdir(folder, { recursive: true });
      const cards = listOgCards();
      for (const card of cards) {
        const png = await renderOgCard(card);
        const file = join(folder, ogImageFilename(card.path));
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, png);
      }
      logger.info(`Wrote ${cards.length} Open Graph images.`);
    },
  },
};

export default defineConfig({
  site: 'https://subtitlefixer.com',
  output: 'static',
  integrations: [
    styleguideRoute,
    ogImages,
    sitemap({
      filter(page) {
        const { pathname } = new URL(page);
        return pathname !== '/_styleguide' && !pathname.startsWith('/_styleguide/');
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
