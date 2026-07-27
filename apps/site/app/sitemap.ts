import type { MetadataRoute } from "next";
import { bookIsPublic } from "@/lib/books/book-metadata";
import { getBooks } from "@/lib/content-data";
import { listChapterSitemapPaths } from "@/lib/corpus/public-registry";
import { getQuestionSitemapSlugs } from "@/lib/questions/loadQuestions";
import { getTrailSitemapSlugs } from "@/lib/trails/loadTrails";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { resolveThinkers } from "@/lib/graph/thinkers";
import { explorePaths } from "@/lib/graph/explorePaths";
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
  "/explore/books",
  "/explore/thinkers",
  "/explore/sources",
  "/search",
  "/podcast",
  "/whats-new",
  "/collaborators",
  "/about",
  "/privacy",
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

  const books = await getBooks();
  for (const book of books) {
    if (!bookIsPublic(book)) continue;
    paths.push(`${explorePaths.books}/${book.slug}`);
  }

  const graph = await getSemanticGraph();
  for (const concept of graph.glossary) {
    paths.push(`${explorePaths.concepts}/${concept.slug}`);
  }
  for (const pattern of graph.patterns) {
    paths.push(`${explorePaths.patterns}/${pattern.slug}`);
  }
  for (const situation of graph.situations ?? []) {
    paths.push(`${explorePaths.situations}/${situation.slug}`);
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
