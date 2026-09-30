/** Strip a leading BOM and turn CR/LF into LF. The input is already a JS string. */
export function normalizeNewlines(input: string): string {
  return input.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function isBlankInput(input: string): boolean {
  return normalizeNewlines(input).trim() === '';
}

/** Split a subtitle file into blocks separated by a blank line. */
export function splitBlocks(input: string): string[] {
  const normalized = normalizeNewlines(input);
  if (normalized.trim() === '') return [];

  const blocks: string[] = [];
  let current: string[] = [];

  const flush = () => {
    if (current.length === 0) return;
    blocks.push(current.join('\n'));
    current = [];
  };

  for (const line of normalized.split('\n')) {
    if (line.trim() === '') flush();
    else current.push(line);
  }
  flush();
  return blocks;
}

export function normalizeCueText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
