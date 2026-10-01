## R8: Home problem cards ("What's wrong with your subtitles?") + tool-grid polish
**Goal:** Kirill's feedback: the tool pages look great, but the home page is still mostly text. R6 adds the indigo hero and the "Pick a tool" grid. R8 adds a row of 6 **problem cards** between the hero and the grid. Each card names a symptom, links to the matching tool and has a tiny CSS illustration that plays the fix on hover and on keyboard focus (the subtitle slides into sync, garbled text turns into clean text, `,` becomes `.`, and so on). The R6 tool grid stays as it is, plus one small touch: the tilted icon tile straightens on hover/focus. 0 JS.

**Depends on:** R6 on `main` (done, last fix `073428f`) and R7 (done, `4078735`). If the live hero differs slightly from the mockup PNGs (after `073428f`), keep the live hero as it is; R8 only adds the problem cards. Check before starting: `src/components/ToolGrid.astro`, `src/components/ToolCard.astro` and `.sf-hero` / `.sf-tools-title` in `src/styles/global.css` must exist, and the dark block of `tokens.css` must define `--c-shift … --c-ass` (commit `d1e0324`). If any of them is missing, stop and report. Don't rebuild R6 here.

**References.** Copy these from `sf-redesign/home-v2/` into `docs/design/` in the first commit. Docs only, no code imports them.
- `home-v2-1440-light.png`, `home-v2-390-light.png`, `home-v2-1440-dark.png`: full page. The dashed "MOCKUP NOTE" boxes are annotations, not UI. Don't build them.
- `home-v2-problems-hover-light.png`, `home-v2-problems-hover-dark.png`: each card at rest (left) and on hover/focus (right).
- `home-v2-mockup.html` (= `mockup.html`): live header, footer and home text, plus the R6 CSS and the R8 CSS. Open it in a browser to try the hover and Tab states.
- `home-v2-r8.css` (= `r8.css`): **the exact CSS for this task.** Paste it as is (see Scope).

### Scope
- **Check first, `src/lib/ui/contrast.ts` (`DARK` only).** Commit `df0842b` (R6) should already have restored the dark tile values. Verify that `DARK` holds exactly `tDrift: '#1B1A3A', tDriftBg: '#2EC4B6', tEnc: '#1B1A3A', tEncBg: '#6EE7B7', tS2v: '#1B1A3A', tS2vBg: '#FF7A59', tV2s: '#1B1A3A', tV2sBg: '#FF8FC0', tAss: '#1B1A3A', tAssBg: '#7CC8FF'`. If they match, leave the file alone; if not, restore exactly these 10 values and nothing else. If there is no `checkPairs('tool tiles dark', DARK, TOOL_PAIRS);` next to the light call, add it (test-only, no runtime change).
- **`src/data/tools.ts`**: append the following. Don't change `tools`, `toolMeta`, `homeTrust` or `toolGridCopy`.
  ```ts
  /** Home problem cards (R8), in display order. PLACEHOLDER labels: Витя + Kirill must OK them before merge. */
  export const homeProblems = [
    { key: 'shift', label: 'Always early or late' },
    { key: 'drift', label: 'Gets worse over time' },
    { key: 'enc', label: 'Weird characters like Ã©' },
    { key: 's2v', label: 'Need VTT for the web' },
    { key: 'v2s', label: 'Need SRT for my TV' },
    { key: 'ass', label: "Styled .ass won't play" },
  ] as const satisfies readonly { key: ToolKey; label: string }[];

  export const problemCopy = { heading: 'What’s wrong with your subtitles?' } as const;
  ```
  The literal characters `Ã©` and `’` (U+2019) go in the file as UTF-8, not as HTML entities.
