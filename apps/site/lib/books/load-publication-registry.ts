import fallbackSemantic from "@/data/semantic-manifest.json";
import { publicationRegistryFromGraph } from "@/lib/graph/discovery";
import { validateSemanticGraph } from "@/lib/graph/validate";
import type {
  PublicationEdition,
  PublicationRegistry,
} from "@/lib/books/publication-registry-schema";
import type { SemanticGraph } from "@/types/semanticGraph";

function bundledRegistry(): PublicationRegistry {
  const result = validateSemanticGraph(fallbackSemantic as unknown);
  if (!result.success) {
    throw new Error("Bundled semantic-manifest.json failed validation for publication registry");
  }
  return publicationRegistryFromGraph(result.data);
}

/** Live graph → publication registry overlay shape. */
export function getPublicationRegistryFromGraph(graph: SemanticGraph): PublicationRegistry {
  return publicationRegistryFromGraph(graph);
}

/** Sync accessor for tests — uses the bundled manifest editions. */
export function getPublicationRegistry(): PublicationRegistry {
  return bundledRegistry();
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

/** Test helper — no-op (registry is derived). */
export function resetPublicationRegistryCacheForTests(): void {
  // Derived from bundled graph; nothing to clear.
}
