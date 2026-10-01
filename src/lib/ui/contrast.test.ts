import { describe, expect, it } from 'vitest';
import { DARK, LIGHT, contrastRatio, type Palette } from './contrast';

const TEXT = 4.5;
const NON_TEXT = 3;
const WHITE = '#FFFFFF';

type Pair = {
  label: string;
  foreground: keyof Palette;
  background: keyof Palette;
  minimum: number;
};

const LIGHT_PAIRS: readonly Pair[] = [
  { label: 'ink on bg', foreground: 'text', background: 'bg', minimum: TEXT },
  { label: 'ink on surface', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'muted on bg', foreground: 'muted', background: 'bg', minimum: TEXT },
  { label: 'muted on surface', foreground: 'muted', background: 'surface', minimum: TEXT },
  { label: 'muted on subtle', foreground: 'muted', background: 'subtle', minimum: TEXT },
  { label: 'muted on lilac', foreground: 'muted', background: 'lilac', minimum: TEXT },
  { label: 'brand on bg', foreground: 'brand', background: 'bg', minimum: TEXT },
  { label: 'brand-hover on bg', foreground: 'brandHover', background: 'bg', minimum: TEXT },
  { label: 'brand-hover on surface', foreground: 'brandHover', background: 'surface', minimum: TEXT },
  { label: 'brand-hover on lilac', foreground: 'brandHover', background: 'lilac', minimum: TEXT },
  { label: 'on-brand on brand', foreground: 'onBrand', background: 'brand', minimum: TEXT },
  { label: 'on-brand on dropzone', foreground: 'onBrand', background: 'dropzone', minimum: TEXT },
  { label: 'on-brand on brand-hover', foreground: 'onBrand', background: 'brandHover', minimum: TEXT },
  { label: 'on-brand-muted on brand', foreground: 'onBrandMuted', background: 'brand', minimum: TEXT },
  { label: 'on-brand-muted on brand-hover', foreground: 'onBrandMuted', background: 'brandHover', minimum: TEXT },
  { label: 'ink on coral', foreground: 'onAccent', background: 'accent', minimum: TEXT },
  { label: 'ink on accent-soft', foreground: 'text', background: 'accentSoft', minimum: TEXT },
  { label: 'ink on accent-wash', foreground: 'text', background: 'accentWash', minimum: TEXT },
  { label: 'accent-ink on bg', foreground: 'accentInk', background: 'bg', minimum: TEXT },
  { label: 'accent-ink on surface', foreground: 'accentInk', background: 'surface', minimum: TEXT },
  { label: 'ink on teal', foreground: 'text', background: 'teal', minimum: TEXT },
  { label: 'ink on teal-soft', foreground: 'text', background: 'tealSoft', minimum: TEXT },
  { label: 'teal-ink on bg', foreground: 'tealInk', background: 'bg', minimum: TEXT },
  { label: 'ink on mint', foreground: 'text', background: 'mint', minimum: TEXT },
  { label: 'ink on mint chip', foreground: 'onAccent', background: 'footerMint', minimum: TEXT },
  { label: 'success on mint', foreground: 'success', background: 'mint', minimum: TEXT },
  { label: 'success on bg', foreground: 'success', background: 'bg', minimum: TEXT },
  { label: 'ink on lilac', foreground: 'text', background: 'lilac', minimum: TEXT },
  { label: 'danger on bg', foreground: 'danger', background: 'bg', minimum: TEXT },
  { label: 'danger on surface', foreground: 'danger', background: 'surface', minimum: TEXT },
  { label: 'warning on bg', foreground: 'warning', background: 'bg', minimum: TEXT },
  { label: 'warning on surface', foreground: 'warning', background: 'surface', minimum: TEXT },
  { label: 'footer text on footer', foreground: 'footerText', background: 'footer', minimum: TEXT },
  { label: 'footer meta on footer', foreground: 'footerMuted', background: 'footer', minimum: TEXT },
  { label: 'footer heading on footer', foreground: 'footerMint', background: 'footer', minimum: TEXT },
  { label: 'active nav label', foreground: 'onNav', background: 'navActive', minimum: TEXT },
  { label: 'primary button', foreground: 'onAccent', background: 'accent', minimum: TEXT },
  { label: 'secondary button', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'ghost button', foreground: 'brandHover', background: 'bg', minimum: TEXT },
  { label: 'disabled button', foreground: 'muted', background: 'subtle', minimum: TEXT },
  { label: 'header pill', foreground: 'text', background: 'mint', minimum: TEXT },
  { label: 'ink on shift wash', foreground: 'text', background: 'cShift', minimum: TEXT },
  { label: 'ink on drift wash', foreground: 'text', background: 'cDrift', minimum: TEXT },
  { label: 'ink on encoding wash', foreground: 'text', background: 'cEnc', minimum: TEXT },
  { label: 'ink on srt-to-vtt wash', foreground: 'text', background: 'cS2v', minimum: TEXT },
  { label: 'ink on vtt-to-srt wash', foreground: 'text', background: 'cV2s', minimum: TEXT },
  { label: 'ink on ass-to-srt wash', foreground: 'text', background: 'cAss', minimum: TEXT },
  { label: 'edge on surface', foreground: 'edge', background: 'surface', minimum: NON_TEXT },
  { label: 'edge on brand', foreground: 'edge', background: 'brand', minimum: NON_TEXT },
  { label: 'stage line on brand', foreground: 'stageLine', background: 'brand', minimum: NON_TEXT },
  { label: 'control on surface', foreground: 'control', background: 'surface', minimum: NON_TEXT },
  { label: 'brand-hover on bg', foreground: 'brandHover', background: 'bg', minimum: NON_TEXT },
];

