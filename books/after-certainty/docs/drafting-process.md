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

- `after-certainty/metadata-from-manuscript` — `book.yml`, manifests, portfolio status (current)
- `after-certainty/editorial-feedback-pass-2` — pattern framework + editorial rewrites (merged PR #113)
- `after-certainty/editorial-grounding` — beta-reader grounding pass (merged PR #112)
- `upcoming/after-certainty-editorial` — legacy name for manuscript-wide passes
- `upcoming/after-certainty-<part>` — part-scoped work if needed

## Phases

Follow the phase model in [upcoming/docs/_templates/drafting-process.md.template](../../docs/_templates/drafting-process.md.template).

## Current phase

**Metadata pass** on branch `after-certainty/metadata-from-manuscript`.

Workflow: see `docs/metadata-pass.md` — refresh description, edition band, `docs/status.md`, and regenerated portfolio manifests from the promoted manuscript.

When metadata is aligned:

1. Author read-through gate sign-off
2. Export smoke test (`make build-book DIR=books/after-certainty`)
3. Release tag + GitHub artifacts when gate clears

## Phase 5 promote checklist (complete)

- [x] `book.yml` export flags enabled in `books/after-certainty/`
- [x] Copy to `books/after-certainty/`
- [x] How-to-read capstone page in index
- [x] Portfolio row updated
