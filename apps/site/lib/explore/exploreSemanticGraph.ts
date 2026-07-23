import { getSemanticGraph, getSemanticGraphLoadResult } from "@/lib/graph/manifest";
import type { ManifestSource } from "@/lib/graph/manifest";
import type { SemanticGraph } from "@/types/semanticGraph";

/** Semantic graph as used across `/explore` — books are fully described in the semantic manifest. */
export async function getExploreSemanticGraph(): Promise<{
  graph: SemanticGraph;
  source: ManifestSource;
}> {
  const result = await getSemanticGraphLoadResult();
  return { graph: result.graph, source: result.source };
}

/** @deprecated Prefer getExploreSemanticGraph which also returns provenance. */
export async function getExploreSemanticGraphOnly(): Promise<SemanticGraph> {
  return getSemanticGraph();
}
