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

- `after-certainty/essayistic-exploration` — curiosity expansion + recognition preservation (expand investigation, earn pattern, preserve recognition)
- `after-certainty/essay-discovery-revision` — essay discovery revision (delay thesis, preserve compression) *(complete)*
- `after-certainty/editorial-feedback-pass-2` — author drafts incorporated file-by-file
- `after-certainty/editorial-grounding` — beta-reader grounding pass (merged PR #112)
- `upcoming/after-certainty-editorial` — legacy name for manuscript-wide passes
- `upcoming/after-certainty-<part>` — part-scoped work if needed

## Phases

Follow the phase model in [upcoming/docs/_templates/drafting-process.md.template](../../docs/_templates/drafting-process.md.template).

## Current phase

**Curiosity expansion + recognition preservation** on branch `after-certainty/essayistic-exploration`.

Workflow: see `docs/agents/02-curiosity-expansion.md`, `docs/agents/03-recognition-preservation.md`, and `docs/agents/chapter-pipeline.md` — one unit per session; Agent 02 then Agent 03; expand investigation between question and answer, earn pattern, preserve recognition.

Prior pass (complete): Agent 01 essay discovery revision — surgical reorder (~20% more discovery).

When all units are done:

1. Author review for over-expansion and pattern burial
2. Re-run `docs/author-read-through-gate.md`
3. Bibliography integrity pass (if footnotes moved)
4. Export (`make build-book DIR=books/after-certainty`)

## Phase 5 promote checklist (complete)

- [x] `book.yml` export flags enabled in `books/after-certainty/`
- [x] Copy to `books/after-certainty/`
- [x] How-to-read capstone page in index
- [x] Portfolio row updated
