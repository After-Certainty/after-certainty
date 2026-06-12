# Terrain & variety pipeline — Agent 08

Use as a **single Cursor prompt** for Agent **08** on **one unit file**. Replace `TARGET_UNIT` with the path from [README.md](./README.md).

**Prerequisites:** branch `after-certainty/manuscript-deepening-pass`; Agents 04–07 complete; author read-through feedback incorporated.

**Run order:** Ch 7 → Ch 8 → Ch 9 (author stop) → remaining units in reading order.

---

## Prompt template

```markdown
Run the Terrain & Variety Agent on **After Certainty** for this unit only:

**Target file:** TARGET_UNIT

**Specs (read and follow):**
1. books/after-certainty/docs/agents/08-terrain-variety.md

**Also load:** book-rules.md, pattern-language.md, index.md, status.md.

**Agent 08 — Terrain & variety (polish only):**
- One unit only; edit TARGET_UNIT in place.
- Do NOT restructure, re-argue, add vignettes, patterns, or footnotes.
- ±2–3% length max.
- Add one passing natural-world observation (weather, geology, forestry, gardening, navigation)—not a new case.
- Vary 2–3 over-used rhetorical pivots (Perhaps, conclusion seems obvious, story is incomplete, etc.)—jazz variation, not elimination.
- Part III: re-ground abstractions with sensory beats at section openings where needed.
- Preserve all author-locked anchors.
- Output brief report (5–8 bullets) and update status.md (terrain & variety column).
- STOP after Ch 9 if this is Part III batch.

**Self-check:**
- Polish pass only—no developmental rewrite
- Top-tier units (intro, Ch 1–2, Ch 5, conclusion) get minimal touch unless explicitly targeted
- Pattern language and arguments intact
```

---

## Example targets (priority first)

| Unit | TARGET_UNIT |
|------|-------------|
| Ch 7 | `books/after-certainty/parts/part-3-living-with-limits/chapter-7-the-discipline-of-not-knowing.md` |
| Ch 8 | `books/after-certainty/parts/part-3-living-with-limits/chapter-8-staying-human-at-scale.md` |
| Ch 9 | `books/after-certainty/parts/part-3-living-with-limits/chapter-9-when-to-stop-interpreting.md` |
