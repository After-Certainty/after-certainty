import { describe, expect, it } from "vitest";

import {
  episodeSortKey,
  formatEpisodeDuration,
  mapFeedItemsToEpisodes,
  parseItunesDurationToMinutes,
  type RssItem,
} from "@/lib/podcast/normalize";

describe("parseItunesDurationToMinutes", () => {
  it("parses integer seconds as minutes (rounded)", () => {
    expect(parseItunesDurationToMinutes("120")).toBe(2);
  });

  it("parses MM:SS", () => {
    expect(parseItunesDurationToMinutes("5:30")).toBe(6);
  });

  it("returns undefined for empty input", () => {
    expect(parseItunesDurationToMinutes(undefined)).toBeUndefined();
  });
});

describe("formatEpisodeDuration", () => {
  it("formats under one hour", () => {
    expect(formatEpisodeDuration(42)).toBe("42 min");
  });

  it("formats hours with remainder", () => {
    expect(formatEpisodeDuration(90)).toBe("1h 30m");
  });
});

describe("episodeSortKey", () => {
  it("returns timestamp for valid dates", () => {
    const item = { isoDate: "2024-01-15T12:00:00.000Z" } as RssItem;
    expect(episodeSortKey(item)).toBe(new Date("2024-01-15T12:00:00.000Z").getTime());
  });
});

describe("mapFeedItemsToEpisodes", () => {
  it("dedupes ids when two items share the same title slug", () => {
    const items: RssItem[] = [
      {
        title: "Same Title",
        contentSnippet: "<p>A</p>",
        enclosure: { url: "https://audio/1.mp3" },
        link: "https://episode/1",
      } as RssItem,
      {
        title: "Same Title",
        contentSnippet: "<p>B</p>",
        enclosure: { url: "https://audio/2.mp3" },
        link: "https://episode/2",
      } as RssItem,
    ];

    const episodes = mapFeedItemsToEpisodes(items);
    expect(episodes[0]!.id).toBe("same-title");
    expect(episodes[1]!.id).toBe("same-title-2");
    expect(episodes[0]!.audioUrl).toContain("1.mp3");
    expect(episodes[1]!.audioUrl).toContain("2.mp3");
  });

  it("drops non-http enclosure and link URLs", () => {
    const items: RssItem[] = [
      {
        title: "Hostile",
        contentSnippet: "x",
        enclosure: { url: "javascript:alert(1)" },
        link: "javascript:alert(2)",
      } as RssItem,
    ];
    const episodes = mapFeedItemsToEpisodes(items);
    expect(episodes[0]!.audioUrl).toBe("");
    expect(episodes[0]!.episodeUrl).toBe("");
  });
});
