import { describe, expect, it } from "vitest";

import {
  findActiveAlignmentSegment,
  parseChapterAudioAlignment,
} from "@/lib/reading/chapter-audio-alignment";

describe("findActiveAlignmentSegment", () => {
  const contiguous = parseChapterAudioAlignment({
    schemaVersion: 1,
    unitId: "u",
    generationHash: `sha256:${"b".repeat(64)}`,
    granularity: "segment-only",
    segments: [
      { id: "s0001", text: "A", startMs: 0, endMs: 500 },
      { id: "s0002", text: "B", startMs: 500, endMs: 900 },
    ],
  })!.segments;

  const withGaps = parseChapterAudioAlignment({
    schemaVersion: 1,
    unitId: "u",
    generationHash: `sha256:${"c".repeat(64)}`,
    granularity: "segment-only",
    segments: [
      { id: "s0001", text: "A", startMs: 0, endMs: 200 },
      { id: "s0002", text: "B", startMs: 280, endMs: 400 },
      { id: "s0003", text: "C", startMs: 450, endMs: 600 },
    ],
  })!.segments;

  it("returns null before the first segment and after the last end", () => {
    expect(findActiveAlignmentSegment(contiguous, -1)).toBeNull();
    expect(findActiveAlignmentSegment(contiguous, 901)).toBeNull();
  });

  it("includes the end boundary of the last segment", () => {
    expect(findActiveAlignmentSegment(contiguous, 900)?.id).toBe("s0002");
  });

  it("keeps the previous segment across gaps between spans", () => {
    expect(findActiveAlignmentSegment(withGaps, 200)?.id).toBe("s0001");
    expect(findActiveAlignmentSegment(withGaps, 250)?.id).toBe("s0001");
    expect(findActiveAlignmentSegment(withGaps, 279)?.id).toBe("s0001");
    expect(findActiveAlignmentSegment(withGaps, 280)?.id).toBe("s0002");
    expect(findActiveAlignmentSegment(withGaps, 420)?.id).toBe("s0002");
    expect(findActiveAlignmentSegment(withGaps, 449)?.id).toBe("s0002");
    expect(findActiveAlignmentSegment(withGaps, 450)?.id).toBe("s0003");
  });

  it("resolves very short spans that timeupdate may skip", () => {
    const tiny = parseChapterAudioAlignment({
      schemaVersion: 1,
      unitId: "u",
      generationHash: `sha256:${"d".repeat(64)}`,
      granularity: "segment-only",
      segments: [
        { id: "s0001", text: "A", startMs: 0, endMs: 40 },
        { id: "s0002", text: "B", startMs: 40, endMs: 80 },
        { id: "s0003", text: "C", startMs: 80, endMs: 120 },
      ],
    })!.segments;
    expect(findActiveAlignmentSegment(tiny, 20)?.id).toBe("s0001");
    expect(findActiveAlignmentSegment(tiny, 55)?.id).toBe("s0002");
    expect(findActiveAlignmentSegment(tiny, 100)?.id).toBe("s0003");
  });
});
