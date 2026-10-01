import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Compare the whitespace-normalized text of `.sf-copy` on every built page
 * with a baseline captured from main.
 *
 * The text is the element's text content (what `innerText` returns once every
 * `<details>` is open and author CSS is not applied). CSS markers such as step
 * numbers are not part of the content.
 */

const root = process.cwd();
const baselinePath = join(root, 'scripts/sf-copy-baseline.json');
const write = process.argv.includes('--write');

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (name.endsWith('.html')) files.push(path);
  }
  return files;
}

function decode(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, digits) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));
}

function extractCopy(html) {
  const marker = html.search(/class="sf-copy(?:\s|")/);
  if (marker < 0) return null;
  const start = html.lastIndexOf('<div', marker);
  if (start < 0) return null;
  let index = start;
  let depth = 0;
  while (index < html.length) {
    if (html.startsWith('<div', index)) {
      depth += 1;
      const end = html.indexOf('>', index);
      if (end < 0) return null;
      index = end + 1;
      continue;
    }
    if (html.startsWith('</div>', index)) {
      depth -= 1;
      index += 6;
      if (depth === 0) return html.slice(start, index);
      continue;
    }
    index += 1;
  }
  return null;
}

export function normalizedCopyText(fragment) {
  const without = fragment
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return decode(without).replace(/\s+/g, ' ').trim();
}

function collect(distDir) {
  const pages = {};
  for (const file of walk(distDir).sort()) {
    const html = readFileSync(file, 'utf8');
    const copy = extractCopy(html);
    const key = relative(distDir, file);
    pages[key] = copy === null ? null : normalizedCopyText(copy);
  }
  return pages;
}

const distDir = join(root, 'dist');
const pages = collect(distDir);

if (write) {
  writeFileSync(baselinePath, `${JSON.stringify(pages, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(pages).length} pages to ${baselinePath}`);
} else {
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const keys = [...new Set([...Object.keys(baseline), ...Object.keys(pages)])].sort();
  let failed = 0;
  for (const key of keys) {
    const before = baseline[key];
    const after = pages[key];
    if (before === after) {
      const note = after === null ? 'no .sf-copy' : `${after.length} chars`;
      console.log(`ok  ${key}  ${note}`);
      continue;
    }
    failed += 1;
    console.log(`DIFF ${key}`);
    console.log(`  baseline: ${before === undefined ? '(missing)' : before === null ? 'null' : `${before.length} chars`}`);
    console.log(`  current:  ${after === undefined ? '(missing)' : after === null ? 'null' : `${after.length} chars`}`);
  }
  if (failed > 0) {
    console.error(`${failed} page(s) differ`);
    process.exit(1);
  }
  console.log(`${keys.length} pages match`);
}
