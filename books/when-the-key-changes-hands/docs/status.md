# When the Key Changes Hands — Drafting Status

## Current phase

**Phase 5 — Promoted to `books/when-the-key-changes-hands/`**

Assembled from Google Docs, Chicago/Pandoc citation pass complete, cover + OG assets wired, publishing exports enabled.

## Active branch

`cursor/key-hands-publication-proof-750e` (publication proof; prior: editorial pass #515, assemble `cursor/when-the-key-changes-hands-eb03`)

## Manuscript hub

[`index.md`](../index.md) is the source of truth for reading order and paths.

## Key docs

- [`book-rules.md`](book-rules.md)
- [`drafting-process.md`](drafting-process.md)
- [`phase-5-promotion.md`](phase-5-promotion.md)
- [`inheritance-map.md`](inheritance-map.md)
- [`do-not-repeat-map.md`](do-not-repeat-map.md)
- [`new-contribution-map.md`](new-contribution-map.md)
- [`chapter-boundary-notes.md`](chapter-boundary-notes.md)
- [`book-outline.md`](book-outline.md)
- [`anticipated-bibliography.md`](anticipated-bibliography.md)
- [`bibliography-pass.md`](bibliography-pass.md)
- [`editorial-rhythm-compression-report.md`](editorial-rhythm-compression-report.md)
- [`when-the-key-changes-hands-publication-proof-report.md`](when-the-key-changes-hands-publication-proof-report.md)
- Portfolio rollup: [`upcoming/docs/portfolio-status.md`](../../../upcoming/docs/portfolio-status.md)

## Unit progress

| Unit | Phase | Notes |
|------|-------|-------|
| Introduction — The Key | draft + cites | 3 footnotes |
| Part I bridge | draft | no footnotes (by design) |
| Chapters 1–16 | draft + cites | structural pivots from anticipated bibliography |
| Epilogue | draft + cites | Arendt, Niebuhr |
| Bibliography | draft | 64 works actually cited |
| Cover / OG | done | `book-cover.png`, `open-graph.png` |

## Citation pass summary

1. **Units processed:** intro, chs 1–16, epilogue (bridges skipped).
2. **Footnotes:** 81 markers; 0 missing defs; 0 unused defs; blank line before each `[^id]:`.
3. **Bibliography:** 64 alphabetical Chicago entries in `back-matter/bibliography.md`.
4. **Unresolved metadata TODOs:** Aristotle and Kant entries lack a preferred modern edition/translator in the export bibliography (notes cite the work generically).

## Editorial rhythm / compression pass (2026-08-06)

Report: [`editorial-rhythm-compression-report.md`](editorial-rhythm-compression-report.md)

- Three coordinated passes: rhetorical-pattern variation, chapter compression, Chapter 16 reduction (~743 words).
- Prose word count (excl. bibliography): ~40,863 → ~36,528 (−4,335).
- Introduction reduced ~24% (within 15–25% target); Chapter 16 remains longest climax chapter (~2,595).
- Citation parity rechecked: 81 markers / 81 defs; bibliography 64 entries.
- Governing formulations preserved (Part I close; trust bet; heroism/compliance/design; succession triad).
- Ch7 disposition line refined: dispositions become part of the character others encounter.

## Publication-proof pass (2026-08-06)

Report: [`when-the-key-changes-hands-publication-proof-report.md`](when-the-key-changes-hands-publication-proof-report.md)

- James bib/note completed (New York: Henry Holt and Company, 1890).
- Aristotle / Kant remain edition-neutral (unresolved preferred editions).
- Doris notes normalized to John M. Doris (matches bibliography).
- Citation parity: 81 markers / 81 defs; 64 bibliography entries; all cited.
- Print convention: `\newpage` + split H1/H2 openers; `title_page_newpage_after: true`; Epilogue recognized by `docx_interior_finish`.
- Export: 23 body openers / 24 Word sections; artifact `when-the-key-changes-hands-publication-proof.docx`.
- Body prose word count (excl. bibliography): ~36,550; Chapter 16 ~2,596.

## Next actions

1. Author review of publication-proof DOCX (page breaks, running heads, footnotes).
2. Optional: choose preferred modern editions for Aristotle and Kant.
3. Optional semantic source ingest after bibliography stabilizes.
4. Export smoke via CI on merge (`publishing.enabled: true`).

## Open decisions / known issues

- Series-guide Formation placement beside WOLTY / WOBL (with trust and love companions).
- Optional shelf membership deferred.
- Aristotle / Kant preferred edition/translator still open.

## Rough scale

- Manuscript words (parts + front/back matter, excl. bibliography/docs): ~36.5k
- Cover: `book-cover.png` + house `open-graph.png`
- Last assessed: publication-proof pass (August 2026)
