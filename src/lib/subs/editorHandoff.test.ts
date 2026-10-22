import { describe, expect, it } from 'vitest';
import { saveEditorHandoff, takeEditorHandoff, type HandoffStore } from './editorHandoff';

function memory(): HandoffStore {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

describe('editor handoff', () => {
  it('stores an SRT once and then deletes it', () => {
    const store = memory();
    expect(saveEditorHandoff(store, { name: ' movie.srt ', text: '1\n00:00:01,000 --> 00:00:02,000\nHi\n' })).toBe(true);
    expect(takeEditorHandoff(store)).toEqual({
      name: 'movie.srt',
      text: '1\n00:00:01,000 --> 00:00:02,000\nHi\n',
    });
    expect(takeEditorHandoff(store)).toBeNull();
  });

  it('drops an empty file and a broken payload', () => {
    const store = memory();
    expect(saveEditorHandoff(store, { name: 'a.srt', text: '   ' })).toBe(false);
    expect(takeEditorHandoff(store)).toBeNull();
    store.setItem('sf-editor-handoff', '{');
    expect(takeEditorHandoff(store)).toBeNull();
    expect(takeEditorHandoff(store)).toBeNull();
  });
});
