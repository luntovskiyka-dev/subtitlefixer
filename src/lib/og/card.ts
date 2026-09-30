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

function attribute(tag: string, name: string, file: string): string {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
  const value = match?.[1]?.trim() ?? '';
  if (!value) throw new Error(`Missing ${name} in ${file}.`);
  return value;
}

function quotedField(block: string, name: string, file: string): string {
  const match = block.match(new RegExp(`^${name}:\\s*"([^"]*)"\\s*$`, 'm'));
  const value = match?.[1]?.trim() ?? '';
  if (!value) throw new Error(`Missing ${name} in ${file}.`);
  return value;
}

function baseCard(root: string, pagePath: string, relativeFile: string): OgCard {
  const file = join(root, relativeFile);
  const source = readFileSync(file, 'utf8');
  const tag = source.match(/<Base\b[^>]*>/);
  if (!tag) throw new Error(`Missing <Base> in ${file}.`);
  return {
    path: pagePath,
    title: attribute(tag[0], 'title', file),
    description: attribute(tag[0], 'description', file),
  };
}

function homeCard(root: string): OgCard {
  return baseCard(root, '/', 'src/pages/index.astro');
}

function toolCards(root: string): OgCard[] {
  const dir = join(root, 'src/content/tools');
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
  return files.map((name) => {
    const file = join(dir, name);
    const source = readFileSync(file, 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) throw new Error(`Missing frontmatter in ${file}.`);
    return {
      path: `/${name.replace(/\.md$/, '')}`,
      title: quotedField(frontmatter[1], 'title', file),
      description: quotedField(frontmatter[1], 'description', file),
    };
  });
}

function guideCards(root: string): OgCard[] {
  const dir = join(root, 'src/content/guides');
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
  return files.map((name) => {
    const file = join(dir, name);
    const source = readFileSync(file, 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) throw new Error(`Missing frontmatter in ${file}.`);
    return {
      path: `/guides/${name.replace(/\.md$/, '')}`,
      title: quotedField(frontmatter[1], 'title', file),
      description: quotedField(frontmatter[1], 'description', file),
    };
  });
}

/** Public pages that receive a generated image. Home, then tools, then About, Privacy, and guides. */
export function listOgCards(): OgCard[] {
  const root = projectRoot();
  return [
    homeCard(root),
    ...toolCards(root),
    baseCard(root, '/about', 'src/pages/about.astro'),
    baseCard(root, '/privacy', 'src/pages/privacy.astro'),
    ...guideCards(root),
  ];
}

/** File name under `/og/` for a page path. Home is `home.png`. */
export function ogImageFilename(path: string): string {
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  const canonical = withSlash === '/' ? '/' : withSlash.replace(/\/+$/, '');
  if (canonical === '/') return 'home.png';
  return `${canonical.slice(1)}.png`;
}
