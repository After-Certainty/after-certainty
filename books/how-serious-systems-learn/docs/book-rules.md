# How Serious Systems Learn — Book Rules

## Structure

- 5 parts, 16 chapters, front matter and back matter per house layout
- One file per chapter under `parts/part-N-*/`
- Part bridges live beside chapters (`bridge.md`)

## Citation and bibliography

- Use Pandoc footnotes (`[^id]` with chapter-scoped IDs such as `[^c2-source-donella-h-meadows]`).
- Maintain `back-matter/bibliography.md`; every cited work in footnotes must appear there.
- Place a blank line before each `[^id]:` definition block (required for Pandoc/EPUB).

## Thematic arc

- **Part I — Why Knowing No Longer Governs Outcomes:** Confidence, correction, corrective loops
- **Part II — Disciplines That Survived Reality:** Constraint, learning, systems, failure
- **Part III — What These Disciplines Share:** Error, action, authority
- **Part IV — When Disciplines Fail:** Methods as myths, coherence, success signals
- **Part V — After Certainty:** What remains possible; learning as practice
