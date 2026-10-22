import Tesseract from 'tesseract.js';
import { isOcrLanguage } from '../lib/ocr/languages';
import type { OcrIn, OcrOut } from '../lib/ocr/messages';
import { preprocessForOcr } from '../lib/ocr/preprocess';
import { cleanOcrText } from '../lib/ocr/text';
import { PgsError, parseSup, type PgsImage } from '../lib/subs/pgs';

type WorkerScope = {
  onmessage: ((event: MessageEvent<OcrIn>) => void) | null;
  postMessage(message: OcrOut, transfer?: Transferable[]): void;
};

const scope = globalThis as unknown as WorkerScope;

let cancel = false;
let busy = false;
let engine: { terminate: () => Promise<unknown> } | null = null;

function post(message: OcrOut, transfer?: Transferable[]): void {
  if (transfer) scope.postMessage(message, transfer);
  else scope.postMessage(message);
}

function loadLabel(status: string): string {
  if (status.includes('language')) return 'Loading the language data';
  if (status.includes('core')) return 'Loading the OCR engine';
  return 'Starting the OCR engine';
}

function failureMessage(error: unknown): string {
  if (error instanceof PgsError) return error.message;
  const message = error instanceof Error ? error.message : '';
  if (message.includes('fetch') || message.includes('Network') || message.includes('traineddata') || message.includes('Tesseract')) {
    return 'Could not load the OCR language data from this site. Check your connection and try again.';
  }
  return 'Could not read this SUP file.';
}

async function pngBytes(image: PgsImage): Promise<ArrayBuffer> {
  if (typeof OffscreenCanvas === 'undefined') {
    throw new Error('This browser cannot draw the subtitle pictures.');
  }
  const canvas = new OffscreenCanvas(image.width, image.height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser cannot draw the subtitle pictures.');
  context.putImageData(new ImageData(new Uint8ClampedArray(image.rgba), image.width, image.height), 0, 0);
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return blob.arrayBuffer();
}

function ocrCanvas(image: PgsImage): OffscreenCanvas {
  const canvas = new OffscreenCanvas(image.width, image.height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser cannot draw the subtitle pictures.');
  context.putImageData(new ImageData(new Uint8ClampedArray(image.rgba), image.width, image.height), 0, 0);
  return canvas;
}

async function run(data: Extract<OcrIn, { type: 'start' }>): Promise<void> {
  const cues = parseSup(new Uint8Array(data.bytes));
  if (cues.length === 0) {
    post({ type: 'error', message: 'No subtitles found in this SUP file.' });
    return;
  }

  if (cancel) {
    post({ type: 'cancelled', count: 0 });
    return;
  }

  let phase: 'load' | 'read' = 'load';
  let index = 0;
  const lang = isOcrLanguage(data.lang) ? data.lang : 'eng';
  // The OCR worker has to be a same-origin script so the wasm file resolves next to it.
  const tess = await Tesseract.createWorker(lang, Tesseract.OEM.LSTM_ONLY, {
    workerPath: data.workerPath,
    corePath: data.corePath,
    langPath: data.langPath,
    workerBlobURL: false,
    gzip: true,
    cacheMethod: 'write',
    legacyCore: false,
    legacyLang: false,
    errorHandler: () => undefined,
    logger: (message) => {
      if (cancel) return;
      const fraction = typeof message.progress === 'number' ? Math.min(1, Math.max(0, message.progress)) : 0;
      if (phase === 'load') {
        post({ type: 'progress', label: loadLabel(message.status), done: 0, total: cues.length, ratio: fraction });
        return;
      }
      post({
        type: 'progress',
        label: `Reading subtitle ${index + 1} of ${cues.length}`,
        done: index,
        total: cues.length,
        ratio: (index + fraction) / cues.length,
      });
    },
  });
  engine = tess;
  if (cancel) {
    await tess.terminate();
    engine = null;
    post({ type: 'cancelled', count: 0 });
    return;
  }

  await tess.setParameters({
    tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
    user_defined_dpi: '300',
  });
  phase = 'read';
  let finished = 0;
  for (index = 0; index < cues.length; index += 1) {
    if (cancel) {
      await tess.terminate();
      engine = null;
      post({ type: 'cancelled', count: finished });
      return;
    }
    const cue = cues[index];
    if (!cue) continue;
    const png = await pngBytes(cue.image);
    let text = '';
    try {
      const prepared = preprocessForOcr(cue.image);
      const result = await tess.recognize(ocrCanvas(prepared), {}, { text: true, blocks: false, hocr: false, tsv: false });
      text = cleanOcrText(result.data.text ?? '');
    } catch {
      if (cancel) {
        await tess.terminate();
        engine = null;
        post({ type: 'cancelled', count: finished });
        return;
      }
      text = '';
    }
    post(
      { type: 'cue', index, start: cue.start, end: cue.end, text, png },
      [png],
    );
    finished += 1;
  }
  await tess.terminate();
  engine = null;
  post({ type: 'done', count: finished });
}

scope.onmessage = (event: MessageEvent<OcrIn>) => {
  const data = event.data;
  if (!data || data.type === 'cancel') {
    cancel = true;
    void engine?.terminate();
    return;
  }
  if (data.type !== 'start' || busy) return;
  cancel = false;
  busy = true;
  void run(data)
    .catch((error: unknown) => {
      if (cancel) post({ type: 'cancelled', count: 0 });
      else post({ type: 'error', message: failureMessage(error) });
    })
    .finally(() => {
      busy = false;
      engine = null;
    });
};
