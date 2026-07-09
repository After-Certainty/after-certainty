# When Incentives Become the Moral Language — Drafting Process

## Key references

- [`docs/book-rules.md`](book-rules.md) — domain scaffold, tone, length bands
- [`docs/status.md`](status.md) — phase, expansion decision, unit progress
- [`docs/author-read-through-gate-ch-3-8.md`](author-read-through-gate-ch-3-8.md) — human sign-off (Ch 3–8)
- [`docs/agents/`](agents/) — chapter pipeline agents **01–08**
- [`index.md`](../index.md) — manuscript hub

## Current phase

**Phase 5 (essay edition)** — agent pipeline complete (May 2026). Expansion decision locked: essay band (~9–11k) is the export edition; first-cycle (~12–18k) and long-term (~60–80k) bands deferred.

## Agent pipeline

Per-unit order: **01** → **02** → **03** → **04** → **05** → **06**. After all units in a part: **07** (part echo). After Part II + conclusion: **08** (manuscript echo).

See [`docs/agents/chapter-pipeline.md`](agents/chapter-pipeline.md) for prerequisites and expansion-band rules.

**Agent 01 under essay edition:** light deepen only — do not double manuscript length in one pass.

### Per-part gate (after all units in part complete 01–06)

7. [Part echo](../agents/07-part-echo-pass.md)

### Manuscript gate (after Part II 07 + conclusion 01–06)

8. [Full manuscript echo](../agents/08-full-manuscript-echo-pass.md)

Chained single-unit prompt: [chapter-pipeline.md](../agents/chapter-pipeline.md)

See [upcoming/docs/_templates/drafting-process.md.template](../../../upcoming/docs/_templates/drafting-process.md.template) for portfolio-wide phases.

## Author gate

Human read-through for Ch 3–8 before export release. Checklist: [`author-read-through-gate-ch-3-8.md`](author-read-through-gate-ch-3-8.md). **Signed off July 2026.**

## Export

```bash
make build-book DIR=books/when-incentives-become-the-moral-language FORMATS="docx epub pdf"
```

Record result in [`status.md`](status.md) under **Build smoke**.

## Full-band expansion (deferred)

When author selects the ~12–18k first-cycle or ~60–80k long-term band, re-read Agent **01** spec and update `status.md` before heavy expansion passes.
