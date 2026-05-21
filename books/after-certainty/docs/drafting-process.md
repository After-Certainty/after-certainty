# After Certainty — Drafting Process

## Purpose

Workflow for revising **After Certainty** in a structured, review-driven way.

## Key references

- `docs/book-rules.md`
- `docs/editorial-passes.md`
- `docs/beta-reader-feedback-2026.md`
- `docs/status.md`
- `index.md`

## Branch naming

- `after-certainty/editorial-grounding` — beta-reader grounding pass (vignettes + pacing asymmetry)
- `upcoming/after-certainty-editorial` — legacy name for manuscript-wide passes
- `upcoming/after-certainty-<part>` — part-scoped work if needed

## Phases

Follow the phase model in [upcoming/docs/_templates/drafting-process.md.template](../../docs/_templates/drafting-process.md.template).

## Current phase

**Post–Phase 5 grounding pass** on branch `after-certainty/editorial-grounding`.

Run passes in order per `docs/editorial-passes.md`:

1. Grounding (vignettes)
2. Asymmetry (chapter rhythm)
3. Cohesion (invariant + hinge lines)
4. Export (`make build-book DIR=books/after-certainty`)

## Phase 5 promote checklist (complete)

- [x] `book.yml` export flags enabled in `books/after-certainty/`
- [x] Copy to `books/after-certainty/`
- [x] How-to-read capstone page in index
- [x] Portfolio row updated
