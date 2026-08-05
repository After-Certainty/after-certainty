import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import {
  canHighlightAlignment,
  findActiveAlignmentSegment,
  parseChapterAudioAlignment,
} from "@/lib/reading/chapter-audio-alignment";
import { renderManuscriptHtml } from "@/lib/reading/render-manuscript-html";
import { resolveMonorepoRoot } from "@/lib/reading/repo-root";

describe("chapter-audio alignment helpers", () => {
  it("parses segment-only alignment and finds the active segment", () => {
    const alignment = parseChapterAudioAlignment({
      schemaVersion: 1,
      unitId: "chapter-observer-patterns-front-matter-introduction",
      generationHash: `sha256:${"a".repeat(64)}`,
      granularity: "segment-only",
      segments: [
        { id: "s0001", text: "One.", startMs: 0, endMs: 1000 },
        { id: "s0002", text: "Two.", startMs: 1000, endMs: 2000 },
      ],
    });
    expect(alignment?.segments).toHaveLength(2);
    expect(canHighlightAlignment(alignment?.granularity)).toBe(true);
    expect(findActiveAlignmentSegment(alignment!.segments, 500)?.id).toBe("s0001");
    expect(findActiveAlignmentSegment(alignment!.segments, 1500)?.id).toBe("s0002");
    expect(canHighlightAlignment("none")).toBe(false);
  });
});

describe("rehype audio segments + shared fixtures", () => {
  it("wraps Observer Patterns intro segments with data-audio-segment ids", async () => {
    const root = resolveMonorepoRoot();
    const md = fs.readFileSync(
      path.join(root, "tests/fixtures/chapter_audio/observer-patterns-introduction.md"),
      "utf8",
    );
    const segments = JSON.parse(
      fs.readFileSync(
        path.join(root, "tests/fixtures/chapter_audio/observer-patterns-introduction.segments.json"),
        "utf8",
      ),
    ) as { id: string; text: string }[];

    const html = await renderManuscriptHtml({
      markdown: md,
      bookDir: "books/observer-patterns",
      audioSegments: segments.map((s) => ({ id: s.id, text: s.text })),
    });

    for (const seg of segments) {
      expect(html).toContain(`data-audio-segment="${seg.id}"`);
      expect(html).toContain(seg.text);
    }
    // Sanitizer must keep the attribute.
    expect(html).toMatch(/data-audio-segment="s0001"/);
  });

  it("still renders footnotes when audio segments are present", async () => {
    const markdown = `Hello world.

A claim.[^n1]

[^n1]: Note body.
`;
    const html = await renderManuscriptHtml({
      markdown,
      bookDir: "books/after-certainty",
      audioSegments: [{ id: "s0001", text: "Hello world." }],
    });
    expect(html).toContain('data-audio-segment="s0001"');
    expect(html).toContain("data-footnote-ref");
    expect(html).toContain("Note body");
  });
});
