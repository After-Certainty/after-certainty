# After Certainty — Editorial Passes

Focused editing workflow for the grounding branch. Run one pass at a time; complete across the target scope before starting the next.

## Pass order

1. **Grounding** — Draft and place 5–8 vignettes; wire into argument flow *(complete)*
2. **Asymmetry** — Vary openings, length, delayed reframe *(complete)*
3. **Cohesion** — Vignettes must not smuggle new moral certainty; preserve revisability *(complete)*
4. **Feedback pass 2** — Author drafts incorporated file-by-file *(complete)*
5. **Essay discovery** — Delay thesis at opening; preserve compression at ending; see `docs/agents/01-essay-discovery-revision.md`
6. **Export** — `make build-book DIR=books/after-certainty`

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

## Pass 6 — Export

**Goal:** Release-ready build.

- `make build-book DIR=books/after-certainty`
- Word count recorded in `docs/status.md` (~11–13k target)
