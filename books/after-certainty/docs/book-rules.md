# After Certainty — Book Rules

## Purpose

Architectural constraints for **After Certainty** (*How to Live and Judge When Understanding is not Enough*).

## Book scope and structure

### Scope

- Concentrated essay edition
- 3 parts, 9 chapters, introduction and conclusion

### Markdown file structure

- One file per chapter under `parts/part-N-*/`.
- `index.md` links all units; part bridges live beside chapters (e.g. `parts/part-1-letting-go/bridge.md`).

## Core invariant (non-negotiable)

> Understanding alone cannot settle how to live, judge, or act. What remains practicable is judgment without finality, responsibility without control, and speech that does less harm—under limits we cannot remove.

## Thematic arc by part

- **Part I — Letting Go:** Release correctness, over-explanation, and hero/villain framing.
- **Part II — What Can Still Be Practiced:** Judgment, responsibility, and speech as disciplines.
- **Part III — Living With Limits:** Not-knowing, scale, and when to stop interpreting.

## Tone and positioning

### Shared house style

See [upcoming/docs/_templates/book-rules.md.template](../../docs/_templates/book-rules.md.template) (plain-speak, diagnostic, calm).

### This book must not be

- Self-help optimism or stoic performance
- Relativism dressed as wisdom
- Culture-war moral theater

### This book must be

- Intimate but structurally clear
- Honest about limits without despair
- Practical about judgment and speech without prescribing life plans

## Chapter construction

Default arc: opening pressure → structural analysis → return to invariant → optional pull-quote.

Not every chapter must follow the same rhythm. At least 2–3 chapters should break the default pattern (scene-first opening, shorter chapter, or tension held before reframe). See `docs/editorial-passes.md`.

## Opening scenes

Short narrative scenes ground abstract claims. Scenes may flow into surrounding prose; they need not be self-contained or visually set off.

- Use a concise heading: `### **Short Title**`
- Do not include the word "Vignette" in the heading
- No bold, glossary terms, or footnotes inside scene text
- Target 150–400 words per scene where a discrete scene is used; vary length and texture across chapters

### Vignettes as calibration

Vignettes are recognition anchors, not decoration. Conflict stays subtle; stakes are social or internal. Each scene must connect to the chapter stabilizer or distortion (correctness, explanation, heroes/villains, judgment, responsibility, speech, not-knowing, scale, interpretation).

Do not polish all vignettes toward one template.

## Pattern language (light surfacing)

Portable compressions for virtues that distort under scale—not a pattern catalogue. See `docs/pattern-language.md`.

- Do not use trailing backslash (`\`) line breaks in manuscript prose; use blank lines for deliberate cadence (see pass-2 cadence in `docs/feedback-pass-2.md`)
- Surface at most 1–2 patterns per chapter, only after prose establishes the insight
- Use a single bold line: `**Explanation Replaces Response.**`
- No pattern callout boxes, formal “Pattern:” sections, or numbered taxonomies in chapter prose
- Do not place bold pattern names inside opening scene text
- Ten core patterns only, **locked** for this book (see `docs/pattern-language.md`); WOLTY-like rhythm: 3–5 words with directional motion; field guide in `back-matter/appendix-a-stabilizers-and-distortions.md` (recognition after reading, not prerequisite)

## Citation and glossary

- Use Pandoc footnotes (`[^id]` with chapter-scoped IDs such as `[^c3-motivated-reasoning]`).
- Maintain `back-matter/bibliography.md` with Chicago-style bibliography entries; every cited work in footnotes must appear there.
- No glossary file yet; introduce only if cross-domain terms accumulate.

## Key docs

- `docs/drafting-process.md`
- `docs/editorial-passes.md`
- `docs/feedback-pass-2.md`
- `docs/pattern-language.md`
- `docs/beta-reader-feedback-2026.md`
- `docs/status.md`
