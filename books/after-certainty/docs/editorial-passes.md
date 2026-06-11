# After Certainty — Editorial Passes

Focused editing workflow for the grounding branch. Run one pass at a time; complete across the target scope before starting the next.

## Pass order

1. **Grounding** — Draft and place 5–8 vignettes; wire into argument flow *(complete)*
2. **Asymmetry** — Vary openings, length, delayed reframe *(complete)*
3. **Cohesion** — Vignettes must not smuggle new moral certainty; preserve revisability *(complete)*
4. **Feedback pass 2** — Author drafts incorporated file-by-file *(complete)*
5. **Essay discovery** — Delay thesis at opening; preserve compression at ending; see `docs/agents/01-essay-discovery-revision.md` *(complete)*
6. **Curiosity expansion** — Expand intellectual wandering between interesting questions and their answers; see `docs/agents/02-curiosity-expansion.md`
7. **Recognition preservation** — Protect recognitions and pattern prominence; compress over-expansion; see `docs/agents/03-recognition-preservation.md`
8. **Export** — `make build-book DIR=books/after-certainty`

## Pass 1 — Grounding

**Goal:** Add recognition anchors so readers inhabit institutions, speech, and responsibility—not only analyze them.

Check for:

- Each vignette connects to the chapter stabilizer/distortion
- Scene inside `::: {custom-style="Vignette Block"}`; heading outside
- 150–400 words; varied length and texture across chapters
- Analysis stays outside vignette blocks
- No bold or glossary terms inside scene text

## Pass 2 — Asymmetry

**Goal:** Break predictable chapter rhythm without losing calm moral posture.

Check for:

- At least one chapter opens with a concrete scene (Ch 5)
- At least one chapter is shorter/sharper (Ch 1)
- At least one section holds tension before reframing (Ch 6)
- Ch 2 and Ch 9: minimal structural change beyond vignette placement

## Pass 3 — Cohesion

**Goal:** Preserve intellectual discipline from beta feedback.

Check for:

- Vignettes show restraint, proportionality, incompletion—not new prescriptions
- Core invariant unchanged in every chapter
- Strong hinge lines in Ch 2 and Ch 9 preserved in meaning

## Pass 5 — Essay discovery

**Goal:** Arguments feel discovered rather than announced—without changing claims, structure, or conclusions.

Check for:

- Openings begin with observation, scene, or situation before naming the thesis (3–4 paragraphs, not pages)
- Existing vignettes moved earlier when they carry the insight
- Abstractions earned through observations, not eliminated
- Bold pattern compressions at chapter endings preserved (`**Pattern Name.**`)
- Surgical pass only (~20% more discovery); no literary wandering or memoir drift

Spec: [`docs/agents/01-essay-discovery-revision.md`](agents/01-essay-discovery-revision.md)

## Pass 6 — Curiosity expansion

**Goal:** Expand intellectual wandering between interesting questions and their answers without changing the underlying argument.

Check for:

- Interesting questions no longer answered within 1–3 paragraphs
- Investigation before conclusion (obvious answer rejected, implications followed)
- Writer appears curious—investigating, not lecturing
- Patterns earned through wandering (`**Pattern Name.**`)
- Localized expansion at question-and-answer choke points (~200–500 words per expansion)

Spec: [`docs/agents/02-curiosity-expansion.md`](agents/02-curiosity-expansion.md)

## Pass 7 — Recognition preservation

**Goal:** Exploration deepens recognitions without burying pattern language.

Check for:

- Recognition clearer and deeper than before Agent 02
- Pattern feels discovered and remains memorable
- Over-expansion cut (30% compression test)
- No repetition through wandering
- Kevin's voice preserved — not literary essayist drift

Spec: [`docs/agents/03-recognition-preservation.md`](agents/03-recognition-preservation.md)

## Pass 8 — Export

**Goal:** Release-ready build.

- `make build-book DIR=books/after-certainty`
- Word count recorded in `docs/status.md` (from build manifest)
