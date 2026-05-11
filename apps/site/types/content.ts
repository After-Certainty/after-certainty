/**
 * Core content contracts for manifests produced by the books repo and local stubs.
 * Extend these interfaces as the publishing pipeline matures.
 */

/** Lifecycle / shelf status for catalog + detail views */
export type BookStatus =
  | "published"
  | "forthcoming"
  | "draft"
  | "in_progress"
  | "collaborative";

/** Editorial themes — shared vocabulary across the catalog */
export type ThemeTag = string;

export interface Author {
  name: string;
  role?: string;
}

export interface Book {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  status: BookStatus;
  year?: number;
  /** Path under `/public` or remote URL */
  coverImage?: string;
  /** Legacy source repo — prefer `githubUrl` when present */
  repositoryUrl?: string;
  authors: string[];
  /** legacy keyword tags — prefer `themes` for catalog display */
  tags?: string[];
  /** Editorial themes shown on `/books` */
  themes?: ThemeTag[];
  contributors?: string[];
  contributorCount?: number;
  /** Repo for this title when distinct from site root */
  githubUrl?: string;
  epubUrl?: string;
  /** Related listening — internal path or absolute URL */
  relatedPodcastHref?: string;
}

/** Works tracked outside the main `books` grid (lighter treatment on `/books`) */
export interface OngoingWork {
  id: string;
  title: string;
  description: string;
  /** `series` denotes episodic / conversational arcs outside a single manuscript */
  status: BookStatus | "series";
  kind?: "manuscript" | "collaborative" | "conversation" | "essay_cycle";
}

/** Root shape of `data/books-manifest.json` */
export interface BooksCatalogManifest {
  featuredSlug: string;
  books: Book[];
  ongoingWorks?: OngoingWork[];
}

/**
 * Normalized podcast episode — aligned with RSS ingestion (`lib/podcast`).
 * `id` is a stable slug derived from title for routing and keys.
 */
export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  audioUrl: string;
  episodeUrl: string;
  duration?: string;
  /** Episode artwork — `/public` path or remote URL (e.g. podcast host CDN) */
  image?: string;
}

export interface Pattern {
  slug: string;
  title: string;
  summary: string;
  domain?: string;
}

export interface Contributor {
  slug: string;
  name: string;
  role?: string;
  bio?: string;
  links?: { label: string; href: string }[];
}

export interface SiteManifest {
  books: Book[];
  podcastEpisodes: PodcastEpisode[];
  patterns: Pattern[];
  contributors: Contributor[];
}

/** Alias for publication pipeline docs */
export type PublicationStatus = BookStatus;
