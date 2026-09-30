# SubtitleFixer redesign, direction B "Pop Toolkit": staged tasks for Cursor / Claude

Chosen direction: **B**. The previous AB-hybrid plan is kept for reference in `REDESIGN-TASKS-AB.md`.
Source of truth for the look: `sf-redesign/B-tokens.md` + mockups in `sf-redesign/concepts/`:
- `B-shift.png`: tool page, empty state
- `B-shift-loaded.png`: file loaded, live preview
- `B-shift-full.png`: full page with the SEO sections and FAQ accordion
- `B-shift-mobile.png`: 390×844
- `B-home.png`, `B-home-mobile.png`

HTML/CSS sources are in `concepts/b/`. `b.css` is a working reference for values. `build_b.py` renders the real `src/content/tools/shift-subtitles.md` and `src/content/pages/home.md`.
Repo: `luntovskiyka-dev/subtitlefixer` (main). The local `/workspace/subtitlefixer-repo/` is a partial snapshot, so the paths below come from the GitHub tree.

Do one stage per PR, in order. Every stage must leave the site shippable.

**Design rule for all stages: loud on top, calm below.** Ink outlines, hard shadows and big colour blocks belong to the tool area, the home hero, tool cards and a few interactive elements. Long SEO text sits on the cream page in a 740px column with no outlines. See B-tokens.md, "Principles".

## Global constraints (apply to every stage)
1. **No URL, SEO or JSON-LD changes.** Don't touch routing in `astro.config.mjs` (`trailingSlash`, `build.format`, `site`), `src/lib/seo/urls.ts`, `src/lib/seo/jsonld.ts`, `faqPageJsonLd` / `stripMarkdown` in `src/lib/seo/faqText.ts`, `src/components/Seo.astro`, sitemap config, `worker/`, `wrangler.toml`, `public/llms.txt`, `public/robots.txt`. Titles, descriptions, canonicals, OG tags, H1 text and the `FAQPage` / `WebApplication` JSON-LD must be byte-identical. Diff the built `<head>` and JSON-LD of every page against main.
2. **Витя's content stays untouched.** No text edits in `src/content/**` (tools, guides, pages). Visual restructuring is allowed only through templates, CSS and markdown plugins that add wrappers, classes or ids: sections, step cards, before/after pairs, does/doesn't cards, a callout, FAQ in `<details>`. Heading order and all text stay in the DOM.
3. **Static only, no backend.** All file processing stays in the browser. No request may contain file contents. No third-party scripts, no font CDNs.
4. **JS budget.** No UI framework. Only the existing small `<script>` blocks in `.astro` components. The redesign may add at most **5 KB gzip of JS per page**. The accordion is native `<details>` and the mobile nav is a scrollable row (0 JS for both). Don't make the shared `files.*.js` chunk bigger (see the R7 note).
5. **Tokens only.** No hex in components (AGENTS rule 5). Every colour comes from `src/styles/tokens.css` → `tailwind.tokens.js`.
6. **Accessibility.** WCAG AA in light and dark, using the pairs in B-tokens.md. **Text on coral, teal and mint is always ink.** Keyboard-usable dropzone (keep the `<button>`). Visible focus rings (white ring on the indigo stage). Labels on all inputs. `prefers-reduced-motion` respected.
7. Every stage finishes with `npm run build` and `npm test` passing. AGENTS.md mentions `npm run lint`, but `package.json` has no lint script: add `"lint": "astro check"` in R1, or remove the line from AGENTS.md. Kirill decides.

---

## R1: Tokens, fonts and rule updates
**Goal:** Switch the foundation to the B palette and self-hosted Bricolage Grotesque, Figtree and DM Mono, with no layout shift and no Lighthouse regression. Update the project rules to match.

**Scope**
- **`AGENTS.md`**
  - Rule 4 "No web fonts. Use the system font stack…" → "Web fonts: only self-hosted @fontsource latin subsets listed in `docs/B-tokens.md` (Bricolage Grotesque 800, Figtree variable, DM Mono 500), ≤ 60 KB total, ≤ 2 preloads, same-origin, `font-display: swap` (mono `optional`). No font CDNs."
  - "Design" section: replace D4 Indigo + Mint with direction B (cream / indigo / coral / teal / mint / lilac, ink outlines, radii 12–32, "loud on top, calm below", ink text on coral/teal/mint).
  - Kirill accepts web fonts for B. If he says otherwise, stop and fall back to the system stack.
