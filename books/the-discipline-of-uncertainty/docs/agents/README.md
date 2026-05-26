# The Discipline of Uncertainty — agent specs

**Seven revision agents** (numbered **01–07**) for chapter-by-chapter and part-gate work on the published manuscript. Copy a spec into a Cursor agent prompt with the **target unit file** and linked docs, or use as a human checklist.

**Default order (one unit at a time):** **[01](./01-expansion-pass.md)** → **[02](./02-plain-speak-language.md)** → **[03](./03-flow-clarity-editor.md)** → **[04](./04-echo-pass.md)** → **[05](./05-citation-pass.md)** → **[06](./06-line-level-precision.md)**. After **all units in a part** finish 01–06, run **[07 part-echo](./07-part-echo-pass.md)** on the part scope. For a **single prompt** that walks 01–06 in order, see **[chapter-pipeline](./chapter-pipeline.md)**.

**House rules (agents do not override):**  
[`docs/book-rules.md`](../book-rules.md) → [`docs/drafting-process.md`](../drafting-process.md) → [`index.md`](../../index.md)

---

## Core invariant (carry on every pass)

> Maturity under incomplete information requires disciplined uncertainty—patterns as warnings not verdicts, probabilistic seriousness without relativism, and leadership that refuses false prophecy.

**Three checkpoints:** (1) **warnings vs verdicts** when discussing patterns; (2) **probabilistic seriousness ≠ relativism** when discussing moral stakes; (3) **leadership without false prophecy** when discussing authority and speech.

---

## Invariant checkpoints by agent

| # | Agent | Invariant responsibility |
|---|--------|-------------------------|
| **01** | [Expansion](./01-expansion-pass.md) | Grow **beats and examples** (clinical, organizational, institutional); do not add new thesis or self-help framing |
| **02** | [Plain-speak](./02-plain-speak-language.md) | **Feynman clarity**—concrete mechanism, earned terms, no jargon stacks; warnings/verdicts in plain language |
| **03** | [Flow & clarity](./03-flow-clarity-editor.md) | **`reflow_markdown_paragraphs.py`**; **Title Case** `###` headings; skimmable structure; handoffs; strip numbered `###` ladders |
| **04** | [Echo](./04-echo-pass.md) | No repeated claims, examples, or invariant phrasing vs prior units + cluster siblings |
| **05** | [Citation](./05-citation-pass.md) | Footnotes at pivots; bibliography sync; no `verify source` placeholders |
| **06** | [Line-level](./06-line-level-precision.md) | Micro-tighten **after** 01–05; no new ideas or “literary” elevation |
| **07** | [Part echo](./07-part-echo-pass.md) | Cross-unit dedupe within a part (bridge + chapters; intro for Part I) |

---

## Suggested workflow (per unit)

| Step | Agent | When |
|------|--------|------|
| **01** | [Expansion pass](./01-expansion-pass.md) | Unit below target band |
| **02** | [Plain-speak language](./02-plain-speak-language.md) | After expansion (or first pass if at length) |
| **03** | [Flow & clarity](./03-flow-clarity-editor.md) | After plain-speak; reflow, headings, merge, handoffs |
| **04** | [Echo pass](./04-echo-pass.md) | After clarity; read **prior units in reading order** |
| **05** | [Citation pass](./05-citation-pass.md) | After echo; drafted claims only |
| **06** | [Line-level precision](./06-line-level-precision.md) | **Optional sparingly**—last micro-pass |
| **07** | [Part echo](./07-part-echo-pass.md) | After last chapter in part completes 01–06 |

**Part gates (human + agent 07):** after all units in a part complete 01–06, run **07** and record in `docs/status.md`.

---

## Unit order (reading order)

Work **one file per 01–06 run** unless expanding a part in batch with explicit scope.

