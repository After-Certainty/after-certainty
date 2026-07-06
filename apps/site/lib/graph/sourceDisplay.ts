import { explorePaths } from "@/lib/graph/explorePaths";
import { getThinkerBySlug } from "@/lib/graph/graphQueries";
import type { SemanticGraph, Source, Thinker } from "@/types/semanticGraph";

export function sourceDisplayTitle(source: Source): string {
  return source.title?.trim() || source.name;
}

export function sourceDisplayLabel(source: Source): string {
  return source.sourceKind?.trim() || source.type;
}

export function sourceDisplayBody(source: Source): string | undefined {
  return source.citation?.trim() || source.summary?.trim() || undefined;
}

export function sourceCreatorThinkerLinks(graph: SemanticGraph, source: Source): Thinker[] {
  const slugs = source.creatorSlugs ?? [];
  const thinkers: Thinker[] = [];
  const seen = new Set<string>();

  for (const slug of slugs) {
    const trimmed = slug.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    const thinker = getThinkerBySlug(graph, trimmed);
    if (!thinker) continue;
    seen.add(trimmed);
    thinkers.push(thinker);
  }

  return thinkers;
}

export function thinkerHref(slug: string): string {
  return `${explorePaths.thinkers}/${slug}`;
}
