import { describe, expect, it } from 'vitest';
import { isBlankInput, normalizeCueText, normalizeNewlines, splitBlocks } from './text';

describe('normalizeNewlines', () => {
  it('strips a leading BOM and converts CR/LF to LF', () => {
    expect(normalizeNewlines('\uFEFFa\r\nb\rc')).toBe('a\nb\nc');
  });
});

describe('isBlankInput', () => {
  it('treats empty and whitespace-only strings as blank', () => {
    expect(isBlankInput('')).toBe(true);
    expect(isBlankInput('  \n\t')).toBe(true);
    expect(isBlankInput('\uFEFF')).toBe(true);
    expect(isBlankInput('1')).toBe(false);
  });
});

describe('splitBlocks', () => {
  it('splits on blank lines and keeps multiline text together', () => {
    const blocks = splitBlocks('1\r\n00:00:01,000 --> 00:00:02,000\r\nHello\r\n\r\n2\r\n00:00:03,000 --> 00:00:04,000\r\nLine one\r\nLine two\r\n');
    expect(blocks).toEqual([
      '1\n00:00:01,000 --> 00:00:02,000\nHello',
      '2\n00:00:03,000 --> 00:00:04,000\nLine one\nLine two',
    ]);
  });

  it('returns no blocks for blank input', () => {
    expect(splitBlocks('')).toEqual([]);
    expect(splitBlocks('\n\n')).toEqual([]);
  });
});

describe('normalizeCueText', () => {
  it('uses LF for line breaks inside a cue', () => {
    expect(normalizeCueText('a\r\nb\rc')).toBe('a\nb\nc');
  });
});
