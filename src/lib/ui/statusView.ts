import { statusCopy, type ToolPhase } from './status';

const TITLE_CLASS = 'text-sm font-medium text-ink sf-rise';
const DETAIL_CLASS = 'break-all text-sm text-muted';
const ERROR_DETAIL_CLASS = 'break-all text-sm text-danger';
const CHECK_BOX_CLASS = 'inline-flex size-6 shrink-0 items-center justify-center rounded-sf bg-accent';
const CHECK_CLASS = 'size-4 text-accent-strong';
const READY_ROW_CLASS = 'flex items-center gap-2 sf-rise';
const CHECK_PATH = 'M5 13l4 4L19 7';

function paragraph(className: string, text: string): HTMLParagraphElement {
  const element = document.createElement('p');
  element.className = className;
  element.textContent = text;
  return element;
}

function checkMark(): HTMLSpanElement {
  const box = document.createElement('span');
  box.className = CHECK_BOX_CLASS;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', CHECK_CLASS);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', CHECK_PATH);
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(path);
  box.append(svg);
  return box;
}

/** Same element shape as ToolStatus.astro. Replaces the children of the status root. */
export function renderStatus(
  root: HTMLElement,
  phase: ToolPhase,
  fileNames: readonly string[],
): void {
  const copy = statusCopy(phase, fileNames);
  const detail = paragraph(phase === 'error' ? ERROR_DETAIL_CLASS : DETAIL_CLASS, copy.detail);
  const title = paragraph(TITLE_CLASS, copy.title);

  if (phase !== 'ready') {
    root.replaceChildren(title, detail);
    return;
  }

  const row = document.createElement('div');
  row.className = READY_ROW_CLASS;
  row.append(checkMark(), title);
  root.replaceChildren(row, detail);
}
