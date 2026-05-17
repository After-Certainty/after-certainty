import contributorsData from "@/data/contributors.json";
import { getBooksCatalogCached } from "@/lib/books/manifest";
import { explorePaths } from "@/lib/graph/explorePaths";
import { getPodcastEpisodesFromRss } from "@/lib/podcast/rss";
import type {
  Book,
  BooksCatalogManifest,
  Contributor,
  OngoingWork,
  PodcastEpisode,
} from "@/types/content";
import { resolveBookCanonicalSlug } from "@/lib/books/generated-manifest";

async function loadMergedCatalog(): Promise<BooksCatalogManifest> {
  return getBooksCatalogCached();
}

export async function getBooksCatalog(): Promise<BooksCatalogManifest> {
  return loadMergedCatalog();
}

export async function getBooks(): Promise<Book[]> {
  return (await loadMergedCatalog()).books;
}

export async function getFeaturedCatalogBook(): Promise<Book | undefined> {
  const { featuredSlug, books } = await loadMergedCatalog();
  return books.find((b) => b.slug === featuredSlug);
}

/** Library grid: all catalog entries except the featured spotlight title */
export async function getCatalogLibraryBooks(): Promise<Book[]> {
  const { featuredSlug, books } = await loadMergedCatalog();
  return books.filter((b) => b.slug !== featuredSlug);
}

export async function getOngoingWorks(): Promise<OngoingWork[]> {
  const catalog = await getBooksCatalogCached();
  return catalog.ongoingWorks ?? [];
}

export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  const books = (await loadMergedCatalog()).books;
  const canonical = resolveBookCanonicalSlug(slug, books);
  if (canonical === undefined) return undefined;
  return books.find((b) => b.slug === canonical);
}

/** Canonical on-site URL for a catalog book in explore. */
export function getBookDetailHref(slug: string): string {
  return `${explorePaths.books}/${slug}`;
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

export function getContributors(): Contributor[] {
  return contributorsData.contributors as Contributor[];
}
