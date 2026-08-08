import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExplorePatternsGameCallout } from "@/components/explore/explore-patterns-game-callout";
import { gamePaths } from "@/lib/games/paths";

describe("ExplorePatternsGameCallout", () => {
  it("links to the Pattern Recognition Challenge lobby", () => {
    render(<ExplorePatternsGameCallout />);

    const link = screen.getByRole("link", { name: /Pattern Recognition Challenge/i });
    expect(link).toHaveAttribute("href", gamePaths.patternRecognition);
    expect(screen.getByTestId("patterns-game-callout")).toBe(link);
  });
});
