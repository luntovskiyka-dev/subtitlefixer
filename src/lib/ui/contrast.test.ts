import { describe, expect, it } from 'vitest';
import { DARK, LIGHT, contrastRatio, type Palette } from './contrast';

const TEXT = 4.5;
const NON_TEXT = 3;

type Pair = {
  label: string;
  foreground: keyof Palette;
  background: keyof Palette;
  minimum: number;
};

const PAIRS: readonly Pair[] = [
  { label: 'ink on bg', foreground: 'text', background: 'bg', minimum: TEXT },
  { label: 'ink on surface', foreground: 'text', background: 'surface', minimum: TEXT },
  { label: 'muted on bg', foreground: 'muted', background: 'bg', minimum: TEXT },
  { label: 'muted on surface', foreground: 'muted', background: 'surface', minimum: TEXT },
  { label: 'brand on bg', foreground: 'brand', background: 'bg', minimum: TEXT },
  { label: 'brand on surface', foreground: 'brand', background: 'surface', minimum: TEXT },
  { label: 'brand on brand-soft', foreground: 'brand', background: 'brandSoft', minimum: TEXT },
  { label: 'bg on brand', foreground: 'bg', background: 'brand', minimum: TEXT },
  { label: 'danger on bg', foreground: 'danger', background: 'bg', minimum: TEXT },
  { label: 'danger on surface', foreground: 'danger', background: 'surface', minimum: TEXT },
  { label: 'warning on bg', foreground: 'warning', background: 'bg', minimum: TEXT },
  { label: 'warning on surface', foreground: 'warning', background: 'surface', minimum: TEXT },
  { label: 'accent-strong on accent', foreground: 'accentStrong', background: 'accent', minimum: TEXT },
  { label: 'control on bg', foreground: 'control', background: 'bg', minimum: NON_TEXT },
  { label: 'brand on bg (non-text)', foreground: 'brand', background: 'bg', minimum: NON_TEXT },
];

describe('contrastRatio', () => {
  it('reports 21:1 for black and white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
  });
});

for (const [scheme, palette] of [
  ['light', LIGHT],
  ['dark', DARK],
] as const) {
  describe(`${scheme} palette`, () => {
    for (const pair of PAIRS) {
      it(`${pair.label} is at least ${pair.minimum}:1`, () => {
        const ratio = contrastRatio(palette[pair.foreground], palette[pair.background]);
        expect(ratio).toBeGreaterThanOrEqual(pair.minimum);
      });
    }
  });
}
