---
name: terrain-voice-diversity
description: >-
  Enriches After Certainty manuscript texture—diverse examples, metaphors,
  domains, inquiry pivots, and observational detail without changing structure
  or arguments. Use for terrain diversity, voice diversity, organizational
  gravity, vary Perhaps, or After Certainty texture pass. Run after
  experience-deepening-v2 on author-locked units.
---

# Terrain & voice diversity

End-to-end workflow: **read spec → audit unit for org gravity and repeated moves → enrich in place → self-check → update status → stop for author review**.

**Core principle:** *Preserve the insight. Vary the terrain.*

**Not a rewrite.** Structure, arguments, pattern labels, and conclusions stay intact. ±10% length per unit max.

## 1 — Inputs

Ask if missing:

| Input | Values |
|-------|--------|
| **Book** | `after-certainty` (default) |
| **Target unit** | Path under `books/after-certainty/` or pick next incomplete unit from `status.md` |

`BOOK_DIR=books/after-certainty` (see [reference.md](reference.md)).

**Prerequisite:** Agent 04 must be complete and author-locked on `TARGET_UNIT`.

## 2 — Branch

Confirm on `after-certainty/manuscript-deepening-pass`:

```bash
git branch --show-current
```

## 3 — Load context

Read before editing:

1. `books/after-certainty/docs/agents/05-terrain-voice-diversity.md`
2. `books/after-certainty/docs/book-rules.md`
3. `books/after-certainty/docs/pattern-language.md`
4. `books/after-certainty/index.md`
5. Prior units in reading order — note domains and inquiry pivots already used
6. `TARGET_UNIT` in full — scan for org gravity, repeated Perhaps/At first, repeated imagery

## 4 — Enrich in place

Edit `TARGET_UNIT` only:

1. **Domains** — add 1–2 examples from nature, family, friendship, medicine, education, art, or ordinary life; keep org examples
2. **Inquiry pivots** — vary over-used Perhaps / At first openings (see reference.md)
3. **Imagery** — vary dashboard/metric/report/file surfaces where repetitive
4. **Texture** — replace declarations with small observations where earned
5. **Length** — stay within ±10% net per unit

**Self-check:**

- Argument and pattern compressions unchanged
- Agent 04 author-locked beats preserved
- Inquiry rhythm intact, less predictable
- No culture-war or tribe signaling

## 5 — Report and status

Output brief report (6–10 bullets): domains added; pivots varied; imagery changes; word delta %; patterns intact.

Update `books/after-certainty/docs/status.md` for the unit (terrain & voice diversity complete).

## 6 — Author gate

**Stop after each unit** for author feedback before continuing.

## 7 — Build

After unit or every 3 units:

```bash
make build-book DIR=books/after-certainty
```

## Do not

- Run before Agent 04 author lock on the same unit
- Rewrite structure, conclusions, or pattern labels
- Remove organizational examples to add terrain
- Exceed ±10% length without trimming decorative additions
- Commit or push without user request

## Reference

[reference.md](reference.md) — domain list, pivot alternatives, imagery variants, success checklist
