import type { Metadata } from "next";
import { ConceptCard } from "@/components/explore/concept-card";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { ExploreIndexPagination } from "@/components/explore/explore-index-pagination";
import { ExploreIndexSearch } from "@/components/explore/explore-index-search";
import { Section } from "@/components/ui/section";
import {
  filterExploreIndexItems,
  paginateExploreIndexItems,
  parseExploreIndexPage,
  type ExploreIndexItem,
} from "@/lib/explore/explore-index-browse";
import { conceptsSortedForExploreIndex } from "@/lib/explore/explore-concepts-order";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { getConceptDisplayDefinition } from "@/lib/graph/conceptFormatting";
import { explorePaths } from "@/lib/graph/explorePaths";
import { createPageMetadata } from "@/lib/metadata";
import type { GlossaryConcept } from "@/types/semanticGraph";

export const metadata: Metadata = createPageMetadata({
  title: "Concepts",
  description:
    "Glossary concepts in the After Certainty semantic graph — definitions and traversable relationships.",
});

type ExploreConceptsIndexPageProps = {
  searchParams?: Promise<{ q?: string; page?: string }>;
};

function conceptBrowseItem(concept: GlossaryConcept): ExploreIndexItem {
  return {
    id: concept.id,
    slug: concept.slug,
    label: concept.title,
    href: `${explorePaths.concepts}/${concept.slug}`,
    searchText: [
      concept.title,
      concept.slug,
      concept.layer,
      getConceptDisplayDefinition(concept),
      concept.shortDefinition,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function conceptSuggestionItem(concept: GlossaryConcept): ExploreIndexItem {
  return {
    id: concept.id,
    slug: concept.slug,
    label: concept.title,
    href: `${explorePaths.concepts}/${concept.slug}`,
    searchText: [concept.title, concept.slug, concept.layer].filter(Boolean).join(" "),
  };
}

export default async function ExploreConceptsIndexPage({
  searchParams,
}: ExploreConceptsIndexPageProps) {
  const sp = searchParams ? await searchParams : {};
  const q = typeof sp.q === "string" ? sp.q : "";
  const requestedPage = parseExploreIndexPage(typeof sp.page === "string" ? sp.page : undefined);

  const { graph } = await getExploreSemanticGraph();
  const concepts = conceptsSortedForExploreIndex(graph.glossary);
  const browseItems = concepts.map(conceptBrowseItem);
  const filteredItems = filterExploreIndexItems(browseItems, q);
  const slice = paginateExploreIndexItems(filteredItems, requestedPage);
  const conceptById = new Map(concepts.map((c) => [c.id, c]));
  const pageConcepts = slice.items
    .map((item) => conceptById.get(item.id))
    .filter((c): c is GlossaryConcept => c != null);

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Glossary"
        title="Concepts"
        headingId="explore-concepts-heading"
        lede="Each entry is a coordinate in the atlas — open one to move along relationships, patterns, books, and thinkers."
      />
      <Section atmosphere="none" className="border-t border-border/25 py-14 md:py-20">
        {concepts.length === 0 ? (
          <p className="text-muted">No concepts are published in the manifest yet.</p>
        ) : (
          <>
            <ExploreIndexSearch
              items={concepts.map(conceptSuggestionItem)}
              initialQuery={q}
              placeholder="Search concepts…"
              label="Find a concept"
            />
            <p className="mt-6 text-sm text-muted" aria-live="polite">
              {q.trim()
                ? `${slice.totalItems} match${slice.totalItems === 1 ? "" : "es"} for “${q.trim()}”`
                : `${slice.totalItems} concepts`}
            </p>
            {pageConcepts.length === 0 ? (
              <p className="mt-8 text-muted">No concepts match that search.</p>
            ) : (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {pageConcepts.map((c) => (
                  <ConceptCard key={c.id} concept={c} />
                ))}
              </div>
            )}
            <ExploreIndexPagination
              pathname={explorePaths.concepts}
              query={q}
              page={slice.page}
              totalPages={slice.totalPages}
              totalItems={slice.totalItems}
              startIndex={slice.startIndex}
              endIndex={slice.endIndex}
              label="Concepts pagination"
            />
          </>
        )}
      </Section>
    </article>
  );
}
