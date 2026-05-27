# Agent 01 — Expansion pass

## ROLE

Drafting/expansion agent. Grows a **single unit** with **new prose, cases, and mechanism**—without changing the chapter’s structural claim, blending authority modes, or adding a partisan “fix politics” program.

## PURPOSE

The promoted draft is **~13.4k words** (May 2026). [`book-rules.md`](../book-rules.md) allows two futures—recorded in [`status.md`](../status.md):

| Edition | Total band | This agent’s job |
|---------|------------|------------------|
| **Essay** (~13–15k) | Hold or lightly deepen thin units | Add **beats**, not new chapters; ~200–500 words per unit only when a case or mode is under-drawn |
| **Full case-study** (~80–110k) | Long-term completion | Substantive expansion per unit over multiple cycles (~3,500–6,500 words per chapter-scale unit when author approves) |

**Check `status.md` expansion decision before a heavy pass.** Default on promotion: **essay maintenance** unless the author has chosen the full band.

## WHEN

- First agent in the pipeline for a unit that is **below target** for its role in the arc
- After expansion decision is recorded in `status.md`
- **One unit per agent session** (default)

## INPUTS

- Target unit file (see [README.md](./README.md) unit table)
- [`docs/book-rules.md`](../book-rules.md) — invariant, case template, part arc
- [`back-matter/glossary.md`](../../back-matter/glossary.md) — use terms consistently
- [`index.md`](../../index.md) — prior/next units
- Prior unit in reading order (handoff only)

## FOCUS

### What to expand (by unit type)

| Unit type | Expand toward |
|-----------|----------------|
| **Introduction / How to read** | The book’s question; what “interpretation” means here; reader posture (recognition, not rescue) |
| **Part bridges (`parts/part-*/bridge.md`)** | Part orientation + ownership + handoff; concise framing that prevents chapter duplication |
| **Part I (Ch 1–2)** | **Boundary** and **interpretive collapse**—when understanding persists privately but no longer coordinates legitimacy or repair |
| **Part II (Ch 3–6)** | **One authority mode per chapter**—alignment, identity saturation, coercion/consent + performative legitimacy, narrative enclosure; contrast each with interpretive authority |
| **Part III (Ch 7–10)** | **Case depth** using the book’s case template (see below)—distinct regime per chapter; historical or bounded contemporary detail |
| **Part IV (Ch 11–13)** | **Judgment after**—why moral clarity can rise without traction; limits of repair; early signals of the shift |
| **Conclusion** | Synthesis across modes and cases—still **no** policy checklist or “return to dialogue” bromide |
| **Appendix A** | Structural map only—tabular clarity, not duplicate case prose |

### Case-study template (Part III units)

When expanding Ch 7–10, deepen these beats (use descriptive `###` headings, not numbered ladders):

1. What replaced interpretation (which mode dominates)
2. Leader or regime focus (named where appropriate)
3. Structural mechanisms (alignment, saturation, performance, enclosure—as applicable)
4. What cannot be repaired from inside interpretation
5. Return to book invariant (one paragraph, not pasted boilerplate)

Each case must add **distinct** structural nuance—do not clone Ch 7’s skeleton with a different proper noun.

### Per-part emphasis

| Part | Do not confuse with |
|------|---------------------|
| I | Communication “compression” (How Meaning Moves) or metric substitution (Incentives) |
| II | Part III cases—theory chapters name mechanisms; case chapters **show** them |
| III | Part IV judgment chapters—cases show authority types; Ch 11–13 address lived judgment |
| IV | Part II taxonomy—assume modes are named; focus on experience and recognition |

### Length discipline

- **Essay maintenance:** prefer deepening existing examples; avoid doubling total manuscript length in one PR
- **Full-band cycle one:** ~2,500–4,000 words per chapter-scale unit is a reasonable interim target (not final 6k+ in one pass)
- **Introduction / conclusion:** ~1,200–2,000 words at full band; lighter touch at essay scale
- **Part bridges:** ~300–700 words; orientation + handoff only (no chapter-level case repeats)
- **Preface / author’s note / how to read:** expand only when prompt includes them

## DO

- Preserve glossary-aligned vocabulary (`alignment`, `identity saturation`, `performative legitimacy`, `narrative enclosure`, `interpretive collapse`, etc.)
- Add **footnotes only** for new verifiable historical or empirical claims (**05** owns citation hygiene)
- Keep **comparative, structural** voice—field notes for readers who already sense explanation failing
- End with a **bridge** to the next unit when the draft already signals one
- Update `status.md`: approximate word count + “expansion pass complete”

## DO NOT

- Add **partisan scorekeeping** or living-politics pile-ons without structural payoff
- **Blend authority modes** in one chapter (each Part II chapter owns one mode)
- Paste **generic invariant paragraphs** every section
- Reintroduce **Depth pass** scaffolding or `<!-- split -->` markers
- Expand **all units in one session** without explicit approval
- Change **book.yml**, portfolio docs, or glossary definitions in this pass

## OUTPUT

- Same unit file, expanded in place
- Brief report:
  1. **Expansion band** (essay maintenance / full-band cycle)
  2. **Word count** (approximate)
  3. **Sections deepened** (list `###` headings)
  4. **Authority mode or case angle** (one line)
  5. **Top 2 risks** for plain-speak (**02**) and echo (**04**)

## PIPELINE

**01** (this agent) → **02** → **03** → **04** → **05** → **06** per [README.md](./README.md).
