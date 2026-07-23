import { type CatalogBookView } from "@/lib/books/catalog-view-model";
import { collectCatalogHealthIssues } from "@/lib/books/validate-catalog";
import { buildPublicCorpusRegistry, type PublicCorpusRegistry } from "@/lib/corpus/public-registry";
import { questionsFromGraph, trailsFromGraph } from "@/lib/graph/discovery";
import { getFeaturedQuestions, getQuestionSearchBridges } from "@/lib/questions/loadQuestions";
import { collectQuestionHealthIssues } from "@/lib/questions/validate";
import { FRONT_SHELF_ENTRIES } from "@/lib/start/front-shelf";
import { getTrailSearchBridges } from "@/lib/trails/loadTrails";
import { collectTrailHealthIssues } from "@/lib/trails/validate";
import type { PodcastEpisode } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";

export type CorpusIntegritySeverity = "error" | "warning";

export type CorpusIntegrityIssue = {
  severity: CorpusIntegritySeverity;
  code: string;
  entityId?: string;
  sourceFeature?: string;
  targetFeature?: string;
  detail: string;
};

export type CorpusIntegrityReport = {
  issues: CorpusIntegrityIssue[];
  errors: CorpusIntegrityIssue[];
  warnings: CorpusIntegrityIssue[];
  registry: PublicCorpusRegistry;
};

export function formatCorpusIssue(issue: CorpusIntegrityIssue): string {
  const bits = [`[${issue.code}]`];
  if (issue.sourceFeature) bits.push(`source=${issue.sourceFeature}`);
  if (issue.targetFeature) bits.push(`target=${issue.targetFeature}`);
  if (issue.entityId) bits.push(`id=${issue.entityId}`);
  bits.push(issue.detail);
  return bits.join(" ");
}

/**
 * Cross-feature integrity checks over the site's interpretation of the manifest.
 * Compares independent public outputs (registry, search, sitemap paths, indexes).
 */
