# Rewrite Status Tracker

**Statuses:** Stub → Drafting → Drafted → Reviewed → Approved → Migrated

**Rule:** Production manuscript must not be replaced until every required section is **Approved** and migration is explicitly authorized.

| Section | Status | Source mapped | Citations mapped | Draft reviewed | Approved |
|---------|--------|---------------|------------------|----------------|----------|
| Introduction — The Chart and the Receipt | Drafted | Yes | Yes | No | No |
| Part I Bridge — The Economy We Describe | Drafted | Yes | N/A | No | No |
| Chapter 1 — What the Average Leaves Out | Drafted | Yes | Yes | No | No |
| Chapter 2 — When a Forecast Becomes a Promise | Drafted | Yes | Yes | No | No |
| Chapter 3 — The Economy at the Kitchen Table | Drafted | Yes | Yes | No | No |
| Part II Bridge — What Travels | Drafted | Yes | N/A | No | No |
| Chapter 4 — Why Pain Moves Faster | Drafted | Yes | Yes | No | No |
| Chapter 5 — The People Who Sound Like They See Us | Drafted | Yes | Yes | No | No |
| Part III Bridge — Leadership in a Compressed World | Drafted | Yes | N/A | No | No |
| Chapter 6 — Leadership in a One-Sentence World | Drafted | Yes | Yes | No | No |
| Chapter 7 — What Elections Can Reject | Drafted | Yes | Yes | No | No |
| Part IV Bridge — What Holds | Stub | Yes | Yes | No | No |
| Chapter 8 — The Guardrails We Notice Only When They Fail | Stub | Yes | Yes | No | No |
| Conclusion — Two Truths in One Sentence | Stub | Yes | Yes | No | No |
| Appendix — Why “Just Tell the Truth” Is Not a Strategy | Stub | Yes | Yes | No | No |

## Gates

| Gate | Status | Notes |
|------|--------|-------|
| All stubs created | Done | This pass |
| Intro drafted + voice lock | Drafted | Author Intro filed; treat as provisional voice model pending review with Ch 1 |
| Intro + Ch 1 reviewed together | Not started | Required before Chapters 4+ (Ch 2–3 already drafted from author prose) |
| Ch 1 author intake | Done | Pandoc IDs `c1-bls-jobs` / `c1-shelter` / `c1-shiller`; staccato merged |
| Ch 2 author intake | Done | Pandoc IDs `c2-fomc` / `c2-aggregate` / `c2-shed` / `c2-safeguards` / `c2-tetlock` / `c2-beige`; composite labeled; staccato merged; note ~10 `###` movements (above 3–5 target — consolidate at review) |
| Ch 3 author intake | Done | Pandoc IDs `c3-cpi` / `c3-kahneman` / `c3-shelter` / `c3-health` / `c3-wages`; nurse composite labeled; unused author `[^5]` attached at wage hinge; ~7 movements (review consolidate); KFF still missing from production bibliography |
| Intro author intake | Done | Split production `[^intro-cpi]` into `[^intro-cpi]` / `[^intro-shed]` / `[^intro-pew]`; attached at hinges (body had notes without markers); staccato merged; no internal `###` |
| Ch 4 author intake | Done | Pandoc IDs `c4-jolts` / `c4-shiller` / `c4-cpi-level` / `c4-kahneman` / `c4-household` / `c4-pew`; unused notes attached at hinges; ~11 movements (review consolidate); absolute “always” avoided |
| Part I bridge draft | Done | Author draft (~570w); staccato merged; no footnotes; measurement→remainder attention shift |
| Part II bridge draft | Done | Author draft; staccato merged; no footnotes; kitchen-table→what travels attention shift |
| Reading order locked | Done | Intro → P1 bridge → Ch1–3 → P2 bridge → Ch4–5 → P3 bridge → Ch6–7 → P4 bridge → Ch8 → Conclusion |
| Ch 5 author intake | Done | Pandoc IDs `c5-composite` / `c5-shed` / `c5-shiller` / `c5-kahneman` / `c5-pew`; unused notes attached at hinges; hardware-store composite labeled; ~9 movements (review consolidate) |
| Part III bridge draft | Done | Author draft; staccato merged; no footnotes; recognition→governance attention shift |
| Ch 6 author intake | Done | Pandoc IDs `c6-composite` / `c6-bls-jobs` / `c6-shed` / `c6-fed` / `c6-bernanke` / `c6-pew`; composite labeled; staccato merged; ~7 movements |
| Full consecutive read-through | Not started | After all Drafted |
| Citation audit resolved | Not started | Gaps flagged in `citation-audit.md` |
| Bibliography reconciled | Not started | At migration |
| Migration authorized | Not started | Explicit user approval required |

## Notes

- Front matter templates (title page, copyright, about-the-series) stay in production; rewrite does not duplicate them.
- Bibliography remains production `back-matter/bibliography.md` until migration; working notes live in `citation-audit.md`.
- Appendix recommendation: distribute strongest ideas into Intro / Ch 6 / Conclusion; keep stub until Approved gate decides residual afterword vs short appendix.
- **Intake rule:** every author-provided chapter must get Pandoc `[^id]` citations and a pass that merges single-sentence staccato into flowing paragraphs (see `README.md` → Incoming chapter intake).