- **`docs/PLAN.md`**: task 6 "Шрифт — системный стек … ✅ 0 запросов шрифтов" → "Шрифты — self-hosted @fontsource (latin): Bricolage Grotesque 800, Figtree variable, DM Mono 500; ✅ ≤ 3 запроса шрифтов, все same-origin, ≤ 60 KB, CLS < 0.02". Also update the "Палитра: D4" line and the task 7 wording (Dropzone "пунктир brand", Mark "accent") to B. Copy `B-tokens.md` into `docs/`.
- **`src/styles/tokens.css`**: light and dark values from B-tokens.md §1–2. New vars: `--sf-subtle, --sf-brand-soft/--sf-lilac, --sf-on-brand, --sf-on-brand-muted, --sf-on-accent, --sf-accent-soft, --sf-accent-wash, --sf-accent-ink, --sf-teal, --sf-teal-soft, --sf-teal-ink, --sf-mint, --sf-success, --sf-line, --sf-edge, --sf-shadow-color, --sf-radius-sm/-/-lg/-xl, --sf-shadow-sm/-/-lg, --sf-display`, per-tool `--t-<key>`, `--t-<key>-bg`, `--c-<key>`. `--sf-border` is renamed to `--sf-line`: keep `line` as the Tailwind name, and grep for `--sf-border` before renaming.
- **`tailwind.tokens.js`**
  - colors: `lilac`, `on-brand`, `on-brand-muted`, `accent.{DEFAULT,soft,wash,ink}`, `on-accent`, `teal.{DEFAULT,soft,ink}`, `mint`, `success`, `subtle`, `edge`, `tool.*`
  - `borderRadius`: `sf-sm, sf, sf-lg, sf-xl`
  - `boxShadow`: `hard-sm, hard, hard-lg`
  - `borderWidth`: `2.5`
  - `fontFamily.display`
- **`src/lib/ui/contrast.ts`** (`LIGHT` / `DARK`) + **`src/lib/ui/contrast.test.ts`**
  - All "WCAG (checked)" pairs from B-tokens.md (≥ 4.5 text, ≥ 3 non-text).
  - Per-tool icon/tile pairs.
  - A **guard test** asserting that white on coral and white on teal are < 4.5, as a reminder that ink text is mandatory there.
- **Mint usages**: `src/components/ToolStatus.astro`, `src/lib/ui/statusView.ts` (`bg-accent` → `bg-mint`, `text-accent-strong` → `text-success`). `src/components/Mark.astro` becomes the coral H1 pill (`bg-accent text-on-accent border-2.5 border-edge shadow-hard-sm rounded-sf-sm -rotate-2 inline-block px-3`). Grep `accent` across `src/`.
- **Fonts**
  - Add `@fontsource/bricolage-grotesque`, `@fontsource-variable/figtree`, `@fontsource/dm-mono`.
  - Declare `@font-face` yourself in `src/styles/global.css` with `unicode-range` latin, pointing to the package woff2 files. Don't import the package CSS, which pulls all subsets.
  - In `src/layouts/Base.astro` `<head>`, preload the Figtree variable and Bricolage 800 files (`?url` imports for hashed paths). DM Mono is not preloaded (`font-display: optional`).
  - Add metric-matched fallback faces (`size-adjust` / `ascent-override`).
  - Add a global rule for mono: `font-variant-ligatures: none; font-feature-settings: "calt" 0`.

**Constraints:** Colours and fonts only in this stage, no layout changes. Font bytes ≤ 60 KB total, ≤ 45 KB preloaded. `@fontsource/inter` (devDependency, used by the OG image script) stays.

**Done when:**
- `npm test` is green, including the extended contrast tests and the guard.
- `/_styleguide` renders in B colours, light and dark.
- `rg '#[0-9A-Fa-f]{6}' src/components` finds nothing.
- Lighthouse mobile ≥ 95 on `/` and `/shift-subtitles`, CLS < 0.02.
- Network shows 2 preloaded fonts, ≤ 3 font files, all same-origin.
- AGENTS.md and PLAN.md are updated.

---

## R2: Header navigation, footer, buttons, base components
**Goal:** A tool-first frame: B header with pills for all 6 tools, an ink footer block, and B primitives.

