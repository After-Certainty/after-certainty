# Readability scores (manuscript sources)

> **Generated file.** Do not edit by hand. Regenerate with:
> `python3 scripts/readability_scores.py`

**Last generated:** 2026-04-12 17:19 UTC

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
| Front matter | Author's note | 8.0 | 7.8 | 10.4 | 56.8 | 31 | 334 |
| Front matter | Preface | 8.6 | 8.5 | 11.4 | 53.2 | 26 | 294 |
| Front matter | Acknowledgements | 7.2 | 7.1 | 7.2 | 73.6 | 18 | 303 |
| Front matter | Introduction | 8.5 | 8.7 | 11.7 | 55.3 | 51 | 614 |
| Front matter | Typographical conventions | 10.4 | 10.2 | 11.9 | 50.5 | 27 | 455 |
| Part I | Bridge | 7.8 | 8.0 | 10.0 | 57.9 | 12 | 128 |
| Part I | Ch 1 — The Weight of Being Looked To | 9.2 | 8.0 | 12.5 | 44.3 | 97 | 834 |
| Part II | Bridge — From Formation to Movement | 9.7 | 9.7 | 13.6 | 46.1 | 12 | 141 |
| Part II | Ch 2 — Renewal | 9.8 | 9.1 | 13.5 | 45.0 | 44 | 490 |
| Part II | Ch 3 — Erosion | 8.9 | 8.9 | 13.1 | 49.9 | 30 | 314 |
| Part II | Ch 4 — Circulation | 9.7 | 9.3 | 11.4 | 53.4 | 112 | 1752 |
| Part III | Bridge — From Movement to Lenses | 7.7 | 7.3 | 11.5 | 53.9 | 11 | 87 |
| Part III | Ch 5 — Harm Under Influence | 9.3 | 8.8 | 12.6 | 49.6 | 107 | 1282 |
| Part III | Ch 6 — Effectiveness and Its Illusions | 10.3 | 8.9 | 14.4 | 41.1 | 106 | 1168 |
| Part III | Ch 7 — Legitimacy Over Time | 10.0 | 9.3 | 12.4 | 47.3 | 115 | 1563 |
| Part IV | Bridge — From Structure to Scale and Judgment | 6.8 | 6.8 | 11.5 | 65.2 | 10 | 106 |
| Part IV | Ch 8 — Scale and Drift | 9.6 | 8.4 | 12.3 | 48.4 | 45 | 567 |
| Part IV | Ch 9 — Tradeoffs Under Pressure | 9.7 | 8.9 | 13.2 | 46.4 | 50 | 585 |
| Part IV | Ch 10 — Why We Misjudge Leaders | 9.4 | 8.7 | 13.0 | 46.8 | 135 | 1444 |
| Part V | Bridge — From Misjudgment to What Remains | 7.4 | 6.5 | 9.5 | 69.5 | 5 | 78 |
| Part V | Ch 11 — What Happens Next | 9.4 | 9.4 | 12.1 | 52.8 | 60 | 837 |
| Back matter | Epilogue | 9.7 | 9.4 | 11.9 | 48.7 | 35 | 458 |
| Back matter | Appendix A — Legitimacy transfer | 13.1 | 11.5 | 14.7 | 28.7 | 99 | 1549 |
| Back matter | Appendix B — Leadership patterns | 8.6 | 8.2 | 12.1 | 55.3 | 112 | 1400 |
| Back matter | Bibliography | 9.4 | 6.0 | 10.8 | 35.1 | 100 | 426 |

## Source paths

| Document | Relative path |
|---|---|
| Title page | `front-matter/title-page.md` |
| Copyright | `front-matter/copyright.md` |
| Author's note | `front-matter/authors-note.md` |
| Preface | `front-matter/preface.md` |
| Acknowledgements | `front-matter/acknowledgements.md` |
| Introduction | `front-matter/introduction-attention-finds-a-focus.md` |
| Typographical conventions | `front-matter/typographical-conventions.md` |
| Bridge | `parts/part-1-how-influence-forms/bridge.md` |
| Ch 1 — The Weight of Being Looked To | `parts/part-1-how-influence-forms/chapter-1-the-weight-of-being-looked-to.md` |
| Bridge — From Formation to Movement | `parts/part-2-renewal-erosion-circulation/bridge-from-formation-to-movement.md` |
| Ch 2 — Renewal | `parts/part-2-renewal-erosion-circulation/chapter-2-renewal.md` |
| Ch 3 — Erosion | `parts/part-2-renewal-erosion-circulation/chapter-3-erosion.md` |
| Ch 4 — Circulation | `parts/part-2-renewal-erosion-circulation/chapter-4-circulation.md` |
| Bridge — From Movement to Lenses | `parts/part-3-harm-effectiveness-legitimacy/bridge-from-movement-to-lenses.md` |
| Ch 5 — Harm Under Influence | `parts/part-3-harm-effectiveness-legitimacy/chapter-5-harm-under-influence.md` |
| Ch 6 — Effectiveness and Its Illusions | `parts/part-3-harm-effectiveness-legitimacy/chapter-6-effectiveness-and-its-illusions.md` |
| Ch 7 — Legitimacy Over Time | `parts/part-3-harm-effectiveness-legitimacy/chapter-7-legitimacy-over-time.md` |
| Bridge — From Structure to Scale and Judgment | `parts/part-4-scale-pressure-misjudgment/bridge-from-structure-to-scale-and-judgment.md` |
| Ch 8 — Scale and Drift | `parts/part-4-scale-pressure-misjudgment/chapter-8-scale-and-drift.md` |
| Ch 9 — Tradeoffs Under Pressure | `parts/part-4-scale-pressure-misjudgment/chapter-9-tradeoffs-under-pressure.md` |
| Ch 10 — Why We Misjudge Leaders | `parts/part-4-scale-pressure-misjudgment/chapter-10-why-we-misjudge-leaders.md` |
| Bridge — From Misjudgment to What Remains | `parts/part-5-closing/bridge-from-misjudgment-to-what-remains.md` |
| Ch 11 — What Happens Next | `parts/part-5-closing/chapter-11-what-happens-next.md` |
| Epilogue | `back-matter/epilogue.md` |
| Appendix A — Legitimacy transfer | `back-matter/appendix-a-legitimacy-transfer.md` |
| Appendix B — Leadership patterns | `back-matter/appendix-b-leadership-patterns.md` |
| Bibliography | `back-matter/bibliography.md` |
