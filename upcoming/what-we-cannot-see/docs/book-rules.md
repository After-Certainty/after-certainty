# What We Cannot See — Book Rules

## Purpose

Architectural constraints for **What We Cannot See** (*Bias, Judgment, and the Limits of Perspective*).

This is not a marketing brief. It preserves conceptual cohesion, stylistic consistency, and structural discipline across the manuscript.

## Book scope and structure

### Target length

- **Open decision:** Essay (~12–18k), practice (~30–45k), or full (~55–80k)
- Current scaffold supports all three via merge candidates in [`chapter-questions.md`](chapter-questions.md)
- Structure per [`index.md`](../index.md): introduction, 3 parts, 3 part bridges + 1 integration bridge, 13 chapters, epilogue

### Markdown file structure

- One markdown file per chapter (and per bridge).
- Filenames must match the chapter slug in `index.md`.
- `index.md` is the hub; all units must be linked from it.
- Back matter files (glossary, bibliography, epilogue) live under `back-matter/`.

### Front-matter depth

- Introduction must land the central question and reader contract before Part I.
- Generated title-page/copyright deferred until promote.

## Core invariant (non-negotiable)

> Every perspective is partial. Finite minds inhabit finite perspectives. Bias is the selective work through which finite perspectives become possible—not a flaw individuals can eliminate, but a consequence of selective cognition. Judgment is the responsible use of limited perspectives. Integration is how many incomplete perspectives become more complete understanding. Because individual objectivity is impossible, societies develop processes that integrate partial perspectives and correct for individual limitation without assuming unbiased people exist.

Every chapter must map back to this claim. If a section cannot be tied to it, it does not belong.

See [`thesis.md`](thesis.md) and [`process-design.md`](process-design.md) for full articulation.

## Four levels (conceptual architecture)

Always distinguish in planning and prose:

1. **Individual cognition** — how finite perspectives take shape (Part I)
2. **Individual judgment** — responsible use of partial perspectives (Part II)
3. **Collective integration** — many partial views → larger model (Part III, early)
4. **Institutional process design** — processes that improve collective judgment without unbiased people (Part III, culmination)

**Guardrail:** Unavoidable bias in individuals ≠ nothing can be improved. Process design compensates for finitude; it does not repeal it.

## Thematic arc by part

- **Perspective** (ontology): We experience the world from somewhere—the book's spine
- **Part I — Bias:** Individual cognition—**construction of perspective**; *bias* is Part I’s reader-facing vocabulary, not the book’s central noun (see [`thesis.md`](thesis.md)); Ch 1–5 + bridge establish benchmark grammar
- **Part II — Judgment:** Individual judgment—we judge from somewhere; responsible decisions despite incomplete information
- **Bridge — The Limits of Individual Wisdom:** Why even excellent individual judgment remains incomplete; process design follows from cognitive limitation
- **Part III — Integration / Designed Epistemologies:** We build institutions from somewhere; collective integration and process design for knowing more together than alone

See [`thesis.md`](thesis.md) for book spine echoes; [`process-design.md`](process-design.md) for Part III process examples.

## Differentiation from related titles

| Adjacent book | WWCS distinct angle |
|---------------|---------------------|
| *Trust Beyond Similarity* | WWCS is foundational cognition—why partiality exists before trust across difference |
| *Why Diversity Matters* | WWCS is universal epistemics; diversity book is one application domain |
| *After Certainty* | WWCS builds the mechanism (bias → judgment → integration); After Certainty is practice capstone |
| *The Discipline of Uncertainty* | Discipline focuses probabilistic leadership; WWCS focuses cognitive architecture of partial sight |
| *Why Collaboration Is So Hard* | Collaboration is coordination fragility; WWCS Part III is epistemic model-building |

## Tone and positioning

### Shared house style

See [`writing-style.md`](writing-style.md) and [upcoming/docs/_templates/book-rules.md.template](../../docs/_templates/book-rules.md.template).

### This book must not be

- A debiasing handbook or implicit claim that individuals can become unbiased
- A fatalist argument that because bias is unavoidable, nothing can be improved
- Culture-war framing or manifesto voice
- Tech-bashing or institution-bashing without diagnostic balance
- Compromise-as-integration or false equivalence

### This book must be

