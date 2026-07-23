import { describe, expect, it } from "vitest";

import { progressiveNeighborsPerKindForTier } from "@/lib/explore/useObservatoryTier";

describe("progressiveNeighborsPerKindForTier", () => {
  it("scales per-kind expansion with viewport tier", () => {
    expect(progressiveNeighborsPerKindForTier("mobile")).toBe(3);
    expect(progressiveNeighborsPerKindForTier("tablet")).toBe(4);
    expect(progressiveNeighborsPerKindForTier("desktop")).toBe(5);
  });
});
