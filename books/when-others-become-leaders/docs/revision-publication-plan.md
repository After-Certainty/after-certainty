# Revision & Publication Plan — *When Others Become Leaders*

**Status:** In progress  
**Branch:** `cursor/when-others-become-leaders-planning-ba72`  
**Baseline word count (prose units):** ~49,594 words (2026-07-09)

---

## Canonical sources

| Role | Path |
|------|------|
| Manuscript hub | `index.md` |
| Front matter | `front-matter/` |
| Chapters | `parts/part-{1,2,3}-*/chapter-*.md` |
| Back matter | `back-matter/epilogue-the-empty-chair.md`, `back-matter/bibliography.md` |
| Config | `book.yml` |
| Planning (repo only) | `docs/**` |
| Build | `scripts/assemble.py`, `scripts/build.py`, `make build-book DIR=books/when-others-become-leaders` |

---

## Files that will change

### Build / publication boundary
- `index.md` — remove planning and related-book sections; reorder front matter
- `front-matter/reading-with-the-series.md` — compress to ~1 page; plain prose
- `front-matter/about-the-series.md` — move to back matter
- `front-matter/what-this-book-is.md` — remove internal cross-links
- `front-matter/introduction-the-wrong-question.md` — remove internal footnote; strengthen comparison defense

### Developmental prose
- `back-matter/epilogue-the-empty-chair.md` — compress ~30–40%
- `parts/part-3-how-influence-endures/chapter-9-the-bracelet.md` — modest expansion + living-case framing + citations
- Selected chapters for successor friction (4–6): Ch. 1, 2, 3, 4, 7, 9
- `parts/part-1-how-influence-begins/chapter-2-salt.md` — Gandhi celibacy bridge
- Framework echo reduction across intro, chapters, epilogue

### Research / back matter
- `back-matter/bibliography.md` — align with new/changed notes
- `docs/expert-read-checklist.md` — new
- `docs/revision-final-report.md` — new (Phase 10)

---

## Build-pipeline changes

- **No new scripts.** Exclude planning by removing `## Planning docs` and `## Related books` from `index.md` (assemble only includes linked paths under the book directory).
- **Copyright:** Add generated `front-matter/copyright.md` to `index.md` front-matter list (matches sibling books).
- **Cover:** `book.yml` already sets `title_page_cover`; interior excludes cover asset as ordinary chapter.
- **Series note:** Single compressed front-matter page; full series frame relocated to back matter.

---

## Developmental edits (by phase)

| Phase | Work | Target |
|-------|------|--------|
| 1 | Publication boundary | No repo paths, no planning in exports |
| 2 | Epilogue compression | ~4,000–4,500 words; braided middle |
| 2 | Swift chapter | ~3,500–4,000 words; living-case qualification earlier |
| 2 | Framework echoes | Reduce explicit scaffolding after intro |
| 2 | Part titles | **Recommend only** — see Decisions |
| 3 | Successor friction | Light additions in 4–6 chapters |
| 4–8 | Chapter-specific, citations, rhythm, intro/epilogue review | Per editorial brief |
| 9 | Build validation | DOCX/EPUB/PDF via CI or local pandoc |
| 10 | Final report | Word counts, artifacts removed, open questions |

---

## Citation work

- Replace vague Swift note [^b2] with named articles (People, CNN, NYT).
- Audit Pollstar [^b1] and AP [^b3] for full publication data.
- Scan chapters 6–9 for placeholder phrasing.
- Ensure bibliography entries match notes; remove internal commentary from bibliography.

---

## Style work

- Merge mechanical short paragraphs in Sign, epilogue (post-compression), chapter conclusions, introduction.
- Preserve high-impact isolated lines (e.g. “Salt dissolves.”, “The chair became empty violently.”).
- Reduce clustering of: “The distinction matters.”, “This is why…”, “The question is…”, “Perhaps…”.

---

## Validation steps

1. `make lint` if Python under `tools/`, `scripts/`, `tests/` changes
2. `make build-book DIR=books/when-others-become-leaders`
3. Inspect assembled markdown for leaked paths and empty `## Notes`
4. CI: WOBL export job on PR
5. Word-count report before/after by unit

---

## Decisions requiring author review

| Item | Recommendation | Action |
|------|----------------|--------|
| Part titles | Keep current (*How Influence Begins / Moves / Endures*) unless author prefers *How Influence Takes Shape* + *How Influence Leaves the Center* | Document only; no auto-change |
| Footnotes vs endnotes | Keep Pandoc footnotes/endnotes as rendered today | No format change without author |
| Series note placement | Compressed note in front matter; full *About the Series* in back matter | Implement |
| Swift as coda vs chapter | **Preferred:** modest expansion, remain Ch. 9 | Implement preferred approach |
| Trim size / spine / print cover | Defer until interior stable | Not in scope |

---

## Risks of over-editing

- Flattening distinct chapter voices by uniform framework trimming
- Cutting epilogue passages that carry the book’s best synthesis
- Successor-friction inserts becoming a repeated formula
- Citation density making later chapters feel more “academic” than essayistic
- Merging short paragraphs that carry moral turns

**Mitigation:** Edit in passes; preserve object-led endings; limit successor friction to history-supported moments; report before structural changes.

---

## Execution log

| Date | Phase | Notes |
|------|-------|-------|
| 2026-07-09 | 0 | Plan created; baseline counts recorded |
| 2026-07-09 | 1 | Publication boundary: index, series note, intro footnote, about-the-series to back matter |
| 2026-07-09 | 2–6 | Epilogue compression, Swift expansion, successor friction, Gandhi bridge, citations, Sign rhythm |
| 2026-07-09 | 9–10 | Assembly verified; final report + expert checklist |
