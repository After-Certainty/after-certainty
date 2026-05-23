# Before Certainty Arrives — Editorial Passes

Focused editing workflow for the editorial grounding branch. One pass at a time; complete scope before starting the next.

## How to use

- Pick scope: single chapter, one part, or full manuscript.
- Run one pass only.
- Update [`grounding-pass-checklist.md`](grounding-pass-checklist.md) as units complete.
- Do not mix passes (no rhythm edits during anchor pass).

## Pass order (grounding branch)

1. **Historical grounding anchors** — 1–3 concrete anchors per chapter (50–120 words each); footnoted.
2. **Chapter identity** — Sharpen central transformation; reduce Ch 2–4 and Ch 9–10 overlap.
3. **Prose rhythm** — Break uniform cadence in ≥3 chapters; expectation reversals; asymmetric openings.
4. **Pattern embodiment** — Intro three patterns; ≤1 bold surfacing per chapter when earned; motif callbacks.
5. **Escalation / repetition** — Cut or deepen recurring phrases; attach new historical consequence.
6. **Citations** — Footnotes + bibliography sync.
7. **Export** — `make build-book`; word count; author gate checklist.

## Pass 1 — Historical grounding anchors

**Goal:** Historical friction without pop-history length.

Check for:

- 1–3 anchors per chapter inline in prose
- Specific place, object, or practice (stele, scriptorium, punch clock)
- Footnote for verifiable claims
- Anchor serves chapter identity and dominant pattern

Edit moves:

- Insert 50–120 word anchor after structural claim or before section break
- Prefer material objects (stone code, census tablet, factory bell)

## Pass 2 — Chapter identity

**Goal:** Each chapter has one unmistakable transformation.

Check for:

- Ch 4 = authority without presence / action–consequence distance
- Ch 6 = material permanence (stone → scroll → archive → office)
- Ch 2 = coordination geometry; Ch 3 = legitimacy transfer
- Ch 9 = procedure; Ch 10 = saturation without re-explaining industry

## Pass 3 — Prose rhythm

**Goal:** Reduce metabolic exhaustion from uniform abstraction.

Check for:

