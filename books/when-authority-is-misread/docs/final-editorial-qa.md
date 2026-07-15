# Final editorial pass — QA report

Manuscript: *When Authority Is Misread*  
Branch: `cursor/when-authority-misread-rewrite-7f00`  
Approx body word count after pass: ~24,180

## 1. Words removed / added

| Area | Approx Δ |
|------|----------|
| Deng Xiaoping | −133 |
| Mandela | −58 |
| Washington | −44 |
| Nooyi | −114 |
| Merkel opening + cite cleanup | net modest cut |
| Ch10 boundary clarification | +~50 |
| Cover template / test | infrastructure only |
| **Net** | **roughly −350 to −450 on touched chapters** |

No fixed cut imposed chapter-wide.

## 2. Chapters receiving the most tightening

1. Deng (post-pattern “neither cancels” / dual-ledger restatement)
2. Nooyi (mid-chapter relocation/measurement echo)
3. Mandela (post-pattern fraud/hagiography restatement)
4. Washington (post-pattern only; lullaby preserved)
5. Merkel (dual ordinary openings → instructions dominant)

## 3. Broad citations replaced with exact sources

- Merkel media: Packer, “The Quiet German,” *The New Yorker*, 1 Dec 2014; *Economist*, “The Merkel Method,” 26 Sep 2015
- Merkel COVID: Connolly, *Guardian*, 16 Apr 2020
- Merkel legacy/Russia: Connolly, *Guardian*, 5 Mar 2022
- Pew: *Europeans Face the World Divided*, 13 Jun 2016
- Nooyi/Peltz: Trian letter 19 Feb 2014; PepsiCo 8-K / Ian Cook 27 Feb 2014; de la Merced, DealBook / *NYT*, 27 Feb 2014; Cavale, Reuters, 20 Feb 2014
- Nooyi profiles: named Fortune pieces where used; Brownell & Warner retained for public health

## 4. Citations narrowed or removed (unverifiable exact title)

- Dropped vague *Spiegel* / *FT* / *Foreign Affairs* / *WaPo* / BBC gesture clusters in Merkel notes
- Dropped uncertain Tony Barber FT title (could not verify exact headline “Greece and the Politics of Austerity,” 2 May 2011); Eurozone note retained on Blyth alone
- Softened Mandela “Sparks later essays” / “studies consistently” gestures toward Sampson / named works

## 5. Footnotes sequential / intact

Named footnote IDs remain chapter-scoped (`[^c3-…]` etc.). Full-manuscript check: **no broken refs or orphan definitions**. Pandoc will renumber sequentially on build.

## 6. Parts and chapters begin on new pages

House convention for this book matches *When Accountability No Longer Expires*: page breaks handled by publishing pipeline/styles, not per-file `\newpage` markers. Title page retains `\newpage` after cover. **Not altering pipeline.** Confirm on next DOCX/PDF build in CI/local publish.

## 7. Washington “civic lullaby” transition

**Intact.** Still includes:

- “Around these decisions a civic mythology hardened…”
- “One further compression completes the lullaby…”

## 8. Moral complications preserved

Confirmed present: Merkel austerity/migration/energy-Russia; King economic/militarism/sanitization; Nooyi public-health/extraction limits; Galileo coercion; Deng Tiananmen/repression with growth; Mandela amnesty/land/redistribution limits; Washington slavery/Ona Judge/Indigenous/exclusion/federal force.

## 9. Unresolved items for human review

1. **Production layout:** Confirm Cover caption and nearly-empty final biblio page are gone after regenerating DOCX/PDF with updated `templates/title_page.md.j2`.
2. **Eurozone journalistic color:** If a preferred FT/Spiegel piece is desired beside Blyth, add a verified title/date in production.
3. **Stelzenmüller Brookings cite:** Legacy note was narrowed to Connolly *Guardian* for certainty; optional add if preferred for energy-policy debate.
4. **Nooyi Fortune profile headlines/years:** Agent cited Morris 2008 / Colvin 2012—spot-check titles against Fortune archives before print.
5. **Page-break visual QA:** Spot-check generated PDF for orphaned headings after publish.

## Non-goals confirmed

No structural rewrite; no leader/chapter changes; essayistic voice and second-look movement preserved; calmer aphorism rhythm retained.
