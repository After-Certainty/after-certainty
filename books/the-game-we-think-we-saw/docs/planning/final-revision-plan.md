# Final Revision Plan — Controlled Pass

**Date:** 2026-07-16  
**Scope:** Editorial tightening only. Architecture, cases, tone, governing claim preserved.

## Current word counts (body, excluding footnotes)

| Unit | Words |
|------|------:|
| Author's Note | 177 |
| Introduction | 1,386 |
| Part I bridge | 76 |
| Chapter 1 | 2,669 |
| Chapter 2 | 3,756 |
| Part II bridge | 75 |
| Chapter 3 | 3,643 |
| Chapter 4 | 4,185 |
| Part III bridge | 79 |
| Chapter 5 | 3,616 |
| Chapter 6 | 4,198 |
| Part IV bridge | 72 |
| Chapter 7 | 3,865 |
| Conclusion | 526 |
| **Total** | **28,323** |

Footnote definitions: 51 (substance strong; style inconsistent; some shorthand/duplicates).

## Likely cuts by section

1. **Introduction (~20–25% → ~1,040–1,110):** Remove miniature Moneyball, star/system + leadership/dependency line, whistle/replay, winning-as-permission, playing hurt, refusal, protest/meaning. Keep spectators, scoreboard incomplete, temptation, brief outward movement, parking-lot return, governing claim.
2. **Chapter 2 (~10–15%):** Shorten 2008 + Tampa Bay; reach three-part framework sooner; emphasize rescue-loop over Brady–Belichick verdict; compress “Coach as Invisible Star,” “Story Success Prefers,” “What Produced the Result”; cut nested-contribution restatements.
3. **Chapter 4 (~10–15%):** Keep Package Deal, chair, Reed, Armstrong contrast, photograph return, key compression lines. Merge/compress repeated effectiveness≠legitimacy analysis across Package Deal / Demanding vs Abusive / Defense / Success as Evidence / Cost / Explanation vs Permission / Trophy Cannot Separate.
4. **Chapter 5 (light):** Shorten “What Teammates Are Owed”; keep moral recruitment before the decision; clarify seam toward Ch 6.
5. **Chapter 6 (~10–15%):** Keep Biles spine; shorten Osaka/Luck; dedupe “athlete may be wrong” across Right to Question / Team Continues / Presumptive Authority.
6. **Chapter 3 / 7 / Conclusion / bridges:** Light only. Optional Part II bridge sentence on whistle before scoreboard. Part III bridge: temporal shift from excuses-after to demands-before if needed.
7. **Ch 1:** Light accessibility + cadence only.

## Repeated concepts to cut (second explanations)

- Contribution nested/distributed (after Ch 1 establishes)
- Leadership vs dependency (remove from intro; keep in Ch 2)
- Effectiveness ≠ moral legitimacy (Ch 4 multi-section restatement)
- Athlete judgment fallible but situated (Ch 6 multi-section)
- Scoreboard accurate but incomplete (protect once; trim echoes)

## Technical accessibility review

Plain one-sentence gloss if needed: catch rule, clear-and-obvious, offside, ABS geometry, Moneyball/OBP, Amanar, twisties, pitch counts, load management. Prefer simplification over expansion.

## Transitions

- Ch 1→2: understated handoff (why one face becomes the explanation)
- Part I→II: add whistle-before-scoreboard line to Part II bridge if natural
- Ch 4→Part III: temporal shift (after success → before result)
- Ch 5→6: preserve existing; do not over-explain
- Ch 7→Conclusion: keep kneeling ending; conclusion returns to arena

## Citation pass

- Standardize Chicago-ish: author/institution, title, publication, date, URL
- Replace “coverage above,” “contemporaneous coverage,” bare “AP News (date)”
- Deduplicate: twisties/teammates/expectations overlap; Boyer/kneel; free agency/unsigned/grievance
- Verify Ch 3/5 policy language; Ch 4/7 chronology

## Front matter

- Title-page alt: remove “cover” from visible label if export shows it; use clean alt
- About the Series: use established series copy from sibling books (not invent)
- Copyright: light formatting only
- Rebuild DOCX via `make export-docx DIR=upcoming/the-game-we-think-we-saw`

## Target overall

~8–12% reduction excluding footnotes if judgment allows; do not force quotas.

## After-pass word counts (body, excluding footnotes)

| Unit | Before | After | Δ |
|------|-------:|------:|--:|
| Author's Note | 177 | 178 | +1 |
| Introduction | 1,386 | 1,024 | −362 (−26%) |
| Part I bridge | 76 | 77 | +1 |
| Chapter 1 | 2,669 | 2,679 | +10 |
| Chapter 2 | 3,756 | 3,188 | −568 (−15%) |
| Part II bridge | 75 | 99 | +24 |
| Chapter 3 | 3,643 | 3,732 | +89 |
| Chapter 4 | 4,185 | 3,724 | −461 (−11%) |
| Part III bridge | 79 | 100 | +21 |
| Chapter 5 | 3,616 | 3,532 | −84 |
| Chapter 6 | 4,198 | 3,743 | −455 (−11%) |
| Part IV bridge | 72 | 73 | +1 |
| Chapter 7 | 3,865 | 3,832 | −33 |
| Conclusion | 526 | 527 | +1 |
| **Total** | **28,323** | **26,508** | **−1,815 (−6.4%)** |

Validation: `make validate-book-specs` pass; `make validate-publication-manuscript DIR=upcoming/the-game-we-think-we-saw` pass; `make export-docx` with interior_finish (14 body openers / 15 sections).
