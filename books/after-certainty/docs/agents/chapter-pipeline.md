# Chapter pipeline — curiosity expansion + recognition preservation

Use this doc as a **single Cursor prompt** to run agents **02 → 03** on **one unit file**. Replace `TARGET_UNIT` below with the path from [README.md](./README.md).

**Prerequisites:** branch `after-certainty/essayistic-exploration`; read [`book-rules.md`](../book-rules.md) and [`status.md`](../status.md).

**Do not merge PRs automatically**—stop after each unit if the author requested review.

---

## Prompt template

```markdown
Run the Curiosity Expansion + Recognition Preservation agents on **After Certainty** for this unit only:

**Target file:** TARGET_UNIT

**Specs (read and follow in order):**
1. books/after-certainty/docs/agents/02-curiosity-expansion.md
2. books/after-certainty/docs/agents/03-recognition-preservation.md

**Also load:** book-rules.md, pattern-language.md, index.md, status.md, and the prior unit in reading order.

**Agent 02 — Curiosity expansion:**
- One unit only; edit TARGET_UNIT in place.
- Core instruction: Find every place where the manuscript poses a genuinely interesting question and answers it within the next 1–3 paragraphs. Expand the space between question and answer. Explore before concluding.
- Do NOT add more questions everywhere—investigate the questions already there.
- Wander: obvious answer → too small → turn over → follow implications → arrive at pattern/answer.
- Target ~200–500 words per major expansion (1–3 per unit; hard cap ~800 net new).
- Preserve bold pattern compressions, vignette convention, chapter openings, core invariant.
- Output brief report (6–10 bullets) including questions expanded and word delta.
- Update status.md (curiosity expansion column).

**Agent 03 — Recognition preservation:**
- Edit same TARGET_UNIT in place (after Agent 02).
- Protect recognitions; do not cut earned investigation between question and answer.
- Cut decorative fat, duplicate domain lists, repetition—not the wandering that earns recognition.
- Compression test: if deleting 30% of decorative new words leaves insight unchanged, cut that 30%.
- Output brief report (6–10 bullets).
- Update status.md (recognition preservation column).

**Self-check before finishing:**
- Writer appears curious—investigating before concluding
- Pattern feels earned through investigation
- Recognition clearer and deeper than before
- Ending compression lines intact
```

---

## Example targets

| Unit | TARGET_UNIT |
|------|-------------|
| Ch 1 | `books/after-certainty/parts/part-1-letting-go/chapter-1-the-end-of-correctness.md` |
| Ch 4 | `books/after-certainty/parts/part-2-what-can-still-be-practiced/chapter-4-judgment-without-finality.md` |
