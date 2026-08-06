# When the Key Changes Hands — Book Rules

## Purpose

Architectural constraints for **When the Key Changes Hands** (*Character, Trust, and What We Cannot Predict*).

This is not a marketing brief. It preserves conceptual cohesion, stylistic consistency, and structural discipline across the manuscript.

## Book Scope and Structure

### Target length

- Essay/monograph edition; ~35–45k words across introduction, four parts (16 chapters), and epilogue.
- Structure per `index.md`: Introduction → Parts I–IV (bridge + four chapters each) → Epilogue → Bibliography.

### Markdown file structure

- One markdown file per chapter (and per bridge where present).
- Filenames must match the chapter slug in `index.md`.
- `index.md` is the hub; all units must be linked from it.
- Back matter files (epilogue, bibliography) live under `back-matter/`.

### Front-matter depth

- Front matter should perform its distinct role in the reading sequence (not placeholder blurbs).
- Copyright/legal sections are exempt from depth expectations.

## Core invariant (non-negotiable)

Character becomes visible through recurring costly choices. Those patterns become evidence for trust. Leadership makes character socially consequential and eventually symbolic. Succession transfers authority and expectations without transferring the character that originally made trust reasonable.

Compact spine:

costly choice → repeated pattern → inferred character → warranted expectation → trust → social signal → symbolic attachment → inherited expectation → succession mismatch.

Every chapter must map back to this claim. If a section cannot be tied to it, it does not belong.

## Thematic arc by part

- **Part I — How Character Becomes Visible:** We cannot observe character directly; we infer it from incomplete evidence (outcomes vs lines; tested refusal; patterns not souls).
- **Part II — How Character Forms:** Cost, love as practice, repetition, and repair leave dispositions behind.
- **Part III — Why Character Matters:** Unspecifiable futures, trust as a bet on a pattern, symbols that borrow character, and institutional limits of character.
- **Part IV — When Character Becomes Social:** Leadership as looking-to, permission, symbol vs person, and succession when the key changes hands.

## Tone and positioning

### Shared house style (upcoming nonfiction)

- Diagnostic, not prescriptive.
- Observational, not preachy.
- Clear, not academic.
- Serious, not dramatic.
- Calm, deliberate, grounded.

### This book must not be

- A survey of moral philosophy, personality psychology, trust theory, or leadership studies.
- A restatement of virtue ethics with Aristotle as governing vocabulary.
- A duplicate of *Everyone Knows Love*, *How Trust Forms*, *When Others Look to You*, or *When Others Become Leaders* (those supply premises; this book owns the spine from costly choice to succession mismatch).
- A partisan scorecard for public figures.

### This book must be

- Epistemic and social: how character becomes visible enough for judgment.
- Centered on ordinary scenes and objects (key, columns, trophy, tested line) before naming theory.
- Honest about counterweights (situationism, attribution error, institutional design beyond virtue).

### Plain-speak habits

- Short sentences by default; one clear claim per sentence unless parallelism is deliberate.
- Concrete verbs over abstract noun chains.
- Ground observable behavior before naming concepts.
- Avoid manifesto voice, management-blog tone, and culture-war framing.

## Chapter construction

Each chapter should roughly follow:

1. Opening pressure (scene, case, or concrete institutional moment)
2. Structural analysis
3. Cross-domain parallel where useful
4. Return to the core invariant
5. Optional pull-quote (concise, structural; no bold inside pull-quotes)

## Repetition rules

- Reintroducing the invariant in varied form is allowed.
- Repeating the same examples, definitions without deepening, or case templates without new nuance is not.
- See `docs/do-not-repeat-map.md` and `docs/inheritance-map.md` for corpus boundaries.

## Citation and glossary

### Citation (when prose is drafted)

- Use Pandoc footnote syntax (`[^id]` with `[^id]:` definitions).
- Stable, chapter-scoped IDs (for example `[^c3-frankfurt-importance]`).
- Blank line before each `[^id]:` definition block.
- Never fabricate references.
- Working map: `docs/anticipated-bibliography.md`. Export list: `back-matter/bibliography.md`.
- Target: meaningful citations at structural pivots; prefer the smallest responsible set.

### Glossary (when used)

- No glossary required for this edition unless domain terms proliferate beyond house series vocabulary.

## Drafting checks

Before marking a unit approved, ask:

1. Does this reinforce the core invariant?
2. Does this advance the arc, not circle it?
3. Is tone diagnostic rather than prescriptive?
4. Are claims proportionate to evidence at this draft stage?

## Key docs

- `docs/drafting-process.md` — workflow and pass order
- `docs/status.md` — unit-level progress
- `docs/inheritance-map.md`, `docs/do-not-repeat-map.md`, `docs/new-contribution-map.md`
- `docs/chapter-boundary-notes.md`, `docs/book-outline.md`
- `docs/anticipated-bibliography.md`, `docs/bibliography-pass.md`
