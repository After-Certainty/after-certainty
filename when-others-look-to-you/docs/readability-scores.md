# Readability scores (manuscript sources)

> **Generated file.** Do not edit by hand. Regenerate with:
> `python3 scripts/readability_scores.py`

**Last generated:** 2026-03-28 00:14 UTC

## Method

- **Scope:** `front-matter/`, `parts/`, and `back-matter/` Markdown listed in `scripts/readability_scores.py`, in book order.
- **Preprocessing:** Remove fenced code, footnote markers, headings, `::: … :::` blocks (including pattern/vignette bodies), and most punctuation except sentence endings (`.?!`). Keeps metrics closer to body prose than raw Markdown.
- **Flesch–Kincaid grade (F–K):** U.S. grade-level formula (not a certification of audience).
- **SMOG / Coleman–Liau:** Secondary grade estimates.
- **Flesch reading ease (FRE):** 0–100, higher = easier (very rough).

**Limits:** Syllable counting is heuristic; sentence splits mishandle some abbreviations and citations. Short files (copyright, bridges) yield noisy ratios. Bibliography and appendices are not comparable to narrative chapters.

## Scores

| Section | Document | F–K grade | SMOG | Coleman–Liau | Flesch ease | Sentences | Words |
|---|---|--:|--:|--:|--:|--:|--:|
| Front matter | Title page | — | — | — | — | — | *insufficient text (1 words)* |
| Front matter | Copyright | 13.2 | 12.3 | 15.7 | 24.8 | 6 | 82 |
| Front matter | Author's note | 8.2 | 8.1 | 10.4 | 56.0 | 27 | 300 |
| Front matter | Preface | 9.4 | 9.3 | 11.2 | 51.1 | 21 | 279 |
| Front matter | Introduction | 9.6 | 9.6 | 12.4 | 49.2 | 26 | 334 |
| Front matter | Prologue | 8.3 | 8.3 | 10.7 | 57.5 | 18 | 222 |
| Front matter | Typographical conventions | 11.2 | 10.6 | 13.6 | 45.3 | 17 | 289 |
| Part I | Bridge | 7.5 | 7.7 | 10.0 | 59.1 | 17 | 171 |
| Part I | Ch 1 — The Weight of Being Looked To | 9.4 | 7.8 | 12.7 | 42.1 | 95 | 765 |
| Part I | Ch 2 — Renewal and Erosion | 10.0 | 9.0 | 13.6 | 41.2 | 114 | 1126 |
| Part I | Ch 3 — Why We Misjudge Leaders | 10.5 | 9.3 | 14.2 | 38.3 | 99 | 1018 |
| Part II | Bridge | 9.2 | 8.4 | 12.0 | 47.8 | 22 | 234 |
| Part II | Ch 4 — Harm Under Influence | 9.7 | 9.1 | 13.3 | 46.5 | 62 | 730 |
| Part II | Ch 5 — Effectiveness and Its Illusions | 9.9 | 8.4 | 13.6 | 41.5 | 55 | 538 |
| Part II | Ch 6 — Legitimacy Over Time | 10.3 | 9.1 | 12.7 | 43.0 | 53 | 644 |
| Part II | Ch 7 — Authority Circulation | 10.4 | 8.6 | 14.4 | 38.6 | 56 | 563 |
| Part III | Bridge | 8.8 | 7.8 | 11.9 | 51.7 | 16 | 177 |
| Part III | Ch 8 — Scale and Drift | 10.3 | 8.4 | 13.2 | 41.2 | 45 | 510 |
| Part III | Ch 9 — Tradeoffs Under Pressure | 10.7 | 9.1 | 14.5 | 36.0 | 42 | 409 |
| Part III | Ch 10 — What Happens Next | 10.6 | 9.9 | 13.9 | 39.2 | 36 | 405 |
| Back matter | Epilogue | 8.8 | 8.6 | 11.5 | 50.4 | 38 | 390 |
| Back matter | Appendix A — Legitimacy transfer | 11.3 | 9.1 | 14.1 | 31.9 | 66 | 664 |
| Back matter | Appendix B — Leadership patterns | 11.6 | 10.4 | 14.2 | 39.8 | 83 | 1292 |
| Back matter | Bibliography | 9.9 | 6.3 | 12.0 | 32.7 | 67 | 310 |

## Source paths

| Document | Relative path |
|---|---|
| Title page | `front-matter/title-page.md` |
| Copyright | `front-matter/copyright.md` |
| Author's note | `front-matter/authors-note.md` |
| Preface | `front-matter/preface.md` |
| Introduction | `front-matter/introduction-when-attention-comes-into-focus.md` |
| Prologue | `front-matter/prologue.md` |
| Typographical conventions | `front-matter/typographical-conventions.md` |
| Bridge | `parts/part-1-attention-and-early-formation/bridge.md` |
| Ch 1 — The Weight of Being Looked To | `parts/part-1-attention-and-early-formation/chapter-1-the-weight-of-being-looked-to.md` |
| Ch 2 — Renewal and Erosion | `parts/part-1-attention-and-early-formation/chapter-2-renewal-and-erosion.md` |
| Ch 3 — Why We Misjudge Leaders | `parts/part-1-attention-and-early-formation/chapter-3-why-we-misjudge-leaders.md` |
| Bridge | `parts/part-2-legitimacy-harm-and-circulation/bridge.md` |
| Ch 4 — Harm Under Influence | `parts/part-2-legitimacy-harm-and-circulation/chapter-4-harm-under-influence.md` |
| Ch 5 — Effectiveness and Its Illusions | `parts/part-2-legitimacy-harm-and-circulation/chapter-5-effectiveness-and-its-illusions.md` |
| Ch 6 — Legitimacy Over Time | `parts/part-2-legitimacy-harm-and-circulation/chapter-6-legitimacy-over-time.md` |
| Ch 7 — Authority Circulation | `parts/part-2-legitimacy-harm-and-circulation/chapter-7-authority-circulation.md` |
| Bridge | `parts/part-3-scale-tradeoffs-and-what-happens-next/bridge.md` |
| Ch 8 — Scale and Drift | `parts/part-3-scale-tradeoffs-and-what-happens-next/chapter-8-scale-and-drift.md` |
| Ch 9 — Tradeoffs Under Pressure | `parts/part-3-scale-tradeoffs-and-what-happens-next/chapter-9-tradeoffs-under-pressure.md` |
| Ch 10 — What Happens Next | `parts/part-3-scale-tradeoffs-and-what-happens-next/chapter-10-what-happens-next.md` |
| Epilogue | `back-matter/epilogue.md` |
| Appendix A — Legitimacy transfer | `back-matter/appendix-a-legitimacy-transfer.md` |
| Appendix B — Leadership patterns | `back-matter/appendix-b-leadership-patterns.md` |
| Bibliography | `back-matter/bibliography.md` |
