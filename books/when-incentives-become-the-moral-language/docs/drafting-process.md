# When Incentives Become the Moral Language — Drafting Process

## Current phase

**Phase 6 (essayistic rewrite — planning)** — July 2026

Essay edition (Phase 5) pipeline is **archived**. Rewrite specs live under [`agents/rewrite/`](agents/rewrite/).

## Key references

- [`WHEN_INCENTIVES_REWRITE_PLAN.md`](WHEN_INCENTIVES_REWRITE_PLAN.md) — full rewrite brief
- [`author-approval-gates.md`](author-approval-gates.md) — blocking decisions
- [`book-rules.md`](book-rules.md) — scene-first craft rules (invisible scaffold)
- [`status.md`](status.md) — phase and unit progress
- [`index.md`](../index.md) — manuscript hub (essay edition until restructure)

## Essay edition (Phase 5 — complete)

Per-unit order was **01 → 02 → 03 → 04 → 05 → 06**, then **07** (part echo), **08** (manuscript echo).

Archived specs: [`agents/legacy-essay-edition/`](agents/legacy-essay-edition/)

**Do not use** legacy Agent **01** (expansion/scaffold) for rewrite work—it reinforces the visible domain scaffold the rewrite removes.

## Essayistic rewrite (Phase 6 — planned)

### Prerequisites

1. Author sign-off on [`author-approval-gates.md`](author-approval-gates.md)
2. Rewrite branch created
3. `index.md` restructured for four-part / twelve-chapter architecture

### Rewrite sequence

Per [`WHEN_INCENTIVES_REWRITE_PLAN.md` §16](WHEN_INCENTIVES_REWRITE_PLAN.md#16-recommended-rewrite-sequence):

1. Introduction
2. Ch 1 (Bed)
3. Ch 9 (Proxy — provisional)
4. Ch 10 (Hidden Subsidy)
5. Interlude (Map)
6. Ch 2–8 (domain chapters)
7. Ch 9 revision
8. Ch 11
9. Ch 12 + Epilogue
10. Transition and repetition pass
11. Citation verification
12. Voice consistency pass

### Per-chapter agents

See [`agents/rewrite/README.md`](agents/rewrite/README.md).

### Echo gates (rewrite)

| Gate | When |
|------|------|
| Part I echo | After Ch 1–3 + interlude draft |
| Part III echo | After Ch 7–9 draft |
| Full manuscript echo | After Ch 12 + epilogue |

## Export

Essay edition (current manuscript):

```bash
make build-book DIR=books/when-incentives-become-the-moral-language FORMATS="docx epub pdf"
```

During active rewrite, consider disabling `github.release` in `book.yml` until milestone (see author gates).

Record build results in [`status.md`](status.md).

## Author gates

| Gate | Document | Status |
|------|----------|--------|
| Essay edition Ch 3–8 | [`author-read-through-gate-ch-3-8.md`](author-read-through-gate-ch-3-8.md) | Complete (July 2026) |
| Rewrite start | [`author-approval-gates.md`](author-approval-gates.md) | Pending |
