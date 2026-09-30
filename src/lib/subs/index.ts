import { parseAss, serializeAss, shiftAssText } from './ass';
import { parseSrt, serializeSrt } from './srt';
import type { Cue, ParseResult, SubtitleFormat } from './types';
import { parseVtt, serializeVtt } from './vtt';

export { FPS_23_976, scaleCues, scaleSubtitleFile, syncCues, syncSubtitleFile } from './drift';
export type { DriftFileResult, DriftResult } from './drift';

export type { Cue, ParseError, ParseResult, SubtitleFormat } from './types';
export { parseAss, serializeAss } from './ass';
export { candidateDecodings, decodeBytes, decodeWithLabel, encodeUtf8, repairMojibake } from './encoding';
export type { MojibakeVia } from './encoding';
export {
  downloadSubtitleFiles,
  downloadText,
  readFileBytes,
  readSubtitleFiles,
  textFileBlob,
  zipTexts,
} from './files';
export type { DecodedSubtitleFile, SubtitleTextFile } from './files';
export { assToSrt } from './assToSrt';
export { convertSubtitle } from './convert';
export { shiftCues } from './shift';
export type { ShiftResult } from './shift';
export { shiftAssText };
export { parseSrt, serializeSrt } from './srt';
export { parseVtt, serializeVtt } from './vtt';

export function parse(input: string, format: SubtitleFormat): ParseResult {
  switch (format) {
    case 'srt':
      return parseSrt(input);
    case 'vtt':
      return parseVtt(input);
    case 'ass':
      return parseAss(input);
    default: {
      const unreachable: never = format;
      throw new Error(`Unknown subtitle format: ${String(unreachable)}`);
    }
  }
}

export function serialize(cues: readonly Cue[], format: SubtitleFormat): string {
  switch (format) {
    case 'srt':
      return serializeSrt(cues);
    case 'vtt':
      return serializeVtt(cues);
    case 'ass':
      return serializeAss(cues);
    default: {
      const unreachable: never = format;
      throw new Error(`Unknown subtitle format: ${String(unreachable)}`);
    }
  }
}
