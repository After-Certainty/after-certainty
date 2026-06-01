# Portfolio promotion readiness audit

**GitHub issue:** [#99 — Portfolio promotion readiness audit](https://github.com/ksteffe/after-certainty/issues/99)  
**Audit date:** May 2026  
**Branch:** `issue-99-portfolio-audit`

## Purpose

Evaluate the After Certainty repository as an interconnected conceptual portfolio—not isolated books—for public promotion, discoverability, onboarding, and long-term coherence. This audit identifies strengths, readiness gaps, overlap risks, and high-leverage follow-up work. **No manuscript rewrites** were performed.

## Coordination note

Issue #99 references `upcoming/portfolio-status.md`. The live dashboard is [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md). This audit uses the `docs/` path throughout.

## Scope

| Area | Depth |
|------|--------|
| 8 nonfiction titles under `upcoming/` | Full promotion-readiness assessment |
| 9 publishable roots under `books/` | Metadata, onboarding, website-integration gaps |
| `books/velorum/` | Published fiction (mythic fantasy); excluded from nonfiction ladder |
| `semantic/` ontology | Coverage snapshot via generated manifest |

## Reports

| # | Document | Issue task |
|---|----------|------------|
| 1 | [01-portfolio-structure.md](01-portfolio-structure.md) | Portfolio structure, flows, friction |
| 2 | [02-conceptual-differentiation.md](02-conceptual-differentiation.md) | Thematic overlap and positioning |
| 3 | [03-public-facing-clarity.md](03-public-facing-clarity.md) | Titles, summaries, onboarding voice |
| 4 | [04-promotion-readiness.md](04-promotion-readiness.md) | Per-book readiness and blockers |
| 5 | [05-recommendations.md](05-recommendations.md) | Prioritized improvements |
| 6 | [06-follow-up-issues.md](06-follow-up-issues.md) | Proposed GitHub issue backlog |

## Data artifacts

Generated during this audit (regenerate with `make generate-books-manifest` / `make generate-semantic-manifest`):

- [`data/books-manifest.json`](data/books-manifest.json) — 18 book entries (9 published + 9 upcoming)
- [`data/semantic-manifest.json`](data/semantic-manifest.json) — books + glossary + patterns + sources

## Constraints (from issue #99)

- Preserve author voice and intentional ambiguity.
- Prefer clarity over abstraction density; avoid generic motivational framing.
- Do not introduce external conceptual frameworks not already in the repository.
- Treat cross-book coherence as a primary concern.
- Document concerns before proposing terminology or structural changes.

## Methodology

1. Ran `make generate-books-manifest` and `make generate-semantic-manifest` (includes `verify-semantic-yaml`).
2. Read per-book `docs/status.md`, `book.yml`, `index.md`, and front-matter intros.
3. Compared [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md) against live status files.
4. Inventoried onboarding artifacts and commerce metadata across `books/` and `upcoming/`.
5. Synthesized findings into reports and a proposed issue backlog (issues not auto-created).
