# The Game We Think We Saw — Drafting Process

## Purpose

Workflow for building and revising **The Game We Think We Saw** in a structured, review-driven way.

## Key references

- `docs/book-rules.md` — house rules (wins on conflict)
- `docs/status.md` — unit progress and next actions
- `docs/voice-guide.md` — prose method
- `docs/research-plan.md` — evidence discipline
- `docs/planning/` — per-unit briefs (not prose)
- `index.md` — reading order and file paths

## Branch naming

Use branches scoped to this book and phase:

- `upcoming/the-game-we-think-we-saw-structure`
- `upcoming/the-game-we-think-we-saw-draft`
- `upcoming/the-game-we-think-we-saw-editorial`

Create each branch from latest `main` unless continuing work on an open branch. Update `docs/status.md` when switching branches.

## Phases

### Phase 0 — Structure

- Confirm `index.md` links match filenames and on-page titles.
- Keep manuscript stubs heading-only until research dossiers unlock drafting.
- Resolve open structural questions in `docs/status.md`.

### Phase 0.5 — Research dossiers (pre-draft gate for high-risk units)

Before drafting:

- Chapter 4 (Bobby Knight): citation-quality evidence dossier
- Chapter 7 (Colin Kaepernick): precise chronology dossier

Moderate-risk units (Ch 2, 5, 6) should have preliminary source logs before prose.

### Phase 1 — Outline to prose

For units marked `outline` or `brief complete` in `docs/status.md`:

- Expand planning briefs into continuous prose per `docs/book-rules.md` and `docs/voice-guide.md`.
- One unit at a time unless the author approves a batch.
- Do not recreate or summarize an external Chapter 3 whistle draft into the manuscript unless that draft is explicitly provided in a later task.

### Phase 2 — Unit passes (per chapter, bridge, or front/back matter section)

After drafting or revising one unit:

1. **Rules check** — alignment with `docs/book-rules.md` and core invariant.
2. **Echo pass** — flag repeated phrasing, claims, and examples against prior units.
3. **Editorial pass** — clarity, rhythm, stacked negation, filler, punctuation.
4. **Self-critique** — top 2–4 weaknesses and concrete fixes.
5. **Citation pass** (drafted prose only) — footnotes at structural pivots; verify sources; separate the four evidence layers.
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
- Sports-first integrity (no off-field escorting)

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

- Move or copy into `books/the-game-we-think-we-saw/`
- Migrate `upcoming.yml` → `book.yml` with publishing and exports enabled
- Add cover and open-graph assets
- Update [upcoming/docs/portfolio-status.md](../../docs/portfolio-status.md)

## Commit discipline

- Do not commit per unit unless the author requests it.
- Prefer one commit per approved part or editorial phase.
- Never commit manuscript changes without updating `docs/status.md` when the phase changes.

## Current starting phase

See `docs/status.md` — **Phase 4 in progress** (copy/echo pass done; author read-through and length-band decision before Phase 5 promote).
