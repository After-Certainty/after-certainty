import type { MetadataRoute } from "next";
import { getAllPatterns } from "@/lib/books/when-others-look-to-you/content";
import { getBooks, getBookDetailHref } from "@/lib/content-data";
import { getLibraryPatterns } from "@/lib/patterns/registry";
import { resolveDeploymentUrl } from "@/lib/site-config";

/** Marketing and section landing pages */
const TOP_LEVEL_PATHS = [
  "/",
  "/start",
  "/books",
  "/podcast",
  "/patterns",
  "/collaborators",
  "/about",
] as const;

/** WoLTY microsite routes (excluding `/books/when-others-look-to-you`, covered via catalog canonical URL). */
const WOLTY_STATIC_PATHS = [
  "/books/when-others-look-to-you/idea",
  "/books/when-others-look-to-you/book",
  "/books/when-others-look-to-you/about",
  "/books/when-others-look-to-you/intro",
  "/books/when-others-look-to-you/patterns",
  "/books/when-others-look-to-you/resources",
] as const;

/**
 * All pathname segments to expose in sitemap.xml — deduped, stable order.
 * Keeps catalog books, book subsites, unified pattern library, and WoLTY pattern URLs.
 */
export async function getSitemapPaths(): Promise<string[]> {
  const paths: string[] = [];

  paths.push(...TOP_LEVEL_PATHS);

  const books = await getBooks();
  for (const book of books) {
    paths.push(getBookDetailHref(book.slug));
  }

  paths.push(...WOLTY_STATIC_PATHS);

  for (const p of getAllPatterns()) {
    paths.push(`/books/when-others-look-to-you/patterns/${p.slug}`);
  }

  for (const p of getLibraryPatterns()) {
    paths.push(`/patterns/${p.slug}`);
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
