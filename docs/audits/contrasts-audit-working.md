# Contrasts Relationship Audit - Working Document

**Date:** 2026-07-06  
**Total contrasts edges:** 60 (55.6% of all relationships)  
**Goal:** Reduce to <30% by using more precise relationship types

## Audit Methodology

For each edge, evaluate:
- **Keep as contrasts**: Genuine disambiguation where concepts are easily confused
- **Change to existing type**: Better served by requires/enables/thins/preserves/precedes
- **Change to new type**: Needs grounds/calibrates/shapes
- **Remove**: Redundant or weak
- **Collapse reciprocal**: Keep only one direction

---

## TIER 1 CONCEPTS - Detailed Audit

### interpretation ⟷ meaning (reciprocal pair)

**Current edges:**
1. interpretation → meaning: "Interpretation is the active reconstruction; meaning is what gets held steady."
2. meaning → interpretation: "Meaning is what gets held steady; interpretation is active reconstruction."

**Analysis:**
- Both definitions explicitly contrast these concepts
- "interpretation is the active reconstruction" vs "meaning is what gets held steady"
- This is a CORE conceptual distinction in the framework
- Reciprocal pair is symmetric and intentional

**Decision:** **KEEP BOTH** - This is exemplary disambiguation

---

### coupling ⟷ cohesion (reciprocal pair)

**Current edges:**
1. coupling → cohesion: "Coupling tracks action-to-effect attachment; cohesion tracks ownership clarity."
2. cohesion → coupling: "Cohesion is ownership clarity within a boundary; coupling is attachment between action and consequence."

**Additional context:**
- Also have: cohesion **complements** coupling

**Analysis:**
- Definitions show these are distinct but related concepts
- complements edge already captures "work together" relationship
- contrasts edges restate the distinction but add limited value
- Descriptions are nearly symmetric rewording

**Decision:** **COLLAPSE** - Remove both contrasts edges, keep complements edge. The complements edge with good description captures the relationship better than redundant contrasts.

---

### coupling ⟷ consequence-architecture (reciprocal pair)

**Current edges:**
1. coupling → consequence-architecture: "Coupling describes the attachment; consequence-architecture describes intentional design."
2. consequence-architecture → coupling: "Consequence-architecture is designed structure; coupling is the resulting attachment strength."

**Analysis:**
- This describes a "designed structure → resulting attachment" relationship
- Not disambiguation - one is the intentional design input, other is the resulting property
- Better captured as asymmetric force dynamic

**Decision:** **CHANGE TYPE** - Replace with:
- consequence-architecture **shapes** coupling: "Consequence-architecture shapes coupling by intentionally designing feedback paths, boundaries, and escalation routes that determine attachment strength."
- Remove reciprocal contrasts

---

### feedback → trust

**Edge:** "Feedback is the returning signal itself; trust is the bridge that lets people act before signals arrive."

**Analysis:**
- Good distinction between mechanism (feedback) and bridge (trust)
- But consider: feedback actually **calibrates** trust (adjusts/tunes it)
- Or: feedback **enables** trust (provides the testable signals trust depends on)

**Decision:** **CHANGE TYPE** - Replace with:
- feedback **calibrates** trust: "Feedback calibrates trust by providing testable signals that update confidence and expose when trust has thinned."

---

### feedback → correction

**Edge:** "Feedback is what returns; correction is the work of updating in response."

**Analysis:**
- This is not disambiguation - it's an enabling relationship
- Feedback is the input that enables correction to happen
- Already have similar edges: coupling **enables** correction

**Decision:** **CHANGE TYPE** - Replace with:
- feedback **enables** correction: "Feedback enables correction by returning consequence as signal that can update future decisions."

---

### trust ← finite-perspective

**Edge:** "Finite perspective is the condition; trust extends action beyond firsthand sight without pretending completeness."

**Analysis:**
- Not disambiguation - finite-perspective creates the structural condition that makes trust necessary
- This is a grounding/necessitation relationship

**Decision:** **CHANGE TYPE** - Replace with:
- finite-perspective **grounds** trust: "Finite perspective grounds trust by creating the structural condition where no one can verify everything firsthand, making trust necessary for coordination."

---

### trust → certainty

**Edge:** "Trust accepts incomplete verification; certainty compresses choice into stable expectation."

**Analysis:**
- Good disambiguation between accepting incompleteness (trust) vs compressing it away (certainty)
- Helps distinguish these often-confused concepts

