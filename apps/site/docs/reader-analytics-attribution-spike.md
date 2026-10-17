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

1. Require `data-analytics-to-id` on the link with the **same semantic id family** as `chapter_open.chapter_id` / book ids.
2. Do **not** fall back to path-derived `{bookSlug}/{chapterSlug}` — that id family does not join `chapter_open`.
3. If the attribute is missing, emit type-level navigation only (no `to_id`).
4. Emit `to_id` on `corpus_navigation` with `from_type`, `to_type`, `relation` when Plus (8-prop) budget applies.

**Property budget:** Default assumes Plus (≤8). Set `NEXT_PUBLIC_VERCEL_ANALYTICS_PROPERTY_LIMIT=2` for base Pro; the facade then sends `{edge, to_id}` or `{edge, relation}` so destination identity is not silently truncated.

**Non-attribution edges** (e.g. concept → chapter) remain type-only — no `to_id`.

## Reporting language

- With canonical `to_id`: may report “source/thinker → specific chapter/book” as **event counts / visitors**, not session journeys — after verifying `requestPath` + `eventData/to_id` in production.
- Without `to_id` (legacy rows or missing attribute): **type-level only**.
