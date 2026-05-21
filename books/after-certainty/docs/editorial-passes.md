# After Certainty — Editorial Passes

Focused editing workflow for the grounding branch. Run one pass at a time; complete across the target scope before starting the next.

## Pass order (this branch)

1. **Grounding** — Draft and place 5–8 vignettes; wire into argument flow
2. **Asymmetry** — Vary openings, length, delayed reframe
3. **Cohesion** — Vignettes must not smuggle new moral certainty; preserve revisability
4. **Export** — `make build-book DIR=books/after-certainty`

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

## Pass 4 — Export

**Goal:** Release-ready build.

- `make build-book DIR=books/after-certainty`
- Word count recorded in `docs/status.md` (~11–13k target)
