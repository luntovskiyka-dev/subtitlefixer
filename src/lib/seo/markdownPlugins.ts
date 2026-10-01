import type { Element, ElementContent, Text } from 'hast';
import GithubSlugger from 'github-slugger';
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

const HIGHLIGHT_LANGUAGES = new Set(['srt', 'vtt', 'ass']);

function isBlank(node: ElementContent): boolean {
  return node.type === 'text' && !(node as Text).value.trim();
}

function classNames(properties: Element['properties']): string[] {
  const value = properties?.className;
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function withClass(node: Element, className: string): Element {
  const classes = classNames(node.properties);
  if (!classes.includes(className)) classes.push(className);
  return { ...node, properties: { ...(node.properties ?? {}), className: classes } };
}

function isToolPage(fileURL: URL | undefined): boolean {
  if (!fileURL) return false;
  return /\/content\/tools\/[^/]+\.md$/i.test(fileURL.pathname);
}

function blockAt(
  children: readonly ElementContent[],
  start: number,
): { node: Element; index: number } | null {
  for (let index = start; index < children.length; index += 1) {
    const node = children[index];
    if (!node || isBlank(node)) continue;
    if (node.type === 'element') return { node, index };
    return null;
  }
  return null;
}

function toolSlugFrom(node: Element): string | undefined {
  if (node.tagName === 'a') {
    const href = node.properties?.href;
    if (typeof href === 'string') {
      const slug = href.replace(/^\/+|\/+$/g, '');
      if (Object.prototype.hasOwnProperty.call(tools, slug)) return slug;
    }
  }
  for (const child of node.children) {
    if (child.type === 'element') {
      const found = toolSlugFrom(child);
      if (found) return found;
    }
  }
  return undefined;
}

function markRelated(list: Element): Element {
  return {
    ...withClass(list, 'sf-related'),
    children: list.children.map((child) => {
      if (child.type !== 'element' || child.tagName !== 'li') return child;
      const slug = toolSlugFrom(child);
      if (!slug) return child;
      const properties = { ...(child.properties ?? {}) } as Element['properties'] & Record<string, string>;
      properties['data-tool'] = slug;
      return { ...child, properties };
    }),
  };
}

function decorateFlow(
  children: readonly ElementContent[],
  textOf: (node: Element) => string,
): ElementContent[] {
  const next: ElementContent[] = [];
  let index = 0;
  while (index < children.length) {
    const current = children[index];
    if (!current) break;
    const before = blockAt(children, index);
    if (before?.node.tagName === 'p' && /^Before\b/.test(textOf(before.node).trim())) {
      const pre = blockAt(children, before.index + 1);
      const after = pre ? blockAt(children, pre.index + 1) : null;
      const afterPre = after ? blockAt(children, after.index + 1) : null;
      if (
        pre?.node.tagName === 'pre' &&
        after?.node.tagName === 'p' &&
        /^After\b/.test(textOf(after.node).trim()) &&
        afterPre?.node.tagName === 'pre'
      ) {
        next.push({
          type: 'element',
          tagName: 'div',
          properties: { className: ['sf-ba'] },
          children: [
            {
              type: 'element',
              tagName: 'div',
              properties: { className: ['sf-ba-before'] },
              children: [before.node, pre.node],
            },
            {
              type: 'element',
              tagName: 'div',
              properties: { className: ['sf-ba-after'] },
              children: [after.node, afterPre.node],
            },
          ],
        });
        index = afterPre.index + 1;
        continue;
      }
    }
    if (current.type === 'element' && current.tagName === 'p') {
      const label = textOf(current).trim();
      const list = blockAt(children, index + 1);
      if (
        list?.node.tagName === 'ul' &&
        (label === 'What it does:' || label === "What it doesn't do:")
      ) {
        next.push({
          type: 'element',
          tagName: 'div',
          properties: { className: [label === 'What it does:' ? 'sf-does' : 'sf-doesnt'] },
          children: [current, list.node],
        });
        index = list.index + 1;
        continue;
      }
    }
    next.push(current);
    index += 1;
  }
  return next;
}

function hasClass(node: ElementContent | undefined, name: string): node is Element {
  return node?.type === 'element' && classNames(node.properties).includes(name);
}

/** Put "What it does" and "What it doesn't do" side by side in one wrapper. Text is untouched. */
function pairDoesDoesnt(children: readonly ElementContent[]): ElementContent[] {
  const next: ElementContent[] = [];
  for (let index = 0; index < children.length; index += 1) {
    const current = children[index];
    if (!current) continue;
    if (hasClass(current, 'sf-does')) {
      const partner = blockAt(children, index + 1);
      if (partner && hasClass(partner.node, 'sf-doesnt')) {
        next.push({
          type: 'element',
          tagName: 'div',
          properties: { className: ['sf-dd'] },
          children: children.slice(index, partner.index + 1),
        });
        index = partner.index;
        continue;
      }
    }
    next.push(current);
  }
  return next;
}

/** Wrap each h2 and the nodes that follow it, up to the next h2, in a section. */
export const sectionize = defineHastPlugin({
  name: 'sectionize',
  after(root, ctx) {
    const slugger = new GithubSlugger();
    const next: typeof root.children = [];
    let index = 0;
    while (index < root.children.length) {
      const node = root.children[index];
      if (!node || node.type !== 'element' || node.tagName !== 'h2') {
        if (node) next.push(node);
        index += 1;
        continue;
      }
      const id = slugger.slug(ctx.textContent(node).trim());
      const group: typeof root.children = [
        {
          type: 'element',
          tagName: 'h2',
          properties: { ...(node.properties ?? {}), id },
          children: node.children,
        },
      ];
      index += 1;
      while (index < root.children.length) {
        const sibling = root.children[index];
        if (sibling?.type === 'element' && sibling.tagName === 'h2') break;
        if (sibling) group.push(sibling);
        index += 1;
      }
      next.push({
        type: 'element',
        tagName: 'section',
        properties: { className: ['sf-section'] },
        children: group as ElementContent[],
      });
    }
    ctx.replaceNode(root, { type: 'root', children: next });
  },
});

/** Add classes and wrappers. The text nodes stay as they are. */
export const decorateSections = defineHastPlugin({
  name: 'decorate-sections',
  after(root, ctx) {
    const callout = { used: false };
    const tool = isToolPage(ctx.fileURL);
    const textOf = (node: Element) => ctx.textContent(node);
    const next = root.children.map((node) => {
      if (node.type !== 'element' || node.tagName !== 'section') return node;
      const heading = node.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'h2',
      );
      const title = heading ? textOf(heading).trim() : '';
      let children = node.children.map((child) =>
        child.type === 'element' && child.tagName === 'ol' && /in 3 steps$/i.test(title)
          ? withClass(child, 'sf-steps')
          : child,
      );
      children = decorateFlow(children, textOf);
      children = pairDoesDoesnt(children);
      if (title === 'Related tools') {
        children = children.map((child) =>
          child.type === 'element' && child.tagName === 'ul' ? markRelated(child) : child,
        );
      }
      const classes = classNames(node.properties);
      if (!classes.includes('sf-section')) classes.unshift('sf-section');
      if (tool && !callout.used && /\svs\s/i.test(title)) {
        classes.push('sf-callout');
        callout.used = true;
      }
      return {
        ...node,
        properties: { ...(node.properties ?? {}), className: classes },
        children,
      };
    });
    ctx.replaceNode(root, { type: 'root', children: next });
  },
});

