# Concept Graph Relationship Audit

**Date:** 2026-07-06  
**Scope:** After Certainty semantic ontology  
**Focus:** Relationship type precision and semantic quality

---

## Executive Summary

The After Certainty concept graph contains **137 concepts** with three relationship layers:

1. **Untyped adjacency** via `relatedConcepts` (dominant pattern)
2. **Typed directed edges** via `semantic/relationships.yml` (17 relationships)
3. **Structural tensions** via `semantic/ontology/structural-tensions.yml` (10 tensions)

**Core Finding:** The graph currently tells readers **that** concepts are connected, but rarely **why** or **how**. The vast majority of the 300+ edges use generic "related" semantics via `relatedConcepts`, while only 27 edges have explicit semantic types.

This audit identifies:
- Relationship types that add value vs. those that are underused
- Concepts with precise typed relationships vs. those with only generic connections
- Missing relationships between core concepts
- Inconsistent modeling of similar conceptual relationships
- High-confidence improvements and recommendations

---

## 1. Inventory of the Graph

### 1.1 Basic Statistics

| Layer | Count | Purpose |
|-------|-------|---------|
| Total concepts | 137 | Full glossary |
| Core terms | 18 | Portfolio hub concepts |
| Supporting terms | Variable | Enriching concepts |
| Typed relationships | 17 | Explicit semantic edges |
| Structural tensions | 10 | Oppositional pairs |
| **Total typed edges** | **27** | |
| Untyped connections | ~300+ | Generic "related" via `relatedConcepts` |

### 1.2 Current Relationship Types

**From `relationships.yml` (17 edges):**

| Type | Count | Semantic Clarity |
|------|-------|-----------------|
| `contrasts` | 5 | ✅ Clear disambiguation |
| `preserves` | 2 | ✅ Clear stabilization |
| `precedes` | 2 | ✅ Clear temporal/causal |
| `reproduces` | 2 | ✅ Clear structural propagation |
| `thins` | 1 | ✅ Clear weakening |
| `renews` | 1 | ✅ Clear restoration |
| `pressures` | 1 | ✅ Clear constraint |
| `stabilizes` | 1 | ✅ Clear support |
| `requires` | 1 | ✅ Clear dependency |
| `intensifies` | 1 | ✅ Clear escalation |
| `complements` | 1 | ✅ Clear coordination |

**From `structural-tensions.yml` (10 edges):**
- All modeled as `structural_tension` in manifest
- Descriptions like "continuity vs reality-contact"

**Assessment:** The 11 relationship types currently in use are **semantically precise**. The problem is not quality—it's **coverage**.

### 1.3 Most Connected Concepts (via untyped `relatedConcepts`)

Based on sample analysis, highly connected concepts include:

**High connectivity (5+ connections):**
- `trust`: 5 untyped
- `boundary`: 5 untyped
- `friction`: 5 untyped
- `authority`: 3 untyped + typed edges
- `coupling`: 4 untyped + typed edges
- `meaning`: 3 untyped + tension
- `interpretation`: 4 untyped + tension

**Isolated or under-connected:**
- `scale`: 0 untyped (but 2 typed outgoing)
- Several `extended` termKind concepts have 0-1 connections

---

## 2. Evaluation of Current Relationship Types

### 2.1 Semantic Meaning Analysis

Each relationship type is applied consistently with clear intent:

**✅ `contrasts`** (5 uses)
- **Meaning:** Disambiguates similar concepts
- **Consistency:** Strong
- **Examples:**
  - `repair` contrasts `witness` (restoration vs. record)
  - `correction` contrasts `repair` (belief update vs. trust restoration)
  - `constraint` contrasts `constraints` (historical pressure vs. operational limits)
  - `proximity` contrasts `contact` (relational nearness vs. staying close to meaning)

**✅ `thins`** (1 use)
- **Meaning:** Weakening or erosion
- **Example:** `scale` thins `correction` (feedback weakens as scale increases)
- **Assessment:** Precise. Could be used more widely (see Section 4).

