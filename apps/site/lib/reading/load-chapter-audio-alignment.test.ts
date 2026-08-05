import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { ChapterAudioUnit } from "@/lib/reading/chapter-audio";
import { loadChapterAudioAlignment } from "@/lib/reading/load-chapter-audio-alignment";

const digest = `sha256:${"a".repeat(64)}`;

function unit(overrides: Partial<ChapterAudioUnit> = {}): ChapterAudioUnit {
  return {
    unitId: "chapter-observer-patterns-front-matter-introduction",
    editionSlug: "observer-patterns",
    chapterSlug: "front-matter-introduction",
    routeKey: "/explore/books/observer-patterns/chapters/front-matter-introduction",
    audioUrl: "/generated/audio/observer-patterns/front-matter-introduction.mp3",
    durationSeconds: null,
    alignmentUrl: "/generated/audio/observer-patterns/front-matter-introduction.alignment.json",
    alignmentGranularity: "segment-only",
    generationHash: digest,
    disclosure: "AI-generated narration",
    ...overrides,
  };
}

describe("loadChapterAudioAlignment", () => {
  it("loads alignment from data/chapter-audio (not public/)", () => {
    const root = mkdtempSync(join(tmpdir(), "chapter-audio-align-"));
    const dir = join(root, "data/chapter-audio/observer-patterns");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "front-matter-introduction.alignment.json"),
      JSON.stringify({
        schemaVersion: 1,
        unitId: "chapter-observer-patterns-front-matter-introduction",
        generationHash: digest,
        granularity: "segment-only",
        segments: [{ id: "s0001", text: "Hi.", startMs: 0, endMs: 100 }],
      }),
      "utf8",
    );

    const loaded = loadChapterAudioAlignment(unit(), root);
    expect(loaded?.segments).toHaveLength(1);
    expect(loaded?.generationHash).toBe(digest);
  });

  it("ignores MP3s under public/ and returns null when data/ is missing", () => {
    const root = mkdtempSync(join(tmpdir(), "chapter-audio-align-"));
    const pub = join(root, "public/generated/audio/observer-patterns");
    mkdirSync(pub, { recursive: true });
    writeFileSync(join(pub, "front-matter-introduction.mp3"), "ID3fake");
    writeFileSync(
      join(pub, "front-matter-introduction.alignment.json"),
      JSON.stringify({
        schemaVersion: 1,
        unitId: "x",
        generationHash: digest,
        granularity: "segment-only",
        segments: [{ id: "s0001", text: "Hi.", startMs: 0, endMs: 100 }],
      }),
      "utf8",
    );
    expect(loadChapterAudioAlignment(unit(), root)).toBeNull();
  });
});
