import type { GraphIndex } from "@/lib/graph/graph";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import type { OntologyMasterTerm, OntologyStructuralPressure, SemanticGraph } from "@/types/semanticGraph";

export type OntologyRole = "master" | "pressure";

export function masterTermForConceptId(
  graph: SemanticGraph,
  conceptId: string,
): OntologyMasterTerm | null {
  const row = graph.ontology?.masterTerms.find((t) => t.id === conceptId);
  return row ?? null;
}

export function structuralPressureForConceptId(
  graph: SemanticGraph,
  conceptId: string,
): OntologyStructuralPressure | null {
  const row = graph.ontology?.structuralPressures.find((t) => t.id === conceptId);
  return row ?? null;
}

export function ontologyRoleForConcept(graph: SemanticGraph, conceptId: string): OntologyRole | null {
  if (masterTermForConceptId(graph, conceptId)) return "master";
  if (structuralPressureForConceptId(graph, conceptId)) return "pressure";
  return null;
}

export type OntologyLens = "master" | "pressure";

/** Concept ids visible under an ontology lens: seed terms plus one relationship hop. */
export function ontologyLensAllowedConceptIds(index: GraphIndex, lens: OntologyLens): Set<string> {
  const graph = index.graph;
  const seeds =
    lens === "master"
      ? (graph.ontology?.masterTerms ?? []).map((t) => t.id)
      : (graph.ontology?.structuralPressures ?? []).map((t) => t.id);

  const allowed = new Set<string>(seeds);
  for (const r of graph.relationships) {
    const ends = relationshipEndpointsResolved(index, r);
    if (!ends) continue;
    if (allowed.has(ends.sourceId)) allowed.add(ends.targetId);
    if (allowed.has(ends.targetId)) allowed.add(ends.sourceId);
  }
  return allowed;
}