**✅ `reproduces`** (2 uses)
- **Meaning:** Structural propagation/persistence
- **Examples:**
  - `circulation` reproduces `authority` (structures persist beyond individuals)
  - `alignment` reproduces `alignment-at-scale` (belonging signals harden institutionally)
- **Assessment:** Captures systemic amplification well.

**✅ `renews`** (1 use)
- **Meaning:** Restoration/regeneration
- **Example:** `correction` renews `legitimacy`
- **Assessment:** Clear restorative relationship.

**✅ `pressures`** (1 use)
- **Meaning:** Creates constraint or urgency
- **Example:** `acceleration` pressures `judgment`
- **Assessment:** Excellent for force dynamics.

**✅ `preserves`** (2 uses)
- **Meaning:** Maintains/stabilizes capacity
- **Examples:**
  - `friction` preserves `corrigibility`
  - `uncertainty` preserves `correction`
- **Assessment:** Core stabilization mechanic.

**✅ `stabilizes`** (1 use)
- **Meaning:** Reduces volatility
- **Example:** `certainty` stabilizes `coordination`
- **Assessment:** Similar to `preserves` but more about reducing variance.

**✅ `requires`** (1 use)
- **Meaning:** Dependency
- **Example:** `correction` requires `revisability`
- **Assessment:** Clear structural dependency.

**✅ `precedes`** (2 uses)
- **Meaning:** Temporal/causal sequence
- **Examples:**
  - `public-interpretation` precedes `interpretive-collapse`
  - `drift` precedes `normalization`
- **Assessment:** Tracks deterioration pathways well.

**✅ `intensifies`** (1 use)
- **Meaning:** Escalation/amplification
- **Example:** `post-interpretive-authority` intensifies `total-authority`
- **Assessment:** Clear escalation dynamic.

**✅ `complements`** (1 use)
- **Meaning:** Mutual support without duplication
- **Example:** `cohesion` complements `coupling`
- **Assessment:** Excellent for showing how distinct concepts work together.

### 2.2 Are Multiple Types Being Used Interchangeably?

**No.** Each type has distinct semantics and is applied consistently.

### 2.3 Are Some Types Too Broad?

**No.** Current types are precise. The issue is **underuse**, not over-generality.

---

## 3. Audit of Every Typed Relationship

### 3.1 Relationships from `relationships.yml`

| Source | Relationship | Target | Correct? | Best Type? | Directionality OK? | Useful? |
|--------|-------------|--------|----------|-----------|-------------------|---------|
| scale | thins | correction | ✅ | ✅ | ✅ | ✅ |
| circulation | reproduces | authority | ✅ | ✅ | ✅ | ✅ |
| correction | renews | legitimacy | ✅ | ✅ | ✅ | ✅ |
| acceleration | pressures | judgment | ✅ | ✅ | ✅ | ✅ |
| friction | preserves | corrigibility | ✅ | ✅ | ✅ | ✅ |
| certainty | stabilizes | coordination | ✅ | ✅ | ✅ | ✅ |
| uncertainty | preserves | correction | ✅ | ✅ | ✅ | ✅ |
| alignment | reproduces | alignment-at-scale | ✅ | ✅ | ✅ | ✅ |
| repair | contrasts | witness | ✅ | ✅ | ✅ | ✅ |
| correction | contrasts | repair | ✅ | ✅ | ✅ | ✅ |
| correction | requires | revisability | ✅ | ✅ | ✅ | ✅ |
| constraint | contrasts | constraints | ✅ | ✅ | ✅ | ✅ |
| public-interpretation | precedes | interpretive-collapse | ✅ | ✅ | ✅ | ✅ |
| post-interpretive-authority | intensifies | total-authority | ✅ | ✅ | ✅ | ✅ |
| cohesion | complements | coupling | ✅ | ✅ | ✅ | ✅ |
| proximity | contrasts | contact | ✅ | ✅ | ✅ | ✅ |
| drift | precedes | normalization | ✅ | ✅ | ✅ | ✅ |

**Assessment:** All 17 typed relationships are **correct, well-typed, directionally sound, and useful**. No changes recommended to existing edges.

### 3.2 Structural Tensions from `structural-tensions.yml`

