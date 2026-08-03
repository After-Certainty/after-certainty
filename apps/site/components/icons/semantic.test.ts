import { describe, expect, it } from "vitest";

import {
  bookActionIconForKind,
  patternGlanceIcons,
} from "@/components/icons/semantic";

describe("semantic icons", () => {
  it("maps book action kinds to icons and ignores unknown kinds", () => {
    expect(bookActionIconForKind("read")).toBeTruthy();
    expect(bookActionIconForKind("download")).toBeTruthy();
    expect(bookActionIconForKind("purchase")).toBeTruthy();
    expect(bookActionIconForKind("navigate")).toBeNull();
  });

  it("exposes At-a-glance mappings for Patterns Phase 3", () => {
    expect(patternGlanceIcons.whatItDoes).toBeTruthy();
    expect(patternGlanceIcons.whyItMatters).toBeTruthy();
    expect(patternGlanceIcons.keyRisk).toBeTruthy();
    expect(patternGlanceIcons.counterbalance).toBeTruthy();
  });
});
