import type { GraphEntityKind } from "@/types/semanticGraph";
import type { GraphVizBuildOptions } from "@/lib/graph/graphVizModel";

/** UI panel mode for the interpretation console. */
export type PanelMode = "empty" | "entity" | "relationship";

export type FocusSource = "default" | "url" | "user";

export type FocusState = {
  focusCanonicalId: string | null;
  selectedCanonicalId: string | null;
  expandedRootIds: string[];
  source: FocusSource;
};

export type TraversalState = {
  pathFromId: string | null;
  pathToId: string | null;
};

/** Future: curated conceptual journeys (not wired in v1). */
export interface Pathway {
  id: string;
  slug: string;
  title: string;
  description: string;
  steps: { canonicalId: string; caption?: string }[];
}

/** Future: topology projection presets (not wired in v1). */
export interface Lens {
  id: string;
  label: string;
  predicates?: string[];
  kinds?: GraphEntityKind[];
}

export type GraphFilters = GraphVizBuildOptions;
