export const tools = {
  'shift-subtitles': 'Shift subtitles',
  'fix-subtitle-encoding': 'Fix subtitle encoding',
  'srt-editor': 'SRT editor',
  'srt-validator': 'SRT validator',
  'subtitle-cleaner': 'Subtitle cleaner',
  'srt-to-vtt': 'SRT to VTT',
  'vtt-to-srt': 'VTT to SRT',
  'ass-to-srt': 'ASS to SRT',
  'ass-to-vtt': 'ASS to VTT',
  'fix-subtitle-drift': 'Fix subtitle drift',
  'srt-to-txt': 'SRT to TXT',
  'vtt-to-txt': 'VTT to TXT',
  'srt-to-word': 'SRT to Word',
  'srt-to-excel': 'SRT to Excel',
  'txt-to-srt': 'TXT to SRT',
  'txt-to-vtt': 'TXT to VTT',
  'merge-subtitles': 'Merge subtitles',
  'sub-to-srt': 'SUB to SRT',
  'stl-to-srt': 'STL to SRT',
  'sbv-to-srt': 'SBV to SRT',
  'smi-to-srt': 'SMI to SRT',
  'ttml-to-srt': 'TTML to SRT',
  'dfxp-to-srt': 'DFXP to SRT',
  'xml-to-srt': 'XML to SRT',
  'sup-to-srt': 'SUP to SRT',
} as const;

/** Built pages that stay out of the nav, footer, sitemap and llms.txt. */
export const unlistedTools = {
  'idx-to-srt': 'IDX/SUB to SRT',
} as const;

export type ToolSlug = keyof typeof tools;
export type ToolKey =
  | 'shift'
  | 'drift'
  | 'enc'
  | 'edit'
  | 'val'
  | 'clean'
  | 's2v'
  | 'v2s'
  | 'ass'
  | 'a2v'
  | 's2t'
  | 'v2t'
  | 's2w'
  | 'xls'
  | 't2s'
  | 't2v'
  | 'sub'
  | 'stl'
  | 'sbv'
  | 'smi'
  | 'ttml'
  | 'dfxp'
  | 'xml'
  | 'sup'
  | 'merge';
export type ToolGroup = 'Timing' | 'Text' | 'Convert' | 'Combine';

