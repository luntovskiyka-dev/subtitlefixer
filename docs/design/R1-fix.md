# R1 follow-up (colours and fonts only, no layout changes)

## 1. `brand` is a fill, never a text/outline colour (blocker)
In direction B --sf-brand is a fill only (dark: #4B3BE6 on #15142B = 2.63:1; light: #5B4BFF on #E6E1FF = 4.25:1). Fix all existing usages:
1. `grep -rn 'text-brand\b' src`: replace text-brand with text-brand-hover, and hover:text-brand-hover with hover:text-ink (Header, Footer, Button ghost, any tool component).
2. `grep -rn 'outline-brand\b' src`: replace focus-visible:outline-brand with focus-visible:outline-brand-hover. In global.css set `.sf-copy a { color: var(--sf-brand-hover) }`, `.sf-copy a:hover { color: var(--sf-text) }`, `.sf-copy a:focus-visible { outline-color: var(--sf-brand-hover) }`.
3. Button.astro: primary = 'bg-brand text-on-brand hover:bg-[var(--sf-dropzone)]' (do NOT use text-bg on brand, and do NOT use hover:bg-brand-hover — in dark brand-hover is the light link colour #A79EFF). secondary = 'bg-lilac text-ink hover:text-brand-hover'. ghost = 'bg-transparent text-brand-hover hover:text-ink'.
4. Badge.astro: 'bg-lilac text-ink'.
5. Dropzone.astro: border-brand -> border-brand-hover; data-[state=hover]/hover idle border -> border-edge.
6. contrast.test.ts: add LIGHT 'on-brand on dropzone'; DARK 'brand-hover on lilac', 'text on lilac'; NON_TEXT 'brand-hover on bg' (focus ring / dropzone border). Add src/lib/ui/classUsage.test.ts that reads src/components/**/*.astro and fails on /\b(text|outline|border)-brand\b(?!-)/ and /\btext-bg\b/.

## 2. Bricolage is preloaded but unused
Bricolage 800 is preloaded in Base.astro but nothing uses var(--sf-display). Apply the display face now (font change only, keep current sizes; R3/R5 set sizes): on every <h1> (index.astro, ToolPage.astro, 404.astro, guides/[slug].astro, about/privacy templates, Styleguide.astro) replace `font-semibold` with `font-display font-extrabold`; in global.css `.sf-copy h2` set `font-family: var(--sf-display); font-weight: 800;`.

## 3. Missing dark-theme overrides
In src/styles/tokens.css inside @media (prefers-color-scheme: dark) add:
  --sf-line: #34315C;        /* decorative hairline */
  --sf-accent-soft: #5A2C24;
  --sf-teal-soft: #123C3A;
Mirror the same values in DARK in src/lib/ui/contrast.ts (line, accentSoft, tealSoft) and add DARK_PAIRS 'text on accent-soft', 'text on teal-soft', 'muted on accent-soft' (>= 4.5). Add the three rows to docs/B-tokens.md §2.

## 4. docs/PLAN.md
Task 5: replace "(D4 Indigo + Mint)" with "(direction B, see docs/B-tokens.md)".

## Done when
- Lighthouse accessibility = 100 on /shift-subtitles.
- With prefers-color-scheme: dark, the header logo, footer links, content links and all Button variants are >= 4.5:1; header/footer hairlines are dark, not cream.
- document.fonts reports "Bricolage Grotesque 800" loaded on / and /shift-subtitles; no "preloaded but not used" warning; CLS < 0.02.
- npm test and npm run build are green; commit is on main.
