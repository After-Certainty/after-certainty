import pathSearchBridgesJson from "@/data/path-search-bridges.json";
import fallbackSemantic from "@/data/semantic-manifest.json";
import { questionsFromGraph } from "@/lib/graph/discovery";
import { validateSemanticGraph } from "@/lib/graph/validate";
import type { ParsedQuestionsManifest } from "@/lib/questions/schema";
import type { QuestionDefinition, QuestionSearchBridge } from "@/types/questions";
import type { SemanticGraph } from "@/types/semanticGraph";

type PathSearchBridgesFile = {
  questionBridges?: QuestionSearchBridge[];
};

function bundledQuestions(): QuestionDefinition[] {
  const result = validateSemanticGraph(fallbackSemantic as unknown);
  if (!result.success) {
    throw new Error("Bundled semantic-manifest.json failed validation for questions");
  }
  return questionsFromGraph(result.data);
}

function siteQuestionBridges(): QuestionSearchBridge[] {
  const data = pathSearchBridgesJson as PathSearchBridgesFile;
  return data.questionBridges ?? [];
}

export function getQuestionsFromGraph(graph: SemanticGraph): QuestionDefinition[] {
  return questionsFromGraph(graph);
}

export function getQuestionsManifest(): ParsedQuestionsManifest {
  return {
    manifestVersion: 1,
    questions: bundledQuestions(),
    searchBridges: siteQuestionBridges(),
  };
}

export function getAllQuestions(graph?: SemanticGraph): QuestionDefinition[] {
  return graph ? questionsFromGraph(graph) : bundledQuestions();
}

export function getPublishedQuestions(graph?: SemanticGraph): QuestionDefinition[] {
  return getAllQuestions(graph).filter((q) => q.status === "published");
}

export function getQuestionBySlug(
  slug: string,
  graph?: SemanticGraph,
): QuestionDefinition | undefined {
  return getAllQuestions(graph).find((q) => q.slug === slug);
}

export function getFeaturedQuestions(limit = 4, graph?: SemanticGraph): QuestionDefinition[] {
  return getPublishedQuestions(graph)
    .filter((q) => q.featured)
    .sort((a, b) => (a.featuredRank ?? 999) - (b.featuredRank ?? 999))
    .slice(0, limit);
}

export function getQuestionSearchBridges() {
  return siteQuestionBridges();
}

/** Group published questions by family label (questions may appear in multiple groups). */
export function groupQuestionsByFamily(
  questions: QuestionDefinition[],
): { family: string; questions: QuestionDefinition[] }[] {
  const familyMap = new Map<string, QuestionDefinition[]>();
  for (const question of questions) {
    for (const family of question.families) {
      const bucket = familyMap.get(family) ?? [];
      bucket.push(question);
      familyMap.set(family, bucket);
    }
  }
  return [...familyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([family, grouped]) => ({ family, questions: grouped }));
}

export function getQuestionSitemapSlugs(graph?: SemanticGraph): string[] {
  return getPublishedQuestions(graph).map((q) => q.slug);
}