export type ToolMeta = {
  slug: ToolSlug;
  nav:
    | 'Shift'
    | 'Fix drift'
    | 'Fix encoding'
    | 'Edit'
    | 'SRT→VTT'
    | 'VTT→SRT'
    | 'ASS→SRT'
    | 'ASS→VTT'
    | 'SRT→TXT'
    | 'VTT→TXT'
    | 'SRT→Word'
    | 'SRT→Excel'
    | 'TXT→SRT'
    | 'TXT→VTT'
    | 'SUB→SRT'
    | 'STL→SRT'
    | 'SBV→SRT'
    | 'SMI→SRT'
    | 'TTML→SRT'
    | 'DFXP→SRT'
    | 'XML→SRT'
    | 'SUP→SRT'
    | 'Check'
    | 'Clean'
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
    slug: 'ass-to-vtt',
    nav: 'ASS→VTT',
    key: 'a2v',
    group: 'Convert',
    icon: '<path d="M4 8h13l-3.5-3.5"/><path d="M14 16H4"/><path d="m16 13 4 3-4 3"/>',
    formats: '.ass/.ssa → .vtt',
    card: 'Turn ASS and SSA subtitles into WebVTT for HTML5 video.',
    mark: 'VTT',
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
    slug: 'vtt-to-txt',
    nav: 'VTT→TXT',
    key: 'v2t',
    group: 'Convert',
    icon: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/>',
    formats: '.vtt → .txt',
    card: 'Turn VTT captions into plain text, with or without timestamps.',
    mark: 'TXT',
  },
  {
    slug: 'srt-to-word',
    nav: 'SRT→Word',
    key: 's2w',
    group: 'Convert',
    icon: '<path d="M7 3.5h7l4 4V20.5H7z"/><path d="M14 3.5V8h4"/><path d="M9.5 12h5"/><path d="M9.5 16h5"/>',
    formats: '.srt → .docx',
    card: 'Turn SRT, VTT or ASS subtitles into a Word document.',
    mark: 'Word',
  },
  {
    slug: 'srt-to-excel',
    nav: 'SRT→Excel',
    key: 'xls',
    group: 'Convert',
    icon: '<path d="M4 4h16v16H4z"/><path d="M4 9h16"/><path d="M4 14h16"/><path d="M9 4v16"/>',
    formats: '.srt → .xlsx/.csv',
    card: 'Turn SRT, VTT or ASS subtitles into an Excel sheet or CSV.',
    mark: 'Excel',
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
    slug: 'txt-to-vtt',
    nav: 'TXT→VTT',
    key: 't2v',
    group: 'Convert',
    icon: '<path d="M4 6h10"/><path d="M4 11h6"/><path d="M14 14h6"/><path d="M14 18h6"/>',
    formats: '.txt → .vtt',
    card: 'Turn a script or transcript into WebVTT captions.',
    mark: 'VTT',
  },
  {
    slug: 'sub-to-srt',
    nav: 'SUB→SRT',
    key: 'sub',
    group: 'Convert',
    icon: '<path d="M3.5 5.5h8v13h-8z"/><path d="M5.5 9.5h4"/><circle cx="17.5" cy="15.5" r="4.5"/><path d="M17.5 13.5v2l1.5 1"/>',
    formats: '.sub → .srt',
    card: 'Turn MicroDVD frame numbers in a .sub file into SRT timestamps.',
    mark: 'SRT',
  },
  {
    slug: 'stl-to-srt',
    nav: 'STL→SRT',
    key: 'stl',
    group: 'Convert',
    icon: '<path d="M5 5h14v14H5z"/><path d="M8 9h8"/><path d="M8 13h5"/>',
    formats: 'EBU · Spruce',
    card: 'Turn EBU STL and Spruce STL subtitles into SRT.',
    mark: 'SRT',
  },
  {
    slug: 'sbv-to-srt',
    nav: 'SBV→SRT',
    key: 'sbv',
    group: 'Convert',
    icon: '<path d="M4 7h16v10H4z"/><path d="m10 9.5 5 2.5-5 2.5z"/>',
    formats: '.sbv → .srt/.vtt',
    card: 'Turn YouTube .sbv captions into SRT or VTT.',
    mark: 'SRT',
  },
  {
    slug: 'smi-to-srt',
    nav: 'SMI→SRT',
    key: 'smi',
    group: 'Convert',
    icon: '<path d="M4 6h16"/><path d="M7 6v12"/><path d="M17 6v12"/><path d="M7 12h10"/>',
    formats: '.smi → .srt',
    card: 'Turn SAMI .smi subtitles into SRT, and pick a language when the file has several.',
    mark: 'SRT',
  },
  {
    slug: 'ttml-to-srt',
    nav: 'TTML→SRT',
    key: 'ttml',
    group: 'Convert',
    icon: '<path d="M4 6h16"/><path d="M7 6v12"/><path d="M12 6v12"/><path d="M17 6v12"/>',
    formats: '.ttml → .srt/.vtt',
    card: 'Turn TTML and IMSC text subtitles into SRT or VTT.',
    mark: 'SRT',
  },
  {
    slug: 'dfxp-to-srt',
    nav: 'DFXP→SRT',
    key: 'dfxp',
    group: 'Convert',
    icon: '<path d="M5 5h6l2 2h6v12H5z"/><path d="M8 12h8"/><path d="M8 16h5"/>',
    formats: '.dfxp → .srt/.vtt',
    card: 'Turn older DFXP Timed Text files into SRT or VTT.',
    mark: 'SRT',
  },
  {
    slug: 'xml-to-srt',
    nav: 'XML→SRT',
    key: 'xml',
    group: 'Convert',
    icon: '<path d="M8 7 4 12l4 5"/><path d="M16 7l4 5-4 5"/><path d="M13 6l-2 12"/>',
    formats: 'TTML · YouTube XML',
    card: 'Turn TTML, DFXP or YouTube subtitle XML into SRT.',
    mark: 'SRT',
  },
  {
    slug: 'sup-to-srt',
    nav: 'SUP→SRT',
    key: 'sup',
    group: 'Convert',
    icon: '<path d="M4 7.5h16v11H4z"/><path d="M4 7.5 8.5 4h7L20 7.5"/><path d="M8 12h8"/><path d="M8 15.5h5"/>',
    formats: '.sup → .srt',
    card: 'Read Blu-ray picture subtitles into SRT text in your browser.',
    mark: 'SRT',
  },
  {
    slug: 'srt-editor',
    nav: 'Edit',
    key: 'edit',
    group: 'Text',
    icon: '<path d="M4 18.5h4l9.5-9.5-4-4L4 14.5z"/><path d="m12.5 6 4 4"/>',
    formats: 'SRT · VTT',
    card: 'Change subtitle text and times, add or delete lines, and mark problems.',
    mark: 'Editor',
  },
  {
    slug: 'srt-validator',
    nav: 'Check',
    key: 'val',
    group: 'Text',
    icon: '<path d="M5 4h14v16H5z"/><path d="m8 12 2.5 2.5L16 9"/>',
    formats: '.srt',
    card: 'Check an SRT file for bad times, overlaps, empty lines and encoding.',
    mark: 'Validator',
  },
  {
    slug: 'subtitle-cleaner',
    nav: 'Clean',
    key: 'clean',
    group: 'Text',
    icon: '<path d="M5 19h10"/><path d="M8 16 16 8l2 2-8 8H8z"/><path d="m14 6 3-3 2 2-3 3"/>',
    formats: 'SRT · VTT · ASS',
    card: 'Remove hearing-impaired tags, speaker names, music lines and formatting.',
    mark: 'Cleaner',
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
export const homeTrust = ['No upload', 'No sign-up', 'Free, 25 tools', 'Many files → one zip'] as const;

/** Labels of the tool grid on the home page and the 404 page. */
export const toolGridCopy = {
  heading: 'Pick a tool',
  open: 'Open tool →',
  groups: 'Timing · Text and encoding · Format conversion · Combining files',
} as const;

/**
 * Home problem cards (R8), in display order. PLACEHOLDER labels: Витя + Kirill must OK them before merge.
 * Six cards for the six fixing and converting tools; SRT to TXT, TXT to SRT, SUB to SRT, SBV to SRT and Merge subtitles have no card yet.
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
