import type {
  Book,
  GlossaryConcept,
  ManifestSong,
  Pattern,
  Source,
  Thinker,
} from "@/types/semanticGraph";
import { BookCard } from "@/components/explore/book-card";
import { ConceptCard } from "@/components/explore/concept-card";
import { PatternCard } from "@/components/explore/pattern-card";
import { RelatedSectionDisclosure } from "@/components/explore/related-section-disclosure";
import { SongCard } from "@/components/explore/song-card";
import { SourceCard } from "@/components/explore/source-card";
import { ThinkerCard } from "@/components/explore/thinker-card";

type RelatedContentGridProps = {
  heading?: string;
  concepts?: GlossaryConcept[];
  patterns?: Pattern[];
  books?: Book[];
  sources?: Source[];
  thinkers?: Thinker[];
  songs?: ManifestSong[];
  className?: string;
  /**
   * Collapse behind RelatedSectionDisclosure on mobile (open from `md`).
   * Atlas detail Phase 3; book layouts keep the always-visible heading.
   */
  collapsible?: boolean;
  /** Stable id for the disclosure toggle (defaults from heading). */
  disclosureId?: string;
  /** @deprecated BookCard resolves covers via resolveBookCover; retained for call-site compat. */
  booksForCovers?: Book[];
};

function countPhrase(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function relatedGridCountLabel(parts: {
  concepts: number;
  patterns: number;
  books: number;
  sources: number;
  thinkers: number;
  songs: number;
}): string {
  const phrases = [
    parts.concepts > 0 ? countPhrase(parts.concepts, "concept", "concepts") : null,
    parts.patterns > 0 ? countPhrase(parts.patterns, "pattern", "patterns") : null,
    parts.books > 0 ? countPhrase(parts.books, "book", "books") : null,
    parts.songs > 0 ? countPhrase(parts.songs, "song", "songs") : null,
    parts.thinkers > 0 ? countPhrase(parts.thinkers, "thinker", "thinkers") : null,
    parts.sources > 0 ? countPhrase(parts.sources, "source", "sources") : null,
  ].filter((p): p is string => Boolean(p));

  if (phrases.length === 1) return phrases[0];
  const total =
    parts.concepts +
    parts.patterns +
    parts.books +
    parts.sources +
    parts.thinkers +
    parts.songs;
  return countPhrase(total, "related", "related");
}

function disclosureIdFromHeading(heading: string): string {
  const slug = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "related";
}

export function RelatedContentGrid({
  heading,
  concepts = [],
  patterns = [],
  books = [],
  sources = [],
  thinkers = [],
  songs = [],
  className = "",
  collapsible = false,
  disclosureId,
}: RelatedContentGridProps) {
  const total =
    concepts.length +
    patterns.length +
    books.length +
    sources.length +
    thinkers.length +
    songs.length;
  if (total === 0) return null;

  const cardLayout = collapsible ? "compact" : "responsive";
  const grid = (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {concepts.map((c) => (
        <ConceptCard key={c.id} concept={c} layout={cardLayout} />
      ))}
      {patterns.map((p) => (
        <PatternCard key={p.id} pattern={p} layout={cardLayout} />
      ))}
      {books.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
      {songs.map((song) => (
        <SongCard key={song.id} song={song} layout={cardLayout} />
      ))}
      {sources.map((s) => (
        <SourceCard key={s.id} source={s} layout={cardLayout} />
      ))}
      {thinkers.map((thinker) => (
        <ThinkerCard key={thinker.id} thinker={thinker} layout={cardLayout} />
      ))}
    </div>
  );

  const countLabel = relatedGridCountLabel({
    concepts: concepts.length,
    patterns: patterns.length,
    books: books.length,
    sources: sources.length,
    thinkers: thinkers.length,
    songs: songs.length,
  });

  if (collapsible && heading) {
    return (
      <RelatedSectionDisclosure
        id={disclosureId ?? disclosureIdFromHeading(heading)}
        title={heading}
        countLabel={countLabel}
        className={className}
      >
        {grid}
      </RelatedSectionDisclosure>
    );
  }

  return (
    <section className={`space-y-6 ${className}`.trim()}>
      {heading ? (
        <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">
          {heading}
          {collapsible ? (
            <span className="mt-0.5 block text-[11px] normal-case tracking-normal text-muted/80">
              {countLabel}
            </span>
          ) : null}
        </h2>
      ) : null}
      {grid}
    </section>
  );
}
