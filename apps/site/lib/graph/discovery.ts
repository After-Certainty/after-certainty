import {
  DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS,
  type BookOverview,
} from "@/lib/books/book-overview-schema";
import {
  isFictionDoorwayStop,
  primaryActionPreferenceForSlug,
} from "@/lib/books/presentation-overlays";
import type {
  PublicationEdition,
  PublicationRegistry,
} from "@/lib/books/publication-registry-schema";
import type { ContentType } from "@/lib/books/catalog-taxonomy";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";
import type { PathStopInput } from "@/types/paths";
import type { QuestionDefinition } from "@/types/questions";
import type { TrailDefinition } from "@/types/trails";
import type {
  Book,
  ChangeEvent,
  DiscoveryPathStop,
  ManifestQuestion,
  ManifestTrail,
  SemanticGraph,
} from "@/types/semanticGraph";

function toPathStopInput(stop: DiscoveryPathStop, options?: { trailSlug?: string }): PathStopInput {
  const fictionDoorway =
    stop.fictionDoorway ||
    (options?.trailSlug ? isFictionDoorwayStop(options.trailSlug, stop.position) : false);

  return {
    position: stop.position,
    entityType: stop.entityType,
    entityId: stop.entityId,
    bookSlug: stop.bookSlug,
    externalUrl: stop.externalUrl,
    titleOverride: stop.titleOverride,
    description: stop.description,
    whyThisFollows: stop.whyThisFollows,
    estimatedMinutes: stop.estimatedMinutes,
    optional: stop.optional,
    excerpt: stop.excerpt,
    fictionDoorway: fictionDoorway || undefined,
  };
}

export function questionFromManifest(question: ManifestQuestion): QuestionDefinition {
  return {
    id: question.id,
    slug: question.slug,
    question: question.question,
    shortLabel: question.shortLabel,
    summary: question.summary,
    orientation: question.orientation,
    whatThisIsNot: question.whatThisIsNot,
    status: question.status,
    featured: question.featured,
    featuredRank: question.featuredRank,
    families: question.families,
    primaryBookId: question.primaryBookId,
    relatedQuestionIds: question.relatedQuestionIds,
    pathStops: question.pathStops.map((stop) => toPathStopInput(stop)),
    closingReflection: question.closingReflection,
    carryForwardQuestion: question.carryForwardQuestion,
    searchHints: question.searchHints,
    createdDate: question.createdDate,
    updatedDate: question.updatedDate,
    editorialOwner: question.editorialOwner,
    reviewNotes: question.reviewNotes,
  };
}

export function questionsFromGraph(graph: SemanticGraph): QuestionDefinition[] {
  return (graph.questions ?? []).map(questionFromManifest);
}

export function trailFromManifest(trail: ManifestTrail): TrailDefinition {
  return {
    id: trail.id,
    slug: trail.slug,
    title: trail.title,
    summary: trail.summary,
    orientation: trail.orientation,
    status: trail.status,
    featured: trail.featured,
    featuredRank: trail.featuredRank,
    themes: trail.themes,
    audience: trail.audience,
    depth: trail.depth,
    primaryBookId: trail.primaryBookId,
    pathStops: trail.pathStops.map((stop) => toPathStopInput(stop, { trailSlug: trail.slug })),
    closingReflection: trail.closingReflection,
    suggestedContinuation: trail.suggestedContinuation,
    relatedTrailIds: trail.relatedTrailIds,
    createdDate: trail.createdDate,
    updatedDate: trail.updatedDate,
    reviewNotes: trail.reviewNotes,
  };
}

export function trailsFromGraph(graph: SemanticGraph): TrailDefinition[] {
  return (graph.trails ?? []).map(trailFromManifest);
}

export function editionFromManifest(
  edition: NonNullable<SemanticGraph["editions"]>[number],
): PublicationEdition {
  return {
    bookId: edition.bookId,
    slug: edition.slug,
    workId: edition.workId,
    isCanonical: edition.isCanonical,
    relationship: edition.relationship,
    editionLabel: edition.editionLabel,
    companionEditionIds: edition.companionEditionIds,
    companionOfEditionId: edition.companionOfEditionId,
    supersededByEditionId: edition.supersededByEditionId,
    replacesEditionId: edition.replacesEditionId,
    firstPublishedAt: edition.firstPublishedAt,
    revisedAt: edition.revisedAt,
    changeSummary: edition.changeSummary,
  };
}

export function publicationRegistryFromGraph(graph: SemanticGraph): PublicationRegistry {
  const editions = (graph.editions ?? []).map(editionFromManifest);
  return {
    manifestVersion: 1,
    editions,
  };
}

export function bookOverviewFromBook(book: Book): BookOverview | undefined {
  const overview = book.overview;
  if (!overview) return undefined;

  return {
    bookId: book.id,
    slug: book.slug,
    centralQuestion: overview.centralQuestion,
    whyItExists: overview.whyItExists,
    audience: overview.audience,
    nonGoals: overview.nonGoals,
    selectedConceptIds: overview.selectedConceptIds ?? [],
    selectedPatternIds: overview.selectedPatternIds,
    readBefore: overview.readBefore,
    readNext: overview.readNext,
    revisedAt: overview.revisedAt,
    changeSummary: overview.changeSummary,
    primaryActionPreference: primaryActionPreferenceForSlug(book.slug),
  };
}

export function bookOverviewsFromGraph(graph: SemanticGraph): BookOverview[] {
  return graph.books
    .map(bookOverviewFromBook)
    .filter((overview): overview is BookOverview => Boolean(overview));
}

export function bookOverviewPrioritySlugs(): string[] {
  return [...DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS];
}

export function changeEventToWhatsNewEvent(event: ChangeEvent): WhatsNewEvent | null {
  const href = event.canonicalRoute;
  if (!href) return null;

  return {
    id: event.id,
    type: event.type,
    title: event.title,
    summary: event.summary,
    date: event.date,
    entityType: event.entityType,
    entityId: event.entityId,
    href,
    image: event.coverImage,
    featured: event.featured,
    significance: event.significance,
    relatedEditionId: event.relatedEditionId,
    visibility: event.visibility,
    source: event.source,
    published: true,
  };
}

export function changeEventsToWhatsNewEvents(
  events: readonly ChangeEvent[] | undefined,
): WhatsNewEvent[] {
  return (events ?? [])
    .map(changeEventToWhatsNewEvent)
    .filter((event): event is WhatsNewEvent => Boolean(event));
}

/** @deprecated Prefer importing from `@/lib/graph/content-type`. */
export { contentTypeFromBook } from "@/lib/graph/content-type";

/** Re-export for callers that previously typed against discovery. */
export type { ContentType };

export {
  chapterSlugFromRouteKey,
  chaptersForEdition,
  chaptersFromGraph,
  indexChaptersByEditionId,
  indexPartsByEditionId,
  partsForEdition,
  partsFromGraph,
  publicChaptersForEdition,
} from "@/lib/graph/chapters";
