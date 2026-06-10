---
name: essay-discovery-revision
description: >-
  Revises After Certainty manuscript units so arguments feel discovered rather
  than announced. Surfaces lived tension before naming patterns; delays thesis at
  openings, preserves compression at endings, surgical pass only. Use for essay
  discovery revision, delay the thesis, discovered not announced, or After
  Certainty prose revision.
---

# Essay discovery revision

End-to-end workflow: **read spec → revise one unit in place → self-check → update status → build**. Surgical pass only (~20% more discovery).

**Core mantra:** *Delay the thesis at the beginning. Preserve compression at the end.*

**Refined goal:** Move lived tensions closer to the surface—curiosity over agreement. Not Solnit voice; Kevin's systems-thinker clarity with human entry points first.

## 1 — Inputs

Ask if missing:

| Input | Values |
|-------|--------|
| **Book** | `after-certainty` (default) |
| **Target unit** | Path under `books/after-certainty/` or pick next incomplete unit from `status.md` |

`BOOK_DIR=books/after-certainty` (see [reference.md](reference.md)).

## 2 — Branch

Confirm on `after-certainty/essay-discovery-revision`:

```bash
git branch --show-current
```

If not on the branch:

```bash
git checkout after-certainty/essay-discovery-revision
```

Create from `main` only if the branch does not exist:

```bash
git checkout main && git pull
git checkout -b after-certainty/essay-discovery-revision
```

## 3 — Load context

Read before editing:

1. `books/after-certainty/docs/agents/01-essay-discovery-revision.md`
2. `books/after-certainty/docs/book-rules.md`
3. `books/after-certainty/docs/pattern-language.md`
4. `books/after-certainty/index.md`
5. Prior unit in reading order (see reference.md table)
6. `TARGET_UNIT` in full

## 4 — Revise in place

Edit `TARGET_UNIT` only. Follow agent spec:

- Reorder first, add second (~0–150 words; hard cap ~300)
- Move existing vignettes earlier when they carry the insight
- Introduce abstractions through observations — do not eliminate them
- Preserve bold pattern compressions at chapter endings
- Do not overcorrect (no literary wandering, memoir voice, Solnit drift)

**Self-check before finishing:**

- Opening delayed but not literary (3–4 paragraphs, not pages)
- Ending compression lines intact (`**Pattern Name.**`)
- Word delta reasonable
- Voice: systems thinker, not memoir or literary essayist

## 5 — Report and status

Output brief report (5–8 bullets): what moved earlier; thesis delayed; vignettes repositioned; abstractions earned; ending compression preserved; invariant preserved; approximate word delta.

Update `books/after-certainty/docs/status.md` for the unit (essay discovery complete).

## 6 — Build (after unit or every 3 units)

```bash
make build-book DIR=books/after-certainty
```

Fix build failures before continuing.

## 7 — Commit and PR (only when user asks)

Do not commit unless requested. When asked:

```bash
git add books/after-certainty/
git commit -m "revise(after-certainty): essay discovery — <unit-slug>"
```

Open PR when manuscript pass is complete and user requests it.

## Do not

- Edit multiple units in one pass unless user explicitly requests batch scope
- Overcorrect — target ~20% more discovery, not a rewrite
- Remove or soften chapter-ending compression lines
- Run `reflow_markdown_paragraphs.py` unless paragraph structure is broken
- Change `book.yml`, portfolio docs, or semantic YAML unless asked
- Commit or push without user request

## Reference

[reference.md](reference.md) — unit table, good vs bad overcorrection examples, success checklist
