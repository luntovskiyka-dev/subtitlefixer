/** Same-origin Tesseract files. The worker, wasm and language data are not loaded from a CDN. */
export const OCR_WORKER_PATH = '/ocr/worker.min.js';
export const OCR_CORE_PATH = '/ocr';
export const OCR_LANG_PATH = '/ocr/lang';

export function ocrAssetUrl(origin: string, path: string): string {
  return new URL(path, origin).href;
}
