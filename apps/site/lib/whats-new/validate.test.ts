import { describe, expect, it } from "vitest";

import podcastFallback from "@/data/podcast-episodes.json";
import semanticManifest from "@/data/semantic-manifest.json";
import siteWhatsNewJson from "@/data/site-whats-new.json";
import { changeEventsToWhatsNewEvents } from "@/lib/graph/discovery";
import { validateSemanticGraph } from "@/lib/graph/manifest";
import { buildPodcastWhatsNewCandidates } from "@/lib/whats-new/candidates";
import { getAuthoredWhatsNewEvents, getSiteWhatsNewManifest } from "@/lib/whats-new/loadWhatsNew";
import { buildPublicWhatsNewEvents } from "@/lib/whats-new/publicEvents";
import { parseWhatsNewManifest } from "@/lib/whats-new/schema";
import {
  assertWhatsNewHealthy,
  collectWhatsNewHealthIssues,
  isTechnicalOnlyChange,
} from "@/lib/whats-new/validate";
import type { PodcastEpisode } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";

const validated = validateSemanticGraph(semanticManifest as unknown);
if (!validated.success) {
  throw new Error("Bundled semantic-manifest.json failed validation in whats-new tests");
}
const graph = validated.data;
const podcastEpisodes = (podcastFallback as { episodes: PodcastEpisode[] }).episodes;

function mergedAuthoredManifest() {
  const site = parseWhatsNewManifest(siteWhatsNewJson);
  return {
    ...site,
    events: [...changeEventsToWhatsNewEvents(graph.changeEvents), ...site.events],
  };
}

describe("whats-new health", () => {
  it("accepts the merged corpus + site seed against graph and podcast data", () => {
    assertWhatsNewHealthy({
      manifest: mergedAuthoredManifest(),
      graph,
      podcastEpisodes,
    });
  });

  it("exposes only published public authored events by default", () => {
    const events = buildPublicWhatsNewEvents({
      podcastEpisodes,
      changeEvents: graph.changeEvents,
    });
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.published && e.visibility === "public")).toBe(true);
    expect(events.every((e) => e.source === "authored")).toBe(true);
    // Reverse chronological
    for (let i = 1; i < events.length; i += 1) {
      expect(events[i - 1]!.date >= events[i]!.date).toBe(true);
    }
  });

  it("does not auto-publish podcast candidates when an authored episode exists", () => {
    const authored = mergedAuthoredManifest().events;
    const candidates = buildPodcastWhatsNewCandidates(podcastEpisodes, authored);
    expect(candidates).toHaveLength(0);
  });

  it("builds unpublished podcast candidates for uncovered episodes", () => {
    const candidates = buildPodcastWhatsNewCandidates(
      [
        {
          id: "new-episode",
          title: "New Episode",
          description: "A new conversation.",
          publishedAt: "2026-07-20",
          audioUrl: "https://example.com/a.mp3",
          episodeUrl: "https://example.com/ep",
          duration: "10 min",
        },
      ],
      getAuthoredWhatsNewEvents(),
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.published).toBe(false);
    expect(candidates[0]?.source).toBe("generated_candidate");
    expect(candidates[0]?.type).toBe("podcast_episode");
  });

  it("fails when a public event references a draft book", () => {
    const manifest = parseWhatsNewManifest({
      manifestVersion: 1,
      events: [
        {
          id: "event-draft-book",
          type: "book_published",
          title: "Draft",
          summary: "Should not be public",
          date: "2026-07-01",
          entityType: "book",
          entityId: "book-after-certainty",
          href: "/explore/books/after-certainty",
          visibility: "public",
          source: "authored",
          published: true,
        },
      ],
    });
    const draftGraph: SemanticGraph = {
      ...graph,
      books: graph.books.map((b) =>
        b.id === "book-after-certainty" ? { ...b, status: "draft" as const } : b,
      ),
    };
    const errors = collectWhatsNewHealthIssues({
      manifest,
      graph: draftGraph,
      podcastEpisodes,
    }).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.code === "draft_book_exposed")).toBe(true);
  });

  it("classifies technical-only changes for exclusion policy", () => {
    expect(isTechnicalOnlyChange("Bump dependency and refresh lockfile")).toBe(true);
    expect(isTechnicalOnlyChange("Manifest rebuild generatedAt only")).toBe(true);
    expect(isTechnicalOnlyChange("Substantial revision of chapter three")).toBe(false);
  });

  it("loads site-owned events via the loader", () => {
    expect(getSiteWhatsNewManifest().events.length).toBe(getAuthoredWhatsNewEvents().length);
    expect(getAuthoredWhatsNewEvents().every((e) => e.type !== "book_published")).toBe(true);
  });
});
