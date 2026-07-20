# Situation discovery — portfolio (2026-07-20)

Discovery pass across three pattern clusters linked via `relatedPatterns` in `semantic/patterns/`. Situations are human-oriented entry points where one or more patterns typically activate together—not pattern duplicates.

## Summary

| Cluster | Patterns | Existing situations | Candidates | High-confidence publish |
|---------|----------|---------------------|------------|-------------------------|
| WOOLTY / Coupling | 10 | 1 | 5 | 4 |
| How Meaning Moves | 10 | 0 | 6 | 4 |
| After Certainty | 10 | 0 | 6 | 4 |
| **Total** | **30** | **1** | **17** | **12 new** |

**Recommended publish batch:** 12 new canonical Situations (4 per cluster) plus fix duplicate `manifestations` in pilot `temporary-fixes-become-permanent.yml`.

**Deferred (medium confidence):** 5 candidates listed at end—strong pattern clusters but thinner explicit prose anchors.

---

## Cluster A — WOOLTY / Coupling

**Books:** `when-others-look-to-you-v1`, `coupling`  
**Pattern cluster:** `attention-finds-a-focus`, `disagreement-is-suppressed`, `dissent-is-welcomed`, `examples-accumulate`, `exceptions-are-forever`, `feedback-drives-change`, `leaders-feel-the-consequences`, `leadership-coalesces`, `leadership-reproduces-itself`, `learning-collapses`

### Existing: temporary-fixes-become-permanent

- **Pattern anchor:** `exceptions-are-forever`
- **Manuscript:** Coupling Part V bridge — "temporary fixes become permanent, dashboards replace direct understanding"; WOOLTY Ch. 9–10 on workarounds and sunsets
- **Note:** YAML has duplicate `manifestations` key; merge on publish

### Candidates

#### dissent-narrows-to-workaround — high

- **Summary:** Open disagreement thins until concerns move to side channels and private workarounds.
- **activePatterns:** `disagreement-is-suppressed`, `learning-collapses`
- **relatedConcepts:** `correction`, `legitimacy`, `decay`, `circulation`
- **relatedBooks:** `when-others-look-to-you-v1`, `coupling`
- **Manuscript anchors:**
  - `books/when-others-look-to-you/v1/parts/part-4-scale-pressure-misjudgment/chapter-10-tradeoffs-under-pressure.md:64–68` — "dissent slides from open signal toward quiet workaround unless someone reopens channels on purpose"
  - `books/when-others-look-to-you/v1/parts/part-4-scale-pressure-misjudgment/chapter-11-why-we-misjudge-leaders.md:120–121` — "it goes quiet and turns into hidden workarounds"
  - `books/coupling/parts/part-1-the-structural-grammar/04-scale-and-abstraction.md:47` — procedure disconnected from learning
- **Distinction:** Pilot covers emergency exceptions hardening; this covers correction channels narrowing before workarounds appear.

#### feedback-stops-changing-decisions — high

- **Summary:** Signal still arrives but no longer moves plans, roles, or resource allocation.
- **activePatterns:** `feedback-drives-change`, `learning-collapses`
- **relatedConcepts:** `feedback`, `vitality`, `adaptability`, `distance`
- **relatedBooks:** `when-others-look-to-you-v1`, `coupling`
- **Manuscript anchors:**
  - `books/coupling/parts/part-1-the-structural-grammar/03-consequence-as-coupling.md:47` — "Delayed feedback… changes what systems optimize for"
  - `books/when-others-look-to-you/v1/parts/part-4-scale-pressure-misjudgment/chapter-9-scale-and-drift.md:101` — "The gap turns into operating risk. Learning Collapse follows"
  - `books/coupling/back-matter/glossary.md:9` — "Weak or delayed feedback reduces learning"
- **Distinction:** Not absence of reports—presence of signal that fails to alter decisions.

#### leadership-reproduces-under-pressure — high

