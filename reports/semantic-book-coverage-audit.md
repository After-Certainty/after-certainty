# Semantic book coverage audit

Generated: `2026-08-01` (alongside regenerated completeness / graph / bibliography-drift reports).

Counts **G / P / S / T** = glossary / patterns / sources / thinkers with `relatedBooks` containing the book id. **Ch** = chapter summaries present/total from `reports/semantic-completeness.json`. There is no manuscript-hash staleness gate; “needs refresh” is judged from linkage gaps, chapter coverage, and bibliography drift.

Portfolio: **34** book specs (33 titles; WOLTY v1 + v2).

## Tier 1 — First-pass extraction (updated 2026-08-01)

| Book | Type | G/P/S/T | Ch | Biblio | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `no-time-to-think` | nonfiction | 6/5/0/0 | 0/16 | no | Overview concepts/patterns wired; search aliases + question/trail/shelf added; no manuscript glossary/biblio yet |
| `the-case-that-does-not-fit` | nonfiction | 6/3/0/0 | 0/16 | no | Same pattern as NTTT |
| `the-world-we-make-together` | nonfiction | 5/2/54/13 | 16/16 | **yes** (54) | Sources promoted (biblio drift now 54 matched / 0 missing); key thinkers added; overview concepts/patterns wired |

**Remaining follow-ups:** chapter summaries for NTTT/Case; richer org thinker promotion for World; glossary enrichment beyond overview spine.

## Tier 2 — Sources present; glossary linking and/or chapters thin (refresh)

### 2a — Sources present; overview spines now wired (was G=0)

