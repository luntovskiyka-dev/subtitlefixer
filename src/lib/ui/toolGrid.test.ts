import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { homeTrust, toolGridCopy, toolMeta } from '../../data/tools';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const HEX = /#[0-9A-Fa-f]{3,8}\b/;

describe('tool card and tool grid components', () => {
  const card = read('src/components/ToolCard.astro');
  const grid = read('src/components/ToolGrid.astro');

  it('renders each card as exactly one link with the tool wash class', () => {
    expect(card.match(/<a\b/g) ?? []).toHaveLength(1);
    expect(card).toContain('sf-card sf-card-${tool.key}');
    expect(card).toContain('<ToolIcon name={tool.key} size="l" />');
  });

  it('keeps colours in tokens and adds no scoped styles or scripts', () => {
    for (const source of [card, grid]) {
      expect(source).not.toMatch(HEX);
      expect(source).not.toMatch(/<style|<script/);
    }
  });

  it('lists every tool from toolMeta under the approved heading', () => {
    expect(grid).toContain('toolMeta.map');
    expect(grid).toContain('toolGridCopy.heading');
    expect(toolGridCopy.heading).toBe('Pick a tool');
    expect(toolGridCopy.open).toBe('Open tool →');
    expect(toolMeta).toHaveLength(11);
  });

  it('shows the group caption beside the heading', () => {
    expect(toolGridCopy.groups).toBe('Timing · Text and encoding · Format conversion · Combining files');
    expect(grid).toContain('<div class="sf-tools-head">');
    expect(grid).toContain('{toolGridCopy.groups}');
  });
});

describe('home hero', () => {
  const home = read('src/pages/index.astro');

  it('keeps the H1, pills and content, and shows no lead line (home.md is the single source)', () => {
    expect(home).toContain('<Mark>{mark}</Mark>');
    expect(home).toContain('<ul class="sf-trust">');
    expect(home).toContain('<ToolGrid />');
    expect(home).toContain('<div class="sf-copy mt-16">');
    expect(home).toContain('<Content />');
    expect(home).not.toContain('answer');
    expect(home).not.toContain('subline');
    expect(home).not.toContain('sf-hero-lead');
    expect(home).not.toMatch(HEX);
    expect(home).not.toMatch(/<style|<script/);
  });

  it('shows the four approved trust pills in order', () => {
    expect([...homeTrust]).toEqual(['No upload', 'No sign-up', 'Free, 11 tools', 'Many files → one zip']);
  });
});

describe('404 page', () => {
  const page = read('src/pages/404.astro');

  it('stays noindex and shows the tool grid instead of the plain list', () => {
    expect(page).toMatch(/\bnoindex\b/);
    expect(page).toContain('<ToolGrid />');
    expect(page).not.toContain('<ul');
    expect(page).toContain('>Page not found</h1>');
    expect(page).toContain('>That page is not on SubtitleFixer.</p>');
    expect(page).not.toMatch(HEX);
  });
});

describe('styleguide', () => {
  const page = read('src/views/Styleguide.astro');

  it('imports ToolCard and renders an example', () => {
    expect(page).toContain("import ToolCard from '../components/ToolCard.astro';");
    expect(page).toContain('<ToolCard tool={tool} />');
  });
});
