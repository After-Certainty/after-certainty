# Coupling - Book Rules

## Purpose

This document consolidates all writing, style, citation, and structural constraints for the book `Coupling: Cohesion, Consequence, and the Architecture of Responsibility`.

Its purpose is to preserve:

- Conceptual cohesion
- Stylistic consistency
- Moral clarity without prescriptiveness
- Structural discipline across chapters

This is not a marketing brief. It is an architectural constraint document.

## Book Scope and Structure

### Target Length

- 280-340 pages
- 80,000-100,000 words
- Expansive but not encyclopedic
- Deep, but not bloated

### Structural Rules

- 5 parts
- 18-22 chapters
- Chapters 3,000-5,000 words each
- No chapter longer than 6,000 words
- No filler case studies
- Each chapter must advance the invariant

### Markdown File Structure Rules

- Each chapter must exist as its own markdown file.
- Each chapter filename must be named after the chapter.
- Each part must include a bridge section in its own markdown file.
- Bridge sections are required transitions between parts and must preserve arc continuity.
- The book must include a `glossary.md` file in back matter.

### Front-Matter Depth Rule

- Front matter sections (Author's Note, Preface, Introduction, Typographical Conventions, Prologue) must be substantive drafts, not placeholder blurbs.
- Each front matter section should clearly perform its distinct role in the reading sequence.
- Use clear sub-headings when needed to improve navigation and reduce compressed, overly terse prose.
- Copyright/legal sections are exempt from depth expectations.

### Thematic Arc by Part

- Part I: Define the law with clear conceptual grounding
- Part II: Use software as a laboratory with concrete engineered feedback examples
- Part III: Treat AI as a modern stress test of cohesion/coupling
- Part IV: Show institutional pressure from scale and abstraction
- Part V: Cover oscillation, design, and limits without prescription

No part may drift into:

- Anecdotal storytelling without structural tie-in
- Political commentary detached from invariant
- Excessive technical rabbit holes

## Core Invariant (Non-Negotiable)

Every chapter must map back to this structural claim:

> Healthy systems exhibit high cohesion of responsibility and intentional coupling of consequence.
>
> Unhealthy systems exhibit low cohesion and either accidental over-coupling or severed coupling.

If a section cannot be tied back to cohesion, coupling, scale, feedback, and responsibility, it does not belong.

## Tone and Positioning

### The Book Must Not Be

- Prescriptive policy writing
- A partisan political argument
- A tech hype book
- A doom narrative
- A productivity manual
- A moral sermon
- Academic treatise
- Startup hype
- Culture commentary
- Think tank policy memo

### The Book Must Be

- Structural
- Diagnostic
- Cross-domain
- Calm
- Clear
- Ethically serious
- Technically literate
- Philosophically restrained

The voice should feel:

- Reflective but grounded
- Precise but readable
- Serious without melodrama
- Thoughtful without abstraction drift
- Calm, deliberate, grounded

Avoid:

- Rhetorical grandstanding
- Slogans
- Dramatic culture-war framing
- Dramatic rhetorical crescendos
- "This is the crisis of our time" framing

## Style and Language Guardrails

### Writing Style

- Clean prose
- Short to medium paragraphs
- Minimal metaphor
- Avoid flowery language
- Avoid buzzwords
- Avoid trend jargon unless defined

### Sub-Heading Discipline

- Use clear sub-headings to separate major sections within a draft.
- Use sub-headings for scene-based openings (for example, each distinct scene in a prologue or chapter opening).
- Sub-headings should improve navigation and structural clarity, not add decorative language.
- Keep sub-heading wording concise and literal.

### Glossary Term Formatting

- Domain-specific terms should be maintained in `glossary.md`.
- Format glossary terms in bold only at their first occurrence in the manuscript reading order, beginning after `Typographical Conventions`.
- Front matter before `Typographical Conventions` (including Author's Note and Preface) is excluded from mandatory glossary-term bolding.
- After the first manuscript occurrence, subsequent mentions should return to normal formatting unless emphasis is explicitly needed.
- Use this convention to support cross-domain readability, not visual decoration.

### Glossary Dependency Integrity

- Order glossary entries so definitions do not depend on terms defined later in the file.
- Avoid circular glossary dependencies (A depends on B while B depends on A).
- If circular dependency appears unavoidable, stop and resolve with explicit author guidance before finalizing terms.

### Technical Language

- Define technical concepts clearly
- Do not over-assume reader familiarity
- Avoid deep implementation detail
- Use diagrams sparingly and only when clarifying

### Philosophical and Moral Tone

- Avoid absolute moral claims
- Soften over-absolute claims unless they are clearly bounded or supported by strong evidence
- Prefer calibrated language for generalizations (for example: "often," "under these conditions," "in many systems")
- Avoid universalizing beyond structural observation
- Stay diagnostic
- Avoid inflated moral tone
- Avoid apocalyptic framing
- Avoid excessive hedging

### Hybrid Mode Standard (Technical Precision + Literary Clarity)

The voice should read like:

- An architect who reads Arendt
- A systems thinker who has been on call
- A moral analyst who understands CI/CD

Every concept must move across domains. Avoid:

- Philosophical abstraction without engineering example
- Engineering detail without moral framing

Use:

- Clear verbs
- Concrete nouns
- Minimal adjectives
- Direct argument

## Chapter Construction and Repetition Rules

### Chapter Construction Template

Each chapter should roughly follow:

1. A concrete scene (technical or institutional)
2. Structural analysis
3. Cross-domain parallel
4. Theoretical anchor (cited)
5. Return to invariant
6. End with a pull-quote that captures the chapter's structural takeaway

### Pull-Quote Conventions

- Each chapter should end with a pull-quote.
- Pull-quotes should be concise and structural, not rhetorical decoration.
- Do not use bold formatting inside pull-quotes.

### Repetition Rules

Allowed:

- Reintroducing the invariant in varied form
- Layered refinement of coupling/cohesion

Not allowed:

- Repeating the same examples across chapters
- Restating definitions without deepening them
- Rehashing Agile/DevOps too many times

Each recurrence must add nuance.

## Reference and Citation Rules

### Reference Philosophy

The book must be:

- Structurally rigorous
- Historically grounded
- Technically literate
- Academically adjacent (without being academic)

References are not decorative. They must:

- Anchor structural claims
- Clarify lineage of ideas
- Protect against accidental originality claims
- Preserve intellectual honesty

### Citation Density Target

- 6-12 meaningful citations per chapter
- 120-180 total references
- Citations clustered around structural pivots
- Narrative sections allowed to breathe

If every paragraph is footnoted, readability suffers. If major claims are not footnoted, legitimacy suffers.

### Footnote Conventions

- Use Pandoc/Markdown footnote syntax for chapter citations (`[^id]` in text with matching `[^id]:` note definitions)
- Use stable, chapter-scoped IDs in source (for example, `[^c1-coupling-definition]`) rather than raw numeric IDs
- Keep IDs unique within each chapter and semantically tied to the cited claim
- Place citation markers after punctuation
- No inline author-date citations in body text
- Preserve output numbering for `.docx`/Kindle conversion by relying on renderer formatting, not numeric IDs in source

### Footnote Style

Footnotes must:

- Expand, not distract
- Clarify nuance
- Offer deeper reading
- Occasionally show intellectual humility

Avoid:

- Clever asides
- Argumentative tangents
- Self-justification

### Reference Types

Strong sources:

- Peer-reviewed research
- Foundational technical books
- Primary historical documents
- Published frameworks (Agile Manifesto, DORA reports, etc.)
- Established economic or political theory

Acceptable sources:

- Well-documented industry white papers
- Public speeches (if primary)
- Reputable journalism (sparingly)

Avoid:

- Twitter threads
- Blog posts unless foundational and widely cited
- Medium posts
- Anecdotal claims without sourcing

### Core Reference Pillars (Non-Negotiable Anchors)

Systems and feedback:

- Norbert Wiener
- W. Edwards Deming
- Donella Meadows
- Stafford Beer

Software and architecture:

- Martin Fowler
- Robert C. Martin
- Alistair Cockburn
- DORA Research
- Gene Kim et al.

Organizational and institutional theory:

- Elinor Ostrom
- James Madison
- Friedrich Hayek
- Herbert Simon

Moral and responsibility theory:

- Hannah Arendt
- Christopher Lasch (optional)
- Modern agency and accountability literature

## Claim Quality and Integrity Rules

### Structural Rule for Claims

No large structural claim without at least one of:

- A cited historical precedent
- A technical framework reference
- A measurable study
- A foundational theoretical anchor

If a claim feels sweeping, it must be supported.

### Ethical and Intellectual Integrity

- Do not appropriate unpublished ideas from collaborators
- Do not quote private conversations without permission
- Do not present others' emerging frameworks as original
- Cite public ideas clearly when used

If a chapter intersects with a collaborator's unpublished idea, a contemporary paper in progress, or a privately shared concept, either:

- Wait for publication
- Abstract beyond traceability
- Credit the thinker explicitly

This book must preserve relational trust.

### AI Citation Guardrails

- Never fabricate references
- Verify all citations independently
- If uncertain, mark as "verify source"
- Do not cite obscure studies without confirmation

No hallucinated scholarship.

## Drafting and Review Checks

### Section-Level Check

When drafting any section, ask:

1. Does this reinforce cohesion or coupling?
2. Does this clarify scale and abstraction?
3. Does this avoid prescriptive moralizing?
4. Does this stay within structural analysis?
5. Is this chapter advancing the arc, not circling it?

If not, revise.

### Citation Review Check

When reviewing a chapter, ask:

1. Are claims grounded?
2. Are citations meaningful or ornamental?
3. Is there a balance of technical and institutional sources?
4. Does the chapter show intellectual humility?
5. Would an academic critic dismiss this as unsourced?

If yes, revise.

### Final Structural Test

After drafting any chapter, ask:

- Is this structurally rigorous?
- Is it technically literate?
- Is it morally grounded?
- Would a senior engineer respect this?
- Would a political theorist dismiss this?
- Would an informed reader follow it?

If all three audiences can stay with it, the chapter is in the right zone.

## Ultimate Focus and Final Constraint

The book is not ultimately about technology, politics, Agile, AI, DevOps, or governance. Those are illustrations.

It is about:

> The distance between decision and consequence, and the structural conditions under which responsibility survives scale.

Final constraint:

- If the manuscript feels overextended, redundant, moralizing, or technically scattered, tighten it.
- Cohesion is not just a theme. It must be embodied.

## Optional Enhancement

Optionally include a bibliography grouped by domain:

- Systems Theory
- Software Architecture
- Organizational Design
- Political Theory
- Moral Philosophy
