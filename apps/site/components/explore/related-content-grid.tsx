import type { Book, GlossaryConcept, Pattern, Source, Thinker } from "@/types/semanticGraph";
import { BookCard } from "@/components/explore/book-card";
import { ConceptCard } from "@/components/explore/concept-card";
import { PatternCard } from "@/components/explore/pattern-card";
import { SourceCard } from "@/components/explore/source-card";
import { ThinkerCard } from "@/components/explore/thinker-card";
import {
  buildCoverImageBySlugLookup,
  resolveCoverForGraphBookSlug,
} from "@/lib/explore/graph-book-covers";

type RelatedContentGridProps = {
  heading?: string;
  concepts?: GlossaryConcept[];
  patterns?: Pattern[];
  books?: Book[];
  sources?: Source[];
  thinkers?: Thinker[];
  className?: string;
  /** When provided with graph `books`, resolves covers from slug + aliases. */
  booksForCovers?: Book[];
};

export function RelatedContentGrid({
  heading,
  concepts = [],
  patterns = [],
  books = [],
  sources = [],
  thinkers = [],
  className = "",
  booksForCovers,
}: RelatedContentGridProps) {
  const total = concepts.length + patterns.length + books.length + sources.length + thinkers.length;
  if (total === 0) return null;

  const coverLookup =
    booksForCovers && books.length > 0 ? buildCoverImageBySlugLookup(booksForCovers) : null;

  return (
    <section className={`space-y-6 ${className}`}>
      {heading ? (
        <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">{heading}</h2>
      ) : null}
      <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {concepts.map((c) => (
          <ConceptCard key={c.id} concept={c} />
        ))}
        {patterns.map((p) => (
          <PatternCard key={p.id} pattern={p} />
        ))}
        {books.map((b) => (
          <BookCard
            key={b.id}
            book={b}
            coverImage={
              coverLookup && booksForCovers
                ? (resolveCoverForGraphBookSlug(coverLookup, booksForCovers, b.slug) ??
                  b.coverImage)
                : undefined
            }
          />
        ))}
        {sources.map((s) => (
          <SourceCard key={s.id} source={s} />
        ))}
        {thinkers.map((thinker) => (
          <ThinkerCard key={thinker.id} thinker={thinker} />
        ))}
      </div>
    </section>
  );
}
