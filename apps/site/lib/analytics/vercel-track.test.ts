import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const track = vi.fn();
vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => track(...args),
}));

import { ensureVercelAnalyticsQueue, trackVercelEvent } from "@/lib/analytics/vercel-track";

describe("vercel-track queue stub", () => {
  beforeEach(() => {
    track.mockClear();
    // Simulate first paint before <Analytics /> injects.
    delete (window as Window & { va?: unknown }).va;
    delete (window as Window & { vaq?: unknown }).vaq;
  });

  afterEach(() => {
    delete (window as Window & { va?: unknown }).va;
    delete (window as Window & { vaq?: unknown }).vaq;
  });

  it("installs window.va so track() is not a silent no-op before Analytics mounts", () => {
    expect((window as Window & { va?: unknown }).va).toBeUndefined();
    ensureVercelAnalyticsQueue();
    expect(typeof (window as Window & { va?: unknown }).va).toBe("function");
    (window as Window & { va: (...args: unknown[]) => void }).va("event", {
      name: "reading_path_started",
    });
    expect((window as Window & { vaq?: unknown[] }).vaq).toEqual([
      ["event", { name: "reading_path_started" }],
    ]);
  });

  it("trackVercelEvent ensures the queue then calls track", () => {
    trackVercelEvent("reading_path_started", { path_kind: "question", path_id: "q-1" });
    expect(typeof (window as Window & { va?: unknown }).va).toBe("function");
    expect(track).toHaveBeenCalledWith("reading_path_started", {
      path_kind: "question",
      path_id: "q-1",
    });
  });

  it("does not replace an existing window.va", () => {
    const existing = vi.fn();
    (window as Window & { va: (...args: unknown[]) => void }).va = existing;
    ensureVercelAnalyticsQueue();
    expect((window as Window & { va?: unknown }).va).toBe(existing);
  });
});
