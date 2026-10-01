export type FaqItem = {
  q: string;
  a: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Plain text for FAQPage JSON-LD: the inline syntax renderInlineMarkdown renders (code, links, bold) without its markers. Other characters, like the * in "*.srt", stay. */
export function stripMarkdown(source: string): string {
  return source
    .replace(
      /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g,
      (_match: string, code?: string, label?: string, _href?: string, bold?: string) => code ?? label ?? bold ?? '',
    )
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

/** Inline Markdown used in FAQ answers: links, code, and bold. */
export function renderInlineMarkdown(source: string): string {
  const pattern = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  const parts: string[] = [];
  let last = 0;
  for (const match of source.matchAll(pattern)) {
    const index = match.index ?? 0;
    parts.push(escapeHtml(source.slice(last, index)));
    if (match[1] !== undefined) {
      parts.push(`<code>${escapeHtml(match[1])}</code>`);
    } else if (match[2] !== undefined && match[3] !== undefined) {
      const href = escapeHtml(match[3]);
      const external = /^https?:\/\//i.test(match[3]);
      const attrs = external ? ' rel="noopener noreferrer" target="_blank"' : '';
      parts.push(`<a href="${href}"${attrs}>${escapeHtml(match[2])}</a>`);
    } else if (match[4] !== undefined) {
      parts.push(`<strong>${escapeHtml(match[4])}</strong>`);
    }
    last = index + match[0].length;
  }
  parts.push(escapeHtml(source.slice(last)));
  return parts.join('');
}

export function renderFaqBlocks(items: readonly FaqItem[]): string {
  return items
    .map((item, index) => {
      const open = index === 0 ? ' open' : '';
      return `<details class="sf-faq-item"${open}><summary><h3>${escapeHtml(item.q)}</h3></summary><div>${renderInlineMarkdown(item.a)}</div></details>`;
    })
    .join('');
}

export function faqPageJsonLd(items: readonly FaqItem[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: stripMarkdown(item.q),
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripMarkdown(item.a),
      },
    })),
  }).replace(/</g, '\\u003c');
}
