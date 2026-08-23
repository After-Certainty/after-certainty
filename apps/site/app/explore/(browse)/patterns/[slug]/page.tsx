import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExplorePatternMedia } from "@/components/explore/explore-pattern-media";
import { ExplorePatternNarrative } from "@/components/explore/explore-pattern-narrative";
import { ExploreEntityDetailActions } from "@/components/explore/explore-entity-detail-actions";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { PatternAtAGlance } from "@/components/explore/pattern-at-a-glance";
import { PatternIntroDisclosure } from "@/components/explore/pattern-intro-disclosure";
import { RelatedBooksSection } from "@/components/explore/related-books-section";
import { RelatedConceptsSection } from "@/components/explore/related-concepts-section";
import { RelatedChaptersSection } from "@/components/explore/related-chapters-section";
import { RelatedTrailsSection } from "@/components/trails/related-trails-section";
import { SemanticRelationshipsSection } from "@/components/explore/semantic-relationships-section";
import { entityHasSemanticRelationships } from "@/lib/graph/presentation/relationshipTaxonomy";
import { LinkifiedText } from "@/components/ui/linkified-text";
import { Section } from "@/components/ui/section";
import { EXPLORE_ENTITY_DETAIL_SECTION_CLASS } from "@/lib/explore/entity-detail-layout";
import {
  explorePatternAdjacentInIndexOrder,
  patternsSortedForExploreIndex,
} from "@/lib/explore/explore-patterns-order";
import { patternAtAGlance, patternDetailTeaser } from "@/lib/explore/pattern-at-a-glance";
import { patternIndexEyebrow } from "@/lib/explore/pattern-preview";
import { publicChaptersForPattern } from "@/lib/graph/query/chapter-associations";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getPatternBySlug } from "@/lib/graph/query/graphQueries";
import { relatedContentForPattern } from "@/lib/graph/query/relatedContent";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";
import { buildPatternPageJsonLd, relatedConceptUrls } from "@/lib/seo/json-ld";
import { buildPublicGroundingViewModel } from "@/lib/graph/query/grounding";
import { SemanticGroundingDisclosure } from "@/components/explore/semantic-grounding-disclosure";
import { ExploreEnrichmentSections, hasSemanticEnrichment } from "@/components/explore/explore-enrichment-sections";
import { PatternLanguageContext } from "@/components/explore/pattern-language-context";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const pattern = getPatternBySlug(index, slug);
  if (!pattern) return {};
  return createPageMetadata({
    title: pattern.title,
    description: pattern.summary,
    alternates: { canonical: `${explorePaths.patterns}/${pattern.slug}` },
  });
}

export default async function ExplorePatternDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const pattern = getPatternBySlug(index, slug);
  if (!pattern) notFound();

  const related = relatedContentForPattern(index, pattern);
  const relatedChapters = publicChaptersForPattern(graph, pattern.id);
  const patternsInListOrder = patternsSortedForExploreIndex(graph.patterns);
  const { prev: prevPattern, next: nextPattern } = explorePatternAdjacentInIndexOrder(
    patternsInListOrder,
    pattern.slug,
  );

  const hasRelated = related.concepts.length + related.books.length > 0;
  const hasRelationships = entityHasSemanticRelationships(index, pattern.id);
  const grounding = buildPublicGroundingViewModel(pattern.grounding, graph);
  const teaser = patternDetailTeaser(pattern);
  const glanceItems = patternAtAGlance(pattern);

  const patternBreadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Patterns", href: explorePaths.patterns },
    { label: pattern.title },
  ];

  return (
    <article>
      <JsonLd
        data={buildPatternPageJsonLd({
          pattern,
          breadcrumbs: patternBreadcrumbs,
          relatedConceptUrls: relatedConceptUrls(index, pattern.relatedConcepts),
        })}
      />
      <Section atmosphere="none" className={EXPLORE_ENTITY_DETAIL_SECTION_CLASS}>
        <BreadcrumbTrail items={patternBreadcrumbs} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">
          {patternIndexEyebrow(pattern)}
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:mt-4 md:text-5xl">
          {pattern.title}
        </h1>

        <PatternIntroDisclosure teaser={teaser}>
          <p className="text-lg leading-relaxed text-muted md:text-xl">
            <LinkifiedText text={pattern.summary} />
          </p>
          <ExplorePatternNarrative pattern={pattern} />
        </PatternIntroDisclosure>

        <PatternLanguageContext index={index} pattern={pattern} />
        <PatternAtAGlance items={glanceItems} />

        {grounding ? <SemanticGroundingDisclosure grounding={grounding} /> : null}
        <ExploreEntityDetailActions observatory={{ kind: "pattern", slug: pattern.slug }} />
        <ExplorePatternMedia pattern={pattern} />
        <ExploreAdjacentNav
          basePath={explorePaths.patterns}
          entityLabel="pattern"
          prev={prevPattern ? { slug: prevPattern.slug, title: prevPattern.title } : undefined}
          next={nextPattern ? { slug: nextPattern.slug, title: nextPattern.title } : undefined}
        />
      </Section>

      {hasSemanticEnrichment(pattern) ? (
        <Section
          atmosphere="transition"
          className="border-t border-border/25 !pt-[var(--explore-section-y)] md:!pt-[var(--explore-section-y-md)] !pb-[var(--explore-section-pb)] md:!pb-[var(--explore-section-pb-md)]"
        >
          <ExploreEnrichmentSections enrichment={pattern} />
        </Section>
      ) : null}

      <RelatedTrailsSection canonicalId={pattern.id} entityLabel="pattern" />

      {relatedChapters.length > 0 ? (
        <Section
          atmosphere="transition"
          className="border-t border-border/25 !pt-[var(--explore-section-y)] md:!pt-[var(--explore-section-y-md)] !pb-[var(--explore-section-pb)] md:!pb-[var(--explore-section-pb-md)]"
        >
          <RelatedChaptersSection chapters={relatedChapters} />
        </Section>
      ) : null}

      {hasRelated ? (
        <Section
          atmosphere="transition"
          className="border-t border-border/25 !pt-[var(--explore-section-y)] md:!pt-[var(--explore-section-y-md)] !pb-[var(--explore-section-pb)] md:!pb-[var(--explore-section-pb-md)]"
        >
          <div className="flex flex-col gap-8 md:gap-14">
            <RelatedConceptsSection concepts={related.concepts} />
            <RelatedBooksSection books={related.books} />
          </div>
        </Section>
      ) : null}

      {hasRelationships ? (
        <Section
          atmosphere="none"
          className="border-t border-border/25 !pt-6 md:!pt-14 !pb-12 md:!pb-24"
        >
          <SemanticRelationshipsSection
            index={index}
            focalCanonicalId={pattern.id}
            focalKind="pattern"
            focalSlug={pattern.slug}
            collapsibleDynamics
          />
        </Section>
      ) : null}
    </article>
  );
}
