import type { Metadata } from "next";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { BookCard } from "@/components/explore/book-card";
import { Section } from "@/components/ui/section";
import { booksSortedForExploreIndex } from "@/lib/explore/explore-books-order";
import {
  buildCoverImageBySlugLookup,
  resolveCoverForGraphBookSlug,
} from "@/lib/explore/graph-book-covers";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Books",
  description: "Books in the After Certainty semantic graph — traverse concepts, patterns, and thinkers anchored to each volume.",
});

export default async function ExploreBooksIndexPage() {
  const { graph, catalogBooks } = await getExploreSemanticGraph();
  const coverLookup = buildCoverImageBySlugLookup(catalogBooks);
  const books = booksSortedForExploreIndex(graph.books);

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Volumes"
        title="Books"
        headingId="explore-books-heading"
        lede="Each book is a traversal through shared terrain — concepts, patterns, and voices woven into one manuscript."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-14 md:py-20">
        {books.length === 0 ? (
          <p className="text-muted">No books are linked in the semantic manifest yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((b) => (
              <BookCard
                key={b.id}
                book={b}
                coverImage={resolveCoverForGraphBookSlug(coverLookup, catalogBooks, b.slug) ?? b.coverImage}
              />
            ))}
          </div>
        )}
      </Section>
    </article>
  );
}
