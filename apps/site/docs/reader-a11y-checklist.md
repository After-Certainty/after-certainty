# Native Reader accessibility checklist (READ-008)

Baseline for public chapter reading pages at
`/explore/books/{editionSlug}/chapters/{chapterSlug}`.

Covered by unit tests (`render-manuscript-html`) and Playwright
(`e2e/reader-a11y.spec.ts`). Phase 2 reading controls (theme, text size) are out of
scope here.

## Landmarks and structure

- [x] Page main landmark via site shell (`#main`)
- [x] Chapter chrome is an `article` labelled by the chapter `h1` (`aria-labelledby`)
- [x] In-reader TOC is a `nav` with an accessible name
- [x] Prev/next controls are a `nav` with an accessible name
- [x] Manuscript body target `#chapter-content` is focusable (`tabindex="-1"`) for skip

## Skip links

- [x] Site “Skip to content” → `#main`
- [x] In-reader “Skip to chapter text” → `#chapter-content` (past breadcrumbs/header/TOC)

## Footnotes

- [x] Footnote reference `href` targets match note `id`s (no sanitize clobber double-prefix)
- [x] Back-references return to the matching ref
- [x] Footnote links use underline in addition to accent color (not color alone)
- [x] Footnote links show a visible `:focus-visible` outline (global focus style)

## Focus and motion

- [x] Interactive controls are reachable in a sensible order (skip → chrome → TOC → body → adjacent)
- [x] `scroll-behavior: smooth` is disabled when `prefers-reduced-motion: reduce`
- [x] Reader body type uses rem so browser zoom scales cleanly

## Heading order

- [x] One `h1` for the chapter title in reader chrome
- [x] Manuscript heading ids from the pipeline (rehype-slug); leading H1 stripped to avoid duplicate titles

## Phase 2 (partial)

- [x] Reading progress persistence (READ-011) — localStorage only
- [x] Continue reading entry points (READ-012) — Start Here + book pages; keyboard-focusable links/buttons
- [ ] Bookmarks, text-size controls (READ-013+)
