# Why Diversity Matters — Drafting Process

## Purpose

Workflow for building and revising **Why Diversity Matters** in a structured, review-driven way.

## Key references

- `docs/book-rules.md` — house rules (wins on conflict)
- `docs/status.md` — unit progress and next actions
- `index.md` — reading order and file paths

## Branch naming

Use branches scoped to this book and phase:

- `why-diversity-matters/initial-draft` — structure + outline intake (current)
- `why-diversity-matters/draft` — prose expansion
- `why-diversity-matters/editorial` — manuscript-wide editorial

Create each branch from latest `main` unless continuing work on an open branch. Update `docs/status.md` when switching branches.

## Phases

### Phase 0 — Structure

- Confirm `index.md` links match filenames and on-page titles.
- Add missing bridge files where the arc requires them.
- Resolve known path/title mismatches recorded in `docs/status.md`.

**Note:** This book was created directly in `books/` (Phase 5 promote skipped).

### Phase 1 — Outline to prose

For units marked `outline` in `docs/status.md`:

- Expand bullet scaffolds into continuous prose per `docs/book-rules.md`.
- One unit at a time unless the author approves a batch.
- Incorporate interview material quietly; direct quotes only when words matter.

### Phase 2 — Unit passes (per chapter, bridge, or front/back matter section)

After drafting or revising one unit:

1. **Rules check** — alignment with `docs/book-rules.md` and core invariant.
2. **Echo pass** — flag repeated phrasing, claims, and examples against prior units.
3. **Editorial pass** — clarity, rhythm, stacked negation, filler, punctuation.
4. **Self-critique** — top 2–4 weaknesses and concrete fixes.
5. **Linkage check** — `index.md` and internal links still resolve.
6. **Status update** — update the unit row in `docs/status.md`.

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
- Final linkage check

### Phase 5 — Publish

Book already lives in `books/why-diversity-matters/` with exports enabled. On merge to `main`, CI rebuilds DOCX/EPUB/PDF via `.github/workflows/book-export-release.yml`.

## Commit discipline

- Do not commit per unit unless the author requests it.
- Prefer one commit per approved part or editorial phase.
- Never commit manuscript changes without updating `docs/status.md` when the phase changes.

## Current starting phase

See `docs/status.md` — **Phase 0–1 — Structure + initial draft intake**.
