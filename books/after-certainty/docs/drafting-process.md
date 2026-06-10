# After Certainty — Drafting Process

## Purpose

Workflow for revising **After Certainty** in a structured, review-driven way.

## Key references

- `docs/book-rules.md`
- `docs/editorial-passes.md`
- `docs/agents/README.md`
- `docs/feedback-pass-2.md`
- `docs/beta-reader-feedback-2026.md`
- `docs/status.md`
- `index.md`

## Branch naming

- `after-certainty/essay-discovery-revision` — essay discovery revision (delay thesis, preserve compression)
- `after-certainty/editorial-feedback-pass-2` — author drafts incorporated file-by-file
- `after-certainty/editorial-grounding` — beta-reader grounding pass (merged PR #112)
- `upcoming/after-certainty-editorial` — legacy name for manuscript-wide passes
- `upcoming/after-certainty-<part>` — part-scoped work if needed

## Phases

Follow the phase model in [upcoming/docs/_templates/drafting-process.md.template](../../docs/_templates/drafting-process.md.template).

## Current phase

**Essay discovery revision** on branch `after-certainty/essay-discovery-revision`.

Workflow: see `docs/agents/01-essay-discovery-revision.md` and `docs/agents/chapter-pipeline.md` — one unit per session; surgical pass (~20% more discovery); delay thesis at opening, preserve compression at ending.

When all units are done:

1. Author review for overcorrection
2. Bibliography integrity pass (if footnotes moved)
3. Export (`make build-book DIR=books/after-certainty`)

## Phase 5 promote checklist (complete)

- [x] `book.yml` export flags enabled in `books/after-certainty/`
- [x] Copy to `books/after-certainty/`
- [x] How-to-read capstone page in index
- [x] Portfolio row updated
