import { isLatinOcrLanguage, type OcrLanguage } from './languages';

/** Shown above the cue list when the OCR text does not match the chosen language. */
export const OCR_UNREADABLE_WARNING = 'Text looks unreadable — try another language';

const MIN_LETTERS = 8;
const MIN_TOKENS = 4;
const GARBAGE_SHARE = 0.5;
const NON_LATIN_SHARE = 0.35;
const LATIN_ON_RUSSIAN_SHARE = 0.6;
const CYRILLIC_ON_RUSSIAN_MAX = 0.25;
const IMPLAUSIBLE_SHARE = 0.45;
const MIN_IMPLAUSIBLE = 3;
const CONFIDENCE_MEAN = 40;
const CONFIDENCE_SHARE = 0.3;
const MIN_CONFIDENCE_CUES = 3;
const VOWEL = /[aeiouyäöüàáâãåèéêëìíîïòóôõùúûýÿæœ]/i;

const SHARED_WORDS =
  'ok okay tv hd cd dvd id mr ms dr pm uk us ai pc vs dj ii iii iv vi';

const ENGLISH_WORDS = `${SHARED_WORDS}
a i an the you he she it we they me him her us them my your his our their
this that these those is am are was were be been being have has had do does did
will would can could should may might must shall not no yes and or but if then
so because of to in on at for with from by as into about up out over after before
what who when where why how there here now just very too also please thank thanks
hello hi hey well oh ah um uh wait stop come here go going gone get got let know
see look want need like love good right left back time day night man men woman
people one two all some any more much many only even still again never always
maybe sorry told said work home going today should would could dont cant wont
im ive ill id its thats youre were theyre weve about something nothing really
friend friends help run fire look down yes no way please now come here told was
at work i am ok go to do be we me my he it is an as or if in on of up so hi by us
news ten new old big bad god mom dad son sir bye miss mrs bbc cnn hbo`;

const GERMAN_WORDS = `${SHARED_WORDS}
ich du er sie es wir ihr mich dich uns euch mir mein dein sein ihr
der die das den dem des ein eine einer einem einen und oder aber nicht kein keine
ist sind war waren bin bist hat haben hatte wird werden kann koennen muss muss
soll will ja nein danke bitte hallo gut hier dort jetzt dann wenn weil dass mit
von zu auf fuer nach vor ueber unter aus bei auch noch schon nur sehr wie was wer
wo warum heute morgen mann frau zeit tag nacht komm gehen sehen wissen
habe dir gesagt dass bei arbeit kannst warten geht sollten jetzt gehen danke sehr
gut im am zum zur na eh ob da wo um ab mal denn doch man eine keinen keinen`;

const SPANISH_WORDS = `${SHARED_WORDS}
el la los las un una uno y o pero no si de del al a en con por para que quien
como cuando donde esta estan soy eres es somos son yo tu el ella nosotros
hola gracias bien ahora aqui muy mas hay ser estar haber tengo tiene`;

const FRENCH_WORDS = `${SHARED_WORDS}
le la les un une des et ou mais non oui de du au a en avec pour que qui
comment quand ou est sont je tu il elle nous vous ils elles bonjour merci bien
maintenant ici tres plus pas ne ce cette ces mon ma mes ton ta`;

const PORTUGUESE_WORDS = `${SHARED_WORDS}
o a os as um uma e ou mas nao sim de do da em com por para que quem como
quando onde esta estao eu tu ele ela nos voces ola obrigado bem agora aqui muito`;

const ITALIAN_WORDS = `${SHARED_WORDS}
il lo la i gli le un una e o ma non si di del della a in con per che chi come
quando dove e sono io tu lui lei noi voi ciao grazie bene ora qui molto piu`;

const WORDS: Readonly<Record<OcrLanguage, Set<string>>> = {
  eng: wordSet(ENGLISH_WORDS),
  deu: wordSet(GERMAN_WORDS),
  spa: wordSet(SPANISH_WORDS),
  fra: wordSet(FRENCH_WORDS),
  por: wordSet(PORTUGUESE_WORDS),
  ita: wordSet(ITALIAN_WORDS),
  rus: wordSet(SHARED_WORDS),
};

