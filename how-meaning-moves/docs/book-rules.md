# Writing Style Directive - How Meaning Moves

## Core Tone

This manuscript should read as calm, precise, and human.

It should feel:

- Observational, not preachy.
- Serious, not dramatic.
- Clear, not academic.
- Durable, not trendy.
- Honest, not performative.

The reader should feel oriented, not managed.

## Plain-Speak House Style

Use direct prose by default.

- Prefer short sentences and one clear claim per sentence.
- Prefer concrete verbs over abstract noun chains.
- Ground ideas in observable behavior before naming a concept.
- Use everyday language when it preserves precision.
- Keep transitions plain and substance-led.

Do not simplify away core structural terms when they carry meaning.

## Part I voice lock (Chapters 1–3)

Use Chapter 1 ("Signal"), Chapter 2 ("Compression"), and Chapter 3
("Restraint") as the style baseline for subsequent chapter edits.

- Write as a calm observer of ordinary human behavior under pressure.
- Prioritize recognizable moments over explanatory framework language.
- Replace abstract nouns with lived actions when precision is preserved.
- Keep tone restrained, serious, and humane.
- Preserve conceptual architecture, but explain it through what people do.

### Trilogy progression (keep intuitive, not schematic)

Readers should feel this movement without studying labels:

- Signal shapes what arrives before words settle.
- Compression closes ambiguity quickly; meaning settles.
- Restraint delays closure long enough for contact to stay possible.

### Preferred register

- "what people assume"
- "what people settle on"
- "what changes in the conversation"
- "what people stop hearing"
- "what starts to feel true"
- "the story stops feeling chosen and starts feeling obvious" (when certainty hardens)

### Avoid drift toward

- communication-theory exposition
- systems-analysis phrasing
- psychological-framework vocabulary
- corporate, self-help, or therapy cadence
- repeated mechanism explanation after the point is clear
- schematic contrasts ("without X… with Y…") unless the sentence stays human-scale

### Compression language guidance

When revising passages about compression:

- Prefer "people decide quickly what something meant" over model phrasing.
- Prefer "the story starts to feel true" over abstract certainty language.
- Prefer "people trade depth for speed" over process-mechanism phrasing.
- Ground claims quickly in observable settings (work, relationship, text,
  authority, conflict).

### Restraint language guidance

Restraint is the most abstract and morally loaded of the three forces; it
drifts easily toward philosophy-book or procedural voice. Re-ground often:

- waiting, not replying yet, delaying escalation
- resisting correction, leaving ambiguity open, tolerating discomfort
- social cost without melodrama (misread, diminished, carrying discomfort)

Prefer:

- "people settle on meaning quickly / leave more room for revision"
- "restraint often feels terrible in the moment"
- "without the protection certainty usually provides"
- "no rule can fully automate restraint" over "cannot be proceduralized"
- "people remain more complicated than the first explanation allows"

Allow an occasional hinge sentence (for example, a dense line that marks a
turn in the argument), but do not stack aphorisms.

### Vignettes as calibration

Vignettes work best when conflict stays subtle, nothing explodes, and cost is
social or internal. They are emotional calibration for the ideas, not
decorative drama.

## Interpretive Register

The book offers a lens for attention, not a checklist for judging people.

- Prefer watch/notice/read/track language over evaluate/test language.
- Avoid stacked rubric-like bullet lists in chapter prose.
- Keep chapter body prose in sustained paragraphs unless lists clearly improve readability.
- Close sections by sharpening what the reader can still see, not by forcing final verdicts.

## Sentence and Paragraph Discipline

- Short declarative sentences are the default.
- Split long multi-clause lines when clarity improves.
- Use medium-length sentences intentionally for rhythm.
- Group related lines into coherent paragraphs.
- Avoid line-by-line fragmentation used only for emphasis.
- Use paragraph breaks to mark conceptual shifts, not dramatic effect.

## Heading and Transition Discipline

- Use consistent title case for manuscript headings.
- Keep heading wording literal and concise.
- Add sub-headings only when the argument clearly shifts.
- In chapter prose, avoid navigational scaffolding like "the next chapter."
- Prefer transitions that name the next idea, pressure, or question directly.

### Heading style consistency (match wolty/v1)

- In reader-facing manuscript files (`front-matter/`, `parts/`, `back-matter/`), wrap heading text in bold markers:
  - `# **Title**`
  - `## **Section**`
  - `### **Subsection**`
- Keep heading text in title case unless a specific chapter convention requires otherwise.
- Apply this consistently in all new edits and heading rewrites.
- `docs/` files are exempt; they may use plain markdown headings.

## Moral and Scope Guardrails

- Analyze structures and dynamics, not personal virtue.
- Avoid moral ranking language unless a claim explicitly requires it.
- Keep arguments portable across domains (family, work, civic, institutional).
- Use domain-specific terms only when a claim depends on that domain.

## Typographical Conventions (Editorial Authority)

Use these conventions consistently in manuscript files:

- Pull Quote blocks should not contain inline bold formatting.
- Pattern blocks use one bold heading line in the form `**Pattern: Title**`.
- Vignette scene text stays inside the vignette block; analysis stays outside.
- Keep reader-facing typographical explanations short; keep production detail in `docs/`.

### Pattern block introduction rule

- The first reader-facing introduction of each canonical pattern should use a `Pattern Block`.
- Use one clear definition sentence in the block body.
- After first introduction, reference patterns inline in normal prose unless a deliberate re-definition is needed.

### Vignette emphasis convention

- See also **Vignettes as calibration** under Part I voice lock for tone and stakes.
- Use vignette blocks to visually emphasize short narrative scenes that illustrate the active claim.
- Put a short vignette heading outside the block as `### **Short Title**`.
- Do not include the word "Vignette" in the heading.
- Wrap scene text in `::: {custom-style="Vignette Block"}` ... `:::`.
- Keep interpretive analysis before or after the block, not inside it.

## Reader-Facing vs Writer-Facing

- Reader-facing: `index.md`, `front-matter/`, `parts/`, `back-matter/`.
- Writer-facing: `docs/` and tooling notes.

Do not let workflow instructions leak into reader-facing prose.

## Linkage and Naming Discipline

- `index.md` is the manuscript hub.
- Every reader-facing section should be linked from `index.md`.
- When files move or rename, update links immediately.
- Avoid stale references to old filenames.

## Citation and Bibliography Discipline

- Use Pandoc-style footnotes in manuscript files (`[^id]` markers with `[^id]:` definitions).
- Use stable, chapter-scoped semantic IDs (for example `c1-author-work`), not numeric-only IDs.
- Keep footnote markers after punctuation where possible.
- Keep bibliography entries in `back-matter/bibliography.md` synchronized with cited works.
- Use the bibliography/citation workflow in `docs/bibliography-pass.md` during editorial passes.
