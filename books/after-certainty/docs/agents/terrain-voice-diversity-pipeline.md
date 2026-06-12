# Terrain & voice diversity pipeline — Agent 05

Use this doc as a **single Cursor prompt** to run Agent **05** on **one unit file**. Replace `TARGET_UNIT` below with the path from [README.md](./README.md).

**Prerequisites:** branch `after-certainty/manuscript-deepening-pass`; Agent 04 complete and author-locked on the unit; read [`book-rules.md`](../book-rules.md) and [`status.md`](../status.md).

**Stop after each unit** for author review before continuing.

---

## Prompt template

```markdown
Run the Terrain & Voice Diversity Agent on **After Certainty** for this unit only:

**Target file:** TARGET_UNIT

**Specs (read and follow):**
1. books/after-certainty/docs/agents/05-terrain-voice-diversity.md

**Also load:** book-rules.md, pattern-language.md, index.md, status.md, and the prior unit in reading order (track domains already used).

**Agent 05 — Terrain & voice diversity:**
- One unit only; edit TARGET_UNIT in place.
- Do NOT rewrite structure, arguments, conclusions, pattern labels, or footnotes.
- Enrich texture: ±10% length max per unit.
- Add 1–2 examples from non-organizational domains (nature, family, friendship, medicine, education, art, ordinary life)—do NOT remove existing org examples.
- Vary inquiry pivots ("Perhaps.", "At first the answer seems obvious") where over-reliant—keep inquiry rhythm.
- Vary recurring imagery (dashboard, metric, report, file) where repetitive.
- Favor small observations over declarations.
- Preserve author-locked Agent 04 beats and bold pattern compressions.
- Output brief report (6–10 bullets) including domains added, pivots varied, word delta %.
- Update status.md (terrain & voice diversity column).
- STOP for author review before next unit.

**Self-check before finishing:**
- Wider terrain without changed argument
- Inquiry style preserved but less predictable
- Pattern language intact
- Net length within ±10%
```

---

## Example targets

| Unit | TARGET_UNIT |
|------|-------------|
| Introduction | `books/after-certainty/front-matter/introduction.md` |
| Ch 2 | `books/after-certainty/parts/part-1-letting-go/chapter-2-the-cost-of-explanation.md` |
| Ch 8 | `books/after-certainty/parts/part-3-living-with-limits/chapter-8-staying-human-at-scale.md` |
| Conclusion | `books/after-certainty/back-matter/conclusion-enough.md` |

---

## Build

After each unit or every 3 units:

```bash
make build-book DIR=books/after-certainty
```
