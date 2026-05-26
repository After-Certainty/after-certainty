# Chapter pipeline — six agents, one unit

Use this doc as a **single Cursor prompt** to run agents **01 → 06** on **one unit file** in order. Replace `TARGET_UNIT` below with the path from [README.md](./README.md).

**Prerequisites:** branch `books/the-discipline-of-uncertainty-editorial-fold`; read [`book-rules.md`](../book-rules.md) once.

**After a part’s last chapter finishes 01–06:** run [07-part-echo-pass.md](./07-part-echo-pass.md) on that part’s scope.

---

## Prompt template

```markdown
Run the six-agent pipeline on **The Discipline of Uncertainty** for this unit only:

**Target file:** TARGET_UNIT

**Specs (read and follow in order):**
1. books/the-discipline-of-uncertainty/docs/agents/01-expansion-pass.md
2. books/the-discipline-of-uncertainty/docs/agents/02-plain-speak-language.md
3. books/the-discipline-of-uncertainty/docs/agents/03-flow-clarity-editor.md
4. books/the-discipline-of-uncertainty/docs/agents/04-echo-pass.md
5. books/the-discipline-of-uncertainty/docs/agents/05-citation-pass.md
6. books/the-discipline-of-uncertainty/docs/agents/06-line-level-precision.md

**Also load:** book-rules.md, index.md, status.md, and all prior units in reading order (for echo).

**Rules:**
- One unit only; edit TARGET_UNIT in place.
- Sub-headings: descriptive `###` titles — **no numbering**; **Title Case** on `###` (agent 03).
- Agent **03** must run `python3 tools/reflow_markdown_paragraphs.py TARGET_UNIT` before other flow edits.
- Agent **02** must pass the **Feynman test** on every paragraph before flow (agent 03).
- Carry core invariant and three checkpoints (agents README).
- After each agent, output that agent's brief report section before continuing.
- After agent 06, update status.md for this unit (word count + passes complete).
- Do not change book.yml or portfolio docs unless I ask.

**Expansion target:** ~3,500–4,500 words for chapters; **~600–900** for `parts/part-*/bridge.md`; intro/conclusion **~2,000–2,800**.

**Stop after agent 04** if I have only requested expansion through echo (skip 05–06).
```

---

## Example targets

| Unit | `TARGET_UNIT` |
|------|----------------|
| Introduction | `books/the-discipline-of-uncertainty/front-matter/introduction-when-certainty-stops-working.md` |
| Part III bridge | `books/the-discipline-of-uncertainty/parts/part-3-probabilistic-truth-and-moral-seriousness/bridge.md` |
| Chapter 6 | `books/the-discipline-of-uncertainty/parts/part-3-probabilistic-truth-and-moral-seriousness/chapter-6-probabilistic-reasoning-is-not-moral-relativism.md` |
| Conclusion | `books/the-discipline-of-uncertainty/back-matter/conclusion-uncertainty-as-a-discipline.md` |

---

## Verify after a part or full cycle

```bash
make validate-book-specs
make build-book DIR=books/the-discipline-of-uncertainty FORMATS="docx epub pdf"
```
