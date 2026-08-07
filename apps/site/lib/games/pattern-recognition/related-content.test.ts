import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { challengesFromGraph } from "@/lib/games/pattern-recognition/load";
import { resolveChallengeRelatedContent } from "@/lib/games/pattern-recognition/related-content";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";
import type { ChallengeDefinition } from "@/types/challenges";
import type { PodcastEpisode } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";

const baseChallenge = {
  id: "challenge-demo",
  slug: "demo",
  title: "Demo",
  mode: "recognition" as const,
  status: "published" as const,
  difficulty: "introductory" as const,
  context: "software",
  scenario: "A scenario.",
  dominantPattern: "exceptions-are-forever",
  secondaryPatterns: ["structures-outlive-reasons"],
  distractorPatterns: ["dissent-is-welcomed"],
  explanation: "Because.",
};

const fixtureGraph: SemanticGraph = {
  books: [
    {
      id: "book-authored",
      slug: "authored-book",
      title: "Authored Book",
      status: "published",
    },
    {
      id: "book-pattern-fallback",
      slug: "pattern-fallback-book",
      title: "Pattern Fallback Book",
      status: "published",
    },
    {
      id: "book-draft",
      slug: "draft-book",
      title: "Draft Book",
      status: "draft",
    },
  ],
  glossary: [],
  patterns: [
    {
      id: "pattern-exceptions-are-forever",
      slug: "exceptions-are-forever",
      title: "Exceptions Are Forever",
      summary: "Temporary paths stick.",
      relatedBooks: ["book-pattern-fallback"],
    },
  ],
  situations: [
    {
      id: "situation-temporary-fixes-become-permanent",
      slug: "temporary-fixes-become-permanent",
      title: "Temporary Fixes Become Permanent",
      summary: "Workarounds settle in.",
    },
  ],
  sources: [],
  relationships: [],
  chapters: [
    {
      id: "chapter-authored-one",
      workId: "work-authored",
      editionId: "book-authored",
      title: "Authored Chapter",
      position: 1,
      kind: "chapter",
      sourcePath: "books/authored/ch1.md",
      wordCount: 100,
      estimatedReadingMinutes: 1,
      public: true,
      routeKey: "/explore/books/authored-book/chapters/authored-chapter",
      selectedPatternIds: ["pattern-exceptions-are-forever"],
    },
    {
      id: "chapter-pattern-fallback",
      workId: "work-fallback",
      editionId: "book-pattern-fallback",
      title: "Fallback Chapter",
      position: 1,
      kind: "chapter",
      sourcePath: "books/fallback/ch1.md",
      wordCount: 100,
      estimatedReadingMinutes: 1,
      public: true,
      routeKey: "/explore/books/pattern-fallback-book/chapters/fallback-chapter",
      selectedPatternIds: ["pattern-exceptions-are-forever"],
    },
  ],
};

const podcastEpisodes: PodcastEpisode[] = [
  {
    id: "how-meaning-moves",
    title: "How Meaning Moves",
    description: "Episode",
    publishedAt: "2026-05-09",
    audioUrl: "https://example.com/audio.m4a",
    episodeUrl: "https://example.com/episodes/how-meaning-moves",
  },
];

function resolve(challenge: ChallengeDefinition, graph: SemanticGraph = fixtureGraph) {
  return resolveChallengeRelatedContent(challenge, {
    graph,
    index: buildGraphIndex(graph),
    podcastEpisodes,
  });
}

