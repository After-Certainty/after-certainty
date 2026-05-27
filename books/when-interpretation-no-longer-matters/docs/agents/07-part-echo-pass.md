# Agent 07 — Part echo pass

## ROLE

Revision agent. Resolves **cross-unit repetition** within one **part** (bridge + chapters in that part; introduction included only for Part I).

## PURPOSE

After every unit in a part completes **01–06**, bridges and chapters can re-teach the same invariant, reuse the same regime, or re-define the same authority mode. This pass **cuts, reframes, and assigns ownership** so each part reads as one movement.

## WHEN

- **Mandatory** after the last chapter in a part finishes **01–06**
- **One part per session**
- Cluster skim when Part III or IV risks overlapping judgment cluster: see [README](./README.md)

## INPUTS

- All files in part scope (see table below)
- [`docs/book-rules.md`](../book-rules.md)
- [`docs/agents/README.md`](./README.md)
- [`docs/status.md`](../status.md)
- Existing part coherence notes: [`part-1-coherence-pass.md`](../part-1-coherence-pass.md) through [`part-4-coherence-pass.md`](../part-4-coherence-pass.md) (read; do not contradict without cause)

## SCOPE

| Part | Files (edit in place) |
|------|------------------------|
| **I — Where Interpretation Ends** | `front-matter/introduction-the-question-this-book-asks.md`, `parts/part-1-where-interpretation-ends/bridge.md`, Ch 1–2 |
| **II — Authority Without Interpretation** | `parts/part-2-authority-without-interpretation/bridge.md`, Ch 3–6 (each chapter = one mode) |
| **III — Cases Beyond Interpretation** | `parts/part-3-cases-beyond-interpretation/bridge.md`, Ch 7–10 (one regime type per chapter) |
| **IV — After Interpretation** | `parts/part-4-after-interpretation/bridge.md`, Ch 11–13 |

**Conclusion (separate):** after conclusion completes **01–06**, compare to Ch 13 and Part III case summaries only—full cross-part dedupe is **08**.

**Optional in Part I gate:** `front-matter/how-to-read-this-book.md` if it repeats introduction.

## FOCUS

### Ownership by part

| Part | One owner per… |
|------|----------------|
| I | **The question** (intro), bridge orientation, and **boundary / interpretive collapse** (Ch 1–2) |
| II | Bridge orientation + **each authority mode** (Ch 3–6)—no chapter re-teaches another mode’s definition |
| III | Bridge orientation + **each case type** (Ch 7–10)—no duplicate regime; appendix map points, does not re-narrate |
| IV | Bridge orientation + **judgment, repair limits, early recognition** (Ch 11–13)—do not re-list all cases |

### Part III (highest echo risk)

- **One canonical case beat** per mechanism if the same episode appeared in two chapters
- Case-template sections should **differ in emphasis**, not duplicate prose with swapped names
- Trim **invariant boilerplate** at case closes—one sharp return paragraph per chapter

### Part II

- If Ch 5 and Ch 6 both explain “performance,” assign **coercion/consent** vs **enclosure** clearly

## DO

- Prefer **cutting** over synonym swapping
- Table: location | action (cut / reframe / keep) | rationale
- Severity before/after (low / medium / high)
- Update **`docs/status.md`** under `## Part N echo gate (07)`

## DO NOT

- Re-expand (**01**), full plain-speak (**02**), or bulk reflow (**03**)
- Add citations (**05**) unless a cut exposes a new verifiable claim
- Run multiple parts in one session without approval
- Introduce **new cases** or modes

## OUTPUT

- Edited files in scope
- Brief echo report
- Updated `status.md` **Part N echo gate (07)**

## PIPELINE

Runs **after** all units in part complete **01–06**. After Part IV **07** and conclusion **01–06**, run **08**.
