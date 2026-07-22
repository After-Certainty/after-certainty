# Final publication-preparation report

Manuscript: *The World We Make Together*

Branch: `cursor/the-world-we-make-together-publication-3055`

## Deliverables summary

1. **Final DOCX / PDF page count:** 181 pages (LibreOffice PDF export of the finished DOCX)
2. **Final manuscript word count:** ~48,722 (`wc -w` over front matter, parts, and back matter sources)
3. **TOC removed:** Contents page deleted from the export hub; `docx_interior_finish` now removes any Contents/TOC field instead of inserting one. Verified: no “Contents” heading, no TOC field, no Update Field instructions in the DOCX/PDF
4. **Part I added:** `parts/part-1-who-makes-history/bridge.md` — title-only page matching Parts II–IV heading style; linked from `index.md` before Chapter 1. Verified in DOCX H1 sequence and PDF (Part I on page 11)
5. **Duplicate footnotes consolidated:**
   - **Little Rock:** split former combined Brown/EO/chronology note; Sept 23 removal vs Sept 25 federal entry now separate precise notes (`c2-sept23`, `c2-eisenhower-sept25`); Brown stands alone
   - **Pullman:** former repeated Strike Commission block split into scoped notes (`c9-strike`, `c9-aru`, `c9-injunction`, plus existing rents/commission notes)
   - **Flint:** Murphy/National Guard (`c9-murphy`) separated from Women’s Emergency Brigade (`c9-brigade`)
6. **Notes changed for specificity:** ~12 (SAHO/Denis Farrell; USDA FAQs + BlackPast; Founders Online / Mount Vernon Newburgh pages; King Institute page URL; Little Rock/Pullman/Flint scoping)
7. **Still requiring human review:** Apollo SP-4102 workforce page pin; Mahalia Jackson prompt as recollection; some museum/NPS site-level pages (not single item IDs); Northern Ireland referendum results still institutional rather than a single archived PDF URL
8. **Bibliography:** Removed vague Parliament SA homepage and generic Washington “documentary editions” entries; added BlackPast, Founders Online, Mount Vernon Newburgh pages, SAHO Denis Farrell / 1994 elections pages; USDA entry now FAQs URL; King Institute URL corrected; hanging-indent `Bibliography` style blocks retained
9. **Hanging indents:** Confirmed via `::: {custom-style="Bibliography"}` blocks (same production style as prior pass)
10. **Three sentence corrections:** Completed (Ballot “wisest”; Ballot “but only one place”; Window power-with sentence)
11. **Copyedit / encoding:** Soft-hyphen / replacement-glyph scan clean in source and DOCX XML; Chapter 7 `\newpage` already present; no `utm_` tracking parameters found
12. **Artifact paths:**
    - `/workspace/books/the-world-we-make-together/the-world-we-make-together.docx`
    - `/workspace/books/the-world-we-make-together/the-world-we-make-together.pdf`
    - Also mirrored under `/tmp/twmt-pub/` from this build
13. **Integrity:** No historical cases, governing claims, chapter structures, object scenes, or substantive arguments changed beyond the specified sentence fixes, Part I title page, citation scoping, and USDA influence attribution narrowed away from an unsupported USDA acknowledgment claim
14. **Release status:** `READY AFTER HUMAN VERIFICATION`
