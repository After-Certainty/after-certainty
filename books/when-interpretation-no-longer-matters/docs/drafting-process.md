# When Interpretation No Longer Matters — Drafting Process

## Key references

- [`docs/book-rules.md`](book-rules.md) — case template, tone, length bands
- [`docs/status.md`](status.md) — phase, expansion decision, unit progress
- [`docs/author-read-through-gate-parts-iii-iv.md`](author-read-through-gate-parts-iii-iv.md) — human sign-off (Parts III–IV)
- [`docs/agents/`](agents/) — chapter pipeline agents **01–08**
- [`index.md`](../index.md) — manuscript hub

## Current phase

**Phase 5 (essay edition)** — agent pipeline complete (May 2026). Expansion decision locked: essay band (~14.5k) is the export edition; full case-study band (~80–110k) deferred.

## Agent pipeline

Per-unit order: **01** → **02** → **03** → **04** → **05** → **06**. After all units in a part: **07** (part echo). After all four parts + conclusion: **08** (manuscript echo).

See [`docs/agents/chapter-pipeline.md`](agents/chapter-pipeline.md) for prerequisites and expansion-band rules.

**Agent 01 under essay edition:** light deepen only — do not double manuscript length in one pass.

## Author gate

Human read-through for Parts III–IV before export release. Checklist: [`author-read-through-gate-parts-iii-iv.md`](author-read-through-gate-parts-iii-iv.md).

## Export

```bash
make build-book DIR=books/when-interpretation-no-longer-matters FORMATS="docx epub pdf"
```

Record result in [`status.md`](status.md) under **Build smoke**.

## Full-band expansion (deferred)

When author selects the ~80–110k case-study band, re-read Agent **01** spec and update `status.md` before heavy expansion passes.
