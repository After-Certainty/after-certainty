# How Trust Forms — Drafting Process

## Purpose

Workflow for building and revising **How Trust Forms** in a structured, review-driven way.

## Key references

- `docs/book-rules.md` — house rules (wins on conflict)
- `docs/status.md` — unit progress and next actions
- `index.md` — reading order and file paths

## Branch naming

Use branches scoped to this book and phase:

- `upcoming/how-trust-forms-structure`
- `upcoming/how-trust-forms-draft`
- `upcoming/how-trust-forms-editorial`

Create each branch from latest `main` unless continuing work on an open branch. Update `docs/status.md` when switching branches.

## Phases

### Phase 0 — Structure

- Confirm `index.md` links match filenames and on-page titles.
- Add missing part opener files (`bridge.md`) where the arc requires them.
- Resolve known path/title mismatches recorded in `docs/status.md`.

### Phase 1 — Outline to prose

For units marked `outline` in `docs/status.md`:

- Expand bullet scaffolds into continuous prose per `docs/book-rules.md`.
- One unit at a time unless the author approves a batch.

### Phase 2 — Unit passes (per chapter, part opener, or front/back matter section)

After drafting or revising one unit:

1. **Rules check** — alignment with `docs/book-rules.md` and core invariant.
2. **Echo pass** — flag repeated phrasing, claims, and examples against prior units.
3. **Editorial pass** — clarity, rhythm, stacked negation, filler, punctuation.
4. **Self-critique** — top 2–4 weaknesses and concrete fixes.
5. **Citation pass** (drafted prose only) — footnotes at structural pivots; verify sources.
6. **Glossary pass** (if glossary exists) — new terms, first-use bolding.
7. **Linkage check** — `index.md` and internal links still resolve.
8. **Status update** — update the unit row in `docs/status.md`.

Pause for author review before moving to the next unit unless explicitly told to continue.

### Phase 3 — Part coherence gate

After all units in a part are drafted:

- Part opener-to-chapter continuity
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

- Move or copy into `books/how-trust-forms/`
- Enable exports in `book.yml`
- Update [upcoming/docs/portfolio-status.md](../../docs/portfolio-status.md)

## Commit discipline

- Do not commit per unit unless the author requests it.
- Prefer one commit per approved part or editorial phase.
- Never commit manuscript changes without updating `docs/status.md` when the phase changes.

## Current starting phase

See `docs/status.md` — **Phase 0 — Structure**.
