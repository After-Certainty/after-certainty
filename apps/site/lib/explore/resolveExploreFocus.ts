import { resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import type { GraphIndex } from "@/lib/graph/graph";
import type { Book } from "@/types/semanticGraph";
import type { GraphEntityKind } from "@/types/semanticGraph";

const FOCUS_KINDS = new Set<GraphEntityKind>([
  "concept",
  "pattern",
  "situation",
  "book",
  "source",
  "thinker",
]);

export function isValidExploreFocusKind(v: string): v is GraphEntityKind {
  return FOCUS_KINDS.has(v as GraphEntityKind);
}

/**
 * Resolve `/explore?focusKind=&focusSlug=` to a canonical graph node id for the merged explore graph.
 */
export function resolveExploreFocusCanonicalId(
  index: GraphIndex,
  kind: GraphEntityKind,
  slug: string,
  books?: Book[],
): string | null {
  const s = slug.trim();
  if (!s) return null;
  switch (kind) {
    case "concept":
      return index.conceptBySlug.get(s)?.id ?? null;
    case "pattern":
      return index.patternBySlug.get(s)?.id ?? null;
    case "situation":
      return index.situationBySlug.get(s)?.id ?? null;
    case "source":
      return index.sourceBySlug.get(s)?.id ?? null;
    case "book": {
      const direct = index.bookBySlug.get(s)?.id;
      if (direct) return direct;
      if (books?.length) {
        const canonical = resolveBookCanonicalSlug(s, books) ?? s;
        return index.bookBySlug.get(canonical)?.id ?? null;
      }
      return null;
    }
    case "thinker":
      return index.thinkerBySlug.get(s)?.id ?? null;
  }
}