describe("resolveChallengeRelatedContent", () => {
  it("always resolves the dominant pattern href", () => {
    const related = resolve(baseChallenge);
    expect(related.dominantPatternHref).toBe("/explore/patterns/exceptions-are-forever");
  });

  it("prefers authored related book over pattern fallback", () => {
    const related = resolve({
      ...baseChallenge,
      relatedBooks: ["authored-book"],
    });
    expect(related.relatedBookHref).toBe("/explore/books/authored-book");
    expect(related.relatedBookTitle).toBe("Authored Book");
  });

  it("falls back to a public pattern-related book when override is missing", () => {
    const related = resolve(baseChallenge);
    expect(related.relatedBookHref).toBe("/explore/books/pattern-fallback-book");
    expect(related.relatedBookTitle).toBe("Pattern Fallback Book");
  });

  it("skips draft authored books and uses pattern fallback", () => {
    const related = resolve({
      ...baseChallenge,
      relatedBooks: ["draft-book"],
    });
    expect(related.relatedBookHref).toBe("/explore/books/pattern-fallback-book");
  });

  it("prefers authored chapter ids when resolvable", () => {
    const related = resolve({
      ...baseChallenge,
      relatedChapterIds: ["chapter-authored-one"],
    });
    expect(related.relatedChapterHref).toBe(
      "/explore/books/authored-book/chapters/authored-chapter",
    );
    expect(related.relatedChapterTitle).toBe("Authored Chapter");
  });

  it("falls back to a public chapter associated with the dominant pattern", () => {
    const related = resolve(baseChallenge);
    expect(related.relatedChapterHref).toBe(
      "/explore/books/authored-book/chapters/authored-chapter",
    );
  });

  it("resolves authored podcast episodes and hides missing ones", () => {
    const withPodcast = resolve({
      ...baseChallenge,
      relatedPodcastEpisodeId: "podcast:how-meaning-moves",
    });
    expect(withPodcast.relatedPodcastHref).toBe("https://example.com/episodes/how-meaning-moves");
    expect(withPodcast.relatedPodcastTitle).toBe("How Meaning Moves");
    expect(withPodcast.relatedPodcastExternal).toBe(true);

    const missing = resolve({
      ...baseChallenge,
      relatedPodcastEpisodeId: "podcast:does-not-exist",
    });
    expect(missing.relatedPodcastHref).toBeUndefined();
    expect(missing.relatedPodcastTitle).toBeUndefined();
  });

  it("hides podcast when unset", () => {
    const related = resolve(baseChallenge);
    expect(related.relatedPodcastHref).toBeUndefined();
  });

  it("resolves authored situations and omits unknown ones", () => {
    const related = resolve({
      ...baseChallenge,
      relatedSituation: "temporary-fixes-become-permanent",
    });
    expect(related.relatedSituationHref).toBe(
      "/explore/situations/temporary-fixes-become-permanent",
    );
    expect(related.relatedSituationTitle).toBe("Temporary Fixes Become Permanent");

    const missing = resolve({
      ...baseChallenge,
      relatedSituation: "not-a-real-situation",
    });
    expect(missing.relatedSituationHref).toBeUndefined();
  });
});

const localGraph = tryLoadLocalSemanticManifest();

describe.skipIf(!localGraph)("published challenge corpus links (local manifest)", () => {
  it("resolves unbroken doorway links for every published challenge", () => {
    const graph = localGraph!;
    const index = buildGraphIndex(graph);
    const patternSlugs = new Set(graph.patterns.map((pattern) => pattern.slug));
    const situationSlugs = new Set((graph.situations ?? []).map((situation) => situation.slug));
    const chapterIds = new Set((graph.chapters ?? []).map((chapter) => chapter.id));
    const challenges = challengesFromGraph(graph).filter(
      (challenge) => challenge.status === "published",
    );

    expect(challenges.length).toBeGreaterThanOrEqual(15);

    for (const challenge of challenges) {
      expect(patternSlugs.has(challenge.dominantPattern)).toBe(true);
      for (const patternId of [
        ...challenge.secondaryPatterns,
        ...challenge.distractorPatterns,
      ]) {
        expect(patternSlugs.has(patternId)).toBe(true);
      }

      const related = resolveChallengeRelatedContent(challenge, {
        graph,
        index,
        podcastEpisodes,
      });

      expect(related.dominantPatternHref).toBe(
        `/explore/patterns/${challenge.dominantPattern}`,
      );
      expect(related.relatedBookHref?.startsWith("/explore/books/")).toBe(true);
      expect(related.relatedBookTitle).toBeTruthy();

      if (challenge.relatedSituation) {
        expect(situationSlugs.has(challenge.relatedSituation)).toBe(true);
        expect(related.relatedSituationHref).toBe(
          `/explore/situations/${challenge.relatedSituation}`,
        );
      }

      for (const chapterId of challenge.relatedChapterIds ?? []) {
        expect(chapterIds.has(chapterId)).toBe(true);
      }
      if (challenge.relatedChapterIds?.length) {
        expect(related.relatedChapterHref?.includes("/chapters/")).toBe(true);
      }

      if (challenge.relatedPodcastEpisodeId) {
        expect(related.relatedPodcastHref).toBeTruthy();
        expect(related.relatedPodcastTitle).toBeTruthy();
      } else {
        expect(related.relatedPodcastHref).toBeUndefined();
      }
    }
  });
});