**Decision:** **KEEP** - Valuable distinction

---

### certainty → judgment

**Edge:** "Certainty stabilizes coordination by compressing choice; judgment weighs tradeoffs under uncertainty without pretending to see from nowhere."

**Analysis:**
- Excellent disambiguation
- Definitions both emphasize this distinction ("judgment accepts incomplete sight")
- Helps explain why judgment ≠ certainty

**Decision:** **KEEP** - Valuable distinction

---

### agency → judgment

**Edge:** "Agency is capacity to act, not the evaluative practice of deciding well."

**Analysis:**
- Good clarification: agency = capacity, judgment = practice
- Prevents confusion between "can act" and "weighing tradeoffs"

**Decision:** **KEEP** - Valuable distinction

---

### judgment → optimization

**Edge:** "Judgment keeps contestability and human proportion in view; optimization maximizes metrics."

**Analysis:**
- Strong disambiguation
- judgment definition explicitly contrasts with optimization
- Important for preventing optimization from replacing judgment

**Decision:** **KEEP** - Valuable distinction

---

### revisability → judgment

**Edge:** "Revisability keeps decisions attached to reality over time; judgment weighs tradeoffs at the moment of decision."

**Analysis:**
- Good temporal distinction: over time (revisability) vs at moment (judgment)
- Definitions support this: "revisability keeps decisions attached to reality over time"
- Not force dynamic - genuine disambiguation

**Decision:** **KEEP** - Valuable distinction

---

### correction ⟷ revisability (reciprocal pair)

**Current edges:**
1. correction → revisability: "Correction is the act of noticing mismatch; revisability is the designed openness."
2. revisability → correction: "Revisability is the designed openness; correction is the specific act of updating."

**Additional context:**
- Also have: correction **requires** revisability

**Analysis:**
- requires edge already captures dependency: "correction depends on designed openness"
- contrasts edges just restate act vs capacity distinction
- Reciprocal descriptions are nearly identical
- Limited value beyond requires edge

**Decision:** **COLLAPSE** - Remove both contrasts, keep requires. The requires edge captures the key relationship.

---

### corrigibility → revisability

**Edge:** "Corrigibility is capacity for revision when reality pushes back; revisability is designed openness to update."

**Analysis:**
- Distinguishes reactive capacity (corrigibility) from designed openness (revisability)
- Both are forms of openness but different triggers
- Useful distinction

**Decision:** **KEEP** - Valuable distinction

---

### reversibility → revisability

**Edge:** "Reversibility is ability to undo without rupture; revisability is disciplined openness to correction after action begins."

**Analysis:**
- Good distinction: undo (reversibility) vs ongoing correction (revisability)
- Different mechanisms and implications

**Decision:** **KEEP** - Valuable distinction

---

### accountability ← responsibility

**Edge:** "Responsibility names the enduring obligation to account; accountability names whether consequence still reaches those who can respond."

**Analysis:**
- Excellent disambiguation explicitly stated in definitions
- accountability definition: "differs from responsibility because accountability emphasizes exposure to consequence"
- Core distinction in the framework

**Decision:** **KEEP** - Valuable distinction

---

### accountability ← answerability

**Edge:** "Answerability is specific debt owed to affected parties; accountability is exposure to consequence generally."

**Analysis:**
- Good distinction: specific debt (answerability) vs general exposure (accountability)
- Helps clarify the scope difference

**Decision:** **KEEP** - Valuable distinction

---

### accountability ← repair

**Edge:** "Repair seeks restoration of standing; accountability is exposure to consequence."

**Analysis:**
- Distinguishes restoration action (repair) from exposure mechanism (accountability)
- repair definition: contrasts with accountability
- Useful distinction

**Decision:** **KEEP** - Valuable distinction

---

### accountability ← witness

**Edge:** "Witness can persist where consequence pathways are blocked; accountability requires exposure."

**Analysis:**
- Strong distinction: witness works without accountability pathways
- Important for understanding when witness is needed vs when accountability exists
- witness definition mentions this

**Decision:** **KEEP** - Valuable distinction

---

## TIER 1 SUMMARY

**Decisions for 23 Tier 1 edges:**

