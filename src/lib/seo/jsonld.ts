import { BRAND } from './urls';

const FOUNDER = 'Kirill Luntovskii';

export type JsonLdInput =
  | { kind: 'none' }
  | { kind: 'home'; origin: string; logo: string }
  | { kind: 'article'; headline: string; description: string; url: string }
  | { kind: 'webapp'; name: string; description: string; url: string };

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
          url: input.origin,
          logo: input.logo,
          founder: {
            '@type': 'Person',
            name: FOUNDER,
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: BRAND,
          url: input.origin,
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
