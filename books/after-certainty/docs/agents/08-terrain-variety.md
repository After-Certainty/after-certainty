# Agent 08 — Terrain & variety (polish)

## ROLE

Terrain & Variety Agent.

## PURPOSE

Late **polish pass** after Agents 04–07 and author read-through. The book has crossed from pattern essays to coherent philosophical manuscript. This pass does **not** restructure, re-argue, or rewrite chapters.

**Core principle:** *Jazz variation, not elimination. Discover in terrain, do not decorate.*

**Edit lens (silent):** Each chapter shows a useful moral tool asked to carry a burden it cannot carry. Make the mismatch **felt** in scene before pattern language names it—do not add a new thesis about "overburdened tools."

## WHEN

- After author read-through gate feedback (Jun 2026)
- On branch `after-certainty/manuscript-deepening-pass`
- **Priority order:** Ch 7 → Ch 8 → Ch 9 → remaining reading-order units
- **Stop for author review** after Part III (Ch 7–9) before rest of book

## INPUTS

- **Target unit file** (see [README.md](./README.md))
- Author read-through notes (terrain monotony, rhetorical signatures, Ch 7–9 abstraction drift)
- [`docs/book-rules.md`](../book-rules.md)
- [`docs/pattern-language.md`](../pattern-language.md)
- [`index.md`](../../index.md)
- [`docs/status.md`](../status.md)

## PREREQUISITE

Agents 04–07 complete. Author-locked anchors intact. No new vignettes, patterns, footnotes, or arguments.

## FOCUS

### What this pass changes

| Action | How |
|--------|-----|
| **Passing terrain** | One short natural-world observation per chapter (weather, geology, forestry, gardening, navigation)—**not** a new case or vignette |
| **Rhetorical variation** | Rotate over-used pivots: "Perhaps.", "The conclusion seems obvious", "The story is incomplete", "But that explanation felt too small", "The natural conclusion is", "But that answer does not explain" |
| **De-abstraction** | Part III priority: ground section openings in room, body, timing before pattern labels |
| **Motif audit** | Vary surface form of dashboard/report/meeting/file where not intentional echo |
| **Rhythm** | One contrast beat per long diagnostic stretch (shorter line, sensory detail, cold stop) |

### Passing terrain families (author priority)

| Family | Use for |
|--------|---------|
| **Weather** | Pressure, fog, storm—observe, prepare; cannot negotiate |
| **Geology** | Slow forces, fault lines, sediment, erosion |
| **Forestry** | Visible/invisible process, canopy, understory |
| **Gardening** | Practice chapters—season, pruning, transplant shock |
| **Navigation** | Orientation, bearing, drift, dead reckoning |

**Rule:** One primary passing beat per unit. Do not accumulate geology/navigation beyond Agent 06 limits.

### Rhetorical variation table

| Over-used | Rotate to (examples) |
|-----------|----------------------|
| Perhaps. | Maybe. / Not entirely. / Or— / Something else may be happening. |
| The conclusion seems obvious | At first it looked like… / The simplest account is… / Most people would call that… |
| The story is incomplete. | That account leaves something out. / Something else is also true. |
| But that explanation felt too small | That answer does not carry the weight / The explanation is not wrong—but it is not enough |
| But that answer does not explain | That account leaves out… / The surface explanation is sound—but… |
| The natural conclusion is | It is tempting to conclude… / Most people would assume… |

**Rule:** 2–3 variations per unit max. Keep the **move** (doubt, pivot, incompleteness). Change the **surface**.

### What this pass does NOT change

- Chapter structure, section order, pattern labels, core arguments, conclusions
- Footnotes and bibliography
- Author-locked anchors (see below)
- Net length beyond **±2–3% per unit**

### Avoid

- New vignettes or major examples
- Explicit grief theme (already present—do not over-write)
- Removing inquiry rhythm entirely
- Literary synonym elevation
- Another organizational case study

---

## Priority units (author read-through)

| Unit | Why |
|------|-----|
| **Ch 7** | Abstraction drift; vary Perhaps cluster; deepen navigation/weather |
| **Ch 8** | Duplicate "But that answer does not explain"; geology already present—add forestry or weather beat |
| **Ch 9** | Family pattern + "story is incomplete"; re-ground Ethical Threshold surroundings |
| **Ch 3–4–6** | Slightly more "After Certainty-ish"—rhetorical variation |
| **Intro, Ch 1–2, Ch 5, Conclusion** | Top tier—minimal touch only |

---

## Author-locked anchors (do not touch)

Same as Agent 06, plus:

| Unit | Anchor |
|------|--------|
| Introduction | Phenomenon-first; absolution thesis; dinner/caregiving beat; lines 29–35 discovery pivot |
| Ch 5 | Entire chapter — do not touch |
| Ch 7 | Third conversation opening; dead reckoning line |
| Ch 8 | "read sideways when the dashboard turned green"; kitchen/case-number |
| Ch 9 | Fifth-meeting threshold; Ethical Threshold section |
| Conclusion | "What remains is not a replacement certainty. It is orientation."; Kind of Life; image return |

---

## OUTPUT

- Edit **TARGET_UNIT in place** only
- Brief report (5–8 bullets): terrain beat added; pivots varied; abstraction re-grounded; word delta %; anchors intact
- Update [`docs/status.md`](../status.md) — terrain & variety column
- Stop for author review after Part III batch

## BUILD

```bash
make export-docx DIR=books/after-certainty
```

## DIFFERENTIATION

| Agent | Job |
|-------|-----|
| **05** | Voice diversity, inquiry pivots, ±10% texture |
| **06** | Theme-native terrain per chapter map |
| **07** | Echo ownership, cross-unit dedupe |
| **08** | Late polish: passing terrain, rhetorical jazz, Ch 7–9 de-abstraction, ±3% |
