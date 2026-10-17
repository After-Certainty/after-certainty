# Search visibility & analytics — post-deploy verification

Manual checklist for After Certainty (`apps/site`) after shipping SEO / GA / CSP changes.
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

## Analytics & CSP (clean profile / cleared site data)

Network filters: `gtag`, `collect`, `google-analytics`, `googletagmanager`, `/_vercel/insights`.

| State | Expected |
| --- | --- |
| First visit before choice | gtag may load on production; `analytics_storage` denied; no GA analytics cookies; **no custom GA events**; Consent Mode may still allow limited cookieless pings; Vercel scripts may load |
| Reject | Consent update denied; no GA analytics cookies; **GA custom events absent**; cookieless Consent Mode pings may still occur while the tag is mounted; Vercel custom reader events **still fire** |
| Accept | Consent granted; GA collect succeeds; **no CSP errors**; one GA `page_view`; dual-write reader events reach both GA and Vercel |
| Client-side nav after Accept | Additional GA page_view via Enhanced Measurement history (or explicit tracker); not duplicated on hard refresh |
| Clear `ac_cookie_consent` | Future GA hits denied; banner returns; Vercel aggregate collection continues |
| Vercel **preview** | No production GA unless `NEXT_PUBLIC_GA_ENABLE_PREVIEW=1`; filter Vercel analytics by `environment=preview` |
| `next dev` | No gtag |
| Privacy / cookie copy | Banner and `/privacy` state that the cookie choice controls **GA4**; Vercel Web Analytics & Speed Insights are separate always-on aggregate tools |

### Reader dual-write smoke (production or preview with GA opt-in)

After Accept (or with consent denied, for Vercel-only rows):

| Action | Vercel event | GA event (consent required) |
| --- | --- | --- |
| Open a chapter | `chapter_open` (`book_id`, `chapter_id`) | `chapter_open` |
| Click Next chapter | `chapter_advance` (`from_chapter_id`, `to_chapter_id`) | `next_chapter` |
| Download from reader | `book_download` (`book_id`, `format`) | `file_download` |
| Start chapter audio | `reader_audio_started` (`book_id`, `chapter_id`) | (none) |
| Source/thinker → chapter link | `corpus_navigation` with `to_id` | (none) |
| Start a question/trail path | `reading_path_started` | `question_path_start` / `trail_path_start` |

Confirm each intended action fires **once** (no duplicate `corpus_navigation` / audio events). See also [`reader-analytics-attribution-spike.md`](reader-analytics-attribution-spike.md).

Book overview: both **primary** and **secondary** download buttons must emit `book_download` once with normalized `format` (and GA `book_overview_primary_action` still fires for primary).

Source/thinker attribution: links to the same chapter from a CTA and Related chapters must share one semantic `to_id` (joinable to `chapter_open.chapter_id`). After production deploy, verify `requestPath` + `eventData/to_id` aggregates; keep type-level claims until then.

Property budget: default Plus (≤8 props). If base Pro only, set `NEXT_PUBLIC_VERCEL_ANALYTICS_PROPERTY_LIMIT=2` and confirm `corpus_navigation` uses `{edge,to_id|relation}`.

Also confirm GA4 Admin:

- Consent Mode enabled on the web stream
- Enhanced measurement: page views + “Page changes based on browser history events”
- DebugView / Realtime used for the Accept path

## Search Console

1. Confirm sitemap last-read advances after deploy/resubmit
2. “Page with redirect” rows for legacy `/books/*` are expected
3. Do **not** request indexing for observatory query URLs or favicon variants
4. Re-inspect priority entity URLs after content/canonical fixes

## Optional tooling

```bash
# Weak inbound link report (local manifest required)
cd apps/site
SEMANTIC_MANIFEST_USE_LOCAL=1 SEMANTIC_MANIFEST_OFFLINE=1 npx tsx scripts/report-weakly-linked-entities.ts
```
