# Relationship Type Semantics and Usage Guidelines

**Version:** 1.0  
**Date:** 2026-07-06  
**Status:** Living document

---

## Overview

The After Certainty semantic graph uses **typed directed relationships** to encode how concepts interact. This document defines the semantics of each relationship type and provides usage guidelines.

**Current vocabulary:** 19 relationship types + structural_tension (bidirectional)

---

## Design Principles

1. **Precision over quantity** - Prefer specific relationship types that communicate clear semantics
2. **Consistency** - Use the same type for similar relationship patterns
3. **Directionality** - Most relationships are directional (source → target)
4. **Complementary to untyped** - `relatedConcepts` provides undifferentiated adjacency; typed relationships provide semantic precision

---

## Relationship Type Reference

### 1. Core Weakening Relationships

#### `thins`
**Meaning:** Weakens, reduces intensity, or spreads capacity too thin  
**Pattern:** Source reduces the strength or density of target  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `scale` thins `correction` - Scale weakens feedback loops
- `scale` thins `accountability` - Scale diffuses answerability across roles
- `scale` thins `coupling` - Scale lengthens the chain between action and consequence
- `abstraction` thins `accountability` - Abstraction obscures consequence

**Usage:** Prefer for scale/distance effects that "spread thin" rather than directly attack.

**Distinguish from:**
- `weakens` - Direct reduction of strength (force effect)
- `erodes` - Gradual degradation over time (not yet in vocabulary)
- `constrains` - Limits capacity rather than reduces strength

---

#### `weakens`
**Meaning:** Directly reduces strength or capacity through force or opposition  
**Pattern:** Source diminishes target's power or effect  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `asymmetry` weakens `reciprocity` - Uneven power reduces mutual constraint

**Usage:** Prefer for structural force dynamics that directly oppose or reduce.

**Distinguish from:**
- `thins` - Spreading effect (scale/distance) rather than direct force
- `constrains` - Limits options rather than reduces strength

**Note:** Only 1 use currently. Consider consolidating to `thins` if no clear semantic distinction emerges.

---

### 2. Structural Dependencies

#### `requires`
**Meaning:** Structural dependency - source cannot exist or function without target  
**Pattern:** A requires B means A depends on B as a foundation  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `correction` requires `revisability` - Correction depends on designed openness to update
- `judgment` requires `revisability` - Judgment needs ongoing capacity for revision
- `accountability` requires `coupling` - Accountability needs exposure to consequence
- `trust` requires `feedback` - Trust needs testable signals
- `legitimacy` requires `contestability` - Legitimacy needs ability to be questioned

**Usage:** Use when target is a necessary precondition or foundation for source.

**Distinguish from:**
- `enables` - Target makes source possible (capacity) vs source depends on target (necessity)
- `depends_on` - Not yet in vocabulary, would be synonym

---

#### `enables`
**Meaning:** Provides capacity or makes possible  
**Pattern:** A enables B means A creates conditions for B to happen  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `corrigibility` enables `correction` - Capacity for revision enables the act
- `coupling` enables `correction` - Tight coupling makes feedback fast and correction possible
- `feedback` enables `correction` - Returning signals enable updating

**Usage:** Use when source provides capacity that makes target possible.

**Distinguish from:**
- `requires` - Opposite direction (A requires B vs A enables B)
- `preserves` - Maintains existing capacity vs creates capacity

---

#### `grounds`
**Meaning:** Provides foundational condition or structural basis that necessitates target  
**Pattern:** A grounds B means A creates the structural condition that makes B necessary  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `finite-perspective` grounds `trust` - Finite perspective creates the condition that makes trust necessary
- `finite-perspective` grounds `bias` - Structural partiality generates selective work of attention

**Usage:** Use when source creates the epistemic or structural foundation that makes target necessary or inevitable.

**Distinguish from:**
- `requires` - Dependency (A needs B) vs foundation (A creates condition for B)
- `enables` - Makes possible vs makes necessary
- `produces` - Not yet in vocabulary, would be similar but more causal

---

### 3. Protection and Stabilization

#### `preserves`
**Meaning:** Maintains, protects, or keeps capacity intact  
**Pattern:** A preserves B means A protects B from degradation  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `friction` preserves `corrigibility` - Resistance helps systems remain revisable
- `friction` preserves `judgment` - Slowness protects space for deliberation
- `uncertainty` preserves `correction` - Openness keeps systems revisable

**Usage:** Use when source maintains or protects target's capacity.

**Distinguish from:**
- `stabilizes` - Reduces variance vs protects from harm
- `renews` - Restores after degradation vs prevents degradation
- `enables` - Creates capacity vs maintains capacity

---

