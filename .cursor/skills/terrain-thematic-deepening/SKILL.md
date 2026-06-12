---
name: terrain-thematic-deepening
description: >-
  Places After Certainty arguments in theme-native terrain—caregiving, ecology,
  geology, navigation, community, craft—discovering patterns rather than
  decorating with metaphors. Use for Agent 06, terrain thematic deepening, theme
  terrain map, or after terrain-voice-diversity. Run sequentially in reading
  order; one unit per session.
---

# Terrain thematic deepening

Workflow: **read spec + chapter map → audit unit → deepen/replace/keep per map → Solnit test → update status → stop for author review**.

**Core principle:** *Discover the pattern in the terrain. Do not decorate the argument with it.*

**Not a rewrite.** ±5% length per unit; swap ornamental beats before adding.

## 1 — Inputs

| Input | Values |
|-------|--------|
| **Book** | `after-certainty` (default) |
| **Target unit** | Next incomplete unit from `status.md` terrain thematic column, in reading order |

**Prerequisite:** Agent 05 complete on `TARGET_UNIT`.

## 2 — Branch

`after-certainty/manuscript-deepening-pass`

## 3 — Load context

1. `books/after-certainty/docs/agents/06-terrain-thematic-deepening.md` — **chapter map**
2. `books/after-certainty/docs/book-rules.md`
3. `books/after-certainty/docs/pattern-language.md`
4. Prior units — track terrain families (geology/navigation max 2–3 each)
5. `TARGET_UNIT` in full

## 4 — Edit per chapter map

| Map says | Do |
|----------|-----|
| **Deepen** | Expand existing theme-native beat |
| **Replace** | Swap ornamental Agent 05 beat |
| **Keep** | No terrain changes (voice ok if broken) |
| **Do not touch** | Skip unit; mark complete with note |

**Solnit test:** Does the terrain feel discovered, not applied?

## 5 — Report and status

6–10 bullets: terrain family; actions taken; beats replaced; word delta %; anchors intact.

Update `status.md` — terrain thematic deepening column.

## 6 — Author gate

Stop after each unit.

## 7 — Build

```bash
make build-book DIR=books/after-certainty
```

## Do not

- Run before Agent 05 on same unit
- Touch Ch 5 (do not touch) or other locked anchors
- Add more than one primary terrain family per chapter
- Exceed ±5% length without trimming
- Commit or push without user request

## Reference

[reference.md](reference.md)
