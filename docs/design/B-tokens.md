# SubtitleFixer: direction B "Pop Toolkit" (production tokens)

Mockups: `concepts/B-shift.png` (empty state), `B-shift-loaded.png` (file loaded), `B-shift-full.png` (below-fold SEO sections + FAQ), `B-shift-mobile.png`, `B-home.png`, `B-home-mobile.png`. Sources: `concepts/b/` (`b.css` is the working reference; `build_b.py` renders the real `shift-subtitles.md` and `home.md` content).

## Principles: loud on top, calm below
- **Above the fold = the tool is a big colour block.** The indigo "stage" (radius 32) holds H1, the answer sentence, the dropzone, preview and settings panel. Ink outlines (2–2.5px) and hard offset shadows are used **only** on interactive or hero elements: stage panel, CTA, dropzone button, preset buttons, tool tiles, home tool cards, open FAQ item, TOC card.
- **Below the fold = reading mode.** Cream page, 740px text column, Figtree 17/1.75, no outlines on plain text sections. H2 gets a small tilted colour square. Colour appears only as soft washes: step cards, before/after, does/doesn't, one callout per page. Code/before-after blocks use a thin `line` border, not ink.
- **One accent per element.** Coral = the single primary action (CTA) + the H1 highlight pill. Teal and mint = success / "later" / secondary highlights. Lilac = inputs and neutral tags.
- **Text on coral, teal and mint is always ink.** White on coral is 2.57 ✗ and white on teal is 2.17 ✗. White text is allowed only on brand indigo.

Variable names keep the existing `--sf-*` scheme where it exists, so today's classes (`bg-brand`, `text-muted`, `border-line`, `rounded-sf`) keep working. **Breaking change:** `accent` becomes coral, and mint moves to `mint` / `success`.

## 1. Colour, light (default)

| Token | Tailwind | Hex | Use | WCAG (checked) |
|---|---|---|---|---|
| `--sf-bg` | `bg-bg` | `#FFF8EF` | cream page | — |
| `--sf-surface` | `bg-surface` | `#FFFFFF` | panels, cards, inputs, FAQ items | — |
| `--sf-subtle` | `bg-subtle` | `#FBF1E4` | disabled CTA, zebra | — |
| `--sf-text` | `text-ink` | `#1B1A3A` | body, headings | 15.9 on bg · 16.7 on surface |
| `--sf-muted` | `text-muted` | `#5E5A7A` | hints, old timecodes, meta | 6.2 bg · 6.5 surface · 5.8 subtle · 5.2 lilac |
| `--sf-brand` | `bg-brand` | `#5B4BFF` | stage background, active states, fills | as text 5.1 on bg (large text only; use brand-hover for links) |
| `--sf-brand-hover` | `text-brand-hover` | `#4B3BE6` | **links**, dropzone fill on stage, hover | 6.5 bg · 6.85 surface · 5.4 lilac |
| `--sf-brand-soft` = `--sf-lilac` | `bg-lilac` | `#E6E1FF` | offset input, neutral tags, callout, TOC active | ink 13.2 |
| `--sf-on-brand` | `text-on-brand` | `#FFFFFF` | H1 / dropzone title on stage | 5.4 on brand · 6.85 on brand-hover |
| `--sf-on-brand-muted` | `text-on-brand-muted` | `#F4F2FF` | lead, hints, status on stage | 4.88 on brand · 6.2 on brand-hover (the old B used `#E3DFFF`, which is 4.18 ✗) |
| `--sf-accent` (coral) | `bg-accent` | `#FF7A59` | CTA, H1 pill, step 1 badge, coral tiles | ink 6.5 · white 2.57 ✗ |
| `--sf-on-accent` | `text-on-accent` | `#1B1A3A` | text on coral | 6.5 |
| `--sf-accent-soft` | `bg-accent-soft` | `#FFD4C7` | "earlier" (−) presets, SRT chip | ink 12.3 |
| `--sf-accent-wash` | `bg-accent-wash` | `#FFEDE6` | "doesn't do" card | ink 14.7 |
| `--sf-accent-ink` | `text-accent-ink` | `#B93A12` | coral-family text (rare) | 5.4 bg · 5.7 surface |
| `--sf-teal` | `bg-teal` | `#2EC4B6` | step 2 badge, drift tile, H2 square | ink 7.7 · white 2.17 ✗ |
| `--sf-teal-soft` | `bg-teal-soft` | `#D5F5F1` | teal washes, SSA chip | ink 14.5 |
| `--sf-teal-ink` | `text-teal-ink` | `#0F766E` | teal text (rare) | 5.2 bg |
| `--sf-mint` | `bg-mint` | `#B8F2DC` | "later" (+) presets, new timecode chip, ready badge, header pill | ink 13.4 |
| `--sf-success` | `text-success` | `#065F46` | ready/check text | 6.1 on mint · 7.3 bg |
| `--sf-line` | `border-line` | `#EADFCF` | calm borders (content cards, `pre`, dashed row dividers) | decorative |
| `--sf-edge` | `border-edge` | `#1B1A3A` | ink outlines + hard shadows | 16.7 on surface · 3.1 on brand (panel outline on stage ≥ 3) |
| `--sf-control` | `border-control` | `#1B1A3A` | input borders (2–2.5px) | 16.7 |
| `--sf-danger` | `text-danger` | `#C81E1E` | errors | 5.4 bg · 5.7 surface (`#DC2626` would be 4.58 on cream, too tight) |
| `--sf-warning` | `text-warning` | `#B45309` | "N lines removed / trimmed" | 4.76 bg · 5.0 surface |
| `--sf-footer` / `--sf-footer-text` / `--sf-footer-muted` / `--sf-footer-mint` | `bg-footer` `text-footer-text` `text-footer-muted` `text-footer-mint` | `#1B1A3A` / `#FFF8EF` / `#C9C5E3` / `#B8F2DC` | ink block footer; headings use footer-mint, not mint | 15.9 · 10.0 · 13.4 |
| `--sf-nav-active` / `--sf-on-nav` | `bg-nav-active` `text-on-nav` | `#1B1A3A` / `#FFFFFF` | active tool pill | 16.7 |

