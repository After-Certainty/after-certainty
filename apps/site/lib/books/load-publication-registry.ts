import { publicationRegistryFromGraph } from "@/lib/graph/discovery";
import { loadInstalledSemanticGraphSync } from "@/lib/graph/installed-manifest";
import type {
  PublicationEdition,
  PublicationRegistry,
} from "@/lib/books/publication-registry-schema";
import type { SemanticGraph } from "@/types/semanticGraph";

/** Live graph → publication registry overlay shape. */
export function getPublicationRegistryFromGraph(graph: SemanticGraph): PublicationRegistry {
  return publicationRegistryFromGraph(graph);
}

/** Sync accessor — uses the installed local manifest when no graph is passed. */
export function getPublicationRegistry(graph?: SemanticGraph): PublicationRegistry {
  return publicationRegistryFromGraph(graph ?? loadInstalledSemanticGraphSync());
}

export function getPublicationEditionByBookId(
  bookId: string,
  graph?: SemanticGraph,
): PublicationEdition | undefined {
  return getPublicationRegistry(graph).editions.find((e) => e.bookId === bookId);
}

export function getPublicationEditionBySlug(
  slug: string,
  graph?: SemanticGraph,
): PublicationEdition | undefined {
  return getPublicationRegistry(graph).editions.find((e) => e.slug === slug);
}

export function getPublicationEditionsForWork(
  workId: string,
  graph?: SemanticGraph,
): PublicationEdition[] {
  return getPublicationRegistry(graph).editions.filter((e) => e.workId === workId);
}

/** Test helper — no-op (registry is derived). */
export function resetPublicationRegistryCacheForTests(): void {
  // Derived from installed graph; nothing to clear.
}