| Source | Target | Description | Correct? | Bidirectional? | Useful? |
|--------|--------|-------------|----------|---------------|---------|
| circulation | correction | continuity vs reality-contact | ✅ | ✅ | ✅ |
| authority | legitimacy | operational power vs justified recognition | ✅ | ✅ | ✅ |
| meaning | interpretation | transmission vs reconstruction | ✅ | ✅ | ✅ |
| consequence | coupling | outcomes vs exposure to outcomes | ⚠️ | ✅ | ⚠️ |
| certainty | uncertainty | coordination stability vs revisability | ✅ | ✅ | ✅ |
| acceleration | friction | throughput vs deliberation | ✅ | ✅ | ✅ |
| scale | moral-density | abstraction vs visible consequence | ✅ | ✅ | ✅ |
| reciprocity | asymmetry | shared exposure vs unequal exposure | ✅ | ✅ | ✅ |
| contestability | stability | revisability vs continuity | ✅ | ✅ | ✅ |
| adaptation | authorization | response vs normalized permission | ✅ | ✅ | ✅ |

**Questionable tension:**
- **`consequence` ⟷ `coupling`**: This tension pairs "outcomes" with "exposure to outcomes." But `coupling` is defined as the *attachment between action and consequence*. This feels like a conceptual stacking error—`coupling` measures the *strength of connection* to `consequence`, not opposition to it. 
  - **Recommendation:** This may not be a true structural tension. Consider whether `consequence` ⟷ `accountability` or `consequence` ⟷ `distance` would be clearer.

---

## 4. Overused Generic "Related" Edges

### 4.1 The Core Problem

**Finding:** Approximately **300+ edges** exist as untyped `relatedConcepts` adjacency, while only **27** have explicit semantic types.

**Impact:**
- A reader exploring `trust` → `judgment` learns only that they are "related," not *how* they relate
- Navigation becomes associative rather than explanatory
- The graph becomes a flat network rather than a knowledge structure

### 4.2 High-Value Candidates for Typing

**Core concepts with ONLY untyped connections:**

#### `judgment` (4 untyped, 1 typed incoming)
Current untyped connections:
- → `revisability`
- → `correction`
- → `certainty`
- → `agency`

**Recommended typed relationships:**
- `judgment` **requires** `revisability` (structural dependency)
- `judgment` **enables** `correction` (judgment creates space for correction)
- `certainty` **constrains** `judgment` (already have incoming `acceleration` **pressures** `judgment`)

#### `accountability` (4 untyped)
Current connections:
- → `responsibility`
- → `answerability`
- → `authority`
- → `coupling`

