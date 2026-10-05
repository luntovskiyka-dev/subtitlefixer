export const tools = {
  'shift-subtitles': 'Shift subtitles',
  'fix-subtitle-encoding': 'Fix subtitle encoding',
  'srt-to-vtt': 'SRT to VTT',
  'vtt-to-srt': 'VTT to SRT',
  'ass-to-srt': 'ASS to SRT',
  'fix-subtitle-drift': 'Fix subtitle drift',
  'srt-to-txt': 'SRT to TXT',
  'txt-to-srt': 'TXT to SRT',
  'merge-subtitles': 'Merge subtitles',
} as const;

export type ToolSlug = keyof typeof tools;
export type ToolKey = 'shift' | 'drift' | 'enc' | 's2v' | 'v2s' | 'ass' | 's2t' | 't2s' | 'merge';
export type ToolGroup = 'Timing' | 'Text' | 'Convert' | 'Combine';

export type ToolMeta = {
  slug: ToolSlug;
  nav:
    | 'Shift'
    | 'Fix drift'
    | 'Fix encoding'
    | 'SRT→VTT'
    | 'VTT→SRT'
    | 'ASS→SRT'
    | 'SRT→TXT'
    | 'TXT→SRT'
    | 'Merge';
  key: ToolKey;
  group: ToolGroup;
  /** SVG path markup, drawn with the tool icon colour. */
  icon: string;
  formats: string;
  card: string;
  /** Word inside the tool H1 that the coral pill wraps. The H1 text itself stays unchanged. */
  mark: string;
};

/** Home tool grid order, and the order inside each group of the header Tools menu. Footer links keep the insertion order of `tools`. */
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
  {
    slug: 'srt-to-txt',
    nav: 'SRT→TXT',
    key: 's2t',
    group: 'Convert',
    icon: '<path d="M5 5h14"/><path d="M5 10h14"/><path d="M5 15h14"/><path d="M5 20h8"/>',
    formats: '.srt/.vtt/.ass → .txt',
    card: 'Turn SRT, VTT or ASS subtitles into plain text, with or without timestamps.',
    mark: 'TXT',
  },
  {
    slug: 'txt-to-srt',
    nav: 'TXT→SRT',
    key: 't2s',
    group: 'Convert',
    icon: '<path d="M4 6h10"/><path d="M4 11h6"/><circle cx="16.5" cy="15.5" r="4.5"/><path d="M16.5 13.5v2l1.5 1"/>',
    formats: '.txt → .srt/.vtt',
    card: 'Turn a script or transcript into a timed SRT or VTT file.',
    mark: 'SRT',
  },
  {
    slug: 'merge-subtitles',
    nav: 'Merge',
    key: 'merge',
    group: 'Combine',
    icon: '<path d="M4 6h4.5l4 6"/><path d="M4 18h4.5l4-6H20"/><path d="m16.5 8.5 3.5 3.5-3.5 3.5"/>',
    formats: '2 files → .srt/.vtt',
    card: 'Combine two subtitle files: two languages in one, or CD1 and CD2 joined.',
    mark: 'Merge',
  },
];

/** Groups of the header Tools menu, in column order, with the names the home page uses for them. */
export const toolGroups = [
  { group: 'Timing', label: 'Timing' },
  { group: 'Text', label: 'Text and encoding' },
  { group: 'Convert', label: 'Format conversion' },
  { group: 'Combine', label: 'Combining files' },
] as const satisfies readonly { group: ToolGroup; label: string }[];

/** Home hero trust pills, in display order. UI microcopy approved by Kirill on 2026-10-01. */
export const homeTrust = ['No upload', 'No sign-up', 'Free, 9 tools', 'Many files → one zip'] as const;

/** Labels of the tool grid on the home page and the 404 page. */
export const toolGridCopy = {
  heading: 'Pick a tool',
  open: 'Open tool →',
  groups: 'Timing · Text and encoding · Format conversion · Combining files',
} as const;

/**
 * Home problem cards (R8), in display order. PLACEHOLDER labels: Витя + Kirill must OK them before merge.
 * Six cards for the six fixing and converting tools; SRT to TXT, TXT to SRT and Merge subtitles have no card yet.
 */
export const homeProblems = [
  { key: 'shift', label: 'Always early or late' },
  { key: 'drift', label: 'Gets worse over time' },
  { key: 'enc', label: 'Weird characters like Ã©' },
  { key: 's2v', label: 'Need VTT for the web' },
  { key: 'v2s', label: 'Need SRT for my TV' },
  { key: 'ass', label: "Styled .ass won't play" },
] as const satisfies readonly { key: ToolKey; label: string }[];

export const problemCopy = { heading: 'What’s wrong with your subtitles?' } as const;
