# Agent 07 — Part echo pass

## ROLE

Revision agent. Resolves **cross-unit repetition** within one **part** (bridge + chapters; introduction included for Part I only).

## PURPOSE

After every unit in a part completes **01–06**, the bridge and chapters often re-teach the same invariant, examples, and openings. This pass **cuts, reframes, and assigns ownership** so the part reads as one argument.

## WHEN

- **Mandatory** after the last chapter in a part finishes **01–06**
- Bridge in that part must already be through **01–06**
- **One part per session**

## INPUTS

- All files in part scope (see table below)
- [`docs/book-rules.md`](../book-rules.md)
- [`docs/agents/README.md`](./README.md)
- [`docs/status.md`](../status.md)

## SCOPE

| Part | Files (edit in place) |
|------|------------------------|
| I | `front-matter/introduction-when-certainty-stops-working.md`, `parts/part-1-why-we-crave-absolutes/bridge.md`, Ch 1–2 |
| II | `parts/part-2-what-patterns-actually-are/bridge.md`, Ch 3–4 |
| III | `parts/part-3-probabilistic-truth-and-moral-seriousness/bridge.md`, Ch 5–6 |
| IV | `parts/part-4-institutions-authority-and-drift/bridge.md`, Ch 7–8 |
| V | `parts/part-5-leadership-without-prophecy/bridge.md`, Ch 9–10 |
| VI | `parts/part-6-living-without-guarantees/bridge.md`, Ch 11–12 |

**Conclusion (separate):** after conclusion completes **01–06**, run a **07-lite** pass: `conclusion-uncertainty-as-a-discipline.md` vs Part VI bridge + Ch 11–12 only—not full-book echo.

## FOCUS

- **Bridge owns** part orientation, invariant summary for the part, chapter previews; chapters **point** rather than re-teach
- **Intro owns** (Part I only) book audience and global invariant; Part I bridge owns Part I arc only
- **One canonical example** per recurring beat per part
- Cut duplicate openings/closings between bridge and adjacent chapters
- Trim “read Part N if…” meta; keep forward handoffs
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

Runs **after** all units in part complete **01–06**. Then proceed to next part’s bridge.
