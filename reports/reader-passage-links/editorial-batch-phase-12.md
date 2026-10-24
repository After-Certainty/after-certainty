# Reader passage editorial review — Phase 12

Continues the claim-specific work in [Phase 11 (#725)](https://github.com/After-Certainty/after-certainty/pull/725), with the **416 linked sources / 403 mechanical A** baseline checked in on `main`.

## Purpose

The Phase 11 audit still classified **13 source profiles with existing working reader paths** as `path_valid_shared_or_ambiguous_citation`. Phase 12 first inspected all 13 actual linked footnotes, instead of assuming that all 13 require manuscript rewrites.

The surprising result: **eight citations are already source-specific in the manuscript**, but the scorer counted topical overlaps or partial titles as other works. **Five really are multi-work notes**. Rewriting the eight already-specific notes to satisfy a scoring artifact would damage the manuscript; upgrading the five shared ones without distinct claims would inflate the audit.

## Outcome A — eight source-specific citations (matcher precision fix)

| Work / specific footnote | Why the former shared warning was misleading |
|---|---|
| Chris Argyris, *Overcoming Organizational Defenses* — `c1-correction-and-insulation` | The note names this book, not Argyris and Schön's distinct *Organizational Learning II* |
| W. Brian Arthur, *Increasing Returns and Path Dependence in the Economy* — `c1-arthur-lock-in` | The note names Arthur, not Pierson's similarly named path-dependence article |
| Church Committee, *Final Report* — `c8-cointelpro` | The source-specific report note is not a citation to BlackPast's separate breakfast-program article |
| Desai and Vahed, *The South African Gandhi* — `s2-8` | The note specifically attributes historical interpretation to Desai/Vahed, not South African History Online's 1994 election article |
| IOC, Simone Biles medals list — `c6-paris` | Medal results in 2024 must not co-match IOC's other Biles reporting about Tokyo and the twisties |
| NFL, concussion protocol overview — `c5-nfl-protocol` | The NFL procedural document is explicitly named; an NCAA coach fact sheet is not cited by that note |
| Karl E. Weick, *The Social Psychology of Organizing* — `c2-adaptive-systems` | Another Weick et al. article's metadata incorrectly shortened its distinct title to “Organizing”; full article title restored |
| Will Graves, Biles beam-bronze AP report — `c6-beam` | The 2021 Associated Press account is not the similarly themed IOC material |

The matcher now distinguishes a **single specifically named full title** from speculative co-matches. Only that directly identified source loses the shared-warning marker. The partial-title candidate **remains a candidate requiring editorial review**. When **two titles are independently named**, the note remains genuinely shared.

No passages or source paths are invented in these eight cases. Existing `readerPassagePath` and `whyThisMatters` editorial copy remain intact.

## Outcome B — five genuinely shared notes (retain B, don't inflate coverage)

| Source / footnote | Independently cited work at the same invocation |
|---|---|
| American College of Emergency Physicians, “Boarding” — `c1-boarding` | Institute of Medicine, *Hospital-Based Emergency Care: At the Breaking Point* |
| Hood and Dixon, *A Government That Worked Better and Cost Less* — `c14-public-sector` | Pollitt and Bouckaert, *Public Management Reform* |
| Lowcountry Digital History Initiative, “Local and National Leader: Septima P. Clark” — `c10-expansion` | “The Progressive Club, Johns Island,” in the same archive |
| Mandela, Rivonia Trial statement — `v4` | Mandela's *Long Walk to Freedom* |
| SNCC Digital Gateway, “Birth of SNCC” — `c10-shaw` | Barbara Ransby, *Ella Baker and the Black Freedom Movement* |

All five paths remain structurally valid and intellectually relevant, but a footnote with multiple works is **not** a unique source-specific citation. They are retained as editorially applied links with **B mechanical evidence**, awaiting separate independently authored claims, not removed or spuriously upgraded. In particular, the archival works can corroborate the same proposition without demanding two redundant footnote anchors.

## Implementation and safeguards

- Improve full-title recognition in `index_chapter_engagement`: an unambiguous explicit full-title match cannot be downgraded solely because another book has a partially overlapping title. Lesser matches remain ambiguous candidates.
- Correct the title metadata for Weick, Sutcliffe, and Obstfeld's article to **“Organizing and the Process of Sensemaking”**, rather than the overly generic “Organizing”.
- Test an Arthur/Pierson-style false match and a genuinely two-book footnote, as well as the eight existing source paths.
- Reconcile all 13 existing `review-log.json` records (8 A, 5 B), without adding new paths or manufacturing historical events.
- Regenerate both tracked audit reports with the site's **real rendered fragment checker**. Verify the eight direct links are mechanically A, the five shared links remain B, and no existing links become invalid or fragment-unverified.

## Checks

```bash
uv run ruff check tools/reader_passage_links.py tests/test_reader_passage_phase12.py
uv run ruff format --check tools/reader_passage_links.py tests/test_reader_passage_phase12.py
uv run pytest tests/test_reader_passage_links.py tests/test_reader_passage_phase10.py tests/test_reader_passage_phase11.py tests/test_reader_passage_phase12.py -q
uv run python tools/audit_reader_passage_links.py --repo .
```

The regenerated report is authoritative: do not calculate the number of A results by adding eight to an old total without a full corpus scan. A mechanical A remains a validated source/fragment relationship, **not** an external scholarly endorsement of the book's interpretation.