export function collectPublicCorpusIntegrityIssues(
  graph: SemanticGraph,
  options?: { podcastEpisodes?: readonly PodcastEpisode[] },
): CorpusIntegrityReport {
  const issues: CorpusIntegrityIssue[] = [];
  const registry = buildPublicCorpusRegistry(graph);
  const viewModel: readonly CatalogBookView[] = registry.catalogViewModel;
  const podcastEpisodes = options?.podcastEpisodes ?? [];

  for (const issue of collectCatalogHealthIssues({ viewModel, graph })) {
    issues.push({
      severity: issue.severity,
      code: `CATALOG_${issue.code}`.toUpperCase(),
      entityId: issue.bookSlug ?? issue.shelfId,
      sourceFeature: "catalog",
      detail: issue.detail,
    });
  }

  for (const issue of collectQuestionHealthIssues({
    manifest: {
      questions: questionsFromGraph(graph),
      searchBridges: getQuestionSearchBridges(),
    },
    graph,
    podcastEpisodes,
  })) {
    issues.push({
      severity: issue.severity,
      code: `QUESTION_${issue.code}`.toUpperCase(),
      entityId: issue.questionId,
      sourceFeature: "questions",
      detail: issue.detail,
    });
  }

  for (const issue of collectTrailHealthIssues({
    manifest: {
      trails: trailsFromGraph(graph),
      searchBridges: getTrailSearchBridges(),
    },
    graph,
    podcastEpisodes,
  })) {
    issues.push({
      severity: issue.severity,
      code: `TRAIL_${issue.code}`.toUpperCase(),
      entityId: issue.trailId,
      sourceFeature: "trails",
      detail: issue.detail,
    });
  }

  for (const [bookId, catalogType] of registry.catalogContentTypeByBookId) {
    const searchType = registry.searchContentTypeByBookId.get(bookId);
    if (!searchType) {
      issues.push({
        severity: "error",
        code: "SEARCH_BOOK_MISSING",
        entityId: bookId,
        sourceFeature: "catalog",
        targetFeature: "search",
        detail: `Public catalog book "${bookId}" is absent from the search index.`,
      });
      continue;
    }
    if (searchType !== catalogType) {
      issues.push({
        severity: "error",
        code: "CONTENT_TYPE_MISMATCH",
        entityId: bookId,
        sourceFeature: "catalog",
        targetFeature: "search",
        detail: `Book "${bookId}" catalog type=${catalogType} but search type=${searchType}.`,
      });
    }
  }

  const searchIds = registry.searchDocumentIds;
  for (const doc of registry.searchDocuments) {
    if (!doc.canonicalUrl?.trim()) {
      issues.push({
        severity: "error",
        code: "SEARCH_MISSING_URL",
        entityId: doc.id,
        sourceFeature: "search",
        detail: `Search document "${doc.id}" has no canonical URL.`,
      });
      continue;
    }
    if (doc.entityType === "book") {
      const book = registry.byId.get(doc.id);
      if (!book || book.publicStatus !== "public") {
        issues.push({
          severity: "error",
          code: "SEARCH_HIDDEN_BOOK",
          entityId: doc.id,
          sourceFeature: "search",
          targetFeature: "registry",
          detail: `Search indexes book "${doc.id}" that is not a public registry book.`,
        });
      }
    }
  }

  const sitemapSet = new Set(registry.sitemapPaths);
  for (const q of registry.questions) {
    if (!sitemapSet.has(q.canonicalUrl)) {
      issues.push({
        severity: "error",
        code: "SITEMAP_QUESTION_MISSING",
        entityId: q.id,
        sourceFeature: "questions",
        targetFeature: "sitemap",
        detail: `Published question "${q.slug}" missing from sitemap path set.`,
      });
    }
  }
  for (const t of registry.trails) {
    if (!sitemapSet.has(t.canonicalUrl)) {
      issues.push({
        severity: "error",
        code: "SITEMAP_TRAIL_MISSING",
        entityId: t.id,
        sourceFeature: "trails",
        targetFeature: "sitemap",
        detail: `Published trail "${t.slug}" missing from sitemap path set.`,
      });
    }
  }

  // Trails linked from listed books must appear in the public trails collection + sitemap.
  // Walk trail stops once (O(trails × stops)) instead of per-book related-trail scans.
  const listedBookIds = new Set(
    registry.books.filter((b) => b.visibility === "listed").map((b) => b.id),
  );
  const trailIdsBySlug = new Map(registry.trails.map((t) => [t.slug, t.id]));
  for (const trail of trailsFromGraph(graph)) {
    if (trail.status !== "published") continue;
    const referencesListedBook = trail.pathStops.some(
      (stop) => stop.entityType === "book" && stop.entityId && listedBookIds.has(stop.entityId),
    );
    if (!referencesListedBook) continue;

    if (!trailIdsBySlug.has(trail.slug)) {
      issues.push({
        severity: "error",
        code: "TRAIL_INDEX_MISSING",
        entityId: trail.id,
        sourceFeature: "book",
        targetFeature: "trails",
        detail: `Trail "${trail.slug}" references a public book but is absent from the public trails index.`,
      });
    }
    if (!sitemapSet.has(`/trails/${trail.slug}`)) {
      issues.push({
        severity: "error",
        code: "TRAIL_SITEMAP_MISSING",
        entityId: trail.id,
        sourceFeature: "book",
        targetFeature: "sitemap",
        detail: `Trail "${trail.slug}" linked from a public book is missing from sitemap paths.`,
      });
    }
  }

  const publishedQuestionIds = new Set(registry.questions.map((q) => q.id));
  for (const featured of getFeaturedQuestions(10, graph)) {
    if (!publishedQuestionIds.has(featured.id)) {
      issues.push({
        severity: "error",
        code: "FEATURED_QUESTION_MISSING",
        entityId: featured.id,
        sourceFeature: "homepage",
        targetFeature: "questions",
        detail: `Featured question "${featured.slug}" is absent from the public questions collection.`,
      });
    }
  }

  const publicBookSlugs = new Set(
    registry.books.filter((b) => b.visibility === "listed").map((b) => b.slug),
  );
  for (const entry of FRONT_SHELF_ENTRIES) {
    if (!publicBookSlugs.has(entry.slug)) {
      issues.push({
        severity: "error",
        code: "FRONT_SHELF_BOOK_MISSING",
        entityId: entry.slug,
        sourceFeature: "start",
        targetFeature: "catalog",
        detail: `Front shelf entry "${entry.slug}" does not resolve to a public canonical book.`,
      });
    }
  }

  for (const [shelfId, memberIds] of registry.shelfMemberBookIds) {
    const seen = new Set<string>();
    for (const bookId of memberIds) {
      if (seen.has(bookId)) {
        issues.push({
          severity: "error",
          code: "SHELF_DUPLICATE_MEMBER",
          entityId: shelfId,
          sourceFeature: "shelves",
          detail: `Shelf "${shelfId}" contains duplicate member "${bookId}".`,
        });
      }
      seen.add(bookId);
      const book = registry.byId.get(bookId);
      if (!book || book.visibility !== "listed") {
        issues.push({
          severity: "error",
          code: "SHELF_MEMBER_NOT_PUBLIC",
          entityId: bookId,
          sourceFeature: "shelves",
          targetFeature: "catalog",
          detail: `Shelf "${shelfId}" references non-public or missing book "${bookId}".`,
        });
      }
    }
  }

  for (const book of registry.books) {
    if (book.publicStatus === "hidden") {
      if (book.searchEligible || searchIds.has(book.id)) {
        issues.push({
          severity: "error",
          code: "HIDDEN_IN_SEARCH",
          entityId: book.id,
          sourceFeature: "registry",
          targetFeature: "search",
          detail: `Hidden book "${book.slug}" must not be search-eligible.`,
        });
      }
      if (book.sitemapEligible) {
        issues.push({
          severity: "error",
          code: "HIDDEN_IN_SITEMAP",
          entityId: book.id,
          sourceFeature: "registry",
          targetFeature: "sitemap",
          detail: `Hidden book "${book.slug}" must not be sitemap-eligible.`,
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  return { issues, errors, warnings, registry };
}

export function assertPublicCorpusHealthy(
  graph: SemanticGraph,
  options?: { podcastEpisodes?: readonly PodcastEpisode[] },
): CorpusIntegrityReport {
  const report = collectPublicCorpusIntegrityIssues(graph, options);
  if (report.errors.length > 0) {
    throw new Error(
      `Public corpus integrity failed:\n${report.errors.map(formatCorpusIssue).join("\n")}`,
    );
  }
  return report;
}
