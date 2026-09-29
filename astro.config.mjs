// @ts-check
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

export default defineConfig({
  site: 'https://subtitlefixer.com',
  output: 'static',
  integrations: [styleguideRoute],
  vite: {
    plugins: [tailwindcss()],
  },
});
