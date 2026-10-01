import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
const header = readFileSync(join(process.cwd(), 'src/components/Header.astro'), 'utf8');
describe('header nav', () => {
  it('shows the centre nav only where all six pills fit (1120px and up)', () => {
    expect(header).toContain('overflow-x-auto min-[1120px]:flex');
    expect(header).toContain('sm:px-6 min-[1120px]:hidden');
    expect(header).toContain('ml-auto inline-flex shrink-0');
    expect(header).not.toContain('No upload · Free');
    expect(header).not.toMatch(/\bmd:(?:flex|hidden)\b/);
  });
});
