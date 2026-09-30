import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const roots = ['src/pages', 'src/content', 'src/components', 'src/layouts', 'src/views'];

function filesIn(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesIn(path);
    return path.endsWith('.astro') || path.endsWith('.md') ? [path] : [];
  });
}

describe('brand spelling', () => {
  it('does not use lowercase subtitlefixer in pages, content, or visible components', () => {
    const hits: string[] = [];
    for (const path of roots.flatMap((root) => filesIn(root))) {
      const source = readFileSync(path, 'utf8')
        .replaceAll('subtitlefixer.com', '')
        .replaceAll('subtitlefixer\\.com', '');
      if (source.includes('subtitlefixer')) hits.push(path);
    }
    expect(hits).toEqual([]);
  });

  it('does not suffix a title with an em dash and subtitlefixer', () => {
    const hits: string[] = [];
    for (const path of roots.flatMap((root) => filesIn(root))) {
      const source = readFileSync(path, 'utf8');
      if (/—\s*subtitlefixer/i.test(source)) hits.push(path);
    }
    expect(hits).toEqual([]);
  });
});
