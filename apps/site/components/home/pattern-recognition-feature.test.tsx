import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: function MockImage({
    alt,
    src,
  }: {
    alt?: string;
    src?: string;
  }) {
    // eslint-disable-next-line @next/next/no-img-element -- test double
    return <img alt={alt ?? ""} src={typeof src === "string" ? src : undefined} />;
  },
}));

import { PatternRecognitionFeature } from "@/components/home/pattern-recognition-feature";
import { gamePaths } from "@/lib/games/paths";

describe("PatternRecognitionFeature", () => {
  it("links the compact card to the Pattern Recognition lobby", () => {
    render(<PatternRecognitionFeature />);

    expect(
      screen.getByRole("heading", { name: /Can you recognize the pattern/i }),
    ).toBeInTheDocument();
    const card = screen.getByTestId("home-pattern-recognition-cta");
    expect(card).toHaveAttribute("href", gamePaths.patternRecognition);
    const images = card.querySelectorAll("img");
    const srcs = [...images].map((img) => img.getAttribute("src"));
    expect(srcs).toContain("/images/home/pattern-recognition-constellation.webp");
    expect(srcs).toContain("/images/home/pattern-recognition-constellation-light.svg");
  });
});