- **New `src/components/ProblemCards.astro`**: one `<section class="sf-problems" aria-labelledby="whats-wrong">` with `<h2 id="whats-wrong" class="sf-tools-title">{problemCopy.heading}</h2>` (reuses the R6 heading style) and `<ul class="sf-problem-grid">`. Each `<li>` holds **one** link:
  ```astro
  <a href={`/${tool.slug}`} class={`sf-problem sf-problem-${p.key}`}>
    <ProblemIllustration name={p.key} />
    <span class="sf-problem-body">
      <span class="sf-problem-label">{p.label}</span>
      <span class="sf-problem-tool">{tools[tool.slug]} <span class="sf-problem-go" aria-hidden="true">→</span></span>
    </span>
  </a>
  ```
  Look `tool` up with `toolMeta.find((t) => t.key === p.key)` and throw if it is missing. The tool name comes from `tools[slug]`, the same strings the footer and home text use. Labels are `<span>`s, not headings, so the outline stays H1 → H2 "What's wrong…" → H2 "Pick a tool" → 6 × H3 → content. The accessible name is "label + tool name" (for example "Always early or late Shift subtitles"). Don't add `title` or `aria-label`.
- **New `src/components/ProblemIllustration.astro`** (`name: ToolKey`): `<span class={`sf-ill sf-ill-${name}`} aria-hidden="true">` + the static markup below, chosen by `name`. Copy it exactly; the CSS selectors depend on the structure. Write `<i></i>`, not `<i />`. In Astro, `{` starts an expression, so the ASS tag must be written as `{'{\\an8}'}`.
  - `shift`: `<span class="sf-ill-head"></span><span class="sf-ill-wave"><i></i>×7</span><span class="sf-ill-chip">Hello?</span>`
  - `drift`: 3 × `<span class="sf-ill-col sf-ill-col-N"><span class="sf-ill-head"></span><span class="sf-ill-wave"><i></i>×4</span><span class="sf-ill-chip"></span></span>` with N = 1, 2, 3
  - `enc`: `<span class="sf-ill-chip"><span class="sf-swap"><span class="sf-ill-bad">cafÃ© dÃ©jÃ</span><span>café déjà</span></span></span><span class="sf-ill-file"><span class="sf-swap"><span class="sf-ill-bad">???</span><span>UTF-8</span></span></span>`
  - `s2v`: `<span class="sf-ill-file"><span class="sf-swap"><span>.srt</span><span>.vtt</span></span></span><span class="sf-ill-code sf-ill-code-1"><span class="sf-ill-hdr">WEBVTT</span></span><span class="sf-ill-code sf-ill-code-2">00:00:01<span class="sf-swap sf-ill-sep"><span class="sf-ill-bad">,</span><span class="sf-ill-good">.</span></span>500</span>`
  - `v2s`: the same as `s2v`, with `.vtt`/`.srt` swapped and `.` → `,` (bad = `.`, good = `,`)
  - `ass`: `<span class="sf-ill-file"><span class="sf-swap"><span>.ass</span><span>.srt</span></span></span><span class="sf-ill-chip"><span class="sf-ill-tag">{'{\\an8}'}</span>Run!</span>`
  (`×7` means repeat the element 7 times. The rendered HTML must equal `mockup.html`, which is the source of truth.)
  The illustrations match what the code really does: `assToSrt.ts` strips `{\an8}` and every other override except `\i`/`\b`. The ASS card deliberately shows no italics claim.
- **`src/pages/index.astro`**: import `ProblemCards` and put `<ProblemCards />` between the closing `</section>` of `.sf-hero` and `<ToolGrid />`. Nothing else changes: the Base props, the hero, `<ToolGrid />` and `<div class="sf-copy mt-16"><Content /></div>` stay as they are. 404 stays as in R6 (grid only, no problem cards).
- **`src/styles/global.css`**: append `docs/design/home-v2-r8.css` verbatim at the very end, after the R6 block (no `<style>` in `.astro`). It contains:
  - `.sf-problem*` (white card, 2.5px `--sf-edge`, radius 24, `--sf-shadow-sm` → `--sf-shadow` on hover, same press and focus ring as `.sf-card`)
  - `.sf-ill*` (120×80 "screen" in the tool wash `--c-*`, 2px edge, radius 14, DM Mono 11px, no ligatures)
  - the six hover/focus states, keyed on `.sf-problem:is(:hover, :focus-visible)`
  - the R6 icon nudge (`.sf-card:is(:hover, :focus-visible) > .sf-card-top > :first-child { rotate: 0deg }`)
  - grid: 1 column below 640px, 2 columns 640–1023px, 3 × 2 from 1024px

  Don't add a reduced-motion block: the existing global `prefers-reduced-motion` rule already sets `transition: none !important`, so the cards jump straight to the fixed state.
