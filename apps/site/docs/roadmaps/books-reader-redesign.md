# Books, curated shelves, book detail, and native reader redesign

**Status:** Complete through Phase G; **Phase H** dedicated reader shell + Radix drawers in progress/shipped  
**Created:** 2026-08-02  
**Location:** `apps/site/docs/roadmaps/books-reader-redesign.md`  
**Authority:** Specialized UX/product plan. Does **not** replace [`docs/roadmaps/remaining-product-roadmap.md`](../../../../docs/roadmaps/remaining-product-roadmap.md). Unfinished follow-ups that become cross-layer backlog should be linked from the remaining-product roadmap.

**Document role:** Audit of current Books / shelf / detail / reader surfaces against redesign mockups; phased implementation roadmap; local-first / no-backend constraints.

> **Evidence rule:** Live routes, semantic data, and tests override planning-time snapshots. Mockup page counts, ISBNs, and fabricated dates are **not** corpus truth.

---

## 1. Current-state summary

The public site already ships a full books stack under `/explore/books`. This redesign is **refinement + missing dedicated shelf routes**, not a greenfield rewrite.

| Surface       | Route                                          | Current implementation                                                                                                    |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Books index   | `/explore/books`                               | Hero, featured shelf accordion sections (`BooksShelfSection`), complete catalog with URL filters (`BooksCatalogControls`) |
| Shelves       | `/explore/books/shelves/[slug]` + `?shelf=`    | Corpus shelves in `semantic/shelves/*.yml`; dedicated routes (Phase C); catalog filter retained                           |
| Book detail   | `/explore/books/[slug]`                        | Overview/legacy layouts; Phase D densifies hero, real metadata table, shelf membership + adjacency                        |
| Native reader | `/explore/books/[slug]/chapters/[chapterSlug]` | Dedicated `(reader)` layout; compact sticky toolbar; Radix bottom drawer; site header/footer omitted on reader routes     |

**Data:** Books from `books/*/book.yml` → semantic manifest. Shelf membership is shelf-side only (never on `book.yml`). Reading trails are curated discovery content, not personal lists.

**Local persistence today:** Versioned `ac_reading_*` keys (progress, bookmarks, prefs, favorites) via `safe-local-storage`; legacy bare JSON migrates on read. Highlights/notes deferred. Device-only — no sync.

**Mobile pressure:** Global header + Explore secondary nav (`ExploreSidebar`) + tall `ExploreIndexHero` leave less first-viewport room than the mockups’ dense library feel. Site footer is omitted on chapter reader routes (Phase E).

---

## 2. Target-state summary

Use mockups for **mood, density, hierarchy, and interaction** — not pixel-perfect specs or invented metadata.

1. **Books index** — Tighter hero; curated shelf accordions with counts and compact list previews; dedicated “View all” shelf destinations; compact filter/sort; no redundant page-local title search (global search already exists).
2. **Shelf pages** — `/explore/books/shelves/[slug]` with breadcrumb, title, count, description, ordered books from structured data, related-shelf navigation.
3. **Book detail** — Clear cover + metadata + primary Read action; summary and real key ideas; shelf membership; related books/concepts/patterns/situations/trails; prev/next within a shelf when meaningful. Show ISBN/pages/dates **only** when present in corpus.
4. **Native reader** — Focused chrome; TOC; chapter nav; scroll/chapter progress (not fake page counts); local prefs; optional local favorites/highlights/notes when quality is adequate.

---

## 3. Design principles

- Compact, information-dense mobile layouts; restrained padding
- Clear visual hierarchy (serif titles, sans body, warm gold accents)
- Reusable book presentation components
- Curated shelves as a navigational layer over the catalog
- Polished reading experience with progressive enhancement
- Local-first persistence; no backend dependency
- Accessible touch targets (~44px) and keyboard behavior
- Strong mobile performance (sized covers, lazy below-fold, minimize hydration)

Preserve After Certainty identity: dark textured surfaces, elegant serif headings, readable sans body, restrained borders, atmospheric imagery.

