# Agent 08 — Full manuscript echo pass

## ROLE

Revision agent. Resolves **cross-part repetition** and **cluster overlap** after all units and **07** part gates complete.

## PURPOSE

Unit echo (**04**) and part echo (**07**) still leave book-wide leaks: the same invariant in intro + Ch 2 + conclusion, the same regime in Ch 8 and Ch 9, or cluster siblings’ vocabulary (compression, incentives, “post-truth”) substituting for this book’s **authority-mode** lens. This pass **assigns ownership** across the full reading order in [`index.md`](../../index.md).

## WHEN

- **Mandatory** after Part IV **07** and conclusion **01–06**
- **One session** for the full manuscript unless author approves a split:
  - Split A: front matter + Part I + Part II
  - Split B: Part III + Part IV + conclusion + appendix

## INPUTS

- All units in [`index.md`](../../index.md) reading order
- [`docs/book-rules.md`](../book-rules.md)
- [`docs/status.md`](../status.md) — Part 1–4 echo gate notes from **07**
- [`back-matter/glossary.md`](../../back-matter/glossary.md)
- Cluster skim (titles + intros + invariant paragraphs):
  - [`books/how-meaning-moves/`](../../../how-meaning-moves/)
  - [`books/the-economy-we-dont-experience/`](../../../the-economy-we-dont-experience/)
  - [`books/when-incentives-become-the-moral-language/`](../../../when-incentives-become-the-moral-language/)
  - [`books/after-certainty/`](../../../after-certainty/)

## SCOPE (edit in place)

| Section | Files |
|---------|--------|
| Front matter | `introduction-the-question-this-book-asks.md`, `how-to-read-this-book.md` *(if echo severe)*, preface/author's note *(light touch only)* |
| Part I | `parts/part-1-where-interpretation-ends/bridge.md`, Ch 1–2 |
| Part II | `parts/part-2-authority-without-interpretation/bridge.md`, Ch 3–6 |
| Part III | `parts/part-3-cases-beyond-interpretation/bridge.md`, Ch 7–10 |
| Part IV | `parts/part-4-after-interpretation/bridge.md`, Ch 11–13 |
| Back matter | `conclusion-after-interpretation.md` vs Ch 13 + Part III *(synthesis, not re-case)*; `appendix-a-structural-map-of-cases.md` vs Part III *(map, not re-narrate)* |

**Out of scope:** title page, copyright, glossary entries, bibliography shell—unless a footnote echo is broken.

## FOCUS

### Manuscript ownership

| Layer | Owns |
|-------|------|
| **Introduction** | The question; reader posture; what this book will not do |
| **Part bridges** | Orientation and handoff between movements; no chapter-level case retelling |
| **Part I** | Boundary; interpretive collapse vs private understanding |
| **Part II** | Mode taxonomy (four chapters, four modes) |
| **Part III** | Historical/contemporary **cases**—one dominant mode per chapter |
| **Part IV** | Judgment after; irreparable harm; early recognition |
| **Conclusion** | Synthesis and limits—**no** new regimes, **no** rescue program |
| **Appendix A** | Structural map—tabular; trim prose that repeats Ch 7–10 |

### Cross-part leaks to hunt

- Same **regime** named in intro, two case chapters, and conclusion
- Same **invariant paragraph** in every part opener/closer
- **Part II definitions** pasted into Part III cases
- **Ch 11–13** re-arguing Part II modes at length
- **Cluster vocabulary** replacing this book’s lens (metrics, CPI, compression-as-primary)

### Cluster boundary (this pass)

This book’s lens: **authority after public interpretation fails**—alignment, identity saturation, performative legitimacy/coercion, narrative enclosure. Do not re-argue How Meaning Moves, Economy, or Incentives at chapter length.

## DO

- Prefer **cutting** over synonym swapping
- Table: location | action | rationale | severity before/after
- Update `status.md` under `## Manuscript echo gate (08)`
- Note if **essay band** prose is tight enough for export smoke after author sign-off

## DO NOT

- Re-expand (**01**), bulk reflow (**03**), or add citations (**05**) unless a cut exposes a new claim
- Re-run full **07** on parts (fix only **cross-part** leaks)
- Enable **book.yml** exports or portfolio docs unless author requests

## OUTPUT

- Edited files in scope
- Brief echo report (cross-part fixes + cluster notes)
- Updated `status.md` **Manuscript echo gate (08)**

## PIPELINE

Runs **after** all **07** gates and conclusion **01–06**. Manuscript ready for author read-through, expansion decision, and `make build-book` smoke test.