| # | Unit | Path |
|---|------|------|
| — | Introduction | `front-matter/introduction-when-certainty-stops-working.md` |
| — | Part I bridge | `parts/part-1-why-we-crave-absolutes/bridge.md` |
| 1 | Ch 1 — Psychological comfort | `parts/part-1-why-we-crave-absolutes/chapter-1-the-psychological-comfort-of-certainty.md` |
| 2 | Ch 2 — Abstraction | `parts/part-1-why-we-crave-absolutes/chapter-2-abstraction-and-the-seduction-of-clean-answers.md` |
| — | Part II bridge | `parts/part-2-what-patterns-actually-are/bridge.md` |
| 3 | Ch 3 — Patterns as warnings | `parts/part-2-what-patterns-actually-are/chapter-3-patterns-as-warnings-not-verdicts.md` |
| 4 | Ch 4 — Fatalistic patterns | `parts/part-2-what-patterns-actually-are/chapter-4-when-pattern-recognition-turns-fatalistic.md` |
| — | Part III bridge | `parts/part-3-probabilistic-truth-and-moral-seriousness/bridge.md` |
| 5 | Ch 5 — World refuses absolutes | `parts/part-3-probabilistic-truth-and-moral-seriousness/chapter-5-why-the-world-refuses-absolutes.md` |
| 6 | Ch 6 — Probabilism ≠ relativism | `parts/part-3-probabilistic-truth-and-moral-seriousness/chapter-6-probabilistic-reasoning-is-not-moral-relativism.md` |
| — | Part IV bridge | `parts/part-4-institutions-authority-and-drift/bridge.md` |
| 7 | Ch 7 — Warning systems | `parts/part-4-institutions-authority-and-drift/chapter-7-warning-systems-that-incriminate-their-own-success.md` |
| 8 | Ch 8 — Collapse into absolutes | `parts/part-4-institutions-authority-and-drift/chapter-8-individuals-structures-and-the-collapse-into-absolutes.md` |
| — | Part V bridge | `parts/part-5-leadership-without-prophecy/bridge.md` |
| 9 | Ch 9 — Pressured into certainty | `parts/part-5-leadership-without-prophecy/chapter-9-why-leaders-are-pressured-into-certainty.md` |
| 10 | Ch 10 — Leadership practice | `parts/part-5-leadership-without-prophecy/chapter-10-the-discipline-of-uncertainty-as-leadership-practice.md` |
| — | Part VI bridge | `parts/part-6-living-without-guarantees/bridge.md` |
| 11 | Ch 11 — Responsibility | `parts/part-6-living-without-guarantees/chapter-11-responsibility-after-certainty.md` |
| 12 | Ch 12 — Meaning | `parts/part-6-living-without-guarantees/chapter-12-meaning-that-survives-uncertainty.md` |
| — | Conclusion | `back-matter/conclusion-uncertainty-as-a-discipline.md` |
| — | Appendix A | `back-matter/appendix-a-bounded-seriousness-not-infinite-possibility.md` |
| — | Appendix B | `back-matter/appendix-b-doubt-versus-discipline.md` |
| — | Appendix C | `back-matter/appendix-c-faith-science-and-probabilistic-commitment.md` |

**Branch naming:** `books/discipline-<unit-slug>-<agent>` (e.g. `books/discipline-ch3-plain-speak`); parent fold: `books/the-discipline-of-uncertainty-editorial-fold`.

**Status:** Update [`docs/status.md`](../status.md) when a unit finishes 01–06; append **Part N echo gate** after **07**.

**Export smoke (after part or full book):**

```bash
make validate-book-specs
make build-book DIR=books/the-discipline-of-uncertainty FORMATS="docx epub pdf"
```

---

## Cluster echo (sibling books)

When running **04** or **07**, skim for overlap with:

- [`books/after-certainty/`](../../../after-certainty/) — esp. discipline of not knowing (Ch 7)
- [`books/before-certainty-arrives/`](../../../before-certainty-arrives/)
- [`books/how-serious-systems-learn/`](../../../how-serious-systems-learn/)
- [`books/the-economy-we-dont-experience/`](../../../the-economy-we-dont-experience/) — lived vs aggregate (different lens)
- [`upcoming/when-interpretation-no-longer-matters/`](../../../../upcoming/when-interpretation-no-longer-matters/)
- [`upcoming/when-incentives-become-the-moral-language/`](../../../../upcoming/when-incentives-become-the-moral-language/)

This book’s distinct lens: **uncertainty as practiced discipline**—warnings not verdicts, moral seriousness without relativism, institutions and leaders under incomplete information.

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
| — | `chapter-pipeline.md` |
