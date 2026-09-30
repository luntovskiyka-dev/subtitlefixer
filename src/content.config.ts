import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    h1: z.string(),
    answer: z.string(),
    steps: z.array(z.string()).length(3),
    exampleBefore: z.string(),
    exampleAfter: z.string(),
    does: z.array(z.string()),
    doesnt: z.array(z.string()),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .min(5)
      .max(8),
    related: z.array(z.string()),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    h1: z.string(),
  }),
});

export const collections = { tools, guides };
