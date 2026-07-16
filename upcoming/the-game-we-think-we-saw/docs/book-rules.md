# The Game We Think We Saw — Book Rules

## Purpose

Architectural constraints for **The Game We Think We Saw** (*What Sports Reveals About Winning, Judgment, and the Stories Results Cannot Settle*).

This is not a marketing brief. It preserves conceptual cohesion, stylistic consistency, and structural discipline across the manuscript.

## Book Scope and Structure

### Target length

- **Recommended (Phase 4):** practice / mid-length band (~20–35k). Current body ≈ 26.5k excluding footnotes.
- Not a short portfolio “essay edition” (~9–15k) without cutting the seven-chapter spine; not a full-book expansion (~40–60k+) unless the author adds cases.
- Author confirmation still required before Phase 5 promote.
- Structure per `index.md`: Introduction; Part I (Ch 1–2); Part II (Ch 3–4); Part III (Ch 5–6); Part IV (Ch 7); Conclusion.

### Markdown file structure

- One markdown file per chapter (and per bridge where present).
- Filenames must match the chapter slug in `index.md`.
- `index.md` is the hub; all units must be linked from it.
- Back matter files (conclusion, later glossary/bibliography) live under `back-matter/`.

### Front-matter depth

- Front matter should perform its distinct role in the reading sequence (not placeholder blurbs once drafted).
- Copyright/legal sections are exempt from depth expectations.

## Core invariant (non-negotiable)

> A result can be final while its cause, legitimacy, cost, and meaning remain unsettled.

Companion distinction (also non-negotiable):

> The scoreboard is not wrong. It is complete only about the question it was built to answer.

Every chapter must map back to this claim. If a section cannot be tied to it, it does not belong.

## Thematic arc by part

- **Part I — What the Result Shows:** measurement and causation; what comparison compresses and how systems are narrated as faces.
- **Part II — Why the Result Counts:** procedural legitimacy of judgment and the moral halo of winning.
- **Part III — What the Result Demands:** embodied cost and situated refusal; moral language of sacrifice and who may say no.
- **Part IV — What the Result Becomes:** public meaning after the event leaves the field.

## Tone and positioning

### Shared house style (upcoming nonfiction)

- Diagnostic, not prescriptive.
- Observational, not preachy.
- Clear, not academic.
- Serious, not dramatic.
- Calm, deliberate, grounded.

### This book must not be

- A sports nostalgia project or highlight-reel anthology
- A “scoreboard lies” thesis
- A management or politics translation guide that escorts the reader off the field
- A prosecutorial brief disguised as essay
- A binary of data vs humanity, athletes vs institutions, or protest vs patriotism

### This book must be

- Sports-first: stay inside the game; let broader applications be recognized, not announced
- Reflective, precise, humane, and essayistic
- Morally attentive without prosecutorial certainty
- Patient enough to let scenes reveal the idea before naming it
- Careful with high-risk cases (especially Chapters 4 and 7)

### Plain-speak habits

- Favor developed paragraphs; use short paragraphs selectively for emphasis.
- Concrete verbs over abstract noun chains.
- Ground observable sports behavior before naming concepts.
- Avoid manifesto voice, management-blog tone, and culture-war framing.
- Do not overuse “This is not…” constructions or stack compression lines.

## Chapter construction

Align with [`voice-guide.md`](voice-guide.md). Rough sequence:

1. Ordinary sports observation
2. Hidden tension
3. Structural or philosophical widening
4. Case testing
5. Defensible compression line
6. Counterexample or boundary condition
7. Return to the opening physical image

Sports-first rule: do not add explicit translations to business, politics, or leadership outside the game.

## Repetition rules

- Reintroducing the invariant in varied form is allowed.
- Repeating the same examples, definitions without deepening, or case templates without new nuance is not.
- Do not stack several compression lines together; let one strong sentence carry a section.

## Citation and glossary

### Citation (when prose is drafted)

- Use Pandoc footnote syntax (`[^id]` with `[^id]:` definitions).
- Stable, chapter-scoped IDs (for example `[^c3-clear-and-obvious]`).
- Never fabricate references; mark unverified sources as "verify source".
- Separate documented events, contemporary interpretation, retrospective interpretation, and author analysis (see [`research-plan.md`](research-plan.md)).
- High-risk chapters (4, 7) require evidence dossiers before drafting.

### Glossary (when used)

- Maintain `back-matter/glossary.md` only if the book introduces durable domain terms that need reader support.
- Bold glossary terms only at first occurrence in manuscript reading order.

## Drafting checks

Before marking a unit approved, ask:

1. Does this reinforce the core invariant?
2. Does this advance the life-of-a-result progression, not circle it?
3. Is tone diagnostic rather than prosecutorial?
4. Are claims proportionate to evidence at this draft stage?
5. Did the chapter include a real complication or counterexample?
6. Did the chapter stay inside the game (sports-first)?

## Key docs

- `docs/drafting-process.md` — workflow and pass order
- `docs/status.md` — unit-level progress
- `docs/voice-guide.md` — prose method and guardrails
- `docs/research-plan.md` — evidence discipline