function codeLanguage(node: Element): string | undefined {
  for (const item of classNames(node.properties)) {
    if (item.startsWith('language-')) return item.slice('language-'.length);
  }
  return undefined;
}

function lineKind(line: string, language: string): 'sf-cn' | 'sf-tc' | null {
  if (/^\d+$/.test(line)) return 'sf-cn';
  if (line.includes('-->')) return 'sf-tc';
  if (language === 'ass' && /\d:\d{2}:\d{2}/.test(line)) return 'sf-tc';
  return null;
}

/** Colour cue numbers and timestamp lines without changing the code text. */
export const highlightSubtitleCode = defineHastPlugin({
  name: 'highlight-subtitle-code',
  element: {
    filter: ['code'],
    visit(node, ctx) {
      const language = codeLanguage(node);
      if (!language || !HIGHLIGHT_LANGUAGES.has(language)) return;
      const lines = ctx.textContent(node).split('\n');
      const children: ElementContent[] = [];
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index] ?? '';
        const value = index === lines.length - 1 ? line : `${line}\n`;
        if (value === '') continue;
        const kind = lineKind(line, language);
        if (!kind) {
          children.push({ type: 'text', value });
          continue;
        }
        children.push({
          type: 'element',
          tagName: 'span',
          properties: { className: [kind] },
          children: [{ type: 'text', value }],
        });
      }
      return { type: 'element', tagName: 'code', properties: node.properties, children };
    },
  },
});
