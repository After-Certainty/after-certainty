# When Incentives Become the Moral Language — Legacy Essay Edition Agents

> **ARCHIVED (July 2026)** — Phase 5 essay edition pipeline (~9–11k).  
> **Do not use for rewrite work.** Agent **01** reinforces the visible domain scaffold the essayistic rewrite removes.  
> **Active pipeline:** [`../rewrite/README.md`](../rewrite/README.md)

**Eight revision agents** (numbered **01–08**) for chapter-by-chapter and manuscript-gate work on the published essay edition.

**Default order (one unit at a time):** **[01](./01-expansion-pass.md)** → **[02](./02-plain-speak-language.md)** → **[03](./03-flow-clarity-editor.md)** → **[04](./04-echo-pass.md)** → **[05](./05-citation-pass.md)** → **[06](./06-line-level-precision.md)**. After **all units in a part** finish 01–06, run **[07 part-echo](./07-part-echo-pass.md)**. After both parts + conclusion, run **[08 full-manuscript echo](./08-full-manuscript-echo-pass.md)**.

For a **single prompt** that walks 01–06 in order, see **[chapter-pipeline](./chapter-pipeline.md)**.

**House rules (agents do not override):**  
[`docs/book-rules.md`](../../book-rules.md) → [`docs/drafting-process.md`](../../drafting-process.md) → [`index.md`](../../../index.md)

---

## Core invariant (carry on every pass)

> When judgment no longer scales, incentives become the moral language—systems coordinate action through survivability, visibility, and formulaic fairness rather than through shared understanding of what matters.

**Three checkpoints:** (1) **substitution vs translation**—metrics as translators first, moral language second; (2) **moral residue**—practitioners still judge, institutions speak in audit-surviving forms; (3) **productivity vs contribution** (or domain equivalent) in each chapter’s close.

---

## Invariant checkpoints by agent

| # | Agent | Invariant responsibility |
|---|--------|-------------------------|
| **01** | [Expansion](./01-expansion-pass.md) | Grow **beats and examples** (care, platforms, publishing, targets, fairness, polling, formation); do not add new thesis or policy checklist |
| **02** | [Plain-speak](./02-plain-speak-language.md) | **Feynman clarity**—concrete mechanism, earned terms, no jargon stacks |
| **03** | [Flow & clarity](./03-flow-clarity-editor.md) | **`reflow_markdown_paragraphs.py`**; **Title Case** `###` headings; strip numbered `###` ladders |
| **04** | [Echo](./04-echo-pass.md) | No repeated claims, examples, or invariant phrasing vs prior units + **cluster siblings** |
| **05** | [Citation](./05-citation-pass.md) | Footnotes at pivots; bibliography sync; no `verify source` placeholders |
| **06** | [Line-level](./06-line-level-precision.md) | Micro-tighten **after** 01–05 |
| **07** | [Part echo](./07-part-echo-pass.md) | Cross-unit dedupe within a part (bridge + chapters; intro in Part I; interlude at Part II gate) |
| **08** | [Full manuscript echo](./08-full-manuscript-echo-pass.md) | Cross-part + cluster dedupe after all **07** gates |

---

## Unit order (reading order)

Work **one file per 01–06 run** unless expanding a part in batch with explicit scope.

| # | Unit | Path |
|---|------|------|
| — | Introduction | `front-matter/introduction-why-judgment-no-longer-coordinates-action.md` |
| — | Part I bridge | `parts/part-1-when-judgment-fractures/bridge.md` |
| 1 | Ch 1 — Care | `parts/part-1-when-judgment-fractures/chapter-1-care-without-caring.md` |
| 2 | Ch 2 — Engagement | `parts/part-1-when-judgment-fractures/chapter-2-engagement-as-a-theory-of-value.md` |
| 3 | Ch 3 — Publishing | `parts/part-1-when-judgment-fractures/chapter-3-publishing-as-truth.md` |
| 4 | Ch 4 — Targets | `parts/part-1-when-judgment-fractures/chapter-4-targets-without-judgment.md` |
| — | Interlude | `front-matter/interlude-what-this-book-is-not.md` *(between parts; see `index.md`)* |
| — | Part II bridge | `parts/part-2-when-formula-speaks/bridge.md` |
| 5 | Ch 5 — Fairness | `parts/part-2-when-formula-speaks/chapter-5-fairness-by-formula.md` |
| 6 | Ch 6 — Attention | `parts/part-2-when-formula-speaks/chapter-6-attention-as-importance.md` |
| 7 | Ch 7 — Polling | `parts/part-2-when-formula-speaks/chapter-7-polling-as-moral-signal.md` |
| 8 | Ch 8 — Formation | `parts/part-2-when-formula-speaks/chapter-8-formation-without-formation.md` |
| — | Conclusion | `back-matter/conclusion-living-inside-incentive-systems.md` |

**Branch naming:** `promote/when-incentives-become-the-moral-language` (parent); per unit: `books/incentives-<unit-slug>-<agent>`.

**Status:** Update [`docs/status.md`](../../status.md) when a unit finishes **01–06**; append **Part N echo gate** after **07**; **Manuscript echo gate** after **08**.

**Validate (structure stable):**

```bash
make validate-book-specs
```

---

## Cluster echo (sibling books)

When running **04**, **07**, or **08**, skim for overlap with:

- [`books/after-certainty/`](../../../after-certainty/) — practice capstone
- [`books/the-economy-we-dont-experience/`](../../../the-economy-we-dont-experience/) — lived economy vs aggregate narrative
- [`books/when-interpretation-no-longer-matters/`](../../../when-interpretation-no-longer-matters/) — authority without shared meaning

This book’s distinct lens: **incentives as moral language** when judgment fails operationally—not generic “scale” or “compression” repetition.

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
