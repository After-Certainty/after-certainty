# After Certainty — Feedback Pass 2

Workflow for incorporating author drafts file-by-file on branch `after-certainty/editorial-feedback-pass-2`.

## How to submit drafts

Send one file at a time with:

1. **Target path** (e.g. `parts/part-1-letting-go/chapter-2-the-cost-of-explanation.md`)
2. **Draft text** (full file or clearly marked section replace)
3. **Intent** (optional): replace whole chapter, insert section, revise vignette only, etc.

The agent will merge the draft, then run a **cadence pass** (merge staccato single-sentence paragraphs into flowing prose while keeping deliberate emphasis at hinge lines), then a **pattern pass** where earned (1–2 bold inline compressions per chapter; see `pattern-language.md`), then run the convention checklist below before marking the unit done.

## File checklist (update as drafts land)

| File | Draft received | Incorporated | Conventions checked | Export |
|------|----------------|--------------|---------------------|--------|
| `front-matter/how-to-read-this-book.md` | yes | yes | yes (pass 2 refresh) | |
| `front-matter/introduction.md` | yes | yes | yes | |
| `parts/part-1-letting-go/chapter-1-the-end-of-correctness.md` | yes | yes | yes | |
| `parts/part-1-letting-go/chapter-2-the-cost-of-explanation.md` | yes | yes | yes | |
| `parts/part-1-letting-go/chapter-3-releasing-heroes-and-villains.md` | yes | yes | yes | |
| `parts/part-2-what-can-still-be-practiced/chapter-4-judgment-without-finality.md` | yes | yes | yes | |
| `parts/part-2-what-can-still-be-practiced/chapter-5-responsibility-without-control.md` | yes | yes | yes | |
| `parts/part-2-what-can-still-be-practiced/chapter-6-speech-that-does-less-harm.md` | yes | yes | yes | |
| `parts/part-3-living-with-limits/chapter-7-the-discipline-of-not-knowing.md` | yes | yes | yes | |
| `parts/part-3-living-with-limits/chapter-8-staying-human-at-scale.md` | yes | yes | yes | |
| `parts/part-3-living-with-limits/chapter-9-when-to-stop-interpreting.md` | yes | yes | yes | |
| `back-matter/conclusion-enough.md` | yes | yes | yes | |
| `back-matter/bibliography.md` | | | | |
| `back-matter/appendix-stabilizers-and-distortions.md` | yes | yes | yes | |
| `back-matter/glossary.md` | n/a | | | |

Run full-book export once after all edited units are checked.

## Convention checklist (per file)

### Structure and voice

- [ ] Reinforces core invariant (`docs/book-rules.md`)
- [ ] Plain-speak, diagnostic tone; no manifesto or culture-war framing
- [ ] Chapter title: `# **Chapter N**` and `## **Chapter Title**`
- [ ] Section headings: `### **Section Title**`

### Vignettes (if present)

- [ ] `### **Short Title**` outside block; no word "Vignette" in heading
- [ ] Scene inside `::: {custom-style="Vignette Block"}` … `:::`
- [ ] No bold, footnotes, or glossary markup inside vignette blocks
- [ ] Analysis stays outside vignette blocks

### Citations

- [ ] Body markers: `[^cN-slug]` (chapter-scoped, lowercase, hyphenated)
- [ ] Definitions at bottom of same file: `[^cN-slug]: See Author, *Title* …`
- [ ] Every new source added to `back-matter/bibliography.md` (Chicago-style bullets)
- [ ] Footnote text matches bibliography entry; no fabricated references
- [ ] Remove or use orphan footnote definitions (e.g. unused `[^c8-precedent-at-scale]`)

### Glossary (if terms introduced)

- Book has no `glossary.md` yet; add only when cross-domain terms accumulate.
- [ ] **Bold** term at first occurrence in manuscript reading order only
- [ ] Entry in `back-matter/glossary.md` if file exists; link from `index.md` when added

### Bibliography (`back-matter/bibliography.md`)

- [ ] Heading `# **Bibliography**`
- [ ] Dash bullets; one work per bullet
- [ ] Continuation lines indented two spaces
- [ ] Alphabetical by author; consistent title/place/publisher/year formatting

### Index

- [ ] New back-matter files linked from `index.md`

## References

- [`book-rules.md`](book-rules.md)
- [`editorial-passes.md`](editorial-passes.md)
- [`beta-reader-feedback-2026.md`](beta-reader-feedback-2026.md) (prior pass)
- House bibliography pass: [`../../how-meaning-moves/docs/bibliography-pass.md`](../../how-meaning-moves/docs/bibliography-pass.md)