#### `stabilizes`
**Meaning:** Reduces variance, volatility, or disruption  
**Pattern:** A stabilizes B means A makes B more consistent or predictable  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `certainty` stabilizes `coordination` - Reduces cost of renegotiation
- `circulation` stabilizes `meaning` - Allows meaning to persist through systems

**Usage:** Use when source reduces fluctuation or increases predictability.

**Distinguish from:**
- `preserves` - Protects capacity vs reduces variance
- `renews` - Restores after loss vs prevents loss

---

#### `renews`
**Meaning:** Restores, regenerates, or refreshes capacity after degradation  
**Pattern:** A renews B means A replenishes B after it has weakened  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `correction` renews `legitimacy` - Visible correction restores trust
- `coupling` renews `legitimacy` - Exposure to consequence maintains standing

**Usage:** Use when source restores target after degradation.

**Distinguish from:**
- `preserves` - Prevents degradation vs repairs after degradation
- `stabilizes` - Reduces variance vs restores capacity

---

### 4. Force and Constraint

#### `pressures`
**Meaning:** Creates urgency, constraint, or demand that changes behavior  
**Pattern:** A pressures B means A creates conditions that constrain B's operation  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `acceleration` pressures `judgment` - Speed favors rapid coordination over deliberation

**Usage:** Use when source creates urgency or constraint that alters target.

**Distinguish from:**
- `constrains` - Limits options vs creates pressure
- `thins` - Weakens capacity vs applies force

---

#### `constrains`
**Meaning:** Limits capacity, options, or range of operation  
**Pattern:** A constrains B means A narrows what B can do  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `certainty` constrains `corrigibility` - Tools to preserve certainty limit revision capacity

**Usage:** Use when source limits target's range of action or capacity.

**Distinguish from:**
- `thins` - Reduces strength vs limits options
- `pressures` - Creates urgency vs limits capacity

**Note:** Only 1 use currently. Monitor for additional uses to validate semantic distinction.

---

#### `hardens`
**Meaning:** Solidifies, rigidifies, or makes permanent (often negative)  
**Pattern:** A hardens B means A turns temporary B into fixed state  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `normalization` hardens `adaptation` - What was temporary becomes permanent baseline

**Usage:** Use when source solidifies target from flexible to rigid state.

**Source:** `semantic/ontology/structural-pressures.yml`

**Distinguish from:**
- `stabilizes` - Reduces variance (neutral/positive) vs fixes in place (negative)
- `preserves` - Maintains good state vs freezes into rigid state

---

### 5. Transformation and Distortion

#### `distorts`
**Meaning:** Warps, misshapes, or alters form in passage  
**Pattern:** A distorts B means A changes the shape or meaning of B  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `mediation` distorts `interpretation` - Meaning changes through intermediaries

**Usage:** Use when source alters the form or shape of target.

**Source:** `semantic/ontology/structural-pressures.yml`

**Distinguish from:**
- `thins` - Reduces strength vs changes form
- `erodes` - Gradual degradation vs warping

---

### 6. Propagation and Amplification

#### `reproduces`
**Meaning:** Propagates, amplifies, or causes structural persistence  
**Pattern:** A reproduces B means A causes B to persist or multiply structurally  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `circulation` reproduces `authority` - Structures persist beyond individuals
- `alignment` reproduces `alignment-at-scale` - Belonging signals harden institutionally

**Usage:** Use when source causes target to persist or amplify through systems.

**Distinguish from:**
- `enables` - Creates capacity vs causes propagation
- `stabilizes` - Reduces variance vs amplifies structure

---

#### `intensifies`
**Meaning:** Escalates, amplifies, or increases severity  
**Pattern:** A intensifies B means A makes B stronger or more severe  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `post-interpretive-authority` intensifies `total-authority` - Can eliminate public evaluative space

**Usage:** Use when source escalates or amplifies the severity of target.

**Distinguish from:**
- `reproduces` - Structural propagation vs intensification
- `pressures` - Creates constraint vs amplifies existing condition

---

### 7. Temporal and Sequential

#### `precedes`
**Meaning:** Comes before in time or causal sequence  
**Pattern:** A precedes B means A typically happens before B in a process  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `public-interpretation` precedes `interpretive-collapse` - Loss follows the loss of shared evaluation
- `drift` precedes `normalization` - Decoupling hardens into expectation

**Usage:** Use for temporal or causal sequences, especially deterioration pathways.

**Distinguish from:**
- `enables` - Makes possible vs comes before
- `causes` - Not in vocabulary; use `precedes` for sequences without claiming direct causation

---

### 8. Disambiguation and Contrast