- **Summary:** Who gets copied, promoted, and imitated under stress shapes the next generation of leaders before anyone names it.
- **activePatterns:** `leadership-reproduces-itself`, `leadership-coalesces`, `examples-accumulate`
- **relatedConcepts:** `correction`, `circulation`, `coordination`, `erosion`
- **relatedBooks:** `when-others-look-to-you-v1`, `coupling`
- **Manuscript anchors:**
  - `books/when-others-look-to-you/v1/parts/part-5-closing/chapter-12-what-happens-next.md:133` — "That is how Leadership Reproduces Itself"
  - `books/when-others-look-to-you/v1/parts/part-4-scale-pressure-misjudgment/chapter-10-tradeoffs-under-pressure.md:108` — tradeoff section on emergency precedent becoming governance
  - `books/when-others-look-to-you/v1/parts/part-4-scale-pressure-misjudgment/chapter-9-scale-and-drift.md:18` — "Leadership Reproduces" at scale
- **Distinction:** Focuses on succession and imitation, not single-point coalescence alone.

#### leaders-judged-beyond-their-reach — high

- **Summary:** Decision-makers are evaluated on outcomes they cannot fully see or control while remaining distant from consequences.
- **activePatterns:** `leaders-feel-the-consequences`, `examples-accumulate`, `attention-finds-a-focus`
- **relatedConcepts:** `harm`, `distance`, `scale`, `accountability`
- **relatedBooks:** `when-others-look-to-you-v1`, `coupling`
- **Manuscript anchors:**
  - `books/when-others-look-to-you/v1/parts/part-4-scale-pressure-misjudgment/bridge-from-structure-to-scale-and-judgment.md:5` — "People sit farther from the consequences of what they decide"
  - `books/when-others-look-to-you/v1/parts/part-4-scale-pressure-misjudgment/chapter-11-why-we-misjudge-leaders.md:167` — "reports often look better than reality"
  - `books/coupling/parts/part-1-the-structural-grammar/04-scale-and-abstraction.md` — abstraction at scale
- **Distinction:** Reader moment of misjudgment and distance, not the pattern of feeling consequences directly.

#### attention-coalesces-before-structure — medium

- **Summary:** A group defaults to one focal person before formal roles or process catch up.
- **activePatterns:** `leadership-coalesces`, `attention-finds-a-focus`
- **relatedConcepts:** `coordination`, `uncertainty`, `erosion`
- **relatedBooks:** `when-others-look-to-you-v1`
- **Manuscript anchors:** WOOLTY Ch. 9 on escalation points narrowing
- **Defer:** Overlaps substantially with `leadership-reproduces-under-pressure`; merge or publish in follow-up if coalescence needs its own entry point.

---

## Cluster B — How Meaning Moves

**Books:** `how-meaning-moves`, `coupling` (partial via `meaning-gets-distorted`)  
**Pattern cluster:** `attention-finds-a-signal`, `contact-keeps-the-read-open`, `gaps-invite-completion`, `intent-gets-assigned`, `meaning-drifts-over-time`, `meaning-forms-early`, `meaning-gets-distorted`, `meaning-outruns-the-words`, `meaning-reinforces-itself`, `meaning-shifts-under-pressure`

### Candidates

#### meaning-forms-before-anyone-checks-it — high

- **Summary:** A working interpretation settles while language is still incomplete; later detail gets read through the early frame.
- **activePatterns:** `meaning-forms-early`, `gaps-invite-completion`
- **relatedConcepts:** `meaning`, `interpretation`, `compression`, `uncertainty`
- **relatedBooks:** `how-meaning-moves`
- **Manuscript anchors:**
  - `books/how-meaning-moves/front-matter/preface-before-understanding.md:21` — "how fast meaning forms, how quickly certainty replaces contact"
  - `books/how-meaning-moves/parts/part-i-the-three-forces/chapter-2-compression-why-we-decide-what-someone-meant-so-quickly.md:93` — "Compression becomes harmful when it outruns contact"
  - `books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-4-when-the-pauses-disappear.md:33` — "Pressure made each sound like an answer against the other"
