# Final Reader-Facing Editorial and Continuity Pass — Change Log

**Book:** *The Case That Does Not Fit*  
**New subtitle:** *How Rules Protect Us—and What Institutions Must Do When They Misread Us*  
**Pass date:** August 1, 2026  
**Branch:** `cursor/the-case-that-does-not-fit-draft-6d58`  
**Prior passes:** Developmental deepening; source-verification / editorial consolidation

This pass removed residual verification and outline language from reader-facing prose, updated the official subtitle, and performed a narrow volatile-fact recheck. **Not a developmental rewrite. Not final production readiness.**

---

## Word counts

| Metric | Words |
|--------|------:|
| Starting (post-consolidation) | 30,111 |
| Final (this pass) | 30,183 |
| **Net change** | **+72** |

Within the ±200 guidance band. No restored consolidation cuts; no major new material.

---

## Subtitle update locations

Official subtitle set to:

> How Rules Protect Us—and What Institutions Must Do When They Misread Us

Updated in:

| Location | Updated |
|----------|---------|
| `front-matter/title-page.md` | Yes |
| `index.md` | Yes |
| `upcoming.yml` (`book.subtitle`) | Yes |
| `open-graph.config.yml` (`subtitle_lines`) | Yes (config only; OG image not regenerated) |
| `README.md` | Yes |
| `docs/book-overview.md` | Yes |
| `docs/book-rules.md` | Yes |
| `docs/README.md` | Yes |

**Cover / production flag:** The embedded front-cover image still uses the governing claim as a strapline (“Rules protect people from arbitrary judgment…”). This pass did **not** redesign or regenerate the cover. A later cover-design pass must decide whether to:

1. replace the strapline with the new official subtitle;
2. retain the strapline and place the subtitle elsewhere; or
3. use only one of them to avoid conceptual and visual duplication.

Also for production: cover alt text; ebook hyperlink conversion; carry the new subtitle into all publishing metadata.

---

## Chapter-by-chapter change log

### Introduction — The Blank Line
- Resolved Acacia tense: contract **expired** July 31, 2026 (consistent with following sentence).
- Body: nearly one hundred organizations; tens of thousands of children; no publicly identified successor.
- Moved count discrepancies (AP ~20,000 / Acacia “more than 20,000” and program-page “more than 26,000”), verification date, and successor caveat into the footnote.
- Scene, governing claim, and blank-line architecture preserved.

### Chapter 1 — The Checkbox
- No material rewrite. ED attribution retained. No later compliance/litigation/funding-cut outcome confirmed; language left narrow.

### Chapter 2 — The Keycard
- Replaced PACERMonitor with CourtListener RECAP PDF of the PI order (docket entry 26) and Clearinghouse case page.
- Complaint cited separately for medical allegations only.
- Footnote notes no final judgment/appeal located as of August 1, 2026.
- Body compression preserved.

### Chapter 3 — The Denial Letter
- Removed “and still as posted in early August 2026” from the body.
- Body: “As of July 1, 2026…” only.
- Footnote: notice remained posted as of August 1, 2026; FERP still temporarily unavailable on recheck.
- Narrow FERP scope and “second illness” line preserved.

### Chapter 4 — The Discipline Chart
- Replaced “not random enough to dismiss” with “too persistent to dismiss without investigation.”
- Spreadsheet closing formulation and July 24, 2026 effective date preserved.

### Chapter 5 — The Petition
- Clarified “petition” as broad institutional sense early in the chapter.
- Used “request” / “formal request” in general analysis; “bill in Chancery” for Lumley’s pleading.
- Lumley commercial framing and lawful-exception closing preserved.

### Chapter 6 — The Sentencing Table
- Replaced three-condition checklist sentence with statutory-definition formulation.
- Added *Pulsifer v. United States*, 601 U.S. 124 (2024) in a short footnote (independently disqualifying criminal-history conditions); no body digression.
- Hinge, safety valve, four questions, and governing claim close preserved.

### Chapter 7 — The Doctor’s Note
- Removed “The Smithsonian and National Park Service recount…” from narrative.
- Direct historical narration: occupation lasted nearly four weeks; national protest; Califano.
- Sources retained in footnotes. No “longest occupation” claim. Favor→right purpose preserved.

### Chapter 8 — The Appeal Stamp
- Replaced “design inference drawn from that history—broader than the Court’s literal order” with “The broader design lesson is…”
- Prior paragraphs already state remand to the district court; no repeated disclaimer.
- Reasons/record principle preserved.

