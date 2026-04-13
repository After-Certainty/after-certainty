# Edit: Restructure Chapters 2–4 (implemented spec)

This document describes the **structure that shipped** in manuscript v1 after splitting the former **Chapter 2 — Renewal** into definitional and pattern chapters. Use it as the honest map; `index.md` is the path source of truth.

---

## Overview

Former **Chapter 2 (Renewal)** became three chapters:

- **Chapter 2 — The Two Groups** — structural definitions, no Pattern Blocks for the ten named dynamics
- **Chapter 3 — Renewal** — one **Adjusting** pattern per section: block, vignette, framing prose
- **Chapter 4 — Erosion** — one **Eroding** pattern per section: block, vignette, framing prose

Former Chapters **3–11** renumbered to **4–12** (Circulation → 5 … What Happens Next → 12).

---

## Chapter 2 — The Two Groups

**File:** `parts/part-2-renewal-erosion-circulation/chapter-2-the-two-groups.md`

### Job

Orient the reader before the pattern chapters: direction vs. condition, two capacities, how corner combinations sort into two **groups**, then **vitality** / **decay** as felt conditions. No vignette. Intended to stay shorter than other Part II chapters.

### Structure (as in manuscript)

```
Chapter 2 — The Two Groups

  Two Directions
    [from former Ch. 2 opening; plain-speak pass applied]

  Two Capacities
    Scalability — short paragraph
    Adaptability — short paragraph

  The Vibrant Group and the Decaying Group
    One sentence naming the four grid corners (regenerative, adaptive,
    entrenched, stalled), then the split by adaptability high vs. low.
    Vibrant group = renewal-side pair (regenerative + adaptive).
    Decaying group = erosion-side pair (entrenched + stalled).
    [Diagram below]

  Vitality and Decay
    [sets up Ch. 3 and Ch. 4 without previewing pattern content]

  Pull Quote Block
```

### Diagram

- **Path:** `export-assets/diagrams/renewal-erosion-map.png`
- **Not used:** a separate `media/image2.png` asset (early draft name only).

### Design note (differs from first-draft outline)

An earlier outline expanded **four separate state subsections** (2–3 sentences each). The manuscript instead defines **vibrant group** and **decaying group** as the two adaptability-side **pairs**, keeps the four corner names in one setup sentence, and places the grid figure in this chapter.

### What moved out of old Ch. 2

- **Vitality**-colored prose and all three renewal **Pattern Blocks** live in **Chapter 3**, not here.

---

## Chapter 3 — Renewal

**File:** `parts/part-2-renewal-erosion-circulation/chapter-3-renewal.md`

### Job

Treat each **Adjusting** pattern in order; cumulative read; close with the three operating together.

### Patterns and order

1. **Dissent is Welcomed**
2. **Feedback Drives Change**
3. **Leaders Feel the Consequences**

### Structure per pattern (as implemented)

For each pattern: framing prose → `::: Pattern Block` → `###` vignette title → `::: Vignette Block` → short prose tying scene to pattern. After the third pattern: **Correction, Circulation, and What Holds Together** (correction/circulation definitions), then **When Vitality Holds**, then pull quote.

### Opening

- Section title **What Vitality Opens** (from former **What Vitality Looks Like**, rewritten).

### Vignettes

| Pattern | Vignette title | Notes |
|--------|----------------|--------|
| Dissent is Welcomed | **A Correction in Public** | Existing engineer / reply-all scene |
| Feedback Drives Change | **The Budget Line That Moved** | New; nonprofit committee / budget reallocation |
| Leaders Feel the Consequences | **The Variance on the Ledger** | New; family business / supplier revert |

### Pull quote

- Substantive line in plain speak (see manuscript; mechanical check: no `**` inside the Pull Quote Block).

---

## Chapter 4 — Erosion

**File:** `parts/part-2-renewal-erosion-circulation/chapter-4-erosion.md`

### Job

Mirror Chapter 3: decay opening from former Ch. 3, three **Eroding** patterns, then closing **When Decay Deepens** (stacking).

### Patterns and order

1. **Disagreement is Suppressed**
2. **Learning Collapses**
3. **Exceptions are Forever**

### Vignettes

| Pattern | Vignette title | Notes |
|--------|----------------|--------|
| Disagreement is Suppressed | **The Question That Was Not Asked** | New; regional association / meeting |
| Learning Collapses | **The Field Trip Form** | New; school district workflow (not the hospital harm scene) |
| Exceptions are Forever | **The Vote After the Flood** | Existing mutual aid / flood |

### Cross-reference for Learning Collapses

- A hospital-style harm illustration may appear in **Chapter 6 — Harm** (formerly Ch. 5). The **Field Trip Form** scene is scoped to the **information gap**, not duplicated harm vignettes in **Chapters 6–8**.

---

## Part II bridge

**File:** `parts/part-2-renewal-erosion-circulation/bridge-from-formation-to-movement.md`

- Names **renewal**, **erosion**, **circulation** as the three movements.
- Does **not** embed the four-state grid or diagram; points forward to **Chapter 2** for capacities, **vibrant/decaying** framing, and the structural grid.

*(Part I’s **Bridge — From Attention to Pattern** is separate: formation-only; it never carried the grid.)*

---

## Downstream chapter renumbering (applied)

| Before restructure | After |
|--------------------|--------|
| Ch. 2 Renewal | → Ch. 2 Two Groups + Ch. 3 Renewal + Ch. 4 Erosion |
| Ch. 3 Erosion | absorbed into Ch. 4 |
| Ch. 4 Circulation | **Ch. 5** |
| Ch. 5 Harm | **Ch. 6** |
| Ch. 6 Effectiveness | **Ch. 7** |
| Ch. 7 Legitimacy | **Ch. 8** |
| Ch. 8 Scale | **Ch. 9** |
| Ch. 9 Tradeoffs | **Ch. 10** |
| Ch. 10 Misjudgment | **Ch. 11** |
| Ch. 11 What Happens Next | **Ch. 12** |

- **Appendix B** — pattern groupings unchanged (by name, not chapter number).
- **Footnote IDs** — in-source anchors use chapter-scoped prefixes `[^cN-…]` with **N** matching the chapter file (e.g. Ch. 5 circulation → `c5-`). See `docs/citation-audit.md` for bibliography ↔ chapter examples.

---

## Editorial follow-ups (optional)

- Further trim **Two Directions** if length goals shift.
- Optional: add a very short functional scene to Ch. 2 only if orientation still feels thin (see original “optional vignette” note).
