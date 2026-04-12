# Readability scores (manuscript sources)

> **Generated file.** Do not edit by hand. Regenerate with:
> `python3 scripts/readability_scores.py`

**Last generated:** 2026-04-12 16:33 UTC

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
| Front matter | Author's note | 8.1 | 8.0 | 10.5 | 56.5 | 30 | 334 |
| Front matter | Preface | 9.1 | 8.9 | 11.7 | 52.0 | 24 | 298 |
| Front matter | Acknowledgements | 8.0 | 7.5 | 7.4 | 71.5 | 16 | 305 |
| Front matter | Introduction | 8.8 | 9.0 | 11.9 | 54.7 | 48 | 608 |
| Front matter | Typographical conventions | 10.4 | 10.2 | 11.9 | 50.5 | 27 | 455 |
| Part I | Bridge | 7.6 | 7.8 | 9.7 | 59.4 | 13 | 138 |
| Part I | Ch 1 — The Weight of Being Looked To | 9.3 | 8.0 | 12.6 | 44.0 | 96 | 841 |
| Part II | Bridge — From Formation to Movement | 9.8 | 9.7 | 13.8 | 45.7 | 12 | 140 |
| Part II | Ch 2 — Renewal | 9.9 | 9.3 | 13.6 | 44.6 | 42 | 488 |
| Part II | Ch 3 — Erosion | 9.3 | 9.4 | 13.3 | 48.9 | 27 | 315 |
| Part II | Ch 4 — Circulation | 10.6 | 9.9 | 11.5 | 51.3 | 97 | 1761 |
| Part III | Bridge — From Movement to Lenses | 8.0 | 8.5 | 11.2 | 58.5 | 8 | 95 |
| Part III | Ch 5 — Harm Under Influence | 9.5 | 8.9 | 12.6 | 49.1 | 101 | 1268 |
| Part III | Ch 6 — Effectiveness and Its Illusions | 10.3 | 8.9 | 14.4 | 41.2 | 106 | 1173 |
| Part III | Ch 7 — Legitimacy Over Time | 10.4 | 9.6 | 12.6 | 46.1 | 107 | 1555 |
| Part IV | Bridge — From Structure to Scale and Judgment | 8.7 | 8.3 | 12.2 | 60.1 | 7 | 107 |
| Part IV | Ch 8 — Scale and Drift | 9.9 | 8.6 | 12.4 | 47.7 | 43 | 566 |
| Part IV | Ch 9 — Tradeoffs Under Pressure | 10.0 | 9.0 | 13.3 | 45.6 | 46 | 566 |
| Part IV | Ch 10 — Why We Misjudge Leaders | 9.5 | 8.8 | 13.1 | 46.5 | 132 | 1441 |
| Part V | Bridge — From Misjudgment to What Remains | 8.9 | 7.2 | 9.4 | 67.0 | 4 | 80 |
| Part V | Ch 11 — What Happens Next | 9.9 | 9.8 | 12.3 | 51.6 | 55 | 839 |
| Back matter | Epilogue | 10.0 | 9.7 | 12.1 | 47.9 | 33 | 458 |
| Back matter | Appendix A — Legitimacy transfer | 11.3 | 9.4 | 13.8 | 34.7 | 58 | 677 |
| Back matter | Appendix B — Leadership patterns | 8.6 | 8.2 | 12.0 | 55.4 | 112 | 1397 |
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
