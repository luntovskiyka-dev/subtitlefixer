import { parse, serialize } from './index';
import type { Cue, ParseError } from './types';
import { vttCueTextToSrt } from './vtt';

/** VTT cues for an SRT file: tags cleaned as `vttCueTextToSrt` says; cues left with no text are dropped. */
function vttCuesForSrt(cues: readonly Cue[]): Cue[] {
  return cues.map((cue) => ({ ...cue, text: vttCueTextToSrt(cue.text) })).filter((cue) => cue.text !== '');
}

/**
 * Parse with `from`, then serialize those cues as `to`. VTT to SRT also cleans the cue text
 * (see `vttCueTextToSrt`). Parser errors are returned unchanged. Nothing is sent over the network.
 */
export function convertSubtitle(
  text: string,
  from: 'srt' | 'vtt',
  to: 'srt' | 'vtt',
): { text: string; errors: ParseError[] } {
  const parsed = parse(text, from);
  const cues = from === 'vtt' && to === 'srt' ? vttCuesForSrt(parsed.cues) : parsed.cues;
  return { text: serialize(cues, to), errors: parsed.errors };
}
