import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type OgCard = {
  path: string;
  title: string;
  description: string;
};

function projectRoot(): string {
  const sourceRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
  if (existsSync(join(sourceRoot, 'src/pages/index.astro'))) return sourceRoot;
  if (existsSync(join(process.cwd(), 'src/pages/index.astro'))) return process.cwd();
  throw new Error('Open Graph cards could not find src/pages/index.astro.');
}

function quotedField(block: string, name: string, file: string): string {
  const match = block.match(new RegExp(`^${name}:\\s*"([^"]*)"\\s*$`, 'm'));
  const value = match?.[1]?.trim() ?? '';
  if (!value) throw new Error(`Missing ${name} in ${file}.`);
  return value;
}

function markdownCard(root: string, pagePath: string, relativeFile: string): OgCard {
  const file = join(root, relativeFile);
  const source = readFileSync(file, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) throw new Error(`Missing frontmatter in ${file}.`);
  return {
    path: pagePath,
    title: quotedField(frontmatter[1], 'title', file),
    description: quotedField(frontmatter[1], 'description', file),
  };
}

function cardsIn(root: string, dirName: string, pathFor: (slug: string) => string): OgCard[] {
  const dir = join(root, dirName);
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
  return files.map((name) => markdownCard(root, pathFor(name.replace(/\.md$/, '')), join(dirName, name)));
}

/** Public pages that receive a generated image. Home, then tools, then About, Privacy, and guides. */
export function listOgCards(): OgCard[] {
  const root = projectRoot();
  return [
    markdownCard(root, '/', 'src/content/pages/home.md'),
    ...cardsIn(root, 'src/content/tools', (slug) => `/${slug}`).filter((card) => card.path !== '/sup-to-srt'),
    markdownCard(root, '/about', 'src/content/pages/about.md'),
    markdownCard(root, '/privacy', 'src/content/pages/privacy.md'),
    ...cardsIn(root, 'src/content/guides', (slug) => `/guides/${slug}`),
  ];
}

/** File name under `/og/` for a page path. Home is `home.png`. */
export function ogImageFilename(path: string): string {
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  const canonical = withSlash === '/' ? '/' : withSlash.replace(/\/+$/, '');
  if (canonical === '/') return 'home.png';
  return `${canonical.slice(1)}.png`;
}
