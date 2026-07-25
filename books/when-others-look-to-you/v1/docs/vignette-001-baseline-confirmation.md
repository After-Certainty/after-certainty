# VIGNETTE-001 — Baseline Confirmation

Kickoff record only. No manuscript prose changes. No new editorial
recommendations.

## Baseline

| Item | Value |
|---|---|
| Implementation branch | `cursor/wolty-vignette-architecture-plan-ca80` |
| Starting commit (this confirmation) | `64840573e85d3cf5272ba94ca0921ec75ee4d390` |
| Conceptual baseline on `main` | PR #364 (`4db44908`) — preservation-first editorial revision |
| Plan authority | [`vignette-architecture-plan.md`](vignette-architecture-plan.md) |
| Confirmation date | 2026-07-25 |

Branch relationship: this branch contains the planning commits on top of `main`
with the merged editorial revision. Implementation continues on this branch.

## Preservation validation

```bash
python3 tools/validate_editorial_preservation.py \
  --book-dir books/when-others-look-to-you/v1
```

Result: **OK — 41 verbatim protection(s) present.**

## Chapter source paths (confirmed present)

| Task | Path |
|---|---|
| VIGNETTE-002 | `parts/part-2-renewal-erosion-circulation/chapter-2-the-two-groups.md` |
| VIGNETTE-003 | `parts/part-3-harm-effectiveness-legitimacy/chapter-6-harm-under-influence.md` |
| VIGNETTE-004 (later skipped) | `parts/part-3-harm-effectiveness-legitimacy/chapter-7-effectiveness-and-its-illusions.md` |
| VIGNETTE-005 | `parts/part-4-scale-pressure-misjudgment/chapter-9-scale-and-drift.md` |
| VIGNETTE-006 (first prose) | `parts/part-4-scale-pressure-misjudgment/chapter-10-tradeoffs-under-pressure.md` |
| VIGNETTE-007 | `parts/part-4-scale-pressure-misjudgment/chapter-11-why-we-misjudge-leaders.md` |
| VIGNETTE-008 (deferred) | `front-matter/introduction-attention-finds-a-focus.md`; `parts/part-1-how-influence-forms/chapter-1-the-weight-of-being-looked-to.md` |
| Protected models | Ch5 `.../chapter-5-circulation.md`; Ch8 `.../chapter-8-legitimacy-over-time.md` |
| Continuity-only | Ch12 `parts/part-5-closing/chapter-12-what-happens-next.md`; `back-matter/epilogue.md` |

## Canonical word counts

Tooling: `tools/manuscript_structure.build_structure_for_book` /
`count_words` on TOC-linked units from `index.md`.

| Unit | Words | Kind |
|---|---:|---|
| Preface | 335 | other |
| Acknowledgements | 305 | other |
| Typographical Conventions | 246 | other |
| Introduction | 673 | introduction |
| Bridge I | 130 | bridge |
| Chapter 1 | 1,058 | chapter |
| Bridge II | 136 | bridge |
| Chapter 2 | 938 | chapter |
| Chapter 3 | 1,343 | chapter |
| Chapter 4 | 1,246 | chapter |
| Chapter 5 | 2,151 | chapter |
| Bridge III | 106 | bridge |
| Chapter 6 | 2,502 | chapter |
| Chapter 7 | 1,119 | chapter |
| Chapter 8 | 1,419 | chapter |
| Bridge IV | 136 | bridge |
| Chapter 9 | 1,011 | chapter |
| Chapter 10 | 1,424 | chapter |
| Chapter 11 | 2,122 | chapter |
| Bridge V | 76 | bridge |
| Chapter 12 | 631 | chapter |
| Epilogue | 523 | afterword |
| Appendix A | 1,565 | appendix |
| Appendix B | 1,438 | appendix |
| Glossary | 475 | other |
| **TOC-linked total (this run)** | **23,108** | |

Active major prose baselines for later length gates:

| Chapter | Words | Formal Vignette Blocks |
|---|---:|---:|
| 2 | 938 | 0 |
| 6 | 2,502 | 7 |
| 7 | 1,119 | 2 |
| 9 | 1,011 | 1 |
| 10 | 1,424 | 2 |
| 11 | 2,122 | 2 |

Formal `Vignette Block` count in `parts/`: **26** (matches plan).

## Plan ↔ manuscript drift

Checked approved anchors and scene presence against current prose.

| Check | Result |
|---|---|
| Ch2 triage protocol + dosage-order risk | Present |
| Ch2 school attendance / thresholds secondary case | Present (line-wrapped “attendance / intervention protocol”) |
| Ch6 cold-chain log/door; Rivet; Peak; Tournament; Quarterly; Escalation | Present (7 VGs) |
| Ch9 public updates + paperwork / reporting cycles + mentoring | Present |
| Ch10 central signature / approval path / command protocol; two city VGs | Present |
| Ch11 Fast Desk + Smooth Board + dashboard | Present |

**Meaningful drift:** none.

Harmless documentation fix applied in the plan in the same commit as this
record: classification rollup “Active major prose chapters” corrected from 4 → 5.

## Next task

**VIGNETTE-006 — Chapter 10** one-city temporal architecture, followed by the
human calibration gate before Chapters 2 and 6.
