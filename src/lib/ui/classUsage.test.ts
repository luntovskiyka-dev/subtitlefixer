import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Brand indigo is a fill. These utilities use it as text, an outline, or a border. */
const FORBIDDEN = [/\b(?:text|outline|border)-brand\b(?!-)/, /\btext-bg\b/];

function astroFiles(dir: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...astroFiles(path));
    else if (name.endsWith('.astro')) found.push(path);
  }
  return found;
}

describe('brand colour is only a fill', () => {
  const files = astroFiles(join(process.cwd(), 'src/components'));

  it('reads the component sources', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const label = file.slice(process.cwd().length + 1);
    it(`${label} does not use brand as text, outline, or border`, () => {
      const source = readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN) {
        expect(source).not.toMatch(pattern);
      }
    });
  }
});
