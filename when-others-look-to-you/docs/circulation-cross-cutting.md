# Circulation cross-cutting restructure (editorial anchor)

This document records the **approved structural change** to *When Others Look to You*: **authority circulation** is no longer a standalone Part II chapter. It is **woven through** Chapters 4–6 (harm, effectiveness, legitimacy), **previewed** in Part I, and **reframed** in Part III (now Chapters 7–9) where integration prose already treated circulation as a cross-cutting pressure.

---

## Problem

A fourth Part II chapter dedicated to circulation duplicated the through-line and delayed showing how return paths interact with harm, effectiveness, and legitimacy until late in Part II.

## Intent

- **Circulation** (warnings, dissent, revision, guest leadership, imitation as **Leadership Reproduces Itself**) appears as a **recurring test** inside each Part II chapter, not a separate destination.
- **Part II** is now **three chapters**: Harm, Effectiveness, Legitimacy.
- **Part III** renumbers to **Chapters 7–9** (Scale, Tradeoffs, What Happens Next).

## Reader promise (front matter)

Circulation **shows up throughout** Part II and is **seeded in Part I** so return-path dynamics are not introduced cold in Chapter 4.

---

## Content migration (former Chapter 7 → hosts)

| Former section | Primary host |
|----------------|--------------|
| Return path opening; “without circulation” drift; circulation rich / constricted | **Chapter 4** (harm: surfacing cost, punishment, routing) and **Chapter 5** (effectiveness: insulation) as split threads |
| Three-pattern taxonomy (one-way, voice-only, shared / guest leadership); **Leadership Reproduces Itself** pattern block; guest leadership punishment paragraph | **Chapter 5** |
| Pressure test (recovery after acute narrowing) | **Chapter 5** |
| Selective followership signals; open vs covert refusal | **Chapter 6** |
| Quiet Workaround vignette + interpretation (**Learning Collapses**) | **Chapter 4** (harm / misaligned alignment) |
| Four circulation questions | **Chapter 6** |
| How circulation shapes renewal and erosion; Part III forward | **Chapter 6** (end); update “Part III” to new chapter numbers |

Footnotes `[^c7-voice]`, `[^c7-exit]`, `[^c7-guest-leadership]` migrate to the chapters where those passages land (`c4-*`, `c5-*`, or `c6-*`).

---

## Part I weave (preview)

| File | Action |
|------|--------|
| `parts/part-1-attention-and-early-formation/bridge.md` | Optional: Part II stress-tests whether signals can still change direction (plain language). |
| `chapter-1-the-weight-of-being-looked-to.md` | Brief tie: visible response to dissent/bad news trains what the group repeats. |
| `chapter-2-renewal-and-erosion.md` | Short bridge: **circulation** or “return path” so Part II echoes are recognizable. |
| `chapter-3-why-we-misjudge-leaders.md` | Sharpen: misjudgment ignores whether influence flows both ways; **update** Part II forward list (three lenses + circulation threaded). |

---

## Part III inventory (framing edits)

| File | Issue | Direction |
|------|--------|-----------|
| Part III bridge | Title “From Circulation to Scale Pressure”; opens with four Part II lenses | Retitle; **three lenses + circulation threaded** |
| Scale (new Ch. 7) | “Connection to Chapter 9” four-lens list | Match revised Tradeoffs section |
| Tradeoffs (new Ch. 8) | “Four Lenses, One Moment” — circulation as fourth parallel bullet | **Restructure** (three lenses + circulation as cross-pressure or embedded bullets) |
| What Happens Next (new Ch. 9) | Integrated view lists four Part II items | **Rewrite** to match new Part II promise |

Full prose edits live in the manuscript; this table is the checklist.

---

## Pattern language alignment

- **Canonical names:** Ten patterns, four groups — keep aligned across `docs/when-others-look-to-you-updated-patterns.md`, Appendix B, `docs/pattern-integration-guide.md`.
- **Primary chapter (Rule 7):** **Leadership Reproduces Itself** primary home moves from deleted Chapter 7 to **Chapter 5** (first full pattern block for PCWW in merged manuscript).
- **Introduction sequence (inline bold):** After renumbering, **Exceptions are Forever** eligible **after Chapter 8** (Tradeoffs). **Leadership Reproduces Itself** eligible **after Chapter 5** once its pattern block appears there.

### Post-merge audit

- Per chapter: count pattern blocks + inline anchors; enforce sparse inline; no bold before first pattern block in reading order.

---

## Renumbering reference

| Old | New |
|-----|-----|
| Part II Ch. 7 Authority Circulation | *removed* (merged into 4–6) |
| Part III Ch. 8 Scale | **Ch. 7** |
| Part III Ch. 9 Tradeoffs | **Ch. 8** |
| Part III Ch. 10 What Happens Next | **Ch. 9** |

Footnote prefixes in Part III files: `c8`→`c7`, `c9`→`c8`, `c10`→`c9` (and all `[^cN-...]` references).

---

## Downstream checklist

- [x] `index.md` — Part II three chapters; Part III 7–9; filenames
- [x] `docs/pattern-integration-guide.md` — placement tables, introduction sequence, exception note
- [x] `docs/editorial-vocabulary.md` — Part III chapter echo references
- [x] `docs/readability-scores.md` — regenerated (`scripts/readability_scores.py` ORDERED list updated)
- [x] `export-kindle.md` / flat — regenerated via `make export-kindle-epub` / flat
- [x] Front matter: preface, introduction, typographical conventions
- [x] Epilogue / Chapter 8 (Tradeoffs) cross-ref

---

## Risks (short)

- **Length:** Ch. 4–6 grow; keep circulation as **threads**, not three mini-chapters.
- **Pattern sequence:** No inline **Leadership Reproduces Itself** before its first block in Ch. 5.
- **Overlap:** One clear use of “circulation” in Ch. 2; avoid repeating full old Ch. 7 taxonomy in Part I.
