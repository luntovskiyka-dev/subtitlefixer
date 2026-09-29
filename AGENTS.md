# AGENTS.md — subtitlefixer.com

Free, browser-only subtitle tools (shift, fix encoding, convert SRT/VTT/ASS…). Traffic comes only from SEO and GEO (being cited by AI assistants). Work through `docs/PLAN.md` one task at a time.

## Stack
- Astro (latest) + TypeScript `strict` + Tailwind CSS
- `output: 'static'`, deployed to Cloudflare Pages (build `npm run build`, output `dist`)
- Tests: Vitest. Package manager: npm.

## Hard rules
1. **No backend.** All file processing happens in the browser (JS/WASM). No server endpoints, no Cloudflare Functions unless explicitly asked.
2. **User files never leave the device.** No network request may contain file contents. No third-party scripts that could read them.
3. **Performance:** Lighthouse ≥ 95 (mobile) in every category. Pages are static HTML; tool JS loads only on tool pages (Astro islands, `client:visible`/`client:idle`).
4. **No web fonts.** Use the system font stack from `src/styles/tokens.css`.
5. **Colors only via tokens** (`src/styles/tokens.css`, `tailwind.tokens.js`). No hardcoded hex in components.
6. **Every core function has tests** (`src/lib/**` → `*.test.ts`), including broken/edge-case files in `tests/fixtures/`.
7. **Accessibility:** WCAG AA contrast (light + dark), keyboard-usable dropzone and controls, labels on all inputs, respect `prefers-reduced-motion`.
8. Keep dependencies minimal; prefer small, maintained libs. Ask before adding anything > 100 KB gzipped.

## Structure
```
src/
  lib/subs/        # parse/serialize SRT, VTT, ASS/SSA -> Cue model; encoding; time utils
  components/      # Button, Dropzone, Badge, Card, Input, SubtitlePreview, Seo, ToolPage
  content/tools/   # one .md per tool page (frontmatter: title, h1, description, faq[])
  content/guides/  # SEO articles
  pages/           # routes; tools at /<slug> (e.g. /shift-subtitles)
  styles/tokens.css
public/            # favicon, robots.txt, llms.txt
tests/fixtures/    # real + broken subtitle files
docs/PLAN.md       # roadmap — source of truth for tasks
```

## Core model
```ts
type Cue = { start: number; end: number; text: string; style?: string }; // ms
```
Formats: SRT, VTT, ASS/SSA (later SUB, SBV, TXT). Round-trip SRT→VTT→SRT must keep timings exact.

## SEO/GEO page template (ToolPage)
H1 matching the exact query → the tool → one-sentence direct answer → "How to" in 3 steps → before/after example with real timestamps → "What it does / doesn't" → FAQ 5–8 (`FAQPage` JSON-LD) → related tools.
Every page: unique title/description, canonical, Open Graph, JSON-LD `WebApplication` (price 0), in sitemap, linked from home.
English first (`en`); i18n (es, pt, ru) comes later — keep strings out of components where practical.

## Design
Palette D4 Indigo + Mint: brand `#3730A3` (buttons, links, dropzone border), brand-soft `#E0E7FF` (secondary), accent mint `#A7F3D0` (highlight marker in H1, success states). Dark theme via `prefers-color-scheme`. Radius 12px. Monospace for subtitle previews. Clean, calm, lots of whitespace; no stock images.

## Workflow
- One task from `docs/PLAN.md` per PR/commit series; tick it off in the plan.
- Before finishing: `npm run build`, `npm test`, `npm run lint` pass.
- Don't change these rules without being asked.
