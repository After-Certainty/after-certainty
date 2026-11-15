# Search visibility & analytics — post-deploy verification

Manual checklist for After Certainty (`apps/site`) after shipping SEO / analytics / CSP changes.
Do not request indexing for favicon query URLs or observatory UI-state URLs.

## Redirects & host

1. `curl -sI http://after-certainty.com/` and `http://www.after-certainty.com/` → single hop to `https://www.after-certainty.com/…`
2. Legacy samples (expect **308**, Location exact Explore path, not `/`):
   - `/books/when-authority-outlives-accountability` → `/explore/books/when-authority-outlives-accountability`
   - `/books/when-others-look-to-you/patterns/exceptions-are-forever` → `/explore/patterns/exceptions-are-forever`
   - `/books/why-collaboration-is-so-hard` → `/explore/books/why-collaboration-is-so-hard`
3. Spot-check HTML source: internal links use `/explore/…`, not `/books/…`

## Sitemap & canonical

1. `https://www.after-certainty.com/sitemap.xml` — 200, XML, host `www.after-certainty.com`
2. Includes `/explore/books/boundary-conditions`, `/explore/concepts/interpretation`, `/explore/concepts/shift-left`, Brehm source, `/privacy`
3. No `?` query URLs, no `/books/`, no favicon
4. `robots.txt` lists the same sitemap URL
5. Entity page view-source: `<link rel="canonical" href="…/explore/…/slug">`
6. Observatory URL view-source: `noindex,follow` + canonical to entity (or `/explore`)

Example observatory URL:

`/explore?focusKind=concept&focusSlug=correction&view=observatory`

## Indexability sample

For boundary-conditions, interpretation, shift-left, Brehm source:

- HTTP 200
- Self-canonical (sources/books/concepts as applicable)
- Distinct title, meta description, H1
- Main definition/overview in **initial HTML** (disable JS)
- JSON-LD present
- In sitemap
- `shift-left` / enriched concepts: recognition signals (or other enrichment) visible in HTML when authored

Thin source stubs (citation + links) may remain “Crawled – currently not indexed” — that is acceptable.

## Analytics & CSP (Gate 4 — Vercel only)

Network filters: `gtag`, `collect`, `google-analytics`, `googletagmanager`, `/_vercel/insights`.

| Check | Expected |
| --- | --- |
| Production hard load | **No** `googletagmanager` / `google-analytics` / `g/collect` requests |
| Cookie banner | **Absent** (GA consent banner removed) |
| Vercel scripts | `/_vercel/insights/script.js` (and Speed Insights) may load |
| Custom reader events | POSTs to `/_vercel/insights/event` for primary vocabulary |
| CSP | No GA hosts; allows `va.vercel-scripts.com` + `vitals.vercel-insights.com` |
| `/privacy` | Documents Vercel Web Analytics & Speed Insights; states GA is retired |
| Preview | Filter Vercel analytics by `environment=preview` |
| `next dev` | No GA; Vercel analytics may be mode-dependent |

### Reader event smoke (production)

| Action | Vercel event |
| --- | --- |
| Open a chapter | `chapter_open` (`book_id`, `chapter_id`) |
| Click Next chapter | `chapter_advance` (`from_chapter_id`, `to_chapter_id`) |
| Download from reader | `book_download` (`book_id`, `format`) |
| Start chapter audio | `reader_audio_started` (`book_id`, `chapter_id`) |
| Source/thinker → chapter link | `corpus_navigation` with `to_id` |
| Start a question/trail path | `reading_path_started` (`path_kind`, `path_id`) |
| Run on-site search (full/quick/in-book) | `site_search` (buckets only — never raw query text) |

Confirm each intended action fires **once**. See also [`reader-analytics-attribution-spike.md`](reader-analytics-attribution-spike.md).

**Note:** Headless Playwright with `navigator.webdriver` may leave `window.va` as the queue stub (insights collector not replacing it). Organic browsers and stealth init flush `/_vercel/insights/event` normally.

Book overview: both **primary** and **secondary** download buttons must emit `book_download` once with normalized `format`.

Source/thinker attribution: links to the same chapter from a CTA and Related chapters must share one semantic `to_id` (joinable to `chapter_open.chapter_id`).

Property budget: default Plus (≤8 props). If base Pro only, set `NEXT_PUBLIC_VERCEL_ANALYTICS_PROPERTY_LIMIT=2` and confirm `corpus_navigation` uses `{edge,to_id|relation}`.

### Rollback (if GA must return)

Restore from git prior to the Gate 4 retire PR: `GoogleAnalyticsLoader`, Consent Mode defaults, cookie banner, CSP GA hosts, `NEXT_PUBLIC_GA_*`, and dual-write `sendGAEvent` paths.

## Search Console

1. Confirm sitemap last-read advances after deploy/resubmit
2. “Page with redirect” rows for legacy `/books/*` are expected
3. GSC covers **external** Google queries/rankings only — not on-site `/search` behavior (`site_search` covers that)
