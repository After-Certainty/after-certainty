import { describe, expect, it } from "vitest";

import { computeScrollProgress, formatScrollPercent } from "@/lib/reading/scroll-progress";

describe("computeScrollProgress", () => {
  it("returns 0 at or above the start of long content", () => {
    expect(
      computeScrollProgress({
        scrollY: 0,
        viewportHeight: 800,
        contentOffsetTop: 200,
        contentHeight: 4000,
      }),
    ).toBe(0);
  });

  it("returns 1 when scrolled past the end of long content", () => {
    expect(
      computeScrollProgress({
        scrollY: 5000,
        viewportHeight: 800,
        contentOffsetTop: 200,
        contentHeight: 4000,
      }),
    ).toBe(1);
  });

  it("interpolates mid-chapter progress", () => {
    const progress = computeScrollProgress({
      scrollY: 200 + (4000 - 800) / 2,
      viewportHeight: 800,
      contentOffsetTop: 200,
      contentHeight: 4000,
    });
    expect(progress).toBeCloseTo(0.5, 5);
  });

  it("treats short content as complete once visible", () => {
    expect(
      computeScrollProgress({
        scrollY: 0,
        viewportHeight: 900,
        contentOffsetTop: 100,
        contentHeight: 400,
      }),
    ).toBe(1);
  });

  it("returns 0 for invalid measurements", () => {
    expect(
      computeScrollProgress({
        scrollY: 10,
        viewportHeight: 0,
        contentOffsetTop: 0,
        contentHeight: 100,
      }),
    ).toBe(0);
  });
});

describe("formatScrollPercent", () => {
  it("rounds and clamps", () => {
    expect(formatScrollPercent(0.504)).toBe(50);
    expect(formatScrollPercent(-1)).toBe(0);
    expect(formatScrollPercent(2)).toBe(100);
  });
});
