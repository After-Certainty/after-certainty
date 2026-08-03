import type { Metadata } from "next";
import { exploreIndexCatalogGridClassName } from "@/components/explore/explore-catalog-card";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { ExploreIndexPagination } from "@/components/explore/explore-index-pagination";
import { ExploreIndexSearch } from "@/components/explore/explore-index-search";
import { SourceCard } from "@/components/explore/source-card";
import { SourcesCatalogControls } from "@/components/explore/sources-catalog-controls";
import { Section } from "@/components/ui/section";
import {
  exploreIndexCountLabel,
  filterExploreIndexItems,
  paginateExploreIndexItems,
  parseExploreIndexPage,
  type ExploreIndexItem,
} from "@/lib/explore/explore-index-browse";
import { applySourcesCatalogQuery } from "@/lib/explore/sources-catalog-query";
import { parseSourcesCatalogUrlState } from "@/lib/explore/sources-catalog-url-state";
import { sourcesSortedForExploreIndex } from "@/lib/explore/explore-sources-order";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { explorePaths } from "@/lib/graph/explorePaths";
import {
  sourceDisplayBody,
  sourceDisplayLabel,
  sourceDisplayTitle,
} from "@/lib/graph/sourceDisplay";
import { createPageMetadata } from "@/lib/metadata";
import type { Source } from "@/types/semanticGraph";

export const metadata: Metadata = createPageMetadata({
  title: "Sources",
  description:
    "Bibliographic sources in the After Certainty semantic graph — books, articles, reports, and other research works.",
});

type ExploreSourcesIndexPageProps = {
  searchParams?: Promise<{ q?: string; page?: string; kind?: string; sort?: string }>;
};

function sourceBrowseItem(source: Source): ExploreIndexItem {
  return {
    id: source.id,
    slug: source.slug,
    label: sourceDisplayTitle(source),
    href: `${explorePaths.sources}/${source.slug}`,
    searchText: [
      sourceDisplayTitle(source),
      source.name,
      source.slug,
      sourceDisplayLabel(source),
      source.type,
      source.sourceKind,
      sourceDisplayBody(source),
      ...(source.creatorNames ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function sourceSuggestionItem(source: Source): ExploreIndexItem {
  return {
    id: source.id,
    slug: source.slug,
    label: sourceDisplayTitle(source),
    href: `${explorePaths.sources}/${source.slug}`,
    searchText: [
      sourceDisplayTitle(source),
      source.name,
      source.slug,
      sourceDisplayLabel(source),
      ...(source.creatorNames ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  };
}

export default async function ExploreSourcesIndexPage({
  searchParams,
}: ExploreSourcesIndexPageProps) {
  const sp = searchParams ? await searchParams : {};
  const catalogState = parseSourcesCatalogUrlState({
    kind: typeof sp.kind === "string" ? sp.kind : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
    q: typeof sp.q === "string" ? sp.q : undefined,
  });
  const q = catalogState.q;
  const requestedPage = parseExploreIndexPage(typeof sp.page === "string" ? sp.page : undefined);

  const { graph } = await getExploreSemanticGraph();
  const allSources = sourcesSortedForExploreIndex(graph.sources);
  const typedSorted = applySourcesCatalogQuery(allSources, catalogState);
  const browseItems = typedSorted.map(sourceBrowseItem);
  const filteredItems = filterExploreIndexItems(browseItems, q);
  const slice = paginateExploreIndexItems(filteredItems, requestedPage);
  const sourceById = new Map(typedSorted.map((s) => [s.id, s]));
  const pageSources = slice.items
    .map((item) => sourceById.get(item.id))
    .filter((s): s is Source => s != null);

  const preserveParams: [string, string][] = [];
  if (catalogState.kinds.length > 0) preserveParams.push(["kind", catalogState.kinds.join(",")]);
  if (catalogState.sort !== "recommended") preserveParams.push(["sort", catalogState.sort]);

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Works"
        title="Sources"
        headingId="explore-sources-heading"
        density="editorial"
        countLabel={exploreIndexCountLabel(allSources.length, "source")}
        lede="Books, articles, reports, and other research works — bibliographic entries linked across the graph."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-6 md:py-16">
        {allSources.length === 0 ? (
          <p className="text-muted">No sources are published in the manifest yet.</p>
        ) : (
          <>
            <SourcesCatalogControls allSources={allSources} matchCount={slice.totalItems} />
            <div className="mt-6 md:mt-8">
              <ExploreIndexSearch
                items={allSources.map(sourceSuggestionItem)}
                initialQuery={q}
                placeholder="Search sources…"
                label="Find a source"
              />
            </div>
            <p className="mt-6 text-sm text-muted" aria-live="polite">
              {q.trim()
                ? `${slice.totalItems} match${slice.totalItems === 1 ? "" : "es"} for “${q.trim()}”`
                : catalogState.kinds.length > 0 || catalogState.sort !== "recommended"
                  ? `${slice.totalItems} source${slice.totalItems === 1 ? "" : "s"}`
                  : `${slice.totalItems} sources`}
            </p>
            {pageSources.length === 0 ? (
              <p className="mt-8 text-muted">
                {q.trim() || catalogState.kinds.length > 0
                  ? "No sources match those filters."
                  : "No sources match that search."}
              </p>
            ) : (
              <div className={`mt-6 md:mt-8 ${exploreIndexCatalogGridClassName}`}>
                {pageSources.map((s) => (
                  <SourceCard key={s.id} source={s} />
                ))}
              </div>
            )}
            <ExploreIndexPagination
              pathname={explorePaths.sources}
              query={q}
              page={slice.page}
              totalPages={slice.totalPages}
              totalItems={slice.totalItems}
              startIndex={slice.startIndex}
              endIndex={slice.endIndex}
              label="Sources pagination"
              preserveParams={preserveParams}
            />
          </>
        )}
      </Section>
    </article>
  );
}
