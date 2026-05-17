"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { EntityDetailView } from "@/components/explore/observatory/panel/EntityDetailView";
import { RelationshipDetailView } from "@/components/explore/observatory/panel/RelationshipDetailView";
import type { GraphIndex, GraphNode } from "@/lib/graph/graph";
import type { RelationshipSelection } from "@/lib/observatory/types";
import type { PanelMode } from "@/types/observatory";
import type { Relationship } from "@/types/semanticGraph";

type ObservatoryInterpretationPanelProps = {
  index: GraphIndex;
  panelMode: PanelMode;
  node: GraphNode | null;
  relationshipSelection: RelationshipSelection;
  coverBySlug: Record<string, string | undefined>;
  highlightedRelationshipKey: string | null;
  isPinned: boolean;
  onHighlightRelationship: (r: Relationship) => void;
  onTogglePin: (canonicalId: string) => void;
  onRelatedTerrainLinkNavigate?: () => void;
};

export function ObservatoryInterpretationPanel({
  index,
  panelMode,
  node,
  relationshipSelection,
  coverBySlug,
  highlightedRelationshipKey,
  isPinned,
  onHighlightRelationship,
  onTogglePin,
  onRelatedTerrainLinkNavigate,
}: ObservatoryInterpretationPanelProps) {
  const reduceMotion = useReducedMotion();

  const header =
    panelMode === "relationship"
      ? "Relationship"
      : panelMode === "entity"
        ? "Focus"
        : "Interpretation";

  return (
    <div className="space-y-4 p-1">
      <div className="border-b border-border/30 pb-3">
        <p className="text-[11px] uppercase tracking-[0.26em] text-muted">{header}</p>
      </div>

      <AnimatePresence mode="wait">
        {panelMode === "relationship" && relationshipSelection ? (
          <motion.div
            key={`rel-${relationshipSelection.edgeKey}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
          >
            <RelationshipDetailView
              index={index}
              selection={relationshipSelection}
              onRelatedTerrainLinkNavigate={onRelatedTerrainLinkNavigate}
            />
          </motion.div>
        ) : panelMode === "entity" && node ? (
          <motion.div
            key={`node-${node.id}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
          >
            <EntityDetailView
              index={index}
              node={node}
              coverBySlug={coverBySlug}
              isPinned={isPinned}
              highlightedRelationshipKey={highlightedRelationshipKey}
              onHighlightRelationship={onHighlightRelationship}
              onTogglePin={onTogglePin}
              onRelatedTerrainLinkNavigate={onRelatedTerrainLinkNavigate}
            />
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            className="text-sm leading-relaxed text-muted"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Select a node or relationship on the map to read its semantic context.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
