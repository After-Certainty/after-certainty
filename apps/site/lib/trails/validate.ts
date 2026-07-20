import {
  buildGraphIndex,
  pathOverlapRatio,
  resolveStopEntityId,
  stopEntityIdsFromStops,
  validateStopReference,
  type PathHealthIssue,
} from "@/lib/paths/validateStop";
import { getAllQuestions } from "@/lib/questions/loadQuestions";
import type { Book as CatalogBook, PodcastEpisode } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";
import type { TrailDefinition, TrailsManifest } from "@/types/trails";

export type TrailHealthSeverity = "error" | "warning";

export type TrailHealthIssue = {
  severity: TrailHealthSeverity;
  code: string;
  trailId?: string;
  detail: string;
};

function mapIssue(issue: PathHealthIssue): TrailHealthIssue {
  return {
    severity: issue.severity,
    code: issue.code,
    trailId: issue.ownerId,
    detail: issue.detail,
  };
}

function stopEntityIds(trail: TrailDefinition): string[] {
  return stopEntityIdsFromStops(trail.pathStops);
}

export function collectTrailHealthIssues(input: {
  manifest: Pick<TrailsManifest, "trails" | "searchBridges">;
  graph: SemanticGraph;
  catalogBooks: readonly CatalogBook[];
  podcastEpisodes: readonly PodcastEpisode[];
}): TrailHealthIssue[] {
  const { manifest, graph, catalogBooks, podcastEpisodes } = input;
  const issues: TrailHealthIssue[] = [];
  const index = buildGraphIndex(graph);

  const ids = new Set<string>();
  const slugs = new Set<string>();
  const trails = new Map<string, TrailDefinition>();

  for (const trail of manifest.trails) {
    if (ids.has(trail.id)) {
      issues.push({
        severity: "error",
        code: "duplicate_id",
        trailId: trail.id,
        detail: `Duplicate trail id "${trail.id}"`,
      });
    }
    ids.add(trail.id);
    trails.set(trail.id, trail);

    if (slugs.has(trail.slug)) {
      issues.push({
        severity: "error",
        code: "duplicate_slug",
        trailId: trail.id,
        detail: `Duplicate slug "${trail.slug}"`,
      });
    }
    slugs.add(trail.slug);

    const allowUnpublishedBooks = trail.status === "upcoming";

    if (trail.status === "published") {
      if (trail.pathStops.length < 3) {
        issues.push({
          severity: "error",
          code: "empty_trail",
          trailId: trail.id,
          detail: "Published trail must have at least 3 stops",
        });
      }
      if (trail.pathStops.length > 12) {
        issues.push({
          severity: "error",
          code: "trail_too_long",
          trailId: trail.id,
          detail: `Published trail exceeds 12 stops (has ${trail.pathStops.length})`,
        });
      }
    }

    if (trail.status === "published" && trail.pathStops.length > 8) {
      issues.push({
        severity: "warning",
        code: "trail_length_warning",
        trailId: trail.id,
        detail: `Trail has ${trail.pathStops.length} stops; consider shortening for readability`,
      });
    }

    if (trail.primaryBookId) {
      const primaryIssues: PathHealthIssue[] = [];
      validateStopReference(
        {
          position: 0,
          entityType: "book",
          entityId: trail.primaryBookId,
          description: "Primary book anchor",
        },
        index,
        graph,
        catalogBooks,
        podcastEpisodes,
        trail.id,
        primaryIssues,
        { allowUnpublishedBooks },
      );
      issues.push(...primaryIssues.map(mapIssue));

      const primaryResolved = resolveStopEntityId({
        entityType: "book",
        entityId: trail.primaryBookId,
      });
      const stopIds = stopEntityIds(trail);
      if (primaryResolved && !stopIds.includes(primaryResolved)) {
        issues.push({
          severity: "warning",
          code: "primary_book_not_in_path",
          trailId: trail.id,
          detail: "primaryBookId is not referenced in pathStops",
        });
      }
    }

    for (const stop of trail.pathStops) {
      const stopIssues: PathHealthIssue[] = [];
      validateStopReference(
        stop,
        index,
        graph,
        catalogBooks,
        podcastEpisodes,
        trail.id,
        stopIssues,
        { allowUnpublishedBooks },
      );
      issues.push(...stopIssues.map(mapIssue));

      if (trail.status === "published" && stop.position > 1 && !stop.whyThisFollows) {
        issues.push({
          severity: "error",
          code: "missing_why_this_follows",
          trailId: trail.id,
          detail: `Stop ${stop.position} missing whyThisFollows`,
        });
      }
    }

    const typeCounts = new Map<string, number>();
    for (const stop of trail.pathStops) {
      typeCounts.set(stop.entityType, (typeCounts.get(stop.entityType) ?? 0) + 1);
    }
    const dominant = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (dominant && dominant[1] / trail.pathStops.length > 0.8) {
      issues.push({
        severity: "warning",
        code: "path_type_dominance",
        trailId: trail.id,
        detail: `Path is dominated by "${dominant[0]}" stops (${dominant[1]}/${trail.pathStops.length})`,
      });
    }

    for (const relatedId of trail.relatedTrailIds ?? []) {
      if (relatedId === trail.id) {
        issues.push({
          severity: "error",
          code: "self_referential_related",
          trailId: trail.id,
          detail: "Trail cannot reference itself in relatedTrailIds",
        });
      } else if (!trails.has(relatedId) && !manifest.trails.some((t) => t.id === relatedId)) {
        issues.push({
          severity: "error",
          code: "unknown_related_trail",
          trailId: trail.id,
          detail: `Related trail "${relatedId}" not found in manifest`,
        });
      }
    }
  }

  for (let i = 0; i < manifest.trails.length; i++) {
    for (let j = i + 1; j < manifest.trails.length; j++) {
      const a = manifest.trails[i]!;
      const b = manifest.trails[j]!;
      const overlap = pathOverlapRatio(stopEntityIds(a), stopEntityIds(b));
      if (overlap > 0.6) {
        issues.push({
          severity: "warning",
          code: "path_overlap",
          trailId: a.id,
          detail: `Path overlaps ${Math.round(overlap * 100)}% with trail "${b.id}"`,
        });
      }
    }
  }

  const questionStops = getAllQuestions()
    .filter((q) => q.status === "published")
    .map((q) => ({ id: q.id, stops: stopEntityIdsFromStops(q.pathStops) }));

  for (const trail of manifest.trails) {
    if (trail.status !== "published") continue;
    const trailStopIds = stopEntityIds(trail);
    for (const question of questionStops) {
      const overlap = pathOverlapRatio(trailStopIds, question.stops);
      if (overlap > 0.6) {
        issues.push({
          severity: "warning",
          code: "question_path_overlap",
          trailId: trail.id,
          detail: `Path overlaps ${Math.round(overlap * 100)}% with question "${question.id}"`,
        });
      }
    }
  }

  for (const bridge of manifest.searchBridges ?? []) {
    for (const trailId of bridge.trailIds) {
      if (!manifest.trails.some((t) => t.id === trailId)) {
        issues.push({
          severity: "error",
          code: "unknown_bridge_trail",
          trailId,
          detail: `Search bridge references unknown trail "${trailId}"`,
        });
      }
    }
  }

  return issues;
}

export function assertTrailsManifestHealthy(input: {
  manifest: Pick<TrailsManifest, "trails" | "searchBridges">;
  graph: SemanticGraph;
  catalogBooks: readonly CatalogBook[];
  podcastEpisodes: readonly PodcastEpisode[];
}): void {
  const issues = collectTrailHealthIssues(input);
  const errors = issues.filter((i) => i.severity === "error");
  if (errors.length > 0) {
    const summary = errors.map((e) => `${e.code}: ${e.detail}`).join("\n");
    throw new Error(`Trails manifest health check failed:\n${summary}`);
  }
}

export function collectTrailHealthReport(input: {
  manifest: Pick<TrailsManifest, "trails" | "searchBridges">;
  graph: SemanticGraph;
  catalogBooks: readonly CatalogBook[];
  podcastEpisodes: readonly PodcastEpisode[];
}) {
  const issues = collectTrailHealthIssues(input);
  return {
    errors: issues.filter((i) => i.severity === "error"),
    warnings: issues.filter((i) => i.severity === "warning"),
  };
}