| Book | G/P/S/T | Ch | Priority note |
| --- | ---: | ---: | --- |
| `living-in-sediment` | 5/4/72/73 | 21/21 | Overview wired (#444); chapter enrichment complete (CORPUS-004) |
| `when-others-become-leaders` | 6/5/53/49 | 15/15 | Overview wired (#444); chapter enrichment complete |
| `how-serious-systems-learn` | 6/8/38/46 | 25/25 | Overview wired (#445); chapter enrichment complete |
| `the-discipline-of-uncertainty` | 6/5/10/12 | 23/23 | Overview wired (#445); chapter enrichment complete |
| `when-moral-seriousness-scales` | 7/6/22/19 | 0/17 | Overview wired (2026-08-01); chapters missing |
| `when-others-look-to-you-v2` | 6/7/17/17 | 0/18 | Overview wired (2026-08-01); still thin on questions |
| `when-accountability-no-longer-expires` | 6/6/12/11 | 1/19 | Overview wired (2026-08-01); chapters thin |
| `learning-to-see` | 6/5/12/13 | 19/19 | Overview wired (2026-08-01); chapters done; no manuscript biblio |

### 2b — Concept/pattern spine present; chapter enrichment thin or missing

| Book | G/P/S/T | Ch | Priority note |
| --- | ---: | ---: | --- |
| `coupling` | 34/6/68/120 | 1/37 | Deep graph; chapters nearly empty |
| `before-certainty-arrives` | 43/0/42/43 | 15/15 | Chapter enrichment complete (CORPUS-003; 2026-08-01) |
| `when-others-look-to-you-v1` | 13/10/26/28 | 0/25 | Flagship patterns; chapters missing |
| `when-interpretation-no-longer-matters` | 25/0/54/58 | 15/15 | Biblio drift cleared; chapter enrichment complete |
| `what-we-cannot-see` | 16/0/21/22 | 0/19 | |
| `when-incentives-become-the-moral-language` | 8/0/47/46 | 0/20 | |
| `the-economy-we-dont-experience` | 5/0/27/24 | 0/16 | |
| `how-meaning-moves` | 3/10/23/27 | 1/17 | Patterns strong; glossary thin |
| `when-authority-is-misread` | 9/0/51/49 | 1/15 | |
| `when-authority-outlives-accountability` | 2/0/30/28 | 1/15 | |
| `how-trust-forms` | 1/0/15/15 | 1/15 | |
| `trust-beyond-similarity` | 1/0/42/45 | 1/15 | |
| `when-trust-stops-tracking-reality` | 1/0/23/24 | 1/15 | |

### 2c — Bibliography drift (even where sources mostly linked)

From `reports/bibliography-semantic-drift.md` (24 books audited):

All audited bibliographies: **0 missing / 0 stale / 0 missing RB** (845 matched).

Cleared 2026-08-01: `when-interpretation-no-longer-matters` (was 10 missing / 26 stale) and `why-collaboration-is-so-hard` (was 4 missing / 2 missing RB). World We Make Together was already cleared in #442.

## Tier 3 — Overview curation only (little or no graph extraction)

Typically have `overview.selectedConcepts` / `selectedPatterns` but **0** glossary/source `relatedBooks`. Fiction/poetry often have no bibliography expected.

| Book | Type | G/P/S/T | Ch | Notes |
| --- | --- | ---: | ---: | --- |
| `the-relay` | fiction | 0/0/0/0 | 29/29 | Full chapter enrichment; no sources/glossary links |
| `velorum` | fiction | 0/0/0/0 | 30/30 | Same; absent from questions |
| `boundary-conditions` | fiction | 0/0/0/0 | 0/25 | |
| `curiosity-before-certainty` | nonfiction | 0/0/0/0 | 0/14 | Early; no biblio |
| `everyone-knows-love` | nonfiction | 0/0/0/0 | 0/30 | Early; no biblio |
| `why-diversity-matters` | nonfiction | 0/0/0/0 | 1/16 | Early; no biblio |
| `observer-patterns` | poetry | 0/0/0/0 | 0/29 | Poem summaries not authored |

## Relatively complete (reference)

| Book | G/P/S/T | Ch | Gaps |
| --- | ---: | ---: | --- |
| `after-certainty` | 18/10/27/25 | 15/15 | Strongest flagship |
| `before-certainty-arrives` | 43/0/42/43 | 15/15 | Chapters complete; patterns still thin (P=0) |
| `living-in-sediment` | 5/4/72/73 | 21/21 | Chapters complete (CORPUS-004) |
| `when-others-become-leaders` | 6/5/53/49 | 15/15 | Chapters complete |
| `when-interpretation-no-longer-matters` | 25/0/54/58 | 15/15 | Chapters complete |
| `the-discipline-of-uncertainty` | 6/5/10/12 | 23/23 | Chapters complete |
| `how-serious-systems-learn` | 6/8/38/46 | 25/25 | Chapters complete |
| `the-game-we-think-we-saw` | 17/0/72/40 | 13/13 | Strong |
| `why-collaboration-is-so-hard` | 12/0/15/11 | 10/10 | Biblio drift cleared; chapters present |

## Suggested extraction order

1. ~~Sources for `the-world-we-make-together`~~ done (#442).
2. ~~First semantic pass for `no-time-to-think` and `the-case-that-does-not-fit`~~ done (#442).
3. ~~Glossary linking for `living-in-sediment` and `when-others-become-leaders`~~ done (overview spines wired).
4. ~~Glossary linking for handbooks `how-serious-systems-learn` and `the-discipline-of-uncertainty`~~ done (#445).
5. ~~Glossary linking for remaining source-rich G=0 books~~ done (moral seriousness, WOLTY v2, accountability expires, learning-to-see).
6. **Chapter enrichment batch** for thin flagships — BCA + sediment + WOBL + Interpretation + Discipline + HSSL done; remaining: WOLTY v1/v2, `coupling`, …
7. ~~**Biblio reconcile** for `when-interpretation-no-longer-matters` and `why-collaboration-is-so-hard`~~ done (0/0/0 drift).
8. **Semantic enrichment** on newly linked hubs (definitions / recognition-signals) where thin.

## How to regenerate

```bash
ALLOW_MISSING_WEB_COVERS=1 make generate-semantic-manifest
make report-semantic-completeness
make audit-semantic-graph
make audit-bibliography-semantic-drift
```

Companion reports: `reports/semantic-completeness.{md,json}`, `reports/semantic-graph-audit.{md,json}`, `reports/bibliography-semantic-drift.{md,json}`.
