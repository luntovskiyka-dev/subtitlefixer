import { describe, expect, it } from 'vitest';
import {
  formatAssTimestamp,
  formatSrtTimestamp,
  formatVttTimestamp,
  normalizeMs,
  parseAssTimestamp,
  parseSrtTimestamp,
  parseVttTimestamp,
} from './time';

describe('normalizeMs', () => {
  it('rounds to a non-negative millisecond', () => {
    expect(normalizeMs(1000.6)).toBe(1001);
    expect(normalizeMs(-20)).toBe(0);
    expect(normalizeMs(Number.NaN)).toBe(0);
  });
});

describe('SRT timestamps', () => {
  it('reads a comma timestamp as milliseconds', () => {
    expect(parseSrtTimestamp('00:00:01,000')).toBe(1000);
    expect(parseSrtTimestamp('00:00:03,500')).toBe(3500);
    expect(parseSrtTimestamp('01:02:03,004')).toBe(3_723_004);
  });

  it('rejects a dot, an out-of-range clock, and an empty string', () => {
    expect(parseSrtTimestamp('00:00:01.000')).toBeNull();
    expect(parseSrtTimestamp('00:60:00,000')).toBeNull();
    expect(parseSrtTimestamp('00:00:60,000')).toBeNull();
    expect(parseSrtTimestamp('')).toBeNull();
  });

  it('writes hours, minutes, seconds, and milliseconds', () => {
    expect(formatSrtTimestamp(1000)).toBe('00:00:01,000');
    expect(formatSrtTimestamp(3500)).toBe('00:00:03,500');
    expect(formatSrtTimestamp(3_723_004)).toBe('01:02:03,004');
    expect(formatSrtTimestamp(360_000_000)).toBe('100:00:00,000');
    expect(parseSrtTimestamp(formatSrtTimestamp(360_000_000))).toBe(360_000_000);
  });
});

describe('VTT timestamps', () => {
  it('reads a dot timestamp, including minutes-only and short fractions', () => {
    expect(parseVttTimestamp('00:00:01.000')).toBe(1000);
    expect(parseVttTimestamp('00:00:03.500')).toBe(3500);
    expect(parseVttTimestamp('00:01.500')).toBe(1500);
    expect(parseVttTimestamp('00:00:01.5')).toBe(1500);
    expect(parseVttTimestamp('00:00:02.25')).toBe(2250);
  });

  it('rejects a comma timestamp', () => {
    expect(parseVttTimestamp('00:00:01,000')).toBeNull();
  });

  it('writes three fractional digits', () => {
    expect(formatVttTimestamp(1000)).toBe('00:00:01.000');
    expect(formatVttTimestamp(3500)).toBe('00:00:03.500');
    expect(formatVttTimestamp(1500)).toBe('00:00:01.500');
  });
});

describe('ASS timestamps', () => {
  it('reads centiseconds', () => {
    expect(parseAssTimestamp('0:00:01.00')).toBe(1000);
    expect(parseAssTimestamp('0:00:03.50')).toBe(3500);
    expect(parseAssTimestamp('00:00:01.00')).toBe(1000);
  });

  it('rejects millisecond precision and a short fraction', () => {
    expect(parseAssTimestamp('0:00:01.000')).toBeNull();
    expect(parseAssTimestamp('0:00:01.5')).toBeNull();
  });

  it('writes H:MM:SS.CC', () => {
    expect(formatAssTimestamp(1000)).toBe('0:00:01.00');
    expect(formatAssTimestamp(3500)).toBe('0:00:03.50');
    expect(formatAssTimestamp(36_000_000)).toBe('10:00:00.00');
    expect(parseAssTimestamp(formatAssTimestamp(3500))).toBe(3500);
  });
});
