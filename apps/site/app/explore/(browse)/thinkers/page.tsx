import type { Metadata } from "next";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { ExploreIndexPagination } from "@/components/explore/explore-index-pagination";
import { ExploreIndexSearch } from "@/components/explore/explore-index-search";
import { ThinkerCard } from "@/components/explore/thinker-card";
import { Section } from "@/components/ui/section";
import {
  filterExploreIndexItems,
  paginateExploreIndexItems,
  parseExploreIndexPage,
  type ExploreIndexItem,
} from "@/lib/explore/explore-index-browse";
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
  searchParams?: Promise<{ q?: string; page?: string }>;
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
  const q = typeof sp.q === "string" ? sp.q : "";
  const requestedPage = parseExploreIndexPage(typeof sp.page === "string" ? sp.page : undefined);

  const { graph } = await getExploreSemanticGraph();
  const thinkers = thinkersSortedForExploreIndex(graph);
  const browseItems = thinkers.map(thinkerBrowseItem);
  const suggestionItems = thinkers.map(thinkerSuggestionItem);
  const filteredItems = filterExploreIndexItems(browseItems, q);
  const slice = paginateExploreIndexItems(filteredItems, requestedPage);
  const thinkerById = new Map(thinkers.map((t) => [t.id, t]));
  const pageThinkers = slice.items
    .map((item) => thinkerById.get(item.id))
    .filter((t): t is Thinker => t != null);

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Voices"
        title="Thinkers"
        headingId="explore-thinkers-heading"
        lede="Philosophers, social scientists, and institutions — grouped as people and organizations rather than individual bibliographic works."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-14 md:py-20">
        {thinkers.length === 0 ? (
          <p className="text-muted">No thinkers are published in the manifest yet.</p>
        ) : (
          <>
            <ExploreIndexSearch
              items={suggestionItems}
              initialQuery={q}
              placeholder="Search thinkers…"
              label="Find a thinker"
            />
            <p className="mt-6 text-sm text-muted" aria-live="polite">
              {q.trim()
                ? `${slice.totalItems} match${slice.totalItems === 1 ? "" : "es"} for “${q.trim()}”`
                : `${slice.totalItems} thinkers`}
            </p>
            {pageThinkers.length === 0 ? (
              <p className="mt-8 text-muted">No thinkers match that search.</p>
            ) : (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
            />
          </>
        )}
      </Section>
    </article>
  );
}