**Scope**
- **`src/data/tools.ts`**: keep the existing `tools` map, which feeds Footer, 404 and `markdownPlugins.ts`. Add `toolMeta`:
  - `slug`
  - `nav`: 'Shift' | 'Fix drift' | 'Fix encoding' | 'SRT→VTT' | 'VTT→SRT' | 'ASS→SRT'
  - `key`: 'shift'|'drift'|'enc'|'s2v'|'v2s'|'ass'
  - `group`: 'Timing'|'Text'|'Convert'
  - `icon` (SVG path)
  - `formats`
  - `card` (one-liner)
  - `mark` (the H1 word to put in the pill, e.g. 'Subtitles')

  Nav order: Shift, Fix drift, Fix encoding, SRT→VTT, VTT→SRT, ASS→SRT.
- **New `src/components/ToolIcon.astro`**: tile with the tool fill colour, 2px `border-edge`, `shadow-hard-sm`, slight tilt. Sizes s/m/l. SVG paths are in `concepts/ab/build.py` → `TOOLS`.
- **`src/components/Header.astro`**
  - Container 1180px, height 76px.
  - Logo: coral tile tilted −6°, ink outline, `shadow-hard-sm`, plus "SubtitleFixer" in Bricolage 800.
  - Center nav: 6 pill links, each with a 10px tool-colour dot. Active pill = `bg-edge text-white` + `aria-current="page"`. Hover = 2px ink outline.
  - Right: pill "No upload · Free" (`bg-mint`, ink outline).
  - Below 768px: logo row + horizontally scrollable pill row (`overflow-x:auto`, no JS, no hamburger).
- **`src/components/Footer.astro`**: full-width ink block (`bg-edge`, top radius 32), 4 columns (brand blurb + "Support this project"; Tools; Guides; Site), mint column headings, cream links. Keep all links and their order.
- **`src/components/Button.astro`**
  - `primary`: coral, ink text, 2.5px edge, `4px 4px 0` edge shadow, `:active` press.
  - `secondary`: white, ink outline, `shadow-hard-sm`.
  - `on-stage`: white pill.
  - `ghost`.
  - `size="lg"`: h-14, Bricolage 800 19px.
  - `disabled`: subtle bg, muted text, dashed muted border, no shadow, `aria-disabled` + describedby hint.
- **`src/components/Input.astro`**: 2–2.5px `border-control`, radius 18, `variant="hero"` (lilac bg, 62px, Bricolage 30 value), optional `suffix` ("ms") and `hint` (`aria-describedby`). Focus = brand ring.
- `Badge.astro` (pill with ink outline) and `Card.astro` (`calm`: white + line border; `pop`: ink outline + hard shadow).
- **`src/layouts/Base.astro`**: replace the fixed `max-w-3xl` on `<main>` with a `width` prop (`'wide'` = 1180, `'prose'` = 740 default), so about, privacy and guides keep a reading column.
- **`src/views/Styleguide.astro`**: show every variant.

**Constraints:** Link targets and the `aria-label="Tools"` / `"Site"` labels stay. Nav strings live in `src/data/tools.ts` (i18n later). No JS.

**Done when:**
- The new header and footer appear on every page.
- Tab order is logo → 6 tools → content, and the active tool has `aria-current`.
- No horizontal page scroll at 360px (only the pill row scrolls).
- Button variants, including disabled, are in `/_styleguide` and pass the contrast tests.

---

## R3: ToolPage stage (dropzone, settings panel, preview, disabled download)
**Goal:** The tool is above the fold inside the indigo stage, as in `B-shift.png` / `B-shift-loaded.png`.

**Scope**
- **`src/components/ToolPage.astro`**
  - `<section id="tool" class="stage">`: brand bg, radius 32, 2 decorative CSS blobs (`aria-hidden`).
  - H1: white Bricolage 800 56px. The `toolMeta.mark` word is wrapped in `<Mark>` (coral pill). The H1 text is unchanged.
  - `answer` as the lead paragraph in `on-brand-muted` (max-w 930).
  - Then the tool slot, then the content (R5).
