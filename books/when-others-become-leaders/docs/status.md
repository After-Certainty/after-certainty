# When Others Become Leaders — Drafting Status

## Current phase

**Phase 5 — Published (July 2026)**

Manuscript at [`books/when-others-become-leaders/`](../). Exports enabled (docx, epub, pdf). CI export smoke passed on PR #284.

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

**July 2026:** `make validate-book-specs` pass; CI book-export job built docx/epub/pdf for `books/when-others-become-leaders`.

```bash
make build-book DIR=books/when-others-become-leaders FORMATS="docx epub"
```

## Rough scale

~50,880 words (July 2026)

## Promotion readiness

**R2** — published in `books/`; exports verified in CI.

IngramSpark print + ebook (paperback ISBN `9798256208912`, ebook ISBN `9798256208929`)
is `production-approved` and account-uploaded (2026-07).
