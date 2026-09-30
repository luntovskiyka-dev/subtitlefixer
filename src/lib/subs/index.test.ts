import { describe, expect, it } from 'vitest';
import { parse, serialize } from './index';
import type { SubtitleFormat } from './types';

const formats: SubtitleFormat[] = ['srt', 'vtt', 'ass'];

describe('parse', () => {
  it('returns no cues and no errors for empty input', () => {
    for (const format of formats) {
      expect(parse('', format)).toEqual({ cues: [], errors: [] });
      expect(parse('  \n\n\t', format)).toEqual({ cues: [], errors: [] });
    }
  });
});

describe('serialize', () => {
  it('returns an empty string for no cues', () => {
    for (const format of formats) {
      expect(serialize([], format)).toBe('');
      expect(parse(serialize([], format), format)).toEqual({ cues: [], errors: [] });
    }
  });
});
