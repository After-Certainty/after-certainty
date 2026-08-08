import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const useReducedMotion = vi.fn(() => false);

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const MOTION_KEYS = new Set(["initial", "animate", "transition", "exit", "style"]);

  function stripMotionProps(props: Record<string, unknown>) {
    const rest: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (!MOTION_KEYS.has(key)) rest[key] = value;
    }
    return rest;
  }

  return {
    motion: {
      div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
        React.createElement("div", stripMotionProps(props), children),
      svg: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
        React.createElement("svg", stripMotionProps(props), children),
      circle: (props: Record<string, unknown>) =>
        React.createElement("circle", stripMotionProps(props)),
      path: (props: Record<string, unknown>) =>
        React.createElement("path", stripMotionProps(props)),
    },
    useReducedMotion: () => useReducedMotion(),
  };
});

vi.mock("@/lib/games/pattern-recognition/analytics", () => ({
  trackSessionDelightShown: vi.fn(),
}));

import { trackSessionDelightShown } from "@/lib/games/pattern-recognition/analytics";

import { SessionCompleteDelight } from "./session-complete-delight";

describe("SessionCompleteDelight", () => {
  beforeEach(() => {
    useReducedMotion.mockReturnValue(false);
    vi.mocked(trackSessionDelightShown).mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a non-interactive decorative constellation overlay", () => {
    render(
      <SessionCompleteDelight mode="daily" patternIds={["alpha", "beta", "gamma"]} />,
    );

    const overlay = screen.getByTestId("session-complete-delight");
    expect(overlay).toHaveAttribute("aria-hidden", "true");
    expect(overlay).toHaveAttribute("role", "presentation");
    expect(overlay).toHaveAttribute("data-variant", "pattern-constellation");
    expect(overlay.className).toContain("pointer-events-none");
    expect(trackSessionDelightShown).toHaveBeenCalledWith({
      variantId: "pattern-constellation",
      mode: "daily",
    });
  });

  it("uses a reduced-motion path without long-lived motion markup requirements", () => {
    useReducedMotion.mockReturnValue(true);
    render(<SessionCompleteDelight mode="practice" patternIds={["alpha"]} />);

    const overlay = screen.getByTestId("session-complete-delight");
    expect(overlay).toHaveAttribute("data-reduced-motion", "true");
    expect(overlay.querySelectorAll("circle").length).toBeGreaterThan(0);
  });

  it("self-cleans after the delight duration", () => {
    const { queryByTestId } = render(
      <SessionCompleteDelight mode="daily" patternIds={["alpha", "beta"]} />,
    );
    expect(queryByTestId("session-complete-delight")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(queryByTestId("session-complete-delight")).toBeNull();
  });
});
