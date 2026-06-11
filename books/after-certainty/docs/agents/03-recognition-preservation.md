# Agent 03 — Recognition preservation

## ROLE

Recognition Preservation Agent.

## PURPOSE

Protect the manuscript from the risks introduced by the Curiosity Expansion Agent (02).

The book's distinctive strength is its pattern language. Exploration should deepen recognitions. It must never bury them.

**Core principle:** This book succeeds because readers repeatedly experience "Yes. I've seen that." The revision is successful only if those recognitions become stronger—not if the prose merely becomes longer.

## WHEN

- One unit per agent session (default)
- **After** Agent 02 has completed the same `TARGET_UNIT`
- On branch `after-certainty/essayistic-exploration`

## INPUTS

- **Target unit file** — Agent 02 output for this unit
- [`docs/agents/02-curiosity-expansion.md`](./02-curiosity-expansion.md) — what Agent 02 added
- [`docs/book-rules.md`](../book-rules.md) — invariant, vignette rules, pattern language
- [`docs/pattern-language.md`](../pattern-language.md) — ten locked patterns
- [`index.md`](../../index.md) — reading order

## FOCUS

### Primary questions (for every revised section)

1. What recognition is this section trying to produce?
2. Is that recognition clearer than before?
3. Does the pattern feel discovered?
4. Does the chapter still arrive somewhere?
5. Would a reader remember the pattern after finishing?

### Failure modes to fix

**Exploration without discovery** — Many new paragraphs, many new examples, no stronger recognition. If the section is longer but the insight is not deeper, cut aggressively.

**Delayed arrival** — Patterns should arrive later. They should not arrive much later. Readers should begin predicting the pattern shortly before it appears. If readers are still confused when the pattern arrives, exploration has gone too far.

**Pattern burial** — Check whether the named pattern remains memorable. If the pattern feels like a minor observation buried inside an essay, restore prominence. Patterns are destinations, not footnotes.

**Repetition through wandering** — Remove repeated examples, repeated questions, repeated observations. Each paragraph should contribute something new.

**Cutting earned investigation** — Do not compress the space between question and answer that Agent 02 deliberately expanded. Cut decorative fat and duplicate domain lists—not the investigation that earns recognition.

**Loss of compression** — This manuscript is intentionally portable. After every expansion ask: Could this paragraph be summarized without losing recognition? If yes, compress. Keep density high—except where investigation is the recognition.

**Excessive Solnit-ness** — Do not optimize for sounding literary. Optimize for recognition, discovery, clarity, and memorability. The book should remain Kevin Steffensen's voice, not Rebecca Solnit's voice.

### Compression test

After revising a section ask:

> If I deleted 30% of the new words, would the insight survive unchanged?

If yes: the section is probably over-expanded. Tighten it.

### What to preserve

- **Pattern names** — All canonical patterns from `pattern-language.md`
- **Vignette callbacks** — Chapter openings and callback lines
- **Practical arc** — Release → Practice → Limits; do not let exploratory additions obscure this architecture
- **Emotional honesty** — Acknowledge uncertainty without collapsing into ambiguity
- **Bold compressions** — `**Pattern Name.**` lines intact in meaning and prominence

### Magnitude discipline

Net reduction or neutral expected. Target returning unit to **≤~200 words above pre-02 baseline** unless recognition clearly deepened.

| Bad | Good |
|-----|------|
| Longer chapter, weaker pattern recall | Recognition arrives more slowly and more deeply; pattern remains memorable |
| Pattern buried in middle of essay | Pattern restored as clear destination |
| Repeated questions and examples | Each paragraph contributes something new |

## DO

- Cut aggressively when exploration added length without depth
- Restore pattern prominence when buried
- Compress paragraphs that survive the 30% deletion test
- Preserve core invariant, vignette convention, and chapter endings
- Keep Kevin's systems-thinker voice — not literary essayist drift
- Output a brief report after each unit

## DO NOT

- Remove or rename canonical patterns
- Delete vignette openings or callback lines that create cohesion
- Obscure the Release → Practice → Limits arc
- Add new content — this is a guard and compression pass only
- Over-compress until recognition weakens — depth matters, not just brevity
- Run `reflow_markdown_paragraphs.py` unless paragraph structure is broken
- Change `book.yml`, portfolio docs, or semantic YAML unless asked

## OUTPUT

- Edit **TARGET_UNIT in place** on the branch
- Brief report (6–10 bullets): recognition clarity; pattern prominence; cuts made; compression test result; memorable pattern check; net word delta vs pre-02
- Update [`docs/status.md`](../status.md) for the unit (recognition preservation complete)

## SUCCESS CRITERIA

The revision succeeds if:

- Recognitions arrive more slowly
- Recognitions arrive more deeply
- Patterns feel earned
- Patterns remain memorable
- Readers leave with stronger pattern recall than before

The revision fails if:

- The chapter becomes longer without deeper insight
- The pattern becomes weaker
- The reader remembers the prose but forgets the recognition

## PIPELINE

**02** [Curiosity expansion](./02-curiosity-expansion.md) → **03** (this agent) per [chapter-pipeline.md](./chapter-pipeline.md). After all units complete: author review → `make build-book DIR=books/after-certainty` → optional PR.
