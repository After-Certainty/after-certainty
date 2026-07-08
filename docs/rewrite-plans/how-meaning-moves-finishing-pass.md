# How Meaning Moves — Finishing Pass

**Branch:** `cursor/hmm-finishing-pass-b8e4`  
**Date:** 2026-07-08  
**Scope:** Publication finishing pass only. No structural rewrite.

---

## 1. Files changed

| File | Change |
|------|--------|
| `books/how-meaning-moves/parts/part-iii-what-can-still-move/chapter-9-still-reachable.md` | Restored compact fixed-object sequence; added contractual-obligation sentence |
| `books/how-meaning-moves/parts/part-iii-what-can-still-move/chapter-10-what-restraint-makes-possible.md` | Removed meta-reader sentence; revised authority-and-urgency cost line |
| `books/how-meaning-moves/back-matter/bibliography.md` | Ross & Ward corrected to *Values and Knowledge* chapter |
| `books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-4-when-the-pauses-disappear.md` | Ross & Ward footnote metadata |
| `books/how-meaning-moves/parts/part-iii-what-can-still-move/chapter-8-the-room-after-you-are-right.md` | Ross & Ward footnote metadata |
| `semantic/sources/ross-lee-and-andrew-ward-naive-realism-in-everyday-life.yml` | Semantic citation sync |
| `books/how-meaning-moves/book.yml` | `title_page_cover_unnumbered: true` |
| `schema/book.schema.json` | Optional `title_page_cover_unnumbered` |
| `tools/book_export_assets.py` | Title-page PDF/DOCX preprocessing helpers |
| `scripts/export_pdf.py` | Stage unnumbered cover for PDF |
| `scripts/export_docx.py` | Stage unnumbered cover for DOCX |
| `scripts/export_epub.py` | Resolve cover from `book.yml` |
| `tools/kindle-flatten.py` | Strip `book-cover.png` inline covers |
| `tests/test_title_page_cover.py` | Cover preprocessing tests |
| `tests/test_pdf_export_staging.py` | Updated for `stage_pdf_units` signature |

---

## 2. Chapter 9 lines restored

```markdown
Meaning that cannot move turns people into fixed objects—easier to manage, harder to correct. But people keep generating behavior after a reading settles. Humans stay larger than stabilized readings of them.
```

---

## 3. Exact location of the restoration

[`chapter-9-still-reachable.md`](../books/how-meaning-moves/parts/part-iii-what-can-still-move/chapter-9-still-reachable.md) — immediately after the Connection definition paragraph (following the `[^c9-goffman-interaction-ritual]` footnote block) and immediately before:

> Connection is what keeps a stale reading from turning into a cage.

---

## 4. Contractual-obligation sentence added

**Yes.** Inserted between the restored fixed-object sequence and the cage line:

```markdown
That obligation need not be warm. Sometimes it is familial, sometimes contractual, and sometimes simply the consequence of having to continue together.
```

---

## 5. Why “Nothing here requires malice” remained cut

Verified absent from manuscript. The introduction retains the approved variant “None of this requires malice.” Restoring the exact deleted line would add repetition; distortion-without-malice is already established across the book.

---

## 6. Chapter 2 labels preserved

Confirmed intact in `chapter-2-the-story-that-arrives-first.md`:

- The gap.
- The completion.
- The attribution.
- Confirmation.
- Curiosity ends.

---

## 7. Chapter 10 meta-reader sentence removed

Deleted: `The reader already knows the discipline.`

---

## 8. Chapter 10 “most expensive” sentence revised

**Before:** `It is most expensive where authority and urgency meet.`  
**After:** `It becomes especially consequential where authority and urgency meet.`

---

## 9. Ross and Ward bibliographic correction

**Corrected entry:**

Ross, Lee, and Andrew Ward. "Naive Realism in Everyday Life: Implications for Social Conflict and Misunderstanding." In *Values and Knowledge*, edited by Edward S. Reed, Elliot Turiel, and Terrance Brown, 103–135. Hillsdale, NJ: Lawrence Erlbaum Associates, 1996.

**Note:** The prior *Psychological Review* (1996) citation was incorrect. The work is a book chapter (APA PsycNet 1996-97682-006; publisher catalog for *Values and Knowledge*). Claims about naive realism and social conflict/misunderstanding are supported by the chapter scope.

---

## 10. Footnote audit result

| Check | Result |
|-------|--------|
| Definitions | 50 |
| Missing definitions | 0 |
| Unused definitions | 1 pre-existing (`[^c10-edmondson-fearless-organization]` — definition without in-text marker) |
| Sequential numbering at render | Pandoc assigns 1–50 in manuscript order; build warnings confirm unused definition only |

---

## 11. Bibliography audit result

34 bibliography entries. All entries have matching citations in chapter footnotes after Ross & Ward correction. No orphaned *Psychological Review* Ross & Ward stub remains.

---

## 12. Cover-generation fix

- Added `title_page_cover_unnumbered: true` to HMM `book.yml`
- PDF: markdown cover replaced with raw LaTeX `\includegraphics` inside `\thispagestyle{empty}` (no figure environment)
- DOCX: cover image uses empty alt text to avoid “Cover” caption
- EPUB: `--epub-cover-image` resolved from `book.title_page_cover`; inline cover stripped by kindle-flatten

---

## 13. Figure-numbering changes

| Element | Before | After |
|---------|--------|-------|
| Cover | Figure 1: Cover | Unnumbered, uncaptioned (page 1 image) |
| Pattern map | Figure 2 | Figure 1 |

---

## 14. Generated formats inspected

| Format | Built | Inspected |
|--------|-------|-----------|
| PDF | Yes | Yes — `pdfimages` confirms cover image on page 1; `pdftotext` confirms no “Figure 1: Cover”; pattern map is Figure 1; Ch 9/10 edits present |
| DOCX | Yes | Yes — no “Figure 1: Cover” in `document.xml` |
| EPUB | Yes | Yes — cover metadata present; no “Figure 1: Cover” in body HTML sampled |

Artifacts: `books/how-meaning-moves/how-meaning-moves.{pdf,docx,epub}` and `build/books-how-meaning-moves/`.

`make typography-check-how-meaning-moves`: pass.

---

## 15. Unresolved production issues

- Pre-existing unused footnote definition `[^c10-edmondson-fearless-organization]` in Chapter 10 (Pandoc warning only; footnote count remains 50 definitions).
- Portfolio-wide cover rename to `book-cover.png` deferred (4 books still use `BookCover.png`).

---

## 16. Remaining author decision

Whether to remove the unused Edmondson footnote definition in Chapter 10 or add an in-text marker — out of scope for this finishing pass unless author requests it.
