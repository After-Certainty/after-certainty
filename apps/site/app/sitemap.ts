import type { MetadataRoute } from "next";
import { bookIsPublic } from "@/lib/books/book-metadata";
import { getActiveShelves } from "@/lib/books/shelves";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { listChapterSitemapPaths } from "@/lib/corpus/public-registry";
import { gamePaths } from "@/lib/games/paths";
import { getPublishedChallenges } from "@/lib/games/pattern-recognition/load";
import { getQuestionSitemapSlugs } from "@/lib/questions/loadQuestions";
import { getTrailSitemapSlugs } from "@/lib/trails/loadTrails";
import { resolveThinkers } from "@/lib/graph/query/thinkers";
import { exploreBooksShelfHref, explorePaths } from "@/lib/graph/explorePaths";
import { resolveDeploymentUrl } from "@/lib/site-config";

/** Marketing and section landing pages */
const TOP_LEVEL_PATHS = [
  "/",
  "/start",
  "/questions",
  "/trails",
  "/explore",
  "/explore/concepts",
  "/explore/patterns",
  "/explore/situations",
  "/explore/songs",
  "/explore/books",
  "/explore/thinkers",
  "/explore/sources",
  "/search",
  "/podcast",
  "/listen",
  "/whats-new",
  "/collaborators",
  "/about",
  "/privacy",
  gamePaths.home,
  gamePaths.patternRecognition,
] as const;

/**
 * Prefer manifest `generatedAt` for a stable lastmod across requests in the same build;
 * fall back to "now" only when provenance is missing.
 */
export function resolveSitemapLastModified(generatedAt: string | undefined): Date {
  if (generatedAt?.trim()) {
    const parsed = Date.parse(generatedAt);
    if (!Number.isNaN(parsed)) return new Date(parsed);
  }
  return new Date();
}

/**
 * All pathname segments to expose in sitemap.xml — deduped, stable order.
 * Uses explore as canonical for books and patterns.
 */
export async function getSitemapPaths(): Promise<string[]> {
  const paths: string[] = [];

  paths.push(...TOP_LEVEL_PATHS);

  const graph = await getSemanticGraph();
  for (const book of graph.books) {
    if (!bookIsPublic(book)) continue;
    paths.push(`${explorePaths.books}/${book.slug}`);
  }

  for (const shelf of getActiveShelves(graph)) {
    paths.push(exploreBooksShelfHref(shelf.slug));
  }
  for (const concept of graph.glossary) {
    paths.push(`${explorePaths.concepts}/${concept.slug}`);
  }
  for (const pattern of graph.patterns) {
    paths.push(`${explorePaths.patterns}/${pattern.slug}`);
  }
  for (const situation of graph.situations ?? []) {
    paths.push(`${explorePaths.situations}/${situation.slug}`);
  }
  for (const song of graph.songs ?? []) {
    paths.push(`${explorePaths.songs}/${song.slug}`);
  }
  for (const source of graph.sources) {
    paths.push(`${explorePaths.sources}/${source.slug}`);
  }
  for (const thinker of resolveThinkers(graph)) {
    paths.push(`${explorePaths.thinkers}/${thinker.slug}`);
  }

  for (const slug of getQuestionSitemapSlugs(graph)) {
    paths.push(`/questions/${slug}`);
  }

  for (const slug of getTrailSitemapSlugs(graph)) {
    paths.push(`/trails/${slug}`);
  }

  for (const challenge of getPublishedChallenges(graph)) {
    paths.push(gamePaths.challenge(challenge.slug));
  }

  paths.push(...listChapterSitemapPaths(graph));

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const path of paths) {
    if (!seen.has(path)) {
      seen.add(path);
      unique.push(path);
    }
  }
  return unique;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = resolveDeploymentUrl();
  const graph = await getSemanticGraph();
  const lastModified = resolveSitemapLastModified(graph.generatedAt);
  const pathList = await getSitemapPaths();

  return pathList.map((path) => ({
    url: `${base}${path}`,
    lastModified,
  }));
}
