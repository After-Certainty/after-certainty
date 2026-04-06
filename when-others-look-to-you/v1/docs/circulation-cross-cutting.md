# Circulation cross-cutting restructure (editorial anchor)

**Terminology:** The manuscript distinguishes **Correction** (warnings and dissent reaching decision-makers without punishment) and **Circulation** (influence moving through temporary or shared leadership so leadership scales). See `back-matter/glossary.md` and **Circulation and Correction** in `docs/book-rules.md`.

This document records the **approved structural change** to *When Others Look to You*: the old standalone Part II chapter (formerly framed as generic “circulation”) is removed. **Correction** and **Circulation** are **woven through** Chapters 4–6 (harm, effectiveness, legitimacy), **previewed** in Part I, and **reframed** in Part III (now Chapters 7–9) where integration prose already treated those dynamics as cross-cutting pressure.

---

## Problem

A fourth Part II chapter dedicated to circulation duplicated the through-line and delayed showing how return paths interact with harm, effectiveness, and legitimacy until late in Part II.

## Intent

- **Correction** and **Circulation** (warnings, dissent, revision, guest leadership, imitation as **Leadership Reproduces Itself**) appear as **recurring tests** inside each Part II chapter, not a separate destination.
- **Part II** is now **three chapters**: Harm, Effectiveness, Legitimacy.
- **Part III** renumbers to **Chapters 7–9** (Scale, Tradeoffs, What Happens Next).

## Reader promise (front matter)

**Correction** and **Circulation** **show up throughout** Part II and are **seeded in Part I** so return-path dynamics are not introduced cold in Chapter 4.

---

## Content migration (former Chapter 7 → hosts)

| Former section | Primary host |
|----------------|--------------|
| Return path opening; “without **Correction**” drift; **Correction** rich / constricted | **Chapter 4** (harm: surfacing cost, punishment, routing) and **Chapter 5** (effectiveness: insulation) as split threads |
| Three-pattern taxonomy (one-way, voice-only, shared / guest leadership); guest leadership punishment paragraph; inline **Leadership Reproduces Itself** (pattern block defined in **Chapter 2**) | **Chapter 5** |
| Pressure test (recovery after acute narrowing) | **Chapter 5** |
| Selective followership signals; open vs covert refusal | **Chapter 6** |
| Quiet Workaround vignette + interpretation (**Learning Collapses**) | **Chapter 4** (harm / misaligned alignment) |
| Four questions (paths for **Correction** and **Circulation**) | **Chapter 6** |
| How **Correction** and **Circulation** shape renewal and erosion; Part III forward | **Chapter 6** (end); update “Part III” to new chapter numbers |

Footnotes `[^c7-voice]`, `[^c7-exit]`, `[^c7-guest-leadership]` migrate to the chapters where those passages land (`c4-*`, `c5-*`, or `c6-*`).

---

## Part I weave (preview)

| File | Action |
|------|--------|
| `parts/part-1-attention-and-early-formation/bridge.md` | Optional: Part II stress-tests whether signals can still change direction (plain language). |
| `chapter-1-the-weight-of-being-looked-to.md` | Brief tie: visible response to dissent/bad news trains what the group repeats. |
| `chapter-2-renewal-and-erosion.md` | Short bridge: **Circulation** and **Correction** (or “return path” in plain language) so Part II echoes are recognizable. |
| `chapter-3-why-we-misjudge-leaders.md` | Sharpen: misjudgment ignores whether influence flows both ways; **update** Part II forward list (three lenses + **Correction** / **Circulation** threaded). |

---

## Part III inventory (framing edits)

| File | Issue | Direction |
|------|--------|-----------|
| Part III bridge | Title “From Circulation to Scale Pressure”; opens with four Part II lenses | Retitle; **three lenses + Correction / Circulation threaded** |
| Scale (new Ch. 7) | “Connection to Chapter 9” four-lens list | Match revised Tradeoffs section |
| Tradeoffs (new Ch. 8) | “Four Lenses, One Moment” — **Correction** as cross-pressure | **Restructure** (three lenses + **Correction** as cross-pressure or embedded bullets) |
| What Happens Next (new Ch. 9) | Integrated view lists four Part II items | **Rewrite** to match new Part II promise |

Full prose edits live in the manuscript; this table is the checklist.

---

## Pattern language alignment

- **Canonical names:** Ten patterns, four groups — keep aligned across `docs/when-others-look-to-you-updated-patterns.md`, Appendix B, `docs/pattern-integration-guide.md`.
- **Primary chapter (Rule 7):** **Leadership Reproduces Itself** Pattern Block is defined in **Chapter 2** (after the Adjusting and Eroding trios). Chapter 5 retains inline reinforcement with guest leadership.
- **Introduction sequence (inline bold):** **Exceptions are Forever** and **Leadership Reproduces Itself** are eligible **after Chapter 2** once their Pattern Blocks appear there.

### Post-merge audit

- Per chapter: count pattern blocks + inline anchors; enforce sparse inline; no bold before first pattern block in reading order.

---

## Renumbering reference

| Old | New |
|-----|-----|
| Part II Ch. 7 (old standalone “circulation” chapter) | *removed* (merged into 4–6 as **Correction** and **Circulation**) |
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
- **Pattern sequence:** No inline **Leadership Reproduces Itself** before its Pattern Block in Ch. 2 (introduction may preview titles in plain stack).
- **Overlap:** One clear use of **Circulation** and **Correction** in Ch. 2; avoid repeating full old Ch. 7 taxonomy in Part I.

---

## Maintainer note

This file is the **structural migration record** for weaving **Correction** and **Circulation** through Part II (formerly a standalone “circulation” chapter).
Ongoing terminology (for example **Correction** / **Circulation**, Pattern Block bodies,
**Learning Collapse** vs **Learning Collapses**) is governed by
`docs/book-rules.md`; if anything here ever disagrees, **book-rules wins** and
this file should be edited to match.