- Curious, thoughtful, restrained
- Observational discovery before naming
- **Adaptation before blind spot**—what problem did this solve? before what does it hide?
- Honest that adaptive ≠ exculpatory—judgment carries moral weight
- Clear that individual bias is unavoidable **and** collective judgment can be improved through process design
- One continuous inquiry across the manuscript

## Chapter construction

Each chapter follows the six-beat scaffold in [`chapter-template.md`](chapter-template.md):

1. Genuine human question (blockquote at open)
2. Observations (no immediate definitions)
3. Pattern reveal
4. Conceptual framework
5. Implications (adaptive ↔ dangerous)
6. Natural handoff to next question

Central questions and handoffs: [`chapter-questions.md`](chapter-questions.md).

**Part I benchmark:** Ch 1–4 establish the book’s grammar—Problem → Adaptation → Blind spot → Compensation; adaptive-before-dangerous; one construction layer and one metaphor per chapter; spine cadence (*we attend / remember / interpret / trust from somewhere*); curiosity chain handoffs. Match their movement; freeze approved chapters; extend the pattern forward. See [`chapter-template.md`](chapter-template.md).

**Part I taxonomy:** [`bias-taxonomy.md`](bias-taxonomy.md) — four questions per family; archaeology of perspective framing.

### Reader-facing headings

- Do not use "Chapter" or "Bridge" in manuscript headings or `index.md` link text—title only.
- Subheads name the movement of thought, not outline labels.

## Planning docs (reference layer)

| Doc | Purpose |
|-----|---------|
| [`vision.md`](vision.md) | Purpose, reader experience, tone |
| [`thesis.md`](thesis.md) | Core thesis and guardrails |
| [`book-promises.md`](book-promises.md) | Reader contract |
| [`writing-style.md`](writing-style.md) | Voice and influences |
| [`chapter-template.md`](chapter-template.md) | Six-beat scaffold |
| [`chapter-questions.md`](chapter-questions.md) | Questions and handoffs |
| [`bias-taxonomy.md`](bias-taxonomy.md) | Nine bias families |
| [`judgment-framework.md`](judgment-framework.md) | Part II concepts |
| [`integration-framework.md`](integration-framework.md) | Part III concepts (integration + process design) |
| [`process-design.md`](process-design.md) | Designed epistemologies; four levels; Part III process examples |
| [`historical-case-studies.md`](historical-case-studies.md) | Case index |
| [`recurring-metaphors.md`](recurring-metaphors.md) | Through-line candidates |
| [`bibliography-research.md`](bibliography-research.md) | Working bibliography |
| [`glossary-research.md`](glossary-research.md) | Term candidates |

## Citation and glossary

### Citation (when prose is drafted)

- Pandoc footnote syntax (`[^id]` with `[^id]:` definitions)
- **Chicago Notes–Bibliography** — full first-cite footnotes matching house books (*How Trust Forms*, *Trust Beyond Similarity*): `Author, *Title* (Place: Publisher, Year).` for books; `Author, "Article Title," *Journal* vol, no. (year): pages.` for articles
- Bibliography list uses the same sources in alphabetical author–date list form ([`back-matter/bibliography.md`](../back-matter/bibliography.md))
- Stable, chapter-scoped IDs
- Never fabricate references; mark unverified sources in [`citation-punch-list.md`](citation-punch-list.md) until verified
- Research bibliography: [`bibliography-research.md`](bibliography-research.md)

### Glossary (when used)

- Research terms: [`glossary-research.md`](glossary-research.md)
- Manuscript glossary: [`back-matter/glossary.md`](../back-matter/glossary.md)
- Bold glossary terms only at first occurrence in reading order

## Drafting checks

Before marking a unit approved, ask:

1. Does this reinforce the core invariant?
2. Does this advance the arc, not circle it?
3. Is tone diagnostic rather than prescriptive?
4. Are claims proportionate to evidence at this draft stage?
5. Does adaptive presentation avoid exculpatory tone?
6. Does this distinguish individual cognition from institutional process design?
7. Does the chapter include at least one **surprise line**—a bold conclusion the reader can pause on? (Part I whole-book pass: Ch 2–3 landed; preserve in later parts.)

**Deferred pass:** Revisit Ch 1–2 voice after Part II is drafted (author feedback: voice fully arrives by Ch 5).

## Key docs

- [`drafting-process.md`](drafting-process.md) — workflow and pass order
- [`status.md`](status.md) — unit-level progress
