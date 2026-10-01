import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { markdownToHtml, type HastPluginList } from 'satteri';
import { describe, expect, it } from 'vitest';
import {
  decorateSections,
  highlightSubtitleCode,
  sectionize,
} from './markdownPlugins';
import { toolPageToc } from './toc';

function walkMarkdown(dir: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walkMarkdown(path));
    else if (name.endsWith('.md')) files.push(path);
  }
  return files;
}

function bodyOf(file: string): string {
  return readFileSync(file, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function plainText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

async function render(source: string, plugins: HastPluginList, fileURL?: URL): Promise<string> {
  const result = await markdownToHtml(source, {
    features: { gfm: true, smartPunctuation: false },
    hastPlugins: plugins,
    fileURL,
  });
  return result.html;
}

const contentFiles = walkMarkdown(join(process.cwd(), 'src/content'));
const shiftFile = contentFiles.find((file) => file.endsWith('/tools/shift-subtitles.md'));
const driftFile = contentFiles.find((file) => file.endsWith('/tools/fix-subtitle-drift.md'));
const guideFile = contentFiles.find((file) => file.endsWith('/guides/srt-vs-vtt-vs-ass.md'));
const syncGuide = contentFiles.find((file) => file.endsWith('/guides/subtitles-out-of-sync.md'));

if (!shiftFile || !driftFile || !guideFile || !syncGuide) {
  throw new Error('Expected tool and guide fixtures in src/content.');
}

const plugins = [
  ['sectionize', [sectionize]],
  ['decorateSections', [decorateSections]],
  ['highlightSubtitleCode', [highlightSubtitleCode]],
] as const;

describe('hast plugins keep the text', () => {
  for (const [name, list] of plugins) {
    it(`${name} does not change text content`, async () => {
      for (const file of contentFiles) {
        const source = bodyOf(file);
        const plain = plainText(await render(source, []));
        const decorated = plainText(await render(source, list, pathToFileURL(file)));
        expect(decorated, file).toBe(plain);
      }
    });
  }

  it('all three plugins together do not change text content', async () => {
    for (const file of contentFiles) {
      const source = bodyOf(file);
      const plain = plainText(await render(source, []));
      const decorated = plainText(
        await render(source, [sectionize, decorateSections, highlightSubtitleCode], pathToFileURL(file)),
      );
      expect(decorated, file).toBe(plain);
    }
  });
});

describe('sectionize', () => {
  it('wraps each h2 in a section and gives the heading the same id', async () => {
    const html = await render(bodyOf(shiftFile), [sectionize]);
    const toc = toolPageToc(bodyOf(shiftFile)).filter((item) => item.id !== 'faq-heading');
    expect(toc.length).toBeGreaterThan(3);
    for (const item of toc) {
      expect(html).toContain(`<section class="sf-section" id="${item.id}"><h2 id="${item.id}">`);
    }
    expect(html).not.toContain('<h2>');
  });
});

describe('decorateSections', () => {
  it('marks steps, before/after, does and does not, one callout, and related tools', async () => {
    const html = await render(
      bodyOf(shiftFile),
      [sectionize, decorateSections],
      pathToFileURL(shiftFile),
    );
    expect(html).toContain('<ol class="sf-steps">');
    expect(html.match(/class="sf-ba"/g)?.length).toBe(3);
    expect(html.match(/class="sf-ba-after"/g)?.length).toBe(3);
    expect(html).toContain('class="sf-does"');
    expect(html).toContain('class="sf-doesnt"');
    expect(html.match(/class="sf-dd"/g)?.length).toBe(1);
    expect(html).toContain('<div class="sf-dd"><div class="sf-does">');
    expect(html.match(/sf-callout/g)?.length).toBe(1);
    expect(html).toContain('<section class="sf-section sf-callout" id="constant-shift-vs-drift">');
    expect(html).toContain('<section class="sf-section" id="player-delay-vs-fixing-the-file">');
    expect(html).toContain('data-tool="fix-subtitle-drift"');
    expect(html).toContain('data-tool="ass-to-srt"');
    expect(html).not.toContain('data-tool="guides/');
    expect(html).toContain('href="/guides/subtitles-out-of-sync"');
  });

  it('wraps parenthetical before and after labels', async () => {
    const html = await render(
      bodyOf(driftFile),
      [sectionize, decorateSections],
      pathToFileURL(driftFile),
    );
    expect(html).toContain('class="sf-ba"');
    expect(html).toContain('Before (subtitles made for 25 fps):');
    expect(html).toContain('After (matching a 24 fps video):');
  });

  it('does not add a callout on guides', async () => {
    for (const file of [guideFile, syncGuide]) {
      const html = await render(
        bodyOf(file),
        [sectionize, decorateSections],
        pathToFileURL(file),
      );
      expect(html, file).not.toContain('sf-callout');
    }
  });

  it('adds no callout when the file is not a tool page', async () => {
    const html = await render('## Constant shift vs drift\n\nPlain.\n', [sectionize, decorateSections]);
    expect(html).not.toContain('sf-callout');
  });
});

describe('highlightSubtitleCode', () => {
  it('wraps cue numbers and timestamps and keeps the code text', async () => {
    const source = ['```srt', '1', '00:00:01,000 --> 00:00:02,000', 'Hi', '', '2', '00:00:03,000 --> 00:00:04,000', 'There', '```'].join(
      '\n',
    );
    const plain = await render(source, []);
    const html = await render(source, [highlightSubtitleCode]);
    expect(plainText(html)).toBe(plainText(plain));
    expect(html).toContain('class="sf-cn"');
    expect(html).toContain('class="sf-tc"');
    expect(html).toContain('Hi');
    expect(html.match(/sf-cn/g)?.length).toBe(2);
    expect(html.match(/sf-tc/g)?.length).toBe(2);
  });

  it('marks ASS dialogue lines that contain a timestamp', async () => {
    const source = ['```ass', 'Dialogue: 0,0:00:05.37,0:00:08.12,Default,,0,0,0,,Hello', '```'].join('\n');
    const html = await render(source, [highlightSubtitleCode]);
    expect(html).toContain('class="sf-tc"');
    expect(plainText(html)).toContain('Dialogue: 0,0:00:05.37,0:00:08.12,Default,,0,0,0,,Hello');
  });
});
