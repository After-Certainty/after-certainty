# Readability scores (manuscript sources)

> **Generated file.** Do not edit by hand. Regenerate with:
> `python3 scripts/readability_scores.py`

**Last generated:** 2026-03-26 06:04 UTC

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
| Front matter | Typographical conventions | 11.1 | 10.6 | 13.7 | 44.9 | 17 | 281 |
| Part I | Bridge | 7.5 | 7.7 | 10.0 | 59.1 | 17 | 171 |
| Part I | Ch 1 — The Weight of Being Looked To | 9.4 | 7.8 | 12.7 | 42.1 | 95 | 765 |
| Part I | Ch 2 — Renewal and Erosion | 9.9 | 8.9 | 13.6 | 41.6 | 114 | 1124 |
| Part I | Ch 3 — Why We Misjudge Leaders | 10.5 | 9.3 | 14.3 | 38.2 | 99 | 1010 |
| Part II | Bridge | 9.2 | 8.4 | 12.0 | 47.8 | 22 | 234 |
| Part II | Ch 4 — Harm Under Influence | 9.6 | 8.9 | 13.1 | 47.5 | 62 | 729 |
| Part II | Ch 5 — Effectiveness and Its Illusions | 9.9 | 8.4 | 13.7 | 41.8 | 55 | 536 |
| Part II | Ch 6 — Legitimacy Over Time | 10.2 | 9.0 | 12.6 | 43.1 | 53 | 637 |
| Part II | Ch 7 — Authority Circulation | 10.4 | 8.6 | 14.4 | 38.6 | 56 | 561 |
| Part III | Bridge | 8.7 | 7.6 | 12.0 | 51.9 | 16 | 174 |
| Part III | Ch 8 — Scale and Drift | 10.3 | 8.4 | 13.2 | 41.3 | 45 | 508 |
| Part III | Ch 9 — Tradeoffs Under Pressure | 10.6 | 9.1 | 14.5 | 36.6 | 42 | 411 |
| Part III | Ch 10 — What Happens Next | 10.6 | 9.9 | 14.0 | 38.8 | 36 | 404 |
| Back matter | Epilogue | 8.5 | 8.3 | 11.2 | 52.1 | 38 | 386 |
| Back matter | Appendix A — Legitimacy transfer | 11.2 | 9.0 | 14.1 | 32.3 | 64 | 631 |
| Back matter | Appendix B — Leadership patterns | 11.4 | 10.2 | 14.1 | 41.1 | 83 | 1286 |
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
| Bridge | `parts/part-3-scale-tradeoffs-and-renewal/bridge.md` |
| Ch 8 — Scale and Drift | `parts/part-3-scale-tradeoffs-and-renewal/chapter-8-scale-and-drift.md` |
| Ch 9 — Tradeoffs Under Pressure | `parts/part-3-scale-tradeoffs-and-renewal/chapter-9-tradeoffs-under-pressure.md` |
| Ch 10 — What Happens Next | `parts/part-3-scale-tradeoffs-and-renewal/chapter-10-what-happens-next.md` |
| Epilogue | `back-matter/epilogue.md` |
| Appendix A — Legitimacy transfer | `back-matter/appendix-a-legitimacy-transfer.md` |
| Appendix B — Leadership patterns | `back-matter/appendix-b-leadership-patterns.md` |
| Bibliography | `back-matter/bibliography.md` |
