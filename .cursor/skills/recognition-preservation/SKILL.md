---
name: recognition-preservation
description: >-
  Guards After Certainty manuscript units after Essayistic Exploration—protects
  recognitions and pattern language, compresses over-expansion. Use for
  recognition preservation, protect pattern language, compression test, or
  After Certainty guard pass. Run after curiosity-expansion on the same unit.
---

# Recognition preservation

End-to-end workflow: **read spec → guard/compress one unit in place → self-check → update status → build**. Runs **after** curiosity-expansion on the same unit.

**Core principle:** *Exploration must deepen recognitions ("Yes, I've seen that")—never bury them.*

## 1 — Inputs

Ask if missing:

| Input | Values |
|-------|--------|
| **Book** | `after-certainty` (default) |
| **Target unit** | Same unit Agent 02 just revised |

`BOOK_DIR=books/after-certainty` (see [reference.md](reference.md)).

**Prerequisite:** Agent 02 (essayistic exploration) must be complete on `TARGET_UNIT`.

## 2 — Branch

Confirm on `after-certainty/essayistic-exploration`:

```bash
git branch --show-current
```

## 3 — Load context

Read before editing:

1. `books/after-certainty/docs/agents/03-recognition-preservation.md`
2. `books/after-certainty/docs/agents/02-curiosity-expansion.md` (what was added)
3. `books/after-certainty/docs/book-rules.md`
4. `books/after-certainty/docs/pattern-language.md`
5. `TARGET_UNIT` in full (Agent 02 output)

## 4 — Guard and compress in place

Edit `TARGET_UNIT` only. Follow agent spec:

- Ask primary questions: What recognition? Clearer than before? Pattern discovered? Chapter arrives? Pattern memorable?
- Fix failure modes: exploration without discovery, delayed arrival (too late), pattern burial, repetition, loss of compression, literary drift
- Do not cut earned investigation between question and answer
- **Compression test:** If deleting 30% of decorative new words leaves insight unchanged, cut that 30%
- Target ≤~200 words above pre-02 baseline unless recognition clearly deepened through wandering
- Restore pattern prominence if buried
- No new content — guard and compression only

**Self-check before finishing:**

- Recognition clearer and deeper than before Agent 02
- Pattern feels discovered and memorable
- No repeated questions/examples
- Kevin's voice preserved — not literary essayist
- Ending compression lines intact
- Release → Practice → Limits arc preserved

## 5 — Report and status

Output brief report (6–10 bullets): recognition clarity; pattern prominence; cuts made; compression test result; memorable pattern check; net word delta vs pre-02.

Update `books/after-certainty/docs/status.md` for the unit (recognition preservation complete).

## 6 — Build (after unit or every 3 units)

```bash
make build-book DIR=books/after-certainty
```

Fix build failures before continuing.

## 7 — Commit and PR (only when user asks)

Do not commit unless requested. When asked:

```bash
git add books/after-certainty/
git commit -m "revise(after-certainty): recognition preservation — <unit-slug>"
```

Open PR when manuscript pass is complete and user requests it.

## Do not

- Run before Agent 02 on the same unit
- Add new content — compression and guard only
- Remove or rename canonical patterns
- Delete vignette openings or callback lines
- Run `reflow_markdown_paragraphs.py` unless paragraph structure is broken
- Change `book.yml`, portfolio docs, or semantic YAML unless asked
- Commit or push without user request

## Reference

[reference.md](reference.md) — failure-mode checklist, compression test, pattern-prominence examples
