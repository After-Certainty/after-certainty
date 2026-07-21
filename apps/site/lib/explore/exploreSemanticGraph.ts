import { getSemanticGraph } from "@/lib/graph/manifest";
import type { SemanticGraph } from "@/types/semanticGraph";

/** Semantic graph as used across `/explore` — books are fully described in the semantic manifest. */
export async function getExploreSemanticGraph(): Promise<{ graph: SemanticGraph }> {
  const graph = await getSemanticGraph();
  return { graph };
}
