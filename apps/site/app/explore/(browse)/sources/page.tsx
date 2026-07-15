import type { Metadata } from "next";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { ExploreIndexPagination } from "@/components/explore/explore-index-pagination";
import { ExploreIndexSearch } from "@/components/explore/explore-index-search";
import { SourceCard } from "@/components/explore/source-card";
import { Section } from "@/components/ui/section";
import {
  filterExploreIndexItems,
  paginateExploreIndexItems,
  parseExploreIndexPage,
  type ExploreIndexItem,
} from "@/lib/explore/explore-index-browse";
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
  searchParams?: Promise<{ q?: string; page?: string }>;
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
  const q = typeof sp.q === "string" ? sp.q : "";
  const requestedPage = parseExploreIndexPage(typeof sp.page === "string" ? sp.page : undefined);

  const { graph } = await getExploreSemanticGraph();
  const sources = sourcesSortedForExploreIndex(graph.sources);
  const browseItems = sources.map(sourceBrowseItem);
  const filteredItems = filterExploreIndexItems(browseItems, q);
  const slice = paginateExploreIndexItems(filteredItems, requestedPage);
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const pageSources = slice.items
    .map((item) => sourceById.get(item.id))
    .filter((s): s is Source => s != null);

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Works"
        title="Sources"
        headingId="explore-sources-heading"
        lede="Books, articles, reports, and other research works — bibliographic entries linked across the graph."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-14 md:py-20">
        {sources.length === 0 ? (
          <p className="text-muted">No sources are published in the manifest yet.</p>
        ) : (
          <>
            <ExploreIndexSearch
              items={sources.map(sourceSuggestionItem)}
              initialQuery={q}
              placeholder="Search sources…"
              label="Find a source"
            />
            <p className="mt-6 text-sm text-muted" aria-live="polite">
              {q.trim()
                ? `${slice.totalItems} match${slice.totalItems === 1 ? "" : "es"} for “${q.trim()}”`
                : `${slice.totalItems} sources`}
            </p>
            {pageSources.length === 0 ? (
              <p className="mt-8 text-muted">No sources match that search.</p>
            ) : (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
            />
          </>
        )}
      </Section>
    </article>
  );
}
