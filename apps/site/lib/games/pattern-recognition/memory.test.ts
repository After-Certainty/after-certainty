import { describe, expect, it } from "vitest";

import { applyAttemptToPatternMemory, formatContextLabel } from "./memory";

describe("pattern memory", () => {
  it("tracks encounters, dominant recognitions, and contexts", () => {
    let store = applyAttemptToPatternMemory(
      {},
      {
        dominantPatternId: "exceptions-are-forever",
        secondaryPatternIds: ["structures-outlive-reasons"],
        selectedPatternId: "exceptions-are-forever",
        outcome: "dominant",
        context: "software",
      },
    );
    store = applyAttemptToPatternMemory(store, {
      dominantPatternId: "exceptions-are-forever",
      secondaryPatternIds: ["learning-collapses"],
      selectedPatternId: "learning-collapses",
      outcome: "secondary",
      context: "government",
    });

    const memory = store["exceptions-are-forever"];
    expect(memory?.encountered).toBe(2);
    expect(memory?.recognizedDominant).toBe(1);
    expect(memory?.contexts).toEqual(["government", "software"]);
    expect(store["learning-collapses"]?.recognizedSecondary).toBe(1);
  });

  it("formats context labels for display", () => {
    expect(formatContextLabel("ai_systems")).toBe("Ai Systems");
    expect(formatContextLabel("software")).toBe("Software");
  });
});
