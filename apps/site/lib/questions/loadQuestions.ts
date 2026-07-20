import questionsManifestJson from "@/data/questions-manifest.json";
import { parseQuestionsManifest, type ParsedQuestionsManifest } from "@/lib/questions/schema";
import type { QuestionDefinition } from "@/types/questions";

let cachedManifest: ParsedQuestionsManifest | null = null;

export function getQuestionsManifest(): ParsedQuestionsManifest {
  if (!cachedManifest) {
    cachedManifest = parseQuestionsManifest(questionsManifestJson);
  }
  return cachedManifest;
}

export function getAllQuestions(): QuestionDefinition[] {
  return getQuestionsManifest().questions;
}

export function getPublishedQuestions(): QuestionDefinition[] {
  return getAllQuestions().filter((q) => q.status === "published");
}

export function getQuestionBySlug(slug: string): QuestionDefinition | undefined {
  return getAllQuestions().find((q) => q.slug === slug);
}

export function getFeaturedQuestions(limit = 4): QuestionDefinition[] {
  return getPublishedQuestions()
    .filter((q) => q.featured)
    .sort((a, b) => (a.featuredRank ?? 999) - (b.featuredRank ?? 999))
    .slice(0, limit);
}

export function getQuestionSearchBridges() {
  return getQuestionsManifest().searchBridges ?? [];
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

export function getQuestionSitemapSlugs(): string[] {
  return getPublishedQuestions().map((q) => q.slug);
}
