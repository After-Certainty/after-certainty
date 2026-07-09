# Agent 07 — Part echo pass

## ROLE

Revision agent. Resolves **cross-unit repetition** within one **part** (bridge + chapters; introduction in Part I only; interlude at the Part II gate).

## PURPOSE

After every unit in a part completes **01–06**, the bridge and chapters often re-teach the same invariant, examples, and openings. This pass **cuts, reframes, and assigns ownership** so the part reads as one argument.

## WHEN

- **Mandatory** after the last chapter in a part finishes **01–06**
- Bridge in that part must already be through **01–06**
- **One part per session**
- **Cluster skim** (titles + intros): after-certainty, economy, interpretation—see [README](./README.md)

## INPUTS

- All files in part scope (see table below)
- [`docs/book-rules.md`](../../book-rules.md)
- [`docs/agents/README.md`](./README.md)
- [`docs/status.md`](../../status.md)

## SCOPE

| Part | Files (edit in place) |
|------|------------------------|
| I | `front-matter/introduction-why-judgment-no-longer-coordinates-action.md`, `parts/part-1-when-judgment-fractures/bridge.md`, Ch 1–4 |
| II | `front-matter/interlude-what-this-book-is-not.md`, `parts/part-2-when-formula-speaks/bridge.md`, Ch 5–8 |

**Conclusion (separate):** after conclusion completes **01–06**, run **07-lite** vs Part II bridge + Ch 8 only—not full-book echo (**08** owns cross-part).

## FOCUS

- **Bridge owns** part orientation, invariant summary for the part, chapter previews; chapters **point** rather than re-teach
- **Intro owns** (Part I only) book audience and global invariant; Part I bridge owns Part I arc only; **interlude owns** scope boundaries (between parts, before Part II bridge)
- **One canonical example** per recurring beat per part (layoffs, hospital metrics, platform engagement)
- Cut duplicate openings/closings between bridge and adjacent chapters
- Log fixes in **`docs/status.md`** under `## Part N echo gate`

## DO

- Prefer **cutting** over synonym swapping
- When keeping a repeated example, change **what it proves**
- Table: location | action (cut / reframe / keep) | one-line rationale
- Severity before/after (low / medium / high)

## DO NOT

- Re-expand (**01**), full plain-speak (**02**), or bulk reflow (**03**)
- Add citations (**05**) unless a cut exposes a new verifiable claim
- Run multiple parts in one session without approval

## OUTPUT

- Edited files in scope
- Brief echo report
- Updated `status.md` **Part N echo gate** section

## PIPELINE

Runs **after** all units in part complete **01–06**. After Part II **07**, run conclusion **01–06**, then **08**.
