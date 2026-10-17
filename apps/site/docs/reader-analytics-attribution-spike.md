# Source/thinker → specific chapter attribution spike (PR 1)

**Status:** Complete for instrumentation decision  
**Date:** 2026-10-17  
**Roadmap:** [`docs/roadmaps/vercel-reader-analytics-migration.md`](../../../docs/roadmaps/vercel-reader-analytics-migration.md) §6.5  
**Project:** `after-certainty` (`prj_RgOjCRadnw2ILa8vK9jy4GqipdLl`)

## Question

Can type-only `corpus_navigation` (`from_type`, `to_type`, `relation`) prove that a **specific** source or thinker page led a reader into a **specific** chapter?

## Method

Queried Vercel Web Analytics aggregate API (PADE `vercel.diagnostics`, production) for 2026-09-01 → 2026-10-17:

| Query | Result |
|-------|--------|
| `corpus_navigation` by `eventData/from_type` | source (2), book (2), listen (1) |
| `corpus_navigation` by `eventData/to_type` | chapter (2), book/song/thinker (1 each) |
| `corpus_navigation` by `eventData/to_id` | All rows empty (`""`) — property never sent historically |
| Visits by path/route for sources | Useful for “which source pages were viewed,” not which chapter was clicked from that page |

Volume is sparse; conclusions are about **attributability**, not traffic volume.

## What type-only properties can prove

- Aggregate counts of transitions such as `source` → `chapter` (type-level edges).
- Relation flavor (`related` / `creator` / `read`) when present.
- Combined with visit aggregates: which source/thinker **pages** attracted views (not which outbound chapter was chosen).

## What they cannot prove

- That visitors from **source X** opened **chapter Y**.
- Pageview co-occurrence (source path then chapter path) is **not** a click relationship.
- Empty `to_id` confirms no historical target identity exists in the event stream.

## Decision (implemented in PR 1)

For **attribution edges only** (`from_type` ∈ {`source`,`thinker`} and `to_type` ∈ {`chapter`,`book`}):

1. Prefer `data-analytics-to-id` on the link (semantic chapter/book id when authored in the DOM).
2. Else derive a bounded path id: `{bookSlug}/{chapterSlug}` or `{bookSlug}` — inspected locally; never send arbitrary URLs or titles.
3. Emit optional `to_id` on `corpus_navigation` alongside `from_type`, `to_type`, `relation`.

**Property budget:** 4 properties on these edges. Web Analytics Plus was re-checked on 2026-10-17 (`invoiceItems.analytics` present on Pro). If Plus is later disabled, fall back to `edge` + `to_id` (2 props) in a follow-up — do not silently drop destination identity.

**Non-attribution edges** (e.g. concept → chapter) remain type-only — no `to_id`.

## Reporting language

- With `to_id`: may report “source/thinker → specific chapter/book” as **event counts / visitors**, not session journeys.
- Without `to_id` (legacy rows): **type-level only**.
