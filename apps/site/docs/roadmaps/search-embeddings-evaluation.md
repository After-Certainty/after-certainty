# Search embeddings evaluation (Phase F)

When metadata + aliases plateau on thematic natural-language queries, consider embedding retrieval as a **secondary** signal — not a replacement for MiniSearch lexical search.

## Current baseline (keep)

| Layer                                    | Role                                       |
| ---------------------------------------- | ------------------------------------------ |
| MiniSearch over ISR JSON index           | Exact / fuzzy / prefix lexical match       |
| Authored `alias` / `related` bridges     | Vocabulary without silent synonym collapse |
| Capped enrichment (`recognitionSignals`) | Light thematic text without manuscripts    |
| Typed situations                         | Applied scenarios (e.g. temporary fixes)   |

Measured client index stays under the gzip alert budget (`lib/search/budget.ts`). Embeddings must not push the transferable index over migration thresholds without an explicit architecture change.

## Decision criteria (promote embeddings only if…)

1. **Thematic miss rate** stays high after Phase E alias growth and situations (soft fixtures + GA `search_no_results` buckets).
2. **Corpus text** suitable for embedding exists under copyright-safe rules (summaries, situation enrichment — **not** full manuscripts or third-party transcripts without clearance).
3. **Ops cost** is acceptable: embedding generation at revalidate time, storage, and optional query-time vector search — preferably on Vercel without privileged client keys.
4. **Privacy** remains GA-bucket-first; query vectors / raw queries are not logged by default.

## Candidate architectures (evaluation only)

| Option                                         | Pros                                       | Cons                                                |
| ---------------------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| **A. Server embedding index + client lexical** | Strong thematic; keep MiniSearch for exact | Two indexes; revalidate complexity                  |
| **B. Precomputed neighbor packs**              | Tiny payload; no query-time model          | Stale neighbors; weak for novel queries             |
| **C. Hosted vector search**                    | Managed scale                              | Vendor lock-in; keys; cost — crosses §9.3 migration |

**Recommendation for now:** stay on A–E stack. Revisit when situations/pathways grow and soft thematic fixtures (e.g. moral licensing, scoreboard) remain empty after content exists.

## Out of scope until upstream ready

- Chapter summaries (none in manifests today)
- Podcast / essay full transcripts
- Manuscript body text

See also: `docs/roadmaps/global-search-plan.md` Phase F, `docs/roadmaps/search-quality-workflow.md`.
