# After Certainty — Drafting Process

## Purpose

Workflow for revising **After Certainty** in a structured, review-driven way.

## Key references

- `docs/book-rules.md`
- `docs/status.md`
- `index.md`

## Branch naming

- `upcoming/after-certainty-editorial` — manuscript-wide passes
- `upcoming/after-certainty-<part>` — part-scoped work if needed

## Phases

Follow the phase model in [upcoming/docs/_templates/drafting-process.md.template](../../docs/_templates/drafting-process.md.template).

## Current starting phase

**Phase 4 complete** — author read-through gate before Phase 5 promote.

## Phase 5 promote checklist

When the author approves the manuscript:

1. Confirm `index.md` linkage and `book.yml` export settings.
2. Copy tree to `books/after-certainty/` (or agreed slug).
3. Run export smoke test (`make build-book DIR=books/after-certainty` when enabled).
4. Update [portfolio-status.md](../../docs/portfolio-status.md) and set phase to Phase 5 in `docs/status.md`.