- **New `src/components/ToolLayout.astro`**: named slots `input` (dropzone + status), `preview`, `settings` (white panel, 2.5px edge, radius 26, `shadow-hard-lg`), `action` (CTA + trust line). Grid `minmax(0,1fr) 384px` from 1024px up, one column below.
- **`src/components/Dropzone.astro`**, `variant="stage"`:
  - Idle: `brand-hover` fill, 2.5px dashed white (85%), radius 24, min-h 262, the illustration SVG from `concepts/b/build_b.py` `ILL` (static, `aria-hidden`).
  - Title "Drop .srt, .vtt or .ass file here" on desktop; "Choose .srt, .vtt or .ass file" when `(pointer: coarse)` or below 768px.
  - White "Choose files" pill, the line "Several files get the same shift", and format chips from a `formats` prop.
  - States: `drag` (solid white border + lighter fill), `error`, and **`loaded`**: a compact row with a mint file tile, file name, "SRT · N cues · UTF-8" and a "Choose other files" pill.
  - Keep the `label` / `accept` props, the `<button>` element, the hidden input and the custom events (`subtitlefiles`, `subtitlereading`, `subtitlefailed`).
- **`ToolStatus.astro` + `src/lib/ui/statusView.ts`**: inline row on the stage (white dot, white title, `on-brand-muted` detail). Same copy from `src/lib/ui/status.ts`, same `role="status"`.
- **`src/components/ShiftTool.astro`** (reference implementation)
  - Settings panel:
    - "Settings" title and "Offset (ms)" hero Input with the `ms` suffix and "1 s = 1000 ms".
    - The **existing 6 step buttons** in a 3×2 grid: −1000 −500 −100 on `accent-soft`, +100 +500 +1000 on `mint`, ink outline, radius 14. Below them the scale "← earlier / later →".
    - "Start from cue" (optional) + "Lines before it stay unchanged."
    - CTA "Download shifted file" (primary lg) and the trust line "Your file never leaves your device."
  - **Download disabled until a file is loaded**: disabled Button + "Add a file to enable the download." The `subtitlefiles` handler enables it. Keep the existing validation messages.
  - **Live preview (new, small)**:
    - After a file loads, and on offset/from-cue `input` (debounced 150 ms), render the first ≤ 6 cues of the first file as "N · old (muted, struck) → new (mint chip) · text".
    - Use the existing `parse` + `shiftCues` only.
    - Tag "−2500 ms · all N cues", or "from line N" when set.
    - Before a file is loaded, show a static card tagged **"Example · −2500 ms"** that reuses the numbers from the page's own before/after example. It is hidden on mobile.
  - Keep `#shift-result` (`aria-live`) for errors and the "N lines removed / trimmed" warning.

**Constraints:**
- H1 and answer text stay unchanged. No changes to `src/lib/subs/**`.
- New ShiftTool JS ≤ 2 KB gzip.
- The dropzone stays a real `<button>` + hidden file input, and keeps `multiple`.
- A new selection **replaces** the list, so the UI says "Choose other files". Don't write "Add more" unless appending is implemented and tested.

**Done when:**
- At 1440×900 the stage, with H1, dropzone, preview, settings and CTA, is fully visible without scrolling (`B-shift.png`).
- At 390×844 the H1 and dropzone are in the first screen (`B-shift-mobile.png`).
- The CTA is disabled with a hint until a file is loaded.
- The preview matches the downloaded file for the shown cues. Add a Vitest for the row formatter if it lives in `src/lib/ui`.
- Keyboard-only flow works: Tab to the dropzone, Enter opens the picker, every control is reachable, and focus is visible on indigo.
- Lighthouse ≥ 95.

---

## R4: Apply the stage to all 6 tool pages
**Goal:** Every tool uses the same stage and layout, with a tool-specific settings panel. Keep all ids, events, labels and download logic.

**Scope**
- **`src/components/DriftTool.astro`** (`/fix-subtitle-drift`)
  - Settings panel = "Two-point sync" fieldset: 2 cue selects + 2 time inputs, hint "hh:mm:ss,mmm", CTA "Download synced file".
  - The existing **H2 "Subtitle frame rate converter"** stays an H2. It becomes a second white panel right under the stage, with the 6 fps presets as outlined pills (teal fill on hover or active).
  - "Add BOM (old players)" checkbox: 2px ink box, mint check.
  - Preview = the existing `previewOf()` output as rows.
