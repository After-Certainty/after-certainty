# Before Certainty Arrives — Book Rules

## Purpose

Architectural constraints for **Before Certainty Arrives** (*How Moral Order Forms, Hardens, and Outlives Its Reasons*).

## Book scope and structure

### Target length

- Expanded essay edition (~10–11k words; editorial grounding pass May 2026)
- Long-form target (~60–90k words) deferred; not in scope for current pass
- 3 parts, 10 chapters, substantial front matter, bibliography

### Markdown file structure

- One file per chapter; front matter includes Author's Note and How to Read This History.
- `back-matter/bibliography.md` holds Chicago-style bibliography entries; keep in sync with chapter footnotes.

## Core invariant (non-negotiable)

> Moral order often forms under constraint before it is chosen; it hardens into certainty that outlives its original reasons; recognizing that sequence is not the same as dissolving it.

## Thematic arc by part

- **Part I — Constraint Before Choice:** Life under constraint, order before truth, power to legitimacy.
- **Part II — Compression Under Scale:** Density, shared conditions, writing as stabilizer.
- **Part III — Inherited Certainty:** Medieval through industrial scale to the moment before failure.

## Tone and positioning

### This book must not be

- Presentist moralizing about the past
- A Whig history of progress
- Political polemic using history as ammunition

### This book must be

- Historically grounded with clear period scope
- Diagnostic about how certainty inherits
- Readable for non-specialists (define terms, avoid jargon stacks)

## Chapter construction

Period/scene opening where useful → structural claim → historical anchor (when earned) → return to invariant. Use sub-headings for navigation in longer chapters.

At least 3 chapters should break the default rhythm (anchor-first opening, shorter section, or tension held before reframe). See `docs/editorial-passes.md`.

## Historical anchor convention

Brief concrete grounding (50–120 words), inline in prose—not vignette blocks, not pop-history anecdotes.

- Specific place, object, or practice (stele, census tablet, factory bell)
- Footnoted when verifiable (`[^cN-slug]`)
- 1–3 anchors per chapter
- Analysis stays in surrounding prose; anchors provide friction

## Three-pattern language

Locked set (see `docs/pattern-language.md`):

1. **Instability Demands Compression**
2. **What Holds Becomes Moral**
3. **Tools Survive Their Purpose**

Introduce quietly in introduction; embody in chapters. At most one bold surfacing per chapter when earned. No pattern callout boxes or per-chapter pattern headers.

**Secondary motif:** distance between action and consequence — light callbacks in Ch 4, 6, 9; not a fourth named pattern.

## Citation and bibliography

- Use Pandoc footnotes (`[^id]` with chapter-scoped IDs such as `[^c1-henrich-norms]`).
- Maintain `back-matter/bibliography.md`; every cited work in footnotes must appear there.
- Verify historical claims; no fabricated citations.

## Key docs

- `docs/drafting-process.md`
- `docs/status.md`
- `docs/pattern-language.md`
- `docs/editorial-passes.md`
- `docs/grounding-pass-checklist.md`
