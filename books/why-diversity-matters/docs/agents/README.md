# Why Diversity Matters — agent specs

Revision agents for the published manuscript under [`books/why-diversity-matters/`](../../). Copy a spec into a Cursor agent prompt with the **target unit file** and linked docs, or use as a human checklist.

**House rules (agents do not override):**  
[`docs/book-rules.md`](../book-rules.md) → [`docs/drafting-process.md`](../drafting-process.md) → [`index.md`](../../index.md)

---

## Core invariant (carry on every pass)

> Diversity is about what gets noticed, trusted, and ignored—not just who is in the room.

---

## Agents

| # | Agent | When |
|---|--------|------|
| **01** | [Rhythm & paragraph variation](./01-rhythm-paragraph-variation.md) | After author draft intake; re-run if staccato returns from paste |

Future agents (echo, citation, line-level) may be added as the manuscript matures.

---

## Unit order (reading order)

Work **one file per run** unless explicitly batching a part.

| Unit | Path |
|------|------|
| — | `front-matter/introduction.md` |
| — | `front-matter/helping-shape-this-book.md` |
| — | `front-matter/questions-for-readers.md` (bullets exempt) |
| — | Part I bridge | `parts/part-1-when-good-intentions-miss/bridge.md` |
| 1 | Ch 1 | `parts/part-1-when-good-intentions-miss/chapter-1-…` |
| 2 | Ch 2 | `parts/part-1-when-good-intentions-miss/chapter-2-…` |
| 3 | Ch 3 | `parts/part-1-when-good-intentions-miss/chapter-3-…` |
| — | Part II bridge | `parts/part-2-what-difference-costs/bridge.md` |
| 4–7 | Ch 4–7 | `parts/part-2-what-difference-costs/chapter-*.md` |
| — | Part III bridge | `parts/part-3-what-might-help/bridge.md` |
| 8–10 | Ch 8–10 | `parts/part-3-what-might-help/chapter-*.md` |

**Branch naming:** `why-diversity-matters/rhythm-pass` or `books/why-diversity-matters-<unit-slug>-rhythm`.

**Status:** Update [`docs/status.md`](../status.md) when a unit finishes **01**.

**Validate:**

```bash
make validate-book-specs
make build-book DIR=books/why-diversity-matters
```

---

## Cluster echo (sibling books)

When adding future echo agents, skim overlap with:

- [`books/why-collaboration-is-so-hard/`](../../../why-collaboration-is-so-hard/) — coordination without full ownership
- [`books/how-meaning-moves/`](../../../how-meaning-moves/) — signal, compression, restraint
- [`books/after-certainty/`](../../../after-certainty/) — practice capstone

This book's distinct lens: **visibility, blind spots, and learning under difference**—not collaboration fragility or interpretation collapse.