### KEEP (13 edges):
1. interpretation ⟷ meaning (both directions)
2. trust → certainty
3. certainty → judgment
4. agency → judgment
5. judgment → optimization
6. revisability → judgment
7. corrigibility → revisability
8. reversibility → revisability
9. accountability ← responsibility
10. accountability ← answerability
11. accountability ← repair
12. accountability ← witness

### CHANGE TYPE (5 edges):
1. feedback → trust → **calibrates**
2. feedback → correction → **enables**
3. finite-perspective → trust → **grounds**
4. consequence-architecture → coupling → **shapes** (remove reciprocal)

### COLLAPSE/REMOVE (5 edges):
1. coupling ⟷ cohesion (both directions) - keep complements edge instead
2. correction ⟷ revisability (both directions) - keep requires edge instead
3. coupling ← consequence-architecture (remove, covered by shapes edge)

**Net change:** 23 → 13 contrasts (reduction of 10 edges in Tier 1)

---

## Next: Audit Reciprocal Pairs in Other Tiers

### drift ⟷ normalization (reciprocal pair)

**Current edges:**
1. drift → normalization: "Drift is decoupling from original conditions; normalization is drift absorbed into baseline."
2. normalization → drift: "Normalization is drift absorbed into baseline expectation; drift is ongoing decoupling."

**Additional context:**
- Also have: drift **precedes** normalization

**Analysis:**
- precedes edge already captures temporal relationship: drift comes before normalization
- "normalization is drift absorbed into baseline" = temporal sequence, not disambiguation
- Reciprocal contrasts are redundant with precedes

**Decision:** **REMOVE BOTH** - The precedes edge captures the key relationship better.

---

### drift ⟷ inheritance (reciprocal pair)

**Current edges:**
1. drift → inheritance: "Drift emphasizes loss of fit over time; inheritance emphasizes what persists."
2. inheritance → drift: "Inheritance emphasizes persistence of form; drift emphasizes loss of fit."

**Analysis:**
- Good conceptual distinction: loss (drift) vs persistence (inheritance)
- Different temporal emphases
- Not reducible to force dynamic

**Decision:** **KEEP BOTH** - Valuable distinction

---

### authority ⟷ legitimacy (reciprocal pair)

**Current edges:**
1. authority → legitimacy: "Authority is operational power to steer; legitimacy is justified recognition of that power."
2. legitimacy → authority: "Legitimacy is justified recognition; authority is operational power."

**Analysis:**
- Core distinction in the framework
- Definitions explicitly contrast: "authority is operational power; legitimacy is justified recognition"
- Symmetric descriptions but both necessary for navigation

**Decision:** **KEEP BOTH** - Core framework distinction

---

### alignment ⟷ legitimacy (reciprocal pair)

**Current edges:**
1. alignment → legitimacy: "Alignment can persist without justified recognition; legitimacy requires contestability."
2. legitimacy → alignment: "Legitimacy invites proportionate inquiry; alignment can bind through belonging signals alone."

**Analysis:**
- One direction is stronger: alignment can exist without legitimacy
- Other direction: legitimacy invites inquiry, alignment binds without it
- Asymmetric relationship - not true reciprocal disambiguation

**Decision:** **COLLAPSE** - Keep alignment → legitimacy only: "Alignment can persist through belonging signals alone without the justified recognition that legitimacy requires."

---

### connection ⟷ contact (reciprocal pair)

**Current edges:**
1. connection → contact: "Connection outlasts a single exchange; contact is staying close to unfinished meaning in the moment."
2. contact → connection: "Contact is moment-to-moment closeness; connection is reachability that persists."

**Analysis:**
- Good temporal distinction: persistence (connection) vs moment (contact)
- Both directions add value
- Different aspects: durability vs immediacy

**Decision:** **KEEP BOTH** - Valuable distinction

---

### acceleration ⟷ momentum (reciprocal pair)

**Current edges:**
1. acceleration → momentum: "Acceleration is actively pressured forward, while momentum is continuation without renewed judgment."
2. momentum → acceleration: "Momentum is continuation without renewed judgment; acceleration is actively pressured forward."

**Analysis:**
- Good distinction: active pressure (acceleration) vs continuation (momentum)
- Helps understand different force dynamics
- Symmetric but both valuable

**Decision:** **KEEP BOTH** - Valuable distinction

---

### adaptation ⟷ inheritance (reciprocal pair)

**Current edges:**
1. adaptation → inheritance: "Adaptation names responsive change; inheritance names what gets carried forward after conditions shift."
2. inheritance → adaptation: "Inheritance carries forward what stabilized; adaptation names the original responsive work."

