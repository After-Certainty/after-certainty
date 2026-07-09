# When Incentives Become the Moral Language — Drafting Status

## Current phase

**Phase 6 (essayistic rewrite — planning)** — July 2026

Essay edition (Phase 5) remains complete and exportable at current manuscript paths. Rewrite work has **not** started on prose files.

| Milestone | Status |
|-----------|--------|
| Essay edition (~9–11k) | **Complete** (Phase 5, July 2026) |
| Rewrite planning document | **Complete** — [`WHEN_INCENTIVES_REWRITE_PLAN.md`](WHEN_INCENTIVES_REWRITE_PLAN.md) |
| Author approval gates | **Pending** — [`author-approval-gates.md`](author-approval-gates.md) |
| Chapter rewrites | **Not started** |

## Rewrite target

| Band | Words | Status |
|------|------:|--------|
| Essay edition (baseline) | ~9–11k | **Frozen** — current `index.md` paths |
| **Essayistic rewrite (planned)** | **~42,000–52,000** | Awaiting author gates |
| Long-term ceiling | ~60–80k | Optional (author Band B) |

## Manuscript hub

[`index.md`](../index.md) — **essay edition structure** until rewrite restructures `index.md`

## Planned structure (rewrite)

| Part | Chapters |
|------|----------|
| Introduction | The Question the Dashboard Cannot Ask |
| I — The Need for Translation | 1–3 (healthcare, platforms, academia) |
| Interlude | The Map Was Not a Lie |
| II — When the Translation Takes Over | 4–6 (climate, workforce, journalism) |
| III — The World the Metric Makes | 7–9 (politics, education, synthesis) |
| IV — What Judgment Still Knows | 10–12 (subsidy, deafness, orientation) |
| Epilogue | The Blank Column |

See [`WHEN_INCENTIVES_REWRITE_PLAN.md` §4](WHEN_INCENTIVES_REWRITE_PLAN.md#4-proposed-book-architecture) for full architecture.

## Essay edition unit progress (baseline — unchanged)

| Unit | Words | Phase 5 | Notes |
|------|------:|---------|-------|
| Introduction | 849 | Complete | Rewrite planned |
| Interlude | 490 | Complete | Full rewrite planned |
| Part I bridge | ~720 | Complete | Deprecated in rewrite |
| Ch 1 — Care | 1208 | Complete | → Ch 1 Bed |
| Ch 2 — Engagement | 1408 | Complete | → Ch 2 Feed |
| Ch 3 — Publishing | 1086 | Complete | → Ch 3 Paper |
| Ch 4 — Targets | 1192 | Complete | → Ch 4 Target |
| Part II bridge | ~140 | Complete | Deprecated in rewrite |
| Ch 5 — Fairness | 1025 | Complete | → Ch 5 Matrix |
| Ch 6 — Attention | 1022 | Complete | → Ch 6 Front Page |
| Ch 7 — Polling | 863 | Complete | → Ch 7 Poll |
| Ch 8 — Formation | 763 | Complete | → Ch 8 Child/Score |
| Conclusion | 920 | Complete | → Ch 12 + new Ch 9–11, epilogue |
| Appendix | 330 | Complete | Update planned |
| Bibliography | — | Incomplete | Expand on rewrite |

**Essay edition total:** ~11.5k words (July 2026).

## Author gates

| Gate | Status |
|------|--------|
| Ch 3–8 read-through (essay edition) | **Complete** (July 2026) — [`author-read-through-gate-ch-3-8.md`](author-read-through-gate-ch-3-8.md) |
| Rewrite approval gates | **Pending** — [`author-approval-gates.md`](author-approval-gates.md) |

## Agent pipeline

| Pipeline | Status | Location |
|----------|--------|----------|
| Essay edition 01–08 | **Archived** | [`agents/legacy-essay-edition/`](agents/legacy-essay-edition/) |
| Essayistic rewrite | **Active (specs ready)** | [`agents/rewrite/`](agents/rewrite/) |

Do not use legacy essay-edition Agent **01** (expansion/scaffold) for rewrite work.

## Build smoke

**July 2026 (essay edition):** `make validate-book-specs` pass; `make build-book` pass.

During active rewrite, consider disabling `github.release` in `book.yml` until milestone (see author gates).

## Next actions

1. Author sign-off on [`author-approval-gates.md`](author-approval-gates.md)
2. Create rewrite branch and restructure `index.md` when gates clear
3. Begin rewrite sequence per [`WHEN_INCENTIVES_REWRITE_PLAN.md` §16](WHEN_INCENTIVES_REWRITE_PLAN.md#16-recommended-rewrite-sequence): Introduction → Ch 1 → Ch 9 (provisional) → Ch 10 → Interlude → Ch 2–8 → …

## Key documents

- [`WHEN_INCENTIVES_REWRITE_PLAN.md`](WHEN_INCENTIVES_REWRITE_PLAN.md)
- [`author-approval-gates.md`](author-approval-gates.md)
- [`book-rules.md`](book-rules.md)
- [`drafting-process.md`](drafting-process.md)
