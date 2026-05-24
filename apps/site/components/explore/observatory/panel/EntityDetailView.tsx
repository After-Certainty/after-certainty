"use client";

import Link from "next/link";

import { RelationshipCard } from "@/components/explore/relationship-card";
import type { GraphIndex, GraphNode } from "@/lib/graph/graph";
import { exploreHrefForNode, exploreObservatoryFocusHref, exploreObservatoryRelationshipHref } from "@/lib/graph/explorePaths";
import {
  relatedContentForBook,
  relatedContentForConcept,
  relatedContentForPattern,
  relatedContentForSource,
} from "@/lib/graph/relatedContent";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import { relationshipsForConcept } from "@/lib/graph/relationshipTaxonomy";
import { vizEdgeDedupKey } from "@/lib/graph/graphVizModel";
import type { Relationship } from "@/types/semanticGraph";

function labelForId(index: GraphIndex, id: string): string {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return "Unknown";
  return n.kind === "source" ? n.entity.name : n.entity.title;
}

function counterpartyHref(index: GraphIndex, id: string): string | null {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return null;
  return exploreObservatoryFocusHref(n.kind, n.slug);
}

type EntityDetailViewProps = {
  index: GraphIndex;
  node: GraphNode;
  coverBySlug: Record<string, string | undefined>;
  isPinned: boolean;
  highlightedRelationshipKey: string | null;
  onHighlightRelationship: (r: Relationship) => void;
  onTogglePin: (canonicalId: string) => void;
  onRelatedTerrainLinkNavigate?: () => void;
};

export function EntityDetailView({
  index,
  node,
  coverBySlug,
  isPinned,
  highlightedRelationshipKey,
  onHighlightRelationship,
  onTogglePin,
  onRelatedTerrainLinkNavigate,
}: EntityDetailViewProps) {
  const { tensions, outgoingDynamics, incomingDynamics } = relationshipsForConcept(index, node.id);
  const bundle =
    node.kind === "concept"
      ? relatedContentForConcept(index, node.entity)
      : node.kind === "pattern"
        ? relatedContentForPattern(index, node.entity)
        : node.kind === "book"
          ? relatedContentForBook(index, node.entity)
          : relatedContentForSource(index, node.entity);

  const hasRelatedTerrain =
    bundle.concepts.length > 0 ||
    bundle.patterns.length > 0 ||
    bundle.books.length > 0 ||
    bundle.sources.length > 0;

  const cover = node.kind === "book" ? coverBySlug[node.entity.slug] ?? node.entity.coverImage : undefined;

  const enrichment =
    node.kind === "concept" || node.kind === "pattern"
      ? node.entity.recognitionSignals
      : undefined;

  const renderRelationship = (r: Relationship, otherId: string, keyPrefix: string, i: number) => {
    const ends = relationshipEndpointsResolved(index, r);
    if (!ends) return null;
    const edgeKey = vizEdgeDedupKey(ends.sourceId, ends.targetId, r.relationship);
    const observatoryHref = exploreObservatoryRelationshipHref(node.kind, node.slug, edgeKey);
    return (
      <li key={`${keyPrefix}-${i}`}>
        <RelationshipCard
          relationship={r}
          counterpartyLabel={labelForId(index, otherId)}
          counterpartyHref={counterpartyHref(index, otherId)}
          observatoryHref={observatoryHref}
          onPress={() => onHighlightRelationship(r)}
          isActive={highlightedRelationshipKey === edgeKey}
        />
      </li>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.26em] text-accent">{node.kind}</p>
        <h2 className="mt-3 font-display text-xl font-medium leading-snug text-fg md:text-2xl">
          {node.kind === "source" ? node.entity.name : node.entity.title}
        </h2>
        {node.kind === "concept" ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">{node.entity.shortDefinition}</p>
        ) : null}
        {node.kind === "pattern" ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">{node.entity.summary}</p>
        ) : null}
        {node.kind === "book" ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">{node.entity.summary ?? node.entity.subtitle}</p>
        ) : null}
        {node.kind === "source" && node.entity.summary ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">{node.entity.summary}</p>
        ) : null}
        {node.kind === "concept" && node.entity.layer ? (
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted">
            Layer · <span className="text-fg">{node.entity.layer}</span>
          </p>
        ) : null}
      </div>

      {enrichment && enrichment.length > 0 ? (
        <section className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Recognition signals</p>
          <ul className="list-inside list-disc space-y-1 text-sm leading-relaxed text-muted">
            {enrichment.slice(0, 3).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {node.kind === "book" && cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="max-h-40 w-auto rounded-sm border border-border/80 object-contain" />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link
          href={exploreHrefForNode(node)}
          className="rounded-sm border border-border px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent/45"
        >
          Full entry
        </Link>
        <button
          type="button"
          onClick={() => onTogglePin(node.id)}
          className="rounded-sm border border-border px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent/45"
        >
          {isPinned ? "Unpin" : "Pin"}
        </button>
      </div>

      {(tensions.length > 0 || outgoingDynamics.length > 0 || incomingDynamics.length > 0) && (
        <section className="space-y-4">
          <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted">Relationships</h3>
          {tensions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Structural tensions</p>
              <ul className="space-y-2">
                {tensions.flatMap((r, i) => {
                  const ends = relationshipEndpointsResolved(index, r);
                  if (!ends) return [];
                  const other = ends.sourceId === node.id ? ends.targetId : ends.sourceId;
                  return [renderRelationship(r, other, "tension", i)].filter(Boolean);
                })}
              </ul>
            </div>
          ) : null}
          {outgoingDynamics.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Outgoing dynamics</p>
              <ul className="space-y-2">
                {outgoingDynamics.flatMap((r, i) => {
                  const ends = relationshipEndpointsResolved(index, r);
                  if (!ends) return [];
                  return [renderRelationship(r, ends.targetId, "out", i)].filter(Boolean);
                })}
              </ul>
            </div>
          ) : null}
          {incomingDynamics.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Incoming dynamics</p>
              <ul className="space-y-2">
                {incomingDynamics.flatMap((r, i) => {
                  const ends = relationshipEndpointsResolved(index, r);
                  if (!ends) return [];
                  return [renderRelationship(r, ends.sourceId, "in", i)].filter(Boolean);
                })}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      {hasRelatedTerrain ? (
        <details className="group space-y-3" open>
          <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.24em] text-muted marker:content-none [&::-webkit-details-marker]:hidden">
            Related terrain
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-fg">
            {bundle.concepts.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link
                  href={exploreObservatoryFocusHref("concept", c.slug)}
                  className="block text-left hover:text-accent"
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
                  className="block text-left hover:text-accent"
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
                  className="block text-left hover:text-accent"
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
                  className="block text-left hover:text-accent"
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
