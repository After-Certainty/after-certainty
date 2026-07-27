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

Network filters: `gtag`, `collect`, `google-analytics`, `googletagmanager`.

| State | Expected |
| --- | --- |
| First visit before choice | gtag may load on production; `analytics_storage` denied; no analytics cookies |
| Reject | Consent update denied; no analytics cookies; custom events absent |
| Accept | Consent granted; GA collect succeeds; **no CSP errors**; one `page_view` |
| Client-side nav after Accept | Additional page_view via Enhanced Measurement history (or explicit tracker); not duplicated on hard refresh |
| Clear `ac_cookie_consent` | Future hits denied; banner returns |
| Vercel **preview** | No production GA unless `NEXT_PUBLIC_GA_ENABLE_PREVIEW=1` |
| `next dev` | No gtag |

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
