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

> Every perspective is partial. Bias is how finite minds allocate limited attention—not primarily a flaw to eliminate. Judgment is the responsible use of limited perspectives. Integration is how many incomplete perspectives become more complete understanding.

Every chapter must map back to this claim. If a section cannot be tied to it, it does not belong.

See [`thesis.md`](thesis.md) for full articulation.

## Thematic arc by part

- **Part I — Bias:** Why partial sight is universal and adaptive, not exceptional.
- **Part II — Judgment:** How responsible decisions happen despite incomplete information.
- **Bridge — The Limits of Individual Wisdom:** Why even excellent individual judgment remains incomplete; integration follows from cognitive limitation.
- **Part III — Integration:** How groups construct understanding exceeding any single perspective.

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

- A debiasing handbook or "bias = bad" morality tale
- Culture-war framing or manifesto voice
- Tech-bashing or institution-bashing without diagnostic balance
- Compromise-as-integration or false equivalence

### This book must be

- Curious, thoughtful, restrained
- Observational discovery before naming
- Honest that adaptive ≠ exculpatory—judgment carries moral weight
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
| [`integration-framework.md`](integration-framework.md) | Part III concepts |
| [`historical-case-studies.md`](historical-case-studies.md) | Case index |
| [`recurring-metaphors.md`](recurring-metaphors.md) | Through-line candidates |
| [`bibliography-research.md`](bibliography-research.md) | Working bibliography |
| [`glossary-research.md`](glossary-research.md) | Term candidates |

## Citation and glossary

### Citation (when prose is drafted)

- Pandoc footnote syntax (`[^id]` with `[^id]:` definitions)
- Stable, chapter-scoped IDs
- Never fabricate references; mark unverified sources
- Research bibliography: [`bibliography-research.md`](bibliography-research.md)
- Manuscript bibliography: [`back-matter/bibliography.md`](../back-matter/bibliography.md)

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

## Key docs

- [`drafting-process.md`](drafting-process.md) — workflow and pass order
- [`status.md`](status.md) — unit-level progress
