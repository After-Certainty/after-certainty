# 5. Prioritized recommendations

## Summary

Highest leverage: **(1)** sync portfolio dashboard and fix draft-signaling metadata, **(2)** add a series guide and related-book discoverability, **(3)** complete author gates on Tier A books and run Phase 5 for the first promote, **(4)** document judgment/compression cluster boundaries before pushing interpretation/incentives publicly.

Scoring: **Leverage** and **Clarity impact** (1–5), **Portfolio impact** (1–5), **Effort** (S/M/L).

---

## Priority table

| # | Recommendation | Leverage | Clarity | Portfolio | Effort | Depends on |
|---|----------------|:--------:|:-------:|:---------:|:------:|------------|
| 1 | Sync [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md) with all `docs/status.md` | 5 | 3 | 5 | S | — |
| 2 | Add [`docs/series-guide.md`](../../docs/series-guide.md) (reading order + clusters + discriminators) | 5 | 5 | 5 | M | — |
| 3 | Replace “A manuscript on…” in interpretation + accountability `book.description` | 4 | 5 | 4 | S | — |
| 4 | Author read-through → Phase 5 for after-certainty (first promote candidate) | 5 | 4 | 5 | L | Author |
| 5 | Author read-through → Phase 5 for before-certainty-arrives + accountability | 5 | 4 | 5 | L | Author |
| 6 | Add “Related books” block to root README + key `index.md` hubs | 4 | 5 | 5 | M | #2 |
| 7 | Normalize published `purchase_links` / ISBNs where books are sold | 4 | 3 | 3 | S | Commerce data |
| 8 | Remove draft `title_page_footer` from how-serious-systems-learn | 3 | 4 | 2 | S | Author confirm |
| 9 | Document cluster boundaries in portfolio-status (judgment/compression) | 4 | 5 | 5 | S | — |
| 10 | Interpretation: author Parts III–IV + expansion band decision | 4 | 4 | 4 | L | Author |
| 11 | Incentives: Phase 3 gate + Ch 3–8 author read-through | 4 | 3 | 4 | M | — |
| 12 | Collaboration / economy / discipline: Part I author gate before expansion | 4 | 4 | 4 | L | Author |
| 13 | Link upcoming glossary terms → `semantic/glossary` (manifest enrichment) | 3 | 3 | 5 | M | — |
| 14 | Extend books-manifest schema with `readingOrder` / `relatedSlugs` | 3 | 4 | 4 | M | #2, site |
| 15 | Pull quotes from interpretation Ch 1–3 for site (no manuscript change) | 3 | 4 | 3 | S | #10 soft |
| 16 | Add how-to-read template to after-certainty + discipline | 3 | 4 | 3 | M | Author voice |
| 17 | Accountability vs authority-outlives: public boundary paragraph | 4 | 5 | 4 | S | #2 |
| 18 | List 8 upcoming titles in root README with link to portfolio dashboard | 3 | 4 | 4 | S | — |

---

## Recommended sequence (quarters)

### Immediate (this PR or next week)

- #1 Portfolio dashboard sync (**included in this PR**)
- #3 Description copy fix (optional small commit)
- #9 Cluster note in portfolio-status
- #18 Root README upcoming section
- Pointer to this audit in README

### After author gates (Tier A)

- #4 #5 Phase 5 promote (suggest order: **before-certainty-arrives** → **accountability** → **after-certainty** for historical→institutional→practice arc)
- #7 Commerce metadata on newly promoted books

### Discoverability sprint

- #2 Series guide
- #6 Related books blocks
- #14 Manifest schema (if site ready)

### Mid-pipeline (Tier B–C)

- #10 #11 #12 Editorial gates per book status
- #13 Semantic linking when glossaries stabilize
- #16 How-to-read where gaps remain

---

## What not to do (per audit constraints)

- Do not rename books to fix “When …” collision without author initiative.
- Do not merge or split manuscripts for positioning.
- Do not flatten **compression / alignment / legitimacy** into a single generic term across books.
- Do not auto-create 20 GitHub issues without triage—use [06-follow-up-issues.md](06-follow-up-issues.md) as backlog.

---

## Optional lightweight edits delivered with this audit

| Change | Rationale |
|--------|-----------|
| Sync `upcoming/docs/portfolio-status.md` | Fixes interpretation phase, word counts, tier table |
| Root README link to `docs/portfolio-audit/` | Makes audit discoverable |

Further copy edits (#3, #8) can be a follow-up commit if author prefers review first.
