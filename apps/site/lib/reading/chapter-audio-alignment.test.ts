import { describe, expect, it } from "vitest";

import {
  findActiveAlignmentSegment,
  parseChapterAudioAlignment,
} from "@/lib/reading/chapter-audio-alignment";

describe("findActiveAlignmentSegment", () => {
  const segments = parseChapterAudioAlignment({
    schemaVersion: 1,
    unitId: "u",
    generationHash: `sha256:${"b".repeat(64)}`,
    granularity: "segment-only",
    segments: [
      { id: "s0001", text: "A", startMs: 0, endMs: 500 },
      { id: "s0002", text: "B", startMs: 500, endMs: 900 },
    ],
  })!.segments;

  it("returns null before the first segment and between gaps after end", () => {
    expect(findActiveAlignmentSegment(segments, -1)).toBeNull();
    expect(findActiveAlignmentSegment(segments, 901)).toBeNull();
  });

  it("includes the end boundary of the last segment", () => {
    expect(findActiveAlignmentSegment(segments, 900)?.id).toBe("s0002");
  });
});
