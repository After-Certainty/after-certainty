# The Economy We Don't Experience — agent specs

**Five revision agents** (numbered **01–05**) for chapter-by-chapter work on the published manuscript. Copy a spec into a Cursor agent prompt with the **target unit file** and linked docs, or use as a human checklist.

**Default order (one unit at a time):** **[01](./01-expansion-pass.md)** → **[02](./02-flow-clarity-editor.md)** → **[03](./03-echo-pass.md)** → **[04](./04-citation-pass.md)** → **[05](./05-line-level-precision.md)**. Run **one agent per session** unless the prompt explicitly chains a subset. For a **single prompt** that walks all five in order, see **[chapter-pipeline](./chapter-pipeline.md)**.

**House rules (agents do not override):**  
[`docs/book-rules.md`](../book-rules.md) → [`docs/drafting-process.md`](../drafting-process.md) → [`index.md`](../../index.md)

---

## Core invariant (carry on every pass)

> The economy we argue about is not the economy we experience—compression, scaled pain, and interpretive stress break leadership communication long before policy fails on its own terms.

**Compression–signaling slide:** necessary reduction becomes harmful when speech is heard as **positioning** rather than **mapping**. **Two clocks:** national indicator + local transmission (rent, freight, inventory, renewal)—name both without canceling either.

---

## Invariant checkpoints by agent

| # | Agent | Invariant responsibility |
|---|--------|-------------------------|
| **01** | [Expansion](./01-expansion-pass.md) | Grow **beats and examples** (housing, labor, supply chain, leadership vignettes); do not add new thesis or partisan frame |
| **02** | [Flow & clarity](./02-flow-clarity-editor.md) | Plain diagnostic prose; **two clocks** where relevant; tame stacked negation and essay register |
| **03** | [Echo](./03-echo-pass.md) | No repeated claims, examples, or invariant phrasing vs prior units in this book + cluster siblings |
| **04** | [Citation](./04-citation-pass.md) | Footnotes at pivots; bibliography sync; no `verify source` placeholders |
| **05** | [Line-level](./05-line-level-precision.md) | Micro-tighten **after** 01–04; no new ideas or “literary” elevation |

---

## Suggested workflow (per unit)

| Step | Agent | When |
|------|--------|------|
| **01** | [Expansion pass](./01-expansion-pass.md) | Unit below target band or thin on examples; **one unit per branch** toward ~28–32k edition |
| **02** | [Flow & clarity](./02-flow-clarity-editor.md) | After expansion (or first pass if unit already at length) |
| **03** | [Echo pass](./03-echo-pass.md) | After clarity; read **prior units in reading order** |
| **04** | [Citation pass](./04-citation-pass.md) | After echo; drafted claims only |
| **05** | [Line-level precision](./05-line-level-precision.md) | **Optional sparingly**—last micro-pass before author review |

**Part gates (human):** after all units in a part complete 01–05, run a part coherence note in `docs/status.md` (see [drafting-process.md](../drafting-process.md) Phase 3). **Do not** skip echo before citations on units that restate cluster examples.

---

## Unit order (reading order)

Work **one file per pipeline run** unless expanding a part in batch with explicit scope.

| # | Unit | Path |
|---|------|------|
| — | Introduction | `front-matter/introduction-the-economy-we-argue-about.md` |
| 1 | Ch 1 — Compression | `parts/part-1-the-economy-we-describe/chapter-1-the-compression-problem.md` |
| 2 | Ch 2 — Forecast era | `parts/part-1-the-economy-we-describe/chapter-2-the-forecast-era-that-didnt-break.md` |
| 3 | Ch 3 — Experienced economy | `parts/part-1-the-economy-we-describe/chapter-3-the-economy-we-experience.md` |
| 4 | Ch 4 — Pain scales | `parts/part-2-why-pain-travels-farther/chapter-4-why-pain-always-scales.md` |
| 5 | Ch 5 — Resonance | `parts/part-2-why-pain-travels-farther/chapter-5-resonance-without-understanding.md` |
| 6 | Ch 6 — Leadership | `parts/part-3-leadership-under-compression/chapter-6-leadership-under-interpretive-stress.md` |
| 7 | Ch 7 — Elections | `parts/part-3-leadership-under-compression/chapter-7-elections-without-shared-understanding.md` |
| 8 | Ch 8 — Guardrails | `parts/part-4-stability-memory-and-fragility/chapter-8-resilience-reform-and-forgotten-guardrails.md` |
| — | Conclusion | `back-matter/conclusion-leadership-after-explanation-stops-scaling.md` |
| — | Appendix A | `back-matter/appendix-a-why-just-tell-the-truth.md` *(optional pipeline)* |

**Branch naming:** `books/economy-<unit-slug>-<agent>-<phase>` (e.g. `books/economy-ch6-expansion`).

**Status:** Update [`docs/status.md`](../status.md) when a unit finishes a full 01–05 cycle.

**Export smoke (after part or full book):**

```bash
make validate-book-specs
make build-book DIR=books/the-economy-we-dont-experience FORMATS="docx epub pdf"
```

---

## Cluster echo (sibling books)

When running **03**, skim for overlap with:

- [`books/after-certainty/`](../../../after-certainty/) — practice capstone
- [`upcoming/when-interpretation-no-longer-matters/`](../../../../upcoming/when-interpretation-no-longer-matters/) — authority without shared meaning
- [`upcoming/when-incentives-become-the-moral-language/`](../../../../upcoming/when-incentives-become-the-moral-language/) — metrics replacing judgment

This book’s distinct lens: **lived economy vs aggregate narrative** under compression—not generic “judgment under scale” repetition.

---

## Files

| # | File |
|---|------|
| **01** | `01-expansion-pass.md` |
| **02** | `02-flow-clarity-editor.md` |
| **03** | `03-echo-pass.md` |
| **04** | `04-citation-pass.md` |
| **05** | `05-line-level-precision.md` |
| — | `chapter-pipeline.md` *(chained five-step prompt for one unit)* |

Each numbered file uses: **ROLE**, **PURPOSE**, **WHEN**, **INPUTS**, **FOCUS**, **DO**, **DO NOT**, **OUTPUT**, **PIPELINE**.
