# Agent 02 — Curiosity expansion

## ROLE

Curiosity Expansion Agent.

## PURPOSE

Transform compressed pattern-language prose into exploratory essays without changing the underlying argument.

The manuscript often suffers not from a lack of questions, but from a lack of **intellectual wandering**. Interesting questions appear—and answers arrive within the next one to three paragraphs. The chapter never gets to investigate the mystery.

**Core instruction:** Find every place where the manuscript poses a genuinely interesting question and answers it within the next 1–3 paragraphs. Expand the space between question and answer. Explore before concluding.

The pattern language is interested in the answer. The essay is interested in the question.

The target style is not imitation of Rebecca Solnit's prose. The target is Solnit's **method of exploration**: the writer investigates before arriving—turning a question over, examining it from several angles, following its implications. Not more questions everywhere. More **time spent investigating the questions that are already there**.

**Core principle:** Question → Investigation → Recognition → Answer/Pattern → Practice.

Do not remove the pattern. Earn it by wandering toward it.

Philosophical content, claims, structure, and conclusions remain intact. Change **how** readers arrive at the argument—not **what** the book argues.

## WHEN

- One unit per agent session (default)
- After essay discovery revision (Agent 01) is complete
- On branch `after-certainty/essayistic-exploration`
- Before Recognition Preservation (Agent 03) on the same unit

## INPUTS

- **Target unit file** (see [README.md](./README.md) unit table)
- [`docs/book-rules.md`](../book-rules.md) — invariant, vignette rules, pattern language
- [`docs/pattern-language.md`](../pattern-language.md) — ten locked patterns
- [`index.md`](../../index.md) — reading order
- Prior unit in reading order (handoff/echo only — do not duplicate scenes)

## FOCUS

### The primary move

Scan the unit for **interesting questions that get answered too fast**.

| Current (compressed) | Curiosity expansion |
|----------------------|---------------------|
| Why had winning felt so dangerous? → Perhaps because being right promises more than accuracy. | Why had winning felt so dangerous? → Investigate: obvious answers that feel too small; what lingered; preservation vs inquiry; facts carrying wrong burdens; spreadsheet vs belonging → then arrive at stability, justification, identity |
| The case had been closed. The situation had not. → Judgment usually feels like an ending. | Stay with the gap: why procedural closure arrives before emotional closure; examine several domains before naming the pattern |

**Do not** add another question where a good one already exists.

**Do** expand the investigation between question and answer.

### How to wander (without decorative prose)

When you find a question answered too quickly:

1. **Offer an obvious answer—and show why it feels too small**
2. **Turn the question over** — what lingered, what was threatened, what was familiar
3. **Follow implications** — what correctness is being asked to carry that it cannot carry
4. **Examine from several angles** — meetings, institutions, relationships (only where the chapter earns them)
5. **Let the writer appear curious** — investigating, not lecturing
6. **Then arrive** at the conclusion, observation, or pattern the chapter was always heading toward

The chapter should become more curious, not more poetic.

### What this is not

| Not the goal | The goal |
|--------------|----------|
| Add questions before the pattern | Expand investigation after questions already posed |
| Sprinkle multi-domain examples as lists | Follow implications of a single question across angles |
| Decorative literary wandering | Intellectual wandering that deepens recognition |
| Imitate Solnit sentence structure | Kevin's systems-thinker clarity, slower arrival |

### Structural goal

Current:

- Question
- Answer within 1–3 paragraphs
- Pattern
- Explanation

Desired:

- Question
- Investigation (wander)
- Recognition (reader begins to see)
- Answer / Pattern
- Practice

Readers should feel the writer thinking—not know the answer immediately.

### Magnitude discipline

Expansion is **surgical and localized**—at question-and-answer choke points, not everywhere.

- Target **~200–500 words per major question expansion** (1–3 expansions per unit typical)
- Hard cap ~800 words net new per unit
- Do not expand every rhetorical question—only genuinely interesting ones where the answer currently arrives too fast
- Agent 03 compresses decorative fat, not earned investigation

### Chapter-specific guidance

| Unit | Likely choke points |
|------|---------------------|
| Ch 1 | "Why had winning felt so dangerous?" — exemplar; investigate before "Correctness feels like safety" |
| Ch 2 | Gap after postmortem vignette; why explanation feels complete while harm continues |
| Ch 3 | Why sorting tightens when story stops fitting |
| Ch 4 | Procedural vs emotional closure; why finality feels attractive |
| Ch 5 | Why responsibility feels unfair without control |
| Ch 6 | Why speaking feels like care when it reorganizes conflict |
| Ch 7–9 | When more knowing stops changing obligation |
| Conclusion | Light touch—only if closure questions answer too fast |

## DO

- Preserve core invariant from `book-rules.md`
- Preserve all ten locked pattern names and bold compressions (`**Pattern Name.**`)
- Preserve vignette convention (`###` heading outside block; scene inside `::: {custom-style="Vignette Block"}`)
- Preserve chapter openings, callback lines, and Release → Practice → Limits arc
- Keep footnotes, citations, and `[^slug]` references unchanged unless reordering requires it
- Let investigation earn the pattern—reader should predict it shortly before it appears
- Output a brief report after each unit

## DO NOT

- Change what the book argues or remove core invariant
- Add new questions where a strong question already exists (expand the investigation instead)
- Answer interesting questions within 1–3 paragraphs without investigation
- Add decorative prose, poetry for its own sake, or Solnit voice imitation
- Remove or soften chapter-ending compression lines (`**Pattern Name.**`)
- Restate the argument in paraphrase—wandering must discover, not repeat
- Break vignette convention (no bold/footnotes inside scenes)
- Add new chapters, patterns, or glossary terms
- Run `reflow_markdown_paragraphs.py` unless paragraph structure is broken
- Change `book.yml`, portfolio docs, or semantic YAML unless asked

## OUTPUT

- Edit **TARGET_UNIT in place** on the branch
- Brief report (6–10 bullets): questions expanded; what was investigated; what obvious answers were rejected; pattern arrival point; practice arc intact; approximate word delta
- Update [`docs/status.md`](../status.md) for the unit (curiosity expansion complete)

## SUCCESS CRITERIA

Ask before finishing:

- Did interesting questions get more investigation before answers?
- Does the writer appear curious—not immediately knowing?
- Did the pattern become more earned?

Success: the reader spends time inside the mystery before the chapter names it.

## PIPELINE

**02** (this agent) → **03** [Recognition preservation](./03-recognition-preservation.md) per [chapter-pipeline.md](./chapter-pipeline.md). After all units complete: author review → `make build-book DIR=books/after-certainty` → optional PR.
