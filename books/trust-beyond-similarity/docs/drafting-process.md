# Trust Beyond Similarity — Drafting Process

## Purpose

Workflow for building and revising **Trust Beyond Similarity** in a structured, review-driven way.

## Key references

- `docs/book-rules.md` — house rules (wins on conflict)
- `docs/rhythm-pass.md` — author draft intake; staccato merge procedure
- `docs/bibliography-guide.md` — curated sources by chapter
- `docs/character-guide.md` — anchor story characters and arcs
- `docs/status.md` — unit progress and next actions
- `index.md` — reading order and file paths

## Branch naming

Use branches scoped to this book and phase:

- `upcoming/trust-beyond-similarity-structure`
- `upcoming/trust-beyond-similarity-draft`
- `upcoming/trust-beyond-similarity-editorial`

Create each branch from latest `main` unless continuing work on an open branch. Update `docs/status.md` when switching branches.

## Phases

### Phase 0 — Structure

- Confirm `index.md` links match filenames and on-page titles.
- Add missing bridge files where the arc requires them.
- Resolve known path/title mismatches recorded in `docs/status.md`.

### Phase 1 — Outline to prose

For units marked `outline` in `docs/status.md`:

- Expand bullet scaffolds into continuous prose per `docs/book-rules.md`.
- One unit at a time unless the author approves a batch.

### Author draft intake (default workflow)

When the author sends draft prose for a unit:

1. **Incorporate** — merge draft into the target file; preserve intent and structure.
2. **Rhythm pass** — [`docs/rhythm-pass.md`](rhythm-pass.md): merge staccato single-sentence paragraphs into flowing prose; keep deliberate short lines at hinges (reframes, pattern names, closing returns, fence motif). Reference voice: Chapter 1 draft-complete.
3. **Subheads** — add reader-facing headings per `docs/book-rules.md` (Reader-facing headings): chapter title + blockquote question; `###` sections named for the argument's movement; **Core Principle** and anchor return (e.g. **Back to the Fence**). Do not use outline scaffold labels in prose.
4. **Citation pass** — add Pandoc footnotes at structural pivots using sources from `docs/bibliography-guide.md`; verify against `back-matter/bibliography.md`. Do not force citations where the community center anchor carries the argument alone.
5. **Status update** — mark unit `draft` in `docs/status.md` with pass notes (e.g. `rhythm pass`, `subheads`, `rhythm + citation pass`).

Pause for author review before moving to the next unit unless explicitly told to continue.

**How to submit:** send the unit name or path and the draft text. Optional: `rhythm only`, `light rhythm`, or `preserve staccato` (see rhythm-pass doc).

**Footnote format:** Pandoc markers `[^c1-homophily]` in body; definitions at file end with a blank line before each `[^id]:` block. Chapter-scoped IDs: `c` + unit number + author-work slug. See [`upcoming/docs/bibliography-pass.md`](../../../upcoming/docs/bibliography-pass.md).

### Phase 2 — Unit passes (per chapter, bridge, or front/back matter section)

After rhythm and citation passes, or when revising an already-drafted unit:

1. **Rules check** — alignment with `docs/book-rules.md` and core invariant.
2. **Echo pass** — flag repeated phrasing, claims, and examples against prior units.
3. **Editorial pass** — clarity, stacked negation, filler, punctuation (rhythm handled at intake).
4. **Self-critique** — top 2–4 weaknesses and concrete fixes.
5. **Citation pass** (drafted prose only) — footnotes at structural pivots; verify sources.
6. **Glossary pass** (if glossary exists) — new terms, first-use bolding.
7. **Linkage check** — `index.md` and internal links still resolve.
8. **Status update** — update the unit row in `docs/status.md`.

Pause for author review before moving to the next unit unless explicitly told to continue.

### Phase 3 — Part coherence gate

After all units in a part are drafted:

- Bridge-to-chapter continuity
- Chapter-to-chapter progression (no restatement without nuance)
- Consistent terminology and confidence level
- Example distribution across the part

### Phase 4 — Manuscript-wide editorial

After all units are at least `draft`:

- Structural cohesion across parts
- Global echo and compression pass
- Full copy edit
- Citation integrity pass
- Glossary and back matter completeness
- Final linkage check

### Phase 5 — Promote to `books/` ✓

Promoted June 2026:

- Manuscript at `books/trust-beyond-similarity/`
- Exports enabled in `book.yml` (docx, epub, pdf)
- GitHub release artifacts configured
- Portfolio and series cross-links updated

## Current starting phase

See `docs/status.md` — **Phase 5 — Promoted**.
