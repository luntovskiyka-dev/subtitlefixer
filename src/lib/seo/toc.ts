import GithubSlugger from 'github-slugger';

export type TocItem = {
  id: string;
  text: string;
};

/** Build-time "On this page" links. Ids match the h2 slugs from `sectionize`. */
export function toolPageToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  for (const line of markdown.split('\n')) {
    const match = /^##[ \t]+(.+?)[ \t]*$/.exec(line);
    const text = match?.[1]?.trim();
    if (!text) continue;
    items.push({ id: slugger.slug(text), text });
  }
  items.push({ id: 'faq-heading', text: 'FAQ' });
  return items;
}
