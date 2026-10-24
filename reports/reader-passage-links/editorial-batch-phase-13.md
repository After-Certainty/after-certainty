# Reader passage editorial batch — Phase 13

Continues [Phase 12 (#726)](https://github.com/After-Certainty/after-certainty/pull/726), which corrected title-matching false positives and left **four genuine multi-work citations** with valid but ambiguous reader paths.

## Scope and editorial rule

Review exactly those four source clusters rather than generating links to inflate the coverage number. Retain source-specific paths only when the cited work actually supports the particular manuscript assertion. Do not imply that editorial review or rendered HTML verification makes the book's interpretive arguments the source author's own views.

### 1. Hospital throughput: separate system capacity and ACEP policy

**Before:** one `c1-boarding` note cited American College of Emergency Physicians and Institute of Medicine together at a broad account of hospital coordination.

**After:** an existing paragraph now identifies two distinguishable claims:

- `c1-capacity` — Institute of Medicine, *Hospital-Based Emergency Care: At the Breaking Point* (National Academies Press, 2007). Supports overloaded emergency-system capacity, inpatient-bed pressure, and delayed transfers. Newly authored `readerPassagePath` and `whyThisMatters` on the existing source metadata. Also corrects the metadata's `title` to the work title rather than incorporating publication location and publisher.
- `c1-boarding` — American College of Emergency Physicians, *Boarding of Admitted and Intensive Care Patients in the Emergency Department* (revised February 2023). Supports the operational definition of boarding and its hospital-wide implications; original reader path retained.

The literary example remains a hypothetical judgment problem, not a clinical outcome derived from either source. The vignette's argument about the translation of care into metrics belongs to this book.

Evidence: [National Academies online chapter overview](https://nap.nationalacademies.org/skim.php?act=nap&chap=17-36&record_id=11621) and [ACEP boarding policy listing](https://www.acep.org/administration/crowding--boarding).

### 2. Citizenship Schools: distinguish founding site from regional expansion

- `c10-citizenship` already cites the Lowcountry Digital History Initiative's *The Progressive Club, Johns Island* for the original 1957 program.
- `c10-expansion` now **only** cites LDHI's *Local and National Leader: Septima P. Clark* for expansion across the South and the shift to SCLC in 1961.
- The original `readerPassagePath` on *Local and National Leader* remains unchanged; the prior shared warning should disappear without changing the novel's substantive claim.

Evidence: [LDHI on Septima Clark and program expansion](https://ldhi.library.cofc.edu/exhibits/show/septima_clark/local-and-national-leader) and [LDHI on the Progressive Club's original class](https://ldhi.library.cofc.edu/exhibits/show/septima_clark/virtual-tour/the-progressive-club).

### 3. Mandela: distinguish contemporary speech from later memoir

- `v4` now cites **Mandela's April 20, 1964 Rivonia Trial speech alone** for his stated justification for sabotage and for choosing that method rather than terrorism and racial war.
- `v3` already cites the later memoir *Long Walk to Freedom* separately. No need to repeat it at the direct courtroom quotation and account.
- The speech is a firsthand statement of Mandela's rationale; it is not independent proof of all claims about the organization's historical conduct.

Evidence: [Mandela's 1964 speech reproduced by the United Nations](https://www.un.org/en/events/mandeladay/court_statement_1964.shtml).

### 4. SNCC: cite the independent founding account

- `c10-shaw` now cites SNCC Digital Gateway's *Birth of SNCC* for the April 1960 Shaw University meeting, Baker's role organizing it, and the emerging committee.
- Barbara Ransby's distinct *Ella Baker and the Black Freedom Movement* is already cited at `c10-autonomy` for a different claim about local authority and student organizing, and is no longer repeated in `c10-shaw`.
- No new claim about the conference is added to the manuscript.

Evidence: [SNCC Digital Gateway's firsthand movement history, *Birth of SNCC*](https://snccdigital.org/inside-sncc/the-story-of-sncc/birth-of-sncc/).

## Required outcome

- The four previously B-ranked source paths should become mechanically tied **A** without moving their existing destinations.
- One additional Institute of Medicine book receives a uniquely evidenced reader path, `c1-capacity`, and substantive `whyThisMatters`.
- No other source is given a guessed path or a retrospective claim. Preserve the 1957, autonomy, and memoir citations already present elsewhere in the chapters.
- The review log retains the old deferred IOM `c1-boarding` candidate as **skipped with replacement**, and marks all five active paths as reviewed/applied.
- Run **full renderer-backed audit**, check all five links, and commit regenerated `audit.md` plus `audit.summary.json` in this PR. Do not calculate new counts by arithmetic.
- CI should validate the revised footnotes, source metadata, existing Phases 10–12 regression suites, and reader fragment targets.

The output of a source-link audit is mechanical evidence of a citation in the online reader, not an assertion of scholarly consensus. Preserve that distinction in the audit and PR summary.
