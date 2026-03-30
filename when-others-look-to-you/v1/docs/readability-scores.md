# Readability scores (manuscript sources)

> **Generated file.** Do not edit by hand. Regenerate with:
> `python3 scripts/readability_scores.py`

**Last generated:** 2026-03-29 06:09 UTC

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
| Front matter | Author's note | 7.7 | 7.7 | 10.1 | 58.2 | 29 | 300 |
| Front matter | Preface | 9.2 | 9.1 | 11.4 | 51.5 | 23 | 287 |
| Front matter | Acknowledgements | 6.1 | 6.2 | 6.8 | 78.0 | 16 | 239 |
| Front matter | Introduction | 8.6 | 8.8 | 11.9 | 53.9 | 44 | 508 |
| Front matter | Typographical conventions | 10.3 | 9.8 | 12.6 | 50.9 | 22 | 365 |
| Part I | Bridge | 6.9 | 7.4 | 9.5 | 61.4 | 21 | 184 |
| Part I | Ch 1 — The Weight of Being Looked To | 9.2 | 7.9 | 12.4 | 44.3 | 99 | 829 |
| Part I | Ch 2 — Renewal and Erosion | 9.7 | 8.9 | 13.3 | 43.7 | 123 | 1264 |
| Part I | Ch 3 — Why We Misjudge Leaders | 10.2 | 9.1 | 13.9 | 40.6 | 105 | 1087 |
| Part II | Bridge | 9.0 | 8.3 | 11.9 | 53.4 | 20 | 256 |
| Part II | Ch 4 — Harm Under Influence | 9.1 | 8.4 | 12.5 | 50.7 | 82 | 947 |
| Part II | Ch 5 — Effectiveness and Its Illusions | 10.4 | 8.9 | 14.5 | 39.5 | 88 | 950 |
| Part II | Ch 6 — Legitimacy Over Time | 9.9 | 8.7 | 12.7 | 43.6 | 81 | 883 |
| Part III | Bridge | 9.7 | 8.1 | 12.7 | 48.3 | 13 | 165 |
| Part III | Ch 7 — Scale and Drift | 10.4 | 8.5 | 13.3 | 42.2 | 45 | 541 |
| Part III | Ch 8 — Tradeoffs Under Pressure | 10.3 | 8.7 | 14.2 | 37.5 | 48 | 446 |
| Part III | Ch 9 — What Happens Next | 10.6 | 9.8 | 14.4 | 38.9 | 38 | 423 |
| Back matter | Epilogue | 8.8 | 8.5 | 11.7 | 49.4 | 41 | 394 |
| Back matter | Appendix A — Legitimacy transfer | 11.2 | 9.0 | 14.0 | 32.8 | 66 | 665 |
| Back matter | Appendix B — Leadership patterns | 12.0 | 10.8 | 15.1 | 36.3 | 82 | 1258 |
| Back matter | Bibliography | 9.9 | 6.3 | 12.0 | 32.7 | 67 | 310 |

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
