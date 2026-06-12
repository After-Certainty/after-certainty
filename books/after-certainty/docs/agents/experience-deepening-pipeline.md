# Experience deepening pipeline — Agent 04

Use this doc as a **single Cursor prompt** to run Agent **04** on **one unit file**. Replace `TARGET_UNIT` below with the path from [README.md](./README.md).

**Prerequisites:** branch `after-certainty/manuscript-deepening-pass`; agents 02 and 03 complete on the unit; read [`book-rules.md`](../book-rules.md) and [`status.md`](../status.md).

**Stop after each unit** for author review before continuing.

---

## Prompt template

```markdown
Run the Experience Deepening Agent v2 on **After Certainty** for this unit only:

**Target file:** TARGET_UNIT

**Specs (read and follow):**
1. books/after-certainty/docs/agents/04-experience-deepening-v2.md

**Also load:** book-rules.md, pattern-language.md, index.md, status.md, and the prior unit in reading order.

**Agent 04 — Experience deepening v2:**
- One unit only; edit TARGET_UNIT in place.
- Core principle: Do not explain the pattern first. Create recognizable experience → reader forms explanation → reveal limits → chapter insight.
- Emotional engine: "I've seen that." → "I know what's happening." → "Wait—that explanation isn't quite enough."
- For every section: (1) what experience? (2) what reasonable explanation? (3) why incomplete? (4) does example reveal pattern?
- Solnit test: could reader recognize experience without formal pattern?
- Target ~150–400 words per deepening moment (1–3 per unit; hard cap ~600 net new).
- Light touch on bridges and conclusion.
- Do NOT add new theories, citations, pattern labels, or arguments.
- Do add observation, curiosity, lived texture, explanatory reversal.
- Preserve bold pattern compressions, vignette convention, chapter openings, core invariant.
- Output brief report (6–10 bullets) including experiences deepened, reversals, Solnit test, word delta.
- Update status.md (experience deepening column).
- STOP for author review before next unit.

**Ch 1 only:** Integrate author anchor exemplar (community criticism passage) after small/large scale turn per agent spec.

**Self-check before finishing:**
- Recognition before pattern naming
- Three-beat engine lands
- Solnit test passes
- Ending compression lines intact
```

---

## Example targets

| Unit | TARGET_UNIT |
|------|-------------|
| Introduction | `books/after-certainty/front-matter/introduction.md` |
| Part I bridge | `books/after-certainty/parts/part-1-letting-go/bridge.md` |
| Ch 1 | `books/after-certainty/parts/part-1-letting-go/chapter-1-the-end-of-correctness.md` |
| Ch 4 | `books/after-certainty/parts/part-2-what-can-still-be-practiced/chapter-4-judgment-without-finality.md` |
| Conclusion | `books/after-certainty/back-matter/conclusion-enough.md` |

---

## Build

After each unit or every 3 units:

```bash
make build-book DIR=books/after-certainty
```
