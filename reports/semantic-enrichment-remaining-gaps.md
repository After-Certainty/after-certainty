# Remaining semantic enrichment gaps

Updated after data-quality pass on `cursor/semantic-enrichment-data-quality-b164`
(2026-07-23). Reports regenerated from schemaVersion **2.3** manifest.

## Completed in this pass

- Additive schema 2.3: concept/pattern roles, grounding, relationship provenance,
  thinker identity classes, poetry kinds, chapter transition object
- Full chapter enrichment for priority books 1–5 (73 reading units with summaries)
- Book-specific roles on priority + flagship overviews
- Thin-work curation: curiosity-before-certainty, everyone-knows-love,
  how-serious-systems-learn, the-relay, when-moral-seriousness-scales (+ patterns
  for trust-beyond-similarity / what-we-cannot-see)
- Pattern `grounding` on 20 original-synthesis patterns; 15 relationship provenance rows
- Hal Daumé slug correction (`hal-daume-iii` + formerSlugs); et-al → author_group/citationOnly
- Moneyball source markdown italics removed (graph critical → 0)
- Publication audit documented; `edition_published_at` backfilled where dates existed
- Completeness report defaults to current manifest; records manifest provenance

## Publication dates still unknown

See [`reports/publication-date-audit.md`](publication-date-audit.md). No new reliable
dates beyond the six already authored. Amazon ASINs still need human confirmation:

- `when-authority-is-misread` (B0DWZ2ZFXG)
- `when-authority-outlives-accountability` (B0GJ3QZQ1V)

## Chapter summaries — next batch

Deferred priority books (6–9):

| Book | Notes |
|------|-------|
| before-certainty-arrives | Full chapter enrichment |
| living-in-sediment | Expand beyond single sample |
| the-economy-we-dont-experience | Full chapter enrichment |
| boundary-conditions | Fiction summaries (anti-proof language) |

Also: observer-patterns structure now exports `poem` kinds (20 poems); poem-level
summaries not authored in this pass.

Flagship chapter coverage still thin: WOLTY v1/v2, coupling, how-meaning-moves samples only.

## Thin / partial remaining

- `trust-beyond-similarity`, `what-we-cannot-see`: still missing typed relatedWorks /
  situationCoverage in completeness (patterns now curated)
- Creator name-mismatch warnings on multi-author sources (punctuation / multi-name
  display) — 11 metadata-quality warnings
- Placeholder / citation-only thinkers: reduced via citationOnly; further corpus-important
  placeholder summaries can be hand-written later

## Provenance remaining

- Other patterns without grounding (non-flagged)
- Concept-level grounding batch
- Broader relationship provenance beyond the representative 15

## Recommended next enrichment batch

1. Confirm Amazon release dates → publication_date + change events
2. Chapter enrichment for priority books 6–9 + observer-patterns poems
3. typed relatedWorks / situations for trust-beyond-similarity and what-we-cannot-see
4. Normalize multi-author `creatorNames` punctuation mismatches
5. Concept grounding + remaining pattern provenance
