import { describe, expect, it } from 'vitest';
import { toolMeta, tools } from '../../data/tools';

const NAV_ORDER = [
  'Shift',
  'Fix drift',
  'Fix encoding',
  'SRT→VTT',
  'VTT→SRT',
  'ASS→SRT',
  'SRT→TXT',
  'TXT→SRT',
] as const;

describe('toolMeta', () => {
  it('lists every tool once, in the header order', () => {
    expect(toolMeta.map((tool) => tool.nav)).toEqual([...NAV_ORDER]);
    expect(new Set(toolMeta.map((tool) => tool.slug))).toEqual(new Set(Object.keys(tools)));
  });

  it('keeps an icon, a card line, and an H1 mark for each tool', () => {
    for (const tool of toolMeta) {
      expect(tool.icon).toContain('<path');
      expect(tool.card.length).toBeGreaterThan(0);
      expect(tool.mark.length).toBeGreaterThan(0);
      expect(tool.formats.length).toBeGreaterThan(0);
      expect(tools[tool.slug]).toBeTruthy();
    }
  });
});