- **`src/components/EncodingTool.astro`** (`/fix-subtitle-encoding`)
  - `#encoding-candidates` go into the preview column as selectable white cards. The "Detected" badge becomes a mint pill.
  - The Encoding select, BOM and "Download UTF-8 file" go in the settings panel.
  - The accept list is unchanged (`.srt,.vtt,.ass,.ssa,.sub,.txt`), and the chips show SRT VTT ASS SSA SUB TXT.
- **`src/components/ConvertTool.astro`** (`/srt-to-vtt`, `/vtt-to-srt`)
  - There are no settings, so the stage has the dropzone on the left and a small panel with a big format pill (`.srt → .vtt`) + CTA "Download converted file" on the right.
  - The preview shows the converted text after load. Move the conversion into the load handler only if that stays cheap; otherwise keep it on submit and show an empty-state hint.
  - CTA disabled until a file is loaded.
- **`src/components/AssToSrtTool.astro`** (`/ass-to-srt`): same pattern as ConvertTool (`.ass/.ssa → .srt`, "Download SRT file").
- **`src/pages/[slug].astro`**: pass only what the layout needs. Check whether `ToolPlaceholder.astro` is still used; restyle or remove it.

**Constraints:** Same as R3. Processing output is unchanged, and the `src/lib/subs/*.test.ts` files stay untouched and green. Existing visible labels keep their wording.

**Done when:**
- All 6 pages render the B stage at 1440 and 390, with no horizontal scroll at 360px.
- Each tool works end to end on `tests/fixtures/*` (manual checklist in the PR).
- The CTA is disabled until a file is loaded on every page.
- No network request contains file data.

---

## R5: Calm content below the fold (sections, steps, before/after, FAQ accordion)
**Goal:** Витя's long SEO text stays pleasant to read in B style without overload, as in `B-shift-full.png`.

**Scope**
- **`src/lib/seo/markdownPlugins.ts`**: new **hast** plugins, registered in `astro.config.mjs` `hastPlugins` next to `externalLinks` and `wrapTables`. Adding plugins is allowed; the URL and SEO config must not change.
  - `sectionize`: wrap each `h2` and its following siblings in `<section class="sf-section" id="<slug>">`, and give each h2 a stable id.
  - `decorateSections` (classes and wrappers only, text untouched):
    - the `ol` under an h2 matching `/in 3 steps$/i` → `sf-steps`
    - a "Before:" `p` + `pre` followed by an "After…" `p` + `pre` → `<div class="sf-ba">…<div class="sf-ba-after">…</div></div>`
    - "What it does:" / "What it doesn't do:" `p>strong` + `ul` → `sf-does` / `sf-doesnt`
    - at most **one** `sf-callout` per page (tool pages: the "… vs …" section, e.g. "Constant shift vs drift"; guides: none by default)
    - the list under h2 "Related tools" → `sf-related`, with `li[data-tool=<slug>]` on items that link to a tool
  - Optional `highlightSubtitleCode`: in `pre>code.language-srt|vtt|ass`, spans for timestamp lines (`sf-tc`) and cue numbers (`sf-cn`).
  - Unit tests: each plugin keeps the text content identical and only adds classes, wrappers and ids.
- **`src/styles/global.css`** (`.sf-copy`), calm rules:
  - Text: cream bg, 740px column, Figtree 17/1.75, ink text.
  - H2: Bricolage 800 31px with a 14px tilted colour square (`::before`, colours rotate coral → teal → brand).
  - Links: `brand-hover`, 2px underline at 35%.
  - `code`: lilac chip. `pre`: white, 2px `line` border, radius 18, DM Mono 14, no ligatures.
  - **Allowed pops, few by design:**
    - `.sf-steps`: 3 white cards with ink outline + `shadow-hard-sm` and numbered circles coral / teal / mint.
    - `.sf-ba`: 2 white `line`-bordered cards with "Before" (lilac) and "After" (mint) pill labels; stacked on mobile.
    - `.sf-does` / `.sf-doesnt`: mint-wash and coral-wash cards **without** outline, with round ✓/✕ markers.
    - `.sf-callout`: lilac + ink outline, 1 per page.
    - `.sf-related`: 2-column white `line` cards with a ToolIcon, drawn from `data-tool` via CSS vars + `mask-image`.
    - Tables (`.sf-table`): white card, ink outline, lilac header row.
  - Everything else stays plain text.