- **Distinction:** Entry point for premature closure, not the compression mechanism alone.

#### meaning-outruns-shared-understanding — high

- **Summary:** Words, plans, and summaries move faster than the shared read they presuppose.
- **activePatterns:** `meaning-outruns-the-words`, `contact-keeps-the-read-open`
- **relatedConcepts:** `meaning`, `consequence`, `interpretation`, `circulation`
- **relatedBooks:** `how-meaning-moves`
- **Manuscript anchors:**
  - `books/how-meaning-moves/parts/part-iii-familiar-situations/chapter-7-conflict.md:59` — "Meaning races ahead of contact"
  - `books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-6-a-passing-comment-becomes-a-plan.md:175` — distinction between direction and intent difficult to maintain
  - `books/how-meaning-moves/back-matter/appendix-a-pattern-language-of-meaning.md` — pattern language on outrunning contact
- **Distinction:** Coordination and archive drift, not early frame formation alone.

#### intent-gets-assigned-after-the-fact — high

- **Summary:** Motive is inferred and recorded before certainty is possible; consequence rewrites the story of what someone meant.
- **activePatterns:** `intent-gets-assigned`, `meaning-gets-distorted`
- **relatedConcepts:** `certainty`, `meaning`, `interpretation`, `exposure`
- **relatedBooks:** `how-meaning-moves`
- **Manuscript anchors:**
  - `books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-6-a-passing-comment-becomes-a-plan.md:173` — "consequence began competing with intent as the more useful account"
  - `books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-6-a-passing-comment-becomes-a-plan.md:217` — "Intent did not absolve him of consequence"
  - `books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-5-the-archive-in-the-kitchen.md:43` — incompatible accounts of the same moment
- **Distinction:** Retrospective motive assignment, not real-time gap-filling.

#### pressure-accelerates-interpretation — high

- **Summary:** Urgency, conflict, or stakes speed meaning formation and make revision feel costly.
- **activePatterns:** `meaning-shifts-under-pressure`, `meaning-reinforces-itself`
- **relatedConcepts:** `meaning`, `consequence`, `interpretation`, `certainty`
- **relatedBooks:** `how-meaning-moves`
- **Manuscript anchors:**
  - `books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-4-when-the-pauses-disappear.md:71` — "Under pressure, tempo begins to look like character"
  - `books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-7-what-the-calendar-can-afford.md:179` — "The room claimed to want early signals. It rewarded finished arguments"
  - `books/how-meaning-moves/parts/part-ii-speaking-and-listening-under-pressure/chapter-6-when-restraint-fails.md:21` — "Speed Replaces Contact"
- **Distinction:** Situation of accelerated rooms; pattern `meaning-shifts-under-pressure` names the dynamic inside it.

#### the-room-after-you-are-right — medium

- **Summary:** Being accurate closes inquiry; correctness arrives as finality and distorts what can still be questioned.
- **activePatterns:** `meaning-gets-distorted`, `correctness-hardens-into-identity` (cross-cluster)
- **relatedConcepts:** `judgment`, `meaning`, `correction`, `legitimacy`
- **relatedBooks:** `how-meaning-moves`, `after-certainty`
- **Manuscript anchors:** `books/how-meaning-moves/parts/part-iii-what-can-still-move/chapter-8-the-room-after-you-are-right.md:115`
- **Defer:** Strong prose but spans AC and HMM; publish after cross-book relationship UX is clearer.

#### early-signals-become-expensive — medium

- **Summary:** Raising concerns before they are defensible carries social cost; rooms reward finished arguments over early warnings.
- **activePatterns:** `meaning-shifts-under-pressure`, `gaps-invite-completion`
- **relatedConcepts:** `correction`, `legitimacy`, `uncertainty`
- **relatedBooks:** `how-meaning-moves`
- **Manuscript anchors:** HMM Ch. 7 calendar scene — "Early concerns have been expensive"
- **Defer:** Overlaps WOOLTY dissent/workaround cluster; note for Part III "Familiar Situations" follow-up.