function wordSet(words: string): Set<string> {
  return new Set(words.split(/\s+/).filter((word) => word !== ''));
}

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
 * True when the recognised text does not match the chosen language.
 * `confidence` is the Tesseract mean for each cue already read (0–100).
 * Short or empty text is left alone.
 */
export function ocrTextLooksUnreadable(
  text: string,
  language: OcrLanguage,
  confidence?: readonly number[],
): boolean {
  const tokens = text.split(/\s+/).filter((token) => token !== '');
  if (tokens.length >= MIN_TOKENS) {
    const garbage = tokens.filter(isGarbageToken).length;
    if (garbage / tokens.length >= GARBAGE_SHARE) return true;
  }

  const letters = [...text].filter((character) => /\p{L}/u.test(character));
  if (wrongScript(letters, language)) return true;
  if (latinLooksGarbled(tokens, letters.length, language, confidence)) return true;
  return false;
}

/** A token with no letters, or with letters in the minority, is not a word. */
function isGarbageToken(token: string): boolean {
  const characters = [...token];
  const letters = characters.filter((character) => /\p{L}/u.test(character)).length;
  if (letters === 0) return true;
  return letters / characters.length < 0.5;
}

function wrongScript(letters: string[], language: OcrLanguage): boolean {
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

/**
 * Chinese (and other non-Latin) pictures read with a Latin model come back as
 * Latin junk: short all-caps scraps ("FE", "AL", "RE") and consonant piles
 * ("EERBRHRMERS"). Real words, including shouted ones that are in the list, do not count.
 */
function latinLooksGarbled(
  tokens: readonly string[],
  letterCount: number,
  language: OcrLanguage,
  confidence: readonly number[] | undefined,
): boolean {
  if (!isLatinOcrLanguage(language)) return false;
  const words = tokens
    .map((token) => ({ raw: token, key: wordKey(token) }))
    .filter((token) => token.key !== '');
  if (words.length === 0) return false;

  const known = WORDS[language];
  const implausible = words.filter((token) => !known.has(token.key) && looksImplausible(token.raw, token.key));
  const share = implausible.length / words.length;
  const longCluster = implausible.some((token) => maxConsonantRun(token.key) >= 5);
  if (words.length >= MIN_TOKENS && implausible.length >= MIN_IMPLAUSIBLE && share >= IMPLAUSIBLE_SHARE) return true;
  if (longCluster && letterCount >= MIN_LETTERS && share >= 0.5) return true;
  return lowConfidence(confidence) && words.length >= MIN_TOKENS && share >= CONFIDENCE_SHARE;
}

function looksImplausible(raw: string, key: string): boolean {
  const letters = [...raw].filter((character) => /\p{L}/u.test(character));
  if (letters.length === 0) return false;
  if (maxConsonantRun(key) >= 5) return true;
  const allCaps = letters.length >= 2 && letters.every((character) => character !== character.toLowerCase());
  return allCaps && letters.length <= 4;
}

function wordKey(token: string): string {
  return token
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

function maxConsonantRun(word: string): number {
  let best = 0;
  let run = 0;
  for (const character of word) {
    if (!/\p{L}/u.test(character)) {
      run = 0;
      continue;
    }
    if (VOWEL.test(character)) run = 0;
    else {
      run += 1;
      if (run > best) best = run;
    }
  }
  return best;
}

function lowConfidence(confidence: readonly number[] | undefined): boolean {
  if (!confidence) return false;
  const known = confidence.filter((value) => Number.isFinite(value) && value >= 0 && value <= 100);
  if (known.length < MIN_CONFIDENCE_CUES) return false;
  const mean = known.reduce((sum, value) => sum + value, 0) / known.length;
  return mean < CONFIDENCE_MEAN;
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
