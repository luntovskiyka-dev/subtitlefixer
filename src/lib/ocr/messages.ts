export type OcrStart = {
  type: 'start';
  bytes: ArrayBuffer;
  lang: string;
  workerPath: string;
  corePath: string;
  langPath: string;
};

export type OcrIn = OcrStart | { type: 'cancel' };

export type OcrProgress = {
  type: 'progress';
  label: string;
  done: number;
  total: number;
  ratio: number;
};

export type OcrCue = {
  type: 'cue';
  index: number;
  start: number;
  end: number;
  text: string;
  png: ArrayBuffer;
};

export type OcrOut =
  | OcrProgress
  | OcrCue
  | { type: 'done'; count: number }
  | { type: 'cancelled'; count: number }
  | { type: 'error'; message: string };
