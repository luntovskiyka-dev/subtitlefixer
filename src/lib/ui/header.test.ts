import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { toolGridCopy, toolGroups, toolMeta } from '../../data/tools';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const header = read('src/components/Header.astro');
const css = read('src/styles/global.css');

/** The CSS rule for `selector`, from its opening brace to its closing brace. */
function rule(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf('}', start));
}

describe('header', () => {
  it('is one row: logo, the Tools menu, then Ko-fi; the pill row is gone', () => {
    const logo = header.indexOf('<Logo current=');
    const menu = header.indexOf('<details class="sf-menu" data-tools-menu>');
    const kofi = header.indexOf('href={KOFI_URL}');
    expect(logo).toBeGreaterThan(0);
    expect(menu).toBeGreaterThan(logo);
    expect(kofi).toBeGreaterThan(menu);
    expect(header.match(/aria-label="Tools"/g) ?? []).toHaveLength(1);
    expect(header).not.toContain('overflow-x-auto');
    expect(header).not.toContain('sf-nav-');
    expect(css).not.toContain('.sf-nav-');
    expect(header).toContain('ml-auto inline-flex shrink-0');
    expect(header).not.toContain('No upload · Free');
    expect(header).not.toMatch(/\bmd:(?:flex|hidden)\b/);
  });
});

describe('header Tools menu', () => {
  it('is a details/summary disclosure, so it opens and closes without JavaScript', () => {
    expect(header).toContain('<summary class="sf-menu-button">');
    expect(header).toContain('<span class="sf-menu-label">Tools</span>');
    expect(header).toContain('<div class="sf-menu-panel sf-rise" data-tools-panel>');
    expect(header).not.toMatch(/role="menu/);
    expect(header).toContain('<button type="button" class="sf-menu-close" data-tools-close hidden>Close menu</button>');
  });

  it('builds the panel from the tool data: groups, icon tiles, names, formats and the current page', () => {
    expect(header).toContain("import { toolGroups, toolMeta, tools } from '../data/tools';");
    expect(header).toContain('items: toolMeta.filter((tool) => tool.group === group),');
    expect(header).toContain('<ToolIcon name={tool.key} size="s" />');
    expect(header).toContain('<span class="sf-menu-name">{tools[tool.slug]}</span>');
    expect(header).toContain('<span class="sf-menu-formats">{tool.formats}</span>');
    expect(header).toContain("aria-current={current === `/${tool.slug}` ? 'page' : undefined}");
    expect(header).toContain('class={`sf-menu-item sf-card-${tool.key}`}');
    expect(header).not.toMatch(/href="\/[a-z]/);
  });

  it('has a group for every tool, named as on the home page', () => {
    const groups = toolGroups.map((item) => item.group);
    expect(new Set(groups).size).toBe(groups.length);
    for (const tool of toolMeta) expect(groups).toContain(tool.group);
    expect(toolGroups.map((item) => item.label).join(' · ')).toBe(toolGridCopy.groups);
  });

  it('adds Esc, click outside, focus return and aria-expanded with one small inline script', () => {
    expect(header.match(/<script/g) ?? []).toHaveLength(1);
    expect(header).toContain('<script is:inline>');
    expect(header).not.toMatch(/<script[^>]+src=/);
    expect(header).toContain("button.setAttribute('aria-expanded', menu.open ? 'true' : 'false')");
    expect(header).toContain("menu.addEventListener('toggle', sync);");
    expect(header).toContain("event.key === 'Escape' && menu.open");
    expect(header).toContain('if (refocus) button.focus();');
    expect(header).toContain("document.addEventListener('click', (event) => {");
    expect(header).toContain('close.hidden = false;');
  });

  it('uses the site focus ring on the button, the tools and the close button', () => {
    for (const selector of ['.sf-menu-button:focus-visible', '.sf-menu-item:focus-visible', '.sf-menu-close:focus-visible']) {
      expect(rule(selector)).toContain('outline: 2px solid var(--sf-brand-hover);');
    }
  });

  it('drops down inside the 1180px row on wide screens and is a full-width scrolling sheet on phones', () => {
    expect(rule('.sf-menu-panel')).toContain('max-width: calc(100% - 48px);');
    expect(header).toContain('relative mx-auto flex min-h-[60px] w-full max-w-[1180px]');
    const phone = css.slice(css.indexOf('@media (max-width: 639.98px) {\n  .sf-menu-button {'));
    expect(phone).toContain('max-height: calc(100dvh - 60px);');
    expect(phone).toContain('overflow-y: auto;');
    expect(rule('.sf-menu-item[aria-current=\'page\']')).toContain('border-color: var(--sf-edge);');
  });
});
