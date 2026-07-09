# Agent 08 — Full manuscript echo pass

## ROLE

Revision agent. Resolves **cross-part repetition** and **cluster overlap** after all units and **07** part gates complete.

## PURPOSE

Unit-level echo (**04**) and part echo (**07**) leave book-wide duplicates: the same layoff example in intro and Ch 5, the same invariant sentence in every bridge, cluster siblings re-teaching judgment-at-scale. This pass **cuts, reframes, and assigns ownership** across the full reading order.

## WHEN

- **Mandatory** after Part II **07** and conclusion **01–06**
- **One session** for the full manuscript unless author approves a split (front matter + Part I | Part II + back matter)

## INPUTS

- All units in [`index.md`](../../index.md) reading order
- [`docs/book-rules.md`](../../book-rules.md)
- [`docs/status.md`](../../status.md) — part echo gate notes
- Cluster skim (titles + intros + invariant paragraphs):
  - [`books/after-certainty/`](../../../after-certainty/)
  - [`books/the-economy-we-dont-experience/`](../../../the-economy-we-dont-experience/)
  - [`books/when-interpretation-no-longer-matters/`](../../../when-interpretation-no-longer-matters/)

## SCOPE (edit in place)

| Section | Files |
|---------|--------|
| Front matter | `front-matter/introduction-*.md`, `front-matter/interlude-*.md` |
| Part I | `parts/part-1-when-judgment-fractures/bridge.md`, Ch 1–4 |
| Part II | `parts/part-2-when-formula-speaks/bridge.md`, Ch 5–8 |
| Back matter | `back-matter/conclusion-*.md` (vs Part II bridge + Ch 8 only—not full re-echo of Part I) |

**Out of scope:** title page, copyright, bibliography shell, appendix unless echo is severe.

## FOCUS

- **Intro owns** global invariant and book audience; **bridges own** part arcs; **chapters own** domain examples
- **One canonical example** per cross-book beat (layoffs, hospital metrics, platform engagement)—trim duplicates across intro / Ch 1 / Ch 5
- Cluster: this book’s lens is **metrics as moral language**—do not re-argue interpretation collapse or compression–signaling at length
- Log in **`docs/status.md`** under `## Manuscript echo gate (08)`

## DO

- Prefer **cutting** over synonym swapping
- Table: location | action | rationale | severity before/after
- Update status.md gate row

## DO NOT

- Re-expand (**01**), bulk reflow (**03**), or add citations (**05**) unless a cut exposes a new claim
- Re-run full **07** on parts (fix only cross-part leaks)

## OUTPUT

- Edited files in scope
- Brief echo report
- Updated `status.md` **Manuscript echo gate (08)**

## PIPELINE

Runs **after** **07** on Part II and conclusion **01–06**. Book ready for author read-through and export enable decision.
