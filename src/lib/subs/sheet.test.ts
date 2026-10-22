import { unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import formula from '../../../tests/fixtures/formula.srt?raw';
import { guardFormula, rowsToCsv, rowsToXlsx, sheetRows, subtitlesToSheet } from './sheet';

describe('sheet export', () => {
  it('prefixes formula-like cells and writes UTF-8 CSV with a BOM', () => {
    expect(guardFormula('=1+1')).toBe("'=1+1");
    expect(guardFormula('+plus')).toBe("'+plus");
    expect(guardFormula('-minus')).toBe("'-minus");
    expect(guardFormula('@at')).toBe("'@at");
    expect(guardFormula('\tcmd')).toBe("'\tcmd");
    expect(guardFormula('Hello, "world"')).toBe('Hello, "world"');
    const table = sheetRows(formula, 'srt');
    const csv = rowsToCsv(table.rows);
    expect(csv).toContain(",'=1+1");
    expect(csv).toContain("'+plus");
    expect(csv.split('\r\n')[0]).toBe('#,Start,End,Text');
    const bytes = subtitlesToSheet(formula, 'srt', 'csv').bytes ?? new Uint8Array();
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
  });

  it('writes formula text into xlsx inline strings without a leading apostrophe', () => {
    const table = sheetRows('1\n00:00:01,200 --> 00:00:02,000\nHi\nthere\n', 'srt');
    expect(table.rows[0]?.text).toBe('Hi\nthere');
    const packed = rowsToXlsx(table.rows);
    const files = unzipSync(packed);
    const sheet = new TextDecoder().decode(files['xl/worksheets/sheet1.xml']);
    expect(sheet).toContain('Hi\nthere');
    expect(sheet).toContain('<v>1</v>');
    const guarded = rowsToXlsx(sheetRows(formula, 'srt').rows);
    const guardedSheet = new TextDecoder().decode(unzipSync(guarded)['xl/worksheets/sheet1.xml']);
    expect(guardedSheet).toContain('t="inlineStr"');
    expect(guardedSheet).toContain('=1+1');
    expect(guardedSheet).not.toContain("'=1+1");
    expect(guardedSheet).not.toContain("'+plus");
  });
});
