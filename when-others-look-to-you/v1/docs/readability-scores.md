# Readability scores (manuscript sources)

> **Generated file.** Do not edit by hand. Regenerate with:
> `python3 scripts/readability_scores.py`

**Last generated:** 2026-04-12 21:09 UTC

## Method

- **Scope:** `front-matter/`, `parts/`, and `back-matter/` Markdown listed in `scripts/readability_scores.py`, in book order.
- **Preprocessing:** Remove fenced code, footnote markers, headings, `::: … :::` blocks (including pattern/vignette bodies), and most punctuation except sentence endings (`.?!`). Keeps metrics closer to body prose than raw Markdown.
- **Flesch–Kincaid grade (F–K):** U.S. grade-level formula (not a certification of audience).
- **SMOG / Coleman–Liau:** Secondary grade estimates.
- **Flesch reading ease (FRE):** 0–100, higher = easier (very rough).

**Limits:** Syllable counting is heuristic; sentence splits mishandle some abbreviations and citations. Short files (copyright, bridges) yield noisy ratios. Bibliography (citation list), glossary (term definitions), and appendices are not directly comparable to narrative chapters.

## Scores

| Section | Document | F–K grade | SMOG | Coleman–Liau | Flesch ease | Sentences | Words |
|---|---|--:|--:|--:|--:|--:|--:|
| Front matter | Title page | — | — | — | — | — | *insufficient text (1 words)* |
| Front matter | Copyright | 13.2 | 12.3 | 15.7 | 24.8 | 6 | 82 |
| Front matter | Author's note | 7.9 | 7.8 | 10.4 | 58.2 | 32 | 358 |
| Front matter | Preface | 8.5 | 8.4 | 11.3 | 53.9 | 26 | 293 |
| Front matter | Acknowledgements | 6.7 | 6.8 | 7.0 | 75.3 | 19 | 303 |
| Front matter | Introduction | 8.5 | 8.7 | 11.4 | 56.5 | 50 | 632 |
| Front matter | Typographical conventions | 7.4 | 7.4 | 8.5 | 68.5 | 12 | 180 |
| Part I | Bridge | 6.3 | 7.2 | 8.6 | 69.1 | 12 | 128 |
| Part I | Ch 1 — The Weight of Being Looked To | 8.9 | 7.8 | 12.2 | 46.7 | 98 | 839 |
| Part II | Bridge — From Formation to Movement | 9.0 | 9.1 | 12.8 | 50.2 | 12 | 132 |
| Part II | Ch 2 — Renewal | 9.2 | 8.7 | 13.0 | 48.9 | 45 | 494 |
| Part II | Ch 3 — Erosion | 8.5 | 8.6 | 12.7 | 52.5 | 30 | 315 |
| Part II | Ch 4 — Circulation | 9.5 | 9.1 | 11.1 | 55.1 | 112 | 1752 |
| Part III | Bridge — From Movement to Lenses | 7.8 | 7.5 | 12.0 | 53.4 | 10 | 81 |
| Part III | Ch 5 — Harm Under Influence | 9.2 | 8.7 | 12.5 | 50.0 | 108 | 1283 |
| Part III | Ch 6 — Effectiveness and Its Illusions | 10.2 | 8.9 | 14.3 | 41.7 | 106 | 1175 |
| Part III | Ch 7 — Legitimacy Over Time | 9.9 | 9.2 | 12.4 | 47.8 | 117 | 1563 |
| Part IV | Bridge — From Structure to Scale and Judgment | 9.3 | 8.0 | 11.8 | 57.6 | 6 | 99 |
| Part IV | Ch 8 — Scale and Drift | 9.4 | 8.2 | 12.0 | 50.0 | 45 | 572 |
| Part IV | Ch 9 — Tradeoffs Under Pressure | 9.5 | 8.7 | 13.0 | 47.1 | 52 | 584 |
| Part IV | Ch 10 — Why We Misjudge Leaders | 9.3 | 8.7 | 12.9 | 48.0 | 135 | 1460 |
| Part V | Bridge — From Misjudgment to What Remains | 7.1 | 6.5 | 8.9 | 71.4 | 5 | 77 |
| Part V | Ch 11 — What Happens Next | 9.3 | 9.3 | 12.0 | 53.3 | 60 | 838 |
| Back matter | Epilogue | 9.8 | 9.5 | 12.0 | 48.4 | 34 | 455 |
| Back matter | Appendix A — Legitimacy transfer | 13.1 | 11.4 | 14.7 | 29.2 | 99 | 1550 |
| Back matter | Appendix B — Leadership patterns | 8.6 | 8.2 | 12.1 | 55.4 | 112 | 1399 |
| Back matter | Glossary | 13.2 | 11.9 | 15.2 | 29.7 | 35 | 580 |
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
| Glossary | `back-matter/glossary.md` |
| Bibliography | `back-matter/bibliography.md` |
