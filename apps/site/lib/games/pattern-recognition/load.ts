import { loadInstalledSemanticGraphSync } from "@/lib/graph/manifest/installed-sync";
import type { ChallengeDefinition } from "@/types/challenges";
import type { ManifestChallenge, SemanticGraph } from "@/types/semanticGraph";

export function challengeFromManifest(challenge: ManifestChallenge): ChallengeDefinition {
  return {
    id: challenge.id,
    slug: challenge.slug,
    title: challenge.title,
    mode: challenge.mode,
    status: challenge.status,
    difficulty: challenge.difficulty,
    context: challenge.context,
    scenario: challenge.scenario,
    dominantPattern: challenge.dominantPattern,
    secondaryPatterns: challenge.secondaryPatterns ?? [],
    distractorPatterns: challenge.distractorPatterns ?? [],
    explanation: challenge.explanation,
    choiceFeedback: challenge.choiceFeedback,
    insightXp: challenge.insightXp,
    relatedBooks: challenge.relatedBooks,
    relatedChapterIds: challenge.relatedChapterIds,
    relatedPodcastEpisodeId: challenge.relatedPodcastEpisodeId,
    relatedSituation: challenge.relatedSituation,
    tags: challenge.tags,
    provenance: challenge.provenance,
  };
}

export function challengesFromGraph(graph: SemanticGraph): ChallengeDefinition[] {
  return (graph.challenges ?? []).map(challengeFromManifest);
}

export function getAllChallenges(graph?: SemanticGraph): ChallengeDefinition[] {
  return challengesFromGraph(graph ?? loadInstalledSemanticGraphSync());
}

export function getPublishedChallenges(graph?: SemanticGraph): ChallengeDefinition[] {
  return getAllChallenges(graph).filter((c) => c.status === "published");
}

export function getChallengeBySlug(
  slug: string,
  graph?: SemanticGraph,
): ChallengeDefinition | undefined {
  return getAllChallenges(graph).find((c) => c.slug === slug);
}

export function getPublishedChallengeBySlug(
  slug: string,
  graph?: SemanticGraph,
): ChallengeDefinition | undefined {
  const challenge = getChallengeBySlug(slug, graph);
  if (!challenge || challenge.status !== "published") return undefined;
  return challenge;
}
