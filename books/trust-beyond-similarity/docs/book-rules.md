# Trust Beyond Similarity — Book Rules

## Purpose

Architectural constraints for **Trust Beyond Similarity** (*How Trust Remains Possible Across Difference*).

## Book Scope and Structure

### Target length

- **Practice book with narrative anchor** (~30–40k words prose; current draft ~35k)
- Longer than cluster essay books (*Why Collaboration*, *Why Diversity* at ~10–15k) because the community-center arc runs through all nine chapters; shorter than full-length books (*Why Collaboration Is So Hard* at ~70–90k)
- Structure per `index.md`: introduction, 3 parts, 3 bridges, 9 chapters, conclusion, appendix, bibliography
- **Length discipline:** protect scenes and Core Principle blocks; cut theory-after-scene redundancy before cutting anchor narrative

### Markdown file structure

- One markdown file per chapter (and per bridge).
- Filenames must match the chapter slug in `index.md`.
- `index.md` is the hub; all units must be linked from it.

## Core invariant (non-negotiable)

> Similarity makes trust easier. Difference makes trust more valuable.

Every chapter must map back to this claim. If a section cannot be tied to it, it does not belong.

## Thematic arc by part

**Part I — The Illusion of Sufficiency:** Easy trust, shared stories, comfort of agreement—and the illusion that similarity already shows enough.

**Part II — The Shock of the Partial:** Different summaries, diversity without trust, collaboration across difference—when each perspective reveals what others did not see.

**Part III — Epistemic Interdependence:** Listening without surrender, partial perspectives, beyond similarity—when no individual perspective is sufficient.

## Chapter construction

Each chapter opens with its title and a central question (blockquote), develops through content-specific subheads as the argument requires, and closes with a **Core Principle** section naming the locked pattern from `docs/pattern-language.md`. The community center anchor and real-world examples are woven into the prose—not labeled with formulaic headers (`Anchor Story`, `Real Anchors`, `Core Insight`).

Part openers (`bridge.md`) begin with `# Part I — [Part Title]` (or Part II / III), matching `index.md`. When the bridge theme differs from the part title—as in *Trust Beyond Similarity*—follow with `## [bridge theme]`. Do not use "Bridge — …" in reader-facing headings.

### Reader-facing headings

- Do not use "Chapter" or "Bridge" in manuscript headings, unit titles, or `index.md` link text—title only.
- Do not cross-reference other units by number. Refer by theme, pattern name, or "earlier"/"later" when needed.
- Filenames may keep numeric slugs (`chapter-1-trusting-people-like-us.md`) and `bridge.md` for repo ordering; those names are not reader-facing.
- **Subheads (`###` or `##`)** name the movement of thought in that unit—as in *How Trust Forms* and *When Trust Stops Tracking Reality*—not the six-beat outline labels ("Why It Forms," "Where It Drifts," "What Remains"). The only standardized section labels are **Core Principle** (chapters) and **Central Question** (introduction).
- Chapter closings may return to the anchor scene under a content-specific heading (e.g. **Back to the Model**, **Back to the Fence**), not a generic "Closing Return."
- **Appendix** part headings use `## Field Guide: Part N — …` (h2) so export TOCs do not duplicate main-book part entries.
- Introduction uses `##` for book-level sections (e.g. **Four Ways of Seeing**, **Partial Perspectives**); chapters use `###` for argument movements after the opening scene.

Outline scaffolds in Phase 0 may use outline labels; replace them with content-specific headings when drafting prose.

## Tone and positioning

### Shared house style

- Diagnostic, not prescriptive.
- Observational, not preachy.
- Clear, not academic.
- Serious, not dramatic.
- Calm, deliberate, grounded.

### This book must not be

- A diversity hiring guide or moral lecture
- Culture-war framing or manifesto voice
- Prescriptive "trust across divides" cheerleading

### This book must be

- Practice-oriented book bridging Collaboration and Diversity through a serialized anchor story
- Honest about naïveté and tribalism without collapsing into either
- Diagnostic about what makes trust across difference difficult and valuable

### Paragraph rhythm

- Default 2–4 sentences per paragraph when the thought is continuous.
- Reserve single-sentence paragraphs for emphasis (roughly one per major beat), not as the default beat.
- Avoid more than three consecutive one-sentence paragraphs unless listing or deliberate acceleration.
- **Rhythm pass:** merge staccato single-sentence runs into flowing prose; keep deliberate short lines at hinges (reframes, pattern names, closing returns). See [`docs/rhythm-pass.md`](rhythm-pass.md).

## Key docs

- `docs/pattern-language.md` — locked pattern set
- `docs/rhythm-pass.md` — author draft intake; staccato merge procedure
- `docs/character-guide.md` — anchor story characters and arcs
- `docs/drafting-process.md` — workflow and pass order
- `docs/status.md` — unit-level progress
