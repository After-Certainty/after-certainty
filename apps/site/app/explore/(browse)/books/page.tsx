import type { Metadata } from "next";

import { BooksCatalogAnalytics } from "@/components/books/books-catalog-analytics";
import { BooksCatalogControls } from "@/components/books/books-catalog-controls";
import { BooksShelfSection } from "@/components/books/books-shelf-section";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { Section } from "@/components/ui/section";
import { applyCatalogQuery, buildFilterOptions } from "@/lib/books/catalog-query";
import { buildCatalogViewModel } from "@/lib/books/catalog-view-model";
import { hasActiveCatalogFilters, parseCatalogUrlState } from "@/lib/books/catalog-url-state";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";

type BooksPageProps = {
  searchParams?: Promise<{
    shelf?: string;
    type?: string;
    status?: string;
    availability?: string;
    sort?: string;
    q?: string;
    editions?: string;
  }>;
};

export default async function ExploreBooksIndexPage({ searchParams }: BooksPageProps) {
  const { graph } = await getExploreSemanticGraph();
  const viewModel = buildCatalogViewModel(graph);
  const filterOptions = buildFilterOptions(viewModel, graph);
  const knownShelfSlugs = filterOptions.shelves.map((s) => s.slug);
  const urlState = parseCatalogUrlState(searchParams ? await searchParams : {}, knownShelfSlugs);
  const { shelves, results, showShelfSections } = applyCatalogQuery(viewModel, urlState, graph);
  const filteredView = hasActiveCatalogFilters(urlState);

  const featuredShelfSections = shelves.filter(
    ({ shelf }) => shelf.featured && shelf.slug !== "start-here",
  );
  const startHereSection = shelves.find(({ shelf }) => shelf.slug === "start-here");

  return (
    <article>
      <BooksCatalogAnalytics />
      <ExploreIndexHero
        eyebrow="Library"
        title="Books"
        headingId="explore-books-heading"
        lede="A reading library, not a database — curated shelves and a complete catalog for moving through the project at your own pace."
      />

      {showShelfSections && startHereSection ? (
        <BooksShelfSection
          shelf={startHereSection.shelf}
          books={startHereSection.books}
          totalCount={startHereSection.totalCount}
          showViewAll={false}
        />
      ) : null}

      {showShelfSections
        ? featuredShelfSections.map(({ shelf, books, totalCount }) => (
            <BooksShelfSection key={shelf.id} shelf={shelf} books={books} totalCount={totalCount} />
          ))
        : null}

      <Section
        atmosphere="transition"
        className="border-t border-border/25 py-14 md:py-20"
        aria-labelledby="books-catalog-heading"
      >
        <div className="space-y-3">
          <h2
            id="books-catalog-heading"
            className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl"
          >
            {filteredView ? "Filtered catalog" : "Complete catalog"}
          </h2>
          <p className="max-w-2xl text-muted">
            {filteredView
              ? "Refine by shelf, type, availability, or title search. Share the URL to preserve your view."
              : "Every published volume — filter, sort, or search when you know what you are looking for."}
          </p>
        </div>
        <div className="mt-10">
          <BooksCatalogControls
            initialState={urlState}
            results={results}
            filterOptions={filterOptions}
          />
        </div>
      </Section>
    </article>
  );
}

export async function generateMetadata({ searchParams }: BooksPageProps): Promise<Metadata> {
  const base = createPageMetadata({
    title: "Books",
    description:
      "Browse the After Certainty library by shelf — start here, core volumes, trust, systems, fiction, and the complete catalog.",
  });

  const sp = searchParams ? await searchParams : {};
  const hasFilters = Boolean(
    sp.shelf || sp.type || sp.status || sp.availability || sp.q || sp.sort || sp.editions,
  );

  if (!hasFilters) return base;

  return {
    ...base,
    alternates: {
      canonical: "/explore/books",
    },
  };
}
