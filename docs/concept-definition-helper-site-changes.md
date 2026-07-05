# Concept Definition Helper - Site Repository Changes

This document contains the changes needed in the `after-certainty-site` repository to implement the centralized concept definition display helper.

## Status

✅ Content repo (`after-certainty`): Validation added, committed, and pushed to PR #241
⏳ Site repo (`after-certainty-site`): Changes prepared but require manual application

## Changes for after-certainty-site

### 1. Create Helper Function

**File**: `lib/explore/getConceptDisplayDefinition.ts` (new file)

```typescript
import type { GlossaryConcept } from "@/types/semanticGraph";

/**
 * Get the appropriate definition text for displaying a concept in different contexts.
 *
 * This centralizes the field selection logic to prevent drift between
 * concept index cards, observatory cards, search results, and related terrain.
 *
 * @param concept - The concept to get a definition for
 * @param variant - The display context
 * @returns The appropriate definition text
 */
export function getConceptDisplayDefinition(
  concept: GlossaryConcept,
  variant: "index" | "detail" | "card" = "card"
): string {
  switch (variant) {
    case "detail":
      // Detail pages prefer richer longDefinition, with fallback chain
      return (
        concept.longDefinition ?? concept.definition ?? concept.shortDefinition
      );

    case "index":
    case "card":
    default:
      // Index and cards always use the concise, portable shortDefinition
      return concept.shortDefinition;
  }
}
```

### 2. Update Components

#### ConceptCard
**File**: `components/explore/concept-card.tsx`

Add import:
```typescript
import { getConceptDisplayDefinition } from "@/lib/explore/getConceptDisplayDefinition";
```

Replace line 18:
```typescript
// OLD:
<p className="line-clamp-3 text-sm leading-relaxed text-muted">{concept.shortDefinition}</p>

// NEW:
<p className="line-clamp-3 text-sm leading-relaxed text-muted">
  {getConceptDisplayDefinition(concept, "card")}
</p>
```

#### Concept Detail Page
**File**: `app/explore/(browse)/concepts/[slug]/page.tsx`

Add import:
```typescript
import { getConceptDisplayDefinition } from "@/lib/explore/getConceptDisplayDefinition";
```

Replace line 36 in `generateMetadata`:
```typescript
// OLD:
description: concept.longDefinition ?? concept.definition ?? concept.shortDefinition,

// NEW:
description: getConceptDisplayDefinition(concept, "detail"),
```

Replace line 101 in page component:
```typescript
// OLD:
<p className="whitespace-pre-wrap">{concept.longDefinition ?? concept.definition ?? concept.shortDefinition}</p>

// NEW:
<p className="whitespace-pre-wrap">{getConceptDisplayDefinition(concept, "detail")}</p>
```

#### ObservatoryEntityPanel
**File**: `components/explore/observatory/ObservatoryEntityPanel.tsx`

Add import:
```typescript
import { getConceptDisplayDefinition } from "@/lib/explore/getConceptDisplayDefinition";
```

Replace line 78:
```typescript
// OLD:
<p className="mt-4 text-sm leading-relaxed text-muted">{node.entity.shortDefinition}</p>

// NEW:
<p className="mt-4 text-sm leading-relaxed text-muted">
  {getConceptDisplayDefinition(node.entity, "card")}
</p>
```

#### SemanticFlowNode
**File**: `components/explore/observatory/SemanticFlowNode.tsx`

Add import:
```typescript
import { getConceptDisplayDefinition } from "@/lib/explore/getConceptDisplayDefinition";
```

Replace line 80 in `subtitleOf` function:
```typescript
// OLD:
if (n.kind === "concept") return n.entity.shortDefinition;

// NEW:
if (n.kind === "concept") return getConceptDisplayDefinition(n.entity, "card");
```

#### EntityDetailView
**File**: `components/explore/observatory/panel/EntityDetailView.tsx`

Add import:
```typescript
import { getConceptDisplayDefinition } from "@/lib/explore/getConceptDisplayDefinition";
```

Replace line 102:
```typescript
// OLD:
<p className="mt-4 text-sm leading-relaxed text-muted">{node.entity.shortDefinition}</p>

// NEW:
<p className="mt-4 text-sm leading-relaxed text-muted">
  {getConceptDisplayDefinition(node.entity, "card")}
</p>
```

#### GraphNeighborhoodCards
**File**: `components/explore/graph-neighborhood-cards.tsx`

Add import:
```typescript
import { getConceptDisplayDefinition } from "@/lib/explore/getConceptDisplayDefinition";
```

Replace line 28:
```typescript
// OLD:
<p className="mt-2 line-clamp-2 text-sm text-muted">{n.entity.shortDefinition}</p>

// NEW:
<p className="mt-2 line-clamp-2 text-sm text-muted">
  {getConceptDisplayDefinition(n.entity, "card")}
</p>
```

## Application Instructions

### Option A: Apply Git Patch

If you have the committed changes from my local branch:

```bash
cd /path/to/after-certainty-site
git checkout -b cursor/concept-definition-helper-d009
# Apply the patch file (if available)
```

### Option B: Manual Application

1. Create the new helper file `lib/explore/getConceptDisplayDefinition.ts`
2. Update each of the 6 component files listed above
3. Test the build: `npm run build`
4. Run linting: `npm run lint`
5. Commit and push:

```bash
git add -A
git commit -m "Add centralized concept definition display helper"
git push -u origin cursor/concept-definition-helper-d009
```

### Option C: Automated Script

Create and run this script from the site repo root:

```bash
#!/bin/bash
# apply-concept-helper.sh

# Create helper file
mkdir -p lib/explore
cat > lib/explore/getConceptDisplayDefinition.ts << 'EOF'
[... paste helper file contents ...]
EOF

# Update each file using sed or manual editing
# (Script would contain sed commands for each file)

echo "Changes applied. Run 'npm run build' and 'npm run lint' to verify."
```

## Testing Checklist

After applying changes:

- [ ] Build succeeds: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Visit `/explore/concepts` - concepts show shortDefinition
- [ ] Visit `/explore/concepts/acceleration` - shows longDefinition
- [ ] Observatory focus panel shows shortDefinition for concepts
- [ ] Graph neighborhood cards show shortDefinition
- [ ] Semantic flow nodes show shortDefinition in tooltips

## Recommended Unit Tests

Add to your test suite (e.g., `lib/explore/getConceptDisplayDefinition.test.ts`):

```typescript
import { describe, test, expect } from "vitest";
import { getConceptDisplayDefinition } from "./getConceptDisplayDefinition";
import type { GlossaryConcept } from "@/types/semanticGraph";

const mockConcept: GlossaryConcept = {
  id: "concept-acceleration",
  slug: "acceleration",
  title: "Acceleration",
  shortDefinition: "Acceleration is pressure that favors speed...",
  longDefinition: "Acceleration arises when coordination is fragile... Iron Age siege walls...",
  definition: "Acceleration arises when coordination is fragile... Iron Age siege walls...",
  termKind: "core",
  isCoreTerm: true,
  relatedConcepts: [],
  relatedPatterns: [],
  relatedBooks: [],
};

describe("getConceptDisplayDefinition", () => {
  test("index variant returns shortDefinition", () => {
    const result = getConceptDisplayDefinition(mockConcept, "index");
    expect(result).toBe(mockConcept.shortDefinition);
    expect(result).not.toContain("Iron Age");
  });

  test("card variant returns shortDefinition", () => {
    const result = getConceptDisplayDefinition(mockConcept, "card");
    expect(result).toBe(mockConcept.shortDefinition);
    expect(result).not.toContain("Iron Age");
  });

  test("detail variant prefers longDefinition", () => {
    const result = getConceptDisplayDefinition(mockConcept, "detail");
    expect(result).toBe(mockConcept.longDefinition);
    expect(result).toContain("Iron Age");
  });

  test("detail variant falls back to definition when longDefinition missing", () => {
    const conceptWithoutLong = { ...mockConcept, longDefinition: undefined };
    const result = getConceptDisplayDefinition(conceptWithoutLong, "detail");
    expect(result).toBe(mockConcept.definition);
  });

  test("detail variant falls back to shortDefinition when both missing", () => {
    const conceptMinimal = {
      ...mockConcept,
      longDefinition: undefined,
      definition: undefined,
    };
    const result = getConceptDisplayDefinition(conceptMinimal, "detail");
    expect(result).toBe(mockConcept.shortDefinition);
  });

  test("default variant matches card behavior", () => {
    const defaultResult = getConceptDisplayDefinition(mockConcept);
    const cardResult = getConceptDisplayDefinition(mockConcept, "card");
    expect(defaultResult).toBe(cardResult);
  });
});
```

## Integration Test Recommendations

Add smoke tests for concept data quality:

```typescript
// __tests__/semantic-graph.test.ts
import { describe, test, expect } from "vitest";
import { getSemanticGraph } from "@/lib/graph/manifest";

describe("Semantic graph concept definitions", () => {
  test("all concepts have shortDefinition", async () => {
    const graph = await getSemanticGraph();
    
    for (const concept of graph.glossary) {
      expect(concept.shortDefinition).toBeTruthy();
      expect(concept.shortDefinition.length).toBeGreaterThan(10);
    }
  });

  test("shortDefinitions avoid historical examples", async () => {
    const graph = await getSemanticGraph();
    const exampleMarkers = ["Iron Age", "siege wall", "factory floor"];
    
    const conceptsWithExamples = graph.glossary.filter((c) =>
      exampleMarkers.some((marker) =>
        c.shortDefinition.toLowerCase().includes(marker.toLowerCase())
      )
    );

    // Should be empty or only contain editorial exceptions
    expect(conceptsWithExamples).toHaveLength(0);
  });

  test("acceleration concept has correct definitions", async () => {
    const graph = await getSemanticGraph();
    const acceleration = graph.glossary.find((c) => c.slug === "acceleration");
    
    expect(acceleration).toBeDefined();
    expect(acceleration!.shortDefinition).toContain("pressure that favors speed");
    expect(acceleration!.shortDefinition).not.toContain("Iron Age");
    expect(acceleration!.longDefinition).toContain("Iron Age");
  });
});
```

## Benefits

- Single source of truth for definition display logic
- Prevents drift between index, observatory, search, and related terrain
- Easier to audit and update field preferences in one location
- Complements content repo validation for shortDefinition quality
- Future-proof: any new display contexts can use the same helper

## Related PR

Content repo validation: https://github.com/ksteffe/after-certainty/pull/241