- **Tests**
  - `src/lib/ui/contrast.test.ts`: add `PROBLEM_PAIRS`, checked in `LIGHT` and `DARK`. Text pairs (4.5): `text/surface`, `accentInk/surface`, `text/mint`, `text/c*` (all 6), `accentInk/cS2v`, `accentInk/cV2s`, `success/cS2v`, `success/cV2s`, `muted/cV2s`. Non-text pairs (3): `edge/c*` (all 6), `accentInk/cShift`, `accentInk/cDrift` (playhead lines), `edge/surface`, `brandHover/bg`. Expected lowest ratios: light `accentInk/cShift` 4.51, `accentInk/cV2s` 4.66, `accentInk/cS2v` 4.69; dark `edge/cDrift` and `edge/cEnc` 3.75.
  - New `src/lib/ui/problemCards.test.ts`:
    - `homeProblems` has 6 entries.
    - The keys are unique and equal `toolMeta.map(t => t.key)` in order.
    - Every label is ≤ 28 characters.
    - `ProblemCards.astro` has exactly one `<a` and contains `ProblemIllustration`.
    - `ProblemIllustration.astro` contains `aria-hidden="true"`.
    - Neither component matches `/#[0-9A-Fa-f]{3,8}\b/` or `/<style|<script|client:/`.
    - In `index.astro`, `<ProblemCards />` comes before `<ToolGrid />`, and `<div class="sf-copy mt-16">` is still present.

### Constraints
1. **No URL, SEO or JSON-LD changes.** Same list as the global constraints. Before the first edit, build `main` and copy `dist` to `/tmp/sf-before`. After the change, build again and diff every `dist/**/*.html` against `/tmp/sf-before`: the `<head>` (title, meta, canonical, OG, hreflang), every `application/ld+json` block and `sitemap-*.xml` must be byte-identical. Write a small node script for this diff and print `heads, JSON-LD and sitemaps identical`. Titles, descriptions, canonicals, OG, the H1 "Fix Subtitles Online" and the FAQPage JSON-LD stay byte-identical. No trailing slashes.
2. **Витя's text untouched.** No edits in `src/content/**`. The problem cards sit **outside** `.sf-copy` and use no class starting with `sf-copy`. `node scripts/check-sf-copy-text.mjs` → `pages match`. Never run it with `--write`.
3. **0 JS.** No `<script>`, no `client:*`, no new npm dependencies, no new fonts or `@font-face`. All motion is CSS `transition` on `:hover` / `:focus-visible`, and there are no `@keyframes` loops. `dist/index.html` keeps 0 non-JSON-LD `<script>` tags.
4. **Tokens only.** No hex outside `tokens.css` / `contrast.ts` (where the DARK fix lives). `grep -nE '#[0-9A-Fa-f]{3,8}\b'` on the R8 part of `global.css` and on both new components → nothing.
5. **No `<style>` blocks in `.astro`** (Astro would inline them into `<head>` and break the head check). Don't edit `Base.astro`, `Header.astro`, `Footer.astro`, `ToolCard.astro`, `ToolGrid.astro`, `ToolIcon.astro`, `Mark.astro`, `astro.config.mjs`, `src/lib/seo/**`, `src/lib/subs/**`, `public/`, `worker/`, `wrangler.toml`, Markdown plugins or `scripts/`.
6. **Accessibility.**
   - Every card is one `<a>` with a visible 3px `--sf-brand-hover` focus ring (offset 3).
   - Focus plays the same illustration state as hover.
   - Illustrations are `aria-hidden`.
   - All text and lines pass the pairs above in both themes.
   - Tap target ≥ 44px (the cards are about 104px tall).
   - On touch devices without hover, the card simply shows the "broken" state and a tap navigates. That is acceptable.
