# The Case That Does Not Fit — Book Rules

## Purpose

Architectural constraints for **The Case That Does Not Fit** (*Present-Day Cases, Historical Patterns, and Institutions Capable of Reconsideration*).

This is not a marketing brief. It preserves conceptual cohesion, stylistic consistency, and structural discipline across the manuscript.

## Book Scope and Structure

### Target length

- Essay-to-book band undecided; architecture supports ~11 chapters + intro/conclusion.
- Structure per `index.md`: 3 parts (Present / Past / Future), 11 chapters, introduction, conclusion.

### Markdown file structure

- One markdown file per chapter (and per bridge where present).
- Filenames must match the chapter slug in `index.md`.
- `index.md` is the hub; all units must be linked from it.
- Back matter files live under `back-matter/`.

### Front-matter depth

- Front matter should perform its distinct role in the reading sequence (not placeholder blurbs).
- Copyright/legal sections are exempt from depth expectations.

## Core invariant (non-negotiable)

Rules protect people from arbitrary judgment. Judgment protects people from rules that have mistaken them for someone else. Legitimacy depends on institutions capable of preserving both protections at once.

Every chapter must map back to this claim. If a section cannot be tied to it, it does not belong.

## Durability check (Part I gate)

Current events should be written for the durable decision tension they reveal—not for the eventual winner of a lawsuit, funding dispute, election, or policy reversal. A chapter should remain conceptually valid even if the live case resolves in the opposite direction.

## Nested chapter movement

Ordinary object → event or historical case → philosophical pattern → return to the object.

## Thematic arc by part

- **Part I — The Cases Before Us:** Present-day collisions of general rules with particular lives; Chapter 4 reverses moral direction so rules can protect as well as harm.
- **Part II — The Pattern Before Us:** Historical attempts to structure the relation between consistency and judgment (equity, sentencing/safety valve as hinge, accommodation, appeal, emergency exclusion).
- **Part III — Institutions That Can Reconsider:** Future design of correctability, especially under automated classification.

## Tone and positioning

### Shared house style (upcoming nonfiction)

- Diagnostic, not prescriptive.
- Observational, not preachy.
- Clear, not academic.
- Serious, not dramatic.
- Calm, deliberate, grounded.

### This book must not be

- A culture-war commentary.
- An argument that exceptions are inherently superior to rules.
- A confusion of local judgment with unreviewable discretion.
- Institutional analysis replaced by sympathy for individual cases.
- Flexibility without preserving contestability.
- Contemporary political debates overshadowing the institutional pattern.

### This book must be

- About how legitimate institutions preserve both rules and judgment.
- Structurally balanced: cases where rules protect people from local judgment, and cases where judgment protects people from overbroad rules.
- Focused on institutions rather than individual leaders as the primary unit of analysis.
- Clear that reconsideration is competence, not humiliation.

### Plain-speak habits

- Short sentences by default; one clear claim per sentence unless parallelism is deliberate.
- Concrete verbs over abstract noun chains.
- Ground observable behavior before naming concepts.
- Avoid manifesto voice, management-blog tone, and culture-war framing.

## Chapter construction

Each chapter should roughly follow:

1. Ordinary object opening
2. Case or historical terrain
3. Structural analysis (rules / judgment / reconsideration)
4. Return to the object / core invariant
5. Optional pull-quote (concise, structural; no bold inside pull-quotes)

## Repetition rules

- Reintroducing the invariant in varied form is allowed.
- Repeating the same examples, definitions without deepening, or case templates without new nuance is not.

## Citation and glossary

### Citation (when prose is drafted)

- Use Pandoc footnote syntax (`[^id]` with `[^id]:` definitions).
- Stable, chapter-scoped IDs (for example `[^c6-safety-valve]`).
- Never fabricate references; mark unverified sources as "verify source".
- Reverify every 2026 event before publication.

### Glossary (when used)

- Maintain `back-matter/glossary.md` when the book introduces domain terms.
- Bold glossary terms only at first occurrence in manuscript reading order.

## Drafting checks

Before marking a unit approved, ask:

1. Does this reinforce the core invariant?
2. Does Part I material pass the opposite-outcome durability check?
3. Does this advance the arc, not circle it?
4. Is balance structural rather than partisan?
5. Are claims proportionate to evidence at this draft stage?

## Key docs

- `docs/drafting-process.md` — workflow and pass order
- `docs/status.md` — unit-level progress
- `docs/outline.md` — canonical planning source
