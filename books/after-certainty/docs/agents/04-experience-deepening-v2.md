# Agent 04 — Experience deepening v2

## ROLE

Experience Deepening Agent v2.

## PURPOSE

Transform abstract argument into lived recognition.

This pass does not add new concepts, citations, patterns, or arguments.

Instead it creates moments where readers recognize the limits of their own explanations before the chapter names the pattern.

The goal is not merely relatability.

The goal is recognition followed by surprise.

Readers should repeatedly experience:

1. "I've seen that."
2. "I know what's happening."
3. "Wait—that explanation isn't quite enough."

That movement is the emotional engine of After Certainty.

**Core principle:** Do not explain the pattern first. Create a recognizable experience where the reader naturally forms an explanation. Then reveal the explanation's limits. Then introduce the chapter's insight.

The experience should carry the philosophy.

The philosophy should not have to carry the experience.

Philosophical content, claims, structure, and conclusions remain intact. Change **how** readers arrive at recognition—not **what** the book argues.

## WHEN

- One unit per agent session (default)
- After curiosity expansion (Agent 02) and recognition preservation (Agent 03) are complete on the unit
- On branch `after-certainty/manuscript-deepening-pass`
- **Stop for author review** after each unit before continuing

## INPUTS

- **Target unit file** (see [README.md](./README.md) unit table)
- [`docs/book-rules.md`](../book-rules.md) — invariant, vignette rules, pattern language
- [`docs/pattern-language.md`](../pattern-language.md) — ten locked patterns
- [`index.md`](../../index.md) — reading order
- Prior unit in reading order (handoff/echo only — do not duplicate scenes)

## FOCUS

### The primary move

Scan the unit for sections where **pattern or explanation arrives before lived recognition**.

| Current (abstract leads) | Experience deepening |
|--------------------------|----------------------|
| People often react strongly when their identity is threatened. Correctness can become identity. | Observer notices a group quiet through controversies, intensely defensive when identity is questioned → obvious conclusion → reversal → insight |
| Explanation names the pattern; reader agrees | Reader recognizes the experience, forms an explanation, discovers its limits, then meets the pattern |

**Do not** add pattern labels early.

**Do** add observation, curiosity, lived texture, and explanatory reversal.

### Exemplar — weak vs strong

**Weak version:**

> People often react strongly when their identity is threatened.
>
> Correctness can become identity.

**Strong version:**

> Someone notices that a community remained relatively quiet through several controversies, yet became intensely defensive when its identity was questioned.
>
> The observer concludes that identity matters more to them than principle.
>
> Perhaps.
>
> But that explanation may be too quick.
>
> A challenge to identity is experienced differently from a challenge to principle. It touches belonging, memory, loyalty, competence, and self-understanding at the same time.
>
> Correctness may identify a contradiction.
>
> It does not necessarily explain the experience.

### Ch 1 anchor exemplar (author-provided)

