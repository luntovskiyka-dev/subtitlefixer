// @ts-check
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import {
  appendMissingRelated,
  decorateSections,
  externalLinks,
  highlightSubtitleCode,
  injectFaq,
  sectionize,
  stripDuplicateH1,
  wrapTables,
} from './src/lib/seo/markdownPlugins.ts';
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
    // Spawn Node directly. Importing these modules through Vite's runner fails
    // once the Markdown processor has loaded the native Sätteri addon.
    'astro:build:done': ({ dir }) =>
      new Promise((resolve, reject) => {
        const child = spawn(
          process.execPath,
          [
            '--experimental-strip-types',
            fileURLToPath(new URL('./scripts/write-og-images.mjs', import.meta.url)),
            fileURLToPath(dir),
          ],
          { stdio: 'inherit' },
        );
        child.on('error', reject);
        child.on('exit', (code) => {
          if (code === 0) resolve(undefined);
          else reject(new Error(`Open Graph image build exited with code ${code ?? 'none'}.`));
        });
      }),
  },
};

export default defineConfig({
  site: 'https://subtitlefixer.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  markdown: {
    syntaxHighlight: false,
    processor: satteri({
      features: { smartPunctuation: false },
      mdastPlugins: [stripDuplicateH1, injectFaq, appendMissingRelated],
      hastPlugins: [externalLinks, wrapTables, sectionize, decorateSections, highlightSubtitleCode],
    }),
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
