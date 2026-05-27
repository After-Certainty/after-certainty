# Why Collaboration Is So Hard — agent specs

**Eight revision agents** (numbered **01–08**) for chapter-by-chapter and manuscript-gate work on the published manuscript. Copy a spec into a Cursor agent prompt with the **target unit file** and linked docs, or use as a human checklist.

**Default order (one unit at a time):** **[01](./01-expansion-pass.md)** → **[02](./02-plain-speak-language.md)** → **[03](./03-flow-clarity-editor.md)** → **[04](./04-echo-pass.md)** → **[05](./05-citation-pass.md)** → **[06](./06-line-level-precision.md)**. After **all units in a part** finish 01–06, run **[07 part-echo](./07-part-echo-pass.md)**. After all four parts + back matter, run **[08 full-manuscript echo](./08-full-manuscript-echo-pass.md)**.

For a **single prompt** that walks 01–06 in order, see **[chapter-pipeline](./chapter-pipeline.md)**.

**House rules (agents do not override):**  
[`docs/book-rules.md`](../book-rules.md) → [`docs/drafting-process.md`](../drafting-process.md) → [`index.md`](../../index.md)

---

## Core invariant (carry on every pass)

> Collaboration is structurally unstable under contribution asymmetry, uneven visibility, and incomplete control—stabilizing practices help but do not remove the difficulty; the effort still matters.

**Three checkpoints:** (1) **structural not moral failure**—fragility is not blame-the-individual HR framing; (2) **stabilizing vs erasing difficulty**—facilitation, legibility, and trust practices survive fragility, they do not remove it; (3) **effort still matters**—affirmative close without team-building optimism or agile cheerleading.

---

## Invariant checkpoints by agent

| # | Agent | Invariant responsibility |
|---|--------|-------------------------|
| **01** | [Expansion](./01-expansion-pass.md) | Grow **beats and examples** (ownership, visibility, legibility, collapse modes); do not add new thesis or policy checklist |
| **02** | [Plain-speak](./02-plain-speak-language.md) | **Feynman clarity**—concrete mechanism, earned terms, no jargon stacks |
| **03** | [Flow & clarity](./03-flow-clarity-editor.md) | **`reflow_markdown_paragraphs.py`**; **Title Case** `###` headings; strip numbered `###` ladders |
| **04** | [Echo](./04-echo-pass.md) | No repeated claims, examples, or invariant phrasing vs prior units + **cluster siblings** |
| **05** | [Citation](./05-citation-pass.md) | Footnotes at pivots; bibliography sync; no `verify source` placeholders |
| **06** | [Line-level](./06-line-level-precision.md) | Micro-tighten **after** 01–05 |
| **07** | [Part echo](./07-part-echo-pass.md) | Cross-unit dedupe within a part (bridge + chapters; front-matter trio at Part I gate) |
| **08** | [Full manuscript echo](./08-full-manuscript-echo-pass.md) | Cross-part + cluster dedupe; Ch 14 vs conclusion ownership |

---

## Unit order (reading order)

Work **one file per 01–06 run** unless expanding a part in batch with explicit scope.

