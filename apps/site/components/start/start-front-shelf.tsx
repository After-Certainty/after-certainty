import Link from "next/link";
import { BookCoverThumbnail } from "@/components/books/book-cover-thumbnail";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import {
  buildCoverImageBySlugLookup,
  resolveCoverForGraphBookSlug,
} from "@/lib/explore/graph-book-covers";
import { explorePaths } from "@/lib/graph/explorePaths";
import { FRONT_SHELF_ENTRIES, FRONT_SHELF_INTRO } from "@/lib/start/front-shelf";

export async function StartFrontShelf() {
  const { graph, catalogBooks } = await getExploreSemanticGraph();
  const booksBySlug = new Map(graph.books.map((book) => [book.slug, book]));
  const coverLookup = buildCoverImageBySlugLookup(catalogBooks);

  return (
    <Section atmosphere="none" className="border-b border-border/35 bg-bg-elevated/[0.06] py-24 md:py-32">
      <Container>
        <h2 className="max-w-xl font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
          Front Shelf
        </h2>
        <p className="mt-5 max-w-2xl text-muted">{FRONT_SHELF_INTRO}</p>
        <ul className="mt-14 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {FRONT_SHELF_ENTRIES.map((entry) => {
            const book = booksBySlug.get(entry.slug);
            const title = book?.title ?? entry.slug;
            const coverSrc =
              resolveCoverForGraphBookSlug(coverLookup, catalogBooks, entry.slug) ??
              book?.coverImage ??
              null;
            const href = `${explorePaths.books}/${entry.slug}`;

            return (
              <li key={entry.slug}>
                <Link
                  href={href}
                  className="group flex h-full gap-4 overflow-hidden border border-border/50 bg-bg-elevated/20 p-4 transition-colors duration-300 hover:border-accent/30 hover:bg-bg-elevated/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex-col sm:gap-0 lg:flex-row lg:gap-3 lg:p-4"
                >
                  <BookCoverThumbnail
                    src={coverSrc}
                    size="compact"
                    className="sm:mx-auto lg:mx-0"
                  />
                  <div className="flex min-w-0 flex-1 flex-col sm:mt-4 lg:mt-0">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-accent">
                      {entry.doorwayLabel}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-medium leading-snug text-fg">
                      {title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-4">
                      {entry.description}
                    </p>
                    <span className="mt-4 text-[11px] uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg">
                      Open book →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
