# When Interpretation No Longer Matters — agent specs

**Eight revision agents** (numbered **01–08**) for chapter-by-chapter and manuscript-gate work on the manuscript. Copy a spec into a Cursor agent prompt with the **target unit file** and linked docs, or use as a human checklist.

**Default order (one unit at a time):** **[01](./01-expansion-pass.md)** → **[02](./02-plain-speak-language.md)** → **[03](./03-flow-clarity-editor.md)** → **[04](./04-echo-pass.md)** → **[05](./05-citation-pass.md)** → **[06](./06-line-level-precision.md)**. After **all units in a part** finish 01–06, run **[07 part-echo](./07-part-echo-pass.md)**. After all four parts + conclusion, run **[08 full-manuscript echo](./08-full-manuscript-echo-pass.md)**.

For a **single prompt** that walks 01–06 in order, see **[chapter-pipeline](./chapter-pipeline.md)**.

**House rules (agents do not override):**  
[`docs/book-rules.md`](../book-rules.md) → [`docs/drafting-process.md`](../drafting-process.md) → [`index.md`](../../index.md)

---

## Core invariant (carry on every pass)

> When public interpretation stops working, authority does not disappear—its *basis* shifts. Coordination moves from shared understanding to alignment pressure, identity saturation, performative legitimacy, coercion, and narrative enclosure.

**Three checkpoints:** (1) **interpretation_boundary**—name what no longer coordinates (shared reasons, evidence, repair) without moralizing the reader; (2) **authority_modes**—keep the four modes distinct (alignment, identity saturation, coercion/performative legitimacy, narrative enclosure); (3) **judgment_after**—preserve the book’s aim: recognition and navigation, not a rescue program.

---

## Invariant checkpoints by agent

| # | Agent | Invariant responsibility |
|---|--------|-------------------------|
| **01** | [Expansion](./01-expansion-pass.md) | Grow **beats and examples** (boundary, alignment, identity saturation, performative legitimacy/coercion, enclosure); do not add new thesis or “solutions” list |
| **02** | [Plain-speak](./02-plain-speak-language.md) | **Feynman clarity**—concrete mechanism, earned terms, no jargon stacks |
| **03** | [Flow & clarity](./03-flow-clarity-editor.md) | **`reflow_markdown_paragraphs.py`**; **Title Case** `###` headings; strip numbered `###` ladders |
| **04** | [Echo](./04-echo-pass.md) | No repeated claims, examples, or invariant phrasing vs prior units + **cluster siblings** |
| **05** | [Bibliography / citation](./05-citation-pass.md) | **Manuscript-wide** Chicago NB normalization; full `bibliography.md`; split-bleed cleanup |
| **06** | [Line-level](./06-line-level-precision.md) | Micro-tighten **after** 01–05 |
| **07** | [Part echo](./07-part-echo-pass.md) | Cross-unit dedupe within a part (bridge + chapters; intro in Part I gate only) |
| **08** | [Full manuscript echo](./08-full-manuscript-echo-pass.md) | Cross-part + cluster dedupe after all **07** gates |

---

## Unit order (reading order)

Work **one file per 01–06 run** unless expanding a part in batch with explicit scope.

| # | Unit | Path |
|---|------|------|
| — | Introduction | `front-matter/introduction-the-question-this-book-asks.md` |
| — | How to read | `front-matter/how-to-read-this-book.md` *(optional pipeline)* |
| — | Part I bridge | `parts/part-1-where-interpretation-ends/bridge.md` |
| 1 | Ch 1 — Boundary | `parts/part-1-where-interpretation-ends/chapter-1-the-boundary-we-could-not-cross.md` |
| 2 | Ch 2 — What it means | `parts/part-1-where-interpretation-ends/chapter-2-what-it-means-for-interpretation-to-stop-working.md` |
| — | Part II bridge | `parts/part-2-authority-without-interpretation/bridge.md` |
| 3 | Ch 3 — Alignment vs interpretation | `parts/part-2-authority-without-interpretation/chapter-3-alignment-versus-interpretation.md` |
| 4 | Ch 4 — Identity saturation | `parts/part-2-authority-without-interpretation/chapter-4-identity-saturation.md` |
| 5 | Ch 5 — Coercion / performative legitimacy | `parts/part-2-authority-without-interpretation/chapter-5-coercion-consent-and-performative-legitimacy.md` |
| 6 | Ch 6 — Narrative enclosure | `parts/part-2-authority-without-interpretation/chapter-6-narrative-enclosure.md` |
| — | Part III bridge | `parts/part-3-cases-beyond-interpretation/bridge.md` |
| 7 | Ch 7 — Alignment-based authority | `parts/part-3-cases-beyond-interpretation/chapter-7-alignment-based-authority.md` |
| 8 | Ch 8 — Identity-saturated political authority | `parts/part-3-cases-beyond-interpretation/chapter-8-identity-saturated-political-authority.md` |
| 9 | Ch 9 — Total authority | `parts/part-3-cases-beyond-interpretation/chapter-9-total-authority-and-the-end-of-public-interpretation.md` |
| 10 | Ch 10 — Transitional cases | `parts/part-3-cases-beyond-interpretation/chapter-10-transitional-and-borderline-cases.md` |
| — | Part IV bridge | `parts/part-4-after-interpretation/bridge.md` |
| 11 | Ch 11 — Judgment feels impossible | `parts/part-4-after-interpretation/chapter-11-why-judgment-feels-impossible.md` |
| 12 | Ch 12 — What cannot be repaired | `parts/part-4-after-interpretation/chapter-12-what-cannot-be-repaired.md` |
| 13 | Ch 13 — Recognize early | `parts/part-4-after-interpretation/chapter-13-recognizing-the-shift-early.md` |
| — | Appendix A | `back-matter/appendix-a-structural-map-of-cases.md` *(optional pipeline)* |
| — | Conclusion | `back-matter/conclusion-after-interpretation.md` |

**Branch naming:** `promote/when-interpretation-no-longer-matters` (parent); per unit: `books/interpretation-<unit-slug>-<agent>`.

**Status:** Update [`docs/status.md`](../status.md) when a unit finishes **01–06**; append **Part N echo gate** after **07**; **Manuscript echo gate** after **08**.

**Validate (structure stable):**

```bash
make validate-book-specs
```

---

## Cluster echo (sibling books)

When running **04**, **07**, or **08**, skim for overlap with:

- [`books/how-meaning-moves/`](../../../how-meaning-moves/) — signal/compression/restraint (communication failure lens)
- [`books/the-economy-we-dont-experience/`](../../../the-economy-we-dont-experience/) — compression + credibility (economic narrative lens)
- [`books/when-incentives-become-the-moral-language/`](../../../when-incentives-become-the-moral-language/) — metrics replacing judgment (institutional incentive lens)
- [`books/after-certainty/`](../../../after-certainty/) — practice capstone (how to live/judge after diagnosis)

This book’s distinct lens: **authority after interpretation fails**—keep the modes distinct and avoid re-teaching compression or incentives as the primary mechanism.

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