---

## 4. Screenshot comparison

Statuses: **matches** · **visual-diff** · **partial** · **missing** · **deferred-backend** · **not-recommended**

### 4.1 Books index / curated shelves

| Feature                        | Status          | Notes                                              |
| ------------------------------ | --------------- | -------------------------------------------------- |
| Library hero + lede            | visual-diff     | Exists; taller / more padding than mockups         |
| Curated shelf accordions       | partial         | Mobile accordion + desktop grid; density differs   |
| Generated book counts          | matches         | Shown in accordion headers                         |
| Compact horizontal book rows   | partial         | `CatalogBookCard` compact; Phase A adds `list`     |
| Dedicated shelf “View all”     | matches         | Links to `/explore/books/shelves/[slug]` (Phase C) |
| Shelf icons/motifs             | missing         | Not in shelf YAML UI                               |
| Complete catalog + filter/sort | visual-diff     | Works; chrome less compact than mockup accordion   |
| Page-local title search        | not-recommended | Global search exists; deep-link `q` only           |
| Explore secondary nav          | visual-diff     | Keep for site architecture; denser treatment later |

### 4.2 Dedicated shelf page

| Feature                                | Status  | Notes               |
| -------------------------------------- | ------- | ------------------- |
| Route `/explore/books/shelves/[slug]`  | matches | Phase C             |
| Breadcrumb, title, count, description  | matches | Phase C             |
| Ordered book list from structured data | matches | `resolveShelfBooks` |
| Related shelf nav / empty states       | matches | Phase C             |

### 4.3 Book detail

| Feature                                    | Status            | Notes                                         |
| ------------------------------------------ | ----------------- | --------------------------------------------- |
| Cover, type, title, subtitle, author       | visual-diff       | Denser mobile hero (Phase D)                  |
| Primary Read + format actions              | matches           | “Read book” primary from availability         |
| Summary / orientation                      | partial           | Overview fields when authored                 |
| Key idea pills                             | partial / missing | Concepts exist; mockup chrome differs         |
| Also in this shelf / prev-next             | matches           | Shelf context via Phase A selectors (Phase D) |
| Fabricated pages/ISBN/dates                | not-recommended   | Real metadata table only; omit when absent    |
| Add to Reading Trail (personal)            | deferred-backend  | Curated trails remain browseable              |
| Favorites                                  | matches           | Device-only toggle on book detail (Phase F)   |
| Share                                      | partial           | Adapt via Web Share / copy link later         |
| Bottom Info/Contents/Highlights/Notes tabs | missing           | Highlights/notes Phase F if quality bar met   |

### 4.4 Native reader

| Feature                                | Status                | Notes                                                         |
| -------------------------------------- | --------------------- | ------------------------------------------------------------- |
| Chapter reading + TOC + prev/next      | matches / visual-diff | Dedicated shell; no site header/footer; Radix TOC drawer      |
| Local progress / bookmarks / text size | matches               | Separate localStorage modules                                 |
| Scroll % progress bar                  | matches               | Compact sticky toolbar (chapter index + scroll %)             |
| Fake page counts / pages left          | not-recommended       | No reliable pagination model; TOC shows chapter numbers only  |
| Line-height / width / theme prefs      | matches               | Drawer Text controls + Theme tab via next-themes (site theme) |
| Highlights / notes                     | missing               | Deferred — no stable selection/anchor pipeline yet            |
| Synced / account features              | deferred-backend      | Documented deferrals                                          |

---

## 5. Feature matrix

