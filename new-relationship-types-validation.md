# New Relationship Type Validation

**Date:** 2026-07-06

## Summary

During Phase 1 implementation, I introduced **5 new relationship types** with **7 total uses**:

| Type | Uses | Source | Evaluation |
|------|------|--------|------------|
| enables | 3 | New | ✅ **Warranted** - distinct semantic |
| constrains | 1 | New | ⚠️ **Review** - could use existing type |
| distorts | 1 | structural-pressures.yml | ✅ **Warranted** - unique semantic |
| hardens | 1 | structural-pressures.yml | ✅ **Warranted** - unique semantic |
| weakens | 1 | structural-pressures.yml | ⚠️ **Review** - similar to `thins` |

## Detailed Analysis

### ✅ `enables` (3 uses) - **KEEP**

**Uses:**
- `corrigibility` enables `correction`
- `coupling` enables `correction`  
- `feedback` enables `correction`

**Semantic meaning:** Provides capacity or makes possible. Creates conditions for something to happen.

**Distinct from:**
- `requires` (dependency) - X requires Y means X can't exist without Y
- `enables` (capacity) - X enables Y means X makes Y possible

**Verdict:** **Warranted.** Clear semantic distinction, multiple uses, fills a gap.

---

### ⚠️ `constrains` (1 use) - **REVIEW**

**Uses:**
- `certainty` constrains `corrigibility`

**Semantic meaning:** Limits capacity or narrows options.

**Could use instead:**
- `thins` - weakens or reduces (already have 6 uses)
- `pressures` - creates constraint (already have 1 use)

**Consideration:** "Constrains" is more precise than "thins" (which is about weakening) and different from "pressures" (which is about urgency). The definition says "tools built to preserve certainty **constrain** revision."

**Verdict:** **Keep but monitor.** Only 1 use, but semantically distinct. If no additional uses emerge, could consolidate to `thins`.

---

### ✅ `distorts` (1 use) - **KEEP**

**Uses:**
- `mediation` distorts `interpretation`

**Semantic meaning:** Warps, misshapes, or alters form in passage.

**Source:** Explicitly listed in `semantic/ontology/structural-pressures.yml`

**Distinct from:**
- `thins` - reduces strength/intensity
- `distorts` - changes shape/form

**Verdict:** **Warranted.** Unique semantic, already part of framework vocabulary in pressures file.

---

### ✅ `hardens` (1 use) - **KEEP**

**Uses:**
- `normalization` hardens `adaptation`

**Semantic meaning:** Solidifies, rigidifies, makes permanent.

**Source:** Explicitly listed in `semantic/ontology/structural-pressures.yml`

**Distinct from:**
- `preserves` - maintains in good state
- `hardens` - solidifies into fixed state (often negative)
- `stabilizes` - reduces variance

**Verdict:** **Warranted.** Unique semantic (negative solidification), already part of framework vocabulary. Fills gap for "freezing" dynamics.

---

### ⚠️ `weakens` (1 use) - **CONSOLIDATE?**

**Uses:**
- `asymmetry` weakens `reciprocity`

**Semantic meaning:** Reduces strength or capacity.

**Source:** Listed in `semantic/ontology/structural-pressures.yml`

**Overlap with:**
- `thins` - already used for scale weakening various concepts (6 uses)
- Both mean "reduces strength/capacity"

**Difference:**
- `thins` - associated with scale, distance, abstraction (spreading thin)
- `weakens` - more general reduction of strength

**Consideration:** Could consolidate `asymmetry` weakens `reciprocity` → `asymmetry` thins `reciprocity`. Both semantics work.

**Verdict:** **Consider consolidation.** Very similar to `thins`. If keeping separate, need clear distinction:
- `thins` = spreads capacity too thin (scale effect)
- `weakens` = directly reduces strength (force effect)

---

## Recommendation Summary

### Keep (4 types)
1. ✅ **enables** - distinct semantic, multiple uses, fills clear gap
2. ✅ **distorts** - unique semantic, from framework vocabulary
3. ✅ **hardens** - unique semantic, from framework vocabulary
4. ⚠️ **constrains** - semantically distinct but only 1 use (monitor)

### Consider Consolidating (1 type)
5. ⚠️ **weakens** - very similar to `thins`, could consolidate

### Alternative: Keep `weakens` with Clear Distinction

If keeping both `thins` and `weakens`:

**`thins`** - Spreading effect (scale, distance, abstraction)
- "Scale thins feedback" (spreading across distance)
- "Scale thins accountability" (diffusing across roles)
- "Scale thins coupling" (lengthening the chain)

**`weakens`** - Direct reduction (force, opposition)
- "Asymmetry weakens reciprocity" (uneven power reduces mutual constraint)
- Better fit for structural force dynamics

---

## Final Vocabulary Assessment

**Current typed relationship vocabulary (16 types):**

| Type | Uses | Category | Status |
|------|------|----------|--------|
| thins | 6 | Weakening | Core |
| requires | 5 | Dependency | Core |
| contrasts | 7 | Disambiguation | Core |
| preserves | 3 | Protection | Core |
| enables | 3 | Capacity | **New, Keep** |
| precedes | 2 | Temporal | Core |
| renews | 2 | Restoration | Core |
| reproduces | 2 | Propagation | Core |
| stabilizes | 2 | Support | Core |
| complements | 1 | Coordination | Core |
| constrains | 1 | Limitation | **New, Monitor** |
| distorts | 1 | Transformation | **New, Keep** |
| hardens | 1 | Solidification | **New, Keep** |
| intensifies | 1 | Escalation | Core |
| pressures | 1 | Force | Core |
| weakens | 1 | Weakening | **New, Review** |

**Assessment:** Vocabulary is well-sized and semantically coherent. 16 types with clear distinctions is manageable. Only potential consolidation is `weakens` → `thins`.

---

## Action Items

1. ✅ **Keep** `enables`, `distorts`, `hardens` - all warranted
2. ⚠️ **Monitor** `constrains` - watch for additional uses to validate
3. ⚠️ **Consider** consolidating `weakens` to `thins` OR document clear distinction
4. 📝 **Document** semantics for all relationship types in guidelines

---

## Conclusion

The new relationship types are **largely justified**:
- 4 of 5 are clearly warranted with distinct semantics
- 1 (weakens) has minor overlap with existing type
- Vocabulary remains coherent and manageable at 16 types
- Additional documentation would improve consistency