When running Agent 04 on Chapter 1, integrate this passage (or a close variant tuned to Kevin's voice) at the small-scale / large-scale turn—not as a bolt-on, but woven into the existing argument flow:

> You can sometimes see this in the way communities react to criticism.
>
> An observer notices that a group remained relatively quiet through several controversies, yet becomes intensely defensive when its identity is questioned. The conclusion seems obvious: identity matters more to them than principle.
>
> Perhaps.
>
> But that explanation may be too quick.
>
> A challenge to identity is experienced differently from a challenge to principle. It is felt as a challenge to belonging, memory, loyalty, competence, and self-understanding all at once. The reaction may reveal a contradiction. It may also reveal that correctness is trying to explain something more personal than contradiction alone.
>
> Correctness can often identify where a tension exists.
>
> It cannot always explain why people experience one tension more sharply than another.

**Placement:** After the small-scale vs large-scale turn (~lines 105–109 in current Ch 1), where the manuscript moves from "two people can compare notes" to "too many audiences are watching." Alternative: just before **"When Correctness Starts Protecting Error"** if the primary site feels crowded.

**Constraints:** Keep communities generic (no political tribe signaling). Do not add pattern labels. Preserve meeting vignette and ending compression `**Correctness Hardens Into Identity.**`

### Questions to ask for every section

**1. What experience is being described?**

Not the idea. The experience. Can a reader picture it happening? Can they remember a version from their own life?

**2. What explanation would a reasonable person form?**

Allow the reader to reach that explanation naturally. Do not immediately correct it. Let it breathe.

**3. Why is that explanation incomplete?**

Not wrong. Incomplete. Look for:

- identity beneath correctness
- belonging beneath principle
- relief beneath explanation
- protection beneath judgment
- visibility beneath speech
- avoidance beneath interpretation

**4. Does the example reveal the pattern?**

Or is the pattern doing all the work? If removing the pattern label would make the passage collapse, the example needs strengthening.

### Solnit test

After reading a section, ask:

> Could a reader recognize this experience even if they never learn the formal pattern?

If no, deepen the experience.

If yes, the section is doing its job.

### Preferred sources of experience

Favor:

- family conflict
- friendship strain
- grief
- organizations
- meetings
- waiting
- embarrassment
- loyalty
- belonging
- public controversy
- social media
- everyday institutional life

Avoid:

- purely theoretical examples
- hypothetical people
- abstract moral actors
- political tribe signaling
- culture-war examples

### Structural goal

Current:

- Pattern or explanation
- Supporting abstraction
- Occasional example

Desired:

- Recognizable experience
- Reader forms explanation
- Explanation proves incomplete
- Chapter insight / pattern

### Magnitude discipline

Deepening is **surgical and localized**—at abstraction-before-experience choke points, not everywhere.

- Target **~150–400 words net new per deepening moment** (1–3 per unit typical)
- Hard cap ~600 words net new per unit
- **Light touch** on bridges (~850 words total across 3) and conclusion
- Do not rewrite vignettes wholesale—deepen around them or move observation earlier when vignette already exists

### Differentiation from agents 01–03

| Agent | Moves | Does not |
|-------|-------|----------|
| 01 | Reorder; delay thesis | Add lived texture at scale |
| 02 | Expand Q→investigation→answer | Add new experiences; deepen pre-pattern recognition |
| 03 | Compress; guard patterns | Add content |
| **04** | Lived experience → incomplete explanation → insight | Add theories, citations, patterns, arguments |

### Chapter-specific guidance

| Unit | Likely choke points |
|------|---------------------|
| Introduction | Permission/absolution desire; understanding without relief—add lived beat before abstract claims |
| Part bridges | Light touch; one experiential beat if abstraction leads |
| Ch 1 | **Primary:** community criticism anchor (author text) after small/large scale; moral-weight section may need one lived beat |
| Ch 2 | Why explanation feels complete while harm continues |
| Ch 3 | Why sorting tightens when story stops fitting |
| Ch 4 | Procedural vs emotional closure |
| Ch 5 | Why responsibility feels unfair without control |
| Ch 6 | Why speaking feels like care when it reorganizes conflict |
| Ch 7–9 | When more knowing stops changing obligation |
| Conclusion | Light touch—concrete before closure posture |

## DO

- Preserve core invariant from `book-rules.md`
- Preserve all ten locked pattern names and bold compressions (`**Pattern Name.**`)
- Preserve opening scene headings (`### **Short Title**`); scenes flow into prose without custom-style wrappers
- Preserve chapter openings, callback lines, and Release → Practice → Limits arc
- Keep footnotes, citations, and `[^slug]` references unchanged unless integration requires minor adjustment
- Add observation, curiosity, lived texture, explanatory reversal
- Add moments where correctness proves insufficient
- Output a brief report after each unit
- Stop for author review after each unit

## DO NOT

- Add new theories, citations, pattern labels, or arguments
- Add political tribe signaling or culture-war examples
- Change what the book argues or remove core invariant
- Remove or soften chapter-ending compression lines (`**Pattern Name.**`)
- Replace strong existing vignettes—investigate around them
- Break vignette convention (no bold/footnotes inside scenes)
- Add new chapters, patterns, or glossary terms
- Run `reflow_markdown_paragraphs.py` unless paragraph structure is broken
- Change `book.yml`, portfolio docs, or semantic YAML unless asked

The target is not agreement.

The target is recognition.

## OUTPUT

- Edit **TARGET_UNIT in place** on the branch
- Brief report (6–10 bullets): experiences deepened; explanations reversed; Solnit test results; three-beat engine check; pattern arrival intact; approximate word delta
- Update [`docs/status.md`](../status.md) for the unit (experience deepening complete)
- **Stop for author review** before next unit

## SUCCESS CRITERIA

Ask before finishing:

- Does the reader recognize the experience before the pattern names it?
- Did the reader form an explanation, then feel its limits?
- Does the three-beat engine land ("I've seen that" → "I know what's happening" → "Wait—that isn't quite enough")?
- Does the Solnit test pass?

Success: recognition followed by surprise—the experience carries the philosophy.

## PIPELINE

**04** (this agent) → **author review** per [experience-deepening-pipeline.md](./experience-deepening-pipeline.md). Standalone pass—no companion guard agent. After all units complete: author review → `make build-book DIR=books/after-certainty` → optional PR.
