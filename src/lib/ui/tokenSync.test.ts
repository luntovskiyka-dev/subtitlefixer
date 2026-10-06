import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DARK, LIGHT, type Palette } from './contrast';

const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');
const darkAt = css.indexOf('@media (prefers-color-scheme: dark)');
const lightBlock = css.slice(0, darkAt);
const darkBlock = css.slice(darkAt);

const WASHES: ReadonlyArray<readonly [string, keyof Palette]> = [
  ['--c-shift', 'cShift'],
  ['--c-drift', 'cDrift'],
  ['--c-enc', 'cEnc'],
  ['--c-s2v', 'cS2v'],
  ['--c-v2s', 'cV2s'],
  ['--c-ass', 'cAss'],
  ['--c-s2t', 'cS2t'],
  ['--c-t2s', 'cT2s'],
  ['--c-merge', 'cMerge'],
  ['--c-sub', 'cSub'],
  ['--c-sbv', 'cSbv'],
];

function valueOf(block: string, name: string): string | undefined {
  const match = new RegExp(`${name}:\\s*(#[0-9A-Fa-f]{6})\\s*;`).exec(block);
  return match?.[1]?.toUpperCase();
}

describe('tool card washes in tokens.css match contrast.ts', () => {
  it('finds the dark block', () => {
    expect(darkAt).toBeGreaterThan(0);
  });

  for (const [name, key] of WASHES) {
    it(`${name} light value matches LIGHT.${key}`, () => {
      expect(valueOf(lightBlock, name)).toBe(LIGHT[key].toUpperCase());
    });

    it(`${name} dark value matches DARK.${key}`, () => {
      expect(valueOf(darkBlock, name)).toBe(DARK[key].toUpperCase());
    });
  }

  it('gives every tool its own dark wash', () => {
    expect(new Set(WASHES.map(([, key]) => DARK[key])).size).toBe(WASHES.length);
  });
});
