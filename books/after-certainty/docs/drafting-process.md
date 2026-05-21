# After Certainty — Drafting Process

## Purpose

Workflow for revising **After Certainty** in a structured, review-driven way.

## Key references

- `docs/book-rules.md`
- `docs/editorial-passes.md`
- `docs/feedback-pass-2.md`
- `docs/beta-reader-feedback-2026.md`
- `docs/status.md`
- `index.md`

## Branch naming

- `after-certainty/editorial-feedback-pass-2` — author drafts incorporated file-by-file
- `after-certainty/editorial-grounding` — beta-reader grounding pass (merged PR #112)
- `upcoming/after-certainty-editorial` — legacy name for manuscript-wide passes
- `upcoming/after-certainty-<part>` — part-scoped work if needed

## Phases

Follow the phase model in [upcoming/docs/_templates/drafting-process.md.template](../../docs/_templates/drafting-process.md.template).

## Current phase

**Feedback pass 2** on branch `after-certainty/editorial-feedback-pass-2`.

Workflow: see `docs/feedback-pass-2.md` — author supplies drafts per file; agent merges and runs convention checklist (citations, bibliography, vignettes, glossary if added).

When all units are done:

1. Cohesion pass (invariant + hinge lines)
2. Bibliography integrity pass
3. Export (`make build-book DIR=books/after-certainty`)

## Phase 5 promote checklist (complete)

- [x] `book.yml` export flags enabled in `books/after-certainty/`
- [x] Copy to `books/after-certainty/`
- [x] How-to-read capstone page in index
- [x] Portfolio row updated
