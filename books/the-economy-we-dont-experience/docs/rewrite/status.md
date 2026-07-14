# Rewrite Status Tracker

**Statuses:** Stub → Drafting → Drafted → Reviewed → Approved → Migrated

**Rule:** Production manuscript must not be replaced until every required section is **Approved** and migration is explicitly authorized.

| Section | Status | Source mapped | Citations mapped | Draft reviewed | Approved |
|---------|--------|---------------|------------------|----------------|----------|
| Introduction — The Chart and the Receipt | Stub | Yes | Yes | No | No |
| Part I Bridge — The Economy We Describe | Stub | Yes | Yes | No | No |
| Chapter 1 — What the Average Leaves Out | Drafted | Yes | Yes | No | No |
| Chapter 2 — When a Forecast Becomes a Promise | Stub | Yes | Yes | No | No |
| Chapter 3 — The Economy at the Kitchen Table | Stub | Yes | Yes | No | No |
| Part II Bridge — What Travels | Stub | Yes | Yes | No | No |
| Chapter 4 — Why Pain Moves Faster | Stub | Yes | Yes | No | No |
| Chapter 5 — The People Who Sound Like They See Us | Stub | Yes | Yes | No | No |
| Part III Bridge — Leadership in a Compressed World | Stub | Yes | Yes | No | No |
| Chapter 6 — Leadership in a One-Sentence World | Stub | Yes | Yes | No | No |
| Chapter 7 — What Elections Can Reject | Stub | Yes | Yes | No | No |
| Part IV Bridge — What Holds | Stub | Yes | Yes | No | No |
| Chapter 8 — The Guardrails We Notice Only When They Fail | Stub | Yes | Yes | No | No |
| Conclusion — Two Truths in One Sentence | Stub | Yes | Yes | No | No |
| Appendix — Why “Just Tell the Truth” Is Not a Strategy | Stub | Yes | Yes | No | No |

## Gates

| Gate | Status | Notes |
|------|--------|-------|
| All stubs created | Done | This pass |
| Intro drafted + voice lock | Not started | Draft Intro next; Ch 1 drafted from author prose ahead of Intro queue |
| Intro + Ch 1 reviewed together | Not started | Required before Chapters 2+ |
| Ch 1 author intake | Done | Pandoc IDs `c1-bls-jobs` / `c1-shelter` / `c1-shiller`; staccato merged |
| Full consecutive read-through | Not started | After all Drafted |
| Citation audit resolved | Not started | Gaps flagged in `citation-audit.md` |
| Bibliography reconciled | Not started | At migration |
| Migration authorized | Not started | Explicit user approval required |

## Notes

- Front matter templates (title page, copyright, about-the-series) stay in production; rewrite does not duplicate them.
- Bibliography remains production `back-matter/bibliography.md` until migration; working notes live in `citation-audit.md`.
- Appendix recommendation: distribute strongest ideas into Intro / Ch 6 / Conclusion; keep stub until Approved gate decides residual afterword vs short appendix.
- **Intake rule:** every author-provided chapter must get Pandoc `[^id]` citations and a pass that merges single-sentence staccato into flowing paragraphs (see `README.md` → Incoming chapter intake).
