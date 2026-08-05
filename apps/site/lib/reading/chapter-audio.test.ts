import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  getChapterAudioForChapter,
  loadChapterAudioManifest,
  parseChapterAudioManifest,
} from "@/lib/reading/chapter-audio";

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function writeManifest(root: string, units: unknown[]) {
  mkdirSync(join(root, "data"), { recursive: true });
  writeFileSync(
    join(root, "data/local-chapter-audio-manifest.json"),
    JSON.stringify({
      schemaVersion: 1,
      generatedAt: "2026-08-05T00:00:00Z",
      units,
    }),
    "utf8",
  );
}

describe("chapter-audio loader", () => {
  it("returns null when installed manifest is missing", () => {
    const root = mkdtempSync(join(tmpdir(), "chapter-audio-"));
    temps.push(root);
    expect(loadChapterAudioManifest(root)).toBeNull();
    expect(
      getChapterAudioForChapter({
        editionSlug: "observer-patterns",
        chapterSlug: "front-matter-introduction",
        rootDir: root,
      }),
    ).toBeNull();
  });

  it("loads an available unit and ignores invalid entries", () => {
    const root = mkdtempSync(join(tmpdir(), "chapter-audio-"));
    temps.push(root);
    writeManifest(root, [
      { bad: true },
      {
        unitId: "chapter-observer-patterns-front-matter-introduction",
        editionSlug: "observer-patterns",
        chapterSlug: "front-matter-introduction",
        routeKey: "/explore/books/observer-patterns/chapters/front-matter-introduction",
        audioUrl: "/generated/audio/observer-patterns/front-matter-introduction.mp3",
        durationSeconds: 12.7,
        alignmentUrl: "/generated/audio/observer-patterns/front-matter-introduction.alignment.json",
        alignmentGranularity: "segment-only",
        generationHash: `sha256:${"a".repeat(64)}`,
        disclosure: "AI-generated narration",
      },
    ]);
    const unit = getChapterAudioForChapter({
      editionSlug: "observer-patterns",
      chapterSlug: "front-matter-introduction",
      rootDir: root,
    });
    expect(unit?.unitId).toBe("chapter-observer-patterns-front-matter-introduction");
    expect(unit?.audioUrl).toContain("/generated/audio/");
    expect(parseChapterAudioManifest({ schemaVersion: 2, generatedAt: "x", units: [] })).toBeNull();
  });
});