### Chapter 9 — The Exclusion Order
- No substantial rewrite.

### Chapter 10 — The Machine’s Category
- No substantial rewrite. GDPR Art. 22(3) narrowing retained.

### Chapter 11 — Institutions That Can Reconsider
- Replaced chapter-number outline references with object-based continuity:
  - “The machine's category showed…”
  - “The sentencing table offered…”
  - “The doctor's note showed…”
  - “The appeal stamp showed…”
- Three movements and bounded revisability preserved.

### Conclusion — Other
- Unchanged. Final “Other” lines preserved exactly.

---

## Body-text verification seams moved into footnotes

| Seam removed/softened in body | Where it went |
|-------------------------------|---------------|
| “was set to expire” / count variance / “as of early August” | Intro body cleaned; Acacia counts, AP/Acacia wording differences, successor status, Aug 1 check → footnote |
| “still as posted in early August 2026” | Ch3 body; recheck date → footnote |
| PACERMonitor as order source | Ch2 footnote → CourtListener RECAP order PDF + Clearinghouse |
| Smithsonian/NPS named in narrative | Ch7 body; sources remain in footnotes |
| “design inference… broader than the Court’s literal order” | Ch8 smoothed; legal distinction already established above |
| Chapter-number cross-references | Ch11 object-based continuity |

---

## Volatile-fact recheck (August 1, 2026)

| Claim | Result | Manuscript action |
|-------|--------|-------------------|
| Acacia successor / extension / injunction | Contract **ended** July 31, 2026; no publicly identified successor verified | Body updated to past-tense expiration |
| Anne Arundel / Ann Arbor | No material later outcome confirmed (Ann Arbor response deadline Aug 10 still ahead at check) | Body unchanged (narrow) |
| *Panian* final judgment / appeal | PI still in effect; no final judgment or appeal located | Body unchanged; footnote updated |
| HHS FERP | Still temporarily unavailable on HealthCare.gov | Body unchanged; footnote recheck date |
| Title VI rescission lawsuit | No filed challenge located | Body unchanged |

---

## *Panian* preliminary-injunction source (final)

**Order PDF (RECAP / CourtListener):**  
https://storage.courtlistener.com/recap/gov.uscourts.vaed.597250/gov.uscourts.vaed.597250.26.0.pdf  

**Clearinghouse case:**  
https://clearinghouse.net/case/48210/  

**Complaint (medical allegations only):**  
https://storage.courtlistener.com/recap/gov.uscourts.vaed.597250/gov.uscourts.vaed.597250.1.0.pdf  

---

## How required structural fixes were handled

**Acacia expiration.** Acacia’s July 31, 2026 release and AP reporting support that the contract ended that day. Body uses consistent past tense (“expired” / “when the contract expired”). Counts and successor uncertainty live in the note.

**Chapter 5 petition/bill.** Early clarification that “petition” is used in a broad institutional sense; general analysis uses “request”; Lumley’s filing is “bill in Chancery.”

**Chapter 6 / *Pulsifer*.** Body states that criminal-history eligibility is defined by statute; footnote cites *Pulsifer* for independently disqualifying conditions without listing the three-part test in the body.

**Chapter 8 seam.** “Broader design lesson” replaces the visible fact-checking phrase; district-court remand already clear above.

**Chapter 11 continuity.** Object names (machine’s category, sentencing table, doctor’s note, appeal stamp) replace “discussed in Chapter X.”

---

## Unresolved volatile facts for pre-publication recheck

1. Acacia / ORR successor contract, extension, or court-ordered continuation after July 31, 2026.
2. Ann Arbor response after August 10, 2026; AACPS formal notice/findings; any funding cut or suit.
3. *Panian* final judgment, settlement, stay, or appeal.
4. Restoration or change of HHS FERP on HealthCare.gov.
5. Any lawsuit challenging the Title VI disparate-impact rescission (91 FR 46733).
6. Cover strapline vs. official subtitle design decision.
7. Cover alt text; ebook URL hyperlink conversion; full publishing metadata sync.

---

## Production boundaries honored

Did **not** perform: final print typography, ebook conversion, ISBN/BISAC, retailer copy, cover regeneration, print wrap, final accessibility remediation, or wholesale hyperlink conversion.

Do **not** claim final production readiness.