#### `contrasts`
**Meaning:** Distinguishes or clarifies differences between similar concepts  
**Pattern:** A contrasts B means A and B are easily confused but meaningfully different  
**Directionality:** Weak (conceptually symmetric but stored one direction)

**Examples:**
- `repair` contrasts `witness` - Restoration vs record-keeping
- `correction` contrasts `repair` - Belief update vs trust restoration
- `responsibility` contrasts `accountability` - Enduring obligation vs exposure to consequence
- `certainty` contrasts `judgment` - Compressed coordination vs weighing tradeoffs

**Usage:** Use when concepts are frequently confused and need clear distinction. Often corresponds to "differs from" statements in definitions.

**Distinguish from:**
- `structural_tension` - Fundamental opposition vs disambiguation
- All other types have asymmetric force; contrasts is primarily for clarity

**Note:** Contrasts relationships are conceptually bidirectional (if A contrasts B, then B contrasts A) but may be stored in only one direction in the YAML for efficiency.

---

### 9. Coordination and Complementarity

#### `complements`
**Meaning:** Works together with, supports without duplication  
**Pattern:** A complements B means A and B work together, each handling different aspects  
**Directionality:** Weak (conceptually symmetric)

**Examples:**
- `cohesion` complements `coupling` - Ownership clarity + consequence attachment

**Usage:** Use when concepts coordinate to handle different aspects of a problem.

**Distinguish from:**
- `enables` - Creates capacity vs works alongside
- `preserves` - Protects vs coordinates with

---

#### `shapes`
**Meaning:** Influences the form, structure, or characteristics of target  
**Pattern:** A shapes B means A affects how B manifests or operates  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `boundary` shapes `coupling` - Boundaries affect attachment strength across divides
- `consequence-architecture` shapes `coupling` - Design determines attachment patterns

**Usage:** Use when source affects the form or characteristics of target through design or structural influence. Lighter than `determines`, stronger than generic influence.

**Distinguish from:**
- `enables` - Makes possible vs affects form
- `constrains` - Limits vs influences shape
- `produces` - Not yet in vocabulary, would be stronger/more direct

---

#### `calibrates`
**Meaning:** Adjusts, tunes, or maintains target in proper proportion  
**Pattern:** A calibrates B means A keeps B aligned with reality through ongoing adjustment  
**Directionality:** Strong (A → B is not B → A)

**Examples:**
- `feedback` calibrates `trust` - Signals update confidence and expose when trust has thinned

**Usage:** Use when source provides ongoing adjustment signals that keep target properly tuned to changing conditions.

**Distinguish from:**
- `enables` - Makes possible vs maintains calibration
- `stabilizes` - Reduces variance vs actively adjusts
- `renews` - Restores after degradation vs ongoing tuning

---

### 10. Structural Tensions (Special Type)

#### `structural_tension`
**Meaning:** Fundamental opposition or trade-off between concepts  
**Pattern:** A ⟷ B means A and B are in permanent tension, not resolvable  
**Directionality:** Bidirectional (symmetric)

**Source:** `semantic/ontology/structural-tensions.yml`

**Examples:**
- `certainty` ⟷ `uncertainty` - coordination stability vs revisability
- `authority` ⟷ `legitimacy` - operational power vs justified recognition
- `circulation` ⟷ `correction` - continuity vs reality-contact

**Usage:** Use for fundamental oppositions built into the framework. Should be rare (currently 10).

**Distinguish from:**
- `contrasts` - Disambiguation vs fundamental opposition
- All other types model force/influence; tensions model irreducible trade-offs

---

## Usage Decision Tree

When adding a new relationship, ask:

### 1. Is this a disambiguation?
→ **YES:** Use `contrasts` (look for "differs from" in definitions)  
→ **NO:** Continue

### 2. Is this a fundamental trade-off?
→ **YES:** Consider adding to `structural-tensions.yml` (rare)  
→ **NO:** Continue

### 3. Does source reduce/weaken target?
→ **YES:** `thins` (scale effect), `weakens` (force effect), or `constrains` (limits)  
→ **NO:** Continue

### 4. Does source protect/support target?
→ **YES:** `preserves` (maintains), `stabilizes` (reduces variance), or `renews` (restores)  
→ **NO:** Continue

### 5. Does source enable/require target?
→ **YES:** `enables` (creates capacity), `requires` (depends on), or `reproduces` (propagates)  
→ **NO:** Continue

### 6. Does source precede target in time?
→ **YES:** `precedes` (temporal/causal sequence)  
→ **NO:** Continue

### 7. Does source transform target?
→ **YES:** `distorts` (warps), `hardens` (rigidifies), or `intensifies` (amplifies)  
→ **NO:** Continue

