# Rewrite Status Tracker

**Statuses:** Stub → Drafting → Drafted → Reviewed → Approved → Migrated

**Rule:** Production manuscript must not be replaced until every required section is **Approved** and migration is explicitly authorized.

| Section | Status | Source mapped | Citations mapped | Draft reviewed | Approved |
|---------|--------|---------------|------------------|----------------|----------|
| Introduction — The Chart and the Receipt | Approved | Yes | Yes | Yes | Yes |
| Part I Bridge — The Economy We Describe | Approved | Yes | N/A | Yes | Yes |
| Chapter 1 — What the Average Leaves Out | Approved | Yes | Yes | Yes | Yes |
| Chapter 2 — When a Forecast Becomes a Promise | Approved | Yes | Yes | Yes | Yes |
| Chapter 3 — The Economy at the Kitchen Table | Approved | Yes | Yes | Yes | Yes |
| Part II Bridge — What Travels | Approved | Yes | N/A | Yes | Yes |
| Chapter 4 — Why Pain Moves Faster | Approved | Yes | Yes | Yes | Yes |
| Chapter 5 — The People Who Sound Like They See Us | Approved | Yes | Yes | Yes | Yes |
| Part III Bridge — Leadership in a Compressed World | Approved | Yes | N/A | Yes | Yes |
| Chapter 6 — Leadership in a One-Sentence World | Approved | Yes | Yes | Yes | Yes |
| Chapter 7 — What Elections Can Reject | Approved | Yes | Yes | Yes | Yes |
| Part IV Bridge — What Holds | Approved | Yes | N/A | Yes | Yes |
| Chapter 8 — The Guardrails We Notice Only When They Fail | Approved | Yes | Yes | Yes | Yes |
| Conclusion — Two Truths in One Sentence | Approved | Yes | Yes | Yes | Yes |
| Appendix — Why “Just Tell the Truth” Is Not a Strategy | Approved | Yes | Yes | Yes | Yes |

## Gates

| Gate | Status | Notes |
|------|--------|-------|
| All stubs created | Done | This pass |
| Intro drafted + voice lock | Done | Author Intro filed as voice model |
| Intro + Ch 1 reviewed together | Done | Author approval of full rewrite |
| Ch 1–8 / bridges / Intro / Conclusion / Appendix author intake | Done | See prior gate rows in git history |
| Reading order locked | Done | Intro → P1 bridge → Ch1–3 → P2 bridge → Ch4–5 → P3 bridge → Ch6–7 → P4 bridge → Ch8 → Conclusion → Appendix |
| Full consecutive read-through | Done | Author approval of rewrite |
| Citation audit resolved | Done | Gaps closed in bibliography reconciliation; see `citation-audit.md` |
| Bibliography reconciled | Done | `back-matter/bibliography.md` updated for rewrite footnotes (KFF; Key; Fiorina; FSB; CBO; FDIC; Fed FSR/Beige Book/FOMC+stress tests; Pew trust/media; Tetlock+Gardner; Sunstein → `#Republic`) |
| Migration authorized | **Not started** | Explicit user authorization still required before replacing production manuscript files |
| Production manuscript replaced | Not started | Wait for migration authorization |

## Notes

- Front matter templates (title page, copyright, about-the-series) stay in production; rewrite does not duplicate them.
- Bibliography lives at production `back-matter/bibliography.md` and is now reconciled to the approved rewrite footnote set.
- Appendix residual: author full draft **Approved** as the afterword form; Option 3 distribute remains available at migration if residual is preferred absorbed rather than retained as appendix.
- **Intake rule:** every author-provided chapter must get Pandoc `[^id]` citations and a pass that merges single-sentence staccato into flowing paragraphs (see `README.md` → Incoming chapter intake).
- **Next:** wait for explicit migration authorization before copying rewrite units into `front-matter/`, `parts/`, `back-matter/`, and updating `index.md`.