---

## Cluster C — After Certainty

**Books:** `after-certainty`  
**Pattern cluster:** `admiration-becomes-insulation`, `attention-restores-contact`, `blame-compresses-complexity`, `correctness-hardens-into-identity`, `explanation-replaces-response`, `finality-compensates-for-uncertainty`, `responsibility-persists-beyond-control`, `revisability-preserves-judgment`, `scrutiny-preserves-trust`, `speech-escalates-faster-than-meaning`

### Candidates

#### explanation-displaces-action — high

- **Summary:** Analysis expands and calms the room while harm outside stays fixed and response stalls.
- **activePatterns:** `explanation-replaces-response`, `finality-compensates-for-uncertainty`
- **relatedConcepts:** `responsibility`, `abstraction`, `judgment`, `scale`
- **relatedBooks:** `after-certainty`
- **Manuscript anchors:**
  - `books/after-certainty/parts/part-1-letting-go/chapter-2-the-cost-of-explanation.md:69–73` — "Explanation crosses a threshold when it stops illuminating harm and starts absorbing it"
  - `books/after-certainty/parts/part-1-letting-go/chapter-2-the-cost-of-explanation.md:81` — "The map becomes increasingly detailed while the traveler remains standing still"
  - `books/after-certainty/back-matter/appendix-stabilizers-and-distortions.md:42` — explanation gradually absorbs response
- **Distinction:** Reader recognizes the shift from urgent questions to sophisticated stall.

#### blame-locates-harm-in-a-face — high

- **Summary:** Complex outcomes compress into a villain narrative faster than contact with how the field produced them.
- **activePatterns:** `blame-compresses-complexity`, `correctness-hardens-into-identity`
- **relatedConcepts:** `accountability`, `harm`, `scale`, `abstraction`
- **relatedBooks:** `after-certainty`
- **Manuscript anchors:**
  - `books/after-certainty/back-matter/appendix-stabilizers-and-distortions.md:52` — "villain narratives also simplify systems into individuals"
  - `books/after-certainty/back-matter/appendix-stabilizers-and-distortions.md:74` — "Blame compresses complexity by locating harm in a face"
  - `books/after-certainty/parts/part-1-letting-go/bridge.md:21` — responses that begin as care
- **Distinction:** Entry point for moral relief via simplification, not accountability exercise.

#### admiration-insulates-from-scrutiny — high

- **Summary:** Trust in a admired figure makes proportionate inquiry feel like betrayal of the cause.
- **activePatterns:** `admiration-becomes-insulation`, `scrutiny-preserves-trust`
- **relatedConcepts:** `legitimacy`, `authority`, `accountability`, `judgment`
- **relatedBooks:** `after-certainty`
- **Manuscript anchors:**
  - `books/after-certainty/parts/part-1-letting-go/chapter-3-releasing-heroes-and-villains.md:35–47` — "Admiration Becomes Insulation"
  - `books/after-certainty/parts/part-1-letting-go/chapter-3-releasing-heroes-and-villains.md:41` — "Criticism begins sounding like ingratitude"
  - `books/after-certainty/back-matter/appendix-stabilizers-and-distortions.md:48` — admiration and heroic narratives
- **Distinction:** Hero-protection moment, distinct from blame compression.

#### responsibility-outruns-control — high

- **Summary:** Care and answerability persist after the ability to steer outcomes has thinned.
- **activePatterns:** `responsibility-persists-beyond-control`, `revisability-preserves-judgment`
- **relatedConcepts:** `responsibility`, `agency`, `accountability`, `constraints`
- **relatedBooks:** `after-certainty`
- **Manuscript anchors:**
  - `books/after-certainty/back-matter/appendix-stabilizers-and-distortions.md:66` — "Responsibility is not the same thing as mastery"
  - `books/after-certainty/front-matter/how-to-read-this-book.md:32` — "responsibility without control"
  - `books/after-certainty/parts/part-1-letting-go/chapter-2-the-cost-of-explanation.md:65` — "responsibility often begins where explanation reaches its limit"
