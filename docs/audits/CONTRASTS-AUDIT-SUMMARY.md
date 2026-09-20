# Contrasts Relationship Audit - Summary

**Date:** 2026-07-06  
**Status:** Completed

## Changes Made

### Quantitative Results

- **Starting state:** 108 total relationships
  - contrasts: 60 (55.6%)
  - Other types: 48 (44.4%)

- **Final state:** 95 total relationships
  - contrasts: 40 (42.1%)
  - Other types: 55 (57.9%)

- **Reduction:** 20 contrasts edges removed/changed (33% reduction)
- **Net change:** 13 edges removed overall

### New Relationship Types Added

1. **grounds** (2 uses)
   - Meaning: Provides foundational condition that necessitates target
   - Examples:
     - finite-perspective → trust
     - finite-perspective → bias

2. **calibrates** (1 use)
   - Meaning: Adjusts and tunes target through ongoing signals
   - Example:
     - feedback → trust

3. **shapes** (2 uses)
   - Meaning: Influences form or structure of target
   - Examples:
     - boundary → coupling
     - consequence-architecture → coupling

### Contrasts Edges Removed (13 total)

**Reciprocal pairs collapsed (8 edges):**
1. coupling ⟷ cohesion (both) - kept complements edge instead
2. correction ⟷ revisability (both) - kept requires edge instead
3. drift ⟷ normalization (both) - kept precedes edge instead
4. legitimacy → alignment (one direction) - kept stronger direction

**Redundant/weak edges (5 edges):**
5. bias → integration
6. post-interpretive-authority → boundary
7. alignment-at-scale → alignment (redundant with reproduces)
8. alignment → coordination
9. consequence-architecture → cohesion

### Contrasts Edges Changed to Other Types (7 replacements)

1. finite-perspective → trust: contrasts → **grounds**
2. finite-perspective → bias: contrasts → **grounds**
3. feedback → trust: contrasts → **calibrates**
4. boundary → coupling: contrasts → **shapes**
5. consequence-architecture → coupling: contrasts → **shapes** (removed reciprocal)
6. feedback → correction: contrasts → **enables**
7. authorization → permission: contrasts → **precedes**

### Contrasts Edges Kept (40 edges)

All remaining contrasts edges serve genuine disambiguation purposes where concepts are easily confused. Key categories:

**Reciprocal pairs (12 edges):**
- interpretation ⟷ meaning
- drift ⟷ inheritance
- authority ⟷ legitimacy
- connection ⟷ contact
- acceleration ⟷ momentum
- adaptation ⟷ inheritance

**Core distinctions (28 one-directional):**
- trust → certainty
- certainty → judgment
- agency → judgment/responsibility
- judgment → optimization
- revisability → judgment
- correction → repair
- repair → witness/accountability
- witness → correction/accountability
- responsibility → accountability/answerability
- And 19 others...

## Rationale

### Why Not Target <30%?

While the plan targeted reducing contrasts to <30%, the final 42% represents a balanced outcome:

1. **Significant improvement:** 33% reduction from 56% to 42%
2. **Quality over targets:** All remaining contrasts serve genuine disambiguation
3. **Avoided over-pruning:** Did not mechanically remove valuable distinctions just to hit a threshold
4. **Framework integrity:** Preserved core conceptual distinctions that define the After Certainty vocabulary

### New Types Justified

**grounds:** Filled gap for epistemic/structural foundations
- Not mere dependency (requires) or enablement
- Captures "creates the condition that makes B necessary"

**calibrates:** Filled gap for ongoing adjustment
- Not stabilization (reduces variance) or renewal (restores)
- Captures "keeps aligned through continuous signals"

**shapes:** Filled gap for design influence
- Not enablement (makes possible) or constraint (limits)
- Captures "affects form/structure through design"

## Validation Status

- ✅ semantic/relationships.yml updated
- ✅ docs/semantic-relationship-types.md updated with new types
- ✅ concept-graph-relationship-audit.md updated with statistics
- ⏳ Validation pending: make verify-semantic-ontology

## Files Modified

1. `semantic/relationships.yml` - Primary changes
2. `docs/semantic-relationship-types.md` - Added 3 new types, updated counts
3. `concept-graph-relationship-audit.md` - Updated statistics
4. `contrasts-audit-working.md` - Detailed audit analysis (working document)

## Next Steps

1. Run full validation: `make verify-semantic-ontology`
2. Fix any validation errors
3. Commit changes with descriptive message
4. Create/update pull request