const DARK_PAIRS: readonly Pair[] = [
  { label: 'text on bg', foreground: 'text', background: 'bg', minimum: TEXT },
  { label: 'text on surface', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'muted on bg', foreground: 'muted', background: 'bg', minimum: TEXT },
  { label: 'muted on surface', foreground: 'muted', background: 'surface', minimum: TEXT },
  { label: 'muted on subtle', foreground: 'muted', background: 'subtle', minimum: TEXT },
  { label: 'on-brand on brand', foreground: 'onBrand', background: 'brand', minimum: TEXT },
  { label: 'on-brand-muted on brand', foreground: 'onBrandMuted', background: 'brand', minimum: TEXT },
  { label: 'on-brand on dropzone', foreground: 'onBrand', background: 'dropzone', minimum: TEXT },
  { label: 'link on bg', foreground: 'brandHover', background: 'bg', minimum: TEXT },
  { label: 'link on surface', foreground: 'brandHover', background: 'surface', minimum: TEXT },
  { label: 'brand-hover on lilac', foreground: 'brandHover', background: 'lilac', minimum: TEXT },
  { label: 'text on lilac', foreground: 'text', background: 'lilac', minimum: TEXT },
  { label: 'text on accent-soft', foreground: 'text', background: 'accentSoft', minimum: TEXT },
  { label: 'text on teal-soft', foreground: 'text', background: 'tealSoft', minimum: TEXT },
  { label: 'muted on accent-soft', foreground: 'muted', background: 'accentSoft', minimum: TEXT },
  { label: 'text on accent-wash', foreground: 'text', background: 'accentWash', minimum: TEXT },
  { label: 'text on mint wash', foreground: 'text', background: 'mint', minimum: TEXT },
  { label: 'on-accent on coral', foreground: 'onAccent', background: 'accent', minimum: TEXT },
  { label: 'on-accent on teal', foreground: 'onAccent', background: 'teal', minimum: TEXT },
  { label: 'ink on mint chip', foreground: 'onAccent', background: 'footerMint', minimum: TEXT },
  { label: 'accent-ink on surface', foreground: 'accentInk', background: 'surface', minimum: TEXT },
  { label: 'teal-ink on surface', foreground: 'tealInk', background: 'surface', minimum: TEXT },
  { label: 'success on surface', foreground: 'success', background: 'surface', minimum: TEXT },
  { label: 'danger on bg', foreground: 'danger', background: 'bg', minimum: TEXT },
  { label: 'danger on surface', foreground: 'danger', background: 'surface', minimum: TEXT },
  { label: 'warning on bg', foreground: 'warning', background: 'bg', minimum: TEXT },
  { label: 'warning on surface', foreground: 'warning', background: 'surface', minimum: TEXT },
  { label: 'footer text on footer', foreground: 'footerText', background: 'footer', minimum: TEXT },
  { label: 'footer meta on footer', foreground: 'footerMuted', background: 'footer', minimum: TEXT },
  { label: 'footer heading on footer', foreground: 'footerMint', background: 'footer', minimum: TEXT },
  { label: 'active nav label', foreground: 'onNav', background: 'navActive', minimum: TEXT },
  { label: 'primary button', foreground: 'onAccent', background: 'accent', minimum: TEXT },
  { label: 'secondary button', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'ghost button', foreground: 'brandHover', background: 'bg', minimum: TEXT },
  { label: 'disabled button', foreground: 'muted', background: 'subtle', minimum: TEXT },
  { label: 'header pill', foreground: 'text', background: 'mint', minimum: TEXT },
  { label: 'edge on surface', foreground: 'edge', background: 'surface', minimum: NON_TEXT },
  { label: 'edge on bg', foreground: 'edge', background: 'bg', minimum: NON_TEXT },
  { label: 'stage line on brand', foreground: 'stageLine', background: 'brand', minimum: NON_TEXT },
  { label: 'active pill distinct from inactive', foreground: 'navActive', background: 'surface', minimum: NON_TEXT },
  { label: 'brand-hover on bg', foreground: 'brandHover', background: 'bg', minimum: NON_TEXT },
];

