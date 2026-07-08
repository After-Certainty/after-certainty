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

---

# Phase 2 — Rhythm Variation Pass (executed)

**Status:** Complete on `cursor/hmm-essayistic-rewrite-4cdb`.

## Files changed

| File | Rhythm changes |
|------|----------------|
| `chapter-4-when-the-pauses-disappear.md` | Extended opening scene—failed pause, tempo decides before conceptual pivot |
| `chapter-7-what-the-calendar-can-afford.md` | Interleaved Philip noticing alignment in feedback scene; trimmed middle exposition; shortened Returning Principle; calendar close carries ending |
| `chapter-8-the-room-after-you-are-right.md` | Merged middle blocks; less segmented conceptual stacking |
| `chapter-9-still-reachable.md` | Trusted scenes; trimmed post-kitchen Contact/Connection taxonomy; removed duplicate conference-room close |
| `chapter-10-what-restraint-makes-possible.md` | Cumulative synthesis from Philip/Nora act; shortened Returning Principle; removed redundant conceptual stack |

## Footnotes

- **51** references (was 55); **50** unique definitions
- Removed uncited: Ch 7 Deming, Ch 10 Arendt/Edmondson/Fricker (prose cut)
- Deming removed from bibliography; Arendt *Life of the Mind* retained via Ch 3

## Preserved verbatim

All benchmark aphorisms and epilogue two-line close unchanged.

## Acceptance

- [x] Ch 7–10 less proportionally predictable
- [x] Returning principles shorter in Ch 7 and Ch 10
- [x] Principle headings retained
- [x] Ch 9 scenes trusted; post-scene explanation trimmed
- [x] Overall length shorter (not expansion)

---

# Phase 2 — Rhythm Variation Pass (planned, not yet executed)

**Status:** Author-approved direction from external critique (Claude). Incorporate variation *within* the approved form—not a structural rewrite.

**Goal:** A book about resisting premature pattern recognition should not let readers predict its own chapter machinery too easily by Ch 7–10. Preserve scene-first openings, end-of-chapter principles (Core / Returning / Culminating), recurring strands, and the layered architecture:

| Layer | Concepts |
|-------|----------|
| Forces | Signal, Compression, Restraint |
| Relational context | Connection |
| Practice | Contact |
| Culmination | Reachability (not an eleventh pattern) |
| Formal patterns | Ten-pattern map + Appendix A |

**Do not:** remove principle headings, reorder chapters, add new strands, or revert to field-guide structure.

---

## R1. Vary opening-scene duration

**Front half (Ch 1–6):** Keep consistency — establishes reading contract. Ch 6 is the benchmark for earned length (comment → room → hallway → notes → plan → second conversation).

**Selective lengthening (optional, light):**
- **Ch 4 — When the Pauses Disappear:** Scene is brief and generalized before interpretive machinery arrives. Stay inside the exchange longer — one or two more beats of tightening tempo, a visible pause that fails, a line that shifts from issue to identity — before the conceptual widening. Do not add a new cast.

**Ch 7–10:** Vary proportion — some chapters open longer in scene, some pivot sooner. Ch 8 already opens abruptly (“He was right.”) — preserve.

---

## R2. Interleave analysis into scenes (selective)

**Model:** Ch 6 — Nora’s documentation work is simultaneously action and analysis.

**Target chapters for 1–2 woven turns** (brief widen → scene continues → reader sees differently):
- **Ch 7:** e.g. Philip notices alignment before silence *during* the feedback beat, not only in retrospective exposition.
- **Ch 8:** Reduce regular segmentation in the middle; let correctness land and consequence unfold with fewer section-break pivots.
- **Ch 9:** Trust the two Reachability scenes; trim post-scene taxonomy/explanation further (building on publication pass trim).
- **Ch 10:** Already cumulative — let reflection emerge from Philip’s act and Nora’s record, not only from stacked conceptual paragraphs.

**Rule:** One or two interleaved turns per chapter max. No new scenes.

---

## R3. Vary principle-ending size

| Chapter | Principle | Target size |
|---------|-----------|-------------|
| Ch 6 | Core: Meaning Reinforces Itself | **Keep fuller** — first institutional presentation |
| Ch 7 | Returning: Meaning Reinforces Itself | **Shorten** — 1 compact paragraph; calendar image carries ending |
| Ch 9 | Culminating: Reachability | **Keep fuller** — primary taxonomy location |
| Ch 10 | Returning: Contact Keeps the Read Open | **Shorten** — 2 sentences after heading; chapter body is synthesis |

Other chapters: no uniform three-paragraph principle blocks unless earned.

---

## R4. Selective aphorism rationing (final third)

**Preserve verbatim** (do not touch):
- “He had not made the call. The sentence had.”
- “Philip did not stop it. He did not think he had started it.”
- “That isn’t the same as deciding.” / “No, but it is what the room did.”
- “Better communication had been possible. It had not been affordable.”
- “The explanation closed something. Not the issue—the space around it.”
- “They did not become friends. They remained reachable.”
- “Connection is what keeps a stale reading from turning into a cage.”
- “Restraint does not solve communication. It keeps it human.”
- Epilogue two-line close

**Test for other compressed lines:** Is this line doing conceptual work the surrounding prose has earned, or merely signaling section end? If the latter, let the section conclude in normal prose.

**Priority trim zones:** Ch 7–10 conceptual middles and duplicate landing lines.

---

## R5. Chapter-specific targets (greatest benefit Ch 7–10)

### Chapter 7 — What the Calendar Can Afford
- Shorten Returning Principle to ~1 paragraph.
- Let “The calendar had won” + Nora opening old notes carry the chapter close.
- Optional: one interleaved beat in feedback scene.

### Chapter 8 — The Room After You Are Right
- Preserve abrupt “He was right.” opening.
- Soften middle segmentation — fewer stacked conceptual blocks with aphoristic landings.
- Keep Core Principle: Meaning Gets Distorted at proportional weight.

### Chapter 9 — Still Reachable
- Trust workplace + intimate scenes more.
- Further trim post-kitchen taxonomy (Connection/Contact exposition that repeats Ch 9 principle).
- Keep Culminating Principle full but avoid duplicating Appendix language.

### Chapter 10 — What Restraint Makes Possible
- Feel cumulative/reflective — less new diagnosis.
- Short Returning Principle (readers know Contact).
- Nora’s unresolved record already models structural restraint — let scene carry more.

### Chapter 4 (optional, lighter touch)
- Extend opening conflict scene before first conceptual pivot.

---

## R6. What stays unchanged

- Ten-chapter / three-part architecture
- Principle headings (Core / Returning / Culminating)
- Philip, Nora, engineer, unnamed couple strands
- Pattern map after Part I
- Reachability discovery primarily in Ch 9
- Epilogue ending
- Bibliography / footnote integrity

---

## R7. Deliverables on execution

Update `docs/rewrite-plans/how-meaning-moves-publication-refinement.md` § Phase 2 with files changed.

Create brief rhythm-pass log: per-chapter changes to scene length, interleaving, principle size, aphorisms cut/preserved.

Run typography check; verify footnote count unchanged unless prose edits add/remove citations.

---

## R8. Acceptance criteria (rhythm pass)

- [ ] Ch 7–10 feel less proportionally predictable
- [ ] Returning principles in Ch 7 and Ch 10 shorter than Ch 6 / Ch 9 culminations
- [ ] No principle headings removed
- [ ] Preserved aphorism list untouched
- [ ] Ch 9 intimate scene trusted; less post-scene explanation
- [ ] Layered architecture (forces / context / practice / culmination) unchanged
- [ ] Overall length neutral to slightly shorter (not expansion)