### 8. Do they work together?
→ **YES:** `complements` (coordination)  
→ **NO:** Consider if relationship should be typed at all

---

## Anti-Patterns to Avoid

### ❌ Don't overload relationship types
**Bad:** Using `requires` for both structural dependency and temporal sequence  
**Good:** Use `requires` for dependency, `precedes` for sequence

### ❌ Don't create relationships that duplicate untyped adjacency
**Bad:** Adding typed `related_to` edges  
**Good:** Leave generic associations in `relatedConcepts`, only type when semantics matter

### ❌ Don't make up new types without justification
**Bad:** Adding `influences` because it sounds nice  
**Good:** Check if existing types (enables, pressures, thins) already cover the semantic

### ❌ Don't ignore directionality
**Bad:** Adding bidirectional edges for `thins` or `requires`  
**Good:** Directional relationships should be one-way (A thins B ≠ B thins A)

### ❌ Don't use contrasts for fundamental tensions
**Bad:** `certainty` contrasts `uncertainty` (they're in opposition, not disambiguation)  
**Good:** Use `structural_tension` for fundamental trade-offs

---

## Vocabulary Evolution

### Adding New Relationship Types

Before adding a new type, validate:

1. **Is it semantically distinct** from existing types?
2. **Does it have 3+ clear uses** (or is it from `structural-pressures.yml`)?
3. **Is the direction clear** (source → target)?
4. **Would it improve graph semantics** better than existing types?

### Consolidation Candidates

Monitor low-use types for possible consolidation:
- `weakens` (1 use) - could consolidate to `thins`
- `constrains` (1 use) - could consolidate to `thins` or `pressures`

### Future Candidates (Not Yet Added)

These types have been discussed but not yet added:

| Type | Meaning | Note |
|------|---------|------|
| `erodes` | Gradual degradation over time | Symmetric to `preserves` |
| `depends_on` | Structural dependency | Synonym of `requires` |
| `obscures` | Hides or makes invisible | Close to `thins` but visibility-focused |
| `reveals` | Makes visible | Opposite of `obscures` |
| `produces` | Generates or creates | Close to `enables` |

**Guideline:** Only add if clear semantic gap exists and 3+ uses are identified.

---

## Examples from the Graph

### Scale Dynamics (thins)
```yaml
- source: scale
  target: feedback
  relationship: thins
  description: Scale weakens feedback loops as distance separates action from consequence.
```

### Dependencies (requires)
```yaml
- source: accountability
  target: coupling
  relationship: requires
  description: Accountability cannot exist without coupling—without attachment between action and consequence.
```

### Disambiguation (contrasts)
```yaml
- source: responsibility
  target: accountability
  relationship: contrasts
  description: Responsibility names the enduring obligation; accountability names exposure to consequence.
```

### Protection (preserves)
```yaml
- source: friction
  target: judgment
  relationship: preserves
  description: Friction preserves space for deliberation by slowing automatic action.
```

### Capacity (enables)
```yaml
- source: feedback
  target: correction
  relationship: enables
  description: Feedback enables correction by returning consequence as updateable signal.
```

---

## Cross-Reference: Relationship Types by Category

### Weakening (4 types)
- `thins` (6 uses) - spreading/distance effect
- `weakens` (1 use) - direct force reduction
- `constrains` (1 use) - limits capacity
- `erodes` (not yet added) - gradual degradation

### Supporting (9 types)
- `preserves` (13 uses) - maintains capacity
- `stabilizes` (2 uses) - reduces variance
- `renews` (2 uses) - restores capacity
- `enables` (5 uses) - creates capacity
- `requires` (8 uses) - structural dependency
- `complements` (1 use) - coordination
- `grounds` (2 uses) - provides foundational condition
- `shapes` (2 uses) - influences form or structure
- `calibrates` (1 use) - adjusts and tunes

### Transforming (4 types)
- `distorts` (1 use) - warps form
- `hardens` (1 use) - rigidifies
- `intensifies` (1 use) - amplifies
- `reproduces` (2 uses) - propagates

### Temporal (1 type)
- `precedes` (2 uses) - temporal sequence

### Force (1 type)
- `pressures` (1 use) - creates urgency

### Disambiguation (1 type)
- `contrasts` (40 uses) - distinguishes

### Tensions (1 special type)
- `structural_tension` (10 uses) - fundamental opposition

---

## Maintenance

This document should be updated when:
- New relationship types are added
- Relationship types are consolidated
- Usage patterns change significantly (e.g., `constrains` gets 5+ uses)
- Semantic distinctions need clarification

**Last updated:** 2026-07-06  
**Next review:** When vocabulary reaches 20 types or consolidation is considered
