import { describe, expect, it } from 'vitest';
import bad from '../../../tests/fixtures/validator-bad.srt?raw';
import { reportLabel, validateSrt } from './validate';

describe('validateSrt', () => {
  it('reports numbering, a dot timestamp, an inverted cue, overlap, order and zero duration', () => {
    const report = validateSrt(bad);
    const lines = report.items.map((item) => reportLabel(item.level, item.cue, item.line, item.message));
    expect(lines.some((line) => line.includes('subtitle 3 (line 5)') && line.includes('expected 2'))).toBe(true);
    expect(lines.some((line) => line.includes('comma before the milliseconds'))).toBe(true);
    expect(lines.some((line) => line.includes('ends before it starts'))).toBe(true);
    expect(lines.some((line) => line.includes('Lasts zero seconds'))).toBe(true);
    expect(lines.some((line) => line.includes('Overlaps the next line'))).toBe(true);
  });

  it('warns when a later subtitle starts before the one above it', () => {
    const text = '1\n00:00:04,000 --> 00:00:05,000\nLater\n\n2\n00:00:01,000 --> 00:00:02,000\nEarlier\n';
    const report = validateSrt(text);
    expect(report.items.some((item) => item.message.includes('Out of order'))).toBe(true);
  });

  it('warns when the bytes are not UTF-8 and notes a BOM', () => {
    const text = '1\n00:00:01,000 --> 00:00:02,000\nПривет\n';
    const bytes = new Uint8Array([0xff, 0xfe, 0x1f, 0x04]);
    const report = validateSrt(text, bytes);
    expect(report.items.some((item) => item.message.includes('not UTF-8'))).toBe(true);
    const bom = new Uint8Array([0xef, 0xbb, 0xbf, 0x31]);
    expect(validateSrt('1\n00:00:01,000 --> 00:00:02,000\nHi\n', bom).items.some((item) => item.level === 'info')).toBe(
      true,
    );
  });

  it('does not put a second period on messages that already end with one', () => {
    const report = validateSrt('not a subtitle\n');
    const item = report.items[0];
    expect(item).toBeDefined();
    if (!item) return;
    const line = reportLabel(item.level, item.cue, item.line, item.message);
    expect(line.endsWith('..')).toBe(false);
    expect(line.endsWith('.')).toBe(true);
    expect(line).toBe('Error, line 1: is missing a cue number or timestamp.');
  });

  it('shares the editor issue for an overlap', () => {
    const text = '1\n00:00:01,000 --> 00:00:04,000\nA\n\n2\n00:00:03,000 --> 00:00:05,000\nB\n';
    const report = validateSrt(text);
    expect(report.items.map((item) => item.message)).toContain('Overlaps the next line');
  });
});
