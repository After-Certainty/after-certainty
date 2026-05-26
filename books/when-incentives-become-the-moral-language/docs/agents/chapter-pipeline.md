# Chapter pipeline — six agents, one unit

Use this doc as a **single Cursor prompt** to run agents **01 → 06** on **one unit file** in order. Replace `TARGET_UNIT` below with the path from [README.md](./README.md).

**Prerequisites:** branch from `main` or `books/when-incentives-become-the-moral-language-editorial-fold`; read [`book-rules.md`](../book-rules.md) once.

**Do not merge PRs automatically**—stop after each stage if the author requested review between passes.

---

## Prompt template

```markdown
Run the six-agent pipeline on **When Incentives Become the Moral Language** for this unit only:

**Target file:** TARGET_UNIT

**Specs (read and follow in order):**
1. books/when-incentives-become-the-moral-language/docs/agents/01-expansion-pass.md
2. books/when-incentives-become-the-moral-language/docs/agents/02-plain-speak-language.md
3. books/when-incentives-become-the-moral-language/docs/agents/03-flow-clarity-editor.md
4. books/when-incentives-become-the-moral-language/docs/agents/04-echo-pass.md
5. books/when-incentives-become-the-moral-language/docs/agents/05-citation-pass.md
6. books/when-incentives-become-the-moral-language/docs/agents/06-line-level-precision.md

**Also load:** book-rules.md, index.md, status.md, and all prior units in reading order (for echo).

**Rules:**
- One unit only; edit TARGET_UNIT in place.
- Sub-headings: descriptive `###` titles — **no numbering**; **Title Case** on `###` (agent 03).
- Agent **03** must run `python3 tools/reflow_markdown_paragraphs.py TARGET_UNIT` before other flow edits (un-wrap hard line breaks).
- Agent **02** must pass the **Feynman test** on every paragraph before flow (agent 03).
- Carry core invariant and substitution/moral-residue discipline (agents README).
- After each agent, output that agent's brief report section before continuing.
- After agent 06, update status.md for this unit (word count + passes complete).
- Do not change book.yml or portfolio docs unless I ask.

**Expansion target:** ~1,400–1,800 words for chapters (cycle one); **~600–900 words** for `parts/part-*/bridge.md`; intro/conclusion per status.md.

**Stop after agent 04** if I have only requested expansion through echo (skip 05–06).
```

---

## Example targets

| Unit | `TARGET_UNIT` |
|------|----------------|
| Introduction | `books/when-incentives-become-the-moral-language/front-matter/introduction-why-judgment-no-longer-coordinates-action.md` |
| Chapter 5 | `books/when-incentives-become-the-moral-language/parts/part-2-when-formula-speaks/chapter-5-fairness-by-formula.md` |
| Conclusion | `books/when-incentives-become-the-moral-language/back-matter/conclusion-living-inside-incentive-systems.md` |

---

## Part batch (human gate)

After the **last unit in a part** completes 01–06, add a short part note to `docs/status.md`:

- Part I: Ch 1–3 + intro handoff
- Part II: Ch 4–5
- Part III: Ch 6–7
- Part IV: Ch 8 + conclusion bridge

Do **not** run six agents on all eight chapters in one session without explicit approval.

---

## Verify after a part or full cycle

```bash
make validate-book-specs
make build-book DIR=books/when-incentives-become-the-moral-language FORMATS="docx epub pdf"
```