| Feature                      | Current                      | Target                          | Data                | Persistence  | Phase | Backend? | Disposition     |
| ---------------------------- | ---------------------------- | ------------------------------- | ------------------- | ------------ | ----- | -------- | --------------- |
| Shelf accordion preview      | Yes                          | Denser list rows                | shelves YAML        | —            | A→B   | No       | adapt           |
| Dedicated shelf routes       | No                           | `/explore/books/shelves/[slug]` | shelves YAML        | —            | C     | No       | implement       |
| Shelf path helpers           | No                           | `explorePaths.booksShelf`       | —                   | —            | A     | No       | implement       |
| Shelf membership / adjacency | Partial (`shelfIds`)         | Selectors for detail            | shelves + catalog   | —            | A→D   | No       | implement       |
| CatalogBookCard list layout  | compact only                 | Mockup-aligned list             | catalog VM          | —            | A     | No       | implement       |
| Books density tokens         | No                           | CSS vars                        | —                   | —            | A     | No       | implement       |
| Books index hero tighten     | Tall hero                    | Compact mobile                  | —                   | —            | B     | No       | adapt           |
| Catalog filter density       | Expanded                     | Compact accordion               | URL state           | —            | B     | No       | adapt           |
| Book detail shelf context    | No                           | Also-in-shelf + prev/next       | selectors           | —            | D     | No       | implement       |
| Metadata table               | Sparse                       | Real fields only                | book.yml / registry | —            | D     | No       | adapt           |
| Reader chrome                | Focused (sidebar/footer off) | Focused reader chrome           | —                   | —            | E     | No       | adapt           |
| Scroll progress UI           | Visible chapter + scroll %   | Visible indicator               | scroll through body | session UI   | E     | No       | implement       |
| Unified storage helper       | Versioned envelopes          | Safe typed helper               | —                   | localStorage | A→F   | No       | implement       |
| Favorites                    | Yes (device-only)            | Local favorites                 | book IDs            | localStorage | F     | No       | implement       |
| Highlights / notes           | No                           | Local only if quality OK        | anchors             | localStorage | F     | No       | defer           |
| Personal reading trail       | No                           | —                               | —                   | —            | —     | Yes      | defer           |
| Account sync                 | No                           | —                               | —                   | —            | —     | Yes      | defer           |
| Fake page counts             | No                           | Never invent                    | —                   | —            | —     | —        | not-recommended |

---

## 6. Metadata gaps (do not invent)

| Field            | Corpus reality                       | UI rule                               |
| ---------------- | ------------------------------------ | ------------------------------------- |
| ISBN             | Sparse (`book.isbns` on few titles)  | Show only when present                |
| Page count       | Not a public catalog field           | Omit; do not show mockup “224 pages”  |
| Publication date | Sparse / registry-backed             | Show only when confirmed              |
| Formats          | Derived from builds + purchase links | Use `semantic-book-action-links`      |
| Chapter totals   | From manifest chapters when public   | Prefer real chapter counts over pages |

Propose semantic-manifest / `book.yml` additions when useful metadata is missing — do not hard-code fake values in the site.

---

## 7. Backend-dependent deferrals

Explicitly defer:

- Account creation / authentication
- Server-synced progress or favorites
- Cross-device reading state
- Collaborative / personal “Add to Reading Trail”
- Shared annotations / public notes
- Cloud backups
- Profile-based recommendations
- Backend activity feeds
- Offline PWA (READ-017 — see `apps/site/docs/offline-reading-spike.md`)

Curated reading trails remain browseable as content. Do not add a misleading personal trail action unless a clear local-only UX exists.

---

## 8. Local-only feature opportunities

Device-scoped features (label clearly; never imply sync):

- Reading progress / last-read location (shipped)
- Bookmarks (shipped)
- Reader text size (shipped)
- Favorites (Phase F — shipped, device-only)
- Highlights / notes (deferred past Phase F)
- Richer appearance: line-height, reading width (Phase F); reader theme deferred (site theme global)
- Safe storage abstraction + schema versioning (Phase F migration complete)

---

## 9. Phased implementation plan

### Phase A — Shared foundations (complete — PR #460)

**Objective:** Path helpers, shelf membership/adjacency selectors, list-row card layout, density tokens, thin safe localStorage helper — without redesigning full pages.

