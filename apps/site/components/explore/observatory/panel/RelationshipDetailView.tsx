"use client";

import Link from "next/link";

import { graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";
import { exploreHrefForNode, exploreObservatoryFocusHref } from "@/lib/graph/explorePaths";
import { masterTermForConceptId, structuralPressureForConceptId } from "@/lib/graph/ontology";
import { isSymmetricRelationship } from "@/lib/graph/relationshipTaxonomy";
import { mergeRelatedTerrain } from "@/lib/observatory/relatedTerrainMerge";
import type { RelationshipSelection } from "@/lib/observatory/types";
import { formatRelationshipLabelForDisplay } from "@/lib/graph/relationshipVisuals";

function labelForNode(index: GraphIndex, id: string): string {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return "Unknown";
  return graphNodeTitle(n);
}

function ontologyLineForConcept(index: GraphIndex, conceptId: string): string | null {
  const master = masterTermForConceptId(index.graph, conceptId);
  if (master?.preserves) return `${master.title} preserves ${master.preserves}`;
  const pressure = structuralPressureForConceptId(index.graph, conceptId);
  if (pressure?.effect) return `${pressure.title} · ${pressure.effect}`;
  return null;
}

type RelationshipDetailViewProps = {
  index: GraphIndex;
  selection: RelationshipSelection;
  onRelatedTerrainLinkNavigate?: () => void;
  onFocusEndpoint?: (canonicalId: string) => void;
};

export function RelationshipDetailView({
  index,
  selection,
  onRelatedTerrainLinkNavigate,
  onFocusEndpoint,
}: RelationshipDetailViewProps) {
  if (!selection) return null;

  const sourceNode = index.getNodeByCanonicalId(selection.sourceId);
  const targetNode = index.getNodeByCanonicalId(selection.targetId);
  const { relationship } = selection;
  const desc = relationship.description ?? relationship.summary;
  const symmetric = isSymmetricRelationship(selection.predicate);
  const predicateLabel = formatRelationshipLabelForDisplay(selection.predicate);

  const sourceOntology =
    sourceNode?.kind === "concept" ? ontologyLineForConcept(index, selection.sourceId) : null;
  const targetOntology =
    targetNode?.kind === "concept" ? ontologyLineForConcept(index, selection.targetId) : null;

  const bundle =
    sourceNode && targetNode ? mergeRelatedTerrain(index, sourceNode, targetNode) : null;

  const hasRelatedTerrain =
    bundle &&
    (bundle.concepts.length > 0 ||
      bundle.patterns.length > 0 ||
      bundle.books.length > 0 ||
      bundle.sources.length > 0 ||
      bundle.thinkers.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.26em] text-accent">
          {symmetric ? "Structural tension" : "Dynamic relationship"}
        </p>
        <p className="mt-4 font-display text-lg leading-relaxed text-fg">
          {symmetric ? (
            <>
              <Link
                href={
                  sourceNode ? exploreObservatoryFocusHref(sourceNode.kind, sourceNode.slug) : "#"
                }
                className="hover:text-accent hover:underline"
                onClick={() => onRelatedTerrainLinkNavigate?.()}
              >
                {labelForNode(index, selection.sourceId)}
              </Link>
              <span className="mx-2 text-muted">↔</span>
              <Link
                href={
                  targetNode ? exploreObservatoryFocusHref(targetNode.kind, targetNode.slug) : "#"
                }
                className="hover:text-accent hover:underline"
                onClick={() => onRelatedTerrainLinkNavigate?.()}
              >
                {labelForNode(index, selection.targetId)}
              </Link>
            </>
          ) : (
            <>
              <Link
                href={
                  sourceNode ? exploreObservatoryFocusHref(sourceNode.kind, sourceNode.slug) : "#"
                }
                className="hover:text-accent hover:underline"
                onClick={() => onRelatedTerrainLinkNavigate?.()}
              >
                {labelForNode(index, selection.sourceId)}
              </Link>
              <span className="mx-2 text-[11px] uppercase tracking-[0.2em] text-muted">
                {predicateLabel} →
              </span>
              <Link
                href={
                  targetNode ? exploreObservatoryFocusHref(targetNode.kind, targetNode.slug) : "#"
                }
                className="hover:text-accent hover:underline"
                onClick={() => onRelatedTerrainLinkNavigate?.()}
              >
                {labelForNode(index, selection.targetId)}
              </Link>
            </>
          )}
        </p>
        {!symmetric ? (
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted">
            {predicateLabel}
          </p>
        ) : null}
        {desc ? <p className="mt-4 text-sm leading-relaxed text-muted">{desc}</p> : null}
        {sourceOntology || targetOntology ? (
          <p className="mt-4 text-xs leading-relaxed text-muted">
            {[sourceOntology, targetOntology].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {sourceNode ? (
          <>
            <Link
              href={exploreHrefForNode(sourceNode)}
              className="rounded-sm border border-border px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent/45"
            >
              Source entry
            </Link>
            {onFocusEndpoint ? (
              <button
                type="button"
                className="rounded-sm border border-border px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent/45"
                onClick={() => onFocusEndpoint(selection.sourceId)}
              >
                Focus source
              </button>
            ) : null}
          </>
        ) : null}
        {targetNode ? (
          <>
            <Link
              href={exploreHrefForNode(targetNode)}
              className="rounded-sm border border-border px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent/45"
            >
              Target entry
            </Link>
            {onFocusEndpoint ? (
              <button
                type="button"
                className="rounded-sm border border-border px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent/45"
                onClick={() => onFocusEndpoint(selection.targetId)}
              >
                Focus target
              </button>
            ) : null}
          </>
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
            {bundle.thinkers.slice(0, 6).map((t) => (
              <li key={t.id}>
                <Link
                  href={exploreObservatoryFocusHref("thinker", t.slug)}
                  className="hover:text-accent"
                  onClick={() => onRelatedTerrainLinkNavigate?.()}
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
