import { isLatinOcrLanguage, type OcrLanguage } from './languages';

/** Shown above the cue list when the OCR text does not match the chosen language. */
export const OCR_UNREADABLE_WARNING = 'Text looks unreadable — try another language';

const MIN_LETTERS = 8;
const MIN_TOKENS = 4;
const GARBAGE_SHARE = 0.5;
const NON_LATIN_SHARE = 0.35;
const LATIN_ON_RUSSIAN_SHARE = 0.6;
const CYRILLIC_ON_RUSSIAN_MAX = 0.25;

/** Collapse OCR whitespace and drop blank lines. Latin languages also turn a lone "|" into "I". */
export function cleanOcrText(text: string, language: OcrLanguage | string = 'eng'): string {
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line !== '')
    .join('\n');
  return isLatinOcrLanguage(language) ? fixLatinPipe(cleaned) : cleaned;
}

/**
 * True when the recognised text is mostly the wrong script, or mostly symbols.
 * Short or empty text is left alone: there is not enough to judge.
 */
export function ocrTextLooksUnreadable(text: string, language: OcrLanguage): boolean {
  const tokens = text.split(/\s+/).filter((token) => token !== '');
  if (tokens.length >= MIN_TOKENS) {
    const garbage = tokens.filter(isGarbageToken).length;
    if (garbage / tokens.length >= GARBAGE_SHARE) return true;
  }

  const letters = [...text].filter((character) => /\p{L}/u.test(character));
  if (letters.length < MIN_LETTERS) return false;

  if (isLatinOcrLanguage(language)) {
    const nonLatin = letters.filter((character) => !/\p{Script=Latin}/u.test(character)).length;
    return nonLatin / letters.length >= NON_LATIN_SHARE;
  }

  if (language === 'rus') {
    const latin = letters.filter((character) => /\p{Script=Latin}/u.test(character)).length;
    const cyrillic = letters.filter((character) => /\p{Script=Cyrillic}/u.test(character)).length;
    return latin / letters.length >= LATIN_ON_RUSSIAN_SHARE && cyrillic / letters.length < CYRILLIC_ON_RUSSIAN_MAX;
  }

  return false;
}

/** A token with no letters, or with letters in the minority, is not a word. */
function isGarbageToken(token: string): boolean {
  const characters = [...token];
  const letters = characters.filter((character) => /\p{L}/u.test(character)).length;
  if (letters === 0) return true;
  return letters / characters.length < 0.5;
}

/**
 * Tesseract often reads a capital I as a bar.
 * A bar that stands alone, or the contractions |'m |'ll |'d |'ve, becomes I.
 * A bar inside a word, such as a|b or ||, stays.
 */
function fixLatinPipe(text: string): string {
  const contractions = text.replace(/\|['’](ll|ve|m|d)\b/gi, (_match, suffix: string) => `I'${suffix}`);
  return contractions.replace(/(^|[^\p{L}\p{N}|])\|(?=$|[^\p{L}\p{N}|])/gmu, '$1I');
}