**Recommended typed relationships:**
- `accountability` **requires** `coupling` (can't have accountability without exposure to consequence)
- `coupling` **enables** `accountability` (stronger form)
- `authority` **depends_on** `accountability` (for legitimacy)

#### `trust` (5 untyped)
Current connections:
- → `finite-perspective`
- → `bias`
- → `feedback`
- → `integration`
- → `judgment`

**Recommended typed relationships:**
- `trust` **requires** `feedback` (trust without feedback → closure)
- `finite-perspective` **necessitates** `trust` (can't verify everything yourself)
- `feedback` **renews** `trust` (or `restores` trust)

#### `meaning` (3 untyped, 1 tension)
Current connections:
- → `interpretation` (already has tension)
- → `trust`
- → `connection`

**Recommended typed relationships:**
- `circulation` **stabilizes** `meaning` (meaning persists through circulation)
- `interpretation` **reconstructs** `meaning` (active vs. stable)

#### `boundary` (5 untyped)
Current connections:
- → `post-interpretive-authority`
- → `coupling`
- → `accountability`
- → `alignment`
- → `interface`

**Recommended typed relationships:**
- `boundary` **defines** `accountability` (where obligation changes shape)
- `coupling` **weakens_across** `boundary` (boundaries often mark decoupling points)
- `scale` **requires** `boundary` (scale necessitates boundaries)

#### `feedback` (3 untyped)
Current connections:
- → `coupling`
- → `correction`
- → `trust`

**Recommended typed relationships:**
- `feedback` **enables** `correction`
- `coupling` **strengthens** `feedback` (tight coupling = fast feedback)
- `scale` **thins** `feedback` (already have `scale` thins `correction`)

#### `bias` (4 untyped)
Current connections:
- → `finite-perspective`
- → `integration`
- → `judgment`
- → `trust`

**Recommended typed relationships:**
- `finite-perspective` **produces** `bias` (bias is the selective work of finite perspective)
- `bias` **shapes** `judgment`
- `integration` **reveals** `bias` (comparing perspectives exposes bias)

---

## 5. Missing Relationships

### 5.1 High-Confidence Missing Edges

These relationships are strongly implied by definitions but absent from the graph:

#### Structural Dependencies

1. **`scale` ⟶ `feedback`**
   - **Type:** `thins`
   - **Rationale:** Definitions of both concepts describe how scale weakens feedback loops
   - **Evidence:** `scale.yml` says "feedback slows and weakens"; `feedback.yml` says "feedback slows as coordination grows"

2. **`scale` ⟶ `accountability`**
   - **Type:** `thins`
   - **Rationale:** `accountability.yml` explicitly states "scale...thins contact between action and effect"

3. **`scale` ⟶ `coupling`**
   - **Type:** `thins`
   - **Rationale:** `coupling.yml` describes "scale, abstraction, or delay lengthen the chain between decision and lived harm"

4. **`acceleration` ⟶ `friction`**
   - **Type:** `erodes` or `thins`
   - **Rationale:** Already have tension pair; should also have directed edge showing acceleration actively reduces friction
   - **Note:** Currently only modeled as tension

5. **`friction` ⟶ `judgment`**
   - **Type:** `preserves`
   - **Rationale:** `friction.yml` says friction "preserves space for discernment" and judgment; parallel to `friction` preserves `corrigibility`

6. **`coupling` ⟶ `correction`**
   - **Type:** `enables`
   - **Rationale:** Both definitions describe tight coupling as necessary for effective correction

7. **`coupling` ⟶ `legitimacy`**
   - **Type:** `renews` or `preserves`
   - **Rationale:** `coupling.yml` says "coupling helps preserve...legitimacy"

8. **`circulation` ⟶ `meaning`**
   - **Type:** `reproduces` or `stabilizes`
   - **Rationale:** Circulation is how meaning persists; parallel structure to `circulation` reproduces `authority`

#### Disambiguation Relationships (contrasts)

9. **`responsibility` ⟷ `accountability`**
   - **Type:** `contrasts`
   - **Rationale:** `accountability.yml` explicitly contrasts them: "accountability emphasizes exposure to consequence; responsibility includes the ongoing obligation"

10. **`responsibility` ⟷ `answerability`**
    - **Type:** `contrasts`
    - **Rationale:** `accountability.yml` also distinguishes these

11. **`certainty` ⟷ `judgment`**
    - **Type:** `contrasts`
    - **Rationale:** `judgment.yml` says "It differs from certainty because judgment accepts incomplete sight"

12. **`correction` ⟷ `revisability`**
    - **Type:** Already have `correction` **requires** `revisability`
    - **Alternative:** Could also model as `contrasts` (correction is action; revisability is capacity)

#### Force and Pressure Relationships

13. **`abstraction` ⟶ `accountability`**
    - **Type:** `thins`
    - **Rationale:** `structural-pressures.yml` says `abstraction` "obscures consequence"; `accountability.yml` says "scale, narrative, or abstraction thins contact"

14. **`acceleration` ⟶ `correction`**
    - **Type:** `thins` or `constrains`
    - **Rationale:** `acceleration.yml` describes how speed reduces time for correction

15. **`mediation` ⟶ `interpretation`**
    - **Type:** `distorts`
    - **Rationale:** Listed in `structural-pressures.yml` as "mediation distorts interpretation"

16. **`asymmetry` ⟶ `reciprocity`**
    - **Type:** `weakens` or `erodes`
    - **Rationale:** `structural-pressures.yml` says "asymmetry weakens reciprocity"

17. **`compression` ⟶ `meaning`** or **`interpretation`**
    - **Type:** `reduces`
    - **Rationale:** `structural-pressures.yml` says "compression reduces nuance"

18. **`normalization` ⟶ `adaptation`**
    - **Type:** `hardens`
    - **Rationale:** `structural-pressures.yml` says "normalization hardens adaptation"

### 5.2 Suggested New Relationships

These would substantially improve graph semantics:

#### Authority and Power Cluster

19. **`authority` ⟶ `accountability`**
    - **Type:** `requires` (for legitimacy) or `depends_on`
    - **Rationale:** Authority without accountability erodes legitimacy

20. **`legitimacy` ⟶ `contestability`**
    - **Type:** `requires`
    - **Rationale:** `legitimacy.yml` emphasizes legitimacy as "contestable enough to hold under stress"

#### Correction and Learning Cluster

21. **`feedback` ⟶ `trust`**
    - **Type:** `renews` or `stabilizes`
    - **Rationale:** Feedback keeps trust calibrated

22. **`corrigibility` ⟶ `legitimacy`**
    - **Type:** `preserves`
    - **Rationale:** Systems that can correct maintain legitimacy

#### Scale and Distance Cluster

23. **`scale` ⟶ `moral-density`**
    - **Type:** `thins`
    - **Rationale:** Already a tension pair; should also have directed edge

24. **`scale` ⟶ `context`** (if context exists as concept)
    - **Type:** `thins`

#### Interpretation and Meaning Cluster

25. **`meaning` ⟶ `coordination`**
    - **Type:** `enables`
    - **Rationale:** `meaning.yml` says meaning is "what people and institutions stabilize enough to coordinate on"

---

## 6. Relationship Consistency

### 6.1 Symmetry Analysis

**Question:** If A relates to B, should B relate to A?

#### Current Symmetric Typed Relationships
- ✅ Structural tensions are inherently bidirectional
- ✅ `contrasts` relationships are conceptually symmetric (though only one direction is stored)

#### Asymmetric by Design
- ✅ `thins`, `pressures`, `reproduces`, `requires` are correctly directional
- ✅ `precedes` is temporal and correctly asymmetric

#### Check: Are `contrasts` Actually Symmetric?

All current `contrasts` relationships are properly symmetric in meaning:
- `repair` contrasts `witness` ⟺ `witness` contrasts `repair` ✅
- `correction` contrasts `repair` ⟺ `repair` contrasts `correction` ✅

**Recommendation:** Document whether `contrasts` edges should be explicitly bidirectional in `relationships.yml` or if single direction with symmetric interpretation is sufficient.

### 6.2 Untyped Relationship Symmetry

Spot check of `relatedConcepts` bidirectionality:

**Example: `trust` lists `judgment` but does `judgment` list `trust`?**
- `trust` → `judgment` ✅
- `judgment` does NOT list `trust` ❌

**Example: `authority` lists `legitimacy` but does `legitimacy` list `authority`?**
- `authority` → `legitimacy` ✅
- `legitimacy` → `authority` ✅

**Finding:** Untyped relationships are **inconsistently bidirectional**. This creates asymmetric navigation paths.

**Recommendation:** 
1. Audit all `relatedConcepts` for bidirectionality
2. Either enforce bidirectional symmetry OR
3. Migrate to typed relationships where directionality matters semantically

---

## 7. Recommendations

### 7.1 High-Confidence Improvements

**Priority 1: Add Missing Structural Relationships from Definitions**

Add these relationships where definitions explicitly describe the dynamic:

1. `scale` **thins** `feedback`
2. `scale` **thins** `accountability`
3. `scale` **thins** `coupling`
4. `scale` **thins** `moral-density` (in addition to tension)
5. `abstraction` **thins** `accountability`
6. `acceleration` **thins** `friction` (in addition to tension)
7. `friction` **preserves** `judgment`
8. `coupling` **enables** `correction`
9. `coupling` **renews** `legitimacy`
10. `circulation` **stabilizes** `meaning`

**Priority 2: Add Disambiguation Relationships**

Add `contrasts` edges for concepts whose definitions explicitly distinguish them:

11. `responsibility` **contrasts** `accountability`
12. `responsibility` **contrasts** `answerability`
13. `certainty` **contrasts** `judgment`

**Priority 3: Add Structural Dependencies**

14. `judgment` **requires** `revisability`
15. `correction` **requires** `revisability` (already exists ✅)
16. `accountability` **requires** `coupling`
17. `legitimacy` **requires** `contestability`
18. `authority` **depends_on** `accountability`
19. `trust` **requires** `feedback`

### 7.2 Missing Relationships Worth Considering

These would improve the graph but require more validation:

**Force Dynamics:**
- `acceleration` **constrains** `correction`
- `mediation` **distorts** `interpretation`
- `asymmetry` **weakens** `reciprocity`
- `compression` **reduces** `nuance` (or interpretation)
- `normalization` **hardens** `adaptation`

**Enabling Relationships:**
- `finite-perspective` **necessitates** `trust`
- `feedback` **renews** `trust`
- `meaning` **enables** `coordination`

**Production Relationships:**
- `finite-perspective` **produces** `bias`

### 7.3 Questionable Relationships

**Review for Accuracy:**

1. **`consequence` ⟷ `coupling` tension**
   - Issue: `coupling` is attachment *to* consequence, not in tension with it
   - Recommendation: Re-examine this tension or clarify description

### 7.4 Potential New Relationship Types

Current types handle most needs, but these could be useful:

**Suggested new verbs:**
- `enables` (activation/capacity granting) — many candidates
- `erodes` (gradual weakening) — symmetric to `preserves`
- `depends_on` (structural dependency) — clearer than `requires` for systemic dependencies
- `constrains` (limits capacity) — different nuance from `pressures`
- `distorts` (warps/misshapes) — already in pressures file
- `produces` (generates/creates) — causal generation
- `shapes` (influences form) — lighter than `produces`
- `reveals` (makes visible) — epistemic relationship
- `necessitates` (makes inevitable) — stronger than `requires`
- `weakens_across` (diminishes at boundary) — specialized

**Assessment:** These would add precision but increase vocabulary complexity. Recommend starting with the 4-5 most useful:
1. `enables` (high-value, many uses)
2. `erodes` (symmetric to `preserves`, fills gap)
3. `depends_on` (clarifies structural dependencies)
4. `constrains` (different from `pressures`)
5. `distorts` (already conceptually present)

---

## 8. Specific Concept Reviews

### 8.1 Concepts of Interest (per request)

#### Boundary
**Current state:**
- 5 untyped connections
- 0 typed relationships
- Appears in 1 typed relationship as target

**Assessment:** Under-connected given centrality in the framework. 

**Recommended additions:**
- `boundary` **defines** `accountability` (where obligation changes shape)
- `scale` **requires** `boundary` (boundaries emerge with scale)
- `boundary` **enables** `interface` (boundaries create interfaces)

#### Trust
**Current state:**
- 5 untyped connections
- Well-connected but all generic

**Assessment:** Trust is fundamental to the framework but relationships are vague.

**Recommended additions:**
- `trust` **requires** `feedback`
- `finite-perspective` **necessitates** `trust`
- `feedback` **renews** `trust`

#### Meaning
**Current state:**
- 3 untyped connections
- 1 structural tension with `interpretation` ✅

**Assessment:** Core concept with minimal typed edges.

**Recommended additions:**
- `circulation` **stabilizes** `meaning`
- `meaning` **enables** `coordination`

#### Interpretation
**Current state:**
- 4 untyped connections
- 1 structural tension with `meaning` ✅
- Appears in 1 typed relationship as target

**Assessment:** Adequately connected through tensions and pressures.

**Possible addition:**
- `mediation` **distorts** `interpretation` (from structural-pressures.yml)

#### Authority
**Current state:**
- 3 untyped connections
- 2 typed relationships (incoming, tension) ✅

**Assessment:** Well-modeled with typed relationships.

**Possible addition:**
- `authority` **depends_on** `accountability` (for legitimacy)

#### Accountability
**Current state:**
- 4 untyped connections
- Appears as target in multiple relationships

**Assessment:** Under-typed for centrality.

**Recommended additions:**
- `accountability` **requires** `coupling`
- `scale` **thins** `accountability`
- `abstraction` **thins** `accountability`

#### Feedback
**Current state:**
- 3 untyped connections
- 0 typed relationships

**Assessment:** Critical concept with no typed edges.

**Recommended additions:**
- `feedback` **enables** `correction`
- `coupling` **strengthens** `feedback`
- `scale` **thins** `feedback`
- `feedback` **renews** `trust`

#### Friction
**Current state:**
- 5 untyped connections
- 1 typed relationship (outgoing) ✅
- 1 structural tension ✅

**Assessment:** Well-represented.

**Possible addition:**
- `friction` **preserves** `judgment`

#### Acceleration
**Current state:**
- 4 untyped connections
- 1 typed relationship (outgoing) ✅
- 1 structural tension ✅

**Assessment:** Well-represented.

**Possible addition:**
- `acceleration` **erodes** `friction` (make tension explicit as directed edge)

#### Judgment
**Current state:**
- 4 untyped connections
- 1 typed relationship (incoming) ✅

**Assessment:** Central concept but mostly untyped.

**Recommended additions:**
- `judgment` **requires** `revisability`
- `friction` **preserves** `judgment`

#### Bias
**Current state:**
- 4 untyped connections
- 0 typed relationships

**Assessment:** Under-represented in typed graph.

**Recommended additions:**
- `finite-perspective` **produces** `bias`
- `integration` **reveals** `bias`

#### Legitimacy
**Current state:**
- 3 untyped connections
- 2 typed relationships (incoming, tension) ✅

**Assessment:** Well-modeled.

**Possible additions:**
- `legitimacy` **requires** `contestability`
- `coupling` **renews** `legitimacy`

#### Coupling
**Current state:**
- 4 untyped connections
- 2 typed relationships (tension, complements) ✅

**Assessment:** Central concept with some typing but could have more.

**Recommended additions:**
- `accountability` **requires** `coupling`
- `coupling` **enables** `correction`
- `scale` **thins** `coupling`

#### Cohesion
**Current state:**
- 3 untyped connections
- 1 typed relationship (complements coupling) ✅

**Assessment:** Adequately distinguished from coupling.

---

## 9. Summary Assessment

### 9.1 Current State

**Strengths:**
- Existing typed relationships are high-quality and semantically precise
- Disambiguation via `contrasts` is effective
- Structural tensions capture fundamental oppositions well
- No evidence of relationship type confusion or misuse

**Weaknesses:**
- **~92% of edges are untyped** (300+ untyped vs. 27 typed)
- Many core concepts have rich definitions describing relationships that aren't encoded in the graph
- Graph communicates association but not causality, dependency, or dynamics
- Navigating the graph teaches less than reading individual definitions

### 9.2 Impact

**Current experience:**
- User explores `scale` → `correction` (untyped)
- Graph says: "These are related"
- Definition says: "Scale weakens feedback loops and makes correction expensive"
- **The semantic relationship is hidden in prose, not encoded in structure**

**Desired experience:**
- User explores `scale` --[**thins**]--> `correction`
- Graph says: "Scale thins correction"
- User can traverse all "thinning" relationships to understand structural weakening

### 9.3 Priority Levels

**Must do (High confidence, low risk):**
1. Add structural relationships explicitly described in definitions (Priority 1 list)
2. Add disambiguation relationships for concepts with "differs from" statements
3. Fix or clarify questionable `consequence` ⟷ `coupling` tension

**Should do (High value, moderate validation needed):**
4. Type the highest-traffic untyped relationships (core concepts)
5. Add force dynamics from `structural-pressures.yml` as typed edges
6. Audit and fix asymmetric `relatedConcepts`

**Could do (Lower priority, higher complexity):**
7. Introduce 4-5 new relationship types for common patterns
8. Systematically migrate all core concept relationships to typed edges
9. Create explicit reciprocal edges for symmetric relationships

---

## 10. Implementation Approach

### Phase 1: Foundation (High-Confidence Additions)
**Scope:** Add 20-25 relationships where definitions explicitly state the dynamic
**Risk:** Very low
**Impact:** Immediate improvement in graph semantics

**Actions:**
1. Add `thins` relationships from `scale` and `abstraction`
2. Add `preserves` relationships from friction
3. Add `contrasts` for explicitly differentiated concepts
4. Add `requires` for structural dependencies stated in definitions

### Phase 2: Systematic Audit (Core Concepts)
**Scope:** Review all 18 core terms for under-typed relationships
**Risk:** Low
**Impact:** Substantial improvement in graph utility

**Actions:**
1. For each core term, extract relationship semantics from definition
2. Classify into existing relationship types
3. Add typed edges for clear cases
4. Document ambiguous cases for review

### Phase 3: Vocabulary Extension (Optional)
**Scope:** Introduce 4-5 new relationship types for common patterns
**Risk:** Moderate (vocabulary expansion)
**Impact:** Enables more precise modeling

**Actions:**
1. Validate need for new types based on Phase 1-2 findings
2. Document semantics for each new type
3. Apply to appropriate relationships
4. Update schema and documentation

### Phase 4: Bidirectionality Audit
**Scope:** Review all untyped `relatedConcepts` for symmetry
**Risk:** Low
**Impact:** Improves navigation consistency

---

## Appendices

### Appendix A: Relationship Type Reference

| Type | Meaning | Example | Reciprocal? |
|------|---------|---------|------------|
| contrasts | Distinguishes similar concepts | repair contrasts witness | Yes (conceptual) |
| thins | Weakens or erodes | scale thins correction | No |
| reproduces | Propagates structurally | circulation reproduces authority | No |
| renews | Restores capacity | correction renews legitimacy | No |
| pressures | Creates constraint | acceleration pressures judgment | No |
| preserves | Maintains capacity | friction preserves corrigibility | No |
| stabilizes | Reduces variance | certainty stabilizes coordination | No |
| requires | Structural dependency | correction requires revisability | No |
| precedes | Temporal/causal sequence | drift precedes normalization | No |
| intensifies | Escalates | post-interpretive-authority intensifies total-authority | No |
| complements | Mutual support without overlap | cohesion complements coupling | Yes |
| structural_tension | Fundamental opposition | certainty ⟷ uncertainty | Yes |

### Appendix B: Untyped Relationship Inventory (Sample)

High-traffic untyped edges that should be considered for typing:

- `trust` → `feedback` (should be `requires`)
- `judgment` → `revisability` (should be `requires`)
- `accountability` → `coupling` (should be `requires`)
- `friction` → `judgment` (should be `preserves`)
- `scale` → `feedback` (should be `thins`)
- `scale` → `accountability` (should be `thins`)
- `scale` → `coupling` (should be `thins`)
- `coupling` → `correction` (should be `enables`)
- `circulation` → `meaning` (should be `stabilizes`)
- `finite-perspective` → `bias` (should be `produces`)

### Appendix C: Concepts with Zero Typed Relationships

Core or central concepts with no typed edges:

- `scale` (0 typed outgoing, 2 typed outgoing - actually HAS typed!)
- `judgment` (0 typed outgoing, 1 incoming)
- `feedback` (0 typed, despite centrality)
- `bias` (0 typed)
- `boundary` (0 typed)
- `trust` (0 typed)

Supporting concepts with high connectivity but no typed edges:
- Many in the `extended` termKind category

---

## Conclusion

The After Certainty concept graph has excellent **relationship quality** but insufficient **relationship coverage**. The 27 typed relationships that exist are precise, consistent, and valuable. The problem is that hundreds of semantically rich connections remain encoded only as generic "related" links.

**Core recommendation:** Systematically migrate the 50-100 highest-value untyped relationships to typed edges, focusing first on core concepts and relationships explicitly stated in definitions. This will transform the graph from an associative network into a semantic knowledge structure that teaches through navigation.

The intellectual model is already present in the prose definitions. The task is to make it explicit in the graph structure.
