export const tools = {
  'shift-subtitles': 'Shift subtitles',
  'fix-subtitle-encoding': 'Fix subtitle encoding',
  'srt-to-vtt': 'SRT to VTT',
  'vtt-to-srt': 'VTT to SRT',
  'ass-to-srt': 'ASS to SRT',
  'fix-subtitle-drift': 'Fix subtitle drift',
} as const;

export type ToolSlug = keyof typeof tools;
export type ToolKey = 'shift' | 'drift' | 'enc' | 's2v' | 'v2s' | 'ass';
export type ToolGroup = 'Timing' | 'Text' | 'Convert';

export type ToolMeta = {
  slug: ToolSlug;
  nav: 'Shift' | 'Fix drift' | 'Fix encoding' | 'SRT→VTT' | 'VTT→SRT' | 'ASS→SRT';
  key: ToolKey;
  group: ToolGroup;
  /** SVG path markup, drawn with the tool icon colour. */
  icon: string;
  formats: string;
  card: string;
  /** Word inside the tool H1 that the coral pill wraps. The H1 text itself stays unchanged. */
  mark: string;
};

/** Header order. Footer links keep the insertion order of `tools`. */
export const toolMeta: readonly ToolMeta[] = [
  {
    slug: 'shift-subtitles',
    nav: 'Shift',
    key: 'shift',
    group: 'Timing',
    icon: '<path d="M4 5v14"/><path d="M8 12h12"/><path d="m15 7 5 5-5 5"/>',
    formats: 'SRT · VTT · ASS',
    card: 'Move every subtitle earlier or later by milliseconds, from any line.',
    mark: 'Subtitles',
  },
  {
    slug: 'fix-subtitle-drift',
    nav: 'Fix drift',
    key: 'drift',
    group: 'Timing',
    icon: '<circle cx="12" cy="14" r="7.5"/><path d="M12 10.5V14l2.5 2"/><path d="M9.5 2.5h5"/>',
    formats: '23.976 ↔ 25 fps',
    card: 'Re-time subtitles that start in sync but slowly drift, or change fps.',
    mark: 'Drift',
  },
  {
    slug: 'fix-subtitle-encoding',
    nav: 'Fix encoding',
    key: 'enc',
    group: 'Text',
    icon: '<path d="M4 19 9 5l5 14"/><path d="M5.8 14h6.4"/><path d="M16 9h5M18.5 6.5v5"/>',
    formats: 'UTF-8 · 1251 · 1252…',
    card: 'Turn garbled text like Ã© back into readable letters, saved as UTF-8.',
    mark: 'Encoding',
  },
  {
    slug: 'srt-to-vtt',
    nav: 'SRT→VTT',
    key: 's2v',
    group: 'Convert',
    icon: '<path d="M4 8h13l-3.5-3.5"/><path d="M20 16H7l3.5 3.5"/>',
    formats: '.srt → .vtt',
    card: 'Convert one or many SubRip files to WebVTT for HTML5 video.',
    mark: 'VTT',
  },
  {
    slug: 'vtt-to-srt',
    nav: 'VTT→SRT',
    key: 'v2s',
    group: 'Convert',
    icon: '<path d="M20 8H7l3.5-3.5"/><path d="M4 16h13l-3.5 3.5"/>',
    formats: '.vtt → .srt',
    card: 'Convert one or many WebVTT files to SubRip.',
    mark: 'SRT',
  },
  {
    slug: 'ass-to-srt',
    nav: 'ASS→SRT',
    key: 'ass',
    group: 'Convert',
    icon: '<path d="m14.5 4.5 5 5L9 20H4v-5z"/><path d="m12.5 6.5 5 5"/>',
    formats: '.ass/.ssa → .srt',
    card: 'Turn styled ASS and SSA files into plain SRT subtitles.',
    mark: 'SRT',
  },
];

/** Home hero trust pills, in display order. UI microcopy approved by Kirill on 2026-10-01. */
export const homeTrust = ['No upload', 'No sign-up', 'Free, 6 tools', 'Many files → one zip'] as const;

/** Labels of the tool grid on the home page and the 404 page. */
export const toolGridCopy = {
  heading: 'Pick a tool',
  open: 'Open tool →',
} as const;