- **FAQ accordion**
  - `src/components/FaqList.astro` and `renderFaqBlocks()` in `src/lib/seo/faqText.ts` (the home page via `injectFaq`) render `<details class="sf-faq-item"><summary><h3>{q}</h3></summary><div>{a}</div></details>`, with the **first item open**.
  - Style: white, 2px ink outline, radius 18. A round `+` (lilac) turns into `–` (coral) when open, and the open item gets `shadow-hard-sm`.
  - `faqPageJsonLd` stays untouched. Update `faqText.test.ts` for the HTML only.
- **`src/components/ToolPage.astro`**
  - Content grid: 740px article + 290px sticky aside from 1024px up.
  - Aside: "On this page" card (white, ink outline, `shadow-hard-sm`) with links to the section ids, generated at build time, and an ink "↑ Back to the tool" pill linking to `#tool`. No JS, no scroll-spy.
- **Guides** (`src/pages/guides/[slug].astro`), `about`, `privacy`: the same calm `.sf-copy` in the prose layout, no aside.

**Constraints:**
- No content edits, and JSON-LD stays identical.
- Visible text is identical before and after: add a script or test comparing the `.sf-copy` `innerText` of every built page, ignoring whitespace.
- `<details>` without JS. `@media print` shows all FAQ answers.
- Ink outlines appear on at most these below-fold elements: steps, callout, tables, FAQ items, TOC. Nothing else.

**Done when:**
- `/shift-subtitles` matches `B-shift-full.png`.
- The text-equality check passes on all pages.
- FAQPage JSON-LD is byte-identical and the Rich Results Test is still valid.
- Lighthouse SEO = 100.
- Guide pages read calmly: no stage, no hard shadows except tables and FAQ.

---

## R6: Home hero + tool-card grid + 404
**Goal:** The home first screen is an indigo hero plus 6 coloured tool cards, as in `B-home.png`. 404 reuses the grid.

**Scope**
- **New `src/components/ToolCard.astro`**: full card in the tool wash colour (`--c-<key>`), 2.5px ink outline, radius 26, `shadow-hard` (5px). Contents:
  - ToolIcon m (tilted) and a group pill ("TIMING" / "TEXT" / "CONVERT").
  - Name in Bricolage 800 23px and the `card` one-liner.
  - Formats chip and "Open tool →".
  - The whole card is one `<a>`, with a press/hover shift of 2px.
- **New `src/components/ToolGrid.astro`**: 3×2 on desktop, 1 column on mobile, heading "Pick a tool".
- **`src/pages/index.astro`**
  - Stage hero: H1 with the text unchanged and `<Mark>` on "Subtitles"; `subline` from frontmatter; 4 trust pills in mint / white / coral-soft / teal-soft with ink outlines: "No upload", "No sign-up", "Free, 6 tools", "Many files → one zip".
  - Optional right panel "What's wrong with your subtitles?" with 4 static links (see Flags).
  - Then ToolGrid, then `<Content />` in the calm prose layout (the table as a card, FAQ accordion via `injectFaq`).
- **`src/pages/404.astro`**: H1 and sentence unchanged, plus ToolGrid instead of the plain list (same links).

