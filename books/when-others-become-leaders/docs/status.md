# When Others Become Leaders — Drafting Status

## Current phase

**Phase 5 — Promoted to `books/` (July 2026)**

Manuscript at [`books/when-others-become-leaders/`](../). Exports enabled (docx, epub, pdf). Build smoke pending CI.

## Manuscript hub

[`index.md`](../index.md)

## Key docs

- [`manuscript-wide-pass.md`](manuscript-wide-pass.md) — Phase 4 gate
- [`part-1-coherence-pass.md`](part-1-coherence-pass.md), [`part-2-coherence-pass.md`](part-2-coherence-pass.md), [`part-3-coherence-pass.md`](part-3-coherence-pass.md)
- Portfolio rollup: [`upcoming/docs/portfolio-status.md`](../../../upcoming/docs/portfolio-status.md)

## Edition policy

| Decision | Status |
|----------|--------|
| Target length | **Locked** — ~50k words |
| Chapter count | **Locked** — nine chapters + intro + epilogue |
| WOLTY / circulation | **Locked** — [`reading-with-the-series.md`](../front-matter/reading-with-the-series.md) |

## Build smoke

```bash
make validate-book-specs
make build-book DIR=books/when-others-become-leaders FORMATS="docx epub"
```

PDF requires `xelatex` (CI book-export workflow).

## Rough scale

~50,880 words (July 2026)

## Promotion readiness

**R2** — published in `books/`; export smoke on merge.
