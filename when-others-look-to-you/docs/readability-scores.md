# Readability scores (manuscript sources)

> **Generated file.** Do not edit by hand. Regenerate with:
> `python3 scripts/readability_scores.py`

**Last generated:** 2026-03-28 03:10 UTC

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
| Front matter | Preface | 9.4 | 9.3 | 11.3 | 51.5 | 21 | 281 |
| Front matter | Introduction | 9.6 | 9.6 | 12.5 | 49.4 | 27 | 356 |
| Front matter | Prologue | 8.3 | 8.3 | 10.7 | 57.5 | 18 | 222 |
| Front matter | Typographical conventions | 10.9 | 10.2 | 13.1 | 47.3 | 19 | 325 |
| Part I | Bridge | 8.5 | 8.4 | 11.2 | 56.4 | 18 | 222 |
| Part I | Ch 1 — The Weight of Being Looked To | 9.3 | 7.9 | 12.7 | 43.4 | 97 | 825 |
| Part I | Ch 2 — Renewal and Erosion | 10.0 | 9.0 | 13.6 | 41.4 | 116 | 1180 |
| Part I | Ch 3 — Why We Misjudge Leaders | 10.5 | 9.4 | 14.2 | 39.2 | 101 | 1087 |
| Part II | Bridge | 9.6 | 8.9 | 12.7 | 48.5 | 23 | 292 |
| Part II | Ch 4 — Harm Under Influence | 9.3 | 8.7 | 12.6 | 49.6 | 78 | 942 |
| Part II | Ch 5 — Effectiveness and Its Illusions | 10.5 | 9.0 | 14.5 | 39.3 | 85 | 945 |
| Part II | Ch 6 — Legitimacy Over Time | 9.9 | 8.8 | 12.6 | 44.3 | 77 | 885 |
| Part III | Bridge | 9.7 | 8.3 | 13.2 | 47.9 | 15 | 188 |
| Part III | Ch 7 — Scale and Drift | 10.4 | 8.6 | 13.1 | 42.6 | 44 | 539 |
| Part III | Ch 8 — Tradeoffs Under Pressure | 10.8 | 9.2 | 14.6 | 35.6 | 43 | 430 |
| Part III | Ch 9 — What Happens Next | 10.9 | 10.1 | 14.4 | 38.0 | 36 | 422 |
| Back matter | Epilogue | 8.7 | 8.5 | 11.5 | 50.6 | 38 | 388 |
| Back matter | Appendix A — Legitimacy transfer | 11.3 | 9.1 | 14.1 | 31.9 | 66 | 664 |
| Back matter | Appendix B — Leadership patterns | 11.6 | 10.4 | 14.4 | 39.4 | 83 | 1289 |
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
| Bridge | `parts/part-3-scale-tradeoffs-and-what-happens-next/bridge.md` |
| Ch 7 — Scale and Drift | `parts/part-3-scale-tradeoffs-and-what-happens-next/chapter-7-scale-and-drift.md` |
| Ch 8 — Tradeoffs Under Pressure | `parts/part-3-scale-tradeoffs-and-what-happens-next/chapter-8-tradeoffs-under-pressure.md` |
| Ch 9 — What Happens Next | `parts/part-3-scale-tradeoffs-and-what-happens-next/chapter-9-what-happens-next.md` |
| Epilogue | `back-matter/epilogue.md` |
| Appendix A — Legitimacy transfer | `back-matter/appendix-a-legitimacy-transfer.md` |
| Appendix B — Leadership patterns | `back-matter/appendix-b-leadership-patterns.md` |
| Bibliography | `back-matter/bibliography.md` |
