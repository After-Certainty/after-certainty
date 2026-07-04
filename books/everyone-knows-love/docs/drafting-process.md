# Everyone Knows Love — Drafting Process

## Purpose

Workflow for building and revising **Everyone Knows Love** in a structured, review-driven way.

## Key references

- `docs/book-rules.md` — house rules (wins on conflict)
- `docs/book-plan.md` — full chapter map and gates
- `docs/status.md` — unit progress and next actions
- `docs/notes-and-sources.md` — website companion notes (not in print body)
- `index.md` — reading order and file paths

## Branch naming

- `cursor/everyone-knows-love-scaffold-cbcf` — structure scaffold (current)
- `upcoming/everyone-knows-love-draft` — prose drafting
- `upcoming/everyone-knows-love-editorial` — editorial passes

Update `docs/status.md` when switching branches.

## Phases

### Phase 0 — Structure

- Confirm `index.md` links match filenames and on-page titles.
- Validate with `make validate-book-specs`.

### Phase 1 — Outline to prose

Expand units marked `outline` in `docs/status.md` per `docs/book-rules.md`. **Start with Chapter 1.**

### Phase 2 — Unit passes

After each unit: rules check, echo pass, editorial pass, linkage check, status update.

#### Bridge-specific pass

For part bridges, run an additional check:

- Is this a hallway (preparation) rather than an exhibit (teaching)?
- Can it be cut by 30–60% without losing the handoff?
- Does it end on an active attention verb (look/notice/see)?

#### Part IV pass — refine, not reinvent (author — voice locked)

Part IV has found its direction. **Do not rewrite from scratch.** Preserve openings, order, tone, restrained endings. Strengthen themes already emerging.

**Goal:** One journey through four terrains—same movements, different centers of gravity. Reader thinks *I've seen this movement before.*

Before marking a Part IV chapter approved:

1. **Preserve:** Opening story, structure, observational tone, observation endings
2. **Organizing observation:** One line the chapter orbits—recognition, not definition
3. **Bridges not boundaries:** Echo movements across rooms without sharpening category lines
4. **Tuesday compass:** Scenes over conclusions; cut abstraction
5. **Shared language / maturation:** Allow natural cross-chapter echoes; do not catalog or summarize
6. **Mystery:** Observation endings; no *Care remains open* unless earned
7. **Brittany test + memory entry**

Ch 16 Romance = voice reference. See `book-plan.md` — Part IV table.

### Phase 3 — Part coherence gate

After all units in a part are drafted.

### Phase 4 — Manuscript-wide editorial

Structural cohesion, global echo pass, copy edit.

### Phase 5 — Promote to `books/`

When ready for publishing pipeline.

## Current starting phase

See `docs/status.md` — **Phase 1**.
