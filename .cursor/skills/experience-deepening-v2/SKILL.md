---
name: experience-deepening-v2
description: >-
  Revises After Certainty manuscript units using the Experience Deepening Agent
  v2—transforms abstract argument into lived recognition before patterns land.
  Use for experience deepening, lived recognition, explanatory reversal,
  Solnit test, or After Certainty pre-pattern deepening. Run after
  curiosity-expansion and recognition-preservation on the same unit.
---

# Experience deepening v2

End-to-end workflow: **read spec → find abstraction-before-experience choke points → deepen in place → self-check → update status → stop for author review**.

**Core principle:** Do not explain the pattern first. Create recognizable experience → reader forms explanation → reveal limits → chapter insight.

**Emotional engine:** "I've seen that." → "I know what's happening." → "Wait—that explanation isn't quite enough."

## 1 — Inputs

Ask if missing:

| Input | Values |
|-------|--------|
| **Book** | `after-certainty` (default) |
| **Target unit** | Path under `books/after-certainty/` or pick next incomplete unit from `status.md` |

`BOOK_DIR=books/after-certainty` (see [reference.md](reference.md)).

**Prerequisite:** Agents 02 and 03 must be complete on `TARGET_UNIT`.

## 2 — Branch

Confirm on `after-certainty/manuscript-deepening-pass`:

```bash
git branch --show-current
```

## 3 — Load context

Read before editing:

1. `books/after-certainty/docs/agents/04-experience-deepening-v2.md`
2. `books/after-certainty/docs/book-rules.md`
3. `books/after-certainty/docs/pattern-language.md`
4. `books/after-certainty/index.md`
5. Prior unit in reading order (see reference.md table)
6. `TARGET_UNIT` in full — scan for abstraction before lived recognition

## 4 — Revise in place

Edit `TARGET_UNIT` only. For each choke point where pattern/explanation leads:

1. **Experience** — can reader picture it? remember their own version?
2. **Reasonable explanation** — let reader form it; let it breathe
3. **Incomplete explanation** — not wrong; show limits (identity beneath correctness, belonging beneath principle, etc.)
4. **Pattern/insight** — chapter arrives after experience carries philosophy

Target ~150–400 words per deepening moment (1–3 per unit; hard cap ~600 net new). Light touch on bridges and conclusion.

**Self-check before finishing:**

- Three-beat engine lands in revised sections
- Solnit test passes (recognition without pattern label)
- No new theories, citations, patterns, or arguments added
- Voice: Kevin's systems-thinker clarity, not literary essayist
- Ending compression lines intact (`**Pattern Name.**`)

## 5 — Report and status

Output brief report (6–10 bullets): experiences deepened; explanations reversed; Solnit test; three-beat check; word delta.

Update `books/after-certainty/docs/status.md` for the unit (experience deepening complete).

## 6 — Author gate

**Stop after each unit** for author feedback before continuing to the next unit.

## 7 — Build

After unit or every 3 units:

```bash
make build-book DIR=books/after-certainty
```

## Do not

- Run before Agents 02 and 03 on the same unit
- Add new theories, citations, pattern labels, or arguments
- Chain to another agent—standalone pass with author review
- Commit or push without user request

## Reference

[reference.md](reference.md) — exemplars, Ch 1 anchor, unit table, choke points, success checklist
