import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
const header = readFileSync(join(process.cwd(), 'src/components/Header.astro'), 'utf8');
describe('header nav', () => {
  it('shows all tool pills in one centred row under the logo, scrolling only when narrow', () => {
    expect(header.match(/aria-label="Tools"/g) ?? []).toHaveLength(1);
    expect(header).toContain('sf-nav-scroll sf-nav-center mx-auto flex w-full min-w-0 max-w-[1180px] gap-1.5 overflow-x-auto');
    expect(header).not.toContain('min-[1120px]');
    expect(header).toContain('ml-auto inline-flex shrink-0');
    expect(header).not.toContain('No upload · Free');
    expect(header).not.toMatch(/\bmd:(?:flex|hidden)\b/);
  });
});