**Constraints:**
- Home H1, answer, content and FAQ JSON-LD stay unchanged.
- Card texts are new UI microcopy; get Kirill's OK.
- **Duplicate text:** `home.md` starts (after the stripped H1) with the same sentence as `subline`. If the hero shows `subline`, it appears twice. Either drop it from the hero, or ask Витя to remove the duplicate paragraph (a content change that needs his and Kirill's OK).

**Done when:**
- At 1440×900 the hero and the first card row are fully visible, and the second row starts above the fold.
- At 390px the cards stack with no horizontal scroll.
- 404 stays `noindex` and shows the grid.
- Lighthouse ≥ 95.

---

## R7: QA (performance, mobile, accessibility, regressions)
**Goal:** Prove nothing regressed and B meets the AGENTS.md bars.

**Checks**
- **Lighthouse** mobile ≥ 95 in all 4 categories on `/`, all 6 tool pages, one guide, `/about` and `/404`. Record LCP, CLS and TBT before and after. Font files ≤ 3, same-origin, ≤ 60 KB. The LCP element (H1 or lead) is not blocked by fonts, thanks to the preload + swap + metric fallback.
- **Visual** at 360 / 390 / 768 / 1024 / 1440, light **and dark**:
  - no horizontal scroll
  - dropzone and CTA tap targets ≥ 44px, preset buttons ≥ 42px
  - hard shadows don't overflow the container at 360px (use the mobile shadow sizes)
- **a11y**:
  - axe / Lighthouse a11y with 0 violations
  - keyboard-only run of every tool
  - focus ring visible on indigo (white) and on cream (brand-hover)
  - labels on the dropzone, inputs, the presets group (`role=group` + label) and the disabled CTA (`aria-disabled` + describedby)
  - `summary` focus ring
  - `prefers-reduced-motion` disables press and rise transitions
- **Contrast**: the `contrast.test.ts` pairs pass. Spot-check real renders with a picker, especially text on the stage, chips and card washes.
- **SEO regression**: `dist/**/*.html` `<head>` and JSON-LD identical to main, sitemap identical, canonical = URL, R5 text-equality check green.
- **Privacy**: the DevTools Network tab during each tool run shows no request after load except same-origin fonts and assets.
- `npm run build` and `npm test` green. `/_styleguide` updated.
- **Out of scope, already noted in `qa/tech-audit-2026-09-30.md`:** the encoding detector adds about 700 KB brotli in the shared `files.*.js` on every tool page. The redesign must not make it worse. The fix (a dynamic `import()` only when needed) is a separate perf task.

**Done when:** `docs/qa-redesign.md` has numbers and screenshots per page, width and theme, every check is green, and Kirill has signed off visually.

---

## Flags: mockup-implied new behaviour and new copy
Nothing here exists today. Kirill decides.
1. **Live preview while typing** (`B-shift-loaded.png`). Today the preview appears only after submit, and submit also downloads immediately. R3 adds a small live preview.
2. **Download disabled until a file is loaded.** Today the button is always active and shows an error.
3. **File row "SRT · 612 cues · UTF-8".** The cue count needs a parse on load (cheap, uses the existing `parse`). Encoding comes from `DecodedSubtitleFile.encoding`. **Mock data:** the file name `harbour-lights.s01e01.srt`, "612 cues", and preview rows 4–6 ("Then where were you?", "Does it matter?", "It matters to me.") are invented. Rows 1–3 and −2500 ms come from the page's own example.
4. **"Choose other files".** A new selection *replaces* the file list today (`files = detail.files`), so the mockups don't say "Add more files".
5. **No home dropzone.** "Auto-detect the problem" doesn't exist. The optional panel "What's wrong with your subtitles?" is 4 static links (new copy derived from Витя's "Which tool do I need?" table).
6. **New UI microcopy**, which needs a quick OK:
   - "No upload · Free" (header pill)
   - "1 s = 1000 ms", "← earlier / later →", "Lines before it stay unchanged."
   - "Add a file to enable the download.", "Your file never leaves your device."
   - "Choose files", "Several files get the same shift", mobile "Choose .srt, .vtt or .ass file"
   - "Example · −2500 ms"
   - the home trust pills, including "Free, 6 tools" and "Many files → one zip"
   - tool-card one-liners (`concepts/b/build_b.py` → `cards`)
   - "On this page", "↑ Back to the tool"

   The ASS→SRT card deliberately doesn't claim italics are kept: the 2026-09-30 audit found `{\i1}` being stripped, so verify before any copy says so.
7. **H1 pill word** ("Subtitles"): a per-page mapping in `src/data/tools.ts`. The H1 text is unchanged.
8. **"On this page" sticky TOC**: a new static component (0 JS). Optional.
9. **Web fonts**: R1 changes AGENTS.md rule 4 and PLAN task 6. Kirill accepted web fonts for B; revert to the system stack if he withdraws that.
10. **Dark theme**: specified in B-tokens.md §2 but not mocked. Review it in R7.
11. **Nav labels** "SRT→VTT" etc. are UI labels only. Page titles and H1s keep the "SRT to VTT" wording.
12. The decorative stage blobs and the dropzone illustration are pure CSS / inline SVG with no extra requests, marked `aria-hidden`.

## Decisions (Kirill, 2026-10-01)
- APPROVED: live preview after upload, Download disabled until a file is loaded, cue-count line and "Choose other files".
- APPROVED: the new UI strings listed above.
- APPROVED: drop the duplicated home subtitle from the hero; keep the `home.md` text as the single source.
