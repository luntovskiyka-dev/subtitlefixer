export const OCR_LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'spa', label: 'Spanish' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'por', label: 'Portuguese' },
  { code: 'ita', label: 'Italian' },
  { code: 'rus', label: 'Russian' },
] as const;

export type OcrLanguage = (typeof OCR_LANGUAGES)[number]['code'];

export function isOcrLanguage(value: string): value is OcrLanguage {
  return OCR_LANGUAGES.some((language) => language.code === value);
}
