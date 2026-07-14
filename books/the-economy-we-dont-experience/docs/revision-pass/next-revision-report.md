# Next Revision Report — Structural & Evidence Pass

**Book:** *The Economy We Don’t Experience*  
**Branch:** `cursor/economy-structural-evidence-pass-0e20`  
**Backup of pre-pass manuscript:** `backup/economy-pre-structural-revision-0e20`  
**Baseline body words (excl. bibliography):** 31,599  
**Revised body words:** 28,354 (−3,245; **−10.3%**)

## Section summary

| Section | Main change | Words before | Words after | Citation status | Remaining concern |
|---|---|---:|---:|---|---|
| Introduction | Trimmed Ch5/Ch8 foreshadow; kept aisle + chart/receipt; two-clock retained lightly | 1145 | 1005 | CPI note narrowed; Pew named | Could still trim anticipatory “nearer voices” slightly |
| Chapter 1 | Intact (ownership of measurement / two clocks) | 2871 | 2871 | OK | None for this pass |
| Chapter 2 | Cut Invisible Achievement; SPF Q4 2022 anchor; ~5 movements; scene ending | 3724 | 2870 | SPF + SEP split from Ch8 | Verify SPF percentage wording against PDF |
| Chapter 3 | Less CPI reteach; nurse mid-callback; stubbed full relational theory | 3194 | 2707 | OK | Household ownership restored without matching prior length |
| Chapter 4 | Composite disclosure; merged headings; Ch7 politics stubbed | 3471 | 2847 | Composite note added | None major |
| Chapter 5 | Emotional relief mechanism; Hovland/Lupia; Kahneman off platforms | 3671 | 3686 | Messenger sources added | Pew still multi-topic |
| Chapter 6 | Incentives deepened; Powell/Reuters compression case; Bernanke split; scene ending | 2826 | 2789 | Adjacent markers fixed | Spot-check transcript vs Reuters |
| Chapter 7 | Headings merged; neighbor mid/late callbacks; Bartels; ending in scene | 3307 | 3015 | Bartels added | Expressive-mandate literature still thin |
| Chapter 8 | Resilience own section; 2023 banks developed; Bernanke off 2020s facts | 3895 | 3627 | FSR/FDIC/Joint Statement | Stress-test note still multi-year |
| Conclusion | Minimal / none | 725 | 725 | OK | None |
| Appendix | ~20% cut; practical framework ending; less chapter re-diagnosis | 2770 | 2212 | Contingent distrust kept | OK |

## Deliverables checklist

1. **Modified files** — manuscript units listed above; `back-matter/bibliography.md`; `docs/revision-pass/*`.
2. **Revised total word count** — 28,354 body words (−10.3% vs pre-pass production).
3. **Word-count change by chapter** — see table.
4. **Headings merged/removed** — Ch2–Ch8 and appendix consolidated to ~4–6 movements (Ch8: 6; others ≤5 substantial internal headings plus scene endings).
5. **Repeated concepts cut/relocated** — Ch2 guardrails → Ch8; Ch3 CPI reteach cut; Ch3 relational theory stubbed → Ch5; Ch4 electoral theory stubbed → Ch7; Ch6 empathy reteach thinned.
6. **Real-world cases added** — (1) SPF Q4 2022 recession-quarter odds; (2) Powell Sept 20, 2023 soft-landing exchange vs Reuters; (3) March 2023 SVB/Signature response (FSR, Joint Statement, BTFP, FDIC Options).
7. **Composite disclosures** — Ch4 governor/grocery-video newly disclosed; others already disclosed and retained.
8. **Citation problems fixed** — Bernanke scoped to historical communication/2008 reform memory; Kahneman removed from platform/messenger claims; Fed/Bernanke markers split; Ch4 composite added.
9. **Sources still requiring human verification** — SPF table wording; Powell/Reuters wording; FDIC Options PDF details; remaining Pew umbrella notes.
10. **Bibliography** — Removed: Haldane; Kashyap & Stein; Mankiw; Rodrik; Sunstein; Yellen; combined Fed mega-entry. Added/split: SPF; Hovland & Weiss; Lupia & McCubbins; Bartels; Powell transcript; Reuters Schneider; FDIC Options; Joint Statement; titled FSR/SEP/stress-test entries.
11. **Build and validation results**
    - `make validate-book-specs` — passed (30 book specs)
    - `make build-book DIR=books/the-economy-we-dont-experience FORMATS="docx epub"` — DOCX + EPUB built; manifest written under `build/books-the-economy-we-dont-experience/`
    - `make lint` (Ruff) — passed after local Ruff install
    - `pytest` — 126 passed; 2 failed in `tests/test_closing_export.py` (reference-docx styles / PDF export), unrelated to this manuscript prose change
    - Cover caption: DOCX export already blanks cover alt text via `prepare_title_page_for_docx`
    - About the Series moved to back-matter assembly order in `index.md`
12. **Remaining editorial risks** — net cut ~10.3% (edge of 5–10% band); Ch2/Ch3/Ch4 among largest absolute cuts; remaining Pew umbrella notes; SPF/Powell/FDIC wording should be human-spot-checked against primary PDFs; hanging indents / full TOC typography still depend on shared reference DOCX.

## Quality gate notes

- Thesis, chart/receipt metaphor, chapter titles/order, and voice preserved.
- Chapters 1 and 3 differentiated (measurement vs household month-fit).
- Chapter 5 now states relief-of-proof mechanism for relational credibility.
- Chapter 6 emphasizes institutional incentives and clipping.
- Chapter 8 owns resilience/guardrails with 2023 banking case.
- Appendix shorter and more practical; conclusion concise.
- Endings varied: Ch2/Ch6/Ch7 scene-integrated; Ch1/Ch4/Ch5/Ch8 compressions retained.


## Final production micro-pass (post–editorial finish)

Author verdict: editorially finished; no further developmental rewrite.

Completed:

1. Chapter 2: “the previous chapter” → “the same two-clock discipline.”
2. Contents: dropped Front Matter / Back Matter labels; DOCX now injects a Word TOC field (page numbers + links on Update Field). Markdown links retained for EPUB.
3. DOCX `interior_finish` (`build.formats.docx.interior_finish`): no running head/page number on cover or front matter; Arabic numbering from Introduction; running heads suppressed on part/chapter/conclusion/appendix/bibliography openers.
4. Bibliography print URLs: kept only the five unique web sources (Powell transcript, FDIC Options, SPF Q4 2022, Reuters soft-landing, Joint Statement). No further aggressive stripping.

## Controlled editorial/production pass (follow-up)

| Item | Status |
|------|--------|
| Remove chapter-navigation scaffolding | Done (Ch2–Ch4, appendix) |
| Optional Ch5 Missing Translators trim | Done (~210 words) |
| Optional Ch8 Politics of Friction trim | Done (~320 words) |
| Weak citation fixes (Ch4 employment/Pew; Ch6 Pew; Ch7 Shiller; Appendix) | Done — interpretive claims no longer carry mismatched notes |
| Cover caption | Fixed via `title_page_cover_unnumbered` + empty-alt staging |
| Page breaks | `\newpage` → OpenXML in DOCX staging; markers on parts/chapters/back matter |
| Contents | Added `front-matter/contents.md` |
| Bibliography hanging style | `custom-style="Bibliography"` + economy `docs/export/reference.docx` |
| Running header / page numbers | In economy reference.docx |
| About the Series | Moved to back matter (generation path + index) |

Body words after this follow-up: ~27,659 (excl. bibliography).
