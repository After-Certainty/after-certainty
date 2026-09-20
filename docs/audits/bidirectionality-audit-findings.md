# Bidirectionality Audit Findings

**Date:** 2026-07-06

## Summary

Analysis of `relatedConcepts` connections reveals significant asymmetry in the untyped relationship layer:

- **51 symmetric connections** (38%) - proper bidirectional navigation
- **85 asymmetric connections** (62%) - one-way navigation paths
- **Total concepts analyzed:** 137

## Interpretation

The high rate of asymmetry (62%) is **not necessarily a problem**. Many asymmetric connections represent:

1. **Naturally directional relationships** that should be typed rather than made symmetric
   - Example: `friction` → `contestability` (friction preserves contestability)
   - Example: `machine-perspective` → `finite-perspective` (is-a relationship)
   - Example: `authorization` → `legitimacy` (authorization depends on legitimacy)

2. **Hierarchical or definitional relationships**
   - Specific concepts pointing to more general concepts
   - Extended terms pointing to core terms

3. **Force dynamics** that belong in typed relationships
   - Concepts that enable, constrain, or depend on others

## Recommendations

### 1. Do NOT enforce blanket bidirectional symmetry

Asymmetry is often semantically correct. Making all relationships symmetric would:
- Hide directional semantics
- Create false equivalence between concepts
- Add navigation noise

### 2. Migrate directional untyped relationships to typed edges

Many asymmetric `relatedConcepts` should become typed relationships:

**Examples needing typing:**
- `friction` → `contestability` (preserves)
- `machine-perspective` → `finite-perspective` (extends or is-a)
- `authorization` → `legitimacy` (requires or depends_on)
- `displacement-of-interpretation` → `interpretive-collapse` (precedes)
- `witness` → `correction` (contrasts or enables)

### 3. Document intentional directionality

Add a field or documentation to clarify:
- Which untyped relationships are intentionally directional
- Which should be symmetric but aren't (navigation bugs)
- Guidelines for when to use typed vs untyped relationships

### 4. Fix genuine navigation bugs

Some asymmetries may be unintentional. Review cases where:
- Core concepts don't link back to important referencing concepts
- Disambiguation pairs are only wired one direction

## Top Asymmetric Sources

Concepts with most one-way outgoing connections:

| Concept | Asymmetric Out | Notes |
|---------|---------------|-------|
| machine-perspective | 5 | Points to foundational concepts |
| authorization | 4 | Points to legitimacy cluster |
| displacement-of-interpretation | 4 | Points to interpretation concepts |
| friction | 4 | Points to concepts it preserves/affects |
| relational-credibility | 4 | Points to trust cluster |
| boundary | 3 | Points to coupling, accountability |
| certainty | 3 | Points to interpretation, meaning |
| witness | 3 | Points to correction, judgment |

## Next Steps

1. **Phase 1 (Immediate):** Identify 10-15 high-value asymmetric relationships that should be typed
2. **Phase 2 (Documentation):** Document directionality conventions in semantic graph guidelines
3. **Phase 3 (Optional):** Build tooling to flag potentially problematic asymmetries

## Conclusion

The 62% asymmetry rate reflects a mix of:
- ✅ Correctly directional semantics (should be typed)
- ⚠️ Missing documentation about intentionality
- ❌ Possible navigation bugs (needs case-by-case review)

Rather than enforcing symmetry, the path forward is to:
1. Type the directional relationships properly
2. Document the conventions
3. Fix genuine bugs on a case-by-case basis
