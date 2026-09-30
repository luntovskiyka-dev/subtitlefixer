/** One subtitle cue. `start` and `end` are milliseconds. */
export type Cue = {
  start: number;
  end: number;
  text: string;
  style?: string;
};

export type SubtitleFormat = 'srt' | 'vtt' | 'ass';

/** A block that could not be turned into a cue. Neighboring blocks are kept. */
export type ParseError = {
  /** 1-based block index, or source line number for ASS/SSA Dialogue. */
  block: number;
  message: string;
};

export type ParseResult = {
  cues: Cue[];
  errors: ParseError[];
};