**Likely files:** `lib/graph/explorePaths.ts`, `lib/books/shelves.ts`, `components/books/catalog-book-card.tsx`, `components/books/books-shelf-section.tsx`, `styles/tokens.css`, `lib/storage/safe-local-storage.ts`, tests, this roadmap.

**Acceptance:**

- `explorePaths.booksShelf(slug)` → `/explore/books/shelves/${slug}`
- Selectors return shelves-for-book and adjacent books in curated order
- `CatalogBookCard` supports `layout="list"`; mobile shelf previews use it
- Density tokens defined and lightly applied
- Safe storage helper available; existing reading keys **not** migrated yet
- “View all” still uses `?shelf=` (Phase C switches links)

**Risks:** Over-scoping into Phase B visual rewrite.  
**Dependencies:** None.  
**Tests:** Unit tests for paths/selectors/storage; component tests for list card / shelf section.  
**Routes / manifests:** Path convention only; no new App Router page; no semantic YAML changes.

### Phase B — Books index refinement (complete — PR #461)

**Objective:** Tighten hero, accordion density, catalog controls, footer dominance on mobile.

**Likely files:** `explore-hero.tsx` (`density="compact"` for Books only), `books/page.tsx`, `books-shelf-section.tsx`, `books-catalog-controls.tsx`, `explore-sidebar.tsx`, `site-footer.tsx`, `explore-layout.tsx`.

**Acceptance:** Books index usable at 320–430px without excess whitespace; accordion keyboard intact; no horizontal overflow; other Explore index heroes unchanged (default density).  
**Risks:** Breaking shared Explore hero for other index pages — mitigated by opt-in `density`.  
**Routes / manifests:** No.

### Phase C — Dedicated shelf pages (complete — PR #462)

**Objective:** `/explore/books/shelves/[slug]` pages; switch “View all” to shelf routes; update public-registry canonical URLs; keep `?shelf=` as catalog filter.

**Likely files:** `app/explore/(browse)/books/shelves/[slug]/page.tsx`, `books-shelf-section.tsx`, `public-registry.ts`, `sitemap.ts`, E2E.

**Acceptance:** Breadcrumb, title, count, description, ordered list, empty/error states; View all → dedicated route; `?shelf=` filter retained; shelves in sitemap.  
**Risks:** SEO / sitemap / registry URL drift.  
**Routes / manifests:** New routes; registry URL updates; no invented shelf data.

### Phase D — Book detail redesign (complete — PR #463)

**Objective:** Cover/metadata layout, stronger Read CTA, real metadata table, shelf membership, related entities, prev/next in shelf.

**Likely files:** `book-overview-layout.tsx`, `book-detail-legacy-layout.tsx`, `book-metadata-rows.ts`, `book-metadata-table.tsx`, `book-shelf-context.tsx`, `books/[slug]/page.tsx`, action-link labels, E2E/unit tests.

**Acceptance:** No fabricated fields; actions from availability; adjacency uses Phase A selectors; denser mobile hero; “Read book” primary CTA.  
**Risks:** Overview vs legacy layout divergence — mitigated by shared metadata/shelf components.  
**Routes / manifests:** Optional metadata proposals only if needed.

### Phase E — Reader shell and TOC (complete — PR #464)

**Objective:** Focused reader chrome, progress UI (chapter + scroll %), responsive header, exit behavior, a11y.

**Likely files:** `chapter-reader-shell.tsx`, `reading-progress-chrome.tsx`, `chapter-toc.tsx`, `explore-sidebar-gate.tsx`, `reader-aware-footer.tsx`, `site-shell.tsx`, `scroll-progress.ts`, E2E/unit tests, this roadmap.

**Acceptance:** No fake page counts; TOC keyboard/focus management; progress from real scroll through chapter content; Explore sidebar + site footer hidden on reader routes; sticky exit + chapter position + scroll %.  
**Risks:** Fighting global site shell; mobile Safari chrome — mitigated by sticky bar under existing header, footer omit only.  
**Routes / manifests:** No.

