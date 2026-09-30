import { describe, expect, it } from 'vitest';
import { statusCopy } from './status';

describe('statusCopy', () => {
  it('describes the empty phase', () => {
    expect(statusCopy('empty', [])).toEqual({
      title: 'No file yet',
      detail: 'Add a subtitle file to start.',
    });
  });

  it('describes one loaded file', () => {
    expect(statusCopy('loaded', ['episode.srt'])).toEqual({
      title: 'File ready',
      detail: 'episode.srt',
    });
  });

  it('describes three loaded files', () => {
    expect(statusCopy('loaded', ['a.srt', 'b.vtt', 'c.ass'])).toEqual({
      title: 'Files ready',
      detail: 'a.srt, b.vtt, c.ass',
    });
  });

  it('uses the empty copy when loaded with no names', () => {
    expect(statusCopy('loaded', [])).toEqual({
      title: 'No file yet',
      detail: 'Add a subtitle file to start.',
    });
  });

  it('describes the working phase', () => {
    expect(statusCopy('working', ['episode.srt'])).toEqual({
      title: 'Working',
      detail: 'Reading the file.',
    });
  });

  it('describes the error phase', () => {
    expect(statusCopy('error', ['episode.srt'])).toEqual({
      title: 'Something needs a fix',
      detail: 'Read the message below.',
    });
  });

  it('describes the ready phase', () => {
    expect(statusCopy('ready', ['a.srt', 'b.vtt', 'c.ass'])).toEqual({
      title: 'Ready',
      detail: 'The download has started. The file stayed on this device.',
    });
  });
});
