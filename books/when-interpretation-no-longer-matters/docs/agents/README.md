# When Interpretation No Longer Matters — agent specs

**Eight revision agents** (numbered **01–08**) for chapter-by-chapter and manuscript-gate work. Copy a spec into a Cursor agent prompt with the **target unit file** and linked docs, or use as a human checklist.

**Default order (one unit at a time):** **[01](./01-expansion-pass.md)** → **[02](./02-plain-speak-language.md)** → **[03](./03-flow-clarity-editor.md)** → **[04](./04-echo-pass.md)** → **[05](./05-citation-pass.md)** → **[06](./06-line-level-precision.md)**. After **all units in a part** finish 01–06, run **[07 part-echo](./07-part-echo-pass.md)**. After all parts + conclusion, run **[08 full-manuscript echo](./08-full-manuscript-echo-pass.md)**.

For a **single prompt** that walks 01–06 in order, see **[chapter-pipeline](./chapter-pipeline.md)**.

**House rules (agents do not override):**  
[`docs/book-rules.md`](../book-rules.md) → [`docs/drafting-process.md`](../drafting-process.md) → [`index.md`](../../index.md)

---

## Core invariant (carry on every pass)

> Interpretation can lose its public or institutional function while understanding persists. Authority does not disappear—its basis shifts. Coordination moves from shared understanding toward alignment/sorting, identity saturation, performative legitimacy under coercion, narrative enclosure, transitional drift, anti-repair, and judgment as witness.

**Three checkpoints:** (1) **interpretation_boundary**—name what no longer coordinates without moralizing the reader; (2) **mechanism_ownership**—keep one primary mechanism per retained case; (3) **judgment_after**—recognition and sharpened perception, not a rescue program.

**Chapter form:** ordinary scene → tension → widen → case → pattern compression → return. Do not restore the retired report headings.

---

## Unit order (reading order)

| # | Unit | Path |
|---|------|------|
| — | Introduction | `front-matter/introduction-the-question-this-book-asks.md` |
| 1 | Ch 1 — Door / Smith | `parts/part-1-where-interpretation-ends/chapter-1-the-door-that-opens-only-inward.md` |
| 2 | Ch 2 — Everyone Already Knows | `parts/part-1-where-interpretation-ends/chapter-2-everyone-already-knows.md` |
| 3 | Ch 3 — Argument That Sorts | `parts/part-2-what-replaces-interpretation/chapter-3-the-argument-that-sorts-the-room.md` |
| 4 | Ch 4 — Name That Survives | `parts/part-2-what-replaces-interpretation/chapter-4-the-name-that-survives-every-platform.md` |
| 5 | Ch 5 — Applause | `parts/part-2-what-replaces-interpretation/chapter-5-the-applause-no-one-wants-to-end.md` |
| 6 | Ch 6 — Story That Explains | `parts/part-2-what-replaces-interpretation/chapter-6-the-story-that-explains-every-objection.md` |
| 7 | Ch 7 — Question Becomes Disloyalty | `parts/part-3-when-correction-cannot-reach/chapter-7-the-question-that-becomes-disloyalty.md` |
| 8 | Ch 8 — Criticism Cannot Correct | `parts/part-3-when-correction-cannot-reach/chapter-8-the-criticism-that-cannot-correct.md` |
| 9 | Ch 9 — What Judgment Can Still Do | `parts/part-3-when-correction-cannot-reach/chapter-9-what-judgment-can-still-do.md` |
| — | Conclusion | `back-matter/conclusion-after-interpretation.md` |

**Status:** Update [`docs/status.md`](../status.md) when units or gates change.

**Validate (structure stable):**

```bash
make validate-book-specs
```

---

## Cluster echo (sibling books)

When running **04**, **07**, or **08**, skim for overlap with cluster siblings listed in [`index.md`](../../index.md). Do not re-teach incentives/metrics or compression as this book’s primary lens.
