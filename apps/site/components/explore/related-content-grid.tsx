import type { Book, GlossaryConcept, Pattern, Source, Thinker } from "@/types/semanticGraph";
import { BookCard } from "@/components/explore/book-card";
import { ConceptCard } from "@/components/explore/concept-card";
import { PatternCard } from "@/components/explore/pattern-card";
import { SourceCard } from "@/components/explore/source-card";
import { ThinkerCard } from "@/components/explore/thinker-card";

type RelatedContentGridProps = {
  heading?: string;
  concepts?: GlossaryConcept[];
  patterns?: Pattern[];
  books?: Book[];
  sources?: Source[];
  thinkers?: Thinker[];
  className?: string;
  /** @deprecated BookCard resolves covers via resolveBookCover; retained for call-site compat. */
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
}: RelatedContentGridProps) {
  const total = concepts.length + patterns.length + books.length + sources.length + thinkers.length;
  if (total === 0) return null;

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
          <BookCard key={b.id} book={b} />
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
