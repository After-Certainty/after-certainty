import type { SourceKind } from "@/types/semanticGraph";
import { formatRelationshipLabelForDisplay } from "@/lib/graph/relationshipVisuals";

/** Canonical sourceKind values used as filter facets. */
export const SOURCE_KIND_FACET_ORDER: readonly SourceKind[] = [
  "book",
  "article",
  "report",
  "standard",
  "dataset",
  "speech",
  "case",
  "website",
  "institutional_document",
];

const SOURCE_KIND_SET = new Set<string>(SOURCE_KIND_FACET_ORDER);

export function isSourceKindFacet(value: string): value is SourceKind {
  return SOURCE_KIND_SET.has(value);
}

export function sourceKindFacetLabel(kind: string): string {
  return formatRelationshipLabelForDisplay(kind);
}

/** Prefer canonical `sourceKind`; fall back to legacy `type` when kind is absent. */
export function sourceKindForFacet(source: {
  sourceKind?: string;
  type: string;
}): string {
  const kind = source.sourceKind?.trim();
  if (kind) return kind;
  return source.type.trim();
}
