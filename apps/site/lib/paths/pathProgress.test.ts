import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearPathProgress,
  getPathProgress,
  PATH_PROGRESS_STORAGE_KEY,
  recordPathStopVisit,
} from "@/lib/paths/pathProgress";

describe("pathProgress", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("records and reads stop visits", () => {
    recordPathStopVisit({
      ownerType: "trail",
      ownerId: "judgment-before-certainty",
      stopPosition: 2,
      totalStops: 5,
    });

    const progress = getPathProgress("trail", "judgment-before-certainty");
    expect(progress?.lastStopPosition).toBe(2);
    expect(progress?.completed).toBe(false);
    expect(window.localStorage.getItem(PATH_PROGRESS_STORAGE_KEY)).toContain(
      "judgment-before-certainty",
    );
  });

  it("marks completion on final stop", () => {
    recordPathStopVisit({
      ownerType: "question",
      ownerId: "trust-survives-disagreement",
      stopPosition: 4,
      totalStops: 4,
    });

    expect(getPathProgress("question", "trust-survives-disagreement")?.completed).toBe(true);
  });

  it("clears stored progress", () => {
    recordPathStopVisit({
      ownerType: "trail",
      ownerId: "meaning-under-pressure",
      stopPosition: 1,
      totalStops: 6,
    });
    clearPathProgress("trail", "meaning-under-pressure");
    expect(getPathProgress("trail", "meaning-under-pressure")).toBeNull();
  });
});
