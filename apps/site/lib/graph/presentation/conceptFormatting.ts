import type { GlossaryConcept } from "@/types/semanticGraph";

/**
 * Returns the best available display definition for a concept.
 * Handles partial manifest migration where some concepts have structured
 * longDefinition while others only have shortDefinition with embedded examples.
 */
export function getConceptDisplayDefinition(concept: GlossaryConcept): string {
  if (concept.longDefinition) return concept.longDefinition;
  if (concept.definition) return concept.definition;
  
  return extractPortableDefinition(concept.shortDefinition);
}

/**
 * Extracts the portable core definition from a shortDefinition that may
 * contain historical examples or manifestations.
 */
function extractPortableDefinition(shortDefinition: string): string {
  const emDashIndex = shortDefinition.indexOf("—");
  if (emDashIndex > 50) {
    return shortDefinition.substring(0, emDashIndex).trim();
  }
  
  const bookPatterns = [
    /\. Before Certainty Arrives /,
    /\. After Certainty /,
    /\. In [A-Z]/,
  ];
  
  for (const pattern of bookPatterns) {
    const match = shortDefinition.match(pattern);
    if (match && match.index && match.index > 50) {
      return shortDefinition.substring(0, match.index + 1).trim();
    }
  }
  
  return shortDefinition;
}

/**
 * Returns the full definition for detail pages.
 * Uses the same fallback chain but doesn't extract - shows complete text.
 */
export function getConceptFullDefinition(concept: GlossaryConcept): string {
  return concept.longDefinition ?? concept.definition ?? concept.shortDefinition;
}
