import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExploreEntityDetailActions } from "@/components/explore/explore-entity-detail-actions";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { LinkifiedText } from "@/components/ui/linkified-text";
import { Section } from "@/components/ui/section";
import {
  exploreThinkerAdjacentInIndexOrder,
  thinkersSortedForExploreIndex,
} from "@/lib/explore/explore-thinkers-order";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getThinkerBySlug } from "@/lib/graph/graphQueries";
import { relatedContentForThinker } from "@/lib/graph/relatedContent";
import { createPageMetadata } from "@/lib/metadata";
import { buildThinkerPageJsonLd } from "@/lib/seo/json-ld";
import type { Thinker } from "@/types/semanticGraph";

type PageProps = { params: Promise<{ slug: string }> };

function thinkerTypeLabel(type: Thinker["type"]): string {
  return type === "organization" ? "Organization" : "Person";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const thinker = getThinkerBySlug(graph, slug);
  if (!thinker) return {};
  return createPageMetadata({
    title: thinker.name,
    description:
      thinker.summary ??
      thinker.whyThisMatters ??
      `${thinker.name} — ${thinkerTypeLabel(thinker.type)}`,
  });
}

export default async function ExploreThinkerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph, catalogBooks } = await getExploreSemanticGraph();
  const thinker = getThinkerBySlug(graph, slug);
  if (!thinker) notFound();

  const index = buildGraphIndex(graph);
  const related = relatedContentForThinker(index, thinker);
  const thinkersInListOrder = thinkersSortedForExploreIndex(graph);
  const { prev: prevThinker, next: nextThinker } = exploreThinkerAdjacentInIndexOrder(
    thinkersInListOrder,
    thinker.slug,
  );

  const hasRelated =
    related.works.length +
      related.concepts.length +
      related.patterns.length +
      related.books.length >
    0;

  const thinkerBreadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Thinkers", href: explorePaths.thinkers },
    { label: thinker.name },
  ];

  return (
    <article>
      <JsonLd
        data={buildThinkerPageJsonLd({
          thinker,
          breadcrumbs: thinkerBreadcrumbs,
        })}
      />
      <Section atmosphere="none" className="pt-10 md:pt-14 !pb-10 md:!pb-12">
        <BreadcrumbTrail items={thinkerBreadcrumbs} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">
          {thinkerTypeLabel(thinker.type)}
        </p>
        <h1 className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:text-5xl">
          {thinker.name}
        </h1>
        {thinker.summary ? (
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            <LinkifiedText text={thinker.summary} />
          </p>
        ) : null}
        {thinker.whyThisMatters ? (
          <div className="mt-8 max-w-2xl space-y-3">
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">Why this matters</h2>
            <p className="text-lg leading-relaxed text-muted md:text-xl">
              <LinkifiedText text={thinker.whyThisMatters} />
            </p>
          </div>
        ) : null}
        <ExploreEntityDetailActions observatory={{ kind: "thinker", slug: thinker.slug }} />
        <ExploreAdjacentNav
          basePath={explorePaths.thinkers}
          entityLabel="thinker"
          prev={prevThinker ? { slug: prevThinker.slug, title: prevThinker.name } : undefined}
          next={nextThinker ? { slug: nextThinker.slug, title: nextThinker.name } : undefined}
        />
      </Section>

      {hasRelated ? (
        <Section
          atmosphere="transition"
          className="border-t border-border/25 !pt-8 md:!pt-10 !pb-14 md:!pb-20"
        >
          <div className="flex flex-col gap-14">
            <RelatedContentGrid heading="Works" sources={related.works} />
            <RelatedContentGrid heading="Related concepts" concepts={related.concepts} />
            <RelatedContentGrid heading="Related patterns" patterns={related.patterns} />
            <RelatedContentGrid
              heading="Related books"
              books={related.books}
              catalogBooksForBookCovers={catalogBooks}
            />
          </div>
        </Section>
      ) : null}
    </article>
  );
}
