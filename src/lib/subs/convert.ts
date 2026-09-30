import { parse, serialize } from './index';
import type { ParseError } from './types';

/**
 * Parse with `from`, then serialize those cues as `to`.
 * Parser errors are returned unchanged. Nothing is sent over the network.
 */
export function convertSubtitle(
  text: string,
  from: 'srt' | 'vtt',
  to: 'srt' | 'vtt',
): { text: string; errors: ParseError[] } {
  const parsed = parse(text, from);
  return { text: serialize(parsed.cues, to), errors: parsed.errors };
}
