# Search quality workflow (Phase E)

How unresolved and weak searches become better aliases, descriptions, and ranking — without turning analytics into a query log.

## Principles

1. **Do not log raw queries to GA by default.** Production events use buckets (`query_length_bucket`, `has_results`, `result_count_bucket`) only. See `lib/analytics/events.ts`.
2. **`related` ≠ `alias`.** Aliases claim interchangeable names (e.g. `wolty`). Related phrases are everyday bridges that must surface as “Related to …” in the UI, never as silent synonyms.
3. **Metadata-first.** Prefer authored bridges and clearer entity text over indexing manuscripts or unbounded enrichment.
4. **Fixtures gate quality.** Soft fixtures document known gaps; promote to required only when the corpus + aliases honestly support them.

## Signals we already have

| Signal                                   | Source                          | Use                                      |
| ---------------------------------------- | ------------------------------- | ---------------------------------------- |
| `search_no_results` rate                 | GA (consent-gated)              | Volume of unresolved sessions by surface |
| `search_query` with `has_results: false` | GA                              | Same, with length buckets                |
| Soft ranking fixtures                    | `lib/search/rankingFixtures.ts` | Known thematic / vocabulary gaps         |
| Editorial browsing                       | Local `/search` + quick search  | Phrase intuition before authoring        |

## Unresolved-query review channel (privacy-safe)

If product owners need to inspect _what_ people searched when nothing matched:

| Option                            | When                                                 | Rules                                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Stay bucket-only (default)** | Low volume / early V1                                | Improve from fixtures + editorial conjecture; no raw strings stored                                                                                         |
| **B. Sampled first-party log**    | Sustained no-result rate that buckets cannot explain | Separate store (not GA); sample ≤10%; strip PII-looking tokens; retention ≤30 days; access-controlled; document retention in security notes before enabling |
| **C. Opt-in feedback**            | Rare                                                 | “Tell us what you were looking for” on the empty state — explicit, consenting, not ambient logging                                                          |

**Do not** enable option B by piping raw `q=` into Google Analytics custom dimensions.

Until B/C exist, treat **soft fixtures + alias growth** as the unresolved workflow:

1. Reproduce the weak query on `/search`.
2. Decide whether the gap is vocabulary (alias/related), missing entity (content repo), or honest no-result.
3. Prefer `related` for paraphrases; `alias` only for true alternate names.
4. Add a ranking fixture (soft first) and promote when green.
5. Re-check gzip budget (`lib/search/budget.test.ts`).

## Alias authoring checklist

Edit `data/search-aliases.json`:

- [ ] Terms are phrases a visitor would type, not internal jargon dumps
- [ ] `kind` is correct (`alias` vs `related`)
- [ ] `targetIds` are stable graph/podcast ids
- [ ] Note explains why the bridge is not a synonym claim when `related`
- [ ] Ranking fixture covers the new phrase
- [ ] UI shows “Related to …” / “Also known as …” appropriately (no silent collapse)

## Ranking & snippet iteration

1. Run `npx vitest run lib/search/rankingFixtures.test.ts`.
2. Soft failures: either grow aliases/enrichment or keep soft with a clear `note`.
3. Snippets come from `lib/search/snippets.ts` (query-aware window + React `<mark>` ranges — never HTML injection).
4. Capped recognition signals live in `lib/search/enrichment.ts` (`SEARCH_ENRICHMENT_MAX_CHARS`).

## Out-of-corpus examples (keep soft)

These remain soft until the semantic corpus authors the entities:

- `moral licensing`
- `scoreboard`

Honest empty results are preferred over inventing synonym targets.

## Feedback into the commons

Unresolved themes should inform, in order:

1. New `related` / `alias` entries
2. Clearer short definitions / pattern summaries upstream
3. Start Here trails and nav when a theme is repeatedly sought
4. New concepts/patterns in the content repo — not automatic synonym collapse
