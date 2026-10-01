import { describe, expect, it } from 'vitest';
import { serialize } from '../subs/index';
import { shiftCues } from '../subs/shift';
import type { Cue } from '../subs/types';
import { fileCueLine, shiftPreviewRows, shiftPreviewTag } from './shiftPreview';

/** The three cues from the shift page's own before/after example. */
const EXAMPLE: readonly Cue[] = [
  { start: 12_400, end: 15_100, text: 'Where were you last night?' },
  { start: 15_600, end: 18_250, text: 'I told you. I was at work.' },
  { start: 63_980, end: 66_020, text: 'Nobody at work has seen you all week.' },
];

describe('shiftPreviewRows', () => {
  it('matches the downloaded SRT for the shown cues', () => {
    const preview = shiftPreviewRows(EXAMPLE, -2500, undefined, 'srt');
    const shifted = shiftCues(EXAMPLE, -2500);
    const downloaded = serialize(shifted.cues, 'srt');

    expect(preview.cueCount).toBe(shifted.cues.length);
    expect(preview.rows).toHaveLength(shifted.cues.length);
    preview.rows.forEach((row, index) => {
      expect(downloaded).toContain(row.newStart);
      expect(downloaded).toContain(row.text);
      expect(row.text).toBe(shifted.cues[index]?.text);
      expect(row.number).toBe(index + 1);
    });
    expect(preview.rows.map((row) => row.oldStart)).toEqual([
      '00:00:12,400',
      '00:00:15,600',
      '00:01:03,980',
    ]);
    expect(preview.rows.map((row) => row.newStart)).toEqual([
      '00:00:09,900',
      '00:00:13,100',
      '00:01:01,480',
    ]);
    expect(preview.tag).toBe('−2500 ms · all 3 cues');
  });

  it('stops at six cues and names a from-line', () => {
    const cues = Array.from({ length: 8 }, (_, index) => ({
      start: (index + 1) * 1000,
      end: (index + 1) * 1000 + 500,
      text: `Line ${index + 1}`,
    }));
    const preview = shiftPreviewRows(cues, 1000, 2, 'vtt', 6);
    const downloaded = serialize(shiftCues(cues, 1000, 2).cues, 'vtt');

    expect(preview.rows).toHaveLength(6);
    expect(preview.cueCount).toBe(8);
    expect(preview.tag).toBe(shiftPreviewTag(1000, 8, 2));
    for (const row of preview.rows) {
      expect(downloaded).toContain(row.newStart);
      expect(downloaded).toContain(row.text);
    }
    expect(preview.rows[0]?.oldStart).toBe(preview.rows[0]?.newStart);
  });
});

describe('fileCueLine', () => {
  it('prints the format, cue count, and encoding', () => {
    expect(fileCueLine('SRT', 3, 'utf-8')).toBe('SRT · 3 cues · UTF-8');
    expect(fileCueLine('VTT', 1, 'windows-1252')).toBe('VTT · 1 cue · windows-1252');
  });
});
