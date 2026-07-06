---
name: semantic-relationships
description: >-
  Audits and adds typed relationships to semantic/relationships.yml—identifies
  missing relationships from concept definitions, validates relationship types,
  and ensures graph semantics are precise. Use for relationship audit, adding
  typed edges, or when concepts need semantic connections beyond untyped adjacency.
---

# Semantic relationships

Audit and add **typed directed relationships** to `semantic/relationships.yml` so the concept graph communicates **how** concepts interact, not just **that** they are connected.

## When to use this skill

- Auditing relationship quality and coverage
- Adding new typed relationships from concept definitions
- After adding new concepts via **glossary-extract**
- When "differs from" statements in definitions lack `contrasts` edges
- When force dynamics (thins, preserves, enables) are described but not encoded

## 1 — Understand the relationship model

Read the comprehensive guide:

**[`docs/semantic-relationship-types.md`](../../../docs/semantic-relationship-types.md)** — Complete semantics for all 16 relationship types with examples, distinctions, and decision tree.

Current vocabulary (16 types):

| Category | Types |
|----------|-------|
| Weakening | `thins`, `weakens`, `constrains` |
| Supporting | `preserves`, `stabilizes`, `renews`, `enables`, `requires`, `complements` |
| Transforming | `distorts`, `hardens`, `intensifies`, `reproduces` |
| Temporal | `precedes` |
| Force | `pressures` |
| Disambiguation | `contrasts` |

Plus `structural_tension` (bidirectional oppositions in `semantic/ontology/structural-tensions.yml`).

## 2 — Audit mode: Identify missing relationships

### A. From concept definitions

For each concept in scope, extract relationship semantics from prose:

```bash
# Read concept definition
cat semantic/glossary/<slug>.yml
```

Look for explicit relationship language:

| Pattern in definition | Likely relationship type |
|----------------------|--------------------------|
| "X thins Y" / "X weakens Y" / "distance opens between" | `thins` |
| "X requires Y" / "depends on Y" / "cannot exist without" | `requires` |
| "X enables Y" / "makes Y possible" / "provides capacity for" | `enables` |
| "X preserves Y" / "maintains Y" / "protects Y from" | `preserves` |
| "differs from Y because" / "It differs from Y" | `contrasts` |
| "X precedes Y" / "X can settle into Y" | `precedes` |
| "X distorts Y" / "warps Y" / "changes form" | `distorts` |
| "X stabilizes Y" / "reduces variance in Y" | `stabilizes` |

### B. From structural-pressures.yml

Force dynamics in `semantic/ontology/structural-pressures.yml` should have corresponding relationships:

```bash
cat semantic/ontology/structural-pressures.yml
```

For each entry with `effect`, consider adding typed relationship if not already present.

### C. Check current coverage

```bash
# Count relationships per concept
python3 << 'EOF'
import json
with open('build/semantic-manifest.json') as f:
    m = json.load(f)
    
core_concepts = ['authority', 'legitimacy', 'scale', 'judgment', 'coupling', ...]  # from core-terms.yml

for concept in core_concepts:
    concept_id = f'concept-{concept}'
    rels = [r for r in m['relationships'] 
            if r['source'] == concept_id or r['target'] == concept_id]
    typed = [r for r in rels if r['relationship'] != 'structural_tension']
    print(f"{concept:20} {len(typed)} typed, {len(rels)} total")
EOF
```

**Under-connected concepts** (< 2 typed relationships) are candidates for new edges.

## 3 — Add typed relationships

Edit `semantic/relationships.yml` directly:

```yaml
relationships:
  # ... existing relationships ...
  
  # New relationship
  - source: <source-slug>
    target: <target-slug>
    relationship: <type>
    description: <one-sentence description>
```

### Quality bar

✅ **Do:**
- Extract semantics from concept definitions (the prose already describes the relationship)
- Use existing relationship types unless new type is clearly distinct
- Write one clear sentence for `description` that explains **why** this relationship exists
- Ensure directionality is correct (A → B vs B → A)
- Group related additions with comments (e.g., `# Scale dynamics`, `# Disambiguation`)

❌ **Don't:**
- Add relationships that duplicate untyped `relatedConcepts` without semantic precision
- Invent new relationship types without validating 3+ uses
- Write `description` that just repeats the relationship type ("A requires B because A requires B")
- Make bidirectional edges for asymmetric relationships

