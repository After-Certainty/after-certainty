# Rewrite Status Tracker

**Statuses:** Stub → Drafting → Drafted → Reviewed → Approved → Migrated

**Rule:** Production manuscript must not be replaced until every required section is **Approved** and migration is explicitly authorized.

| Section | Status | Source mapped | Citations mapped | Draft reviewed | Approved |
|---------|--------|---------------|------------------|----------------|----------|
| Introduction — The Chart and the Receipt | Migrated | Yes | Yes | Yes | Yes |
| Part I Bridge — The Economy We Describe | Migrated | Yes | N/A | Yes | Yes |
| Chapter 1 — What the Average Leaves Out | Migrated | Yes | Yes | Yes | Yes |
| Chapter 2 — When a Forecast Becomes a Promise | Migrated | Yes | Yes | Yes | Yes |
| Chapter 3 — The Economy at the Kitchen Table | Migrated | Yes | Yes | Yes | Yes |
| Part II Bridge — What Travels | Migrated | Yes | N/A | Yes | Yes |
| Chapter 4 — Why Pain Moves Faster | Migrated | Yes | Yes | Yes | Yes |
| Chapter 5 — The People Who Sound Like They See Us | Migrated | Yes | Yes | Yes | Yes |
| Part III Bridge — Leadership in a Compressed World | Migrated | Yes | N/A | Yes | Yes |
| Chapter 6 — Leadership in a One-Sentence World | Migrated | Yes | Yes | Yes | Yes |
| Chapter 7 — What Elections Can Reject | Migrated | Yes | Yes | Yes | Yes |
| Part IV Bridge — What Holds | Migrated | Yes | N/A | Yes | Yes |
| Chapter 8 — The Guardrails We Notice Only When They Fail | Migrated | Yes | Yes | Yes | Yes |
| Conclusion — Two Truths in One Sentence | Migrated | Yes | Yes | Yes | Yes |
| Appendix — Why “Just Tell the Truth” Is Not a Strategy | Migrated | Yes | Yes | Yes | Yes |

## Gates

| Gate | Status | Notes |
|------|--------|-------|
| All stubs created | Done | |
| Author intake (all units) | Done | |
| Full consecutive read-through | Done | Author approval |
| Citation audit resolved | Done | |
| Bibliography reconciled | Done | `back-matter/bibliography.md` |
| Migration authorized | **Done** | Author authorized migration |
| Production manuscript replaced | **Done** | Titles/paths updated in `index.md`; old unit files removed |
| Rewrite sandbox retained | Done | `docs/rewrite/` kept as historical archive |

## Production destinations (migrated)

| Rewrite unit | Production path |
|--------------|-----------------|
| Introduction | `front-matter/introduction-the-chart-and-the-receipt.md` |
| Part I bridge | `parts/part-1-the-economy-we-describe/bridge.md` |
| Chapter 1 | `parts/part-1-the-economy-we-describe/chapter-1-what-the-average-leaves-out.md` |
| Chapter 2 | `parts/part-1-the-economy-we-describe/chapter-2-when-a-forecast-becomes-a-promise.md` |
| Chapter 3 | `parts/part-1-the-economy-we-describe/chapter-3-the-economy-at-the-kitchen-table.md` |
| Part II bridge | `parts/part-2-what-travels/bridge.md` |
| Chapter 4 | `parts/part-2-what-travels/chapter-4-why-pain-moves-faster.md` |
| Chapter 5 | `parts/part-2-what-travels/chapter-5-the-people-who-sound-like-they-see-us.md` |
| Part III bridge | `parts/part-3-leadership-in-a-compressed-world/bridge.md` |
| Chapter 6 | `parts/part-3-leadership-in-a-compressed-world/chapter-6-leadership-in-a-one-sentence-world.md` |
| Chapter 7 | `parts/part-3-leadership-in-a-compressed-world/chapter-7-what-elections-can-reject.md` |
| Part IV bridge | `parts/part-4-what-holds/bridge.md` |
| Chapter 8 | `parts/part-4-what-holds/chapter-8-the-guardrails-we-notice-only-when-they-fail.md` |
| Conclusion | `back-matter/conclusion-two-truths-in-one-sentence.md` |
| Appendix | `back-matter/appendix-why-just-tell-the-truth-is-not-a-strategy.md` |

## Notes

- Generated front matter (title page, copyright, about-the-series) retained.
- Full approved appendix retained as appendix (not distribute-only).
- Sandbox under `docs/rewrite/` is historical; production `index.md` is source of truth.
