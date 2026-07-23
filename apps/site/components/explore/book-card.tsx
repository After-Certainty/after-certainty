import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/types/semanticGraph";
import { ExploreCard } from "@/components/explore/explore-card";
import { explorePaths } from "@/lib/graph/explorePaths";

type BookCardProps = {
  book: Book;
  /** When set (e.g. from site catalog), shows the cover; otherwise uses `book.coverImage` from the manifest if present. */
  coverImage?: string | null;
};

export function BookCard({ book, coverImage: coverImageProp }: BookCardProps) {
  const coverSrc = coverImageProp ?? book.coverImage;

  return (
    <ExploreCard className="overflow-hidden p-0">
      <Link href={`${explorePaths.books}/${book.slug}`} className="group block">
        <div className="relative aspect-[2/3] w-full overflow-hidden border-b border-border/40 bg-bg-elevated/40">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt=""
              fill
              className="object-cover opacity-95 transition-opacity duration-500 group-hover:opacity-100"
              sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-accent/[0.12] via-bg-elevated to-bg transition-opacity duration-500 group-hover:from-accent/[0.16]"
              aria-hidden
            />
          )}
        </div>
        <div className="space-y-2 p-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-accent">Book</p>
          <h3 className="font-display text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent">
            {book.title}
          </h3>
          {book.subtitle ? <p className="text-sm text-muted">{book.subtitle}</p> : null}
          {book.summary ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted">{book.summary}</p>
          ) : null}
        </div>
      </Link>
    </ExploreCard>
  );
}
