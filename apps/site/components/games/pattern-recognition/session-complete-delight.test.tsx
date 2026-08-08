import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

  function passthrough(tag: string) {
    function MotionPassthrough({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) {
      return React.createElement(tag, stripMotionProps(props), children);
    }
    MotionPassthrough.displayName = `motion.${tag}`;
    return MotionPassthrough;
  }

  return {
    motion: {
      div: passthrough("div"),
      p: passthrough("p"),
      dl: passthrough("dl"),
      svg: passthrough("svg"),
      g: passthrough("g"),
      circle: passthrough("circle"),
      path: passthrough("path"),
      text: passthrough("text"),
    },
    useReducedMotion: () => useReducedMotion(),
  };
});

vi.mock("@/lib/games/pattern-recognition/analytics", () => ({
  trackSessionDelightShown: vi.fn(),
}));

import { trackSessionDelightShown } from "@/lib/games/pattern-recognition/analytics";

import { SessionCompleteDelight } from "./session-complete-delight";

const samplePatterns = [
  { id: "exceptions-are-forever", title: "Exceptions Are Forever", score: 6, isDominant: true },
  { id: "invisible-work", title: "Invisible Work", score: 2, isDominant: false },
  { id: "legibility", title: "Legibility", score: 2, isDominant: false },
  { id: "boundary-conditions", title: "Boundary Conditions", score: 3, isDominant: true },
  { id: "feedback-delay", title: "Feedback Delay", score: 1, isDominant: false },
];

describe("SessionCompleteDelight", () => {
  beforeEach(() => {
    useReducedMotion.mockReturnValue(false);
    vi.mocked(trackSessionDelightShown).mockClear();
  });

  it("renders sequenced results with a non-blocking constellation and CTAs", () => {
    render(
      <SessionCompleteDelight
        mode="daily"
        patterns={samplePatterns}
        insightXp={125}
        challengeCount={5}
        dominantCount={4}
      >
        <a href="/games/pattern-recognition">Back to lobby</a>
      </SessionCompleteDelight>,
    );

    const root = screen.getByTestId("session-complete-delight");
    expect(root).toHaveAttribute("data-variant", "pattern-constellation");
    expect(screen.getByText("Session complete")).toBeInTheDocument();
    expect(screen.getByTestId("session-insight-xp")).toHaveTextContent("+125 Insight XP");
    expect(screen.getByText("Patterns travel.")).toBeInTheDocument();
    expect(screen.getByTestId("session-complete-stats")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to lobby" })).toBeInTheDocument();
    expect(root.querySelector("[aria-hidden='true']")?.className).toContain("pointer-events-none");
    expect(trackSessionDelightShown).toHaveBeenCalledWith({
      variantId: "pattern-constellation",
      mode: "daily",
    });
  });

  it("renders a stable constellation under reduced motion", () => {
    useReducedMotion.mockReturnValue(true);
    render(
      <SessionCompleteDelight
        mode="practice"
        patterns={samplePatterns}
        insightXp={40}
        challengeCount={5}
        dominantCount={2}
      />,
    );

    const root = screen.getByTestId("session-complete-delight");
    expect(root).toHaveAttribute("data-reduced-motion", "true");
    expect(root.querySelectorAll("circle").length).toBeGreaterThan(0);
    expect(screen.getByText("Patterns travel.")).toBeInTheDocument();
  });

  it("keeps the constellation mounted after the sequence settles", () => {
    render(
      <SessionCompleteDelight
        mode="daily"
        patterns={samplePatterns}
        insightXp={80}
        challengeCount={5}
        dominantCount={3}
      />,
    );
    expect(screen.getByTestId("session-complete-delight")).toBeInTheDocument();
    expect(screen.getByText("Patterns travel.")).toBeInTheDocument();
  });
});
