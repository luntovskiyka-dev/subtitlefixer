export const PREVIEW_CUE_LIMIT = 6;
export const PREVIEW_LINE_LIMIT = 12;

export type PreviewSlice = {
  preview: string;
  shown: number;
  total: number;
  caption: string;
};

export function previewCaption(shown: number, total: number, noun: 'cue' | 'line' = 'cue'): string {
  const word = total === 1 ? noun : `${noun}s`;
  if (total > shown) return `first ${shown} of ${total} ${noun}s`;
  return `${shown} ${word}`;
}

/** Keep the first cue blocks of an SRT or VTT document. The rest is not returned. */
export function slicePreviewCues(text: string, limit = PREVIEW_CUE_LIMIT): PreviewSlice {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let total = 0;
  let end = lines.length;
  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes('-->')) continue;
    total += 1;
    if (total !== limit + 1) continue;
    end = index;
    if (end > 0 && /^\d+$/.test(lines[end - 1].trim())) end -= 1;
    while (end > 0 && lines[end - 1].trim() === '') end -= 1;
  }
  const shown = Math.min(total, limit);
  let preview = lines.slice(0, end).join('\n').replace(/\n+$/, '');
  if (preview.length > 0) preview += '\n';
  return { preview, shown, total, caption: previewCaption(shown, total) };
}

/** Keep the first lines of decoded text. A trailing newline does not add a line. */
export function slicePreviewLines(text: string, limit = PREVIEW_LINE_LIMIT): PreviewSlice {
  let body = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (body.endsWith('\n')) body = body.slice(0, -1);
  if (body.length === 0) return { preview: '', shown: 0, total: 0, caption: previewCaption(0, 0, 'line') };
  const lines = body.split('\n');
  const total = lines.length;
  const shown = Math.min(total, limit);
  return {
    preview: lines.slice(0, shown).join('\n'),
    shown,
    total,
    caption: previewCaption(shown, total, 'line'),
  };
}
