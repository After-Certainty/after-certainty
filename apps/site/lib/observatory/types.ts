import type { Relationship } from "@/types/semanticGraph";
import type { PanelMode } from "@/types/observatory";

export type NodeSemanticTier = "focus" | "neighbor" | "path" | "dim" | "hidden";
export type EdgeSemanticTier = "selected" | "incident" | "path" | "dim";

export type SemanticWeights = {
  nodes: Map<string, NodeSemanticTier>;
  edges: Map<string, EdgeSemanticTier>;
};

export type RelationshipSelection = {
  edgeKey: string;
  sourceId: string;
  targetId: string;
  predicate: string;
  relationship: Relationship;
} | null;

export type ObservatoryUIState = {
  panelMode: PanelMode;
  leftOpen: boolean;
  rightOpen: boolean;
  bottomOpen: boolean;
  refitSignal: number;
  layoutRevision: number;
  hoveredEdgeKey: string | null;
  showRelationshipLabels: boolean;
};
