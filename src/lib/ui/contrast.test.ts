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

/** Below-the-fold surfaces added in the calm reading layout. */
const BELOW_FOLD_PAIRS: readonly Pair[] = [
  { label: 'step number on coral', foreground: 'onAccent', background: 'accent', minimum: TEXT },
  { label: 'step number on teal', foreground: 'onAccent', background: 'teal', minimum: TEXT },
  { label: 'step number on mint', foreground: 'onAccent', background: 'footerMint', minimum: TEXT },
  { label: 'callout text on lilac', foreground: 'text', background: 'lilac', minimum: TEXT },
  { label: 'code chip on lilac', foreground: 'text', background: 'lilac', minimum: TEXT },
  { label: 'table header on lilac', foreground: 'text', background: 'lilac', minimum: TEXT },
  { label: 'before pill on lilac', foreground: 'text', background: 'lilac', minimum: TEXT },
  { label: 'after pill on mint', foreground: 'onAccent', background: 'footerMint', minimum: TEXT },
  { label: 'does text on mint wash', foreground: 'text', background: 'mint', minimum: TEXT },
  { label: 'does not text on coral wash', foreground: 'text', background: 'accentWash', minimum: TEXT },
  { label: 'card text on surface', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'pre text on surface', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'faq text on surface', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'toc text on surface', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'copy link on page', foreground: 'brandHover', background: 'bg', minimum: TEXT },
  { label: 'copy link on card', foreground: 'brandHover', background: 'surface', minimum: TEXT },
  { label: 'copy link on callout', foreground: 'brandHover', background: 'lilac', minimum: TEXT },
  { label: 'copy link on does card', foreground: 'brandHover', background: 'mint', minimum: TEXT },
  { label: 'copy link on does not card', foreground: 'brandHover', background: 'accentWash', minimum: TEXT },
  { label: 'timestamp on pre', foreground: 'tealInk', background: 'surface', minimum: TEXT },
  { label: 'cue number on pre', foreground: 'muted', background: 'surface', minimum: TEXT },
  { label: 'faq closed marker on lilac', foreground: 'text', background: 'lilac', minimum: TEXT },
  { label: 'faq open marker on coral', foreground: 'onAccent', background: 'accent', minimum: TEXT },
  { label: 'does marker on mint', foreground: 'onAccent', background: 'footerMint', minimum: TEXT },
  { label: 'does not marker on coral', foreground: 'onAccent', background: 'accent', minimum: TEXT },
  { label: 'back to tool pill', foreground: 'bg', background: 'text', minimum: TEXT },
  { label: 'ink outline on card', foreground: 'edge', background: 'surface', minimum: NON_TEXT },
];

checkPairs('light', LIGHT, LIGHT_PAIRS);
checkPairs('dark', DARK, DARK_PAIRS);
checkPairs('tool tiles', LIGHT, TOOL_PAIRS);
checkPairs('tool tiles dark', DARK, TOOL_PAIRS);
checkPairs('below-fold light', LIGHT, BELOW_FOLD_PAIRS);
checkPairs('below-fold dark', DARK, BELOW_FOLD_PAIRS);

/** Home hero pills and tool cards (R6). Checked in both themes. */
const HOME_PAIRS: readonly Pair[] = [
  { label: 'hero H1 on stage', foreground: 'onBrand', background: 'brand', minimum: TEXT },
  { label: 'hero lead on stage', foreground: 'onBrandMuted', background: 'brand', minimum: TEXT },
  { label: 'trust pill on mint', foreground: 'text', background: 'mint', minimum: TEXT },
  { label: 'trust pill on surface', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'trust pill on accent-soft', foreground: 'text', background: 'accentSoft', minimum: TEXT },
  { label: 'trust pill on teal-soft', foreground: 'text', background: 'tealSoft', minimum: TEXT },
  { label: 'trust pill outline on stage', foreground: 'stageLine', background: 'brand', minimum: NON_TEXT },
  { label: 'card chip text on surface', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'card outline on page', foreground: 'edge', background: 'bg', minimum: NON_TEXT },
  { label: 'card focus ring on page', foreground: 'brandHover', background: 'bg', minimum: NON_TEXT },
  { label: 'text on shift card', foreground: 'text', background: 'cShift', minimum: TEXT },
  { label: 'text on drift card', foreground: 'text', background: 'cDrift', minimum: TEXT },
  { label: 'text on encoding card', foreground: 'text', background: 'cEnc', minimum: TEXT },
  { label: 'text on srt-to-vtt card', foreground: 'text', background: 'cS2v', minimum: TEXT },
  { label: 'text on vtt-to-srt card', foreground: 'text', background: 'cV2s', minimum: TEXT },
  { label: 'text on ass-to-srt card', foreground: 'text', background: 'cAss', minimum: TEXT },
  { label: 'outline on shift card', foreground: 'edge', background: 'cShift', minimum: NON_TEXT },
  { label: 'outline on drift card', foreground: 'edge', background: 'cDrift', minimum: NON_TEXT },
  { label: 'outline on encoding card', foreground: 'edge', background: 'cEnc', minimum: NON_TEXT },
  { label: 'outline on srt-to-vtt card', foreground: 'edge', background: 'cS2v', minimum: NON_TEXT },
  { label: 'outline on vtt-to-srt card', foreground: 'edge', background: 'cV2s', minimum: NON_TEXT },
  { label: 'outline on ass-to-srt card', foreground: 'edge', background: 'cAss', minimum: NON_TEXT },
];

