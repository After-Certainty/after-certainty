# When Trust Stops Tracking Reality — Drafting Process

## Purpose

Workflow for building and revising **When Trust Stops Tracking Reality** in a structured, review-driven way.

## Key references

- `docs/book-rules.md` — house rules (wins on conflict)
- `docs/bibliography-guide.md` — source set and chapter mapping
- [`upcoming/docs/bibliography-pass.md`](../../docs/bibliography-pass.md) — Pandoc footnote conventions
- `docs/status.md` — unit progress and next actions
- `index.md` — reading order and file paths

## Branch naming

Use branches scoped to this book and phase:

- `upcoming/when-trust-stops-tracking-reality-structure`
- `upcoming/when-trust-stops-tracking-reality-draft`
- `upcoming/when-trust-stops-tracking-reality-editorial`

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

1. **Incorporate** — merge draft into the target file; preserve intent and structure. Strip "Chapter" and "Bridge" from reader-facing headings; use title only in `index.md` links.
2. **Rhythm pass** — merge staccato single-sentence paragraphs into flowing prose; keep deliberate short lines at hinges (reframes, pattern names, closing returns). See `docs/book-rules.md` (Paragraph rhythm).
3. **Citation pass** — add Pandoc footnotes at structural pivots using sources from `docs/bibliography-guide.md`; verify against `back-matter/bibliography.md`. Do not force citations where Calder and real anchors carry the argument alone.
4. **Heading check** — subheads content-specific, not formulaic; only **Core Principle** is standardized across chapters (see `docs/book-rules.md`).
5. **Status update** — mark unit `draft` in `docs/status.md` with pass notes.

Pause for author review before moving to the next unit unless explicitly told to continue.

**How to submit:** send the unit name or path and the draft text. Optional: note if rhythm or citations should be light on this pass.

**Footnote format:** Pandoc markers `[^c4-vaughan-challenger]` in body; definitions at file end with a blank line before each `[^id]:` block (required for export). Chapter-scoped IDs: `c` + unit number + author-work slug.

### Phase 2 — Unit passes (optional deeper editorial)

After rhythm and citation passes, or when revising an already-drafted unit:

1. **Rules check** — alignment with `docs/book-rules.md` and core invariant.
2. **Echo pass** — flag repeated phrasing, claims, and examples against prior units.
3. **Editorial pass** — clarity, stacked negation, filler, punctuation (rhythm handled at intake).
4. **Self-critique** — top 2–4 weaknesses and concrete fixes.
5. **Citation integrity** — footnote IDs resolve; no orphan definitions.
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

### Phase 5 — Promote to `books/`

When the manuscript is ready for the publishing pipeline:

- Move or copy into `books/when-trust-stops-tracking-reality/` (done June 2026)
- Enable exports in `book.yml`
- Update [upcoming/docs/portfolio-status.md](../../upcoming/docs/portfolio-status.md)

## Commit discipline

- Do not commit per unit unless the author requests it.
- Prefer one commit per approved part or editorial phase.
- Never commit manuscript changes without updating `docs/status.md` when the phase changes.

## Current starting phase

See `docs/status.md` — **Phase 5 — Promoted** (essay edition in `books/`).
