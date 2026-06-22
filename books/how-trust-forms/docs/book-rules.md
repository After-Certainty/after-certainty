# How Trust Forms — Book Rules

## Purpose

Architectural constraints for **How Trust Forms** (*Why Participation Becomes Possible*).

## Book Scope and Structure

### Target length

- Essay edition (~10–15k words), matching cluster books (Why Collaboration, Why Diversity)
- Structure per `index.md`: 3 parts, 3 part openers, 9 chapters, introduction, conclusion, appendix, bibliography

### Markdown file structure

- One markdown file per chapter (and one part opener per part, in `bridge.md`).
- Filenames must match the chapter slug in `index.md`.
- `index.md` is the hub; all units must be linked from it.

## Core invariant (non-negotiable)

> Trust forms when repeated experience—beliefs made visible through action, outcomes that teach, participation that updates belief—makes cooperation predictable enough to stake something on one another.

Every chapter must map back to this claim. If a section cannot be tied to it, it does not belong.

## Thematic arc by part

**Part I — The Architecture of Trust:** The first leap, visible beliefs, outcomes as evidence.

**Part II — The Trust Cycle:** Participation enabled, beliefs updated, trust at scale.

**Part III — What Trust Makes Possible:** Leadership, meaning, why trust matters.

## Chapter construction

Each chapter follows the six-beat scaffold (concrete → concept → practice):

1. **Anchor Story** — opening scene or case
2. **Why It Forms** — structural explanation
3. **Where It Drifts** — failure mode or tension
4. **What Remains** — what survives diagnosis
5. **Pattern Statement** — named pattern (locked in `docs/pattern-language.md`); use the heading **Core Principle** in draft prose
6. **Closing Return** — return to chapter anchor; heading should name the scene (e.g. "Back to the Porch"), not repeat outline labels

**Section headings:** Derive from the unit's content—not from the six-beat outline labels ("Why It Forms," "Where It Drifts," "What Remains," etc.). Only **Core Principle** repeats across chapters.

## Tone and positioning

### Shared house style

- Diagnostic, not prescriptive.
- Observational, not preachy.
- Clear, not academic.
- Serious, not dramatic.
- Calm, deliberate, grounded.

### This book must not be

- A psychology textbook on trust
- Prescriptive "how to build trust" management advice
- Moral lecture on cynicism vs naïveté

### This book must be

- Descriptive and explanatory (WOLTY-adjacent tone)
- Grounded in observable cooperation before naming mechanisms
- Connected to the trust cycle: Beliefs → Actions → Outcomes → Trust → Participation → Beliefs

### Paragraph rhythm

- Default 2–4 sentences per paragraph when the thought is continuous.
- Reserve single-sentence paragraphs for emphasis (roughly one per major beat), not as the default beat.
- Avoid more than three consecutive one-sentence paragraphs unless listing or deliberate acceleration.

### Chapter numbering

- Do not use chapter numbers in manuscript prose, unit headings, or `index.md` link text—title only.
- Do not cross-reference other units by number (e.g. "Chapter 1's danger"). Refer by theme, pattern name, or "earlier"/"later" when needed.
- Filenames may keep numeric slugs (`chapter-1-the-first-leap.md`) and `bridge.md` for repo ordering; those names are not reader-facing.
- Part openers (`bridge.md`) begin with `# Part I — [Part Title]` (or Part II / III), matching `index.md`. Do not use "Bridge — …" in reader-facing headings.

## Key docs

- `docs/pattern-language.md` — locked pattern set
- `docs/bibliography-guide.md` — source layers and chapter mapping
- `docs/drafting-process.md` — workflow and pass order
- `docs/status.md` — unit-level progress