### Phase F — Local-only reader features (complete — PR #465)

**Objective:** Favorites; richer prefs; migrate onto versioned storage helper. Label as device-only. Defer highlights/notes (no stable selection/anchor pipeline).

**Likely files:** `safe-local-storage.ts`, `readingProgress.ts`, `readingBookmarks.ts`, `readingPreferences.ts`, `readingFavorites.ts`, `reading-preferences-controls.tsx`, `book-favorite-control.tsx`, book overview/legacy actions, tests, this roadmap.

**Acceptance:** Versioned envelopes + legacy migration on read; favorites toggle with device-only copy; line-height + reading-width prefs; reset appearance; no hydration mismatch; highlights deferred.  
**Risks:** Storage quota (swallowed); prefs width shifts sticky chrome — covered by unit tests.  
**Routes / manifests:** No.

### Phase G — Polish and validation (complete)

**Objective:** Reduced motion, scroll restoration, focus management, light skeletons, a11y checklist + E2E depth. Visual regression suite and real Mobile Safari deferred (manual checklist).

**Likely files:** `lib/a11y/focus-trap.ts`, `in-book-search.tsx`, `chapter-toc.tsx`, `restore-reading-scroll.tsx`, `catalog-book-card.tsx`, catalog/chapter `loading.tsx` (catalog loader scoped under `books/(catalog)/` so shelves/`[slug]` keep real status codes), `reader-a11y-checklist.md`, `e2e/reader-a11y.spec.ts`, this roadmap.

**Acceptance:** In-book search Tab trap + focus restore; soft `scrollY` restore when no hash; motion-reduce on catalog/skip/loaders; checklist updated; E2E reduced-motion + search Escape.  
**Risks:** Soft scroll restore racing layout — one rAF + hash precedence.  
**Routes / manifests:** No.

### Phase H — Dedicated reader shell + Radix drawers (this PR)

**Objective:** Match dedicated-reader mockup interaction: no standard site header/footer; compact sticky toolbar; Radix Dialog bottom drawer for Text/Contents/Theme/Settings; live prefs; end-of-chapter cleanup (downloads off reader; quieter copy-link).

**Likely files:** `app/explore/(reader)/**`, `site-shell.tsx`, `reader-aware-header.tsx`, `reader-drawer.tsx`, `reader-toolbar.tsx`, `reader-controls-drawer.tsx`, `reader-chrome.tsx`, `chapter-reader-shell.tsx`, `globals.css`, E2E/unit tests, this roadmap.

**Acceptance:** Reader omits site chrome; book detail restores it; exit → book detail; position preserved locally; Radix drawer focus/Escape; contents from real chapters; no fake page counts; downloads not end-of-chapter primary; safe-area + `viewport-fit=cover`; build green.  
**Risks:** Pathname-based header omit remains (SiteShell is root-level); mitigated by matching footer gate + `(reader)` layout boundary for Explore chrome.  
**Routes / manifests:** Same public URLs; route group move only.

**Follow-ups:** Optional desktop side panel for contents; swipe-to-dismiss; reader-scoped theme distinct from site theme; highlights/notes.

---

## 10. Route conventions (locked)

| Purpose              | Pattern                                        |
| -------------------- | ---------------------------------------------- |
| Books index          | `/explore/books`                               |
| Catalog shelf filter | `/explore/books?shelf=<slug>` (retained)       |
| Dedicated shelf page | `/explore/books/shelves/[slug]` (Phase C)      |
| Book detail          | `/explore/books/[slug]`                        |
| Chapter reader       | `/explore/books/[slug]/chapters/[chapterSlug]` |

---

## 11. Phase A implementation notes

Phase A deliberately:

- Does **not** mount shelf App Router pages
- Does **not** redesign hero, detail, or reader chrome
- Does **not** invent ISBN/page metadata
- Does **not** migrate `ac_reading_*` keys onto the new storage helper yet

It enables Phases B–D/F to share one card API, path model, membership helpers, density tokens, and storage primitive.