- At least Ch 4, 6, 9 break default opening cadence
- 1–2 expectation-reversal lines per chapter (model: Ch 7 "Collapse does not create openness")
- One short rupturing sentence after long explanatory paragraph
- Trailing `\` line breaks removed in revised prose

## Pass 4 — Pattern embodiment

**Goal:** Memory scaffold without academic framing.

Check for:

- Introduction: quiet three-pattern block; one scaffold (not parallel lists)
- Dominant pattern per chapter (see [`pattern-language.md`](pattern-language.md))
- ≤1 bold pattern surfacing per chapter, prose-first
- Ch 4, 6, 9: action/consequence distance callback in closing bridge
- Conclusion: Pattern 3 recognition + deliberate stop

Avoid:

- Fourth named pattern
- Pattern headers per chapter
- Excessive capitalization

## Pass 5 — Escalation

**Goal:** Advance, don't restate.

Watch phrases:

- "certainty compresses ambiguity"
- "coordination under scale"
- "tools outlive conditions"
- "stabilization under pressure"

Focus: Ch 2–4, 9–10.

## Pass 6 — Citations

- `[^cN-slug]` chapter-scoped IDs
- Every new source in `back-matter/bibliography.md`
- No fabricated references

## Pass 7 — Export

```bash
make build-book DIR=books/before-certainty-arrives
make validate-book-specs
```

Update `status.md` word count; refresh `author-read-through-gate.md` checklist.

## Pass 8 — Tighten and trust

**Goal:** Subtract repetition; let patterns resonate without restating; trust the reader earlier.

Check for:

- ≤5 isolated bold pattern surfacings book-wide (see tier rules in `pattern-language.md`)
- Ch 10: no triple-explanation clusters
- Chapter endings: not all "next chapter / carries forward / pattern reassert"
- Net word count flat or down

Edit moves:

- Embed pattern names in prose where bold feels tagline-ish
- Cut bridge closings; end on image, tension, or silence
- Remove meta "This chapter…" and "Later chapters will trace…" where redundant

See [`feedback-pass-tighten-2026.md`](feedback-pass-tighten-2026.md).

## Pass 9 — Final prose polish

**Goal:** Publishable subtraction — double-landing trim, asymmetric endings, cadence variation. No new content.

Check for:

- Ch 8–10: insight not stated twice in same paragraph cluster
- Endings stop on image/tension (Ch 7 "It held." model)
- ~30% fewer "This is not X / It is Y" inversions in Part III
- Net word count ~8.6–9.2k

See [`feedback-pass-final-2026.md`](feedback-pass-final-2026.md).

## Pass 10 — Publishability micro-pass

**Goal:** Final reader feedback — Ch 8–10 subtraction, Ch 5→6 atmospheric bridge, cadence smoothing. No new content.

Check for:

- Ch 5 closing bridge to Ch 6 (matter / stone / scroll)
- Ch 8–10: net ~10% further trim; no double-landing clusters
- Part III: fewer visible "This is not X / It is Y" inversions
- Endings preserved: Ch 7, Ch 9, Ch 10 restraint

See [`feedback-pass-publishable-2026.md`](feedback-pass-publishable-2026.md).

## Pass 11 — Transition pass

**Goal:** One concrete image or atmospheric beat at chapter hinges; no framework re-explanation.

Check for:

- Ch 6→7, 7→8, 8→9, 9→10: sensory continuity before next abstraction
- Preserve Ch 7 **It held.**, Ch 9 **costs no longer invisible**, Ch 10 deliberate stop
- Net word count flat or slightly up (~50–120 words added)

See [`feedback-pass-transitions-2026.md`](feedback-pass-transitions-2026.md).

## Pass 12 — Grounding imagery

**Goal:** One brief physical anchor per thin abstraction stretch; concrete + structural insight coexist.

Check for:

- Ch 1–3, 4–6, 8–10: 40–70 word anchors where compression/coordination stacks without texture
- No new narrative detours; footnotes only when verifiable claim requires
- Preserve praised openings, closings, and Ch 10 restraint

See [`feedback-pass-grounding-2026.md`](feedback-pass-grounding-2026.md).

## Pass 13 — Inhabited history

**Goal:** One experiential beat (fear, exhaustion, hunger, belonging, relief, dependency) before abstraction lifts; history feels inhabited without memoir.

Check for:

- Ch 2–3, 5, 7–10: human stake after physical anchor, before theory
- Preserve praised closings and Ch 10 restraint
- Net +150–250 words; no new footnotes unless required

See [`feedback-pass-inhabited-2026.md`](feedback-pass-inhabited-2026.md).

## Pass 14 — Refinement

**Goal:** Phrase variation (~10–15%), lighter citation cadence in narrative sections, Ch 10 threshold atmosphere.

Check for:

- Vary legible / stabilize / compression-under-pressure without losing pattern language
- Remove inline footnotes where prose already carries the claim
- Ch 10: saturation, exhaustion, procedural dependency, ambient distrust — no new argument

See [`feedback-pass-refinement-2026.md`](feedback-pass-refinement-2026.md).

## Pass 15 — Cadence and hinge

**Goal:** Ground abstraction spikes; Ch 3→4 and Ch 6→7 atmosphere; vary "not because X, but because Y."

See [`feedback-pass-cadence-2026.md`](feedback-pass-cadence-2026.md).

## Pass 16 — Breathing room

**Goal:** Vary pacing and sentence texture; reduce uniformly aphoristic cadence without weakening compression.

See [`feedback-pass-breathing-2026.md`](feedback-pass-breathing-2026.md).

## Pass 17 — Narrative breathing

**Goal:** Longer narrative passages, concrete scenes, tonal relaxation between conceptual peaks.

See [`feedback-pass-narrative-2026.md`](feedback-pass-narrative-2026.md).

## Pass 18 — Observe-before-compress

See [`feedback-pass-observe-2026.md`](feedback-pass-observe-2026.md).

## Pass 19 — Late-stage structural

**Goal:** Six-category feedback — longer historical immersion, phenomenological depth, epistemic humility, embodied modern scenes; reduce pattern-demonstration feel in Ch 2–4 and 8–10.

See [`feedback-pass-late-stage-2026.md`](feedback-pass-late-stage-2026.md).

## Pass 20 — Dimensionality and recovery

**Goal:** Spread compression stacks in Introduction, How to Read, Ch 1–2, Ch 10, Conclusion; deepen Ch 9 embodiment; accumulate before concluding.

See [`feedback-pass-dimensionality-2026.md`](feedback-pass-dimensionality-2026.md).

## Pass 21 — Decompression

**Goal:** Prose-level decompression in Introduction, Ch 9–10, Conclusion; procedural scenes over sociological abstraction.

See [`feedback-pass-decompression-2026.md`](feedback-pass-decompression-2026.md).

## References

- [`book-rules.md`](book-rules.md)
- [`pattern-language.md`](pattern-language.md)
- [`beta-reader-feedback-editorial-2026.md`](beta-reader-feedback-editorial-2026.md)
- [`feedback-pass-tighten-2026.md`](feedback-pass-tighten-2026.md)
- [`feedback-pass-final-2026.md`](feedback-pass-final-2026.md)
- [`feedback-pass-publishable-2026.md`](feedback-pass-publishable-2026.md)
- [`feedback-pass-transitions-2026.md`](feedback-pass-transitions-2026.md)
- [`feedback-pass-grounding-2026.md`](feedback-pass-grounding-2026.md)
- [`feedback-pass-inhabited-2026.md`](feedback-pass-inhabited-2026.md)
- [`feedback-pass-refinement-2026.md`](feedback-pass-refinement-2026.md)
- [`feedback-pass-cadence-2026.md`](feedback-pass-cadence-2026.md)
- [`feedback-pass-breathing-2026.md`](feedback-pass-breathing-2026.md)
- [`feedback-pass-narrative-2026.md`](feedback-pass-narrative-2026.md)
- [`feedback-pass-observe-2026.md`](feedback-pass-observe-2026.md)
- [`feedback-pass-late-stage-2026.md`](feedback-pass-late-stage-2026.md)
- [`feedback-pass-dimensionality-2026.md`](feedback-pass-dimensionality-2026.md)
- [`feedback-pass-decompression-2026.md`](feedback-pass-decompression-2026.md)
- [`grounding-pass-checklist.md`](grounding-pass-checklist.md)
