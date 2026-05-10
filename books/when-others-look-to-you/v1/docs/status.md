# When Others Look to You — drafting status

## Current phase

**Manuscript (v1):** Part II opens with **The Two Groups**, then **Renewal**,
**Erosion**, and a dedicated **Circulation** chapter; misjudgment sits in Part IV; closing is Chapter 12.
Part and file layout match `index.md`.

An earlier editorial pass wove **Correction** and **Circulation** through the
harm / effectiveness / legitimacy chapters without a standalone circulation
chapter; that phase is **superseded** by the current plan (see
`docs/circulation-cross-cutting.md` for terminology history).

## Branch / workflow

Update this line when you merge or branch: active work may be on a feature
branch; **`index.md` is the source of truth** for reading order and paths.

Recent feature work:

- **`plan/rewrite-chapter-9`** — **Chapter 9 — Scale and Drift** revised per **`docs/plan-chapter-9-scale-drift-rewrite.md`**: vignette-first flow, fuller **scalability** / **adaptability** definitions in context, legitimacy section bridge to chapter 8, pull quote unchanged. **Merged to main** (PR #53).
- **`plan/chapter-6-harm-rewrite`** — manuscript draft for **Chapter 6 — Harm Under Influence** revised per **`docs/plan-chapter-6-harm-rewrite.md`**.

## Approved structure (v1)

- **Front matter** (`front-matter/*`)
- **Part I — How Influence Forms** (`parts/part-1-how-influence-forms/*`)
- **Part II — Renewal, Erosion, and Circulation**
  (`parts/part-2-renewal-erosion-circulation/*`)
- **Part III — Harm, Effectiveness, and Legitimacy**
  (`parts/part-3-harm-effectiveness-legitimacy/*`)
- **Part IV — Scale, Pressure, and Misjudgment**
  (`parts/part-4-scale-pressure-misjudgment/*`)
- **Part V** — What Remains (`parts/part-5-closing/*`)
- **Back matter** (`back-matter/*`)

## Key docs (precedence)

- `docs/book-rules.md` — house rules, tone, and **Plain speak (house style)** (wins on conflict).
- `docs/pattern-integration-guide.md` — Pattern Block placement and inline anchors.
- `docs/editorial-vocabulary.md` — chapter-aware vocabulary passes.

## Back matter

Epilogue, Appendix A, Appendix B, glossary, and bibliography are linked from
`index.md`. Re-run link checks when paths or filenames change.

## Next steps (editorial)

Parts III–IV plain-speak + domain scan are summarized in
`docs/editorial-pass-part-iii-iv.md`.

**Mechanical typography scan:** The repeatable script in **`docs/typography-check.md`**
was run against the full v1 manuscript (**Pull Quote Block**, **Vignette Block**, **Pattern Block**
rules). Latest result: **0** violations in each category.

Remaining work is housekeeping: optional appendix/grid placement choices,
export/script checks, and publication formatting passes. After substantive edits to
manuscript Markdown, re-run that script before treating an editorial pass as complete.

## Open decisions

None recorded here—use the issue tracker for active questions.