checkPairs('home light', LIGHT, HOME_PAIRS);
checkPairs('home dark', DARK, HOME_PAIRS);

/** Problem-card illustrations (R8). Checked in both themes. */
const PROBLEM_PAIRS: readonly Pair[] = [
  { label: 'text on surface', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'accent ink on surface', foreground: 'accentInk', background: 'surface', minimum: TEXT },
  { label: 'text on mint', foreground: 'text', background: 'mint', minimum: TEXT },
  { label: 'text on shift wash', foreground: 'text', background: 'cShift', minimum: TEXT },
  { label: 'text on drift wash', foreground: 'text', background: 'cDrift', minimum: TEXT },
  { label: 'text on encoding wash', foreground: 'text', background: 'cEnc', minimum: TEXT },
  { label: 'text on srt-to-vtt wash', foreground: 'text', background: 'cS2v', minimum: TEXT },
  { label: 'text on vtt-to-srt wash', foreground: 'text', background: 'cV2s', minimum: TEXT },
  { label: 'text on ass-to-srt wash', foreground: 'text', background: 'cAss', minimum: TEXT },
  { label: 'accent ink on srt-to-vtt wash', foreground: 'accentInk', background: 'cS2v', minimum: TEXT },
  { label: 'accent ink on vtt-to-srt wash', foreground: 'accentInk', background: 'cV2s', minimum: TEXT },
  { label: 'success on srt-to-vtt wash', foreground: 'success', background: 'cS2v', minimum: TEXT },
  { label: 'success on vtt-to-srt wash', foreground: 'success', background: 'cV2s', minimum: TEXT },
  { label: 'muted on vtt-to-srt wash', foreground: 'muted', background: 'cV2s', minimum: TEXT },
  { label: 'edge on shift wash', foreground: 'edge', background: 'cShift', minimum: NON_TEXT },
  { label: 'edge on drift wash', foreground: 'edge', background: 'cDrift', minimum: NON_TEXT },
  { label: 'edge on encoding wash', foreground: 'edge', background: 'cEnc', minimum: NON_TEXT },
  { label: 'edge on srt-to-vtt wash', foreground: 'edge', background: 'cS2v', minimum: NON_TEXT },
  { label: 'edge on vtt-to-srt wash', foreground: 'edge', background: 'cV2s', minimum: NON_TEXT },
  { label: 'edge on ass-to-srt wash', foreground: 'edge', background: 'cAss', minimum: NON_TEXT },
  { label: 'playhead on shift wash', foreground: 'accentInk', background: 'cShift', minimum: NON_TEXT },
  { label: 'playhead on drift wash', foreground: 'accentInk', background: 'cDrift', minimum: NON_TEXT },
  { label: 'edge on surface', foreground: 'edge', background: 'surface', minimum: NON_TEXT },
  { label: 'focus ring on page', foreground: 'brandHover', background: 'bg', minimum: NON_TEXT },
];

checkPairs('problem cards light', LIGHT, PROBLEM_PAIRS);
checkPairs('problem cards dark', DARK, PROBLEM_PAIRS);

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

    it(`${scheme} white on the mint chip is below 4.5:1`, () => {
      expect(contrastRatio(WHITE, palette.footerMint)).toBeLessThan(TEXT);
    });
  }
});
