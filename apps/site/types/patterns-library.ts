/**
 * Cross-book pattern library — normalized for `/patterns` and future ingestion (MDX, manifests, repos).
 */
export type LibraryPattern = {
  /** Stable unique key within the registry */
  id: string;
  slug: string;
  title: string;
  /** Longer observational text — primary body when expanded */
  description: string;
  /** Short line for cards and lists */
  summary?: string;
  bookSlug: string;
  bookTitle: string;
  themes: string[];
  excerpt?: string;
  relatedPatterns?: string[];
  /** Deep link when hosted elsewhere (e.g. book microsite pattern page) */
  href?: string;
};

export type PatternBookSection = {
  bookSlug: string;
  bookTitle: string;
  /** Optional editorial intro under the book heading */
  intro?: string;
  patterns: LibraryPattern[];
};
