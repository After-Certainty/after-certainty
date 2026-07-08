# How Meaning Moves — Publication Refinement Pass

**Branch:** `cursor/hmm-essayistic-rewrite-4cdb`  
**Date:** 2026-07-08  
**Scope:** Final tightly controlled polish before publication. No structural rewrite.

---

## 1. Files changed

| File | Change |
|------|--------|
| `parts/part-i-what-arrives-first/pattern-map.md` | Chapter/pattern relationship sentence; figure alt text |
| `parts/part-i-what-arrives-first/chapter-1-before-the-words.md` | `Meaning forms early` integrated |
| `parts/part-i-what-arrives-first/chapter-2-the-story-that-arrives-first.md` | Telegraph comparison refined |
| `parts/part-ii-rooms-that-accelerate-meaning/chapter-5-the-archive-in-the-kitchen.md` | `Meaning outruns the words` integrated |
| `parts/part-ii-rooms-that-accelerate-meaning/chapter-6-a-passing-comment-becomes-a-plan.md` | Philip obligation arc shortened |
| `parts/part-ii-rooms-that-accelerate-meaning/chapter-7-what-the-calendar-can-afford.md` | Nora smoothing abbreviated; Philip benefits from quiet surface |
| `parts/part-ii-rooms-that-accelerate-meaning/bridge.md` | `\newpage` before Part II |
| `parts/part-iii-what-can-still-move/bridge.md` | Reachability taxonomy removed |
| `parts/part-iii-what-can-still-move/chapter-9-still-reachable.md` | Intimate continuity fix; explanation trimmed |
| `parts/part-iii-what-can-still-move/chapter-10-what-restraint-makes-possible.md` | Power/cost fix; Nora preserves unresolved question |
| `front-matter/introduction-the-sentence-before-the-sentence.md` | Reachability advance taxonomy removed |
| `front-matter/authors-note.md` | “same dynamics” not “same pattern” |
| `back-matter/appendix-a-pattern-language-of-meaning.md` | Short Reachability note; `\newpage` |
| `back-matter/bibliography.md` | Orphans removed; metadata normalized |

---

## 2. Pattern-map clarification

Added after cluster introduction:

> Not every pattern below receives its own chapter ending. Some operate as secondary dynamics inside chapters organized around a more dominant principle.

Figure alt text: `Patterns grouped into Formation, Completion, Movement, Resolution, and Reinforcement`.

---

## 3. Exact pattern terms in prose

| Pattern | Location |
|---------|----------|
| **Meaning forms early** | Ch 1 — engineer’s sentence becomes room weather |
| **Intent gets assigned** | Ch 2 — preserved |
| **Meaning outruns the words** | Ch 5 — kitchen archive passage |

---

## 4. Reachability taxonomy reduced

| Location | Treatment |
|----------|-----------|
| Introduction | Removed “not an eleventh pattern” sentence |
| Part III bridge | Removed taxonomy; kept culminating question only |
| Chapter 9 | **Primary** — full Connection / Contact / Reachability distinction under Culminating Principle |
| Appendix A | Short note only — not eleventh pattern; no Ch 9 repetition |

---

## 5. Chapter 9 intimate continuity fix

Reply now addresses sister’s-visit / shared-planning conflict:

> “I wasn't planning it without you. I thought we were still leaving it open.”

The *ok* text thread echoed separately as its own memory shape—not blended into her reply.

---

## 6. Chapter 9 explanation trimmed

Removed stacked explanation (`no warmth required`, `no perfect apology`, duplicate history/account lines). Scene ends on unfinished phrase + life not closing the door.

---

## 7. Chapter 10 power/cost fix

Replaced “greatest cost” with “most visible organizational cost.” Added “Philip had learned what his standing could do.”

---

## 8. Nora’s unresolved-record intervention (Ch 10)

When Philip names what is unsettled, Nora records the question as unresolved—both paths, both risks—visible in the shared record.

---

## 9. Repetition changes

| Motif | Treatment |
|-------|-----------|
| Philip obligation | Ch 3 fullest; Ch 6 → testable interpretation; Ch 7 → benefits from quiet surface; Ch 10 → acts from learning |
| Nora note-cleaning | Ch 6 fullest; Ch 7 abbreviated; Ch 10 → preserves uncertainty visibly |
| Launch date / whiteboard | Preserved at anchor points |
| Epilogue ending | Unchanged |

---

## 10. Telegraph comparison

Replaced “operator’s discipline” with:

> Modern text threads recreate the same structural problem: brevity leaves context for the receiver to supply.

Footnote key renamed `c2-standage-telegraph`.

---

## 11. Author’s Note

“same pattern, different settings” → “the same forces moving through different settings.”

---

## 12. Bibliography entries removed

- Faden and Beauchamp, *A History and Theory of Informed Consent*
- Milgram, *Obedience to Authority*

---

## 13. Bibliography entries normalized

Full volume/issue/page metadata added for journal articles where footnotes provided detail (Suchman, Morrison, Baumeister & Leary, Easterbrook, Kahan, Kruglanski, Nickerson, Ross, Tversky & Kahneman, Weick et al., Tajfel & Turner). Morrison and Suchman titles match chapter footnotes.

---

## 14. Footnote validation

- **55** in-text references in assembly order
- **54** unique footnote definitions (c6-meeting-minutes cited twice — intentional)
- No missing definitions; no orphan definitions
- Sequential 1–55 in export order

---

## 15. Diagram and page-break changes

- Pattern-map caption via image alt text
- `\newpage` before Part II bridge
- `\newpage` before Appendix A

---

## 16. Generated outputs inspected

| Check | Result |
|-------|--------|
| `make typography-check-how-meaning-moves` | Pass |
| `scripts/assemble.py --parts` | Pass |
| `make build-book` | Blocked locally (no pandoc) |

---

## 17. Unresolved author decisions

1. Ross & Ward bibliography remains volume-less (footnote has no pages) — confirm preferred canonical cite.
2. DOCX/PDF visual QA pending CI or local Pandoc run.

---

## Acceptance criteria

All publication-refinement acceptance criteria met in source; DOCX render pending environment.
