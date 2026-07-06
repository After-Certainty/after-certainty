import type { MetadataRoute } from "next";
import { getBooks } from "@/lib/content-data";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { resolveThinkers } from "@/lib/graph/thinkers";
import { explorePaths } from "@/lib/graph/explorePaths";
import { resolveDeploymentUrl } from "@/lib/site-config";

/** Marketing and section landing pages */
const TOP_LEVEL_PATHS = [
  "/",
  "/start",
  "/explore",
  "/explore/concepts",
  "/explore/patterns",
  "/explore/books",
  "/explore/thinkers",
  "/explore/sources",
  "/podcast",
  "/collaborators",
  "/about",
] as const;

/**
 * All pathname segments to expose in sitemap.xml — deduped, stable order.
 * Uses explore as canonical for books and patterns.
 */
export async function getSitemapPaths(): Promise<string[]> {
  const paths: string[] = [];

  paths.push(...TOP_LEVEL_PATHS);

  const books = await getBooks();
  for (const book of books) {
    paths.push(`${explorePaths.books}/${book.slug}`);
  }

  const graph = await getSemanticGraph();
  for (const concept of graph.glossary) {
    paths.push(`${explorePaths.concepts}/${concept.slug}`);
  }
  for (const pattern of graph.patterns) {
    paths.push(`${explorePaths.patterns}/${pattern.slug}`);
  }
  for (const source of graph.sources) {
    paths.push(`${explorePaths.sources}/${source.slug}`);
  }
  for (const thinker of resolveThinkers(graph)) {
    paths.push(`${explorePaths.thinkers}/${thinker.slug}`);
  }

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
  const lastModified = new Date();
  const pathList = await getSitemapPaths();

  return pathList.map((path) => ({
    url: `${base}${path}`,
    lastModified,
  }));
}
