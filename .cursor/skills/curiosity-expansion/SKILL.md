---
name: curiosity-expansion
description: >-
  Revises After Certainty manuscript units using the Curiosity Expansion Agent—
  expands intellectual wandering between interesting questions and their answers.
  Use for curiosity expansion, intellectual wandering, question before answer,
  or After Certainty essayistic revision. Run before recognition-preservation
  on the same unit.
---

# Curiosity expansion

End-to-end workflow: **read spec → find question-and-answer choke points → expand investigation → self-check → update status → (chain to recognition-preservation)**.

**Core instruction:** Find every place where the manuscript poses a genuinely interesting question and answers it within the next 1–3 paragraphs. Expand the space between question and answer. Explore before concluding.

**Not:** add more questions everywhere. **Yes:** spend more time investigating the questions already there.

## 1 — Inputs

Ask if missing:

| Input | Values |
|-------|--------|
| **Book** | `after-certainty` (default) |
| **Target unit** | Path under `books/after-certainty/` or pick next incomplete unit from `status.md` |

`BOOK_DIR=books/after-certainty` (see [reference.md](reference.md)).

## 2 — Branch

Confirm on `after-certainty/essayistic-exploration`:

```bash
git branch --show-current
```

## 3 — Load context

Read before editing:

1. `books/after-certainty/docs/agents/02-curiosity-expansion.md`
2. `books/after-certainty/docs/book-rules.md`
3. `books/after-certainty/docs/pattern-language.md`
4. `books/after-certainty/index.md`
5. Prior unit in reading order (see reference.md table)
6. `TARGET_UNIT` in full — scan for questions answered too fast

## 4 — Revise in place

Edit `TARGET_UNIT` only. For each interesting question answered within 1–3 paragraphs:

1. Offer obvious answer — show why it feels too small
2. Turn the question over; follow implications
3. Let the writer investigate before concluding
4. Arrive at the answer/pattern the chapter was always heading toward

Target ~200–500 words per major expansion (1–3 per unit typical; hard cap ~800 net new).

**Self-check before finishing:**

- Writer appears curious—not immediately knowing
- Investigation earns the pattern
- Voice: systems thinker investigating, not literary essayist
- Ending compression lines intact (`**Pattern Name.**`)

## 5 — Report and status

Output brief report (6–10 bullets): questions expanded; what was investigated; obvious answers rejected; pattern arrival point; word delta.

Update `books/after-certainty/docs/status.md` for the unit (curiosity expansion complete).

## 6 — Chain to Agent 03

Default session continues with **recognition-preservation** on the same `TARGET_UNIT`.

## 7 — Build

```bash
make build-book DIR=books/after-certainty
```

## Reference

[reference.md](reference.md) — Ch 1 exemplar, good vs bad, success checklist
