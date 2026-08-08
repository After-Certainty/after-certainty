import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: function MockImage({ alt }: { alt?: string }) {
    // eslint-disable-next-line @next/next/no-img-element -- test double
    return <img alt={alt ?? ""} />;
  },
}));

import { PatternRecognitionFeature } from "@/components/home/pattern-recognition-feature";
import { gamePaths } from "@/lib/games/paths";

describe("PatternRecognitionFeature", () => {
  it("links to the Pattern Recognition lobby", () => {
    render(<PatternRecognitionFeature />);

    expect(
      screen.getByRole("heading", { name: /Can you recognize the pattern/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("home-pattern-recognition-cta")).toHaveAttribute(
      "href",
      gamePaths.patternRecognition,
    );
  });
});
