# Learning to See — Book Rules

## Purpose

Architectural constraints for **Learning to See** (*Practices of Attention, Humility, and Wisdom Across Traditions*).

This is not a marketing brief. It preserves conceptual cohesion, stylistic consistency, and structural discipline across the manuscript.

## Book Scope and Structure

### Target length

- **Full comparative edition:** ~55,000–70,000 words (~3,500–4,500 per chapter unit; intro/epilogue shorter).
- Structure per `index.md`: introduction, 4 parts (3 bridges), 14 chapters, epilogue.
- **Part bridges** close Parts I–III (after each part's final chapter) and turn the reader toward the next part. Part IV has no bridge; Chapter 14 transitions directly to the epilogue.
- See [`outline.md`](outline.md) for per-unit targets and research flags.

### Markdown file structure

- One markdown file per chapter (and per bridge).
- Filenames must match the chapter slug in `index.md`.
- `index.md` is the hub; all units must be linked from it.
- Back matter files live under `back-matter/`.

### Front-matter depth

- Introduction must remain **short**; Chapter 1 is where the book truly begins.
- Reserved drafts: Introduction, Chapter 1, Chapter 2 — do not overwrite without author review.

## Core invariant (non-negotiable)

> These traditions are not the same, but they sometimes develop similar patterns in response to similar human problems.

Related thesis (book-level, not repeated as a slogan in every chapter):

> The quality of what we know depends partly on the kind of knower we are becoming.

Every chapter must map back to the invariant. If a section cannot be tied to it, it does not belong.

## Governing distinctions (preserve throughout)

- Christian prayer is not Buddhist meditation.
- Repentance is not scientific updating.
- Confession is not peer review.
- A congregation is not a research community.
- Tradition is not merely documentation.

The analogies matter. So do the places where they break.

Do not flatten theological, philosophical, or metaphysical differences. Do not imply that observable benefits prove metaphysical claims. Do not reduce spirituality to psychology or epistemology to scientific method.

## Five-layer framework (Part II and comparative passages)

For every practice under comparison, distinguish at least four layers; add a fifth where useful:

1. **Metaphysical meaning** — What account of reality gives the practice meaning within its tradition?
2. **Formative intention** — What kind of person or community is the practice intended to cultivate?
3. **Observable effect** — What historical, psychological, social, or cognitive effects can responsibly be examined?
4. **Institutional distortion** — How can the practice be captured by authority, status, fear, conformity, or incentives?
5. **Comparative analogue** — What practice elsewhere addresses an overlapping human problem, and where does the comparison stop working?

Distinguish among: what practitioners claim; what historical evidence suggests; what empirical research has measured; what the author is inferring.

## Thematic arc by part

- **Part I — The Formation of a Knower:** Personal doorway; information vs formation; limits of seeing alone.
- **Part II — Practices for Recurring Human Problems:** Attention, humility, community, memory, conflict/repair, suffering/meaning — one limitation per chapter.
- **Part III — What Traditions Carry:** Cultural sediment; archaeology without contempt; integration without reduction.
- **Part IV — The Future of Wisdom:** Scarcity when answers are abundant; renewal vs commodification of ancient practices.

## Differentiation from related titles

| Adjacent book | Learning to See distinct angle |
|---------------|-------------------------------|
| **What We Cannot See** | WWCS diagnoses *why* perspective is partial (attention, memory, trust, process design). LTS asks *what practices* traditions use to **form** better knowers. |
| **Living in Sediment** | LIS maps structural fossils across domains. LTS uses *cultural sediment* as one chapter within a practice-formation arc. |
| **After Certainty** | AC is practice capstone for living without settled frameworks. LTS precedes it comparatively — how capacities are cultivated. |
| **The Discipline of Uncertainty** | TDU focuses decision quality under incomplete information. LTS is broader: moral imagination, ritual, spiritual formation, AI-age scarcity of judgment. |
| **How Meaning Moves** | HMM traces meaning formation before disagreement. LTS traces **knower formation** through disciplined practice. |

**Title collision:** Part I of *What We Cannot See* is subtitled "Learning to See Your Own Mind." This book is comparative-practice focused. Series guide must disambiguate.

## Tone and positioning

### Voice (essayistic, After Certainty / How Meaning Moves register)

- Essayistic rather than argumentative; curious before conclusive.
- Plainspoken without becoming simplistic; reflective without becoming vague.
- Interdisciplinary without literature-review cadence.
- Grounded in ordinary scenes before widening into theory.
- Respectful of believers, skeptics, scientists, philosophers, and people between categories.
- Willing to hold unresolved tensions; alert to power, authority, institutional incentives, and cultural inheritance.
- Interested in patterns rather than heroes and villains.
- Sounds like someone learning in public, not an expert delivering final theological rulings.

### Shared house style (upcoming nonfiction)

- Diagnostic, not prescriptive.
- Observational, not preachy.
- Clear, not academic.
- Serious, not dramatic.
- Calm, deliberate, grounded.

### Structural method (widening circle)

1. Begin with an ordinary, personal, historical, or institutional scene.
2. Stay with the scene long enough for the reader to feel the human problem.
3. Widen into psychology, philosophy, theology, history, or science.
4. Place multiple traditions in conversation.
5. Identify both the analogy and its limit.
6. Return to the lived stakes.
7. End with a question, distinction, or transition — not a motivational lesson.

Name frameworks only after readers have had a chance to recognize the pattern in action.

### This book must not be

- A conventional theology book or comparative religion survey.
- An argument that science and religion are secretly identical.
- A debiasing handbook, mindfulness productivity guide, or conversion narrative.
- Sermon language; staccato rhetorical fragments; excessive single-sentence paragraphs.
- Neuroscience-as-validation for ancient wisdom.
- A claim that survival of a practice proves it is beneficial.

### This book must be

- Comparative without reduction; specific schools, texts, periods, and internal disagreements named.
- Honest about power, harm, and institutional distortion in every tradition.
- Clear that the author has not resolved metaphysical beliefs and is not trying to convert anyone.
- Personal where stakes require it (especially Ch 1, Ch 10 hypothesis, Ch 13 callback) without becoming memoir-only.

### Plain-speak habits

- Substantial paragraphs by default; short paragraphs for emphasis only.
- Concrete verbs over abstract noun chains.
- Ground observable behavior before naming concepts.
- Avoid manifesto voice, management-blog tone, and culture-war framing.

## Chapter construction

Default arc (vary where outline specifies):

1. Opening scene or ordinary pressure
2. Human problem named through lived stakes
3. Traditions in conversation (specific, not generic)
4. Five-layer analysis where applicable
5. Analogy and where it breaks
6. Institutional or ethical dangers
7. Return to stakes; close with question or transition

Part II chapters share a recurring analytical structure (see `outline.md` per chapter).

## Repetition rules

- Reintroducing the invariant in varied form is allowed.
- Repeating the same examples, definitions without deepening, or case templates without new nuance is not.
- LDS personal story: Ch 1 (doorway), Ch 10 (historical hypothesis, careful), Ch 13 (AI callback) — not every chapter.

## Research standards

- Prioritize primary sources and respected scholarship.
- Do not attribute a single position to an entire tradition when substantial internal diversity exists.
- Do not rely on generalized summaries of "Eastern religion," "Indigenous spirituality," etc.
- Flag areas requiring sensitivity review or expert consultation in `outline.md` and `open-questions.md`.
- Claims that should remain hypotheses until verified must be marked as such in prose.

## Citation and glossary

### Citation (when prose is drafted)

- Use Pandoc footnote syntax (`[^id]` with `[^id]:` definitions).
- Stable, chapter-scoped IDs (for example `[^c5-teshuvah]`).
- Never fabricate references; mark unverified sources as "verify source".

### Glossary (when used)

- Maintain `back-matter/glossary.md` when domain terms stabilize.
- Bold glossary terms only at first occurrence in manuscript reading order.

## Drafting checks

Before marking a unit approved, ask:

1. Does this reinforce the core invariant?
2. Does this preserve differences while honoring analogies?
3. Is tone diagnostic rather than prescriptive?
4. Are claims proportionate to evidence at this draft stage?
5. (Part II) Are all five layers addressed where relevant?
6. Where does the analogy break — and is that named?

## Key docs

- [`outline.md`](outline.md) — canonical structure and per-chapter planning
- [`comparative-map.md`](comparative-map.md) — cross-tradition planning table
- [`open-questions.md`](open-questions.md) — unresolved editorial decisions
- [`drafting-process.md`](drafting-process.md) — workflow and pass order
- [`status.md`](status.md) — unit-level progress

Voice reference: [How Meaning Moves book-rules](../../../books/how-meaning-moves/docs/book-rules.md); [When Others Become Leaders voice-guide](../../../books/when-others-become-leaders/docs/voice-guide.md).
