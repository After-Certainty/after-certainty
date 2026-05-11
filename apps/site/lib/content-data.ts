import booksCatalogFile from "@/data/books-manifest.json";
import contributorsData from "@/data/contributors.json";
import patternsData from "@/data/patterns.json";
import type {
  Book,
  BooksCatalogManifest,
  Contributor,
  OngoingWork,
  Pattern,
  PodcastEpisode,
} from "@/types/content";
import { mergeWhenOthersLookToYouCatalog } from "@/lib/books/when-others-look-to-you/catalog-sync";
import { getPodcastEpisodesFromRss } from "@/lib/podcast/rss";

const booksCatalog = booksCatalogFile as BooksCatalogManifest;

export function getBooksCatalog(): BooksCatalogManifest {
  return booksCatalog;
}

export function getBooks(): Book[] {
  return booksCatalog.books.map(mergeWhenOthersLookToYouCatalog);
}

export function getFeaturedCatalogBook(): Book | undefined {
  const { featuredSlug } = booksCatalog;
  return getBooks().find((b) => b.slug === featuredSlug);
}

/** Library grid: all catalog entries except the featured spotlight title */
export function getCatalogLibraryBooks(): Book[] {
  const { featuredSlug } = booksCatalog;
  return getBooks().filter((b) => b.slug !== featuredSlug);
}

export function getOngoingWorks(): OngoingWork[] {
  return booksCatalog.ongoingWorks ?? [];
}

export function getBookBySlug(slug: string): Book | undefined {
  return getBooks().find((b) => b.slug === slug);
}

/** Canonical on-site URL for a catalog book — some titles use a dedicated route subtree. */
export function getBookDetailHref(slug: string): string {
  if (slug === "when-others-look-to-you") {
    return "/books/when-others-look-to-you";
  }
  return `/books/${slug}`;
}

/** Episodes from Anchor RSS (hourly revalidation), with JSON fallback when the feed fails. */
export async function getPodcastEpisodes(): Promise<PodcastEpisode[]> {
  return getPodcastEpisodesFromRss();
}

export async function getEpisodeById(id: string): Promise<PodcastEpisode | undefined> {
  const episodes = await getPodcastEpisodes();
  return episodes.find((e) => e.id === id);
}

/** @deprecated Use getEpisodeById — `id` replaced former `slug` field */
export async function getEpisodeBySlug(slug: string): Promise<PodcastEpisode | undefined> {
  return getEpisodeById(slug);
}

export function getPatterns(): Pattern[] {
  return patternsData.patterns as Pattern[];
}

export function getContributors(): Contributor[] {
  return contributorsData.contributors as Contributor[];
}
