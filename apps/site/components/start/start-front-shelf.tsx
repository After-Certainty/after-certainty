import Link from "next/link";
import { BookCoverThumbnail } from "@/components/books/book-cover-thumbnail";
import { Container } from "@/components/ui/container";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { resolveBookCoverSrc } from "@/lib/books/resolve-book-cover";
import { explorePaths } from "@/lib/graph/explorePaths";
import { FRONT_SHELF_ENTRIES, FRONT_SHELF_INTRO } from "@/lib/start/front-shelf";

export async function StartFrontShelf() {
  const { graph } = await getExploreSemanticGraph();
  const booksBySlug = new Map(graph.books.map((book) => [book.slug, book]));

  return (
    <section className="border-b border-border/35 bg-bg-elevated/[0.06] py-6 md:py-28">
      <Container>
        <h2 className="max-w-xl font-display text-2xl font-medium tracking-tight text-fg md:text-4xl">
          Front Shelf
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted md:mt-5 md:text-base">{FRONT_SHELF_INTRO}</p>
        <ul className="mt-6 grid list-none gap-3 p-0 sm:grid-cols-2 md:mt-14 md:gap-5 lg:grid-cols-4 lg:gap-4">
          {FRONT_SHELF_ENTRIES.map((entry) => {
            const book = booksBySlug.get(entry.slug);
            const title = book?.title ?? entry.slug;
            const coverSrc = resolveBookCoverSrc(book, "thumbnail") ?? null;
            const href = `${explorePaths.books}/${entry.slug}`;

            return (
              <li key={entry.slug}>
                <Link
                  href={href}
                  className="group flex h-full gap-3 overflow-hidden border border-border/50 bg-bg-elevated/20 p-3.5 transition-colors duration-300 hover:border-accent/30 hover:bg-bg-elevated/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex-col sm:gap-0 md:gap-4 md:p-4 lg:flex-row lg:gap-3"
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
                    <h3 className="mt-1.5 font-display text-base font-medium leading-snug text-fg md:mt-2 md:text-lg">
                      {title}
                    </h3>
                    <p className="mt-1.5 flex-1 text-xs leading-snug text-muted line-clamp-3 md:mt-2 md:text-sm md:leading-relaxed md:line-clamp-4">
                      {entry.description}
                    </p>
                    <span className="mt-3 text-[10px] uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg md:mt-4 md:text-[11px]">
                      Open book →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
