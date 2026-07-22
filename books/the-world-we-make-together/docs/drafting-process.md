# The World We Make Together — Drafting Process

## Purpose

Workflow for building and revising **The World We Make Together** in a structured, review-driven way.

## Key references

- `docs/book-rules.md` — house rules (wins on conflict)
- `docs/outline.md` — canonical architecture and chapter constraints
- `docs/research-notes.md` — source and verification markers
- `docs/status.md` — unit progress and next actions
- `index.md` — reading order and file paths

## Branch naming

Use branches scoped to this book and phase:

- `upcoming/the-world-we-make-together-structure`
- `upcoming/the-world-we-make-together-draft`
- `upcoming/the-world-we-make-together-editorial`

Cloud-agent branches may use `cursor/the-world-we-make-together-<descriptor>-3055` while work is in progress.

Create each branch from latest `main` unless continuing work on an open branch. Update `docs/status.md` when switching branches.

## Phases

### Phase 0 — Structure

- Confirm `index.md` links match filenames and on-page titles for drafted units.
- Add bridge and chapter files only when drafting begins (no empty placeholder prose).
- Resolve known path/title mismatches recorded in `docs/status.md`.

### Phase 1 — Outline to prose

For units marked `outline` in `docs/status.md`:

- Expand from `docs/outline.md` into continuous prose per `docs/book-rules.md`.
- One unit at a time unless the author approves a batch.

### Phase 2 — Unit passes (per chapter, bridge, or front/back matter section)

After drafting or revising one unit:

1. **Rules check** — alignment with `docs/book-rules.md` and core invariant.
2. **Echo pass** — flag repeated phrasing, claims, and examples against prior units and sibling series books.
3. **Editorial pass** — clarity, rhythm, stacked negation, filler, punctuation.
4. **Self-critique** — top 2–4 weaknesses and concrete fixes.
5. **Citation pass** (drafted prose only) — footnotes at structural pivots; verify sources; log gaps in `docs/research-notes.md`.
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
- Transition constraints from `docs/outline.md` (Door→Clock, Clock→Chair, etc.)

### Phase 4 — Manuscript-wide editorial

After all units are at least `draft`:

- Structural cohesion across parts
- Global echo and compression pass
- Full copy edit
- Citation integrity pass
- Bibliography completeness
- Final linkage check

### Phase 5 — Promote to `books/`

When the manuscript is ready for the publishing pipeline:

- Move or copy into `books/the-world-we-make-together/`
- Add `book.yml` and enable exports
- Update [upcoming/docs/portfolio-status.md](../../docs/portfolio-status.md)
- Add series-guide entry

## Commit discipline

- Do not commit per unit unless the author requests it.
- Prefer one commit per approved part or editorial phase.
- Never commit manuscript changes without updating `docs/status.md` when the phase changes.

## Current starting phase

See `docs/status.md` — **Phase 1 (Introduction drafted; pause for editorial review)**.
