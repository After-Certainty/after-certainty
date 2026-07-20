import {
  buildGraphIndex,
  pathOverlapRatio,
  resolveStopEntityId,
  stopEntityIdsFromStops,
  validateStopReference,
  type PathHealthIssue,
} from "@/lib/paths/validateStop";
import type { Book as CatalogBook, PodcastEpisode } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";
import type { QuestionDefinition, QuestionsManifest } from "@/types/questions";

export type QuestionHealthSeverity = "error" | "warning";

export type QuestionHealthIssue = {
  severity: QuestionHealthSeverity;
  code: string;
  questionId?: string;
  detail: string;
};

function mapIssue(issue: PathHealthIssue): QuestionHealthIssue {
  return {
    severity: issue.severity,
    code: issue.code,
    questionId: issue.ownerId,
    detail: issue.detail,
  };
}

export {
  entityTypeLabel,
  normalizeBookEntityId,
  resolveStopEntityId,
} from "@/lib/paths/validateStop";

function stopEntityIds(question: QuestionDefinition): string[] {
  return stopEntityIdsFromStops(question.pathStops);
}

export function collectQuestionHealthIssues(input: {
  manifest: Pick<QuestionsManifest, "questions" | "searchBridges">;
  graph: SemanticGraph;
  catalogBooks: readonly CatalogBook[];
  podcastEpisodes: readonly PodcastEpisode[];
}): QuestionHealthIssue[] {
  const { manifest, graph, catalogBooks, podcastEpisodes } = input;
  const issues: QuestionHealthIssue[] = [];
  const index = buildGraphIndex(graph);

  const ids = new Set<string>();
  const slugs = new Set<string>();
  const questions = new Map<string, QuestionDefinition>();

  for (const question of manifest.questions) {
    if (ids.has(question.id)) {
      issues.push({
        severity: "error",
        code: "duplicate_id",
        questionId: question.id,
        detail: `Duplicate question id "${question.id}"`,
      });
    }
    ids.add(question.id);
    questions.set(question.id, question);

    if (slugs.has(question.slug)) {
      issues.push({
        severity: "error",
        code: "duplicate_slug",
        questionId: question.id,
        detail: `Duplicate slug "${question.slug}"`,
      });
    }
    slugs.add(question.slug);

    if (question.status === "published") {
      if (question.pathStops.length < 3 || question.pathStops.length > 7) {
        issues.push({
          severity: "error",
          code: "invalid_path_length",
          questionId: question.id,
          detail: `Published question must have 3–7 stops (has ${question.pathStops.length})`,
        });
      }
    }

    const pathIssues: PathHealthIssue[] = [];
    validateStopReference(
      {
        position: 0,
        entityType: "book",
        entityId: question.primaryBookId,
        description: "Primary book anchor",
      },
      index,
      graph,
      catalogBooks,
      podcastEpisodes,
      question.id,
      pathIssues,
    );
    issues.push(...pathIssues.map(mapIssue));

    const primaryResolved = resolveStopEntityId({
      entityType: "book",
      entityId: question.primaryBookId,
    });

    const stopIds = stopEntityIds(question);
    if (primaryResolved && !stopIds.includes(primaryResolved)) {
      issues.push({
        severity: "warning",
        code: "primary_book_not_in_path",
        questionId: question.id,
        detail: "primaryBookId is not referenced in pathStops",
      });
    }

    for (const stop of question.pathStops) {
      const stopIssues: PathHealthIssue[] = [];
      validateStopReference(
        stop,
        index,
        graph,
        catalogBooks,
        podcastEpisodes,
        question.id,
        stopIssues,
      );
      issues.push(...stopIssues.map(mapIssue));
    }

    const typeCounts = new Map<string, number>();
    for (const stop of question.pathStops) {
      typeCounts.set(stop.entityType, (typeCounts.get(stop.entityType) ?? 0) + 1);
    }
    const dominant = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (dominant && dominant[1] / question.pathStops.length > 0.8) {
      issues.push({
        severity: "warning",
        code: "path_type_dominance",
        questionId: question.id,
        detail: `Path is dominated by "${dominant[0]}" stops (${dominant[1]}/${question.pathStops.length})`,
      });
    }

    for (const relatedId of question.relatedQuestionIds ?? []) {
      if (!questions.has(relatedId) && !manifest.questions.some((q) => q.id === relatedId)) {
        issues.push({
          severity: "error",
          code: "unknown_related_question",
          questionId: question.id,
          detail: `Related question "${relatedId}" not found in manifest`,
        });
      }
    }
  }

  for (let i = 0; i < manifest.questions.length; i++) {
    for (let j = i + 1; j < manifest.questions.length; j++) {
      const a = manifest.questions[i]!;
      const b = manifest.questions[j]!;
      const overlap = pathOverlapRatio(stopEntityIds(a), stopEntityIds(b));
      if (overlap > 0.6) {
        issues.push({
          severity: "warning",
          code: "path_overlap",
          questionId: a.id,
          detail: `Path overlaps ${Math.round(overlap * 100)}% with "${b.id}"`,
        });
      }
    }
  }

  for (const bridge of manifest.searchBridges ?? []) {
    for (const questionId of bridge.questionIds) {
      if (!manifest.questions.some((q) => q.id === questionId)) {
        issues.push({
          severity: "error",
          code: "unknown_bridge_question",
          questionId,
          detail: `Search bridge references unknown question "${questionId}"`,
        });
      }
    }
  }

  return issues;
}

export function assertQuestionsManifestHealthy(input: {
  manifest: Pick<QuestionsManifest, "questions" | "searchBridges">;
  graph: SemanticGraph;
  catalogBooks: readonly CatalogBook[];
  podcastEpisodes: readonly PodcastEpisode[];
}): void {
  const issues = collectQuestionHealthIssues(input);
  const errors = issues.filter((i) => i.severity === "error");
  if (errors.length > 0) {
    const summary = errors.map((e) => `${e.code}: ${e.detail}`).join("\n");
    throw new Error(`Questions manifest health check failed:\n${summary}`);
  }
}

export function collectQuestionHealthReport(input: {
  manifest: Pick<QuestionsManifest, "questions" | "searchBridges">;
  graph: SemanticGraph;
  catalogBooks: readonly CatalogBook[];
  podcastEpisodes: readonly PodcastEpisode[];
}) {
  const issues = collectQuestionHealthIssues(input);
  return {
    errors: issues.filter((i) => i.severity === "error"),
    warnings: issues.filter((i) => i.severity === "warning"),
  };
}