### Relationship type decision tree

1. **Is this disambiguation?** → `contrasts` (if "differs from" in definition)
2. **Is source weakening target?** → `thins` (scale effect) or `weakens` (force)
3. **Is source protecting target?** → `preserves`, `stabilizes`, or `renews`
4. **Is source enabling target?** → `enables` or `requires` (reverse direction)
5. **Is source preceding target?** → `precedes`
6. **Is source transforming target?** → `distorts`, `hardens`, `intensifies`

See full decision tree in [`docs/semantic-relationship-types.md`](../../../docs/semantic-relationship-types.md).

## 4 — Verify

```bash
make verify-semantic-ontology
```

Fix all failures before committing.

Check relationship count increase:

```bash
python3 -c "import json; m=json.load(open('build/semantic-manifest.json')); print(f'Total: {len(m[\"relationships\"])} relationships')"
```

## 5 — Open PR

```bash
git checkout main && git pull
git checkout -b semantic-relationships/<scope>
git add semantic/relationships.yml
git commit -m "feat(semantic): add typed relationships for <scope>"
git push -u origin HEAD
gh pr create --base main --title "feat(semantic): typed relationships — <scope>" --body "$(cat <<'EOF'
## Summary
Added typed relationships to encode concept interactions with semantic precision.

## Changes
- Added X new typed relationships (before: Y, after: Z)
- Relationship types used: <list types>

## Validation
- [x] `make verify-semantic-ontology`
- [x] Relationships extracted from concept definitions
- [x] Used existing relationship types where applicable

## Coverage
<list concepts with improved connectivity>

Relates to #116
EOF
)"
```

Return PR URL.

## Example workflows

### Workflow 1: After glossary-extract

When new concepts are added:

1. Read their `shortDefinition` and `longDefinition`
2. Look for "differs from" → add `contrasts` relationships
3. Look for force dynamics → add `thins`, `enables`, `preserves`
4. Check if they reference concepts that should have reciprocal relationships

### Workflow 2: Systematic core concept review

For the 18 core concepts in `semantic/ontology/core-terms.yml`:

1. Check current typed relationship count
2. Read definition for explicit relationship language
3. Add missing relationships that definitions describe
4. Verify each core concept has ≥2 typed relationships

### Workflow 3: Force dynamics from pressures file

For each entry in `semantic/ontology/structural-pressures.yml`:

1. Check if corresponding typed relationship exists in `relationships.yml`
2. If not, add with appropriate verb (`thins`, `distorts`, `weakens`, etc.)
3. Use `description` to expand on the `effect` field

## Relationship vocabulary evolution

### Adding new types

Before adding a new relationship type, validate:

1. **Semantic distinction**: Is it meaningfully different from existing types?
2. **Usage threshold**: Does it have 3+ clear uses (or is it from `structural-pressures.yml`)?
3. **Clear directionality**: Is source → target unambiguous?

**Current candidates** (not yet added, monitor for uses):
- `erodes` (gradual degradation) - symmetric to `preserves`
- `reveals` / `obscures` (visibility) - if visibility patterns emerge

### Consolidation candidates

Low-use types that may consolidate:
- `weakens` (1 use) → potentially consolidate to `thins`
- `constrains` (1 use) → monitor for additional uses

## Integration with other skills

| After... | Add relationships for... |
|----------|--------------------------|
| **glossary-extract** | New concepts with "differs from" statements |
| **semantic-enrichment** (`definitions`) | Revised concepts with new relationship language |
| Core concept changes | Dependencies, force dynamics, disambiguation |

## Do not

- Add relationships without reading concept definitions first
- Invent relationship types without consulting the guide
- Duplicate untyped `relatedConcepts` without semantic value
- Skip verification before opening PR
- Add relationships for concepts that don't exist

## Reference

- [`docs/semantic-relationship-types.md`](../../../docs/semantic-relationship-types.md) — Complete relationship semantics guide
- [`semantic/relationships.yml`](../../../semantic/relationships.yml) — Current typed relationships
- [`semantic/ontology/structural-tensions.yml`](../../../semantic/ontology/structural-tensions.yml) — Bidirectional tensions
- [`semantic/ontology/structural-pressures.yml`](../../../semantic/ontology/structural-pressures.yml) — Force dynamics
- [`concept-graph-relationship-audit.md`](../../../concept-graph-relationship-audit.md) — Original comprehensive audit
