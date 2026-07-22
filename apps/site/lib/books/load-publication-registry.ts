import publicationRegistryJson from "@/data/publication-registry.json";
import {
  parsePublicationRegistry,
  type PublicationEdition,
  type PublicationRegistry,
} from "@/lib/books/publication-registry-schema";

let cached: PublicationRegistry | null = null;

/** Parse and cache the site-authored publication registry (Phase A overlay). */
export function getPublicationRegistry(): PublicationRegistry {
  if (!cached) {
    cached = parsePublicationRegistry(publicationRegistryJson);
  }
  return cached;
}

export function getPublicationEditionByBookId(bookId: string): PublicationEdition | undefined {
  return getPublicationRegistry().editions.find((e) => e.bookId === bookId);
}

export function getPublicationEditionBySlug(slug: string): PublicationEdition | undefined {
  return getPublicationRegistry().editions.find((e) => e.slug === slug);
}

export function getPublicationEditionsForWork(workId: string): PublicationEdition[] {
  return getPublicationRegistry().editions.filter((e) => e.workId === workId);
}

/** Test helper — clears the parse cache. */
export function resetPublicationRegistryCacheForTests(): void {
  cached = null;
}
