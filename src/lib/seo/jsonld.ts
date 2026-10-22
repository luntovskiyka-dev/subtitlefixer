import { GITHUB_URL } from '../../config/site';
import { BRAND } from './urls';

const PRODUCT_HUNT_URL = 'https://www.producthunt.com/products/subtitlefixer';

const FOUNDER = 'Kirill Luntovskii';

/** Other names for the site, so it is not confused with other tools called SubtitleFixer. */
export const ALTERNATE_NAMES = ['subtitlefixer.com', 'Subtitle Fixer'];

export type JsonLdInput =
  | { kind: 'none' }
  | { kind: 'home'; origin: string; logo: string }
  | { kind: 'article'; headline: string; description: string; url: string }
  | { kind: 'webapp'; name: string; description: string; url: string };

export type BreadcrumbItem = {
  name: string;
  url: string;
};

/** BreadcrumbList for a page: Home first, the page itself last. */
export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }).replace(/</g, '\\u003c');
}

export function buildJsonLd(input: JsonLdInput): unknown {
  switch (input.kind) {
    case 'none':
      return null;
    case 'home':
      return [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: BRAND,
          alternateName: ALTERNATE_NAMES,
          url: `${input.origin}/`,
          logo: input.logo,
          founder: {
            '@type': 'Person',
            name: FOUNDER,
          },
          sameAs: [GITHUB_URL, PRODUCT_HUNT_URL],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: BRAND,
          alternateName: ALTERNATE_NAMES,
          url: `${input.origin}/`,
        },
      ];
    case 'article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: input.headline,
        description: input.description,
        url: input.url,
        publisher: {
          '@type': 'Organization',
          name: BRAND,
        },
      };
    case 'webapp':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: input.name,
        description: input.description,
        url: input.url,
        applicationCategory: 'UtilitiesApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      };
  }
}
