# What We Cannot See — Drafting Process

## Purpose

Workflow for building and revising **What We Cannot See** in a structured, review-driven way.

## Key references

- [`book-rules.md`](book-rules.md) — house rules (wins on conflict)
- [`status.md`](status.md) — unit progress and next actions
- [`index.md`](../index.md) — reading order and file paths
- Planning layer: [`vision.md`](vision.md) through [`glossary-research.md`](glossary-research.md)

## Branch naming

Use branches scoped to this book and phase:

- `cursor/what-we-cannot-see-planning-2512` — planning scaffold (current)
- `upcoming/what-we-cannot-see-structure`
- `upcoming/what-we-cannot-see-draft`
- `upcoming/what-we-cannot-see-editorial`

Create each branch from latest `main` unless continuing work on an open branch. Update `docs/status.md` when switching branches.

## Phases

### Phase 0 — Structure

- Confirm `index.md` links match filenames and on-page titles.
- Complete planning docs and architectural review.
- Resolve scale decision (essay / practice / full) before Part I prose.
- Resolve open decisions in `status.md`.

### Phase 1 — Outline to prose

For units marked `outline` in `docs/status.md`:

- Expand bullet scaffolds into continuous prose per `book-rules.md`.
- One unit at a time unless the author approves a batch.
- Lock voice in Introduction + Part I Ch 1 before batch expansion.

### Phase 2 — Unit passes (per chapter, bridge, or front/back matter section)

After drafting or revising one unit:

1. **Rules check** — alignment with `book-rules.md` and core invariant
2. **Echo pass** — flag repeated phrasing, claims, and examples against prior units and portfolio siblings
3. **Editorial pass** — clarity, rhythm, stacked negation, filler, punctuation
4. **Self-critique** — top 2–4 weaknesses and concrete fixes
5. **Citation pass** (drafted prose only) — footnotes at structural pivots; verify sources
6. **Glossary pass** (if glossary exists) — new terms, first-use bolding
7. **Linkage check** — `index.md` and internal links still resolve
8. **Status update** — update the unit row in `status.md`

Pause for author review before moving to the next unit unless explicitly told to continue.

### Phase 3 — Part coherence gate

After all units in a part are drafted:

- Bridge-to-chapter continuity
- Chapter-to-chapter progression (no restatement without nuance)
- Consistent terminology and confidence level
- Example distribution across the part
- Bias families: each gets adaptive and dangerous treatment (Part I)

### Phase 4 — Manuscript-wide editorial

After all units are at least `draft`:

- Structural cohesion across parts
- Global echo and compression pass
- Full copy edit
- Citation integrity pass
- Glossary and back matter completeness
- Final linkage check
- Bridge from Part II → Part III reads as necessary consequence, not pivot

### Phase 5 — Promote to `books/`

When the manuscript is ready for the publishing pipeline:

- Move or copy into `books/what-we-cannot-see/`
- Add `book.yml` with `publishing.enabled: true`
- Update [`upcoming/docs/portfolio-status.md`](../../docs/portfolio-status.md)
- Add entry to [`docs/series-guide.md`](../../../docs/series-guide.md) (Epistemic limits cluster)

## Commit discipline

- Prefer one commit per approved planning phase or editorial phase
- Never commit manuscript changes without updating `status.md` when the phase changes

## Current starting phase

See [`status.md`](status.md) — **Phase 0 — Structure (planning scaffold)**.
