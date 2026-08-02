# Reality Pushes Back — Drafting Process

## Purpose

Workflow for building and revising **Reality Pushes Back** in a structured, review-driven way.

## Key references

- `docs/book-rules.md` — house rules (wins on conflict)
- `docs/status.md` — unit progress and next actions
- `docs/town-bible.md` — continuity and narrator discipline
- `docs/working-outline.md` — locked chapter beats
- `index.md` — reading order and file paths

## Branch naming

Use branches scoped to this book and phase:

- `cursor/reality-pushes-back-draft-6dfc` (first complete draft)
- later: `upcoming/reality-pushes-back-editorial`

Create each branch from latest `main` unless continuing work on an open branch. Update `docs/status.md` when switching branches.

## Phases

### Phase 0 — Structure

- Confirm `index.md` links match filenames and on-page titles.
- Add bridge files for each force.
- Import Town Bible, outline, and pattern language as drafting refs.

### Phase 1 — Outline to prose

- Seed Introduction and Chapter 1 from existing author drafts.
- Expand remaining units from `docs/working-outline.md` into continuous prose per `docs/book-rules.md`.
- Draft in reading order so object and decision echoes stay coherent.

### Phase 2 — Unit passes (per chapter, bridge, or front/back matter section)

After drafting or revising one unit:

1. **Rules check** — Material→Human→Civilization; core invariant; Town Bible narrator limits.
2. **Echo pass** — flag repeated phrasing, claims, and objects against prior units.
3. **Editorial pass** — clarity, rhythm, stacked negation, filler, punctuation.
4. **Self-critique** — top 2–4 weaknesses and concrete fixes.
5. **Linkage check** — `index.md` and internal links still resolve.
6. **Status update** — update the unit row in `docs/status.md`.

### Phase 3 — Part coherence gate

After all units in a part are drafted:

- Bridge-to-chapter continuity
- Chapter-to-chapter progression (no restatement without nuance)
- Continuity of witnesses and places without unlock dependence

### Phase 4 — Manuscript-wide editorial

After all units are at least `draft`:

- Structural cohesion across parts
- Global echo and compression pass
- Full copy edit
- Appendix A alignment with corpus pattern language
- Final linkage check

### Phase 5 — Promote to `books/`

Completed: cover installed, OG generated, `book.yml` exports enabled, portfolio and series-guide paths updated.

## Commit discipline

- Prefer commits at scaffold, seeded prose, part batches, and status refresh.
- Never commit manuscript changes without updating `docs/status.md` when the phase changes.

## Current starting phase

See `docs/status.md` — **Phase 5 — Promoted to `books/`**.
