# Native Reader accessibility checklist (READ-008 + redesign Phases E–G)

Baseline for public chapter reading pages at
`/explore/books/{editionSlug}/chapters/{chapterSlug}`.

Covered by unit tests (`render-manuscript-html`, focus-trap, TOC/search dialogs) and
Playwright (`e2e/reader-a11y.spec.ts`, `e2e/reader-smoke.spec.ts`).

## Landmarks and structure

- [x] Page main landmark via site shell (`#main`)
- [x] Chapter chrome is an `article` labelled by the chapter `h1` (`aria-labelledby`)
- [x] In-reader TOC is a `nav` with an accessible name
- [x] Prev/next controls are a `nav` with an accessible name
- [x] Manuscript body target `#chapter-content` is focusable (`tabindex="-1"`) for skip
- [x] Sticky reading progress chrome exposes `role="progressbar"` (chapter scroll %)

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
- [x] TOC mobile drawer: Escape closes; Tab cycles inside dialog; focus returns to Contents
- [x] In-book search dialog: Escape closes; Tab cycles inside dialog; focus returns to trigger
- [x] Progress bar width transition respects `motion-reduce:transition-none`
- [x] Catalog cover hover fades / site skip-link transform respect reduced motion

## Heading order

- [x] One `h1` for the chapter title in reader chrome
- [x] Manuscript heading ids from the pipeline (rehype-slug); leading H1 stripped to avoid duplicate titles

## Scroll restoration (Phase G)

- [x] Continue-reading hrefs include `#fragment` when progress has a fragment
- [x] Soft `scrollY` restore on chapter load when there is **no** URL hash (hash wins)
- [x] Restore uses instant scroll (`behavior: "auto"`) — no smooth-scroll fight with reduced motion
- [x] `scrollY` remains persist-only when a fragment hash is present

## Phase 2 reading controls (READ-011–017)

- [x] Reading progress persistence (READ-011) — versioned localStorage
- [x] Continue reading entry points (READ-012) — Start Here + book pages; keyboard-focusable links/buttons
- [x] Local bookmarks (READ-013) — chapter/section toggle in reader; list on book pages
- [x] Text-size / line-height / width controls (READ-014 + Phase F) — rem + CSS vars; site light/dark remains global
- [x] TOC drawer + copy section link (READ-015) — mobile Contents dialog; clipboard for chapter/section URLs
- [x] In-book search (READ-016) — edition-scoped chapter titles/summaries dialog; keyboard listbox + focus trap
- [x] Offline spike (READ-017) — researched; recommendation defer (no SW ship); see `offline-reading-spike.md`
- [x] Device-only favorites (Phase F) — book detail toggle; labeled “this device only”

## Mobile Safari (manual / deferred automation)

Playwright in CI is Chromium desktop (+ existing mobile viewport cases). Confirm on a real iPhone Safari when convenient:

- [ ] Sticky reader chrome under the site header does not jump with URL bar show/hide
- [ ] TOC drawer and in-book search scroll lock / focus behave with Soft Keyboard
- [ ] Soft `scrollY` restore lands near the prior reading position after continue

Visual regression suite (Percy/Chromatic/`toHaveScreenshot`) is **out of scope** for Phase G — smoke + checklist acceptance only.
