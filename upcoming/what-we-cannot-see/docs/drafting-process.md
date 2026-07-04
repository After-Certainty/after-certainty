# What We Cannot See — Drafting Process

## Purpose

Workflow for building and revising **What We Cannot See** in a structured, review-driven way.

## Key references

- [`book-rules.md`](book-rules.md) — house rules (wins on conflict)
- [`status.md`](status.md) — unit progress, workflow stage, and next actions
- [`index.md`](../index.md) — reading order and file paths
- Planning layer: [`vision.md`](vision.md) through [`glossary-research.md`](glossary-research.md)

---

## Part-branch workflow (authoritative)

Each **part** of the manuscript is drafted on its own branch, reviewed chapter by chapter, then closed with a **part completion gate** before merge to `main`. Repeat for Part II, Part III, and back matter as needed.

### Branch naming

| Part | Branch (example) | Base |
|------|------------------|------|
| Part I | `cursor/what-we-cannot-see-part1-draft-2512` | `main` (merged) |
| Part II | `cursor/what-we-cannot-see-part2-draft-2512` | latest `main` after Part I merge |
| Part III | `cursor/what-we-cannot-see-part3-draft-2512` | latest `main` after Part II merge |

Create each new part branch from latest `main` after the prior part PR is merged. Update `docs/status.md` when switching branches.

### Within a part branch — chapter loop

For each unit in reading order (chapters, then part bridge):

1. **Draft** prose per [`book-rules.md`](book-rules.md) and [`chapter-template.md`](chapter-template.md)
2. **Author review** — feedback on the unit
3. **Revise** — surgical updates from feedback; lock planning docs if grammar/voice shifts
4. **Approve** — mark unit `approved` in [`status.md`](status.md)
5. **Commit and push** — keep PR current (granular commits OK during the loop)

Pause for author review before drafting the next unit unless explicitly told to continue.

**Unit pass checklist** (after each draft or revision):

1. Rules check — core invariant, four levels, tone guardrails
2. Echo pass — phrasing, claims, examples vs prior units
3. Editorial pass — clarity, rhythm, filler
4. Linkage check — `index.md` and internal links resolve
5. Status update — unit row and word counts in `status.md`

### Part completion gate (before merge)

When all prose units in the part are at least drafted, run this sequence **in order**:

| Step | Action | Who |
|------|--------|-----|
| **A** | Review **final chapter** of the part | Author |
| **B** | Revise final chapter from feedback; mark **approved** | Agent |
| **C** | Draft/revise **part bridge** if not yet prose (Part I only: after Ch 5) | Agent |
| **D** | **Manuscript-so-far review** — read continuously from Introduction through end of current part (including bridge) | Author |
| **E** | **Whole-manuscript revision** — echo, transitions, terminology, compression across all approved units | Agent |
| **F** | **Squash commits** on the branch into clean history; update PR title/body | Agent |
| **G** | **Merge** PR to `main` | Author |

Do **not** open the next part branch until step G is complete.

### After merge — next part

1. Checkout latest `main`
2. Create new part branch (`cursor/what-we-cannot-see-part2-draft-2512`, etc.)
3. Reset workflow stage in `status.md`
4. Resume **chapter loop** for the new part

---

## Current workflow stage — Part I

**Branch:** `cursor/what-we-cannot-see-part1-draft-2512`  
**PR:** #215

| Step | Status |
|------|--------|
| A — Review Ch 5 | Done |
| B — Approve Ch 5 | Done |
| C — Part I bridge | Done |
| D — Manuscript-so-far review | Done |
| E — Whole-manuscript revision | Done |
| F — Squash commits + update PR | Done |
| G — Merge to `main` | **Author** |

**Manuscript-so-far scope for step D:** Introduction + Ch 1–5 + Part I bridge (once drafted).

---

## Longer-range phases

### Phase 0 — Structure ✅

Planning scaffold, `index.md`, architectural docs. Complete on `main`.

### Phase 1 — Part prose (in progress)

Part I on branch; Part II and III follow the part-branch workflow above.

### Phase 2 — Part coherence gate

Subsumed by **Part completion gate** steps C–E for each part.

### Phase 3 — Manuscript-wide editorial

After all three parts merged to `main`:

- Cross-part cohesion and compression
- Full copy edit
- Citation integrity pass
- Glossary and back matter completeness
- Final linkage check

### Phase 4 — Promote to `books/`

When the manuscript is ready for the publishing pipeline:

- Move or copy into `books/what-we-cannot-see/`
- Add `book.yml` with `publishing.enabled: true`
- Update [`upcoming/docs/portfolio-status.md`](../../docs/portfolio-status.md)
- Add entry to [`docs/series-guide.md`](../../../docs/series-guide.md) (Epistemic limits cluster)

---

## Commit discipline

- **During a part branch:** granular commits per chapter or revision pass are fine
- **At part completion gate (step F):** squash to a readable history before merge
- Always update `status.md` when a unit is approved or workflow stage advances
- Never commit manuscript changes without updating `status.md` when the phase changes

## Squash guidance (step F)

Squash related commits on the part branch into one or a few logical commits, for example:

- Part I prose (Intro + chapters + bridge)
- Planning doc updates tied to the part
- CI/export or test changes if any

Force-push the squashed branch, then update the PR description to reflect final manuscript state and reviewer checklist.

## DOCX / CI

PR branches with `build.formats.docx.enabled: true` in `upcoming.yml` export a `.docx` artifact on each push (`book-what-we-cannot-see`). Use for author review at part gates.

---

## Current starting phase

See [`status.md`](status.md) — **Part I completion gate, step A (Ch 5 author review)**.
