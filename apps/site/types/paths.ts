export type PathEntityType =
  | "book"
  | "concept"
  | "pattern"
  | "situation"
  | "thinker"
  | "source"
  | "podcast_episode"
  | "external";

/** Inline path stop on a question or trail (shared segment shape). */
export type PathStopInput = {
  position: number;
  entityType: PathEntityType;
  entityId?: string;
  bookSlug?: string;
  externalUrl?: string;
  titleOverride?: string;
  description: string;
  whyThisFollows?: string;
  estimatedMinutes?: number;
  optional?: boolean;
  excerpt?: string;
  fictionDoorway?: boolean;
};

export type EnrichedPathStop = PathStopInput & {
  resolvedEntityId: string;
  title: string;
  href: string;
  external: boolean;
  entityTypeLabel: string;
  estimatedMinutes: number;
  /** Catalog publication status when stop is a book. */
  bookStatus?: "published" | "forthcoming" | "draft" | "in_progress" | "collaborative";
  coverImage?: string;
};