**Analysis:**
- Temporal sequence: adaptation happens first, inheritance persists after
- Consider: adaptation **precedes** inheritance? But they're concurrent processes too
- Good conceptual distinction that's not reducible to temporal sequence

**Decision:** **KEEP BOTH** - Valuable distinction

---

## Reciprocal Pairs Summary (11 total)

**Decisions:**
- **Keep both** (6 pairs = 12 edges): interpretation⟷meaning, drift⟷inheritance, authority⟷legitimacy, connection⟷contact, acceleration⟷momentum, adaptation⟷inheritance
- **Collapse** (3 pairs = remove 6 edges, keep 1-2 as different type): coupling⟷cohesion, correction⟷revisability, alignment⟷legitimacy
- **Remove both** (1 pair = remove 2 edges): drift⟷normalization
- **Replace with different type** (1 pair = remove 2 edges, add 1): consequence-architecture⟷coupling

**Net: 22 edges → 13 edges** (9 edge reduction from reciprocal pairs)

---

## ONE-DIRECTIONAL CONTRASTS (38 edges)

Let me now audit the remaining one-directional edges...

### boundary → coupling

**Edge:** "A boundary marks a shift in shape, not the strength of attachment between action and consequence."

**Analysis:**
- Not disambiguation - describes what boundary doesn't measure
- Consider: boundary **shapes** coupling? Boundaries affect coupling strength

**Decision:** **CHANGE TYPE** - Replace with:
- boundary **shapes** coupling: "Boundaries shape coupling by marking where consequence pathways change, often weakening attachment as effects cross organizational or geographic divides."

---

### care → attention

**Edge:** "Care carries obligation toward a person, not only selective availability of signal."

**Analysis:**
- Good distinction: relational obligation (care) vs selective capacity (attention)
- Useful for distinguishing these concepts

**Decision:** **KEEP** - Valuable distinction

---

### attention → bias

**Edge:** "Attention names the selective capacity itself; bias names the selective work performed."

**Analysis:**
- Good distinction: capacity (attention) vs work (bias)
- Helps clarify the relationship

**Decision:** **KEEP** - Valuable distinction

---

### finite-perspective → bias

**Edge:** "Finite perspective names the structural condition of partiality; bias names the selective work within it."

**Analysis:**
- Consider: finite-perspective **produces** bias? Structural condition generates selective work
- Or finite-perspective **grounds** bias?
- Not pure disambiguation - there's a causal/grounding relationship

**Decision:** **CHANGE TYPE** - Replace with:
- finite-perspective **grounds** bias: "Finite perspective creates the structural condition of partiality within which bias emerges as the necessary selective work of attention."

---

### bias → integration

**Edge:** "Bias describes what each partial view leaves out, not how partial views combine."

**Analysis:**
- Weak distinction - just says what bias doesn't do
- integration concept not strongly developed
- Low value

**Decision:** **REMOVE** - Weak "is not" statement without strong navigational value

---

### friction → contestability

**Edge:** "Friction is the slowness itself; contestability is the capacity to reopen what has been settled."

**Analysis:**
- Good distinction: mechanism (friction/slowness) vs capacity (contestability)
- Different concepts that could be confused

**Decision:** **KEEP** - Valuable distinction

---

### mediation → distance

**Edge:** "Mediation is the system of intermediaries; distance is the separation they attempt to bridge."

**Analysis:**
- Good distinction: system (mediation) vs gap (distance)
- Clarifies relationship between concepts

**Decision:** **KEEP** - Valuable distinction

---

### permission → authority

**Edge:** "Permission is granted socially through pattern and response; authority is granted formally through role."

**Analysis:**
- Good distinction: social/informal (permission) vs formal (authority)
- Useful clarification

**Decision:** **KEEP** - Valuable distinction

---

### authorization → permission

**Edge:** "Authorization is permission that has become routinized and institutionally durable."

**Analysis:**
- Not disambiguation - describes temporal/institutional progression
- Consider: permission **precedes** authorization? Or hardens into?
- Describes transformation relationship

**Decision:** **CHANGE TYPE** - Replace with:
- permission **precedes** authorization: "Permission can harden into authorization when informal social patterns become routinized and institutionally durable."

---

### proximity → contact

**Edge:** "Proximity is ongoing relational nearness; contact is staying close to unfinished meaning in the moment."

