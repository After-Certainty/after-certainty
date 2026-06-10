# After Certainty — agent specs

**One revision agent** for essay-discovery revision on the manuscript. Copy a spec into a Cursor agent prompt with the **target unit file** and linked docs, or use the [chapter-pipeline](./chapter-pipeline.md) template.

**Default:** run **[01](./01-essay-discovery-revision.md)** once per unit in reading order.

**House rules (agents do not override):**  
[`docs/book-rules.md`](../book-rules.md) → [`docs/drafting-process.md`](../drafting-process.md) → [`index.md`](../../index.md)

---

## Core invariant (carry on every pass)

> Understanding alone cannot settle how to live, judge, or act. What remains practicable is judgment without finality, responsibility without control, and speech that does less harm—under limits we cannot remove.

**Core mantra for this agent:** *Delay the thesis at the beginning. Preserve compression at the end.*

---

## Agent

| # | Agent | Responsibility |
|---|--------|----------------|
| **01** | [Essay discovery revision](./01-essay-discovery-revision.md) | Reorder openings for discovery; trust existing vignettes; earn abstractions; preserve ending compression; surgical pass only (~20% more discovery) |

---

## Unit order (reading order)

Work **one file per agent session** unless author requests a batch.

| # | Unit | Path |
|---|------|------|
| — | Introduction | `front-matter/introduction.md` |
| 1 | Ch 1 — The End of Correctness | `parts/part-1-letting-go/chapter-1-the-end-of-correctness.md` |
| 2 | Ch 2 — The Cost of Explanation | `parts/part-1-letting-go/chapter-2-the-cost-of-explanation.md` |
| 3 | Ch 3 — Releasing Heroes and Villains | `parts/part-1-letting-go/chapter-3-releasing-heroes-and-villains.md` |
| 4 | Ch 4 — Judgment Without Finality | `parts/part-2-what-can-still-be-practiced/chapter-4-judgment-without-finality.md` |
| 5 | Ch 5 — Responsibility Without Control | `parts/part-2-what-can-still-be-practiced/chapter-5-responsibility-without-control.md` |
| 6 | Ch 6 — Speech That Does Less Harm | `parts/part-2-what-can-still-be-practiced/chapter-6-speech-that-does-less-harm.md` |
| 7 | Ch 7 — The Discipline of Not Knowing | `parts/part-3-living-with-limits/chapter-7-the-discipline-of-not-knowing.md` |
| 8 | Ch 8 — Staying Human at Scale | `parts/part-3-living-with-limits/chapter-8-staying-human-at-scale.md` |
| 9 | Ch 9 — When to Stop Interpreting | `parts/part-3-living-with-limits/chapter-9-when-to-stop-interpreting.md` |
| — | Conclusion — Enough | `back-matter/conclusion-enough.md` |

**Out of scope for this pass:** generated title/copyright, `how-to-read-this-book.md` (unless requested), part bridges, appendix, bibliography.

**Branch naming:** `after-certainty/essay-discovery-revision`

**Status:** Update [`docs/status.md`](../status.md) when a unit finishes essay-discovery revision.

**Validate:**

```bash
make build-book DIR=books/after-certainty
```

---

## Cluster echo (sibling books)

When revising, avoid re-teaching diagnostic mechanisms from sibling volumes. This book's distinct lens: **practice capstone** — how to live and judge after diagnosis.

Skim for overlap with:

- [`books/how-meaning-moves/`](../../../how-meaning-moves/) — signal/compression/restraint
- [`books/when-interpretation-no-longer-matters/`](../../../when-interpretation-no-longer-matters/) — authority after interpretation fails
- [`books/when-incentives-become-the-moral-language/`](../../../when-incentives-become-the-moral-language/) — metrics replacing judgment

---

## Files

| # | File |
|---|------|
| **01** | `01-essay-discovery-revision.md` |
| — | `chapter-pipeline.md` |
