"use client";

import Link from "next/link";

import type { GraphIndex } from "@/lib/graph/graph";
import { exploreHrefForNode, exploreObservatoryFocusHref } from "@/lib/graph/explorePaths";
import { mergeRelatedTerrain } from "@/lib/observatory/relatedTerrainMerge";
import type { RelationshipSelection } from "@/lib/observatory/types";
import { formatRelationshipLabelForDisplay } from "@/lib/graph/relationshipVisuals";

function labelForNode(index: GraphIndex, id: string): string {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return "Unknown";
  return n.kind === "source" ? n.entity.name : n.entity.title;
}

type RelationshipDetailViewProps = {
  index: GraphIndex;
  selection: RelationshipSelection;
  onRelatedTerrainLinkNavigate?: () => void;
};

export function RelationshipDetailView({
  index,
  selection,
  onRelatedTerrainLinkNavigate,
}: RelationshipDetailViewProps) {
  if (!selection) return null;

  const sourceNode = index.getNodeByCanonicalId(selection.sourceId);
  const targetNode = index.getNodeByCanonicalId(selection.targetId);
  const { relationship } = selection;
  const desc = relationship.description ?? relationship.summary;

  const bundle =
    sourceNode && targetNode ? mergeRelatedTerrain(index, sourceNode, targetNode) : null;

  const hasRelatedTerrain =
    bundle &&
    (bundle.concepts.length > 0 ||
      bundle.patterns.length > 0 ||
      bundle.books.length > 0 ||
      bundle.sources.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.26em] text-accent">Relationship</p>
        <p className="mt-4 font-display text-lg leading-relaxed text-fg">
          <Link
            href={
              sourceNode
                ? exploreObservatoryFocusHref(sourceNode.kind, sourceNode.slug)
                : "#"
            }
            className="hover:text-accent hover:underline"
            onClick={() => onRelatedTerrainLinkNavigate?.()}
          >
            {labelForNode(index, selection.sourceId)}
          </Link>
          <span className="mx-2 text-[11px] uppercase tracking-[0.2em] text-muted">
            {formatRelationshipLabelForDisplay(selection.predicate)}
          </span>
          <Link
            href={
              targetNode
                ? exploreObservatoryFocusHref(targetNode.kind, targetNode.slug)
                : "#"
            }
            className="hover:text-accent hover:underline"
            onClick={() => onRelatedTerrainLinkNavigate?.()}
          >
            {labelForNode(index, selection.targetId)}
          </Link>
        </p>
        {desc ? <p className="mt-4 text-sm leading-relaxed text-muted">{desc}</p> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {sourceNode ? (
          <Link
            href={exploreHrefForNode(sourceNode)}
            className="rounded-sm border border-border px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent/45"
          >
            Source entry
          </Link>
        ) : null}
        {targetNode ? (
          <Link
            href={exploreHrefForNode(targetNode)}
            className="rounded-sm border border-border px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent/45"
          >
            Target entry
          </Link>
        ) : null}
      </div>

      {hasRelatedTerrain && bundle ? (
        <details className="space-y-3" open>
          <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.24em] text-muted marker:content-none [&::-webkit-details-marker]:hidden">
            Related terrain
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-fg">
            {bundle.concepts.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link
                  href={exploreObservatoryFocusHref("concept", c.slug)}
                  className="hover:text-accent"
                  onClick={() => onRelatedTerrainLinkNavigate?.()}
                >
                  {c.title}
                </Link>
              </li>
            ))}
            {bundle.patterns.slice(0, 6).map((p) => (
              <li key={p.id}>
                <Link
                  href={exploreObservatoryFocusHref("pattern", p.slug)}
                  className="hover:text-accent"
                  onClick={() => onRelatedTerrainLinkNavigate?.()}
                >
                  {p.title}
                </Link>
              </li>
            ))}
            {bundle.books.slice(0, 6).map((b) => (
              <li key={b.id}>
                <Link
                  href={exploreObservatoryFocusHref("book", b.slug)}
                  className="hover:text-accent"
                  onClick={() => onRelatedTerrainLinkNavigate?.()}
                >
                  {b.title}
                </Link>
              </li>
            ))}
            {bundle.sources.slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link
                  href={exploreObservatoryFocusHref("source", s.slug)}
                  className="hover:text-accent"
                  onClick={() => onRelatedTerrainLinkNavigate?.()}
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
