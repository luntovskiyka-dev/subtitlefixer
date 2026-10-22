import { zipSync } from 'fflate';
import { decodeBytes, encodeUtf8 } from './encoding';

/**
 * Load and save stay on the device. These helpers never send file contents over the network.
 */

export interface DecodedSubtitleFile {
  name: string;
  encoding: string;
  text: string;
  bytes: Uint8Array;
}

export interface SubtitleTextFile {
  name: string;
  text: string;
}

const ZIP_FILENAME = 'subtitles.zip';

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer as ArrayBuffer;
}

export async function readFileBytes(file: Blob): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

export async function readSubtitleFiles(
  files: Iterable<Blob & { name?: string }>,
): Promise<DecodedSubtitleFile[]> {
  const list = [...files];
  return Promise.all(
    list.map(async (file) => {
      const bytes = await readFileBytes(file);
      const decoded = await decodeBytes(bytes);
      return {
        name: file.name ?? '',
        encoding: decoded.encoding,
        text: decoded.text,
        bytes,
      };
    }),
  );
}

/** UTF-8 text file as a blob. One file stays text; it is not wrapped in a zip. */
export function textFileBlob(text: string, bom: boolean): Blob {
  return new Blob([toArrayBuffer(encodeUtf8(text, bom))], { type: 'text/plain;charset=utf-8' });
}

export function zipTexts(files: readonly SubtitleTextFile[], bom: boolean): Uint8Array {
  const entries: Record<string, Uint8Array> = {};
  for (const file of files) {
    entries[file.name] = encodeUtf8(file.text, bom);
  }
  return zipSync(entries);
}

export interface BinaryFile {
  name: string;
  bytes: Uint8Array;
}

/** Zip already-built files, such as .docx, without re-encoding them as text. */
export function zipBytes(files: readonly BinaryFile[]): Uint8Array {
  const entries: Record<string, Uint8Array> = {};
  for (const file of files) entries[file.name] = file.bytes;
  return zipSync(entries);
}

function triggerDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, text: string, bom: boolean): void {
  triggerDownload(filename, textFileBlob(text, bom));
}

export function downloadBytes(filename: string, bytes: Uint8Array, type: string): void {
  triggerDownload(filename, new Blob([toArrayBuffer(bytes)], { type }));
}

const DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** One .docx downloads as itself. Two or more become a single subtitles.zip. */
export function downloadDocxFiles(files: readonly BinaryFile[]): void {
  if (files.length === 0) return;
  if (files.length === 1) {
    const file = files[0];
    if (!file) return;
    downloadBytes(file.name, file.bytes, DOCX_TYPE);
    return;
  }
  triggerDownload(ZIP_FILENAME, new Blob([toArrayBuffer(zipBytes(files))], { type: 'application/zip' }));
}

/** One file downloads as text. Two or more become a single subtitles.zip. */
export function downloadSubtitleFiles(files: readonly SubtitleTextFile[], bom: boolean): void {
  if (files.length === 0) return;
  if (files.length === 1) {
    const file = files[0];
    if (!file) return;
    downloadText(file.name, file.text, bom);
    return;
  }
  const zipped = zipTexts(files, bom);
  triggerDownload(ZIP_FILENAME, new Blob([toArrayBuffer(zipped)], { type: 'application/zip' }));
}
