# Chapter pipeline — six agents, one unit

Use this doc as a **single Cursor prompt** to run agents **01 → 06** on **one unit file** in order. Replace `TARGET_UNIT` below with the path from [README.md](./README.md).

**Prerequisites:** branch `promote/when-interpretation-no-longer-matters` (or author fold); read [`book-rules.md`](../book-rules.md) and confirm **expansion band** in [`status.md`](../status.md) (essay maintenance vs full case-study band).

**Do not merge PRs automatically**—stop after each stage if the author requested review between passes.

---

## Prompt template

```markdown
Run the six-agent pipeline on **When Interpretation No Longer Matters** for this unit only:

**Target file:** TARGET_UNIT

**Specs (read and follow in order):**
1. books/when-interpretation-no-longer-matters/docs/agents/01-expansion-pass.md
2. books/when-interpretation-no-longer-matters/docs/agents/02-plain-speak-language.md
3. books/when-interpretation-no-longer-matters/docs/agents/03-flow-clarity-editor.md
4. books/when-interpretation-no-longer-matters/docs/agents/04-echo-pass.md
5. books/when-interpretation-no-longer-matters/docs/agents/05-citation-pass.md
6. books/when-interpretation-no-longer-matters/docs/agents/06-line-level-precision.md

**Also load:** book-rules.md, glossary.md, index.md, status.md, and all prior units in reading order (for echo).

**Rules:**
- One unit only; edit TARGET_UNIT in place.
- Respect expansion band in status.md (essay maintenance vs full-band).
- Part II: one authority mode per chapter—do not blend modes.
- Part III: use case template beats; distinct regime per chapter.
- If TARGET_UNIT is a `parts/.../bridge.md`, keep it concise (~300–700 words) and focused on part handoff/ownership, not chapter duplication.
- Sub-headings: descriptive `###` titles — no numbering; Title Case on `###` (agent 03).
- Agent 03 must run `python3 tools/reflow_markdown_paragraphs.py TARGET_UNIT` before other flow edits.
- Agent 02: Feynman test; gloss glossary terms on first use.
- Carry core invariant and three checkpoints (agents README)—recognition, not rescue.
- After each agent, output that agent's brief report before continuing.
- After agent 06, update status.md for this unit (word count + passes complete).
- Do not change book.yml or portfolio docs unless I ask.

**Expansion:** follow 01 spec for current band (essay: light deepen only unless unit is thin).

**Stop after agent 04** if I have only requested through echo (skip 05–06).
```

---

## Example targets

| Unit | `TARGET_UNIT` |
|------|----------------|
| Introduction | `books/when-interpretation-no-longer-matters/front-matter/introduction-the-question-this-book-asks.md` |
| Ch 4 — Identity saturation | `books/when-interpretation-no-longer-matters/parts/part-2-authority-without-interpretation/chapter-4-identity-saturation.md` |
| Ch 9 — Total authority | `books/when-interpretation-no-longer-matters/parts/part-3-cases-beyond-interpretation/chapter-9-total-authority-and-the-end-of-public-interpretation.md` |
| Conclusion | `books/when-interpretation-no-longer-matters/back-matter/conclusion-after-interpretation.md` |

---

## Part batch (human gate)

After the **last chapter in a part** completes 01–06, run **[07 part-echo](./07-part-echo-pass.md)** (one part per session):

| Part | Units |
|------|--------|
| I | Introduction + Part I bridge + Ch 1–2 |
| II | Part II bridge + Ch 3–6 |
| III | Part III bridge + Ch 7–10 |
| IV | Part IV bridge + Ch 11–13 |

After Part IV **07** and conclusion **01–06**, run **[08 full-manuscript echo](./08-full-manuscript-echo-pass.md)**.

Do **not** run six agents on all thirteen chapters in one session without explicit approval.

---

## Bibliography batch (agent 05, manuscript-wide)

Run **[05 citation / bibliography](./05-citation-pass.md)** once across **all footnoted units** (Ch 1–13 + conclusion), not one file at a time:

```markdown
Run agent 05 (bibliography pass) on **When Interpretation No Longer Matters** for all units:

**Scope:** Ch 1–13 + `back-matter/conclusion-after-interpretation.md` + rebuild `back-matter/bibliography.md`

**Spec:** books/when-interpretation-no-longer-matters/docs/agents/05-citation-pass.md

**Helper:** `python3 tools/normalize_interpretation_citations.py` from repo root, then manual outliers.

**Do not** run 01–04 or 06 in the same session unless I ask.
```

Schedule after **04** is stable for the scoped parts, and before **06** line-level on those units.

---

## Verify after a part or full cycle

```bash
make validate-book-specs
make build-book DIR=books/when-interpretation-no-longer-matters FORMATS="docx epub pdf"
```
