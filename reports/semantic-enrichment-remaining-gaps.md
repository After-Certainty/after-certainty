# Remaining semantic enrichment gaps

Baseline snapshot after regenerating reports (2026-07-23) on branch
`cursor/semantic-enrichment-data-quality-b164`, before the data-quality pass edits.

## Report freshness

| Report | Generated |
|--------|-----------|
| Completeness | 2026-07-23T04:43:16Z |
| Metadata quality | regenerated same session |
| Graph audit | regenerated same session (replaces stale 2026-07-07 snapshot) |

Regeneration order used: `verify-semantic-ontology` → completeness → metadata-quality → graph.

## Publication dates (26 unknown)

Leave unknown unless authored evidence exists. Do not invent from git/file mtimes.

Amazon ASINs without confirmed dates:

- `when-authority-is-misread` (B0DWZ2ZFXG)
- `when-authority-outlives-accountability` (B0GJ3QZQ1V)

Books with authored dates: `after-certainty`, `curiosity-before-certainty`,
`how-meaning-moves`, `trust-beyond-similarity`, `when-others-look-to-you-v1`,
`when-others-look-to-you-v2`.

## Public change events (26 missing)

Same set as unknown publication dates. Existing events cover the six dated books only.

## Chapter summaries

Manifest currently has 15 chapter summaries (one sample each on 15 books).
Completeness report may under-count if run without `--manifest`; fix default to
`build/semantic-manifest.json`.

Priority batch for this pass (full enrichment):

1. after-certainty
2. the-world-we-make-together
3. why-collaboration-is-so-hard
4. learning-to-see
5. the-game-we-think-we-saw

Deferred: before-certainty-arrives, living-in-sediment, the-economy-we-dont-experience,
boundary-conditions, observer-patterns (poetry structure).

## Thin works

| Book | Gaps |
|------|------|
| curiosity-before-certainty | concepts, patterns, relatedWorks, situations |
| everyone-knows-love | concepts, patterns, relatedWorks, situations |
| how-serious-systems-learn | patterns, relatedWorks, situations |
| the-relay | concepts, patterns, relatedWorks, situations (fiction) |
| trust-beyond-similarity | patterns, relatedWorks, situations |
| what-we-cannot-see | patterns, relatedWorks, situations |
| when-moral-seriousness-scales | patterns, situations |

## Thinker / source identity

- Critical: Moneyball source name contains markdown italics
- Hal Daumé slug damage (`hal-daum-iii`) still in graph slug-quality
- Placeholder / multi-author / et-al thinker cleanup still needed
- Creator name mismatches on multi-author sources (metadata-quality warnings)

## Provenance

~20 patterns flagged as original synthesis without declared `grounding`
(schema does not yet allow the field).

## Schema gaps for this pass

- `selectedConceptRoles` / `selectedPatternRoles` on book overview
- `grounding` on patterns/concepts
- Relationship `provenance`
- Thinker `author_group` / `citationOnly` / aliases
- Chapter transition object + poetry kinds
