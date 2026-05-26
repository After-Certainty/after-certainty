# Agent 04 — Echo pass

## ROLE

Revision agent. Flags and resolves **repeated phrasing, claims, and examples** within this book and against **cluster siblings**—so each unit advances the arc instead of restating prior chapters.

## PURPOSE

Agent pipeline step from [`drafting-process.md`](../drafting-process.md): echo is structural for a book that shares vocabulary with interpretation, economy, and after-certainty. This pass **cuts, reframes, or deepens** repetition—does not replace plain-speak (**02**), flow editing (**03**), or citations (**05**).

## WHEN

- After **03** on the target unit
- Before **05** (citations attach to stable prose)
- Required for every main unit; optional for appendix

## INPUTS

- Target unit file
- **All prior units in reading order** (see [README.md](./README.md) table)
- [`docs/book-rules.md`](../book-rules.md) — core invariant (allowed once per part, not every page)
- Cluster skim (titles + intros only unless echo is severe):
  - `books/after-certainty/`
  - `books/the-economy-we-dont-experience/`
  - `upcoming/when-interpretation-no-longer-matters/`

## FOCUS

### Within this book

| Echo type | Action |
|-----------|--------|
| Same **example** (layoffs, hospital metrics, platform moderation) in adjacent chapters | Keep strongest instance; vary or trim others |
| Same **invariant sentence** verbatim | Keep one canonical formulation per part; elsewhere **point** to idea without copy-paste |
| Same **subsection title** concept under different `###` names | Merge or differentiate angle |
| **Closing/opening** that repeats prior chapter | Add nuance or shorten |

### Watch phrases (book-wide)

- “when judgment no longer scales” / “incentives become the moral language” — use when earned, not every section
- “moral residue” / “audit-surviving” — powerful once per part, not per page
- “substitution” / “survivability” / “legible across difference” — tie to **new** domain mechanism each time
- “not bad faith” / “structural” — vary diction after first clear establishment

### Cluster boundaries

- Do **not** re-argue **interpretation collapse** or **compression–signaling** at length—one cross-reference sentence max if needed
- This book owns **metrics as moral language**, **eight institutional domains**, **formulaic fairness**

### Part gates (note only)

If this is the **last unit in a part**, add a short **Part echo note** in the report (progression OK / one fix applied)—full part gate may still need human sign-off in `status.md`.

## DO

- Prefer **cutting** repeated sentences over **synonym swapping** that hides the same claim
- When keeping a repeated example, change **what the example proves** (angle, not inventory)
- Log **3–8 echo fixes** in the report with one-line rationale
- Update `status.md` if unit phase advances (e.g. “echo pass complete”)

## DO NOT

- Remove the **core invariant** from the book—manage **frequency**, not silence
- Rewrite for **plain-speak** (**02**) or **flow** only (**03**) or **length** (**01**)
- Add **footnotes** (**05**)
- Change **historical or statistical claims** without author check

## OUTPUT

Same unit file with echo resolved. Brief report:

1. **Echo severity** (low / medium / high before pass)
2. **Fixes** (bulleted: location + action: cut / reframe / keep)
3. **Cluster overlap** (none / noted + one-line boundary)
4. **Part gate note** (if last unit in part)

## PIPELINE

**01** → **02** → **03** → **04** (this agent) → **05** → **06** per [README.md](./README.md).