**Analysis:**
- Good distinction: relational nearness (proximity) vs meaning-closeness (contact)
- Different senses of "closeness"

**Decision:** **KEEP** - Valuable distinction

---

### proximity → connection

**Edge:** "Proximity names ongoing relational nearness; connection is reachability with consequence."

**Analysis:**
- Good distinction: nearness (proximity) vs reachability (connection)
- Helps distinguish types of relationship

**Decision:** **KEEP** - Valuable distinction

---

### post-interpretive-authority → boundary

**Edge:** "Post-interpretive authority persists without external interpretation; boundary marks where understanding ceases to govern."

**Analysis:**
- Weak - complex relationship between specialized concepts
- Not clear disambiguation
- Low navigation value

**Decision:** **REMOVE** - Overly abstract, limited value

---

### constraint → constraints

**Edge:** "Constraint names originating historical pressure; constraints names operational limits inside a system."

**Analysis:**
- Singular vs plural term disambiguation
- Useful for clarifying terminology
- Prevents confusion

**Decision:** **KEEP** - Valuable terminology distinction

---

### erosion → decay

**Edge:** "Erosion names the process of thinning; decay names the end state."

**Analysis:**
- Good distinction: process (erosion) vs outcome (decay)
- Temporal/causal distinction

**Decision:** **KEEP** - Valuable distinction

---

### throughput → acceleration

**Edge:** "Throughput is about sustained flow; acceleration is about speed under pressure."

**Analysis:**
- Good distinction: sustained (throughput) vs pressured (acceleration)
- Different dynamics

**Decision:** **KEEP** - Valuable distinction

---

### alignment-at-scale → alignment

**Edge:** "Alignment-at-scale is institutional reproduction; alignment is belonging-signal coordination."

**Analysis:**
- Not disambiguation - describes transformation/escalation
- alignment-at-scale is alignment reproduced institutionally
- Consider: alignment **reproduces** alignment-at-scale (already exists!)

**Decision:** **REMOVE** - Redundant with existing reproduces edge

---

### alignment → coordination

**Edge:** "Alignment can bind identity, not only sequence action."

**Analysis:**
- Weak distinction - just says alignment is more than coordination
- Not clear mutual disambiguation
- Low value

**Decision:** **REMOVE** - Weak comparative statement

---

### consequence-architecture → cohesion

**Edge:** "Consequence-architecture designs the whole path; cohesion is ownership within a boundary."

**Analysis:**
- Weak - just restates scope difference
- Not strong disambiguation
- Low navigation value

**Decision:** **REMOVE** - Weak scope statement

---

### adaptation → drift

**Edge:** "Adaptation is active response; drift is loss of fit over time."

**Analysis:**
- Good distinction: intentional (adaptation) vs loss (drift)
- Different dynamics

**Decision:** **KEEP** - Valuable distinction

---

### repair → witness

**Edge:** "Repair aims to restore standing; witness preserves record when repair cannot yet change the scene."

**Analysis:**
- Excellent distinction with causal/temporal relationship
- Shows when each applies
- Core concepts

**Decision:** **KEEP** - Valuable distinction

---

### correction → repair

**Edge:** "Correction updates belief and behavior; repair addresses damaged trust and legitimacy."

**Analysis:**
- Good distinction: belief/behavior (correction) vs trust/standing (repair)
- Different targets and mechanisms

**Decision:** **KEEP** - Valuable distinction

---

### witness → correction

**Edge:** "Witness may record harm without altering it; correction updates belief and behavior."

**Analysis:**
- Good distinction: recording (witness) vs updating (correction)
- Different actions and implications

**Decision:** **KEEP** - Valuable distinction

---

### agency → responsibility

**Edge:** "Responsibility can remain assigned when agency has thinned; agency is capacity to act."

**Analysis:**
- Good distinction showing they can diverge: responsibility persists when agency thins
- Important for understanding accountability without full control

**Decision:** **KEEP** - Valuable distinction

---

## FINAL AUDIT SUMMARY

### ALL CONTRASTS EDGES CATEGORIZED

**KEEP AS CONTRASTS (26 edges):**

**Reciprocal pairs (6 pairs = 12 edges):**
1. interpretation ⟷ meaning
2. drift ⟷ inheritance  
3. authority ⟷ legitimacy
4. connection ⟷ contact
5. acceleration ⟷ momentum
6. adaptation ⟷ inheritance