const TOOL_PAIRS: readonly Pair[] = [
  { label: 'shift icon on tile', foreground: 'tShift', background: 'tShiftBg', minimum: NON_TEXT },
  { label: 'drift icon on tile', foreground: 'tDrift', background: 'tDriftBg', minimum: NON_TEXT },
  { label: 'encoding icon on tile', foreground: 'tEnc', background: 'tEncBg', minimum: NON_TEXT },
  { label: 'srt-to-vtt icon on tile', foreground: 'tS2v', background: 'tS2vBg', minimum: NON_TEXT },
  { label: 'vtt-to-srt icon on tile', foreground: 'tV2s', background: 'tV2sBg', minimum: NON_TEXT },
  { label: 'ass-to-srt icon on tile', foreground: 'tAss', background: 'tAssBg', minimum: NON_TEXT },
];

describe('contrastRatio', () => {
  it('reports 21:1 for black and white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
  });
});

function checkPairs(scheme: string, palette: Palette, pairs: readonly Pair[]): void {
  describe(`${scheme} palette`, () => {
    for (const pair of pairs) {
      it(`${pair.label} is at least ${pair.minimum}:1`, () => {
        const ratio = contrastRatio(palette[pair.foreground], palette[pair.background]);
        expect(ratio).toBeGreaterThanOrEqual(pair.minimum);
      });
    }
  });
}

checkPairs('light', LIGHT, LIGHT_PAIRS);
checkPairs('dark', DARK, DARK_PAIRS);
checkPairs('tool tiles', LIGHT, TOOL_PAIRS);

describe('dark stage outlines cannot reuse edge', () => {
  it('dark edge on brand is below 3:1', () => {
    expect(contrastRatio(DARK.edge, DARK.brand)).toBeLessThan(NON_TEXT);
  });
});

describe('footer headings cannot reuse the dark mint wash', () => {
  it('dark mint on the footer is below 4.5:1', () => {
    expect(contrastRatio(DARK.mint, DARK.footer)).toBeLessThan(TEXT);
  });
});

describe('ink is required on coral and teal', () => {
  for (const [scheme, palette] of [
    ['light', LIGHT],
    ['dark', DARK],
  ] as const) {
    it(`${scheme} white on coral is below 4.5:1`, () => {
      expect(contrastRatio(WHITE, palette.accent)).toBeLessThan(TEXT);
    });

    it(`${scheme} white on teal is below 4.5:1`, () => {
      expect(contrastRatio(WHITE, palette.teal)).toBeLessThan(TEXT);
    });
  }
});
