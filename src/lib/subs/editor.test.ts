import { describe, expect, it } from 'vitest';
import {
  EDITOR_VIRTUAL_THRESHOLD,
  blankCueAfter,
  cueIssues,
  editorOutputName,
  formatIssueCount,
  issueLabel,
  mergeEditorCues,
  parseEditorTime,
  sortForDownload,
  splitEditorCue,
  visibleCueRange,
  type EditorCue,
} from './editor';
import { formatSrtTimestamp } from './time';

function cue(id: string, start: number, end: number, text: string): EditorCue {
  return { id, start, end, text };
}

describe('parseEditorTime', () => {
  it('reads comma and dot milliseconds', () => {
    expect(parseEditorTime('00:00:01,200')).toBe(1200);
    expect(parseEditorTime('00:00:01.2')).toBe(1200);
    expect(parseEditorTime('1:02:03,004')).toBe(3_723_004);
  });

  it('rejects a clock that is not hh:mm:ss', () => {
    expect(parseEditorTime('1:02')).toBeNull();
    expect(parseEditorTime('00:60:00,000')).toBeNull();
    expect(parseEditorTime('nope')).toBeNull();
  });
});

describe('cue checks', () => {
  it('marks a negative duration, an overlap, an empty line and a bad order', () => {
    const cues = [
      cue('a', 0, 1000, 'Ok'),
      cue('b', 1500, 1000, ''),
      cue('c', 800, 3000, 'Later'),
    ];
    const issues = cueIssues(cues);
    expect(issues.get('b')).toEqual(['negative', 'empty', 'overlap']);
    expect(issues.get('c')).toEqual(['order']);
    expect(issues.has('a')).toBe(false);
    expect(formatIssueCount(issues)).toBe('2 lines need attention.');
    expect(formatIssueCount(new Map([['only', ['empty']]]))).toBe('1 line needs attention.');
    expect(issueLabel('negative')).toBe('Ends before it starts');
  });
});

describe('edits', () => {
  it('splits times by character count, at least 1 ms each', () => {
    const cueA = cue('a', 0, 1000, 'abcd');
    const split = splitEditorCue(cueA, 1, () => 'b');
    expect(split?.[0]).toEqual({ id: 'a', start: 0, end: 250, text: 'a' });
    expect(split?.[1]).toEqual({ id: 'b', start: 250, end: 1000, text: 'bcd' });
    expect(splitEditorCue(cueA, 0, () => 'b')).toBeNull();
    expect(splitEditorCue(cue('c', 0, 1, 'ab'), 1, () => 'd')).toBeNull();
  });

  it('merges with the next cue', () => {
    expect(mergeEditorCues(cue('a', 100, 200, 'Hi'), cue('b', 300, 800, 'there'))).toEqual({
      id: 'a',
      start: 100,
      end: 800,
      text: 'Hi\nthere',
    });
  });

  it('adds a two-second blank cue after the current line', () => {
    expect(blankCueAfter(cue('a', 0, 1500, 'Hi'), 'b')).toEqual({ id: 'b', start: 1500, end: 3500, text: '' });
    expect(blankCueAfter(null, 'a').start).toBe(0);
  });

  it('sorts by start time on download and reports a changed order', () => {
    const cues = [cue('b', 2000, 3000, 'Second'), cue('a', 0, 1000, 'First')];
    const sorted = sortForDownload(cues);
    expect(sorted.orderChanged).toBe(true);
    expect(sorted.cues.map((item) => item.id)).toEqual(['a', 'b']);
    expect(formatSrtTimestamp(sorted.cues[0]?.start ?? 0)).toBe('00:00:00,000');
  });
});

describe('visibleCueRange', () => {
  it('renders every row up to 1000 cues', () => {
    expect(visibleCueRange(EDITOR_VIRTUAL_THRESHOLD, 5000, 400, 80)).toEqual({ start: 0, end: 1000 });
  });

  it('windows a longer list around the scroll position', () => {
    const range = visibleCueRange(5000, 8000, 400, 80);
    expect(range.start).toBeGreaterThan(0);
    expect(range.end).toBeLessThan(5000);
    expect(range.end - range.start).toBeLessThan(40);
  });
});

describe('editorOutputName', () => {
  it('keeps the original base name', () => {
    expect(editorOutputName('Movie.vtt', 'srt')).toBe('Movie.srt');
    expect(editorOutputName('subtitles.srt', 'vtt')).toBe('subtitles.vtt');
  });
});