Disabled CTA: bg `subtle`, text `muted` (5.8), 2.5px **dashed `muted`** border, no shadow, `aria-disabled`.
Focus ring: `outline: 3px solid var(--sf-brand-hover); outline-offset: 3px` on light surfaces; on the stage use `outline-color: #FFFFFF` (6.85 on brand-hover).

### Per-tool colours (tiles have an ink outline; icon ≥ 3:1 on the tile)
| Tool | tile fill `--t-*-bg` | icon `--t-*` | card wash `--c-*` (home) | nav dot |
|---|---|---|---|---|
| shift-subtitles | `#5B4BFF` | `#FFFFFF` (5.4) | `#E6E1FF` | brand |
| fix-subtitle-drift | `#2EC4B6` | `#1B1A3A` (7.7) | `#D5F5F1` | teal |
| fix-subtitle-encoding | `#6EE7B7` | `#1B1A3A` (11.0) | `#D9F8EA` | mint-strong |
| srt-to-vtt | `#FF7A59` | `#1B1A3A` (6.5) | `#FFE3D9` | coral |
| vtt-to-srt | `#FF8FC0` | `#1B1A3A` (7.9) | `#FFE0EE` | pink |
| ass-to-srt | `#7CC8FF` | `#1B1A3A` (9.2) | `#DDF0FF` | sky |
Ink text on every card wash is ≥ 13.6:1. There is deliberately **no yellow**, so ink-on-yellow can't come back (the rejected "black + yellow" look).

## 2. Colour, dark (`prefers-color-scheme: dark`)
Outlines can't be black on a dark page, so `edge` becomes a light violet line and hard shadows go almost black.

| Token | Hex | Check |
|---|---|---|
| bg / surface / subtle | `#15142B` / `#1F1D3F` / `#28264D` | — |
| text | `#FFF8EF` | 17.1 bg · 15.3 surface |
| muted | `#B9B5D6` | 9.1 · 8.2 · 7.2 |
| brand (stage bg) | `#4B3BE6` | white 6.85 · on-brand-muted 6.2 |
| dropzone fill | `#3B2FC9` | white 8.6 |
| link (`brand-hover` in dark) | `#A79EFF` | 7.7 bg · 6.9 surface |
| lilac / accent-wash / mint-wash | `#2B2760` / `#4A2230` / `#123C3A` | text 12.8 / 12.8 / 11.5 |
| accent / on-accent | `#FF8A6B` / `#15142B` | 7.8 |
| accent-soft | `#5A2C24` | text 10.9 · muted 5.8 |
| teal / on-teal | `#3DD6C8` / `#15142B` | 10.0 |
| teal-soft | `#123C3A` | text 11.5 |
| accent-ink / teal-ink / success | `#FF9C80` / `#5EEAD4` / `#6EE7B7` | 7.9 / 10.9 / 10.6 on surface |
| danger / warning | `#F87171` / `#FBBF24` | 5.8 / 9.6 |
| line | `#34315C` | decorative hairline |
| edge + control (outlines) | `#8E88C8` | 5.0 surface · 5.6 bg |
| hard-shadow colour | `#07061A` | — |
| footer bg / text / meta / headings | `#0E0D20` / `#FFF8EF` / `#C9C5E3` / `#B8F2DC` | 18.2 · 11.5 · 15.3 |
| nav-active / on-nav | `#FFF8EF` / `#1B1A3A` | 15.9 on the pill · 15.3 against the inactive surface `#1F1D3F` |
| stage line | `#FFFFFF` | 6.85 on brand. Dark edge on brand is 2.12, so stage borders and the H1 pill use this instead of edge |

`--sf-mint` in dark is the wash `#123C3A` (1.6 on the footer), so column headings use `--sf-footer-mint` and stay `#B8F2DC`. `--sf-edge` in dark is the light outline `#8E88C8` (white text on it is 3.2, and the line on brand is 2.12). The active pill is a light fill with ink text so it does not blend into the inactive surface. Stage borders and focus rings use white.

