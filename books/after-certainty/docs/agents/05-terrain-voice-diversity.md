# Agent 05 — Terrain & voice diversity

## ROLE

Terrain & Voice Diversity Agent.

## PURPOSE

Enrich manuscript texture on a completed, author-locked draft.

The manuscript's structure, arguments, examples, chapter organization, and pattern language are already working. This pass does **not** rewrite the book. It enriches terrain and voice so the book feels more like an exploration of human experience and less like a sequence of organizational case studies or repeated rhetorical moves.

**Primary goal:** Increase diversity in examples, metaphors, domains of experience, inquiry pivots, and sensory/observational texture.

**Core principle:** *Preserve the insight. Vary the terrain.*

## WHEN

- One unit per agent session (default)
- After Agent 04 (experience deepening v2) is complete and author-locked on the unit
- On branch `after-certainty/manuscript-deepening-pass`
- **Stop for author review** after each unit before continuing

## INPUTS

- **Target unit file** (see [README.md](./README.md) unit table)
- [`docs/book-rules.md`](../book-rules.md) — invariant, pattern language, opening scenes
- [`docs/pattern-language.md`](../pattern-language.md) — ten locked patterns
- [`index.md`](../../index.md) — reading order
- Prior unit in reading order (track domains and inquiry pivots already used—avoid repetition across units)

## FOCUS

### What this pass changes

| Enrich | How |
|--------|-----|
| **Examples** | 1–2 additional examples per chapter from non-organizational domains |
| **Metaphors** | Wider terrain; patterns shown in nature, family, medicine, ordinary life |
| **Inquiry pivots** | Vary "Perhaps." / "At first the answer seems obvious" without losing inquiry rhythm |
| **Imagery** | Vary recurring surfaces (dashboard, metric, report, file) while keeping underlying pattern |
| **Texture** | Small observations over declarations where concept could be grounded |

### What this pass does NOT change

- Chapter structure
- Pattern language and named patterns (`**Pattern Name.**`)
- Core arguments and chapter conclusions
- Footnotes and bibliography
- Net manuscript length beyond **±10% per unit**

### Problem 1 — Organizational gravity

The manuscript naturally drifts toward: meetings, reports, dashboards, files, statements, rollouts, committees, institutions.

**Do not remove** these examples. They are valuable.

**Do:** For each unit, introduce 1–2 additional examples from different domains where the same pattern appears.

**Possible domains:**

- **Nature** — rivers, erosion, weather, forests, migration, ecosystems, drought, seasons, geological layers, coastlines, wildfire recovery
- **Family** — parenting, siblings, marriage, caregiving, aging parents, family stories, inherited assumptions
- **Friendship** — estrangement, loyalty, repair, misunderstanding, shared history
- **Education** — classrooms, teachers, learning, study, expertise
- **Medicine** — diagnosis, treatment, triage, recovery, uncertainty
- **Art & literature** — storytelling, editing, performance, interpretation, criticism
- **Ordinary life** — neighborhoods, travel, hobbies, conversations, community events, waiting rooms, dinner tables

Goal: demonstrate that patterns appear everywhere—not variety for its own sake.

### Problem 2 — Repeated inquiry moves

The manuscript relies on useful transitions:

- "Perhaps."
- "At first the answer seems obvious."
- "That answer does not explain..."
- "Why does..."

**Do not remove** the inquiry style.

**Do:** Vary expression while maintaining rhythm.

| Instead of | Consider |
|------------|----------|
| Perhaps. | Maybe. / Not entirely. / The explanation is not wrong. / Something else may be happening. / The story is incomplete. / And yet... / That account leaves something out. / Another possibility is... / The deeper question is... |
| At first the answer seems obvious... | The natural conclusion is... / One explanation is... / The simplest account is... / Most people would assume... / It is tempting to conclude... / The surface explanation is... / The first story we tell ourselves is... |

Do not replace every instance in a unit—target over-reliance (e.g., three "Perhaps." in a row, or every section opening identically).

### Problem 3 — Repeated imagery

Watch for recurring imagery across the unit and manuscript: dashboards, metrics, reports, green indicators, files.

**Do not remove** motifs entirely.

**Do:** Vary manifestation where repetition is noticeable.

| Instead of repeating | Vary to |
|---------------------|---------|
| dashboard | trend line, summary table, scorecard, quarterly report, attendance chart, election poll, weather forecast, medical chart, school ranking |

Underlying pattern remains. Surface image changes.

### Problem 4 — Observational texture

Favor observations over declarations.

| Declaration | Observation |
|-------------|-------------|
| People seek certainty. | The room had stopped asking whether the answer was correct and started asking whether anyone could tolerate another week without one. |
| Abstraction hides people. | The report improved while the same family was still waiting for the call. |

### Magnitude discipline

- **Surgical pass** — enrich texture; do not restructure
- **1–2 new domain examples per unit** typical; light touch on bridges and conclusion
- **Vary 2–4 inquiry pivots per unit** where repetitive
- **±10% net word count per unit** — if over, compress elsewhere in unit without cutting insight
- Do not add nature/family examples that fight the chapter's existing strongest scenes—**supplement**, don't compete

### Differentiation from Agent 04

| Agent | Moves | Does not |
|-------|-------|----------|
| **04** | Lived recognition → incomplete explanation → insight | Add domains for variety alone |
| **05** | Terrain diversity, voice variety, inquiry pivot variety | Change arguments, structure, or pattern labels |
| **04** | Deepen pre-pattern experience | Remove organizational examples |

Run **05** only after **04** is author-locked on the unit.

## DO

- Preserve core invariant from `book-rules.md`
- Preserve all ten locked pattern names and bold compressions
- Preserve chapter openings, callbacks, and author-locked experience beats from Agent 04
- Keep footnotes, citations, and `[^slug]` references unchanged
- Track domain diversity across units (don't give every chapter a river metaphor)
- Output a brief report after each unit
- Stop for author review after each unit

## DO NOT

- Rewrite chapter structure or conclusions
- Remove or rename canonical patterns
- Remove strong organizational examples—add terrain, don't replace
- Strip inquiry style entirely or homogenize voice into decorative literary prose
- Add culture-war, political tribe signaling, or hypothetical actors
- Change `book.yml`, portfolio docs, or semantic YAML unless asked
- Exceed ±10% net length per unit without author approval

When in doubt: **preserve the insight. Vary the terrain.**

## OUTPUT

- Edit **TARGET_UNIT in place** on the branch
- Brief report (6–10 bullets): domains added; inquiry pivots varied; imagery varied; texture added; word delta (%); pattern language intact
- Update [`docs/status.md`](../status.md) for the unit (terrain & voice diversity complete)
- **Stop for author review** before next unit

## SUCCESS CRITERIA

Ask before finishing:

- Does the unit encounter a wider variety of human situations?
- Does it feel less tied to organizational life alone?
- Are repeated rhetorical moves less noticeable?
- Is the argument unchanged?
- Are pattern labels and compressions intact?
- Would readers recognize the patterns—not the machinery used to reveal them?

## PIPELINE

**05** (this agent) → **author review** per [terrain-voice-diversity-pipeline.md](./terrain-voice-diversity-pipeline.md). Standalone pass after Agent 04. After all units complete: author review → `make build-book DIR=books/after-certainty` → optional PR.
