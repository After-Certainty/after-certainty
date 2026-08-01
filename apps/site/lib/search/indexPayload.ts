import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { getSearchAliasConfigFromGraph } from "@/lib/search/aliases";
import { getSearchDocuments } from "@/lib/search/getSearchDocuments";
import { joinSearchText, uniqueStrings } from "@/lib/search/text";
import type { SearchAliasConfig, SearchDocument } from "@/lib/search/types";

/** Wire format for `GET /api/search/index`. */
export type SearchIndexPayload = {
  version: 1;
  generatedAt: string;
  documentCount: number;
  documents: SearchDocument[];
  /** Authored alias/related bridge — public vocabulary, not a second corpus. */
  aliasConfig: SearchAliasConfig;
};

/**
 * Drop searchText lines already present in dedicated MiniSearch fields so the
 * transferable corpus stays lean without losing match coverage.
 */
function leanSearchTextForWire(document: SearchDocument): string {
  const skip = new Set(
    uniqueStrings([
      document.title,
      document.subtitle,
      document.description,
      document.slug,
      ...(document.aliases ?? []),
      ...(document.creatorNames ?? []),
      ...(document.relatedTitles ?? []),
      ...(document.themes ?? []),
    ]).map((value) => value.toLowerCase()),
  );

  const kept: string[] = [];
  for (const line of document.searchText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (skip.has(trimmed.toLowerCase())) continue;
    kept.push(trimmed);
  }
  return joinSearchText(kept);
}

/**
 * Map a rich builder document to the transferable API shape.
 * Omits fields unused by MiniSearch matching, result UI, or explanations.
 */
export function toSearchIndexWireDocument(document: SearchDocument): SearchDocument {
  const wire: SearchDocument = {
    id: document.id,
    entityType: document.entityType,
    slug: document.slug,
    title: document.title,
    resultLabel: document.resultLabel,
    canonicalUrl: document.canonicalUrl,
    visibility: document.visibility,
    searchText: leanSearchTextForWire(document),
    aliases: document.aliases,
    boostWeight: document.boostWeight,
    sourceArtifact: document.sourceArtifact,
  };

  if (document.subtitle) wire.subtitle = document.subtitle;
  if (document.description) wire.description = document.description;
  if (document.external) wire.external = document.external;
  if (document.image) wire.image = document.image;
  if (document.status) wire.status = document.status;
  if (document.edition) wire.edition = document.edition;
  if (document.isCanonicalEdition !== undefined) {
    wire.isCanonicalEdition = document.isCanonicalEdition;
  }
  if (document.contextLabel) wire.contextLabel = document.contextLabel;
  if (document.creatorNames?.length) wire.creatorNames = document.creatorNames;
  if (document.relatedTitles?.length) wire.relatedTitles = document.relatedTitles;
  if (document.themes?.length) wire.themes = document.themes;
  if (document.bookIds?.length) wire.bookIds = document.bookIds;
  if (document.relationshipDensity !== undefined) {
    wire.relationshipDensity = document.relationshipDensity;
  }

  return wire;
}

export function buildSearchIndexPayload(
  documents: readonly SearchDocument[],
  aliasConfig: SearchAliasConfig,
  generatedAt: string = new Date().toISOString(),
): SearchIndexPayload {
  return {
    version: 1,
    generatedAt,
    documentCount: documents.length,
    documents: documents.map(toSearchIndexWireDocument),
    aliasConfig,
  };
}

/** Build the searchable index payload from the same-checkout semantic graph. */
export async function getSearchIndexPayload(): Promise<SearchIndexPayload> {
  const [{ graph }, documents] = await Promise.all([
    getExploreSemanticGraph(),
    getSearchDocuments(),
  ]);
  return buildSearchIndexPayload(documents, getSearchAliasConfigFromGraph(graph));
}
