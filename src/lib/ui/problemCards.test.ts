import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { homeProblems, toolMeta } from '../../data/tools';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const HEX = /#[0-9A-Fa-f]{3,8}\b/;

describe('home problem cards', () => {
  it('lists six problems whose keys match the tools, in order', () => {
    expect(homeProblems).toHaveLength(6);
    const keys = homeProblems.map((problem) => problem.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(toolMeta.map((tool) => tool.key));
    for (const problem of homeProblems) {
      expect(problem.label.length).toBeLessThanOrEqual(28);
    }
  });

  it('keeps one link, a hidden illustration, and no hex, style, or script', () => {
    const cards = read('src/components/ProblemCards.astro');
    const illustration = read('src/components/ProblemIllustration.astro');
    expect(cards.match(/<a/g) ?? []).toHaveLength(1);
    expect(cards).toContain('ProblemIllustration');
    expect(illustration).toContain('aria-hidden="true"');
    for (const source of [cards, illustration]) {
      expect(source).not.toMatch(HEX);
      expect(source).not.toMatch(/<style|<script|client:/);
    }
  });

  it('places the problem cards before the tool grid on the home page', () => {
    const home = read('src/pages/index.astro');
    const problems = home.indexOf('<ProblemCards />');
    const grid = home.indexOf('<ToolGrid />');
    expect(problems).toBeGreaterThan(-1);
    expect(problems).toBeLessThan(grid);
    expect(home).toContain('<div class="sf-copy mt-16">');
  });
});