**One-directional (14 edges):**
7. trust → certainty
8. certainty → judgment
9. agency → judgment
10. agency → responsibility
11. judgment → optimization
12. revisability → judgment
13. corrigibility → revisability
14. reversibility → revisability
15. responsibility → accountability
16. responsibility → answerability
17. answerability → accountability
18. repair → accountability
19. repair → witness
20. witness → accountability
21. witness → correction
22. correction → repair
23. care → attention
24. attention → bias
25. friction → contestability
26. mediation → distance
27. permission → authority
28. proximity → contact
29. proximity → connection
30. constraint → constraints
31. erosion → decay
32. throughput → acceleration
33. adaptation → drift

**Total to keep: 26 edges**

---

**CHANGE TO NEW TYPE (7 edges):**

Using **grounds** (3):
1. finite-perspective → trust (currently contrasts)
2. finite-perspective → bias (currently contrasts)

Using **calibrates** (1):
3. feedback → trust (currently contrasts)

Using **shapes** (2):
4. boundary → coupling (currently contrasts)
5. consequence-architecture → coupling (currently contrasts, remove reciprocal)

Using **enables** (1):
6. feedback → correction (currently contrasts)

Using **precedes** (1):
7. permission → authorization (currently contrasts, rewrite as precedes)

**Total: 7 new edges replacing 8 contrasts edges**

---

**REMOVE AS REDUNDANT (11 edges):**

1. coupling ⟷ cohesion (both directions) - have complements edge
2. correction ⟷ revisability (both directions) - have requires edge
3. drift ⟷ normalization (both directions) - have precedes edge
4. alignment ⟷ legitimacy (remove weaker direction, keep one)
5. bias → integration - weak statement
6. post-interpretive-authority → boundary - abstract, low value
7. alignment-at-scale → alignment - redundant with reproduces edge
8. alignment → coordination - weak statement
9. consequence-architecture → cohesion - weak scope statement

**Total to remove: 11 edges**

---

**FINAL TALLY:**

- **Starting contrasts:** 60 edges
- **Keep as contrasts:** 26 edges (43%)
- **Change to other types:** 7 new edges (replacing 8 contrasts)
- **Remove entirely:** 11 edges
- **Net contrasts remaining:** 26 edges

**New distribution projection:**
- Total relationships: 108 - 11 removed = 97 + 7 new = 104 relationships
- contrasts: 26 (25%)
- Other types increase by 7

**✅ Target achieved: contrasts < 30%**

---

## NEW RELATIONSHIP TYPES TO ADD

### grounds
**Meaning:** A provides the foundational condition or structural basis that makes B necessary or possible (epistemic grounding)

**Pattern:** A creates the structural condition that makes B necessary

**Directionality:** Strong (A → B is not B → A)

**Examples:**
- finite-perspective **grounds** trust
- finite-perspective **grounds** bias

**Usage:** Use when source creates the structural/epistemic condition that necessitates or generates the target

---

### calibrates
**Meaning:** A adjusts, tunes, or maintains B in proper proportion through ongoing feedback

**Pattern:** A keeps B aligned with reality through continuous adjustment

**Directionality:** Strong (A → B is not B → A)

**Examples:**
- feedback **calibrates** trust

**Usage:** Use when source provides ongoing adjustment signals that keep target properly tuned

---

### shapes
**Meaning:** A influences the form, structure, or characteristics of B (lighter than determines, stronger than influences)

**Pattern:** A affects how B manifests or operates

**Directionality:** Strong (A → B is not B → A)

**Examples:**
- boundary **shapes** coupling
- consequence-architecture **shapes** coupling

**Usage:** Use when source affects the form or characteristics of target through design or structural influence

---

## IMPLEMENTATION PLAN

1. Update semantic/relationships.yml:
   - Remove 11 redundant contrasts edges
   - Change 8 contrasts edges to new types (7 net new edges)
   - Keep 26 contrasts edges unchanged

2. Update docs/semantic-relationship-types.md:
   - Add grounds, calibrates, shapes relationship types
   - Update usage counts
   - Add examples

3. Validate:
   - Run make verify-semantic-ontology
   - Check semantic manifest generation
   - Verify website still builds

4. Document:
   - Update concept-graph-relationship-audit.md statistics
   - Note the reduction from 60 to 26 contrasts edges
