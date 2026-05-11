import contributorsData from "@/data/contributors.json";
import patternsData from "@/data/patterns.json";
import {
  resolveBookCanonicalSlug,
  WOLTY_MICROSITE_PATH,
  WOLTY_PUBLIC_ALIAS,
  WOLTY_V1_SLUG,
} from "@/lib/books/generated-manifest";
import { getBooksCatalogCached } from "@/lib/books/manifest";
import { mergeWhenOthersLookToYouCatalog } from "@/lib/books/when-others-look-to-you/catalog-sync";
import { getPodcastEpisodesFromRss } from "@/lib/podcast/rss";
import type {
  Book,
  BooksCatalogManifest,
  Contributor,
  OngoingWork,
  Pattern,
  PodcastEpisode,
} from "@/types/content";

async function loadMergedCatalog(): Promise<BooksCatalogManifest> {
  const catalog = await getBooksCatalogCached();
  return {
    ...catalog,
    books: catalog.books.map(mergeWhenOthersLookToYouCatalog),
  };
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

/** Canonical on-site URL for a catalog book — WoLTY v1 and its public alias use the microsite. */
export function getBookDetailHref(slug: string): string {
  if (slug === WOLTY_PUBLIC_ALIAS || slug === WOLTY_V1_SLUG) {
    return WOLTY_MICROSITE_PATH;
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
