# Living in Sediment — Book Rules

## Purpose

Architectural constraints for **Living in Sediment** (*How Structures Outlive Their Reasons*).

This is not a marketing brief. It preserves conceptual cohesion, stylistic consistency, and structural discipline across the manuscript.

## Book Scope and Structure

### Target length

- **Compact essay edition**—closer to [*After Certainty*](../../../books/after-certainty/index.md) and the trust trilogy's essayistic movement than to full-length domain books (~55–70k).
- **No hard word quota.** Chapters scale to the thought; do not pad or cut for length alone.
- Prologue + 4 parts + 15 chapters + epilogue; structure per `index.md`.
- A chapter in the ~800–1,500 word range is on-model when the argument lands (see Chapter 8). Longer only when the material earns it.

### Markdown file structure

- One markdown file per chapter (and per bridge where present).
- Filenames must match the chapter slug in `index.md`.
- `index.md` is the hub; all units must be linked from it.
- Prologue lives under `front-matter/`; epilogue under `back-matter/`.

### Front-matter depth

- Prologue performs the book's central metaphor work (September / seven / drift).
- Copyright/legal sections are exempt from depth expectations when added at promote.

## Core invariant (non-negotiable)

> We live inside inherited systems built to solve constraints that no longer exist. When constraints disappear but structures remain, meaning drifts. Over time, outputs become norms. Authority becomes invisible. The danger is not sediment. The danger is forgetting it is sediment.

Every chapter must map back to this claim. If a section cannot be tied to it, it does not belong.

## Differentiation from related titles

**Before Certainty Arrives** (*How Moral Order Forms, Hardens, and Outlives Its Reasons*) examines moral order forming under historical constraint across eras. **Living in Sediment** examines cross-domain infrastructure fossils in the anthropological present—language, time, policy, metrics, algorithms—and teaches the reader to *see* sediment without dissolving it. Do not retread BCAs period history; stay in present-tense recognition and cross-domain pattern.

## Thematic arc by part

- **Part I — Fossils We Don't Notice:** Pattern recognition without defensiveness (week, time, FHA, gold).
- **Part II — Fossils That Shape Power:** Sediment affects legitimacy (Senate, credit, quarters, architecture).
- **Part III — Fossils Forming Now:** Contemporary sediment without alarm (algorithms, SaaS, AI, data doubles).
- **Part IV — Living Among Sediment:** Necessary / Useful / Habitual; diagnostic framework; archaeology of the present.

## Tone and positioning

### Voice (essayistic, observational)

Write in the **concentrated essay** register used in *After Certainty* and *Trust Beyond Similarity*: associative but disciplined, intimate without memoir, structural without academic scaffolding.

**Rebecca Solnit adjacency** (tone reference, not imitation):

- Begin in concrete observation—a room, a word, a gesture—before naming the pattern.
- Let attention wander across domains when the parallel earns itself; return to the invariant without announcing the return.
- Prefer recognition to argument stack; the reader should *notice* sediment before being told it is sediment.
- Short paragraphs are default; single-sentence lines for hinge moments, not as a tic.
- Lyrical precision over manifesto clarity—calm, unhurried, almost field-note in quality.

### Shared house style (upcoming nonfiction)

- Diagnostic, not prescriptive.
- Observational, not preachy.
- Clear, not academic.
- Serious, not dramatic.
- Calm, deliberate, grounded.

### This book must not be

- Partisan dunking or culture-war framing
- Alarmist tech panic or "everything is broken" posture
- Policy checklist at the end of each chapter
- Outrage anthropology or manifesto voice

### This book must be

- Essayistic and observational—thought discovered in motion, not delivered as lecture
- Almost anthropological in stance—calm attention to inherited structures
- Grounded in cross-domain examples (language, time, policy, metrics, architecture, algorithms)
- Clear on the recurring pattern: constraint → solution → disappearance of constraint → survival of structure
- Readable for thoughtful general readers (Solnit, Arendt, Klein adjacency—not specialist jargon)

### Plain-speak habits

- Short sentences by default; one clear claim per sentence unless parallelism is deliberate.
- Concrete verbs over abstract noun chains.
- Ground observable behavior before naming concepts.
- Avoid manifesto voice, management-blog tone, and culture-war framing.

### Paragraph rhythm

- Default 2–4 sentences when the thought is continuous (see Chapter 8).
- Single-sentence paragraphs for emphasis at hinges—not as the default beat.
- Avoid long stretches of identical cadence; vary texture across chapters like *After Certainty*.
- Do not merge staccato lines into academic blocks; preserve observational pace.

## Recurring phrases (locked)

Use consistently when earned in prose—not as headers or callout boxes:

- **Crisis tools rarely retire.** (introduced Part I, Ch 3)
- **Timekeeping is never neutral.** (introduced Part II, Ch 7)
- **Optimization becomes authority.** (introduced Part III, Ch 11)
- Three states of a structure: **Necessary**, **Useful**, **Habitual** (Part IV, Ch 13)
- Diagnostic triad (Ch 14): Does it **quietly gather power** into fewer hands than it once did? Does it **simplify** something that genuinely needs simplifying, or has it begun **simplifying people** themselves? When decisions are made within it, can someone still **explain them, question them, and answer for them**?

## Chapter construction

**Essay form, not domain scaffold.** No fixed section labels (`Opening pressure`, `Structural analysis`, etc.) in reader-facing prose. Subheads (`###`) name the movement of thought in that chapter—as in *After Certainty*—or stay absent when the essay flows without them.

Default arc (flexible):

1. Concrete opening—scene, artifact, or everyday practice
2. Drift through examples and history as observation requires
3. Pattern surfaces when the reader is ready for it
4. Quiet return to the invariant—often in the closing lines, not a restated thesis

Part I establishes the pattern gently. Part II shifts toward legitimacy. Part III stays contemporary but not alarmist. Part IV is the philosophical landing zone.

**Chapter 8** (*The Building and the Gathering*) is the voice reference for drafted prose: courthouse opening, ekklesia thread, short paragraphs, sediment named only when earned.

## Repetition rules

- Reintroducing the invariant in varied form is allowed.
- Repeating the same examples, definitions without deepening, or case templates without new nuance is not.

## Citation and glossary

### Citation (when prose is drafted)

- Use Pandoc footnote syntax (`[^id]` with `[^id]:` definitions).
- Stable, chapter-scoped IDs (for example `[^c3-fha-standard]`).
- Never fabricate references; mark unverified sources as "verify source".
- Target for drafted chapters: meaningful citations at structural pivots.

### Glossary (when used)

- Maintain `back-matter/glossary.md` when the book introduces domain terms.
- Bold glossary terms only at first occurrence in manuscript reading order.

## Drafting checks

Before marking a unit approved, ask:

1. Does this reinforce the core invariant?
2. Does this advance the arc, not circle it?
3. Is tone diagnostic rather than prescriptive?
4. Are claims proportionate to evidence at this draft stage?

## Key docs

- `docs/drafting-process.md` — workflow and pass order
- `docs/status.md` — unit-level progress
- `docs/chapter-outline.md` — authoritative structural skeleton
