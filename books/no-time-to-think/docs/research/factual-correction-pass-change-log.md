# Factual correction pass — change log

**Book:** *No Time to Think*  
**Pass date:** 2026-08-01  
**Branch:** `cursor/no-time-to-think-factual-corrections-6d58`

Targeted factual corrections only. Architecture, argument, composite scenes, ordinary objects, conclusion, and final line preserved.

## Corrections

### 1. Challenger oversight (Ch 7)

- **Was:** “independent NRC oversight.”
- **Now:** “independent oversight by a committee formed through the National Research Council.”
- **Source:** Rogers Commission Recommendations (Recommendation I); https://www.nasa.gov/history/rogersrep/v1recomm.htm
- Footnotes `[^c7-recomm]` / `[^c7-recomm-s2]` updated. No “NRC” abbreviation in this passage.

### 2. Hao He study timeline (Introduction + Ch 1)

- **Mandate start:** **mid-2025** (not 2024). Paper: company “committed to doubling merged pull requests per engineer since mid-2025”; CTO “2× mandate” announcement **June 2025**.
- **Dataset:** January 2024–April 2026 (before and after the mandate).
- **Wording:** researchers “analyzed more than two years of company data,” not “spent more than two years following” the mandate.
- Preserved: 802 developers; 196,212 PRs; 2.09× by April 2026; roughly doubled per-reviewer load; automated review overtaking human; stable merge/revert rates; causal caution.
- **Source language (abstract):** “a mid-sized, AI-forward company that has been committed to doubling merged pull requests per engineer since mid-2025… panel of 802 developers and 196,212 pull requests (January 2024–April 2026)… reaching 2.09× the pre-mandate baseline in April 2026.”

### 3. Model 299 inquiry vs later lesson (Ch 6)

- Separated inquiry finding (gust locks not released; not structural/engine failure) from later institutional lesson about complexity and unaided memory.

### 4. “Too much airplane” phrase (Ch 6)

- **Qualified** (not verified as a named contemporary headline).
- Now: “later became associated with the phrase… a summary repeated in later accounts.”
- No publication identified for an original newspaper headline.

### 5. Ambient medical AI description (Ch 2)

- Replaced “pattern-match to the records in their training” with encounter + accessible record context + learned statistical patterns wording.

### 6. Medical-scene errors (Ch 2)

- Kept composite examples.
- Added one clarifying sentence in `[^c2-gao-notes]`: particular errors are illustrative; broader verification difficulty is documented in the GAO assessment.

### 7. Liability statement (Ch 2)

- Softened to formal responsibility / possible legal consequences; workflow conditions language retained.

### 8. INPO stop-work (Ch 9)

- **Narrowed** to post-TMI formalization + “One INPO supplier-performance standard states…”
- Note clarifies INPO 14-005 scope; USW wallet cards and representative red card retained.

### 9. Symptom-based EOP source (Ch 8)

- **Full citation:** U.S. Nuclear Regulatory Commission, NUREG-1358, *Lessons Learned From the Special Inspection Program for Emergency Operating Procedures* (April 1989), https://www.osti.gov/biblio/6307206 (full text https://www.osti.gov/servlets/purl/6307206).
- Supports function-/symptom-based EOPs after TMI Action Plan / Generic Letter 82-33.

### 10. Zoox source hierarchy (Ch 11)

- **Primary:** NHTSA, 91 Fed. Reg. 48494 (July 31, 2026), Temporary Exemption No. 2026-01 (July 31, 2026–July 31, 2028; ≤2,500 vehicles/12 months; no manual driving controls).
- **URL:** https://www.federalregister.gov/documents/2026/07/31/2026-15485/zoox-grant-of-temporary-exemption-from-portions-of-various-requirements-of-the-federal-motor-vehicle
- AP retained as secondary.
- Body updated to temporary exemption / commercial deployment language.

### 11. Ford quality inspection (Ch 5)

- Marked as structural interpretation: “In structural terms, quality recognition increasingly moved downstream…”

### 12. Taylor overhead (Ch 4)

- Softened; *Shop Management* search did not support “temporary cost that would diminish” as a direct claim.
- Now: “Taylor expected scientific standardization to reduce uncertainty and improvisation over time.” Persistence of apparatus retained as analysis.

### 13. ASRS terminology (Ch 9)

- Replaced “conditional immunity” with “waiver of sanction” / limited protection under specified conditions; note points to ASRS immunity page and AC 00-46F.

### 14. Interpretation signals

- Applied at Model 299, Ford inspection, INPO, Taylor as above; Challenger/TMI/Zoox keep commission/agency framing.

## Counts / audit

- Conclusion and final line: **unchanged**.
- DOCX: exported and inspected after corrections (see commit notes).

## Remaining / not fully verified

- Named contemporary newspaper for “too much airplane…” (qualified instead).
- Direct Taylor page/line for temporary overhead (softened instead).
- Broader INPO industry-wide stop-work beyond supplier standard (narrowed instead).
- Live URL access to FederalRegister.gov may be bot-gated in some environments; citation uses official FR citation + FR.gov path; grant confirmed via FR text (91 FR 48494).
- 2026 current-event figures remain subject to later revision of studies/agency materials.

**Not claimed publication-ready** solely on this pass; remaining open items above still apply.
