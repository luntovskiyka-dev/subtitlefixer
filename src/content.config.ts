import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faqItem = z.object({
  q: z.string(),
  a: z.string(),
});

/** Filename ids. Frontmatter `slug` is page data and must not replace the route id. */
const idFromFilename = ({ entry }: { entry: string }) => entry.replace(/\\/g, '/').replace(/\.md$/, '');

const tools = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/tools',
    generateId: idFromFilename,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    h1: z.string(),
    slug: z.string(),
    answer: z.string(),
    faq: z.array(faqItem).min(1),
    related: z.array(z.string()).min(1),
  }),
});

const guides = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/guides',
    generateId: idFromFilename,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    h1: z.string(),
    slug: z.string(),
    answer: z.string(),
    faq: z.array(faqItem).min(1),
  }),
});

const pages = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/pages',
    generateId: idFromFilename,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    h1: z.string().optional(),
    subline: z.string().optional(),
    slug: z.string().optional(),
    answer: z.string().optional(),
    faq: z.array(faqItem).min(1).optional(),
  }),
});

export const collections = { tools, guides, pages };
