# Proofread correction pass — change log

**Book:** *No Time to Think*  
**Branch:** `cursor/no-time-to-think-factual-corrections-6d58`  
**Date:** August 2026  
**Scope:** Targeted wording, citation, and soft-claim fixes from a full 71-page rendered-DOCX proofread. No developmental rewrite.

## Manuscript corrections

| Item | Change |
|------|--------|
| Intro — medical-AI preview | “fits the model’s training” → “simply fits the statistical pattern the system recognizes most readily” |
| Ch 2 — allergy | “A wrong allergy omitted…” → “A documented allergy omitted… and the model treated it as background” |
| Ch 2 — draftsman | “careful human draftsman” → “careful clinician drafting the note” |
| Ch 6 — FAA AC 120-71B | Title corrected to *Standard Operating Procedures and Pilot Monitoring Duties for Flight Deck Crewmembers*; body uses challenge-response / flow + verification |
| Ch 9 — Model 299 | Inquiry finding (gust locks / not structural or engine failure) separated from later institutional lesson |
| Ch 9 — sterile cockpit | FAA 1981 rule from distraction-related accidents first; ASRS later documents continued violations; ASRS expanded on first use |
| Ch 9 — NTSB | Expanded on first use |
| Ch 11 — AV / ODD | Expanded on first use |
| Ch 11 — milliseconds | Replaced with immediate physical access vs network latency / interface mediation |
| Ch 11 — two years | Softened uncited “without incident” claim |
| Ch 11 — professional driving | “eliminate the fatigue and danger…” → “reduce exposure to fatigue-related crashes and other occupational driving risks” |
| Ch 1 — productivity evidence | Softened mixed-results sentence; dropped exact “30 to 50 percent” range |
| Ch 4 — Bethlehem | “Bethlehem Iron Company” → “Bethlehem works in Pennsylvania”; final paragraphs tightened to reduce orphan-line risk before Ch 5 |
| Ch 3 — FAA workforce note | Added direct *Air Traffic Controller Workforce Plan 2026–2028* URL beside the press release |
| Copyright page | Removed redundant second title/subtitle block |

## Production decisions (this pass)

| Item | Decision |
|------|----------|
| Blank pages before parts | Prefer next-available page for this compact book; do not insert recto-only blanks inconsistently. Re-check after re-export. |
| Page numbers | Enabled via `interior_finish: true` on DOCX (folios from Introduction; omitted on cover/front-matter openers per finish script). Finish logic updated so front-matter About the Series no longer blocks body section splits. |
| Cover alt text | DOCX export currently uses empty cover-image alt to avoid Word figure captions (`prepare_title_page_for_docx`). Accessible alt remains a follow-up for EPUB/a11y packaging. |
| Footnote URL hyperlinks | Plain-text URLs retained for print; hyperlink encoding deferred to EPUB packaging. |

## Remaining before final proof

- Manual click-through of endpoints that blocked automated checks (Smithsonian, Henry Ford AskUs, some NRC/OSTI/DOI URLs).
- Confirm page-31 orphan is gone after Ch 4 tighten + re-export.
- Confirm blank-page behavior after re-export with `interior_finish`.
- EPUB/a11y: cover alt text + linked footnote URLs.

## Not claimed

Publication-ready final proof is **not** claimed until the remaining production items above are closed.
