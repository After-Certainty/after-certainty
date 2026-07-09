# Revision Final Report — *When Others Become Leaders*

**Date:** 2026-07-09  
**Branch:** `cursor/when-others-become-leaders-planning-ba72`

---

## Files changed

### Publication / build
- `index.md`
- `front-matter/reading-with-the-series.md`
- `front-matter/introduction-the-wrong-question.md`
- `front-matter/what-this-book-is.md`
- `back-matter/about-the-series.md` (new location; removed from front matter)
- Deleted: `front-matter/about-the-series.md`

### Manuscript prose
- `back-matter/epilogue-the-empty-chair.md`
- `parts/part-1-how-influence-begins/chapter-1-the-table.md`
- `parts/part-1-how-influence-begins/chapter-2-salt.md`
- `parts/part-1-how-influence-begins/chapter-3-victory.md`
- `parts/part-2-how-influence-moves/chapter-4-the-march.md`
- `parts/part-2-how-influence-moves/chapter-6-the-sign.md`
- `parts/part-3-how-influence-endures/chapter-7-the-house.md`
- `parts/part-3-how-influence-endures/chapter-9-the-bracelet.md`

### Research / bibliography
- `back-matter/bibliography.md`

### Planning (repo only)
- `docs/revision-publication-plan.md`
- `docs/expert-read-checklist.md`
- `docs/revision-final-report.md`

---

## Publication artifacts removed

| Artifact | Action |
|----------|--------|
| `## Planning docs` section in `index.md` | Removed from assembly |
| `## Related books` with repo paths | Removed |
| Internal intro footnote to `docs/research/` | Removed |
| `## Notes` on introduction (internal only) | Removed |
| Repo-relative series links (`../../when-others-look-to-you/...`, `docs/series-guide.md`) | Replaced with plain prose + after-certainty.com |
| Long v1/v2 tables, cluster maps, portfolio links | Compressed or removed from front matter |
| `What This Book Is` in publication index | Removed from export order (file retained in repo) |

**Empty Notes headings:** None found in chapter sources (all nine chapters contain footnote definitions). Introduction internal note removed.

---

## Word counts (prose units)

| Unit | Before | After | Change |
|------|-------:|------:|-------:|
| Introduction | 2,096 | 2,129 | +1.6% |
| Ch. 1 Table | 5,889 | 5,955 | +1.1% |
| Ch. 2 Salt | 5,209 | 5,350 | +2.7% |
| Ch. 3 Victory | 4,788 | 4,867 | +1.6% |
| Ch. 4 March | 5,674 | 5,724 | +0.9% |
| Ch. 5 Tree | 4,010 | 4,010 | 0% |
| Ch. 6 Sign | 5,272 | 5,272 | 0% |
| Ch. 7 House | 3,870 | 3,923 | +1.4% |
| Ch. 8 Neighborhood | 4,759 | 4,759 | 0% |
| Ch. 9 Bracelet | 2,507 | 2,820 | +12.5% |
| Epilogue | 4,900 | ~3,050 | ~−38% |
| **Total** | **48,974** | **~47,850** | **~−2.3%** |

**Epilogue:** Sequential chapter-by-chapter recap replaced with braided synthesis; strongest opening/closing movements preserved.

**Swift:** Expanded modestly with living-case framing, gift-economy/community distinction, and coordination vs. belonging; not padded with biography.

**Chapters >10% length change:** Ch. 9 only (+12.5%).

---

## Developmental changes

- **Epilogue compression:** ~38% reduction; nine mini-chapters braided into one associative middle
- **Swift chapter:** Preferred approach — expansion + early living-case qualification
- **Successor friction:** Added in Ch. 1 (interpretation/disloyalty), Ch. 2 (Naidu), Ch. 3 (Mbeki), Ch. 4 (local organizers), Ch. 7 (guest as participant)
- **Framework repetition:** Trimmed in epilogue terminology block; chapter-level echoes retained where object-led
- **Part titles:** **No change** — recommend author review (*How Influence Begins / Moves / Endures*)
- **Gandhi transition:** Bridge into celibacy/austerity section added
- **Introduction:** Comparison-defense sentence added; internal citation commentary removed

---

## Research changes

- **Citations added/replaced:** Ch. 9 notes [^b1–b3] now name Pollstar, *People*, CNN, *NYT*, AP
- **Bibliography:** Vague “Multiple outlets” entry replaced with named articles
- **Vague placeholders removed:** Introduction internal note; Ch. 9 “Multiple outlets”
- **Still requiring expert review:** See `docs/expert-read-checklist.md` (historical Jesus, Gandhi/Ambedkar, TRC, civil-rights, Hull-House, Rogers/Clemmons, contemporary fandom)

---

## Voice changes

- **Short paragraphs merged:** Ch. 6 (child/adult question sequence)
- **Epilogue:** Reduced stacked one-line recap structure
- **Preserved:** “Salt dissolves.”, “The chair became empty violently.” (in braided form), empty-chair opening and family closing

---

## Build validation

- **Local:** `make build-book` fails without `pandoc` in agent environment (expected)
- **Assembly:** `scripts/assemble.py --book-dir books/when-others-become-leaders` lists publication units only — no `docs/` planning paths
- **CI:** PR export job should validate DOCX/EPUB/PDF on push

---

## Open questions (author review)

1. **Part titles** — keep current or adopt *How Influence Takes Shape / How Influence Circulates / How Influence Becomes Culture* (or *…Leaves the Center*)?
2. **Footnote vs endnote** — current Pandoc footnotes unchanged
3. **Series note placement** — compressed front matter + full *About the Series* in back matter
4. **Swift as coda** — retained as Ch. 9 with living-case framing
5. **Trim size / spine / print cover** — defer until interior stable
6. **Expert readers** — see checklist

---

## Recommended next step

**Targeted expert review** in the areas listed in `docs/expert-read-checklist.md`, followed by **professional copyedit** and **print/EPUB proofing** — not another broad conceptual rewrite.
