import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  RESIZE_FIT_DEBOUNCE_MS,
  createDebouncedFitScheduler,
  shouldTriggerCanvasLayoutFit,
} from "@/lib/explore/fitViewOnCanvasLayout";

describe("shouldTriggerCanvasLayoutFit", () => {
  it("returns false when there are no nodes", () => {
    expect(
      shouldTriggerCanvasLayoutFit(
        { layoutKey: null, nodeCount: 0 },
        { layoutKey: "true-true", nodeCount: 0 },
      ),
    ).toBe(false);
  });

  it("triggers on first layout key (e.g. pane open after mount)", () => {
    expect(
      shouldTriggerCanvasLayoutFit(
        { layoutKey: null, nodeCount: 3 },
        { layoutKey: "true-true", nodeCount: 3 },
      ),
    ).toBe(true);
  });

  it("triggers when side panes change", () => {
    expect(
      shouldTriggerCanvasLayoutFit(
        { layoutKey: "false-false", nodeCount: 5 },
        { layoutKey: "true-true", nodeCount: 5 },
      ),
    ).toBe(true);
  });

  it("triggers when nodes first arrive", () => {
    expect(
      shouldTriggerCanvasLayoutFit(
        { layoutKey: "true-true", nodeCount: 0 },
        { layoutKey: "true-true", nodeCount: 4 },
      ),
    ).toBe(true);
  });

  it("does not trigger when only node count grows", () => {
    expect(
      shouldTriggerCanvasLayoutFit(
        { layoutKey: "true-true", nodeCount: 4 },
        { layoutKey: "true-true", nodeCount: 8 },
      ),
    ).toBe(false);
  });
});

describe("createDebouncedFitScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces rapid resize callbacks into one fit", () => {
    const fit = vi.fn();
    const { schedule } = createDebouncedFitScheduler(fit, RESIZE_FIT_DEBOUNCE_MS);

    schedule();
    schedule();
    schedule();

    expect(fit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(RESIZE_FIT_DEBOUNCE_MS - 1);
    expect(fit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fit).toHaveBeenCalledTimes(1);
  });

  it("cancel clears a pending fit", () => {
    const fit = vi.fn();
    const { schedule, cancel } = createDebouncedFitScheduler(fit, RESIZE_FIT_DEBOUNCE_MS);

    schedule();
    cancel();
    vi.advanceTimersByTime(RESIZE_FIT_DEBOUNCE_MS);

    expect(fit).not.toHaveBeenCalled();
  });
});
