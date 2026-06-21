# When Trust Stops Tracking Reality — Book Rules

## Purpose

Architectural constraints for **When Trust Stops Tracking Reality** (*Why Good Intentions Sometimes Become Harmful*).

## Book Scope and Structure

### Target length

- Essay edition (~10–15k words), matching cluster books (Why Collaboration, Why Diversity)
- Structure per `index.md`: 3 parts, 3 bridges, 9 chapters, author's note, introduction, conclusion, appendix, bibliography

### Markdown file structure

- One markdown file per chapter (and per bridge).
- Filenames must match the chapter slug in `index.md`.
- `index.md` is the hub; all units must be linked from it.

## Core invariant (non-negotiable)

> Trust becomes dangerous when it stops learning from feedback.

Every chapter must map back to this claim. If a section cannot be tied to it, it does not belong.

## Closing principle

> Healthy trust preserves what matters by remaining willing to discover what does not.

## Thematic arc by part

**Part I — Why Trust Exists:** Verification shortcuts, success momentum, identity.

**Part II — The First Cracks:** Weak signals, participation that confirms rather than tests, trust at scale.

**Part III — Preservation:** Authority persistence, interpretive drift, correctable trust.

## Anchor story

**Calder Family Health** is the recurring fictional case (see Author's Note). Each chapter's Anchor Story advances the same organization through David Marsh's founding, growth, and succession. Real Anchors provide structural comparison across domains.

## Chapter construction

Each chapter opens with its title and a central question (blockquote), develops through content-specific subheads as the argument requires, and closes with a **Core Principle** section naming the locked pattern from `docs/pattern-language.md`. Calder Family Health and real-world examples are woven into the prose—not labeled with formulaic headers (`Question`, `Anchor Story`, `Real Anchors`, `Key Insight`).

Part openers (`bridge.md`) use the part theme as the unit heading—not "Bridge — …".

### Reader-facing headings

- Do not use "Chapter" or "Bridge" in manuscript headings, unit titles, or `index.md` link text—title only.
- Do not cross-reference other units by number. Refer by theme, pattern name, or "earlier"/"later" when needed.
- Filenames may keep numeric slugs (`chapter-1-trust-creates-shortcuts.md`) and `bridge.md` for repo ordering; those names are not reader-facing.
- Subheads should name the movement of thought in that unit (as in *How Trust Forms*), not repeat a shared scaffold across chapters. The only standardized section label is **Core Principle**.

Bridges are short transitional prose between parts. Introduction and conclusion carry book-level framing (Trust Cycle, closing question).

## Tone and positioning

### Shared house style

- Diagnostic, not prescriptive.
- Observational, not preachy.
- Clear, not academic.
- Serious, not dramatic.
- Calm, deliberate, grounded.

### This book must not be

- Partisan scorekeeping or culture-war framing
- Moral panic about "post-truth" without structure
- Prescriptive trust-building advice

### This book must be

- Tension/diagnostic (parallel to Interpretation, Incentives, Accountability)
- Structural comparison across domains
- Connected to After Certainty counter-disciplines where trust must remain answerable

### Paragraph rhythm

- Default 2–4 sentences per paragraph when the thought is continuous.
- Reserve single-sentence paragraphs for emphasis (roughly one per major beat), not as the default beat.
- Avoid more than three consecutive one-sentence paragraphs unless listing or deliberate acceleration.
- **Rhythm pass:** merge staccato single-sentence runs into flowing prose; keep deliberate short lines at hinges (reframes, pattern names, closing returns).

## Key docs

- `docs/pattern-language.md` — locked pattern set and Calder cast
- `docs/bibliography-guide.md` — locked source set and chapter mapping
- `docs/drafting-process.md` — workflow and pass order
- `docs/status.md` — unit-level progress