| # | Unit | Path |
|---|------|------|
| — | Core Reframe | `front-matter/core-reframe.md` |
| — | What This Book Is | `front-matter/what-this-book-is.md` |
| — | Organizing Question | `front-matter/organizing-question.md` |
| — | Part I bridge | `parts/part-1-contribution/bridge.md` |
| 1 | Ch 1 — What No One Owns Alone | `parts/part-1-contribution/chapter-1-what-no-one-owns-alone.md` |
| 2 | Ch 2 — Why Shared Work Feels Unstable | `parts/part-1-contribution/chapter-2-why-shared-work-feels-unstable.md` |
| 3 | Ch 3 — Alignment Without Full Understanding | `parts/part-1-contribution/chapter-3-alignment-without-full-understanding.md` |
| 4 | Ch 4 — Contribution Moves Unevenly | `parts/part-1-contribution/chapter-4-contribution-moves-unevenly.md` |
| — | Part II bridge | `parts/part-2-stabilizing-collaboration/bridge.md` |
| 5 | Ch 5 — Structures | `parts/part-2-stabilizing-collaboration/chapter-5-the-structures-that-hold-collaboration-together.md` |
| 6 | Ch 6 — Legibility and Trust | `parts/part-2-stabilizing-collaboration/chapter-6-legibility-and-trust.md` |
| 7 | Ch 7 — Stable Collaboration | `parts/part-2-stabilizing-collaboration/chapter-7-stable-collaboration.md` |
| — | Part III bridge | `parts/part-3-when-collaboration-collapses/bridge.md` |
| 8 | Ch 8 — Clarity as Control | `parts/part-3-when-collaboration-collapses/chapter-8-when-clarity-becomes-control.md` |
| 9 | Ch 9 — Efficiency as Coercion | `parts/part-3-when-collaboration-collapses/chapter-9-when-efficiency-becomes-coercion.md` |
| 10 | Ch 10 — Disagreement as Threat | `parts/part-3-when-collaboration-collapses/chapter-10-when-disagreement-becomes-threat.md` |
| 11 | Ch 11 — Residue | `parts/part-3-when-collaboration-collapses/chapter-11-residue.md` |
| — | Part IV bridge | `parts/part-4-seeing-collaboration-more-clearly/bridge.md` |
| 12 | Ch 12 — Diagnostic Lenses | `parts/part-4-seeing-collaboration-more-clearly/chapter-12-diagnostic-lenses.md` |
| 13 | Ch 13 — Fragility Is Not Failure | `parts/part-4-seeing-collaboration-more-clearly/chapter-13-fragility-is-not-failure.md` |
| 14 | Ch 14 — Why the Effort Still Matters | `parts/part-4-seeing-collaboration-more-clearly/chapter-14-why-the-effort-still-matters.md` |
| — | Conclusion | `back-matter/conclusion-why-the-effort-still-matters.md` |
| — | Glossary | `back-matter/glossary.md` |
| — | Bibliography | `back-matter/bibliography.md` |

**Branch naming:** `promote/why-collaboration-is-so-hard` (parent); per unit: `books/collaboration-<unit-slug>-<agent>`.

**Status:** Update [`docs/status.md`](../status.md) when a unit finishes **01–06**; append **Part N echo gate** after **07**; **Manuscript echo gate** after **08**.

**Validate (structure stable):**

```bash
make validate-book-specs
```

---

## Cluster echo (sibling books)

When running **04**, **07**, or **08**, skim for overlap with:

- [`books/coupling/`](../../../coupling/) — system architecture and responsibility (not human coordination under diffuse ownership)
- [`books/when-interpretation-no-longer-matters/`](../../../when-interpretation-no-longer-matters/) — authority when public understanding collapses
- [`books/when-incentives-become-the-moral-language/`](../../../when-incentives-become-the-moral-language/) — metrics replacing judgment
- [`books/the-economy-we-dont-experience/`](../../../the-economy-we-dont-experience/) — lived economy vs aggregate narrative
- [`books/how-meaning-moves/`](../../../how-meaning-moves/) — signal, compression, restraint
- [`books/after-certainty/`](../../../after-certainty/) — practice capstone

This book's distinct lens: **coordination under diffuse ownership**—contribution asymmetry, visibility, legibility, and structural fragility—not interpretation-collapse modes or incentive-formula moral language.

---

## Files

| # | File |
|---|------|
| **01** | `01-expansion-pass.md` |
| **02** | `02-plain-speak-language.md` |
| **03** | `03-flow-clarity-editor.md` |
| **04** | `04-echo-pass.md` |
| **05** | `05-citation-pass.md` |
| **06** | `06-line-level-precision.md` |
| **07** | `07-part-echo-pass.md` |
| **08** | `08-full-manuscript-echo-pass.md` |
| — | `chapter-pipeline.md` |