- **Distinction:** Lived weight of answerability without mastery.

#### correctness-hardens-before-revision — medium

- **Summary:** A public commitment or identity stake makes changing one's mind feel like collapse rather than judgment.
- **activePatterns:** `correctness-hardens-into-identity`, `revisability-preserves-judgment`
- **relatedConcepts:** `judgment`, `correction`, `legitimacy`, `constraints`
- **relatedBooks:** `after-certainty`
- **Manuscript anchors:** AC Ch. 1 — "You have already spoken. You have already committed in front of others"
- **Defer:** Strong pattern prose; situation entry may merge with `responsibility-outruns-control` or publish as second AC batch.

#### speech-outruns-precision — medium

- **Summary:** Communication becomes more visible and less precise at the same time; volume substitutes for contact.
- **activePatterns:** `speech-escalates-faster-than-meaning`, `explanation-replaces-response`
- **relatedConcepts:** `circulation`, `legitimacy`, `scale`, `abstraction`
- **relatedBooks:** `after-certainty`
- **Manuscript anchors:** AC appendix on speech and scale
- **Defer:** Thin dedicated scene prose; keep as pattern-led candidate for Phase 4 website UX.

---

## Recommended publish batch (high-confidence)

| Slug | Cluster | Title |
|------|---------|-------|
| `dissent-narrows-to-workaround` | WOOLTY/Coupling | Dissent narrows to workaround |
| `feedback-stops-changing-decisions` | WOOLTY/Coupling | Feedback stops changing decisions |
| `leadership-reproduces-under-pressure` | WOOLTY/Coupling | Leadership reproduces under pressure |
| `leaders-judged-beyond-their-reach` | WOOLTY/Coupling | Leaders judged beyond their reach |
| `meaning-forms-before-anyone-checks-it` | How Meaning Moves | Meaning forms before anyone checks it |
| `meaning-outruns-shared-understanding` | How Meaning Moves | Meaning outruns shared understanding |
| `intent-gets-assigned-after-the-fact` | How Meaning Moves | Intent gets assigned after the fact |
| `pressure-accelerates-interpretation` | How Meaning Moves | Pressure accelerates interpretation |
| `explanation-displaces-action` | After Certainty | Explanation displaces action |
| `blame-locates-harm-in-a-face` | After Certainty | Blame locates harm in a face |
| `admiration-insulates-from-scrutiny` | After Certainty | Admiration insulates from scrutiny |
| `responsibility-outruns-control` | After Certainty | Responsibility outruns control |

Plus pilot fix: merge duplicate `manifestations` in `temporary-fixes-become-permanent.yml`.

---

## Deferred / merge suggestions

| Candidate | Reason |
|-----------|--------|
| `attention-coalesces-before-structure` | Overlaps `leadership-reproduces-under-pressure` |
| `the-room-after-you-are-right` | Cross-book (HMM + AC); defer until relationship UX |
| `early-signals-become-expensive` | Overlaps WOOLTY dissent cluster |
| `correctness-hardens-before-revision` | Second AC batch or merge with responsibility situation |
| `speech-outruns-precision` | Pattern-strong, prose-thin |

---

## Open questions for reviewer

1. Should `the-room-after-you-are-right` become a cross-book Situation with both `how-meaning-moves` and `after-certainty` in `relatedBooks`?
2. Is four Situations per cluster the right density for website entry points, or should WOOLTY/Coupling share fewer because of the existing pilot?
3. Should Situations gain typed edges in `semantic/relationships.yml` in a future schema pass (currently not valid node kinds)?
