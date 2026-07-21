# The World We Make Together — Book Rules

## Purpose

Architectural constraints for **The World We Make Together** (*How Ordinary People, Unequal Power, and Shared Action Shape History*).

This is not a marketing brief. It preserves conceptual cohesion, stylistic consistency, and structural discipline across the manuscript.

## Book Scope and Structure

### Target length

- Approximately 46,000–50,000 words
- Structure per `index.md` and `docs/outline.md`: Introduction; four parts (ten object-titled chapters + four bridges); Conclusion — The Table

### Markdown file structure

- One markdown file per chapter (and per bridge where present).
- Filenames must match the chapter slug in `index.md` once units are created.
- `index.md` is the hub; drafted units must be linked from it.
- Back matter files (bibliography, conclusion) live under `back-matter/` when created.
- Full architecture and chapter constraints live in `docs/outline.md` (canonical writing plan).

### Front-matter depth

- Front matter should perform its distinct role in the reading sequence (not placeholder blurbs).
- Copyright/legal sections are exempt from depth expectations.

## Core invariant (non-negotiable)

**History is collective. Responsibility is uneven. Power can be created together.**

History is neither made by exceptional individuals acting above their circumstances nor produced by impersonal structures acting without people. Democracy must recognize expertise, leadership, and unequal leverage without converting them into a theory of superior people. Its fullest possibility is developing power-with: capacities people create together that none possessed independently.

Every chapter must map back to this claim. If a section cannot be tied to it, it does not belong.

## Thematic arc by part

- **Part I — Who Makes History?** Visibility, structure/agency, and action under uncertainty.
- **Part II — Where Power Gathers:** Leadership under attention, institutional design, democratic answerability.
- **Part III — What Shared Power Requires:** Trust across difference; moral recognition beyond utility.
- **Part IV — From Power-Over to Power-With:** Honorable compromise’s limits; integration and co-created capacity; inheritance at the table.

The manuscript is cumulative (see logical progression in `docs/outline.md`).

## Tone and positioning

### Shared house style (upcoming nonfiction)

- Diagnostic, not prescriptive.
- Observational, not preachy.
- Clear, not academic.
- Serious, not dramatic.
- Calm, deliberate, grounded.

### This book must not be

- A summary or reading guide to the *After Certainty* series
- A greatest-hits remix of prior manuscripts
- A defense of “nuance” that places truth always in the middle
- A theory that all sides are equally valid
- A business-book framework dump or step program
- Hero-history that reproduces the compression Chapter 1 criticizes

### This book must be

- A standalone keystone argument about historical agency and shared power
- Humane, historically serious, accessible
- Object-anchored without mechanical symbolism
- Willing to name irreducible conflict and necessary authority
- Careful with binary outcomes vs binary theories (Introduction’s governing distinction)

### Plain-speak habits

- Substantial paragraphs that develop an idea through connected sentences; avoid staccato one-sentence defaults.
- Concrete verbs and nouns before abstract interpretation.
- Ground ordinary scenes before naming concepts.
- Vary insight delivery; do not default to “X is not Y. It is Z.”
- Avoid manifesto voice, management-blog tone, and culture-war framing.
- Do not overuse em dashes or rhetorical questions.

## Chapter construction

Signature form (flexible):

1. Ordinary observation or object
2. Widening through history and lived reality
3. Philosophical or political tension
4. Conceptual compression
5. Return to the object, altered

House checks still apply: opening pressure → structural analysis → return to invariant → optional pull-quote (no bold inside pull-quotes).

Vary object timing, opening mode, insight placement, and emotional temperature. See `docs/outline.md` for chapter-specific constraints.

## Repetition rules

- Reintroducing the invariant in varied form is allowed.
- Repeating the same examples, definitions without deepening, or case templates without new nuance is not.
- Do not re-summarize prior chapters in The Window or The Table.

## Citation and glossary

### Citation (when prose is drafted)

- Use Pandoc footnote syntax (`[^id]` with `[^id]:` definitions).
- Stable, chapter-scoped IDs (for example `[^c3-compression-claim]`).
- Prefer Chicago notes-and-bibliography “See Author, *Title*…” form; every cited work must appear in `back-matter/bibliography.md`.
- Never fabricate references; mark unverified sources in `docs/research-notes.md`.
- Target for drafted chapters: meaningful citations at structural pivots.

### Glossary

- Not required for the first editorial pass of the introduction.
- If later terms need a glossary, maintain `back-matter/glossary.md` and bold only at first occurrence in reading order.

## Drafting checks

Before marking a unit approved, ask:

1. Does this reinforce the core invariant?
2. Does this advance the arc, not circle it?
3. Is tone diagnostic rather than preachy?
4. Are claims proportionate to evidence at this draft stage?
5. Does the chapter object do conceptual work abstract prose would miss?

## Key docs

- `docs/outline.md` — full architecture and constraints (writing plan)
- `docs/research-notes.md` — unresolved factual and source needs
- `docs/drafting-process.md` — workflow and pass order
- `docs/status.md` — unit-level progress
