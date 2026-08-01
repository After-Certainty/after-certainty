# Final Proof and Production-Preparation Pass — Change Log

**Book:** *The Case That Does Not Fit*  
**Subtitle:** *How Rules Protect Us—and What Institutions Must Do When They Misread Us*  
**Pass date:** August 1, 2026  
**Branch:** `cursor/the-case-that-does-not-fit-draft-6d58`

Proofing and production-prep only. No developmental rewrite. **Not print- or ebook-production-ready.**

---

## Word and page counts

| Metric | Value |
|--------|------:|
| Starting manuscript words | 30,183 |
| Final manuscript words | 30,191 |
| **Net change** | **+8** |
| LibreOffice PDF pages (Letter conversion of DOCX) | **95** |

Word pagination in Microsoft Word with the reference style may differ from LibreOffice’s conversion; this pass did not retune layout to a prior page target.

---

## Required proofing corrections

### 1. Merged adjacent Section 504 footnotes (Chapter 7)

- Removed adjacent markers `[^c7-smithsonian-504][^c7-nps-504]` after the occupation sentence.
- Single marker `[^c7-504-sit-in]` now cites both Smithsonian and NPS.
- Kept `[^c7-smithsonian-504]` on the earlier April 5 sentence alone.
- Removed standalone `[^c7-nps-504]` definition.
- Rendered check: `504 regulations.20 Organizers` (single marker; **no “2021” merge**).

**Other adjacent footnote markers searched:** none found elsewhere in the manuscript body.

### 2. Chapter 9 dash punctuation

Corrected:

> The very features that make it useful—speed, breadth, deference, secrecy, and simplified categories—are the features that can strip judgment from the decision.

(Previously used `--` / non-em dashes.) Manuscript-wide search found no other accidental en-dash/hyphen em-dash substitutes in body prose.

### 3. Clarified *Pulsifer* footnote

Revised note text:

> *Pulsifer v. United States*, 601 U.S. 124 (2024). The Court held that a defendant is ineligible if any one of the listed disqualifying criminal-history characteristics applies.

Body sentence unchanged.

---

## Outline-facing language removed

### Chapter 8 (quoted revised transition)

> Accommodation shows that equality sometimes requires individualized adjustment. Appeal shows that individualized correction must be institutionalized. The exclusion order shows what happens when emergency and category overwhelm the possibility of either. The stamp is the quieter middle technology: the system's way of pausing before its own authority becomes irreversible.

### Chapter 9 (quoted revised opening)

> The exclusion order completes the historical pattern by showing its most dangerous form: the case that is not allowed to appear as a case at all.

Followed by the existing petition / safety valve / accommodation / appeal / closed-doors sequence.

### Chapter 5 (limited)

- “That movement will recur in the chapters that follow.” → “That movement will recur.”

Introduction “chapters that follow” orientation and Chapter 4’s moral-direction explanation retained by design.

---

## Document metadata

| Property | Value |
|----------|--------|
| Title | The Case That Does Not Fit |
| Subject / subtitle | How Rules Protect Us—and What Institutions Must Do When They Misread Us |
| Author | Kevin Steffensen |
| Copyright year | 2026 |
| **Keywords** | rules; judgment; institutional design; reconsideration; discretion; due process; appeals; accommodation; automated decisions; administrative law |

Stale keywords (`history; power; democracy; leadership…`) removed for this book.

**Pipeline change:** `book.keywords` added to `upcoming.schema.json`; `export_docx.py` / `docx_interior_finish.py` pass keywords into DOCX core properties when present. Other books keep the previous default when `keywords` is omitted.

---

## Cover alt text

- Alt text added on the title-page markdown image.
- **Successfully preserved** in the generated DOCX drawing `@descr` attribute.
- Cover image pixels were not regenerated, cropped, or redesigned.

---

## Cover subtitle / strapline (unresolved for production)

Embedded cover still uses the governing-claim strapline, not the official subtitle.

Production must choose:

1. replace the strapline with the official subtitle;
2. retain the strapline and place the subtitle elsewhere; or
3. use only one on the front cover.

---

## Hyperlink status

| Location | True `w:hyperlink` | Plain-text URLs |
|----------|-------------------:|----------------:|
| Body | 1 | 0 |
| Footnotes | 0 | ~40 |

Almost all citation URLs are plain text. Current generation pipeline does not create true hyperlinks for footnote URLs. Wholesale conversion deferred to the ebook-accessibility pass.

---

## Stale subtitle check

No remaining “Present-Day Cases, Historical Patterns, and Institutions Capable of Reconsideration” in manuscript or project metadata for this title (`upcoming.yml`, title page, index, docs overview/rules/README, OG config).

---

## Footnote apparatus audit

- 34 markdown note ids referenced and defined (no orphans/missing).
- Combined sit-in note verified in rendered DOCX/PDF.
- Case names remain italicized in source where intended.
- URLs intact after regeneration.

---

## Remaining production tasks

1. Cover redesign decision (strapline vs official subtitle).
2. Print-wrap / spine / IngramSpark assembly.
3. ISBN / BISAC / retailer descriptions.
4. Ebook conversion + EPUB validation.
5. Broad hyperlink conversion for accessibility.
6. Final accessibility remediation beyond cover alt.
7. Immediate pre-publication volatile-fact recheck (below).

---

## Volatile facts reserved for pre-publication recheck

1. Acacia / ORR successor contract, extension, or court-ordered continuation.
2. Ann Arbor and Anne Arundel enforcement outcomes.
3. Final judgment, settlement, stay, or appeal in *Panian v. Blanche*.
4. Restoration or modification of HHS FERP.
5. Any challenge to the Title VI disparate-impact rescission.

---

## Render / visual QA

- Regenerated DOCX with `interior_finish`.
- Converted to PDF via LibreOffice; rendered page PNGs.
- Confirmed: title-page subtitle; Ch7 single footnote marker; Ch9 em dashes; Conclusion final four lines; no “2021” footnote merge; keywords/metadata correct.

Artifacts:

- `/opt/cursor/artifacts/the-case-that-does-not-fit-proof.docx`
- `/opt/cursor/artifacts/the-case-that-does-not-fit-proof.pdf`
- `/opt/cursor/artifacts/case-proof-pages/page-*.png`
