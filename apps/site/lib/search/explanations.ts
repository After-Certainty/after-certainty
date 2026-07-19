import { relatedTermsByTargetId } from "@/lib/search/aliases";
import type { SearchAliasConfig, SearchDocument } from "@/lib/search/types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Human-readable relevance labels for a hit. Never includes raw scores.
 * Only claims supported by document metadata + optional alias config.
 */
export function explainSearchMatch(
  query: string,
  document: SearchDocument,
  options?: { aliasConfig?: SearchAliasConfig },
): string[] {
  const q = normalize(query);
  if (!q) return [];

  const labels: string[] = [];
  const title = normalize(document.title);
  const subtitle = document.subtitle ? normalize(document.subtitle) : "";

  if (title === q) {
    labels.push("Exact title match");
  } else if (title.startsWith(q) || title.includes(q)) {
    labels.push("Title match");
  } else if (subtitle && (subtitle === q || subtitle.includes(q))) {
    labels.push("Subtitle match");
  }

  const aliases = Array.isArray(document.aliases) ? document.aliases : [];
  const aliasHit = aliases.find((alias) => {
    const a = normalize(alias);
    return a === q || a.includes(q) || q.includes(a);
  });
  if (aliasHit) {
    labels.push(`Also known as “${aliasHit}”`);
  }

  if (options?.aliasConfig) {
    const related = relatedTermsByTargetId(options.aliasConfig).get(document.id) ?? [];
    const relatedHit = related.find((term) => {
      const t = normalize(term);
      return t === q || q.includes(t) || t.includes(q);
    });
    if (relatedHit) {
      labels.push(`Related to “${relatedHit}”`);
    }
  }

  const creatorNames = Array.isArray(document.creatorNames) ? document.creatorNames : [];
  if (creatorNames.some((name) => normalize(name).includes(q) || q.includes(normalize(name)))) {
    labels.push("Creator match");
  }

  if (document.entityType === "book" && document.edition) {
    if (document.isCanonicalEdition === false) {
      labels.push("Another edition");
    } else if (document.isCanonicalEdition) {
      labels.push(`Edition ${document.edition}`);
    }
  }

  if (document.status === "forthcoming") {
    labels.push("Forthcoming");
  } else if (document.status === "draft" || document.status === "in_progress") {
    labels.push("In progress");
  }

  if (document.external) {
    labels.push("External link");
  }

  if (
    document.entityType === "concept" &&
    document.bookIds &&
    document.bookIds.length >= 2 &&
    (title.includes(q) || aliasHit)
  ) {
    labels.push(`Linked from ${document.bookIds.length} books`);
  }

  if (document.entityType === "thinker" && (title.includes(q) || aliasHit)) {
    const works = document.relationshipDensity ?? 0;
    if (works >= 2) {
      labels.push(`Connected across ${works} related works`);
    }
  }

  // Deduplicate while preserving order
  const seen = new Set<string>();
  return labels.filter((label) => {
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
}
