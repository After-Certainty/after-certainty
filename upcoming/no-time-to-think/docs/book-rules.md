# No Time to Think — Book Rules

## Purpose

Architectural constraints for **No Time to Think** (*How Acceleration Relocates Judgment—and Why Institutions Must Protect It*).

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

A faster step does not necessarily create a faster system. It often relocates the constraint. Judgment requires conditions—time, attention, consequence contact, stable context, permission to pause, and stop authority—not merely intelligent people.

Every chapter must map back to this claim. If a section cannot be tied to it, it does not belong.

## Shifted-bottleneck test (chapter gate)

Every chapter must answer:

1. What activity became faster, cheaper, or easier?
2. Where did the constraint move?
3. Who or what absorbed the displaced work?
4. Why did the new constraint become less visible?
5. What institutional mechanism could make it visible or manageable again?

A chapter that cannot answer these questions probably belongs in another book.

## Nested chapter movement

Ordinary object → event or historical case → philosophical pattern → return to the object.

## Thematic arc by part

- **Part I — The Acceleration Around Us:** Present-day cases make the shifted bottleneck visible (software, medicine, air-traffic control).
- **Part II — Where the Constraint Went:** Historical precedents (Taylor, Ford, aviation checklists, Challenger, Three Mile Island) make the pattern legible.
- **Part III — Responsible Speed:** Design lessons for protected judgment as generation becomes cheap.

## Tone and positioning

### Shared house style (upcoming nonfiction)

- Diagnostic, not prescriptive.
- Observational, not preachy.
- Clear, not academic.
- Serious, not dramatic.
- Calm, deliberate, grounded.

### This book must not be

- An anti-AI book.
- Nostalgia for slower work.
- A productivity manual.
- An argument that every bottleneck should be eliminated.
- A confusion of throughput with value.
- Blind to genuine benefits of acceleration.
- An assumption that more human involvement is always better than well-designed automation.

### This book must be

- An argument that acceleration relocates rather than eliminates judgment.
- Clear that institutions must intentionally preserve capacity for judgment.
- Structured around shifted bottlenecks across domains.
- Willing to preserve examples where speed and automation improve life.

### Plain-speak habits

- Short sentences by default; one clear claim per sentence unless parallelism is deliberate.
- Concrete verbs over abstract noun chains.
- Ground observable behavior before naming concepts.
- Avoid manifesto voice, management-blog tone, and culture-war framing.

## Chapter construction

Each chapter should roughly follow:

1. Ordinary object opening
2. Case or historical terrain
3. Structural analysis (shifted bottleneck)
4. Return to the object / core invariant
5. Optional pull-quote (concise, structural; no bold inside pull-quotes)

## Repetition rules

- Reintroducing the invariant in varied form is allowed.
- Repeating the same examples, definitions without deepening, or case templates without new nuance is not.

## Citation and glossary

### Citation (when prose is drafted)

- Use Pandoc footnote syntax (`[^id]` with `[^id]:` definitions).
- Stable, chapter-scoped IDs (for example `[^c3-faa-staffing]`).
- Never fabricate references; mark unverified sources as "verify source".
- Reverify every 2026 event before publication.

### Glossary (when used)

- Maintain `back-matter/glossary.md` when the book introduces domain terms.
- Bold glossary terms only at first occurrence in manuscript reading order.

## Drafting checks

Before marking a unit approved, ask:

1. Does this reinforce the core invariant?
2. Does this pass the shifted-bottleneck test?
3. Does this advance the arc, not circle it?
4. Is tone diagnostic rather than anti-technology?
5. Are claims proportionate to evidence at this draft stage?

## Key docs

- `docs/drafting-process.md` — workflow and pass order
- `docs/status.md` — unit-level progress
- `docs/outline.md` — canonical planning source
