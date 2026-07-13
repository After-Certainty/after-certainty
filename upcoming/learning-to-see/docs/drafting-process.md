# Learning to See — Drafting Process

## Purpose

Workflow for building and revising **Learning to See** in a structured, review-driven way.

## Key references

- [`outline.md`](outline.md) — canonical structural authority for Phase 0–1
- [`book-rules.md`](book-rules.md) — house rules (wins on conflict)
- [`status.md`](status.md) — unit progress and next actions
- [`comparative-map.md`](comparative-map.md) — planning table for cross-tradition comparisons
- [`open-questions.md`](open-questions.md) — unresolved editorial decisions
- [`index.md`](../index.md) — reading order and file paths

## Branch naming

Use branches scoped to this book and phase:

- `upcoming/learning-to-see-structure`
- `upcoming/learning-to-see-draft`
- `upcoming/learning-to-see-editorial`
- `cursor/learning-to-see-outline-cc77` (outline scaffold)

Create each branch from latest `main` unless continuing work on an open branch. Update `docs/status.md` when switching branches.

## Phases

### Phase 0 — Structure

- Confirm `index.md` links match filenames and on-page titles.
- Resolve outline-to-file alignment in `docs/outline.md`.
- Import external drafts for Introduction, Chapter 1, and Chapter 2 without overwriting reserved files.

### Phase 1 — Outline to prose

For units marked `outline` in `docs/status.md`:

- Expand bullet scaffolds from `docs/outline.md` into continuous prose per `docs/book-rules.md`.
- One unit at a time unless the author approves a batch.
- Reserved drafts (Intro, Ch 1, Ch 2): editorial pass only after import; do not regenerate from outline.

### Phase 2 — Unit passes (per chapter, bridge, or front/back matter section)

After drafting or revising one unit:

1. **Rules check** — alignment with `docs/book-rules.md` and core invariant.
2. **Five-layer check** (Part II chapters) — metaphysical meaning, formative intention, observable effect, institutional distortion, comparative analogue.
3. **Echo pass** — flag repeated phrasing, claims, and examples against prior units and sibling titles (especially *What We Cannot See*, *Living in Sediment*).
4. **Editorial pass** — clarity, rhythm, scene-before-theory, avoidance of sermon cadence.
5. **Sensitivity pass** — traditions represented specifically; consultation flags honored.
6. **Citation pass** (drafted prose only) — footnotes at structural pivots; verify sources.
7. **Linkage check** — `index.md` and internal links still resolve.
8. **Status update** — update the unit row in `docs/status.md`.

Pause for author review before moving to the next unit unless explicitly told to continue.

### Phase 3 — Part coherence gate

After all units in a part are drafted:

- Bridge-to-chapter continuity
- Chapter-to-chapter progression (no restatement without nuance)
- Consistent terminology and confidence level
- Example distribution across traditions
- "Where the analogy breaks" present in each Part II chapter

### Phase 4 — Manuscript-wide editorial

After all units are at least `draft`:

- Structural cohesion across parts
- Global echo and compression pass
- LDS personal thread limited to Ch 1, Ch 10 (hypothesis), Ch 13 (callback)
- AI thread confined to payoff chapters (13–14), not drift
- Full copy edit
- Citation integrity pass
- Final linkage check

### Phase 5 — Promote to `books/`

When the manuscript is ready for the publishing pipeline:

- Move or copy into `books/learning-to-see/`
- Enable exports in `book.yml`
- Update [upcoming/docs/portfolio-status.md](../../docs/portfolio-status.md)
- Add series-guide entry under Practice / Wisdom cluster

## Commit discipline

- Prefer one commit per approved part or editorial phase.
- Never commit manuscript changes without updating `docs/status.md` when the phase changes.

## Current starting phase

See `docs/status.md` — **Phase 2 (unit passes; Part I complete)**.
