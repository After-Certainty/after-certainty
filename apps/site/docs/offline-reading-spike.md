# Offline reading spike (READ-017)

**Status:** Deferred evaluation — complete spike with **defer (no-ship)** recommendation  
**Not an implementation plan.** Reopen only when [When to reopen](#when-to-reopen) criteria are met.

Related: [`docs/roadmaps/remaining-product-roadmap.md`](../../../docs/roadmaps/remaining-product-roadmap.md) (Later / completion ledger READ-017);
reader chrome in `apps/site/components/reading/`.

## Verdict

| Decision | Detail |
|----------|--------|
| **Recommendation** | **Defer (no-ship)** |
| **Confidence** | High |
| **Why** | EPUB/PDF downloads already give true offline reading. A native-reader SW is technically feasible on Next 16 + Vercel, but adds deploy-cache, CSP, and SSR invalidation cost without a clear user gap after Phase 2. |

Revisit only if the criteria in [When to reopen](#when-to-reopen) are met.

---

## Goal of the spike

Answer: can we cache pilot chapter HTML (plus shells/assets) so a returning
reader can reopen those chapters without network — and should we?

Acceptance for READ-017: written ship/no-ship recommendation (this doc).

---

## Current architecture (relevant facts)

| Area | Finding |
|------|---------|
| **App** | Next.js 16 App Router, React 19, hosted on Vercel (`apps/site/vercel.json`) |
| **Output** | Server-rendered (no `output: "export"`). Chapter routes are **on-demand SSR**, not `generateStaticParams` |
| **Chapter body** | Server Component loads markdown from FS → sanitized HTML in the document (`load-chapter-manuscript.ts`). No client fetch of manuscript text |
| **Manifest** | Build-time local semantic manifest (`SEMANTIC_MANIFEST_USE_LOCAL` / offline-manifest) — “offline” here means **local graph load**, not reader PWA |
| **PWA / SW today** | **None** — no Serwist, Workbox, `next-pwa`, or web app manifest |
| **Downloads** | EPUB/PDF/DOCX via **GitHub Releases** URLs — true offline once the user has downloaded a file |
| **CSP** | `default-src 'self'`; no explicit `worker-src` (falls back to script/default). Same-origin SW registration should be allowed; no `Service-Worker-Allowed` header yet |
| **Search** | In-book search `fetch`es `/api/search/index` (`Cache-Control: s-maxage=3600`). Breaks offline unless the index JSON is also cached |
| **Local reader state** | Progress, bookmarks, text size already use `localStorage` — fine offline **after** the page is available |

Corpus scale (checkout): ~30 book dirs, hundreds of public chapter routes once all editions are live. A single nonfiction title is typically on the order of **dozens** of chapter URLs, not hundreds.

---

## Feasibility

### What would work well

1. **Already-visited chapter documents** — SSR HTML embeds the manuscript. A runtime Cache Storage strategy (`network-first` or `stale-while-revalidate` for navigations under `/explore/books/*/chapters/*`) could reopen chapters the user has already opened, plus shared `/_next/static/*` and `/manuscript-assets/...`.
2. **Local chrome** — continue-reading, bookmarks, and text size need no network once HTML is cached.
3. **Same-origin assets** — manuscript images are installed under `public/manuscript-assets/` and rewrite to same-origin URLs.

### What is awkward

1. **SSR + deploy churn** — every deploy may change RSC payloads / hashed `/_next/static` chunks. Precache manifests must bust on build; stale shells risk blank or mismatched client/server trees. This is the main engineering risk on App Router.
2. **No static chapter export** — there is no ready-made list of HTML files to precache at build time without either (a) adding `generateStaticParams` + static generation for a pilot cohort, or (b) building a custom precache URL list and warming Cache Storage after first visit.
3. **Tooling** — `next-pwa` is a poor fit for Next 16 Turbopack. A modern path is **Serwist** (`@serwist/next` or `@serwist/turbopack`). Still new surface area: registration, middleware exclusions, SW update UX, QA on iOS Safari.
4. **In-book search offline** — requires caching `/api/search/index` (or a per-edition slice). Doable; not free.
5. **EPUB offline is separate** — SW cannot usefully `fetch` GitHub release assets without CSP/`connect-src` + CORS changes; downloads should stay user-initiated top-level navigations.
6. **Full-catalog precache** — install time and Cache Storage pressure make “download all books” a poor default.

### Pilot shapes (if ever built)

| Option | Scope | Effort | Offline value |
|--------|-------|--------|----------------|
| **A. Visited-pages only** | Runtime cache chapter navigations + static assets after first open | M | Resume reading on flaky networks; no install UI |
| **B. Precache one pilot book** | Warm N chapter URLs + assets for e.g. After Certainty | M–L | True “save this book” without EPUB |
| **C. Installable PWA** | Web manifest, icons, add-to-home-screen, offline fallback route | L | App-like shell; highest product/ops cost |

**If** a follow-on were approved, start with **A**, optionally add **B** for one edition. Do not start with **C**.

Suggested stack for a future ticket: Serwist + explicit production-only registration; cache chapter HTML + `/_next/static` + `/manuscript-assets`; optional cache of `/api/search/index`; soft-fail analytics/consent when offline; CSP smoke tests; no GitHub EPUB caching in the SW.

---

## Alternatives that already exist

| Path | Offline? | Notes |
|------|----------|-------|
| **EPUB / PDF / DOCX download** | Yes (file-based) | Primary offline story today; no SW required |
| **Browser “Reading List” / tabs** | Partial | OS-dependent; not product-controlled |
| **Native reader + localStorage** | Online-first | Progress/bookmarks survive; chapter HTML does not without a cache layer |

Product implication: users who need guaranteed offline reading are already pointed at downloads. The native reader’s Phase 2 value is **return visits and comfort on a live network**, which is largely shipped (READ-011–016).

---

## Risks if we shipped anyway

- Stale or broken chapter shells after deploy (RSC / chunk hash mismatch)
- Silent SW bugs on iOS (storage quotas, aggressive eviction)
- Support burden (“why is my chapter old?”) without a clear update UI
- Scope creep toward full PWA / accounts / sync (explicitly out of roadmap scope)
- Distraction from Phase 3 corpus / enrichment work

---

## When to reopen

Reopen a **implementation** ticket only if **all** of the following hold:

1. Product explicitly wants native-reader offline (not “downloads are enough”).
2. Analytics or support shows readers losing mid-session work on poor networks **after** continue-reading/bookmarks are live.
3. Engineering accepts Option **A** (visited-pages) as the first ship, with a single pilot book for Option **B** only if A proves stable.
4. Capacity exists for Serwist integration, CSP/header review, and regression E2E (online + offline).

Otherwise keep **Full offline PWA reading** on the deferred list.

---

## Out of scope for any near-term pilot

- Cloud-synced progress or bookmarks
- Caching GitHub release EPUB/PDF inside the SW
- Full-catalog precache
- Offline manuscript full-text search beyond a cached search index JSON
- Native mobile app

---

## References (code)

- Chapter route: `apps/site/app/explore/(browse)/books/[slug]/chapters/[chapterSlug]/page.tsx`
- Manuscript load: `apps/site/lib/reading/load-chapter-manuscript.ts`
- Security headers / CSP: `apps/site/lib/security/headers.ts`
- Search index API: `apps/site/app/api/search/index/route.ts`
- Reader local state: `apps/site/lib/reading/readingProgress.ts`, `readingBookmarks.ts`, `readingPreferences.ts`
- “Offline manifest” (graph, not PWA): `apps/site/lib/graph/offline-manifest.ts`
