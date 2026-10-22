const KEY = 'sf-editor-handoff';

export type HandoffStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type EditorHandoff = {
  name: string;
  text: string;
};

/** One-shot SRT for the editor. The editor deletes it as soon as it reads it. */
export function saveEditorHandoff(store: HandoffStore, file: EditorHandoff): boolean {
  if (file.text.trim() === '') return false;
  const name = file.name.trim() || 'subtitles.srt';
  store.setItem(KEY, JSON.stringify({ name, text: file.text }));
  return true;
}

export function takeEditorHandoff(store: HandoffStore): EditorHandoff | null {
  const raw = store.getItem(KEY);
  if (raw === null) return null;
  store.removeItem(KEY);
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (!('name' in parsed) || !('text' in parsed)) return null;
    if (typeof parsed.name !== 'string' || typeof parsed.text !== 'string') return null;
    if (parsed.name.trim() === '' || parsed.text.trim() === '') return null;
    return { name: parsed.name, text: parsed.text };
  } catch {
    return null;
  }
}
