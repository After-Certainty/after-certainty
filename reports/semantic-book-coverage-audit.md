# Semantic book coverage audit

Generated: `2026-08-01` (alongside regenerated completeness / graph / bibliography-drift reports).

Counts **G / P / S / T** = glossary / patterns / sources / thinkers with `relatedBooks` containing the book id. **Ch** = chapter summaries present/total from `reports/semantic-completeness.json`. There is no manuscript-hash staleness gate; “needs refresh” is judged from linkage gaps, chapter coverage, and bibliography drift.

Portfolio: **34** book specs (33 titles; WOLTY v1 + v2).

## Tier 1 — No / near-zero graph extraction (first-pass needed)

| Book | Type | G/P/S/T | Ch | Biblio | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `no-time-to-think` | nonfiction | 0/0/0/0 | 0/16 | no | Newly promoted; overview already names concepts/patterns; missing search aliases + discovery paths |
| `the-case-that-does-not-fit` | nonfiction | 0/0/0/0 | 0/16 | no | Same as above |
| `the-world-we-make-together` | nonfiction | 0/0/0/0 | 16/16 | **yes** (54) | Chapters done; sources never extracted — biblio drift: 40 missing + 14 missing `relatedBooks` |

**Follow-up skills:** `glossary-extract` / wire `relatedBooks` for NTTT + Case; `semantic-sources` (+ thinkers) for World We Make Together.

## Tier 2 — Sources present; glossary linking and/or chapters thin (refresh)

### 2a — Sources/thinkers extracted; glossary `relatedBooks` still zero

| Book | G/P/S/T | Ch | Priority note |
| --- | ---: | ---: | --- |
| `living-in-sediment` | 0/0/72/73 | 1/21 | Strong sources; glossary link pass + chapters |
| `when-others-become-leaders` | 0/0/53/49 | 0/15 | Same |
| `how-serious-systems-learn` | 0/0/38/46 | 1/25 | Handbook |
| `when-moral-seriousness-scales` | 0/0/22/19 | 0/17 | |
| `when-others-look-to-you-v2` | 0/0/17/17 | 0/18 | Also absent from questions |
| `when-accountability-no-longer-expires` | 0/0/12/11 | 1/19 | |
| `learning-to-see` | 0/0/12/13 | 19/19 | Chapters done; sources linked without manuscript biblio (out of drift scope) |
| `the-discipline-of-uncertainty` | 0/0/10/12 | 0/23 | Handbook |

### 2b — Concept/pattern spine present; chapter enrichment thin or missing

| Book | G/P/S/T | Ch | Priority note |
| --- | ---: | ---: | --- |
| `coupling` | 34/6/68/120 | 1/37 | Deep graph; chapters nearly empty |
| `before-certainty-arrives` | 43/0/42/43 | 0/15 | Glossary-heavy; no chapter summaries |
| `when-others-look-to-you-v1` | 13/10/26/28 | 0/25 | Flagship patterns; chapters missing |
| `when-interpretation-no-longer-matters` | 24/0/54/58 | 0/15 | Also biblio drift: 10 missing, 26 stale RB |
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

| Book | Missing | Missing RB | Stale |
| --- | ---: | ---: | ---: |
| `the-world-we-make-together` | 40 | 14 | 0 |
| `when-interpretation-no-longer-matters` | 10 | 0 | 26 |
| `why-collaboration-is-so-hard` | 4 | 2 | 0 |

All other audited bibliographies: 0 missing / 0 stale / 0 missing RB.

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
| `the-game-we-think-we-saw` | 17/0/72/40 | 13/13 | Strong |
| `why-collaboration-is-so-hard` | 12/0/9/11 | 10/10 | Thin sources; small biblio drift |

## Suggested extraction order

1. **Sources** for `the-world-we-make-together` (biblio ready; chapters already done).
2. **First semantic pass** for `no-time-to-think` and `the-case-that-does-not-fit` (wire glossary/patterns `relatedBooks`, search aliases, discovery shelves/questions/trails).
3. **Glossary linking** for source-rich G=0 books (`living-in-sediment`, `when-others-become-leaders`, handbooks, …).
4. **Chapter enrichment batch** for thin flagships (`coupling`, `before-certainty-arrives`, WOLTY v1, `when-interpretation-no-longer-matters`, …).
5. **Biblio reconcile** for `when-interpretation-no-longer-matters` (stale RB) and `why-collaboration-is-so-hard`.

## How to regenerate

```bash
ALLOW_MISSING_WEB_COVERS=1 make generate-semantic-manifest
make report-semantic-completeness
make audit-semantic-graph
make audit-bibliography-semantic-drift
```

Companion reports: `reports/semantic-completeness.{md,json}`, `reports/semantic-graph-audit.{md,json}`, `reports/bibliography-semantic-drift.{md,json}`.
