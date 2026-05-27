# Chapter pipeline — six agents, one unit

Use this doc as a **single Cursor prompt** to run agents **01 → 06** on **one unit file** in order. Replace `TARGET_UNIT` below with the path from [README.md](./README.md).

**Prerequisites:** branch `promote/why-collaboration-is-so-hard`; read [`book-rules.md`](../book-rules.md) and confirm **essay band** in [`status.md`](../status.md).

**Do not merge PRs automatically**—stop after each stage if the author requested review between passes.

---

## Prompt template

```markdown
Run the six-agent pipeline on **Why Collaboration Is So Hard** for this unit only:

**Target file:** TARGET_UNIT

**Specs (read and follow in order):**
1. books/why-collaboration-is-so-hard/docs/agents/01-expansion-pass.md
2. books/why-collaboration-is-so-hard/docs/agents/02-plain-speak-language.md
3. books/why-collaboration-is-so-hard/docs/agents/03-flow-clarity-editor.md
4. books/why-collaboration-is-so-hard/docs/agents/04-echo-pass.md
5. books/why-collaboration-is-so-hard/docs/agents/05-citation-pass.md
6. books/why-collaboration-is-so-hard/docs/agents/06-line-level-precision.md

**Also load:** book-rules.md, glossary.md, index.md, status.md, and all prior units in reading order (for echo).

**Rules:**
- One unit only; edit TARGET_UNIT in place.
- Respect **essay band** in status.md (~200–500 words max from 01 unless under-drawn).
- If TARGET_UNIT is a `parts/.../bridge.md`, keep **~300–700 words** and part handoff focus.
- Sub-headings: descriptive `###` titles — **no numbering**; **Title Case** on `###` (agent 03).
- Agent 03 must run `python3 tools/reflow_markdown_paragraphs.py TARGET_UNIT` before other flow edits.
- Carry core invariant and three checkpoints (agents README)—structural diagnosis, not blame.
- Ch 14 owns affirmative "effort matters" case; conclusion owns synthesis only.
- After each agent, output that agent's brief report before continuing.
- After agent 06, update status.md for this unit (word count + passes complete).
- Do not change book.yml or portfolio docs unless I ask.

**Stop after agent 04** if I have only requested expansion through echo (skip 05–06).
```

---

## Example targets

| Unit | `TARGET_UNIT` |
|------|----------------|
| Core Reframe | `books/why-collaboration-is-so-hard/front-matter/core-reframe.md` |
| Part I bridge | `books/why-collaboration-is-so-hard/parts/part-1-contribution/bridge.md` |
| Chapter 8 | `books/why-collaboration-is-so-hard/parts/part-3-when-collaboration-collapses/chapter-8-when-clarity-becomes-control.md` |
| Conclusion | `books/why-collaboration-is-so-hard/back-matter/conclusion-why-the-effort-still-matters.md` |

---

## Part batch (human gate)

After the **last unit in a part** completes 01–06, run agent **07** on bridge + chapters in that part.

Do **not** run six agents on all fourteen chapters in one session without explicit approval.

---

## Verify after a part or full cycle

```bash
make validate-book-specs
make build-book DIR=books/why-collaboration-is-so-hard FORMATS="docx epub pdf"
```