## 3. Typography (all SIL OFL, self-hosted via @fontsource, **latin subset only**)

| Role | Package → file | Weights | Size (latin woff2) | Usage |
|---|---|---|---|---|
| Display | `@fontsource/bricolage-grotesque` → `bricolage-grotesque-latin-800-normal.woff2` | 800 (+ optional 700: 22.4 KB) | **21.8 KB** | H1 56/1.02 (home 58) → mobile 38; H2 31/1.15 → 25; panel titles 22; CTA label 19; offset value 30 |
| Body / UI | `@fontsource-variable/figtree` → `figtree-latin-wght-normal.woff2` | 400–800 variable | **20.2 KB** | body 16 (content 17/1.75), labels 14/800, buttons 15/800, small 12.5/600 |
| Mono | `@fontsource/dm-mono` → `dm-mono-latin-500-normal.woff2` | 500 | **15.0 KB** | timecodes, previews, chips, `code`/`pre` 12.5–14 |

**Total ≈ 57 KB** (79 KB if Bricolage 700 is added; not needed, since 800 is used for all display text).
Rule: `font-variant-ligatures: none; font-feature-settings: "calt" 0;` on all mono and `pre` text, so `-->` never becomes a ligature.

**Preload plan**
1. `<link rel="preload" as="font" type="font/woff2" crossorigin href="/_astro/figtree-latin-wght-normal.[hash].woff2">`: body text, needed for LCP (the lead paragraph).
2. `<link rel="preload" … bricolage-grotesque-latin-800-normal.[hash].woff2>`: H1 is the LCP element candidate on tool pages. Preload it too, so there are 2 preloads, 42 KB in total.
3. DM Mono: **no preload**, `font-display: optional` (appears inside the preview / below the fold; fallback `ui-monospace` is fine).
4. Figtree + Bricolage use `font-display: swap`, with metric-matched fallbacks (`@font-face { font-family: "Figtree Fallback"; src: local("Arial"); size-adjust: …; ascent-override: … }`, generated with `fontaine` or computed once) so CLS stays < 0.02.
5. Get the hashed URLs in `Base.astro` via `import figtreeUrl from '@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2?url'`. Declare the `@font-face` rules yourself in `global.css` with `unicode-range` latin, instead of importing the package CSS (which would pull every subset).
6. Only same-origin requests. Nothing from fonts.googleapis.com.

## 4. Shape, borders, shadows

| Token | Value | Use |
|---|---|---|
| `--sf-radius-sm` | 12px | chips (pill 999px), preset buttons (14px), small tiles |
| `--sf-radius` | 18px | inputs, CTA, FAQ items, related cards |
| `--sf-radius-lg` | 24px | preview, dropzone, step / before-after / does cards, TOC |
| `--sf-radius-xl` | 32px | stage block, home tool cards (26px), footer top corners |
| `--sf-border` / `--sf-border-strong` | 2px / 2.5px | ink outlines (2px small items, 2.5px panel / CTA / cards / inputs) |
| `--sf-shadow-sm` | `3px 3px 0 var(--sf-edge)` | tiles, "Choose files" button, H1 pill, step cards, TOC, open FAQ item |
| `--sf-shadow` | `5px 5px 0 var(--sf-edge)` | home tool cards |
| `--sf-shadow-lg` | `7px 7px 0 var(--sf-edge)` | settings panel on the stage (mobile: `--sf-shadow`) |
| CTA | 2.5px edge + `4px 4px 0` edge; `:active` → translate(2px,2px) + `2px 2px 0` | primary action only |
| Stage blobs | 2 circles `#6C5DFF` / `#5344F0`, `pointer-events:none`, `aria-hidden` | decoration, pure CSS |
| Tilt | H1 pill −2°, logo −6°, tiles −4°, H2 square −8° | static transforms, so they stay under `prefers-reduced-motion`; only transitions and press animations are turned off |

Layout: container **1180px** (`px-6`, mobile `px-3`). Stage grid `minmax(0,1fr) 384px`, gap 26. Content grid `740px article + 290px sticky TOC`, gap 56. Mobile: stage radius 26, padding 22/16, single column, example preview hidden until a file is loaded.

## 5. Migration notes (vs current D4 tokens)
- `accent` mint → coral. The current mint users are `ToolStatus.astro`, `src/lib/ui/statusView.ts` (`bg-accent` → `bg-mint`, `text-accent-strong` → `text-success`) and `Mark.astro`, which is replaced by the coral H1 pill (`bg-accent text-on-accent border-edge shadow-sm`).
- `surface` stays white, and `bg` becomes cream.
- Primary Button changes from indigo with white text to **coral with ink text**. Secondary = white + ink outline. On-stage secondary ("Choose files") = white pill + `shadow-sm`.
- Update `LIGHT` / `DARK` in `src/lib/ui/contrast.ts` and extend `contrast.test.ts` with every "WCAG (checked)" pair above. The white-on-coral and white-on-teal pairs belong in a **must-fail guard test**, so nobody reintroduces them.
