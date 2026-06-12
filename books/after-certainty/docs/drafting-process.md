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

- `after-certainty/manuscript-deepening-pass` — Agents 04–07 since PR #188 (experience, terrain, echo)
- `after-certainty/essayistic-exploration` — curiosity expansion + recognition preservation (expand investigation, earn pattern, preserve recognition) *(complete)*
- `after-certainty/essay-discovery-revision` — essay discovery revision (delay thesis, preserve compression) *(complete)*
- `after-certainty/editorial-feedback-pass-2` — author drafts incorporated file-by-file
- `after-certainty/editorial-grounding` — beta-reader grounding pass (merged PR #112)
- `upcoming/after-certainty-editorial` — legacy name for manuscript-wide passes
- `upcoming/after-certainty-<part>` — part-scoped work if needed

## Phases

Follow the phase model in [upcoming/docs/_templates/drafting-process.md.template](../../docs/_templates/drafting-process.md.template).

## Current phase

**Manuscript deepening pass** on branch `after-certainty/manuscript-deepening-pass`.

Workflow: Agents 04–07 on one branch since PR #188 — experience deepening, terrain & voice, terrain thematic deepening, echo pass. See `docs/agents/README.md`.

Prior passes on main: essayistic exploration (PR #188); pattern deepening (PR #187).

When all units are done:

1. Author review for terrain drift and pattern burial
2. Re-run `docs/author-read-through-gate.md`
3. Bibliography integrity pass (if footnotes moved)
4. Export (`make build-book DIR=books/after-certainty`)

## Phase 5 promote checklist (complete)

- [x] `book.yml` export flags enabled in `books/after-certainty/`
- [x] Copy to `books/after-certainty/`
- [x] How-to-read capstone page in index
- [x] Portfolio row updated
