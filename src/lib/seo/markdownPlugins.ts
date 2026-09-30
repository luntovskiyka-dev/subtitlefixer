import type { RootContent } from 'mdast';
import { defineHastPlugin, defineMdastPlugin } from 'satteri';
import { tools } from '../../data/tools';
import { renderFaqBlocks, type FaqItem } from './faqText';

const FAQ_SLOT = 'FAQ is rendered from the';

function frontmatter(data: Record<string, unknown>): Record<string, unknown> {
  const astro = data.astro as { frontmatter?: Record<string, unknown> } | undefined;
  return astro?.frontmatter ?? {};
}

function readString(data: Record<string, unknown>, key: string): string | undefined {
  const value = frontmatter(data)[key];
  return typeof value === 'string' ? value : undefined;
}

function readFaq(data: Record<string, unknown>): FaqItem[] | null {
  const faq = frontmatter(data).faq;
  if (!Array.isArray(faq)) return null;
  return faq.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new Error('FAQ frontmatter items must be objects with q and a.');
    }
    const record = item as { q?: unknown; a?: unknown };
    if (typeof record.q !== 'string' || typeof record.a !== 'string') {
      throw new Error('FAQ frontmatter items must be objects with q and a.');
    }
    return { q: record.q, a: record.a };
  });
}

/** Drop a leading H1 when the template already renders the same frontmatter h1. */
export const stripDuplicateH1 = defineMdastPlugin({
  name: 'strip-duplicate-h1',
  heading(node, ctx) {
    if (node.depth !== 1) return;
    const parent = ctx.parent(node);
    if (!parent || parent.type !== 'root' || ctx.indexOf(node) !== 0) return;
    const expected = readString(ctx.data, 'h1');
    if (!expected || ctx.textContent(node).trim() !== expected) return;
    ctx.removeNode(node);
  },
});

function readRelated(data: Record<string, unknown>): string[] {
  const related = frontmatter(data).related;
  if (!Array.isArray(related)) return [];
  return related.filter((href): href is string => typeof href === 'string');
}

function collectUrls(node: RootContent, urls: Set<string>): void {
  if (node.type === 'link') urls.add(node.url);
  if ('children' in node) {
    for (const child of node.children) collectUrls(child, urls);
  }
}

function relatedLabel(href: string): string {
  const slug = href.replace(/^\//, '');
  if (slug in tools) return tools[slug as keyof typeof tools];
  return href;
}

/** Add frontmatter related links that the article's Related tools list does not already contain. */
export const appendMissingRelated = defineMdastPlugin({
  name: 'append-missing-related',
  after(root, ctx) {
    const related = readRelated(ctx.data);
    if (related.length === 0) return;
    const children = root.children;
    for (let index = 0; index < children.length; index += 1) {
      const node = children[index];
      if (!node || node.type !== 'heading' || node.depth !== 2) continue;
      if (ctx.textContent(node).trim() !== 'Related tools') continue;
      const list = children[index + 1];
      if (!list || list.type !== 'list') continue;
      const urls = new Set<string>();
      collectUrls(list, urls);
      const missing = related.filter((href) => !urls.has(href));
      if (missing.length === 0) continue;
      ctx.appendChild(
        list,
        missing.map(
          (href) =>
            ({
              type: 'listItem',
              spread: false,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'link',
                      url: href,
                      children: [{ type: 'text', value: relatedLabel(href) }],
                    },
                  ],
                },
              ],
            }) satisfies RootContent,
        ),
      );
    }
  },
});

/** Replace the FAQ placeholder comment with the frontmatter questions. */
export const injectFaq = defineMdastPlugin({
  name: 'inject-faq',
  html(node, ctx) {
    if (!node.value.includes(FAQ_SLOT)) return;
    const faq = readFaq(ctx.data);
    if (!faq) {
      ctx.removeNode(node);
      return;
    }
    ctx.replaceNode(node, { raw: renderFaqBlocks(faq), mdxExpressions: false });
  },
});

export const externalLinks = defineHastPlugin({
  name: 'external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = node.properties?.href;
      const value = typeof href === 'string' ? href : '';
      if (!/^https?:\/\//i.test(value)) return;
      ctx.setProperty(node, 'target', '_blank');
      ctx.setProperty(node, 'rel', 'noopener noreferrer');
    },
  },
});

export const wrapTables = defineHastPlugin({
  name: 'wrap-tables',
  element: {
    filter: ['table'],
    visit(node, ctx) {
      ctx.wrapNode(node, {
        type: 'element',
        tagName: 'div',
        properties: { className: ['sf-table'] },
        children: [],
      });
    },
  },
});
