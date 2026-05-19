# When Interpretation No Longer Matters — Drafting Status

## Current phase

**Phase 2 — Unit passes** (Phase 0 structure complete on `upcoming/when-interpretation-no-longer-matters-structure`)

## Active branch

`upcoming/when-interpretation-no-longer-matters-structure` → then `upcoming/when-interpretation-no-longer-matters-editorial`

## Manuscript hub

[`index.md`](../index.md)

## Unit progress

| Unit | Phase | Notes |
|------|-------|-------|
| Title Page | draft | |
| Copyright | draft | |
| Author's Note | draft | |
| Preface | draft | |
| Introduction | draft | |
| How to Read This Book | draft | Ch 1 leak removed; opening sentence restored |
| Ch 1 — The Boundary We Could Not Cross | draft | Restored from how-to-read + Joseph Smith case |
| Ch 2 — What It Means for Interpretation to Stop Working | draft | |
| Ch 3 — Alignment Versus Interpretation | draft | |
| Ch 4 — Identity Saturation | draft | |
| Ch 5 — Coercion, Consent, and Performative Legitimacy | draft | |
| Ch 6 — Narrative Enclosure | draft | |
| Ch 7 — Alignment-Based Authority | draft | Case template |
| Ch 8 — Identity-Saturated Political Authority | draft | Case template |
| Ch 9 — Total Authority | draft | Case template |
| Ch 10 — Transitional and Borderline Cases | draft | |
| Ch 11 — Why Judgment Feels Impossible | draft | |
| Ch 12 — What Cannot Be Repaired | draft | |
| Ch 13 — Recognizing the Shift Early | draft | Appendix bleed removed |
| Appendix A | draft | |
| Glossary | draft | Glossary pass after Part IV editorial |
| Conclusion | draft | |

## Next actions

1. Merge structure branch; open `upcoming/when-interpretation-no-longer-matters-editorial`.
2. Run Phase 2 unit passes: Part I → II → III gate → IV → glossary.
3. Phase 3 part coherence after each part’s units complete.

## Phase 0 resolution (May 2026)

Systemic issue was embedded `# Chapter N+1:` markers in each file plus Ch 1 opening in `how-to-read-this-book.md`. Fixed via `tools/fix_interpretation_structure.py` (split, orphan stitch, correct H2 per index).

## Open decisions / known issues

- Glossary term bolding not yet audited to manuscript order.
- Citation pass (Pandoc footnotes) deferred to editorial branch; Unicode superscripts remain in some units.

## Rough scale

- ~13,300 words (May 2026; unchanged after realignment)