7. **Copy.** The 7 new strings (heading + 6 labels) are **placeholder copy**, so put them in the PR description for Витя and Kirill. The illustration strings (`Hello?`, `cafÃ© dÃ©jÃ` → `café déjà`, `???` → `UTF-8`, `WEBVTT`, `00:00:01,500`, `{\an8}Run!`, `.srt/.vtt/.ass`) are decorative and `aria-hidden`, but list them too. The illustrations use only latin text on purpose: the fonts are latin-subset, so a Cyrillic "при" would render in the fallback font.
8. One PR / commit series. `npm test` and `npm run build` pass before every commit. Stage files by explicit path.

### Done when
- `/` renders hero → "What's wrong with your subtitles?" (6 cards) → "Pick a tool" (R6 grid) → the unchanged home text, matching `home-v2-1440-light.png`, `home-v2-390-light.png` and `home-v2-1440-dark.png` (minus the mockup notes).
- **1440×900:** the hero, all 6 problem cards (3 × 2) and the "Pick a tool" heading are above the fold, and the first tool-card row starts above it. This replaces R6's "second card row starts above the fold" check, which no longer applies once the problem row is in.
- **390×844:** the first problem card is in the first screen. Cards are 1 column, and there is no horizontal scroll at 360, 390, 820 or 1440 (`scrollWidth === clientWidth`).
- Hover and Tab focus on each card play the state shown in `home-v2-problems-hover-*.png`. With `prefers-reduced-motion: reduce` the state changes without a transition (computed `transition-duration: 0s`).
- Dark theme (`prefers-color-scheme: dark`) uses the dark `--c-*` washes, surface cards and violet `--sf-edge` outlines, as in `home-v2-1440-dark.png`.
- `grep -o '<a href="/[a-z-]*" class="sf-problem sf-problem-[a-z0-9]*"' dist/index.html` → 6 lines in this order: shift-subtitles/shift, fix-subtitle-drift/drift, fix-subtitle-encoding/enc, srt-to-vtt/s2v, vtt-to-srt/v2s, ass-to-srt/ass. The R6 `sf-card` grep still gives its 6 lines.
- `grep -c '<h1' dist/index.html` → 1. `grep -o 'Free subtitle tools that run entirely in your browser: no upload, no sign-up.' dist/index.html | wc -l` → 2 (unchanged).
- Head check, sf-copy text check, `npm test` (with the DARK tile fix, `PROBLEM_PAIRS` and `problemCards.test.ts`) and `npm run build` are all green.
- Lighthouse mobile on `/`: ≥ 95 in all 4 categories, CLS < 0.02, 0 a11y violations.
- Added JS = 0 B. Added CSS ≈ 8.3 KB raw / 2.3 KB gzip.

### Flags (Kirill decides)
1. **Placeholder microcopy for Витя:**
   - "What's wrong with your subtitles?"
   - "Always early or late"
   - "Gets worse over time"
   - "Weird characters like Ã©"
   - "Need VTT for the web"
   - "Need SRT for my TV"
   - "Styled .ass won't play"

   All are derived from his "Which tool do I need?" table and FAQ. The heading was already in the B-home mock panel.
2. **Order.** The problem cards come before the tool grid (symptom first). The alternative is grid first and problems second, which keeps R6's fold.
3. **6 cards, 1:1 with the tools.** The "fine until one scene" row of the table (shift from a line) has no card of its own. It is covered by "Always early or late" → Shift.
4. **The prerequisite DARK fix in `contrast.ts`** corrects test data only; the site output is unchanged.
