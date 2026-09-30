import { describe, expect, it } from 'vitest';
import { faqPageJsonLd, renderInlineMarkdown, stripMarkdown } from './faqText';

describe('stripMarkdown', () => {
  it('keeps link labels and code text, and drops markers', () => {
    expect(
      stripMarkdown(
        'Use [fix subtitle drift](/fix-subtitle-drift) when you see `Ã©` or **mojibake**.',
      ),
    ).toBe('Use fix subtitle drift when you see Ã© or mojibake.');
  });

  it('drops heading marks', () => {
    expect(stripMarkdown('## Why\n\nBecause.')).toBe('Why\n\nBecause.');
  });
});

describe('renderInlineMarkdown', () => {
  it('renders links, code, and bold, and escapes raw html', () => {
    expect(renderInlineMarkdown('See [ASS to SRT](/ass-to-srt) and `<i>` plus **bold**.')).toBe(
      'See <a href="/ass-to-srt">ASS to SRT</a> and <code>&lt;i&gt;</code> plus <strong>bold</strong>.',
    );
  });

  it('opens external links in a new tab', () => {
    expect(renderInlineMarkdown('[Ko-fi](https://ko-fi.com/gngpromo)')).toBe(
      '<a href="https://ko-fi.com/gngpromo" rel="noopener noreferrer" target="_blank">Ko-fi</a>',
    );
  });
});

describe('faqPageJsonLd', () => {
  it('strips markdown inside the answer text', () => {
    const json = faqPageJsonLd([
      { q: 'Uploaded?', a: 'No. See [privacy](/privacy) and `<i>`.' },
    ]);
    expect(json).toContain('See privacy and \\u003ci>.');
    expect(json).not.toContain('](');
    expect(json).not.toContain('`');
    expect(json).not.toContain('<');
  });
});
