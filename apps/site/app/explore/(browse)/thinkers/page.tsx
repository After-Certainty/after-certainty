import type { Metadata } from "next";
import { exploreIndexCatalogGridClassName } from "@/components/explore/explore-catalog-card";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { ExploreIndexPagination } from "@/components/explore/explore-index-pagination";
import { ExploreIndexSearch } from "@/components/explore/explore-index-search";
import { ThinkerCard } from "@/components/explore/thinker-card";
import { ThinkersCatalogControls } from "@/components/explore/thinkers-catalog-controls";
import { Section } from "@/components/ui/section";
import {
  exploreIndexCountLabel,
  filterExploreIndexItems,
  paginateExploreIndexItems,
  parseExploreIndexPage,
  type ExploreIndexItem,
} from "@/lib/explore/explore-index-browse";
import { applyThinkersCatalogQuery } from "@/lib/explore/thinkers-catalog-query";
import { parseThinkersCatalogUrlState } from "@/lib/explore/thinkers-catalog-url-state";
import { thinkersSortedForExploreIndex } from "@/lib/explore/explore-thinkers-order";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { explorePaths } from "@/lib/graph/explorePaths";
import { createPageMetadata } from "@/lib/metadata";
import type { Thinker } from "@/types/semanticGraph";

export const metadata: Metadata = createPageMetadata({
  title: "Thinkers",
  description:
    "People and institutions in the After Certainty semantic graph — intellectual voices anchored to works, concepts, and books.",
});

type ExploreThinkersIndexPageProps = {
  searchParams?: Promise<{ q?: string; page?: string; type?: string; sort?: string }>;
};

function thinkerBrowseItem(thinker: Thinker): ExploreIndexItem {
  return {
    id: thinker.id,
    slug: thinker.slug,
    label: thinker.name,
    href: `${explorePaths.thinkers}/${thinker.slug}`,
    searchText: [thinker.name, thinker.slug, thinker.type, thinker.summary, thinker.whyThisMatters]
      .filter(Boolean)
      .join(" "),
  };
}

function thinkerSuggestionItem(thinker: Thinker): ExploreIndexItem {
  return {
    id: thinker.id,
    slug: thinker.slug,
    label: thinker.name,
    href: `${explorePaths.thinkers}/${thinker.slug}`,
    searchText: [thinker.name, thinker.slug, thinker.type].join(" "),
  };
}

export default async function ExploreThinkersIndexPage({
  searchParams,
}: ExploreThinkersIndexPageProps) {
  const sp = searchParams ? await searchParams : {};
  const catalogState = parseThinkersCatalogUrlState({
    type: typeof sp.type === "string" ? sp.type : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
    q: typeof sp.q === "string" ? sp.q : undefined,
  });
  const q = catalogState.q;
  const requestedPage = parseExploreIndexPage(typeof sp.page === "string" ? sp.page : undefined);

  const { graph } = await getExploreSemanticGraph();
  const allThinkers = thinkersSortedForExploreIndex(graph);
  const typedSorted = applyThinkersCatalogQuery(allThinkers, catalogState);
  const browseItems = typedSorted.map(thinkerBrowseItem);
  const suggestionItems = allThinkers.map(thinkerSuggestionItem);
  const filteredItems = filterExploreIndexItems(browseItems, q);
  const slice = paginateExploreIndexItems(filteredItems, requestedPage);
  const thinkerById = new Map(typedSorted.map((t) => [t.id, t]));
  const pageThinkers = slice.items
    .map((item) => thinkerById.get(item.id))
    .filter((t): t is Thinker => t != null);

  const preserveParams: [string, string][] = [];
  if (catalogState.types.length > 0) preserveParams.push(["type", catalogState.types.join(",")]);
  if (catalogState.sort !== "recommended") preserveParams.push(["sort", catalogState.sort]);

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Voices"
        title="Thinkers"
        headingId="explore-thinkers-heading"
        density="editorial"
        countLabel={exploreIndexCountLabel(allThinkers.length, "thinker")}
        lede="Philosophers, social scientists, and institutions — grouped as people and organizations rather than individual bibliographic works."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-6 md:py-16">
        {allThinkers.length === 0 ? (
          <p className="text-muted">No thinkers are published in the manifest yet.</p>
        ) : (
          <>
            <ThinkersCatalogControls allThinkers={allThinkers} matchCount={slice.totalItems} />
            <div className="mt-6 md:mt-8">
              <ExploreIndexSearch
                items={suggestionItems}
                initialQuery={q}
                placeholder="Search thinkers…"
                label="Find a thinker"
              />
            </div>
            <p className="mt-6 text-sm text-muted" aria-live="polite">
              {q.trim()
                ? `${slice.totalItems} match${slice.totalItems === 1 ? "" : "es"} for “${q.trim()}”`
                : catalogState.types.length > 0 || catalogState.sort !== "recommended"
                  ? `${slice.totalItems} thinker${slice.totalItems === 1 ? "" : "s"}`
                  : `${slice.totalItems} thinkers`}
            </p>
            {pageThinkers.length === 0 ? (
              <p className="mt-8 text-muted">
                {q.trim() || catalogState.types.length > 0
                  ? "No thinkers match those filters."
                  : "No thinkers match that search."}
              </p>
            ) : (
              <div className={`mt-6 md:mt-8 ${exploreIndexCatalogGridClassName}`}>
                {pageThinkers.map((thinker) => (
                  <ThinkerCard key={thinker.id} thinker={thinker} />
                ))}
              </div>
            )}
            <ExploreIndexPagination
              pathname={explorePaths.thinkers}
              query={q}
              page={slice.page}
              totalPages={slice.totalPages}
              totalItems={slice.totalItems}
              startIndex={slice.startIndex}
              endIndex={slice.endIndex}
              label="Thinkers pagination"
              preserveParams={preserveParams}
            />
          </>
        )}
      </Section>
    </article>
  );
}
