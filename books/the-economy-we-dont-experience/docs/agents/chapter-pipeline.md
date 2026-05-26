# Chapter pipeline — five agents, one unit

Use this doc as a **single Cursor prompt** to run agents **01 → 05** on **one unit file** in order. Replace `TARGET_UNIT` below with the path from [README.md](./README.md).

**Prerequisites:** branch from `main` or `books/the-economy-we-dont-experience-editorial-fold`; read [`book-rules.md`](../book-rules.md) once.

**Do not merge PRs automatically**—stop after each stage if the author requested review between passes.

---

## Prompt template

```markdown
Run the five-agent pipeline on **The Economy We Don't Experience** for this unit only:

**Target file:** TARGET_UNIT

**Specs (read and follow in order):**
1. books/the-economy-we-dont-experience/docs/agents/01-expansion-pass.md
2. books/the-economy-we-dont-experience/docs/agents/02-flow-clarity-editor.md
3. books/the-economy-we-dont-experience/docs/agents/03-echo-pass.md
4. books/the-economy-we-dont-experience/docs/agents/04-citation-pass.md
5. books/the-economy-we-dont-experience/docs/agents/05-line-level-precision.md

**Also load:** book-rules.md, index.md, status.md, and all prior units in reading order (for echo).

**Rules:**
- One unit only; edit TARGET_UNIT in place.
- Sub-headings: descriptive `###` titles — **no numbering**.
- Carry core invariant and two-clocks discipline (agents README).
- After each agent, output that agent's brief report section before continuing.
- After agent 05, update status.md for this unit (word count + passes complete).
- Do not change book.yml or portfolio docs unless I ask.

**Expansion target (if unit is chapter-scale):** ~2,800–3,200 words unless status.md says otherwise.

**Stop after agent 03** if I have only requested expansion + clarity + echo (skip 04–05).
```

---

## Example targets

| Unit | `TARGET_UNIT` |
|------|----------------|
| Introduction | `books/the-economy-we-dont-experience/front-matter/introduction-the-economy-we-argue-about.md` |
| Chapter 6 | `books/the-economy-we-dont-experience/parts/part-3-leadership-under-compression/chapter-6-leadership-under-interpretive-stress.md` |
| Conclusion | `books/the-economy-we-dont-experience/back-matter/conclusion-leadership-after-explanation-stops-scaling.md` |

---

## Part batch (human gate)

After the **last unit in a part** completes 01–05, add a short part note to `docs/status.md`:

- Part I: Ch 1–3 + intro handoff
- Part II: Ch 4–5
- Part III: Ch 6–7
- Part IV: Ch 8 + conclusion bridge

Do **not** run five agents on all eight chapters in one session without explicit approval.

---

## Verify after a part or full cycle

```bash
make validate-book-specs
make build-book DIR=books/the-economy-we-dont-experience FORMATS="docx epub pdf"
```
