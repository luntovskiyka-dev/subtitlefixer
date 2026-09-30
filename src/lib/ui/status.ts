export type ToolPhase = 'empty' | 'loaded' | 'working' | 'error' | 'ready';

const EMPTY_COPY = {
  title: 'No file yet',
  detail: 'Add a subtitle file to start.',
} as const;

export function statusCopy(
  phase: ToolPhase,
  fileNames: readonly string[],
): { title: string; detail: string } {
  switch (phase) {
    case 'empty':
      return { title: EMPTY_COPY.title, detail: EMPTY_COPY.detail };
    case 'loaded':
      if (fileNames.length === 0) {
        return { title: EMPTY_COPY.title, detail: EMPTY_COPY.detail };
      }
      return {
        title: fileNames.length === 1 ? 'File ready' : 'Files ready',
        detail: fileNames.join(', '),
      };
    case 'working':
      return { title: 'Working', detail: 'Reading the file.' };
    case 'error':
      return { title: 'Something needs a fix', detail: 'Read the message below.' };
    case 'ready':
      return {
        title: 'Ready',
        detail: 'The download has started. The file stayed on this device.',
      };
    default: {
      const unreachable: never = phase;
      return unreachable;
    }
  }
}
