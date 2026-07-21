import { deriveFeaturedBookSlug, resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import { findBookBySlug } from "@/lib/books/book-metadata";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { explorePaths } from "@/lib/graph/explorePaths";
import { getPodcastEpisodesFromRss } from "@/lib/podcast/rss";
import type { BookStatus, Contributor, OngoingWork, PodcastEpisode } from "@/types/content";
import type { Book } from "@/types/semanticGraph";
import contributorsData from "@/data/contributors.json";

export async function getBooks(): Promise<Book[]> {
  const graph = await getSemanticGraph();
  return graph.books;
}

export async function getFeaturedBook(): Promise<Book | undefined> {
  const books = await getBooks();
  const featuredSlug = deriveFeaturedBookSlug(books);
  return books.find((b) => b.slug === featuredSlug);
}

/** @deprecated No separate books manifest — ongoing works may ship on semantic manifest later. */
export async function getOngoingWorks(): Promise<OngoingWork[]> {
  return [];
}

export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  const books = await getBooks();
  const canonical = resolveBookCanonicalSlug(slug, books);
  if (canonical === undefined) return findBookBySlug(slug, books);
  return books.find((b) => b.slug === canonical);
}

/** Canonical on-site URL for a book in explore. */
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

/** Re-export for path validation that checks published status. */
export type { BookStatus };
