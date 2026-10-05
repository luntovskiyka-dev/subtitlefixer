import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const TOOLS = ['ShiftTool', 'ConvertTool', 'AssToSrtTool', 'DriftTool', 'EncodingTool', 'SrtToTxtTool', 'TxtToSrtTool', 'SubToSrtTool', 'MergeTool'];

describe('every UTF-8 download has an optional BOM checkbox', () => {
  for (const name of TOOLS) {
    const source = readFileSync(join(process.cwd(), `src/components/${name}.astro`), 'utf8');

    it(`${name} renders one unchecked bom checkbox`, () => {
      const inputs = source.match(/<input[^>]*name="bom"[^>]*>/g) ?? [];
      expect(inputs).toHaveLength(1);
      expect(inputs[0]).toContain('type="checkbox"');
      expect(inputs[0]).not.toMatch(/\bchecked\b/);
    });

    it(`${name} passes the checkbox state to the download helper`, () => {
      expect(source).not.toMatch(/downloadSubtitleFiles\([^)]*,\s*(?:true|false)\)/);
      expect(source).toMatch(/downloadSubtitleFiles\([^)]*,\s*bomInput\.checked\)/);
    });
  }
});