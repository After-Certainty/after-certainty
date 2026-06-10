# Chapter pipeline — essay discovery revision

Use this doc as a **single Cursor prompt** to run agent **01** on **one unit file**. Replace `TARGET_UNIT` below with the path from [README.md](./README.md).

**Prerequisites:** branch `after-certainty/essay-discovery-revision`; read [`book-rules.md`](../book-rules.md) and [`status.md`](../status.md).

**Do not merge PRs automatically**—stop after each unit if the author requested review.

---

## Prompt template

```markdown
Run the Essay Discovery Revision Agent on **After Certainty** for this unit only:

**Target file:** TARGET_UNIT

**Spec (read and follow):**
books/after-certainty/docs/agents/01-essay-discovery-revision.md

**Also load:** book-rules.md, pattern-language.md, index.md, status.md, and the prior unit in reading order.

**Rules:**
- One unit only; edit TARGET_UNIT in place.
- Core mantra: Delay the thesis at the beginning. Preserve compression at the end.
- Surgical pass only (~20% more discovery); reorder first, add second (~0–150 words).
- Move existing vignettes earlier when they carry the insight.
- Introduce abstractions through observations — do not eliminate them.
- Do not overcorrect: no literary wandering, memoir voice, or Solnit-style drift.
- Preserve bold pattern compressions at chapter endings unchanged in meaning.
- Do not run reflow_markdown_paragraphs.py unless paragraph structure is broken.
- Output brief report (5–8 bullets) including word delta and ending compression check.
- Update status.md for this unit.
- Do not change book.yml or portfolio docs unless I ask.

**Self-check before finishing:**
- Opening delayed but not literary (3–4 paragraphs, not pages)
- Ending compression lines intact
- Voice: systems thinker, not memoir or literary essayist
```

---

## Example targets

| Unit | TARGET_UNIT |
|------|-------------|
| Introduction | `books/after-certainty/front-matter/introduction.md` |
| Ch 1 | `books/after-certainty/parts/part-1-letting-go/chapter-1-the-end-of-correctness.md` |
| Ch 5 | `books/after-certainty/parts/part-2-what-can-still-be-practiced/chapter-5-responsibility-without-control.md` |
