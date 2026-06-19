# Agent 07 — Echo pass

## ROLE

Echo pass agent.

## PURPOSE

Resolve **repeated phrasing, claims, cases, and mechanism explanations** within *After Certainty* and against **cluster siblings**—so readers feel progression from release → practice → limits, not the same sermon retold.

**Core principle:** *Assign ownership. Point, don't repeat.*

## WHEN

- After Agent 06 (terrain thematic deepening) is complete on all reading-order units
- On branch `after-certainty/manuscript-deepening-pass` (same branch as Agents 04–06)
- Full manuscript in one session, or sequential by part if author prefers
- **Stop for author review** after pass (or after each part if split)

## INPUTS

- All units in [`index.md`](../../index.md) reading order
- [`docs/book-rules.md`](../book-rules.md) — invariant, pattern language
- [`docs/pattern-language.md`](../pattern-language.md)
- [`docs/status.md`](../status.md)
- Cluster skim (titles + invariant paragraphs):
  - [`books/how-meaning-moves/`](../../../how-meaning-moves/)
  - [`books/when-interpretation-no-longer-matters/`](../../../when-interpretation-no-longer-matters/)
  - [`books/when-incentives-become-the-moral-language/`](../../../when-incentives-become-the-moral-language/)
  - [`books/why-collaboration-is-so-hard/`](../../../why-collaboration-is-so-hard/)

## MANUSCRIPT OWNERSHIP

| Layer | Owns |
|-------|------|
| **Introduction** | Phenomenon; absolution discovery; what understanding was asked to do |
| **Part bridges** | Handoff between movements—no chapter case retelling |
| **Part I** | Correctness, explanation, heroes/villains (release) |
| **Part II** | Judgment, responsibility, speech (practice) |
| **Part III** | Not knowing, scale, when to stop interpreting (limits) |
| **Conclusion** | Synthesis and image return—**points** to chapters; does not re-argue them |
| **Appendix** | Field guide—tabular; no re-narration of chapters |

## WITHIN-BOOK ECHO TYPES

| Echo type | Action |
|-----------|--------|
| Same **sentence verbatim** in intro + conclusion | Conclusion **points**; intro keeps canonical formulation |
| Same **beat twice in one chapter** | Keep strongest; compress or vary second |
| Same **refrain** 3+ times in one unit | Keep opening + payoff; vary middle instances |
| Same **case** in adjacent chapters | Keep strongest terrain; vary angle |
| **Bridge** re-teaches introduction | Handoff only |
| **Conclusion callbacks** misname scenes | Align wording with chapter anchors |
| **Pattern label** re-defined every section | Apply pattern; do not re-teach definition |

## INTENTIONAL ECHOES (preserve)

- Ch 5 Tuesday/kitchen anchor (do not thin)
- Ch 8 "read sideways when the dashboard turned green"
- Ch 9 fifth-meeting threshold; family pattern
- Ch 6 "care in the document did not survive the trip" (once per chapter max at full phrase)
- Conclusion image return (daughter/Tuesday, room, signature)—must match Ch 4/5/6/9
- Ch 4 "case closed / situation had not" bookends

## CLUSTER BOUNDARIES

| Sibling | They own | This book owns |
|---------|----------|----------------|
| How Meaning Moves | Signal, compression between speakers | **Practice** after diagnosis |
| Interpretation No Longer Matters | Authority when public interpretation fails | **How to live and judge** under limits |
| Incentives as Moral Language | Metrics replacing judgment | **Stabilizers and disciplines** once certainty weakens |
| Collaboration Is So Hard | Coordination under diffuse ownership | **Capstone**—not structural diagnosis of teams |

Do not re-argue sibling books at chapter length. One-sentence cluster orientation in intro/how-to-read is enough.

## DO

- Prefer **cutting** or **pointing** over synonym swapping
- ±3% net length per unit (trim redundant echo)
- Update `status.md` echo column
- Brief report: table of location | action | rationale

## DO NOT

- Remove author-locked anchors (see Agent 06 spec)
- Flatten intentional chapter-opening/closing callbacks that use different words
- Re-run terrain or experience passes

## OUTPUT

- Edited files in scope
- Echo report (6–12 bullets + severity notes)
- `make build-book DIR=books/after-certainty`

## PIPELINE

Runs **after** Agent 06 on all units. Before author-read-through-gate and export.
