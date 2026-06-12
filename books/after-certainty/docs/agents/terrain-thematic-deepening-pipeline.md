# Terrain thematic deepening pipeline — Agent 06

Use as a **single Cursor prompt** for **one unit** in reading order. Replace `TARGET_UNIT` below.

**Prerequisites:** branch `after-certainty/manuscript-deepening-pass`; Agent 05 complete on the unit; read [`book-rules.md`](../book-rules.md), [`status.md`](../status.md), chapter map in spec.

**Stop after each unit** for author review.

---

## Prompt template

```markdown
Run the Terrain Thematic Deepening Agent on **After Certainty** for this unit only:

**Target file:** TARGET_UNIT

**Specs (read and follow):**
1. books/after-certainty/docs/agents/06-terrain-thematic-deepening.md

**Also load:** book-rules.md, pattern-language.md, index.md, status.md, prior unit in reading order.

**Agent 06 — Terrain thematic deepening:**
- One unit only; edit TARGET_UNIT in place.
- Follow the chapter map for this unit (deepen / replace / keep / do not touch).
- Discover the pattern in terrain—do not decorate with metaphors.
- Replace ornamental Agent 05 beats before adding new terrain.
- ±5% length max; swap, do not accumulate.
- Preserve author-locked anchors and all pattern labels, arguments, footnotes.
- Output brief report (6–10 bullets) and update status.md.
- Stop for author review.
```

---

## Reading order

1. `front-matter/introduction.md`
2. `parts/part-1-letting-go/bridge.md`
3. `parts/part-1-letting-go/chapter-1-the-end-of-correctness.md`
4. `parts/part-1-letting-go/chapter-2-the-cost-of-explanation.md`
5. `parts/part-1-letting-go/chapter-3-releasing-heroes-and-villains.md`
6. `parts/part-2-what-can-still-be-practiced/bridge.md`
7. `parts/part-2-what-can-still-be-practiced/chapter-4-judgment-without-finality.md`
8. `parts/part-2-what-can-still-be-practiced/chapter-5-responsibility-without-control.md` — **do not touch**
9. `parts/part-2-what-can-still-be-practiced/chapter-6-speech-that-does-less-harm.md`
10. `parts/part-3-living-with-limits/bridge.md`
11. `parts/part-3-living-with-limits/chapter-7-the-discipline-of-not-knowing.md`
12. `parts/part-3-living-with-limits/chapter-8-staying-human-at-scale.md`
13. `parts/part-3-living-with-limits/chapter-9-when-to-stop-interpreting.md` — **keep**
14. `back-matter/conclusion-enough.md`
