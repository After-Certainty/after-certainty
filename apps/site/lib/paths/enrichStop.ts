import { resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import { bookPublicationStatus, findBookBySlug } from "@/lib/books/book-metadata";
import { resolveBookCoverSrc } from "@/lib/books/resolve-book-cover";
import { chapterPublicPath } from "@/lib/graph/chapters";
import { exploreHrefForCanonicalId, explorePaths } from "@/lib/graph/explorePaths";
import { graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";
import { sourceDisplayTitle } from "@/lib/graph/presentation/sourceDisplay";
import {
  entityTypeLabel,
  normalizeBookEntityId,
  resolveBookSlugFromEntityId,
} from "@/lib/paths/validateStop";
import type { PodcastEpisode } from "@/types/content";
import type { EnrichedPathStop, PathStopInput } from "@/types/paths";
import type { Book, ManifestChapter } from "@/types/semanticGraph";

const DEFAULT_MINUTES: Record<string, number> = {
  book: 25,
  chapter: 10,
  concept: 5,
  pattern: 8,
  situation: 6,
  thinker: 5,
  source: 5,
  podcast_episode: 12,
  external: 10,
};

export function defaultMinutesForType(entityType: string): number {
  return DEFAULT_MINUTES[entityType] ?? 8;
}

function titleForGraphNode(index: GraphIndex, canonicalId: string): string {
  const node = index.getNodeByCanonicalId(canonicalId);
  if (!node) return canonicalId;
  if (node.kind === "source") return sourceDisplayTitle(node.entity);
  return graphNodeTitle(node);
}

export function enrichStop(
  stop: PathStopInput,
  index: GraphIndex,
  books: readonly Book[],
  podcastEpisodes: readonly PodcastEpisode[],
  chapters: readonly ManifestChapter[] = [],
): EnrichedPathStop {
  const minutes = stop.estimatedMinutes ?? defaultMinutesForType(stop.entityType);

  if (stop.entityType === "external") {
    return {
      ...stop,
      resolvedEntityId: stop.entityId ?? "external",
      title: stop.titleOverride ?? "External resource",
      href: stop.externalUrl ?? "#",
      external: true,
      entityTypeLabel: entityTypeLabel(stop.entityType),
      estimatedMinutes: minutes,
    };
  }

  if (stop.entityType === "podcast_episode") {
    const rawId = stop.entityId?.startsWith("podcast:")
      ? stop.entityId.slice("podcast:".length)
      : (stop.entityId ?? "");
    const episode = podcastEpisodes.find((e) => e.id === rawId);
    return {
      ...stop,
      resolvedEntityId: `podcast:${rawId}`,
      title: stop.titleOverride ?? episode?.title ?? rawId,
      href: episode?.episodeUrl ?? "/podcast",
      external: true,
      entityTypeLabel: entityTypeLabel(stop.entityType),
      estimatedMinutes: minutes,
    };
  }

  if (stop.entityType === "book") {
    const entityId = normalizeBookEntityId(stop) ?? stop.entityId ?? "";
    const slug = resolveBookSlugFromEntityId(entityId);
    const canonicalSlug = resolveBookCanonicalSlug(slug, books) ?? slug;
    const resolvedId =
      index.resolveCanonicalId(canonicalSlug) ??
      index.resolveCanonicalId(slug) ??
      index.resolveCanonicalId(entityId) ??
      entityId;
    const href = `${explorePaths.books}/${canonicalSlug}`;
    const graphBook = findBookBySlug(canonicalSlug, books);
    const graphTitle = titleForGraphNode(index, resolvedId);
    return {
      ...stop,
      resolvedEntityId: resolvedId,
      title: stop.titleOverride ?? graphBook?.title ?? graphTitle,
      href,
      external: false,
      entityTypeLabel: entityTypeLabel(stop.entityType),
      estimatedMinutes: minutes,
      bookStatus: graphBook ? bookPublicationStatus(graphBook) : undefined,
      coverImage: resolveBookCoverSrc(graphBook, "thumbnail"),
    };
  }

  if (stop.entityType === "chapter") {
    const entityId = stop.entityId ?? "";
    const chapter = chapters.find((c) => c.id === entityId);
    const href = chapter ? (chapterPublicPath(chapter) ?? explorePaths.home) : explorePaths.home;
    const chapterMinutes =
      stop.estimatedMinutes ??
      chapter?.estimatedReadingMinutes ??
      defaultMinutesForType("chapter");
    return {
      ...stop,
      resolvedEntityId: entityId,
      title: stop.titleOverride ?? chapter?.title ?? entityId,
      href,
      external: false,
      entityTypeLabel: entityTypeLabel(stop.entityType),
      estimatedMinutes: chapterMinutes,
    };
  }

  const entityId = stop.entityId ?? "";
  const resolvedId = index.resolveCanonicalId(entityId) ?? entityId;
  const href = exploreHrefForCanonicalId(index, resolvedId) ?? explorePaths.home;

  return {
    ...stop,
    resolvedEntityId: resolvedId,
    title: stop.titleOverride ?? titleForGraphNode(index, resolvedId),
    href,
    external: false,
    entityTypeLabel: entityTypeLabel(stop.entityType),
    estimatedMinutes: minutes,
  };
}

export function enrichPathStops(
  stops: PathStopInput[],
  index: GraphIndex,
  books: readonly Book[],
  podcastEpisodes: readonly PodcastEpisode[],
  chapters: readonly ManifestChapter[] = [],
): EnrichedPathStop[] {
  return [...stops]
    .sort((a, b) => a.position - b.position)
    .map((stop) => enrichStop(stop, index, books, podcastEpisodes, chapters));
}

export function totalEstimatedMinutes(stops: EnrichedPathStop[]): number {
  return stops.reduce((sum, stop) => sum + stop.estimatedMinutes, 0);
}
