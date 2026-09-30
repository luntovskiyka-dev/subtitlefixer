// @ts-check
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { canonicalSitemapLoc } from './src/lib/seo/urls.ts';

const seenSitemapLocs = new Set();

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
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [
    styleguideRoute,
    ogImages,
    sitemap({
      filter(page) {
        const loc = canonicalSitemapLoc(page);
        if (!loc || seenSitemapLocs.has(loc)) return false;
        seenSitemapLocs.add(loc);
        return true;
      },
      serialize(item) {
        const loc = canonicalSitemapLoc(item.url);
        if (!loc) return undefined;
        return { ...item, url: loc };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
