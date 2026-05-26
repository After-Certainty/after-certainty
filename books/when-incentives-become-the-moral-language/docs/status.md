# When Incentives Become the Moral Language — Drafting Status

## Current phase

**Phase 5 — Published in `books/`** (agent pipeline **01–08** in progress on branch `promote/when-incentives-become-the-moral-language`)

## Active branch

`promote/when-incentives-become-the-moral-language`

## Manuscript hub

[`index.md`](../index.md)

## Structure

| Part | Slug | Chapters |
|------|------|----------|
| I — When Judgment Fractures | `part-1-when-judgment-fractures` | 1–4 |
| II — When Formula Speaks | `part-2-when-formula-speaks` | 5–8 |

## Unit progress

| Unit | Words | Agents 01–06 | Notes |
|------|------:|--------------|-------|
| Title Page | — | — | Out of pipeline |
| Copyright | — | — | Out of pipeline |
| Introduction | 849 | **Complete** | 01–06 on promote branch |
| Interlude | 490 | **Complete** | Between Part I and II; scope handoff prose updated |
| Part I bridge | ~720 | **Complete** | Drafted at promote; reflow |
| Ch 1 — Care | 1208 | **Complete** | 01–06 complete; expanded mechanism + citation cleanup |
| Ch 2 — Engagement | 1408 | **Complete** | 01–06 complete; editorial-judgment collapse mechanism expanded; citations cleaned |
| Ch 3 — Publishing | 1086 | **Complete** | 01–06 complete; productivity-vs-contribution mechanism expanded; citations normalized |
| Ch 4 — Targets | 1192 | **Complete** | 01–06 complete; offset/ESG mechanism expanded; responsibility-vs-seriousness distinction sharpened |
| Ch 5 — Fairness | 1025 | **Complete** | 01–06 complete; fairness-vs-defensibility mechanism expanded; citations normalized |
| Ch 6 — Attention | 1022 | **Complete** | 01–06 complete; audience-vs-public distinction; differentiated from Ch 2 platform case |
| Ch 7 — Polling | 863 | **Complete** | 01–06 complete; polling-vs-legitimacy mechanism; differentiated from Ch 6 |
| Ch 8 — Formation | 763 | **Complete** | 01–06 complete; formation-vs-measurement capstone; handoff to conclusion |
| Part II bridge | ~140 | **Complete** | Part II echo pass: trimmed previews |
| Conclusion | 920 | **Complete** | 01–06 complete; synthesis + orientation (no program); handoff from Ch 8 |
| Appendix | 330 | Optional | |
| Bibliography | — | — | Linked from index |

**Agent 00:** Not required — all units are drafted prose (no outline-only stubs).

## Part echo gates

| Part | Status | Severity |
|------|--------|----------|
| Part I | **Complete** | low |
| Part II | **Complete** | low |
| Conclusion (07-lite vs Part II) | **Complete** | low |

### Part I echo gate

Severity: **medium → low** after pass.

| Location | Action | Rationale |
|----------|--------|-----------|
| `parts/part-1-when-judgment-fractures/bridge.md` opening | cut/reframe | Intro and interlude already own global frame; bridge now owns Part I arc directly |
| `parts/part-1-when-judgment-fractures/bridge.md` invariant restatement | cut | Removed duplicate invariant paragraph already established in introduction |
| `parts/part-1-when-judgment-fractures/chapter-1-care-without-caring.md` closing | cut/reframe | Avoided repeating bridge-level "this chapter begins Part I" scaffolding |
| `parts/part-1-when-judgment-fractures/chapter-4-targets-without-judgment.md` cross-chapter callback | reframe | Kept continuity while reducing repeated chapter-by-chapter recap language |

### Part II echo gate

Severity: **medium → low** after pass.

| Location | Action | Rationale |
|----------|--------|-----------|
| `parts/part-2-when-formula-speaks/bridge.md` | cut/reframe | Removed Part I recap and long chapter previews; interlude owns scope; bridge owns Part II arc |
| `parts/part-2-when-formula-speaks/chapter-5`–`7` closings | reframe | Shortened forward handoffs; bridge already orients Part II |
| `parts/part-2-when-formula-speaks/chapter-8` closing | reframe | Capstone ends toward conclusion, not another domain preview |

### Conclusion echo gate (07-lite)

Severity: **medium → low** after pass.

| Location | Action | Rationale |
|----------|--------|-----------|
| `back-matter/conclusion-living-inside-incentive-systems.md` Part I/II recap | cut/reframe | Removed second domain inventory and invariant restatement already in intro + Part II bridge |
| `back-matter/conclusion-living-inside-incentive-systems.md` interlude callback | reframe | Short pointer; interlude owns full scope refusal |
| `parts/part-2-when-formula-speaks/chapter-8` capstone label | cut | Conclusion owns manuscript synthesis |
| `parts/part-2-when-formula-speaks/chapter-8` closing | reframe | Avoid repeating conclusion's no-program refusal |

## Manuscript echo gate (08)

| Status | Severity |
|--------|----------|
| **Complete** | low |

Severity: **medium → low** after pass. Cluster skim: after-certainty, economy, interpretation (titles + intros)—no long re-argue of compression or interpretation collapse; conclusion owns portfolio boundary sentence.

| Location | Action | Rationale |
|----------|--------|-----------|
| `front-matter/introduction-*.md` procedure section | cut/reframe | Removed Google/Meta, hospital, platform vignettes; chapters own canonical examples |
| `front-matter/introduction-*.md` moral residue vignette | cut | Avoided nurse/manager/moderator list duplicated in conclusion |
| `parts/part-1-*/bridge.md` | cut/reframe | Thin domain labels; removed mechanism repetition from Ch 1–4 |
| `parts/part-2-*/bridge.md` | cut | Removed invariant restatement (intro + conclusion own) |
| `chapter-3` cross-domain callback | reframe | Generic "earlier domains" |
| `chapter-6` / `chapter-7` closings | reframe | Varied "At human scale" phrasing across Part II |

## Next actions

1. Author review; enable exports in `book.yml` when ready.
2. `make generate-books-manifest` on merge.

## Rough scale

- ~9.1k words after intro/conclusion pass (May 2026); target ~12–18k cycle one

## Promote checklist (structure)

- [x] Copy to `books/when-incentives-become-the-moral-language/`
- [x] Two-part folder layout + bridges
- [x] `docs/agents/` 01–08 + README + chapter-pipeline
- [x] `book.yml` publishing enabled; exports enabled (docx/epub/pdf); `github.release: true`
- [x] `make validate-book-specs` passes
- [x] Cross-links updated (series-guide, README, cluster books)
- [x] Full agent pipeline **01–08**
- [x] Regenerate `docs/portfolio-audit/data/books-manifest.json` (books path; exports on)
