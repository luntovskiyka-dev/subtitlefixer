import { unzipSync } from 'fflate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { encodeUtf8 } from './encoding';
import {
  downloadSubtitleFiles,
  downloadText,
  readFileBytes,
  readSubtitleFiles,
  textFileBlob,
  zipTexts,
} from './files';
import {
  downloadSubtitleFiles as downloadSubtitleFilesFromIndex,
  downloadText as downloadTextFromIndex,
  readFileBytes as readFileBytesFromIndex,
  readSubtitleFiles as readSubtitleFilesFromIndex,
  textFileBlob as textFileBlobFromIndex,
  zipTexts as zipTextsFromIndex,
} from './index';

const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];

function namedFile(name: string, text: string): File {
  const encoded = encodeUtf8(text, false);
  const copy = new Uint8Array(encoded.byteLength);
  copy.set(encoded);
  return new File([copy.buffer as ArrayBuffer], name);
}

async function blobBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

describe('readFileBytes', () => {
  it('reads a blob on the device', async () => {
    const bytes = encodeUtf8('local', false);
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    await expect(readFileBytes(new Blob([copy.buffer as ArrayBuffer]))).resolves.toEqual(bytes);
  });
});

describe('readSubtitleFiles', () => {
  it('decodes two in-memory blobs into two texts', async () => {
    const decoded = await readSubtitleFiles([
      namedFile('one.srt', 'First cue'),
      namedFile('two.vtt', 'Second cue'),
    ]);

    expect(decoded).toEqual([
      { name: 'one.srt', encoding: 'utf-8', text: 'First cue', bytes: encodeUtf8('First cue', false) },
      { name: 'two.vtt', encoding: 'utf-8', text: 'Second cue', bytes: encodeUtf8('Second cue', false) },
    ]);
  });
});

describe('zipTexts', () => {
  it('round-trips two files through fflate unzipSync', () => {
    const files = [
      { name: 'a.srt', text: '1\n00:00:01,000 --> 00:00:02,000\nПривет' },
      { name: 'b.vtt', text: 'WEBVTT\n\n00:00:03.000 --> 00:00:04.000\nHello' },
    ];

    const unzipped = unzipSync(zipTexts(files, false));

    expect(Object.keys(unzipped).sort()).toEqual(['a.srt', 'b.vtt']);
    for (const file of files) {
      const bytes = unzipped[file.name];
      expect(bytes).toBeDefined();
      expect(new TextDecoder().decode(bytes)).toBe(file.text);
    }
  });

  it('adds the BOM to every zip entry only when asked', () => {
    const files = [
      { name: 'a.srt', text: 'alpha' },
      { name: 'b.vtt', text: 'beta' },
    ];
    for (const bom of [true, false]) {
      const unzipped = unzipSync(zipTexts(files, bom));
      for (const file of files) {
        const head = [...(unzipped[file.name] ?? new Uint8Array()).slice(0, 3)];
        if (bom) expect(head).toEqual([0xef, 0xbb, 0xbf]);
        else expect(head).not.toEqual([0xef, 0xbb, 0xbf]);
      }
    }
  });
});

describe('download helper', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubDownload() {
    const blobs: Blob[] = [];
    const anchors: { download: string }[] = [];
    const revoked: string[] = [];

    vi.stubGlobal('URL', {
      createObjectURL(blob: Blob) {
        blobs.push(blob);
        return `blob:local-${blobs.length}`;
      },
      revokeObjectURL(url: string) {
        revoked.push(url);
      },
    });

    vi.stubGlobal('document', {
      body: {
        append(node: unknown) {
          return node;
        },
      },
      createElement(tag: string) {
        if (tag !== 'a') throw new Error(`Unexpected element ${tag}`);
        const anchor = {
          href: '',
          download: '',
          click() {
            anchors.push({ download: anchor.download });
          },
          remove() {},
        };
        return anchor;
      },
    });

    return { blobs, anchors, revoked };
  }

  it('downloads one string as text, not a zip', async () => {
    const fetchSpy = vi.fn(() => {
      throw new Error('fetch must not be called');
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { blobs, anchors, revoked } = stubDownload();
    const text = 'Cue stays on the device';

    downloadText('one.srt', text, false);

    expect(anchors).toEqual([{ download: 'one.srt' }]);
    expect(revoked).toEqual(['blob:local-1']);
    expect(blobs).toHaveLength(1);
    const blob = blobs[0];
    expect(blob).toBeDefined();
    expect(blob?.type).toBe('text/plain;charset=utf-8');

    const bytes = blob ? await blobBytes(blob) : new Uint8Array();
    expect([...bytes.slice(0, 4)]).not.toEqual(ZIP_MAGIC);
    expect(new TextDecoder().decode(bytes)).toBe(text);
    expect([...bytes]).toEqual([...encodeUtf8(text, false)]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('downloads two files as subtitles.zip', async () => {
    const { blobs, anchors } = stubDownload();
    const files = [
      { name: 'a.srt', text: 'alpha' },
      { name: 'b.ass', text: 'beta' },
    ];

    downloadSubtitleFiles(files, false);

    expect(anchors).toEqual([{ download: 'subtitles.zip' }]);
    const blob = blobs[0];
    expect(blob?.type).toBe('application/zip');
    const unzipped = unzipSync(blob ? await blobBytes(blob) : new Uint8Array());
    expect(new TextDecoder().decode(unzipped['a.srt'])).toBe('alpha');
    expect(new TextDecoder().decode(unzipped['b.ass'])).toBe('beta');
  });

  it('keeps a single-file save as text when using the batch helper', async () => {
    const { blobs, anchors } = stubDownload();
    downloadSubtitleFiles([{ name: 'only.srt', text: 'solo' }], true);

    expect(anchors).toEqual([{ download: 'only.srt' }]);
    const bytes = blobs[0] ? await blobBytes(blobs[0]) : new Uint8Array();
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect([...bytes.slice(0, 4)]).not.toEqual(ZIP_MAGIC);
    expect(new TextDecoder().decode(bytes)).toBe('solo');
  });

  it('adds no BOM to a single file when the box is not ticked', async () => {
    const { blobs } = stubDownload();
    downloadSubtitleFiles([{ name: 'plain.srt', text: 'solo' }], false);
    const bytes = blobs[0] ? await blobBytes(blobs[0]) : new Uint8Array();
    expect([...bytes.slice(0, 3)]).not.toEqual([0xef, 0xbb, 0xbf]);
    expect(new TextDecoder().decode(bytes)).toBe('solo');
  });
});

describe('textFileBlob', () => {
  it('matches download bytes for one string', async () => {
    const text = 'plain subtitle';
    const bytes = await blobBytes(textFileBlob(text, false));
    expect(new TextDecoder().decode(bytes)).toBe(text);
    expect([...bytes.slice(0, 4)]).not.toEqual(ZIP_MAGIC);
  });
});

describe('index re-exports', () => {
  it('exposes the file load and save helpers', () => {
    expect(readFileBytesFromIndex).toBe(readFileBytes);
    expect(readSubtitleFilesFromIndex).toBe(readSubtitleFiles);
    expect(downloadTextFromIndex).toBe(downloadText);
    expect(zipTextsFromIndex).toBe(zipTexts);
    expect(textFileBlobFromIndex).toBe(textFileBlob);
    expect(downloadSubtitleFilesFromIndex).toBe(downloadSubtitleFiles);
  });
});
